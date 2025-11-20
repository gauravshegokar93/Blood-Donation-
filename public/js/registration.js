viewInitializers.registration = () => {
    const form = document.getElementById('registration-form');
    const tableBody = document.getElementById('registration-table').querySelector('tbody');
    const agencySelect = document.getElementById('reg-agency');
    const nameInput = document.getElementById('reg-name');
    const bloodGroupSelect = document.getElementById('reg-blood-group');
    const mobileInput = document.getElementById('reg-mobile');
    const regIdInput = document.getElementById('reg-id');

    let registrations = [];
    let sortConfig = { key: 'Id', direction: 'desc' };
    
    const loadBloodBanks = async () => {
        try {
            const response = await fetch(`/api/blood-banks?location=${state.location}&year=${state.year}`);
            const result = await response.json();
            if (result.success) {
                populateSelect(agencySelect, result.data, 'Id', 'Name', 'Select Agency');
            }
        } catch (error) {
            console.error('Failed to load blood banks for registration:', error);
        }
    };
    
    const renderTable = () => {
        // Sort data
        const sortedData = [...registrations].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'Id') {
                aVal = parseInt(aVal, 10);
                bVal = parseInt(bVal, 10);
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        tableBody.innerHTML = '';
        sortedData.forEach(reg => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${reg.Id}</td>
                <td>${reg.Name}</td>
                <td>${reg.BloodGroup}</td>
                <td>${reg.MobileNo}</td>
                <td>${reg.AgencyName}</td>
            `;
        });
        updateSortHeaders();
    };

    const updateSortHeaders = () => {
        document.querySelectorAll('#registration-table thead th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === sortConfig.key) {
                th.classList.add(sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    };

    const loadRegistrations = async () => {
        try {
            const response = await fetch(`/api/registrations?location=${state.location}&year=${state.year}`);
            const result = await response.json();
            if (result.success) {
                registrations = result.data;
                renderTable();
                const latestId = registrations.length > 0 ? Math.max(...registrations.map(r => r.Id)) + 1 : 1;
                regIdInput.value = latestId;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to load registrations:', error);
        }
    };
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (mobileInput.value.length !== 10 || !/^\d+$/.test(mobileInput.value)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        const registrationData = {
            name: nameInput.value,
            bloodGroup: bloodGroupSelect.value,
            mobileNo: mobileInput.value,
            bloodBankId: agencySelect.value,
            location: state.location,
            year: state.year,
        };
        
        try {
            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData),
            });
            const result = await response.json();

            if (result.success) {
                form.reset();
                nameInput.focus();
                // Reload data to reflect changes
                await loadRegistrations();
                await updateGlobalStats('reg-stats-panel');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            alert(`Registration failed: ${error.message}`);
        }
    });

    document.querySelectorAll('#registration-table thead th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (sortConfig.key === key) {
                sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortConfig.key = key;
                sortConfig.direction = 'asc';
            }
            renderTable();
        });
    });

    // Initial setup
    loadBloodBanks();
    loadRegistrations();
    updateGlobalStats('reg-stats-panel');
};
