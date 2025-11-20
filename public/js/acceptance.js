viewInitializers.acceptance = () => {
    const form = document.getElementById('acceptance-form');
    const regNoInput = document.getElementById('accept-reg-no');
    const messageEl = document.getElementById('acceptance-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const regId = regNoInput.value;
        if (!regId) {
            showFeedback('acceptance-message', 'Please enter a registration number.', true);
            return;
        }

        try {
            const response = await fetch(`/api/registrations/${regId}/accept`, {
                method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ location: state.location, year: state.year }),
            });
            const result = await response.json();

            if (result.success) {
                showFeedback('acceptance-message', `Donor #${regId} has been accepted.`);
                form.reset();
                regNoInput.focus();
                // If the stats panel is visible in another view, this event could update it.
                // For simplicity, we just show a message. The stats will be fresh on next view load.
                 document.dispatchEvent(new CustomEvent('statsChanged'));
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showFeedback('acceptance-message', `Error: ${error.message}`, true);
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
