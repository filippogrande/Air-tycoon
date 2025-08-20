// Script per la selezione dei salvataggi (module)
import { AuthManager } from '/src/utils/AuthManager.js';

console.debug('🎮 Caricamento game-select.js...');

let authManager;
let currentUser;
let selectedSaveToDelete = null;
let selectedDeleteType = 'save'; // 'save' (local) or 'company' (server)

document.addEventListener('DOMContentLoaded', function() {
    console.debug('🎮 Inizializzazione pagina selezione giochi...');
    
    authManager = new AuthManager();
    
    // Verifica autenticazione
    if (!authManager.loadCurrentUser()) {
    console.debug('❌ Utente non autenticato, reindirizzo al login...');
        window.location.href = 'pages/auth/login.html';
        return;
    }
    
    currentUser = authManager.getCurrentUser();
    console.debug('✅ Utente autenticato:', currentUser.email);
    
    initializeGameSelectPage();
});

// If selectPage injected modals before this script loaded, process them now
if (typeof window !== 'undefined' && Array.isArray(window.__injectedModals)) {
    window.__injectedModals.forEach(id => {
        try { if (window.onModalInjected) window.onModalInjected(id); } catch (e) { /* ignore */ }
    });
    // clear them after processing
    window.__injectedModals = [];
}

// Listen to custom event dispatched by selectPage when a modal is injected
document.addEventListener('modalInjected', function(e) {
    try {
        const id = e && e.detail && e.detail.id;
        if (id && window.onModalInjected) window.onModalInjected(id);
    } catch (err) { /* ignore */ }
});

// AirportData must be provided by `Client/src/data/SimpleData.js` at build time.
// No runtime fallback is used — if AirportData is missing, fail fast so bugs
// are visible during development.

function initializeGameSelectPage() {
    // Mostra nome utente
    updateUserInfo();
    
    // Carica salvataggi
    loadUserSaves();
    
    // Nota: Non carichiamo AirportData automaticamente a pagina aperta.
    // I dati aeroportuali vengono caricati on-demand quando l'utente apre la
    // modal "Nuovo Gioco" per evitare lavoro inutile e problemi di timing.
    
    // Setup event listeners
    setupEventListeners();
    
    console.debug('✅ Pagina selezione giochi inizializzata');
}

function updateUserInfo() {
    const welcomeText = document.getElementById('welcome-text');
    const userName = currentUser.email.split('@')[0];
    welcomeText.innerHTML = `Benvenuto, <strong>${userName}</strong>`;
}

async function loadUserSaves() {
    const savesContainer = document.getElementById('saves-container');
    const noSavesDiv = document.getElementById('no-saves');
    savesContainer.innerHTML = '';

    // Utente autenticato: carica compagnie dal backend
    try {
        const res = await fetch('/api/game/companies');
        if (!res.ok) throw new Error('Errore nel recupero compagnie dal server');
        const result = await res.json();
        const companies = (result && result.data) ? result.data : [];
        if (companies.length === 0) {
            savesContainer.style.display = 'none';
            noSavesDiv.classList.remove('hidden');
        } else {
            savesContainer.style.display = 'grid';
            noSavesDiv.classList.add('hidden');
            companies.forEach(company => {
                const card = createCompanyCard(company);
                savesContainer.appendChild(card);
            });
        }
    console.debug('📂 Caricate', companies.length, 'compagnie dal server');
    } catch (e) {
        savesContainer.style.display = 'none';
        noSavesDiv.classList.remove('hidden');
        showToast('Errore caricamento compagnie: ' + e.message, 'error');
    }
}

function createCompanyCard(company) {
    const card = document.createElement('div');
    card.className = 'save-card';
    const money = company.money ? '€' + company.money.toLocaleString() : 'N/A';
    const reputation = company.reputation || 0;
    const aircraftCount = company.aircraft_count || 0;
    const routeCount = company.routes_count || 0;
    const founded = company.founded ? new Date(company.founded).toLocaleDateString('it-IT') : 'N/A';
    // Placeholder per hub, verrà aggiornato async
    let hub = '...';
    card.innerHTML = `
        <div class="save-header">
            <div class="save-title">
                <h3>${company.name}</h3>
            </div>
            <div class="save-actions">
                <button class="action-btn danger delete-save-btn" onclick="promptDelete('company','${company.id}')" title="Elimina salvataggio">🗑️</button>
            </div>
        </div>
        <div class="save-info">
            <p><strong>📅 Fondata:</strong> ${founded}</p>
            <p><strong>💰 Budget:</strong> ${money}</p>
        </div>
        <div class="save-stats">
            <div class="stat-item">
                <span class="stat-value">⭐ ${reputation}</span>
                <span class="stat-label">Reputazione</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">✈️ ${aircraftCount}</span>
                <span class="stat-label">Aeromobili</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">🛣️ ${routeCount}</span>
                <span class="stat-label">Rotte</span>
            </div>
            <div class="stat-item hub-item">
                <span class="stat-value hub-value">${hub}</span>
                <span class="stat-label">Hub Principale</span>
            </div>
        </div>
        <button class="action-btn primary load-save-btn" onclick="startGameFromCompany('${company.id}')">
            🎮 Carica Partita
        </button>
    `;

    // Aggiorna hub async se presente
    if (company.base_airport) {
        fetch(`/api/airports/${company.base_airport}`)
            .then(res => res.json())
            .then(data => {
                const iata = (data && data.data && data.data.airport && data.data.airport.iata_code) ? data.data.airport.iata_code : company.base_airport;
                const hubSpan = card.querySelector('.hub-value');
                if (hubSpan) hubSpan.textContent = iata;
            })
            .catch(() => {
                const hubSpan = card.querySelector('.hub-value');
                if (hubSpan) hubSpan.textContent = company.base_airport;
            });
    }

    console.debug('[game-select] created company card for', company.id);
    return card;
}

// Esponi deleteSave su window per compatibilità con handler inline
if (typeof window !== 'undefined') {
    window.deleteSave = deleteSave;
}

// Prompt generico per eliminazione. Esposto globalmente per chiamate inline
if (typeof window !== 'undefined') {
    window.promptDelete = function(type, id) {
        // type: 'save' or 'company'
        selectedDeleteType = type || 'save';
        selectedSaveToDelete = id;
        const modal = document.getElementById('delete-modal');
        const saveNameSpan = document.getElementById('delete-save-name');
        if (saveNameSpan) saveNameSpan.textContent = id;
        if (modal) modal.classList.remove('hidden');
    };
}

window.startGameFromCompany = function(companyId) {
    // Salva il companyId selezionato in sessionStorage e reindirizza
    sessionStorage.setItem('selectedCompanyId', companyId);
    console.debug('[DEBUG] Salvato selectedCompanyId in sessionStorage:', companyId, '| typeof:', typeof companyId);
    window.location.href = 'index.html';
}

function populateStartingAirports(selectedScenario = null) {
    const select = document.getElementById('starting-airport');

    // If AirportData isn't ready yet, bail out silently (we'll try again later)
    if (!window.AirportData || !window.AirportData.airports) {
        console.warn('[game-select] populateStartingAirports skipped: AirportData non pronto');
        return;
    }
    
    // Se non c'è uno scenario selezionato, prova a prenderlo dal form
    if (!selectedScenario) {
        const scenarioSelect = document.getElementById('scenario');
        selectedScenario = scenarioSelect ? scenarioSelect.value : 'aviation_dawn';
    }
    
    // Mappatura scenario -> anno
    const scenarioYears = {
        aviation_dawn: 1950,
        jet_age: 1970,
        deregulation: 1990,
        modern_era: 2024
    };
    
    const targetYear = scenarioYears[selectedScenario] || 1950;
    
    // Filtra aeroporti disponibili nell'anno dello scenario
    // (aperti prima o nell'anno target, e non ancora chiusi)
    const availableAirports = window.AirportData.airports.filter(airport => {
        const openedYear = airport.openedYear || 1900; // Default se non specificato
        const closedYear = airport.closedYear;
        
        // Deve essere aperto nell'anno target
        const isOpen = openedYear <= targetYear;
        const notClosed = !closedYear || closedYear >= targetYear;
        
        return isOpen && notClosed;
    });
    
    // Filtra solo aeroporti grandi/hub per la partenza e ordina per traffico
    const suitableAirports = availableAirports
        .filter(airport => airport.size === 'large' || airport.size === 'hub')
        .sort((a, b) => (b.passengerTraffic || 0) - (a.passengerTraffic || 0));
    
    // If the element is a hidden input (modal template uses hidden input + summary/button),
    // set a sensible default value and update the summary instead of building options.
    if (select && select.tagName && select.tagName.toUpperCase() !== 'SELECT') {
        const suitable = suitableAirports[0];
        if (suitable) {
            select.value = suitable.code;
            const summary = document.getElementById('selected-hub-summary');
            if (summary) summary.textContent = `Hub selezionato: ${suitable.name} (${suitable.code})`;
        }
    console.debug(`[game-select] starting-airport is not a <select> element; set default to ${suitableAirports.length>0?suitableAirports[0].code:'none'}`);
        return;
    }

    select.innerHTML = '<option value="">Seleziona hub di partenza...</option>';
    
    suitableAirports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.code;
        
        // Formato con informazioni storiche
        const eraInfo = airport.openedYear ? `(dal ${airport.openedYear})` : '';
        const trafficFormatted = airport.passengerTraffic 
            ? `${(airport.passengerTraffic / 1000000).toFixed(1)}M pax/anno`
            : '';
        
        option.textContent = `${airport.name} (${airport.code}) - ${airport.city}, ${airport.country}`;
        if (eraInfo) {
            option.textContent += ` ${eraInfo}`;
        }
        if (trafficFormatted) {
            option.textContent += ` • ${trafficFormatted}`;
        }
        
        select.appendChild(option);
    });
    
    console.debug(`🏢 Caricati ${suitableAirports.length} aeroporti disponibili per l'anno ${targetYear} (scenario: ${selectedScenario})`);
    
    // Evidenzia aeroporti italiani se disponibili
    const italianAirports = suitableAirports.filter(airport => airport.country === 'Italia');
    if (italianAirports.length > 0) {
    console.debug(`🇮🇹 ${italianAirports.length} aeroporti italiani disponibili:`, italianAirports.map(a => a.code).join(', '));
    }
}

// Load airports from API (DB) and normalize into window.AirportData
async function loadAirportDataFromApi() {
    try {
        const res = await fetch('/api/airports?size=large&limit=500');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const body = await res.json();
        const data = Array.isArray(body) ? body : (body && body.data ? body.data : []);
        const airports = data.map(a => ({
            code: a.iata_code || a.code || a.id,
            name: a.name || '',
            city: a.city || a.city_name || '',
            country: a.country || a.country_name || '',
            size: a.airport_size || a.size || (a.passenger_traffic && a.passenger_traffic > 20000000 ? 'large' : 'medium'),
            passengerTraffic: a.passenger_traffic || a.passengerTraffic || 0,
            openedYear: a.opened_year || a.openedYear || null,
            closedYear: a.closed_year || a.closedYear || null
        }));
        window.AirportData = window.AirportData || {};
        window.AirportData.airports = airports;
        window.AirportData._airportByCode = {};
        window.AirportData.airports.forEach(ap => { window.AirportData._airportByCode[ap.code] = ap; });
        window.AirportData.getAirportByCode = function(code) { return window.AirportData._airportByCode[code] || null; };
    console.debug('✅ Caricati', airports.length, 'aeroporti dal server');
    return true;
    } catch (e) {
    // Non rilanciamo errori: logghiamo e ritorniamo false in modo che il
    // chiamante possa decidere come procedere senza generare eccezioni.
    console.warn('[game-select] Caricamento aeroporti fallito:', e.message);
    return false;
    }
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showLoading('Logout in corso...');
            setTimeout(function() {
                if (authManager && typeof authManager.logout === 'function') authManager.logout();
                window.location.href = '/game/pages/auth/login.html';
            }, 500);
        });
    } else {
        console.warn('[game-select] logout-btn non trovato in DOM');
    }
    
    // New game buttons
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) newGameBtn.addEventListener('click', showNewGameModal);
    else console.warn('[game-select] new-game-btn non trovato');
    const startFirstBtn = document.getElementById('start-first-game');
    if (startFirstBtn) startFirstBtn.addEventListener('click', showNewGameModal);
    else console.warn('[game-select] start-first-game non trovato');

    // Fallback: delegated click handler in case direct listeners were missed
    // (covers timing issues or multiple DOM insertions)
    document.addEventListener('click', function(e) {
        const target = e.target;
        if (!target) return;
        if (target.closest && (target.closest('#new-game-btn') || target.closest('#start-first-game'))) {
            console.debug('[game-select] delegated click detected for new-game/start-first');
            try { showNewGameModal(); } catch (err) { console.warn('[game-select] showNewGameModal failed:', err.message); }
        }
    });
    
    // Scenario change listener - ricarica aeroporti quando cambia lo scenario
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'scenario') {
            const selectedScenario = e.target.value;
            console.debug('📅 Scenario cambiato:', selectedScenario);
            populateStartingAirports(selectedScenario);
        }
    });
    
    // Modal controls (safely attach only if present)
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideNewGameModal);
    const cancelNewBtn = document.getElementById('cancel-new-game');
    if (cancelNewBtn) cancelNewBtn.addEventListener('click', hideNewGameModal);
    const newGameFormEl = document.getElementById('new-game-form');
    if (newGameFormEl) newGameFormEl.addEventListener('submit', handleNewGame);
    
    // Delete modal controls
    const closeDeleteBtn = document.getElementById('close-delete-modal');
    if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', hideDeleteModal);
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    // Toast close
    const toastCloseBtn = document.getElementById('toast-close');
    if (toastCloseBtn) toastCloseBtn.addEventListener('click', hideToast);
    
    // Click outside modal to close
    document.addEventListener('click', function(e) {
        const newGameModal = document.getElementById('new-game-modal');
        const deleteModal = document.getElementById('delete-modal');
    
            if (e.target === newGameModal) hideNewGameModal();
            if (e.target === deleteModal) hideDeleteModal();
    });
}

// Hook used by selectPage.js after it injects modal HTML. This ensures listeners
// that depend on modal DOM are attached even if templates were loaded asynchronously.
window.onModalInjected = function(modalId) {
    if (modalId === 'new-game-modal') {
        // attach new-game modal listeners
        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) closeModalBtn.addEventListener('click', hideNewGameModal);
        const cancelNewBtn = document.getElementById('cancel-new-game');
        if (cancelNewBtn) cancelNewBtn.addEventListener('click', hideNewGameModal);
        const newGameFormEl = document.getElementById('new-game-form');
        if (newGameFormEl) newGameFormEl.addEventListener('submit', handleNewGame);
        const openHubBtn = document.getElementById('open-hub-modal-btn');
        if (openHubBtn) openHubBtn.addEventListener('click', function() { const scenario = document.getElementById('scenario')?.value; openSelectHubModal(scenario); });
        // Dopo che la modal è stata iniettata, popola la select degli aeroporti
        try {
            populateStartingAirports();
        } catch (err) {
            console.warn('[game-select] populateStartingAirports fallita dopo injection:', err.message);
        }
    }

    if (modalId === 'select-hub-modal') {
        attachModalListeners('select-hub-modal');
    }

    if (modalId === 'delete-modal') {
        const closeDeleteBtn = document.getElementById('close-delete-modal');
        if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', hideDeleteModal);
        const cancelDeleteBtn = document.getElementById('cancel-delete');
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', hideDeleteModal);
        const confirmDeleteBtn = document.getElementById('confirm-delete');
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
};

async function showNewGameModal() {
    console.debug('[game-select] showNewGameModal called');
    const modal = document.getElementById('new-game-modal');
    const companyNameInput = document.getElementById('company-name-input');
    const scenarioSelect = document.getElementById('scenario');

    if (!modal) {
        console.warn('[game-select] new-game-modal element not present yet; will attempt to open after injection');
    }

    // Pre-popola nome compagnia con suggerimento (solo se input esiste)
    if (companyNameInput && !companyNameInput.value) {
        const suggestions = [
            'Sky Express Airlines', 'European Wings', 'Global Air Transport',
            'Continental Airways', 'Freedom Airlines', 'Horizon Express',
            'Liberty Air', 'Transcontinental', 'World Connect Airways'
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        companyNameInput.value = randomSuggestion;
    }

    // Carica AirportData on-demand prima di popolare la modal.
    // Se il caricamento fallisce, logghiamo e lasciamo la modal aprirsi comunque
    // (l'utente vedrà un messaggio o la select vuota) ma non lanciamo eccezioni.
    const defaultScenario = scenarioSelect ? scenarioSelect.value : 'aviation_dawn';
    try {
        const ok = await loadAirportDataFromApi();
        if (!ok) {
            console.warn('[game-select] AirportData non disponibile dopo tentativo di caricamento');
        }
    } catch (err) {
        console.warn('[game-select] Errore inatteso durante loadAirportDataFromApi:', err.message);
    }

    try {
        populateStartingAirports(defaultScenario);
    } catch (err) {
        console.warn('[game-select] populateStartingAirports failed (AirportData may be missing)', err.message);
    }

    if (modal) modal.classList.remove('hidden');
}

function hideNewGameModal() {
    const modal = document.getElementById('new-game-modal');
    if (modal) modal.classList.add('hidden');
}

function handleNewGame(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const saveName = formData.get('saveName').trim();
    const companyName = formData.get('companyName').trim();
    const startingAirport = formData.get('startingAirport');
    const difficulty = formData.get('difficulty');
    const scenario = formData.get('scenario');
    
    // Validazione
    if (!saveName || !companyName || !startingAirport || !difficulty || !scenario) {
        showToast('Tutti i campi sono obbligatori', 'error');
        return;
    }
    
    showLoading('Creazione nuovo gioco...');
    
    // Simula creazione gioco
    setTimeout(async function() {
        createNewGame(saveName, companyName, startingAirport, difficulty, scenario);
    }, 1500);
}

function createNewGame(saveName, companyName, startingAirport, difficulty, scenario) {
    // Configurazioni scenario
    const scenarioSettings = {
        aviation_dawn: {
            year: 1950,
            description: "Inizio epoca del trasporto aereo",
            availableAircraft: ["DC-3", "Lockheed L-049"],
            technology: "basic",
            fuelCost: 0.3,
            regulations: "minimal"
        },
        jet_age: {
            year: 1970,
            description: "Era dei jet commerciali",
            availableAircraft: ["Boeing 707", "DC-8", "Sud Caravelle"],
            technology: "jet_early",
            fuelCost: 0.4,
            regulations: "moderate"
        },
        deregulation: {
            year: 1990,
            description: "Deregolamentazione globale",
            availableAircraft: ["Boeing 737", "A320", "MD-80"],
            technology: "modern",
            fuelCost: 0.5,
            regulations: "competitive"
        },
        modern_era: {
            year: 2020,
            description: "Era moderna",
            availableAircraft: ["A350", "Boeing 787", "A320neo"],
            technology: "advanced",
            fuelCost: 0.8,
            regulations: "strict"
        }
    };
    
    // Crea dati iniziali del gioco
    const difficultySettings = {
        easy: { money: 5000000, reputation: 60 },
        normal: { money: 2000000, reputation: 50 },
        hard: { money: 1000000, reputation: 40 }
    };
    
    const settings = difficultySettings[difficulty];
    const scenarioData = scenarioSettings[scenario];
    
    const gameData = {
        company: {
            name: companyName,
            money: settings.money,
            reputation: settings.reputation,
            headquarters: startingAirport
        },
        scenario: {
            id: scenario,
            ...scenarioData
        },
        homeAirport: startingAirport,
        difficulty: difficulty,
        gameTime: {
            currentDate: new Date(scenarioData.year, 0, 1).toISOString(),
            gameSpeed: 1,
            startYear: scenarioData.year
        },
        fleet: [],
        routes: [],
        hubs: [startingAirport], // Il primo hub è gratuito
        research: {
            completedResearch: [],
            currentResearch: null
        },
        stats: {
            totalPassengers: 0,
            totalRevenue: 0,
            totalExpenses: 0
        }
    };
    
    // FLUSSO CORRETTO: sincronizza solo col server
    syncGameWithServer(saveName, gameData).then(() => {
        hideLoading();
        showToast('Nuovo gioco creato e sincronizzato!', 'success');
        hideNewGameModal();
        setTimeout(function() {
            loadUserSaves();
        }, 1000);
    }).catch(error => {
        console.error('❌ Errore sincronizzazione server:', error);
        hideLoading();
        showToast(`Errore sincronizzazione server: ${error.message}. Riprova.`, 'error');
    });
}

// Funzione per sincronizzare il gioco con il server
async function syncGameWithServer(saveName, gameData) {
    try {
        const user = authManager.getCurrentUser();
        
        if (!user || !user.id) {
            throw new Error('Utente non valido per la sincronizzazione');
        }
        
    console.debug('🔄 Inizio sincronizzazione con server...', {
            userId: user.id,
            saveName: saveName,
            companyName: gameData.company.name
        });
        
        // Test connessione server prima di iniziare
        try {
            const testResponse = await fetch('/api/game/companies', { method: 'GET' });
            if (!testResponse.ok && testResponse.status === 404) {
                throw new Error('API del server non disponibili (404). Verifica che il server sia avviato.');
            }
        } catch (testError) {
            if (testError.message.includes('Failed to fetch')) {
                throw new Error('Impossibile connettersi al server. Verifica che sia in esecuzione.');
            }
            throw testError;
        }
        
        // Prima crea o aggiorna la compagnia
        const companyPayload = {
            // id: `${user.id}_${saveName}`, // RIMOSSO: lascia generazione id al backend
            name: gameData.company.name,
            money: gameData.company.money,
            reputation: gameData.company.reputation,
            founded: gameData.gameTime.currentDate,
            base_airport: gameData.homeAirport,
            user_id: user.id // <--- AGGIUNTO
        };
        
    console.debug('📊 Creazione compagnia sul server...', companyPayload);
        
        const companyResponse = await fetch('/api/game/companies/create-or-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token || 'no-token'}`
            },
            body: JSON.stringify(companyPayload)
        });
        
    console.debug('📊 Risposta server compagnia:', companyResponse.status, companyResponse.statusText);
        
        if (!companyResponse.ok) {
            let errorMessage = `Errore HTTP ${companyResponse.status}`;
            try {
                const errorData = await companyResponse.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                const errorText = await companyResponse.text();
                errorMessage = errorText || errorMessage;
            }
            throw new Error(`Creazione compagnia fallita: ${errorMessage}`);
        }
        
        const companyData = await companyResponse.json();
        if (!companyData.success || !companyData.data) {
            throw new Error('Risposta compagnia non valida dal server');
        }
        
    console.debug('✅ Compagnia creata/aggiornata:', companyData.data?.name || 'Nome non disponibile');
        
        // SEMPLIFICATO: salva solo l'UUID in sessionStorage e avvia subito il gioco
        if (companyData.data && companyData.data.id) {
            sessionStorage.setItem('selectedCompanyId', companyData.data.id);
            console.debug('[DEBUG] Salvato selectedCompanyId in sessionStorage (nuovo gioco):', companyData.data.id, '| typeof:', typeof companyData.data.id);
            window.location.href = 'index.html';
            return;
        }
        
    } catch (error) {
        console.error('❌ Errore sincronizzazione server:', error);
        console.error('Stack trace:', error.stack);
        
        // Rilancia l'errore con messaggio più user-friendly
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Server non raggiungibile. Verifica la connessione di rete.');
        } else if (error.message.includes('404')) {
            throw new Error('API non trovate. Verifica che il server Air Tycoon sia avviato.');
        } else {
            throw error;
        }
    }
}

function startGame(saveKey) {
    // SEMPLIFICATO: recupera companyId dal salvataggio e avvia solo se presente
    const saves = authManager.getUserSaves();
    const save = saves[saveKey];
    let companyId = null;
    if (save && save.data && save.data.company && save.data.company.id) {
        companyId = save.data.company.id;
    }
    if (!companyId) {
        showToast('Errore: companyId non trovato nel salvataggio selezionato', 'error');
        return;
    }
    sessionStorage.setItem('selectedCompanyId', companyId);
    console.debug('[DEBUG] Salvato selectedCompanyId in sessionStorage (startGame):', companyId, '| typeof:', typeof companyId);
    window.location.href = 'index.html';
}

function deleteSave(saveKey) {
    selectedSaveToDelete = saveKey;
    
    const modal = document.getElementById('delete-modal');
    const saveNameSpan = document.getElementById('delete-save-name');
    
    saveNameSpan.textContent = saveKey;
    modal.classList.remove('hidden');
}

function hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.classList.add('hidden');
    selectedSaveToDelete = null;
}

function confirmDelete() {
    if (!selectedSaveToDelete) return;
    
    showLoading('Eliminazione salvataggio...');
    
    setTimeout(async function() {
        try {
            console.debug('[game-select] confirmDelete called for:', selectedSaveToDelete);
            console.debug('[game-select] authManager currentUser snapshot:', !!authManager && !!authManager.getCurrentUser ? authManager.getCurrentUser() : '(no authManager)');
        } catch (dbgErr) { console.warn('[game-select] debug read failed:', dbgErr.message); }

        let deleteResult = false;
        try {
            if (selectedDeleteType === 'company') {
                // Call server API to delete company
                console.debug('[game-select] attempting server-side deletion for company id:', selectedSaveToDelete);
                try {
                    const resp = await fetch(`/api/game/companies/${selectedSaveToDelete}`, { method: 'DELETE' });
                    if (resp.ok) {
                        deleteResult = true;
                    } else {
                        const text = await resp.text();
                        console.error('[game-select] server delete failed:', resp.status, text);
                        deleteResult = false;
                    }
                } catch (netErr) {
                    console.error('[game-select] network error deleting company:', netErr.message);
                    deleteResult = false;
                }
            } else {
                deleteResult = authManager.deleteSave(selectedSaveToDelete);
                console.debug('[game-select] authManager.deleteSave result:', deleteResult);
            }
        } catch (e) {
            console.error('[game-select] deletion threw:', e && e.message);
            deleteResult = false;
        }

        // If deleteResult is false, attempt robust manual fallbacks to remove the save
        if (!deleteResult) {
            try {
                const user = authManager.getCurrentUser ? authManager.getCurrentUser() : (authManager.currentUser || null);

                // 1) Direct key deletion if present
                if (user && user.saves && user.saves[selectedSaveToDelete]) {
                console.debug('[game-select] attempting manual deletion fallback for', selectedSaveToDelete);
                    delete user.saves[selectedSaveToDelete];
                    const saved = authManager.saveUsers ? authManager.saveUsers() : false;
                console.debug('[game-select] manual deletion persisted:', saved);
                    deleteResult = !!saved;
                } else {
                    // 2) Search all saves for a matching internal id or name and delete that key
                    try {
                        const saves = authManager.getUserSaves ? authManager.getUserSaves() : (user && user.saves ? user.saves : null);
                        let foundKey = null;
                        if (saves) {
                            for (const key in saves) {
                                if (!Object.prototype.hasOwnProperty.call(saves, key)) continue;
                                const s = saves[key];
                                try {
                                    // match by nested company id
                                    if (s && s.data && s.data.company && (String(s.data.company.id) === String(selectedSaveToDelete))) {
                                        foundKey = key;
                                        break;
                                    }
                                    // match by save name
                                    if (s && s.name && String(s.name) === String(selectedSaveToDelete)) {
                                        foundKey = key;
                                        break;
                                    }
                                    // match by company name
                                    if (s && s.data && s.data.company && s.data.company.name && String(s.data.company.name) === String(selectedSaveToDelete)) {
                                        foundKey = key;
                                        break;
                                    }
                                } catch (inner) { /* ignore per-save errors */ }
                            }
                        }

                        if (foundKey) {
                    console.debug('[game-select] found matching save key via search:', foundKey, 'for', selectedSaveToDelete);
                            if (user && user.saves && user.saves[foundKey]) {
                                delete user.saves[foundKey];
                            } else {
                                // try users cache if currentUser doesn't hold saves
                                const email = (authManager.getCurrentUser && authManager.getCurrentUser()?.email) || (authManager.currentUser && authManager.currentUser.email);
                                if (email && authManager.users && authManager.users[email] && authManager.users[email].saves && authManager.users[email].saves[foundKey]) {
                                    delete authManager.users[email].saves[foundKey];
                                }
                            }
                            const saved = authManager.saveUsers ? authManager.saveUsers() : false;
                    console.debug('[game-select] manual deletion (foundKey) persisted:', saved);
                            deleteResult = !!saved;
                        } else {
                            // 3) Try cache stored in authManager.users by email as last resort
                            try {
                                const email = (authManager.getCurrentUser && authManager.getCurrentUser()?.email) || (authManager.currentUser && authManager.currentUser.email);
                                if (email && authManager.users && authManager.users[email] && authManager.users[email].saves && authManager.users[email].saves[selectedSaveToDelete]) {
                        console.debug('[game-select] attempting manual deletion in authManager.users cache for', selectedSaveToDelete);
                                    delete authManager.users[email].saves[selectedSaveToDelete];
                                    const saved = authManager.saveUsers ? authManager.saveUsers() : false;
                        console.debug('[game-select] manual deletion in users cache persisted:', saved);
                                    deleteResult = !!saved;
                                } else {
                                    console.warn('[game-select] manual deletion fallback: save key not found on currentUser or users cache and search yielded no match');
                                }
                            } catch (e) {
                                console.error('[game-select] error during users-cache fallback:', e && e.message);
                            }
                        }
                    } catch (e) {
                        console.error('[game-select] error during search-based fallback:', e && e.message);
                    }
                }
            } catch (fallbackErr) {
                console.error('[game-select] manual deletion fallback threw:', fallbackErr && fallbackErr.message);
            }
        }

        hideLoading();
        hideDeleteModal();

        if (deleteResult) {
            showToast('Salvataggio eliminato con successo', 'success');
            loadUserSaves(); // Ricarica la lista
        } else {
            showToast('Errore durante l\'eliminazione (controlla console)', 'error');
        }

        selectedSaveToDelete = null;
        
    }, 800);
}

function showLoading(message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('hidden');
}

function showToast(message, type) {
    const toast = document.getElementById('message-toast');
    const toastText = document.getElementById('toast-text');
    
    toastText.textContent = message;
    
    // Reset classes
    toast.classList.remove('error', 'warning', 'success');
    
    // Add type class
    if (type === 'error') {
        toast.classList.add('error');
    } else if (type === 'warning') {
        toast.classList.add('warning');
    }
    // success is default style
    
    toast.classList.remove('hidden');
    
    // Auto hide after 6 seconds for errors (più tempo per leggere)
    const hideDelay = type === 'error' ? 6000 : 4000;
    setTimeout(hideToast, hideDelay);
}

function hideToast() {
    const toast = document.getElementById('message-toast');
    toast.classList.add('hidden');
}

console.debug('✅ game-select.js caricato');
