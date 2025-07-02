import { setupSettingsOverlay } from '../ui/SettingsOverlay.js';
import { AuthManager } from '../utils/AuthManager.js';

// Mappa tab -> modulo e funzione di init
const tabModules = {
    world:   () => import('../ui/WorldTab.js').then(m => m.initWorldTab()),
    fleet:   () => import('../ui/FleetTab.js').then(m => m.initFleetTab()),
    routes:  () => import('../ui/RoutesTab.js').then(m => m.initRoutesTab()),
    finances:() => import('../ui/FinancesTab.js').then(m => m.initFinancesTab()),
    infrastructure: () => import('../ui/InfrastructureTab.js').then(m => m.initInfrastructureTab()),
    research:() => import('../ui/ResearchTab.js').then(m => m.initResearchTab())
};

// Traccia i tab già inizializzati
const initializedTabs = {};

document.addEventListener('DOMContentLoaded', function() {
    const authManager = new AuthManager();
    if (!authManager.loadCurrentUser()) {
        window.location.href = 'pages/auth/login.html';
        return;
    }
    console.log('✅ Utente autenticato:', authManager.getCurrentUser().companyName);

    setupSettingsOverlay();

    // Lazy load e init moduli tab solo al primo click
    const tabButtons = document.querySelectorAll('#main-menu .menu-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = btn.getAttribute('data-tab');
            if (tabModules[tab] && !initializedTabs[tab]) {
                tabModules[tab]().then(() => {
                    initializedTabs[tab] = true;
                });
            }
        });
    });
});
