document.addEventListener('DOMContentLoaded', () => {
    const locationSelect = document.getElementById('bdc-location');
    const yearSelect = document.getElementById('bdc-year');
    const startForm = document.getElementById('start-session-form');
    const errorMessage = document.getElementById('error-message');

    const populateDropdown = (selectElement, items, defaultOptionText) => {
        selectElement.innerHTML = `<option value="">-- Select ${defaultOptionText} --</option>`;
        if (items && items.length > 0) {
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                selectElement.appendChild(option);
            });
        } else {
             selectElement.innerHTML = `<option value="">No ${defaultOptionText}s available</option>`;
        }
    };

    const fetchInitialData = async () => {
        try {
            const [locationsRes, yearsRes] = await Promise.all([
                fetch('/api/locations'),
                fetch('/api/locations/years')
            ]);

            if (!locationsRes.ok || !yearsRes.ok) {
                throw new Error('Failed to fetch initial data.');
            }

            const locationsData = await locationsRes.json();
            const yearsData = await yearsRes.json();
            
            populateDropdown(locationSelect, locationsData.data, 'Location');
            populateDropdown(yearSelect, yearsData.data, 'Year');

        } catch (error) {
            errorMessage.textContent = error.message;
            console.error(error);
        }
    };

    startForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedLocation = locationSelect.value;
        const selectedYear = yearSelect.value;

        if (selectedLocation && selectedYear) {
            sessionStorage.setItem('bdc_location', selectedLocation);
            sessionStorage.setItem('bdc_year', selectedYear);
            window.location.href = '/main.html';
        } else {
            errorMessage.textContent = 'Please select both a location and a year.';
        }
    });

    fetchInitialData();
});
