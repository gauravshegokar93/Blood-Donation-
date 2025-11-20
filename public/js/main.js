// --- Global state and helpers ---
const state = {
    location: sessionStorage.getItem('bdc_location'),
    year: sessionStorage.getItem('bdc_year'),
    currentView: null,
};

// --- View Initializers (will be populated by other scripts) ---
const viewInitializers = {};

// --- Core Application Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for session; redirect if not found
    if (!state.location || !state.year) {
        window.location.href = '/index.html';
        return;
    }

    const navLinks = document.querySelectorAll('.nav-link');
    const mainContent = document.getElementById('main-content');
    const exitBtn = document.getElementById('exit-btn');

    // 2. Navigation handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = e.target.dataset.view;
            if (viewName) {
                switchView(viewName);
            }
        });
    });

    // 3. Exit button
    exitBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/index.html';
    });

    // 4. Initial view load
    switchView('dashboard');
});


/**
 * Switches the main content area to the specified view.
 * @param {string} viewName - The name of the view to display (e.g., 'registration').
 */
function switchView(viewName) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    state.currentView = viewName;

    // Find the template
    const template = document.getElementById(`${viewName}-view-template`);
    if (template) {
        // Clear current content
        mainContent.innerHTML = '';
        // Clone the template content and append it
        const viewContent = template.content.cloneNode(true);
        mainContent.appendChild(viewContent);

        // Call the initializer function for the view, if it exists
        if (typeof viewInitializers[viewName] === 'function') {
            viewInitializers[viewName]();
        }
    } else {
        mainContent.innerHTML = `<p>Error: View "${viewName}" not found.</p>`;
        console.error(`Template not found for view: ${viewName}-view-template`);
    }
}

/**
 * A simple utility to show feedback messages to the user.
 * @param {string} elementId - The ID of the message paragraph element.
 * @param {string} message - The message to display.
 * @param {boolean} isError - If true, the message will be styled as an error.
 */
function showFeedback(elementId, message, isError = false) {    
    const el = document.getElementById(elementId);
    if(el) {
        el.textContent = message;
        el.style.color = isError ? 'var(--primary-color)' : 'green';
        setTimeout(() => el.textContent = '', 5000);
    }
}

/**
 * Populates a select dropdown with options.
 * @param {HTMLSelectElement} selectElement The <select> element to populate.
 * @param {Array<object>} items The array of items to add as options.
 * @param {string} valueField The property name for the option's value.
 * @param {string} textField The property name for the option's text.
 * @param {string} defaultOptionText Text for the initial, disabled option.
 */
function populateSelect(selectElement, items, valueField, textField, defaultOptionText = 'Select an option') {
    if (!selectElement) return;
    selectElement.innerHTML = `<option value="">-- ${defaultOptionText} --</option>`;
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        selectElement.appendChild(option);
    });
}

/**
* Renders a stats panel with multiple stat cards.
* @param {string} containerId - The ID of the container element for the stats.
* @param {object} stats - An object with stat data, e.g., { Registered: 10, Accepted: 5 }.
*/
function renderStatsPanel(containerId, stats) {
    const panel = document.getElementById(containerId);
    if (!panel) return;

    panel.innerHTML = ''; // Clear previous stats

    const statOrder = ['Registered', 'Accepted', 'Rejected', 'Donated'];
    
    statOrder.forEach(key => {
        if(stats.hasOwnProperty(key)) {
            const value = stats[key];
            const card = document.createElement('div');
            card.className = `stat-card ${key.toLowerCase()}`;
            card.innerHTML = `
                <span class="stat-value">${value}</span>
                <span class="stat-label">${key}</span>
            `;
            panel.appendChild(card);
        }
    });
}


/**
 * Fetches stats for the current camp and updates the UI.
 * @param {string} containerId - The ID of the container for the stats panel.
 */
async function updateGlobalStats(containerId) {
    try {
        const response = await fetch(`/api/statistics?location=${state.location}&year=${state.year}`);
        const result = await response.json();
        if (result.success) {
            renderStatsPanel(containerId, result.data);
        } else {
            console.error('Failed to fetch stats:', result.error);
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Register Dashboard as a view
viewInitializers.dashboard = () => {
    document.getElementById('dashboard-title').textContent = `Dashboard - ${state.location} (${state.year})`;
    // This reuses the report-location logic for the dashboard.
    if (viewInitializers.reportStatusLocation) {
        viewInitializers.reportStatusLocation(true); // Pass true to indicate it's the dashboard
    }
};