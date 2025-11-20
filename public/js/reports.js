let chartInstances = {};

function destroyChart(chartId) {
    if (chartInstances[chartId]) {
        chartInstances[chartId].destroy();
        delete chartInstances[chartId];
    }
}

// --- Report: BDC Status - All ---
viewInitializers.reportStatusAll = async () => {
    const tableBody = document.getElementById('report-status-all-table').querySelector('tbody');
    const chartCanvas = document.getElementById('report-status-all-chart');

    try {
        const response = await fetch('/api/reports/status-all');
        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        const data = result.data;
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${item.Location}</td>
                <td>${item.Year}</td>
                <td>${item.Registered}</td>
                <td>${item.Accepted}</td>
                <td>${item.Rejected}</td>
                <td>${item.Donated}</td>
            `;
        });

        // Charting
        const labels = data.map(d => `${d.Location} ${d.Year}`);
        const chartData = {
            labels: labels,
            datasets: [
                { label: 'Accepted', data: data.map(d => d.Accepted), backgroundColor: 'rgba(40, 167, 69, 0.7)' },
                { label: 'Rejected', data: data.map(d => d.Rejected), backgroundColor: 'rgba(220, 53, 69, 0.7)' },
                { label: 'Donated', data: data.map(d => d.Donated), backgroundColor: 'rgba(23, 162, 184, 0.7)' }
            ]
        };

        destroyChart('report-status-all-chart');
        chartInstances['report-status-all-chart'] = new Chart(chartCanvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { title: { display: true, text: 'Donation Status Across All Camps' } }
            }
        });

    } catch (error) {
        console.error('Failed to load all status report:', error);
        tableBody.innerHTML = `<tr><td colspan="6">Error loading report: ${error.message}</td></tr>`;
    }
};

// --- Report: BDC Status - Location-wise ---
viewInitializers.reportStatusLocation = (isDashboard = false) => {
    const locationSelect = document.getElementById(isDashboard ? 'report-location-select' : 'report-location-select'); // Placeholder, real dashboard doesn't have selects
    const yearSelect = document.getElementById(isDashboard ? 'report-year-select' : 'report-year-select');
    
    let reportContainer, statsPanel, pieChartCanvas, banksTableContainer;
    
    if (isDashboard) {
        reportContainer = document.getElementById('dashboard-content');
        statsPanel = document.getElementById('dashboard-stats-panel');
        pieChartCanvas = document.getElementById('dashboard-pie-chart');
        banksTableContainer = document.getElementById('dashboard-banks-table-container');
    } else {
        reportContainer = document.getElementById('report-location-content');
        statsPanel = document.getElementById('report-location-stats-panel');
        pieChartCanvas = document.getElementById('report-location-pie-chart');
        banksTableContainer = document.getElementById('report-location-banks-table-container');
    }

    const fetchDataForReport = async (location, year) => {
        try {
            const response = await fetch(`/api/reports/status-location?location=${location}&year=${year}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            const { stats, banks } = result.data;

            // Render stats
            renderStatsPanel(statsPanel.id, stats);

            // Render blood banks table
            banksTableContainer.innerHTML = '<h3 style="margin-bottom: 1rem;">Stats by Blood Bank</h3>';
            const table = document.createElement('table');
            table.className = 'data-table';
            table.innerHTML = `
                <thead><tr><th>Agency Name</th><th>Quota</th><th>Registered</th><th>Accepted</th></tr></thead>
                <tbody>${banks.map(b => `
                    <tr>
                        <td>${b.Name}</td>
                        <td>${b.QuotaLimit || 'N/A'}</td>
                        <td>${b.Registered}</td>
                        <td>${b.Accepted}</td>
                    </tr>`).join('')}
                </tbody>`;
            banksTableContainer.appendChild(table);

            // Render Pie Chart
            const chartData = {
                labels: ['Accepted', 'Rejected', 'Pending'],
                datasets: [{
                    data: [stats.Accepted, stats.Rejected, stats.Registered - stats.Accepted - stats.Rejected],
                    backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(220, 53, 69, 0.8)', 'rgba(255, 193, 7, 0.8)']
                }]
            };

            const chartId = isDashboard ? 'dashboard-pie-chart' : 'report-location-pie-chart';
            destroyChart(chartId);
            chartInstances[chartId] = new Chart(pieChartCanvas, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: `Status for ${location} (${year})` } }
                }
            });

        } catch (error) {
            console.error('Failed to load location report:', error);
            reportContainer.innerHTML = `<p>Error loading report: ${error.message}</p>`;
        }
    };

    if (isDashboard) {
        fetchDataForReport(state.location, state.year);
    } else {
        // Populate dropdowns for the dedicated report page
        const setupDropdowns = async () => {
            const [locRes, yearRes] = await Promise.all([fetch('/api/locations'), fetch('/api/locations/years')]);
            const locData = await locRes.json();
            const yearData = await yearRes.json();
            populateSelect(locationSelect, locData.data.map(l => ({v:l, t:l})), 'v', 't', 'Location');
            populateSelect(yearSelect, yearData.data.map(y => ({v:y, t:y})), 'v', 't', 'Year');
            
            locationSelect.value = state.location;
            yearSelect.value = state.year;
            
            fetchDataForReport(state.location, state.year);

            locationSelect.addEventListener('change', () => fetchDataForReport(locationSelect.value, yearSelect.value));
            yearSelect.addEventListener('change', () => fetchDataForReport(locationSelect.value, yearSelect.value));
        };
        setupDropdowns();
    }
};

// --- Report: BDC History ---
viewInitializers.reportHistory = async () => {
    const tableBody = document.getElementById('report-history-table').querySelector('tbody');
    const chartCanvas = document.getElementById('report-history-chart');

    try {
        const response = await fetch('/api/reports/history');
        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        const data = result.data;
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${item.Year}</td>
                <td>${item.Location}</td>
                <td>${item.TotalCamps}</td>
                <td>${item.TotalRegistered}</td>
                <td>${item.TotalDonated}</td>
            `;
        });
        
        // Aggregate data for chart: total donated per year
        const yearlyDonations = data.reduce((acc, curr) => {
            acc[curr.Year] = (acc[curr.Year] || 0) + curr.TotalDonated;
            return acc;
        }, {});

        const labels = Object.keys(yearlyDonations).sort();
        const chartData = {
            labels: labels,
            datasets: [{
                label: 'Total Donations Per Year',
                data: labels.map(year => yearlyDonations[year]),
                borderColor: 'var(--primary-color)',
                tension: 0.1,
                fill: false
            }]
        };
        
        destroyChart('report-history-chart');
        chartInstances['report-history-chart'] = new Chart(chartCanvas, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { title: { display: true, text: 'Donation History Over Years' } }
            }
        });

    } catch (error) {
        console.error('Failed to load history report:', error);
        tableBody.innerHTML = `<tr><td colspan="5">Error loading report: ${error.message}</td></tr>`;
    }
};
