// main.js
document.addEventListener('DOMContentLoaded', () => {
    const appGrid = document.getElementById('appGrid');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');
    const modal = document.getElementById('appModal');
    const modalTitle = document.getElementById('modalTitle');
    const appFrame = document.getElementById('appFrame');
    const closeModalBtn = document.getElementById('closeModal');
    const openInNewTabBtn = document.getElementById('openInNewTab');

    let allApps = [];
    let currentAppUrl = '';

    // 1. Fetch and render all apps
    async function loadApps() {
        try {
            // Add a cache-busting query parameter
            const response = await fetch(`apps.json?v=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error(`Failed to load apps.json: ${response.statusText}`);
            }
            allApps = await response.json();
            
            if (allApps.length === 0) {
                appGrid.innerHTML = '<p>No apps have been added yet.</p>';
                return;
            }
            renderApps(allApps);
        } catch (error) {
            console.error('Error loading apps:', error);
            appGrid.innerHTML = '<p>Error loading apps. Check the console for details.</p>';
        }
    }

    // 2. Render a list of apps to the grid
    function renderApps(apps) {
        appGrid.innerHTML = '';
        if (apps.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }

        apps.forEach(app => {
            const card = document.createElement('div');
            card.className = 'app-card';
            card.dataset.url = app.url;
            card.dataset.title = app.title;

            card.innerHTML = `
                <img src="${app.thumbnail}" alt="${app.title} thumbnail" class="app-thumbnail">
                <div class="app-info">
                    <h3>${app.title}</h3>
                    <p>${app.description}</p>
                </div>
            `;
            
            // Add click event to open the modal
            card.addEventListener('click', () => openModal(app));
            appGrid.appendChild(card);
        });
    }

    // 3. Filter apps based on search
    function filterApps() {
        const query = searchInput.value.toLowerCase();
        const filteredApps = allApps.filter(app => 
            app.title.toLowerCase().includes(query) || 
            app.description.toLowerCase().includes(query)
        );
        renderApps(filteredApps);
    }

    // 4. Modal controls
    function openModal(app) {
        modalTitle.textContent = app.title;
        appFrame.src = app.url; // Load the app into the iframe
        currentAppUrl = app.url; // Store URL for 'open in new tab'
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modal.style.display = 'none';
        appFrame.src = 'about:blank'; // Stop the app from running in the background
        currentAppUrl = '';
        document.body.style.overflow = 'auto';
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', filterApps);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Open in new tab
    openInNewTabBtn.addEventListener('click', () => {
        if (currentAppUrl) {
            window.open(currentAppUrl, '_blank');
        }
    });

    // Close modal if clicking on the background overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with the 'Escape' key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Initial load
    loadApps();
});
