// These UI helpers and tab modules are classic scripts that expose globals on `window`.
// Do not import them as ES module bindings; instead rely on the global functions
// that the scripts expose (e.g. `setupSettingsOverlay`, `initFleetTab`, etc.).

// Mappa tab -> modulo e funzione di init
const tabModules = {
    // These modules are loaded as classic scripts by the page. Call their
    // initialization functions exposed on `window` after the script has run.
    world:   () => Promise.resolve().then(() => window.initWorldTab && window.initWorldTab()),
    fleet:   () => Promise.resolve().then(() => window.initFleetTab && window.initFleetTab()),
    routes:  () => Promise.resolve().then(() => window.initRoutesTab && window.initRoutesTab()),
    finances:() => Promise.resolve().then(() => window.initFinancesTab && window.initFinancesTab()),
    infrastructure: () => Promise.resolve().then(() => window.initInfrastructureTab && window.initInfrastructureTab()),
    research:() => Promise.resolve().then(() => window.initResearchTab && window.initResearchTab())
};

// Traccia i tab già inizializzati
const initializedTabs = {};

document.addEventListener('DOMContentLoaded', function() {
    const authManager = new AuthManager();

    // (Developer) debug overlay removed; logs will appear in browser console only
    if (!authManager.loadCurrentUser()) {
        window.location.href = 'pages/auth/login.html';
        return;
    }
    const currentUser = authManager.getCurrentUser();
    console.debug('✅ Utente autenticato:', currentUser && currentUser.companyName);

    // Popola header (company name, money, reputation) usando currentUser, cache o fallback server
    (async function populateHeader() {
        try {
            console.debug('[hubPage] currentUser:', currentUser);
            console.debug('[hubPage] session selectedCompanyId:', sessionStorage.getItem('selectedCompanyId'));
            const companyNameEl = document.getElementById('company-name');
            const moneyEl = document.getElementById('money');
            const reputationEl = document.getElementById('reputation');

            let companyName = '--';
            let money = '💰 0';
            let reputation = '⭐ 0';

            // Preferisci dati presenti in currentUser
            if (currentUser && currentUser.companyName) {
                companyName = currentUser.companyName;
                if (typeof currentUser.money !== 'undefined') money = uiUtils.formatMoney(currentUser.money);
                if (typeof currentUser.reputation !== 'undefined') reputation = '⭐ ' + currentUser.reputation;
            }

            // Fallback alla cache degli utenti salvata da AuthManager
            if ((companyName === '--' || companyName === null) && currentUser && currentUser.email && authManager.users && authManager.users[currentUser.email]) {
                const cached = authManager.users[currentUser.email];
                companyName = cached.companyName || companyName;
                if (typeof cached.money !== 'undefined') money = uiUtils.formatMoney(cached.money);
                if (typeof cached.reputation !== 'undefined') reputation = '⭐ ' + cached.reputation;
            }

            // Se ancora non abbiamo il nome della compagnia, prova a chiedere al server la lista delle compagnie e cerca quella dell'utente
            console.debug('[hubPage] pre-check companyName variable:', companyName, '| typeof:', typeof companyName);
            if ((companyName === '--' || companyName === null || typeof companyName === 'undefined') && currentUser && currentUser.id) {
                try {
                        console.debug('[hubPage] fetching companies list for user lookup');
                    const resp = await fetch('/api/game/companies');
                        console.debug('[hubPage] fetch /api/game/companies status:', resp && resp.status);
                    if (resp && resp.ok) {
                        const json = await resp.json();
                            console.debug('[hubPage] companies list response:', json);
                        if (json && json.success && Array.isArray(json.data)) {
                            const myCompany = json.data.find(c => c.user_id === currentUser.id || c.userId === currentUser.id || String(c.user_id) === String(currentUser.id));
                                console.debug('[hubPage] matched company from list:', myCompany);
                            if (myCompany) {
                                companyName = myCompany.name || myCompany.company_name || companyName;
                                if (typeof myCompany.money !== 'undefined') money = uiUtils.formatMoney(myCompany.money);
                                if (typeof myCompany.reputation !== 'undefined') reputation = '⭐ ' + myCompany.reputation;

                                // Aggiorna cache locale per sessioni future
                                if (currentUser.email) {
                                    authManager.users[currentUser.email] = authManager.users[currentUser.email] || {};
                                    authManager.users[currentUser.email].companyName = companyName;
                                    if (typeof myCompany.money !== 'undefined') authManager.users[currentUser.email].money = myCompany.money;
                                    if (typeof myCompany.reputation !== 'undefined') authManager.users[currentUser.email].reputation = myCompany.reputation;
                                    try { authManager.saveUsers(); } catch(e) { /* ignore */ }
                                }

                                // Save selected company id so subsequent logic (WorldMap, header date) uses it
                                try { sessionStorage.setItem('selectedCompanyId', myCompany.id); } catch(e) { /* ignore */ }
                                console.debug('[hubPage] selectedCompanyId set to', myCompany.id);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Fallback fetch companies fallito:', e);
                }
            }

            if (companyNameEl) companyNameEl.textContent = companyName;
            if (moneyEl) moneyEl.textContent = money;
            if (reputationEl) reputationEl.textContent = reputation;

            // Se non abbiamo una data di gioco, prova a ottenere i dettagli della company (se conosciuta) per leggere game_date/founded
            try {
                // Prefer the selected company id saved in sessionStorage (set when launching a company from game-select)
                const sessionCompanyId = sessionStorage.getItem('selectedCompanyId');
                const companyId = sessionCompanyId || (currentUser && (currentUser.companyId || currentUser.company_id)) || (authManager.users && currentUser && authManager.users[currentUser.email] && authManager.users[currentUser.email].companyId) || null;
                console.debug('[hubPage] resolved companyId for date fetch:', companyId);
                if (companyId) {
                    console.debug('[hubPage] fetching company by id ->', companyId);
                    const r = await fetch('/api/game/companies/' + companyId);
                    console.debug('[hubPage] fetch company status:', r && r.status);
                    let companyJson = null;
                    try {
                        companyJson = await r.json();
                        console.debug('[hubPage] company response (body):', companyJson);
                    } catch (parseErr) {
                        console.warn('[hubPage] failed to parse company response as JSON:', parseErr);
                    }
                    if (!r || !r.ok) {
                        console.warn('[hubPage] company fetch returned non-OK status:', r && r.status, '| body:', companyJson);
                    }
                    if (companyJson && companyJson.success && companyJson.data && companyJson.data.company) {
                        const c = companyJson.data.company;
                        const dateToUse = c.game_date || c.founded || c.created_at || c.createdAt || null;
                        console.debug('[hubPage] dateToUse chosen:', dateToUse);
                        if (dateToUse) {
                            window.updateGameDateInHeader(dateToUse);
                            console.debug('[hubPage] updated header with date, DOM now ->', document.getElementById('game-date') ? document.getElementById('game-date').textContent : null);
                        } else {
                            console.debug('[hubPage] no valid date found in company payload');
                        }
                    }
                } else {
                    console.debug('[hubPage] no companyId resolved, skipping company fetch');
                }
            } catch (e) {
                // ignore fetch errors; non critico
                console.warn('[hubPage] error fetching company for date:', e);
            }
        } catch (e) { console.warn('Errore popolamento header:', e); }
    })();

    setupSettingsOverlay();

    // Ensure tab navigation (adds active class switching) is wired up
    try { setupTabNavigation(); } catch (e) { console.warn('[hubPage] setupTabNavigation failed', e && e.message); }

    // Lazy load e init moduli tab solo al primo click
    const tabButtons = document.querySelectorAll('.main-nav .menu-btn, #main-menu .menu-btn');
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

    // Also initialize tabs when switchToTab is called programmatically
    document.addEventListener('tab-switched', function(e) {
        try {
            const tab = e && e.detail && e.detail.tab;
            if (tab && tabModules[tab] && !initializedTabs[tab]) {
                tabModules[tab]().then(() => { initializedTabs[tab] = true; });
            }
        } catch (err) { /* ignore */ }
    });

    // Allow other modules to open the purchase UI inside the Fleet tab
    document.addEventListener('open-purchase', function(e) {
        try {
            const origin = e && e.detail && e.detail.origin ? e.detail.origin : null;
            const fleetBtn = document.querySelector('.menu-btn[data-tab="fleet"]');
            if (fleetBtn && !fleetBtn.classList.contains('active')) fleetBtn.click();
            // small timeout to let tab content initialize; call global if available
            setTimeout(() => {
                if (window.openFleetPurchaseUI) window.openFleetPurchaseUI(origin);
                else console.warn('[hubPage] openFleetPurchaseUI not available yet');
            }, 120);
        } catch (err) { console.warn('[hubPage] open-purchase handler error', err); }
    });

    // Se il tab world è attivo subito al caricamento, inizializza immediatamente
    try {
        const activeBtn = document.querySelector('.main-nav .menu-btn.active') || document.querySelector('#main-menu .menu-btn.active');
        if (activeBtn) {
            const tab = activeBtn.getAttribute('data-tab');
            if (tab && tabModules[tab] && !initializedTabs[tab]) {
                tabModules[tab]().then(() => { initializedTabs[tab] = true; });
            }
        }
    } catch (err) { /* ignore */ }
});
