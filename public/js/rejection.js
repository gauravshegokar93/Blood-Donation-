viewInitializers.rejection = () => {
    const form = document.getElementById('rejection-form');
    const regNoInput = document.getElementById('reject-reg-no');
    const reasonSelect = document.getElementById('reject-reason');
    const messageEl = document.getElementById('rejection-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const regId = regNoInput.value;
        const reason = reasonSelect.value;
        if (!regId || !reason) {
            showFeedback('rejection-message', 'Please enter a registration number and select a reason.', true);
            return;
        }
        
        try {
            const response = await fetch(`/api/registrations/${regId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason, location: state.location, year: state.year }),
            });
            const result = await response.json();

            if (result.success) {
                showFeedback('rejection-message', `Donor #${regId} has been rejected.`);
                form.reset();
                regNoInput.focus();
                // Dispatch event to notify other parts of the app that stats have changed
                document.dispatchEvent(new CustomEvent('statsChanged'));
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showFeedback('rejection-message', `Error: ${error.message}`, true);
        }
    });
    
     // Listen for stats changes to update if needed
    document.addEventListener('statsChanged', () => {
        if(state.currentView === 'registration'){
             updateGlobalStats('reg-stats-panel');
        } else if (state.currentView === 'dashboard') {
             if (viewInitializers.reportStatusLocation) {
                viewInitializers.reportStatusLocation(true);
            }
        }
    });
};
