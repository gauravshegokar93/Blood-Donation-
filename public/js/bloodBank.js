viewInitializers.bloodBank = () => {
    const form = document.getElementById('blood-bank-form');
    const tableBody = document.getElementById('blood-bank-table').querySelector('tbody');
    const newBtn = document.getElementById('bb-new-btn');
    const editBtn = document.getElementById('bb-edit-btn');
    const deleteBtn = document.getElementById('bb-delete-btn');
    const saveBtn = document.getElementById('bb-save-btn');
    const cancelBtn = document.getElementById('bb-cancel-btn');
    
    const idInput = document.getElementById('bb-id');
    const nameInput = document.getElementById('bb-name');
    const locationInput = document.getElementById('bb-location');
    const counterInput = document.getElementById('bb-counter');
    const quotaInput = document.getElementById('bb-quota');

    let selectedRow = null;
    let selectedBankId = null;

    const resetForm = () => {
        form.reset();
        idInput.value = '';
        locationInput.value = state.location;
        selectedBankId = null;
        if (selectedRow) {
            selectedRow.classList.remove('selected');
            selectedRow = null;
        }
        saveBtn.textContent = 'Save';
    };

    const loadBloodBanks = async () => {
        try {
            const response = await fetch(`/api/blood-banks?location=${state.location}&year=${state.year}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            
            tableBody.innerHTML = '';
            result.data.forEach(bank => {
                const row = tableBody.insertRow();
                row.dataset.id = bank.Id;
                row.innerHTML = `
                    <td>${bank.Id}</td>
                    <td>${bank.Name}</td>
                    <td>${bank.CounterNo || ''}</td>
                    <td>${bank.QuotaLimit || ''}</td>
                    <td>${bank.Location}</td>
                `;
            });
        } catch (error) {
            console.error('Error loading blood banks:', error);
            alert('Could not load blood banks.');
        }
    };
    
    tableBody.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        if (selectedRow) {
            selectedRow.classList.remove('selected');
        }
        row.classList.add('selected');
        selectedRow = row;
        selectedBankId = row.dataset.id;
    });

    newBtn.addEventListener('click', resetForm);
    
    cancelBtn.addEventListener('click', resetForm);

    editBtn.addEventListener('click', () => {
        if (!selectedRow) {
            alert('Please select a row to edit.');
            return;
        }
        const cells = selectedRow.cells;
        idInput.value = selectedBankId;
        nameInput.value = cells[1].textContent;
        counterInput.value = cells[2].textContent;
        quotaInput.value = cells[3].textContent;
        locationInput.value = cells[4].textContent;
        saveBtn.textContent = 'Update';
    });

    deleteBtn.addEventListener('click', async () => {
        if (!selectedBankId) {
            alert('Please select a bank to delete.');
            return;
        }
        if (!confirm('Are you sure you want to delete this blood bank? This may affect existing registrations.')) {
            return;
        }
        try {
            const response = await fetch(`/api/blood-banks/${selectedBankId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            
            alert('Blood bank deleted successfully.');
            resetForm();
            loadBloodBanks();
        } catch (error) {
            console.error('Error deleting blood bank:', error);
            alert(`Could not delete blood bank: ${error.message}`);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isUpdate = !!idInput.value;
        const url = isUpdate ? `/api/blood-banks/${idInput.value}` : '/api/blood-banks';
        const method = isUpdate ? 'PUT' : 'POST';

        const body = {
            name: nameInput.value,
            location: state.location,
            year: state.year,
            counterNo: counterInput.value,
            quotaLimit: quotaInput.value
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            
            alert(`Blood bank ${isUpdate ? 'updated' : 'saved'} successfully.`);
            resetForm();
            loadBloodBanks();
        } catch (error) {
            console.error('Error saving blood bank:', error);
            alert(`Could not save blood bank: ${error.message}`);
        }
    });

    // Initial load
    locationInput.value = state.location;
    loadBloodBanks();
};
