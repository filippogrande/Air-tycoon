// Script per la selezione dei salvataggi
console.log('🎮 Caricamento game-select.js...');

let authManager;
let currentUser;
let selectedSaveToDelete = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Inizializzazione pagina selezione giochi...');
    
    authManager = new AuthManager();
    
    // Verifica autenticazione
    if (!authManager.loadCurrentUser()) {
        console.log('❌ Utente non autenticato, reindirizzo al login...');
        window.location.href = 'auth.html';
        return;
    }
    
    currentUser = authManager.getCurrentUser();
    console.log('✅ Utente autenticato:', currentUser.email);
    
    initializeGameSelectPage();
});

function initializeGameSelectPage() {
    // Mostra nome utente
    updateUserInfo();
    
    // Carica salvataggi
    loadUserSaves();
    
    // Popola aeroporti di partenza
    populateStartingAirports();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Pagina selezione giochi inizializzata');
}

function updateUserInfo() {
    const welcomeText = document.getElementById('welcome-text');
    const userName = currentUser.isGuest ? 'Ospite' : currentUser.email.split('@')[0];
    
    welcomeText.innerHTML = `Benvenuto, <strong>${userName}</strong>`;
}

async function loadUserSaves() {
    const savesContainer = document.getElementById('saves-container');
    const noSavesDiv = document.getElementById('no-saves');
    savesContainer.innerHTML = '';

    if (currentUser && !currentUser.isGuest) {
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
            console.log('📂 Caricate', companies.length, 'compagnie dal server');
        } catch (e) {
            savesContainer.style.display = 'none';
            noSavesDiv.classList.remove('hidden');
            showToast('Errore caricamento compagnie: ' + e.message, 'error');
        }
    } else {
        // Guest: fallback su localStorage
        const saves = authManager.getUserSaves();
        const saveKeys = Object.keys(saves);
        if (saveKeys.length === 0) {
            savesContainer.style.display = 'none';
            noSavesDiv.classList.remove('hidden');
        } else {
            savesContainer.style.display = 'grid';
            noSavesDiv.classList.add('hidden');
            saveKeys.forEach(saveKey => {
                const save = saves[saveKey];
                const saveCard = createSaveCard(saveKey, save);
                savesContainer.appendChild(saveCard);
            });
        }
        console.log('📂 Caricati', saveKeys.length, 'salvataggi (guest)');
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
    // Aggiorna async il codice IATA dell'hub
    if (company.base_airport) {
        fetch(`/api/airports/${company.base_airport}`)
            .then(res => res.json())
            .then(data => {
                // Corretto: estrai iata_code da data.data.airport
                const iata = data && data.data && data.data.airport && data.data.airport.iata_code
                    ? data.data.airport.iata_code
                    : company.base_airport;
                const hubSpan = card.querySelector('.hub-value');
                if (hubSpan) hubSpan.textContent = iata;
            })
            .catch(() => {
                const hubSpan = card.querySelector('.hub-value');
                if (hubSpan) hubSpan.textContent = company.base_airport;
            });
    }
    return card;
}

window.startGameFromCompany = function(companyId) {
    // Salva il companyId selezionato in sessionStorage e reindirizza
    sessionStorage.setItem('selectedCompanyId', companyId);
    window.location.href = 'index.html';
}

function createSaveCard(saveKey, save) {
    const card = document.createElement('div');
    card.className = 'save-card';
    
    const savedDate = new Date(save.savedAt);
    const gameData = save.data || {};
    const company = gameData.company || {};
    
    // Calcola statistiche
    const money = company.money ? '€' + company.money.toLocaleString() : 'N/A';
    const reputation = company.reputation || 0;
    const aircraftCount = gameData.fleet ? gameData.fleet.length : 0;
    const routeCount = gameData.routes ? gameData.routes.length : 0;
    
    card.innerHTML = `
        <div class="save-header">
            <div class="save-title">
                <h3>${saveKey}</h3>
                <div class="company-name">${company.name || 'Compagnia Senza Nome'}</div>
            </div>
            <div class="save-actions">
                <button class="icon-btn" onclick="deleteSave('${saveKey}')" title="Elimina">🗑️</button>
            </div>
        </div>
        
        <div class="save-info">
            <p><strong>📅 Salvato:</strong> ${savedDate.toLocaleDateString('it-IT')} ${savedDate.toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}</p>
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
            <div class="stat-item">
                <span class="stat-value">🏢 ${gameData.homeAirport || 'N/A'}</span>
                <span class="stat-label">Hub Principale</span>
            </div>
        </div>
        
        <button class="action-btn primary load-save-btn" onclick="loadSave('${saveKey}')">
            🎮 Carica Partita
        </button>
    `;
    
    return card;
}

function populateStartingAirports(selectedScenario = null) {
    const select = document.getElementById('starting-airport');
    
    if (!window.AirportData || !window.AirportData.airports) {
        console.warn('⚠️ AirportData non disponibile');
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
    
    console.log(`🏢 Caricati ${suitableAirports.length} aeroporti disponibili per l'anno ${targetYear} (scenario: ${selectedScenario})`);
    
    // Evidenzia aeroporti italiani se disponibili
    const italianAirports = suitableAirports.filter(airport => airport.country === 'Italia');
    if (italianAirports.length > 0) {
        console.log(`🇮🇹 ${italianAirports.length} aeroporti italiani disponibili:`, italianAirports.map(a => a.code).join(', '));
    }
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        showLoading('Logout in corso...');
        setTimeout(function() {
            authManager.logout();
            window.location.href = 'auth.html';
        }, 500);
    });
    
    // New game buttons
    document.getElementById('new-game-btn').addEventListener('click', showNewGameModal);
    document.getElementById('start-first-game').addEventListener('click', showNewGameModal);
    
    // Scenario change listener - ricarica aeroporti quando cambia lo scenario
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'scenario') {
            const selectedScenario = e.target.value;
            console.log('📅 Scenario cambiato:', selectedScenario);
            populateStartingAirports(selectedScenario);
        }
    });
    
    // Modal controls
    document.getElementById('close-modal').addEventListener('click', hideNewGameModal);
    document.getElementById('cancel-new-game').addEventListener('click', hideNewGameModal);
    document.getElementById('new-game-form').addEventListener('submit', handleNewGame);
    
    // Delete modal controls
    document.getElementById('close-delete-modal').addEventListener('click', hideDeleteModal);
    document.getElementById('cancel-delete').addEventListener('click', hideDeleteModal);
    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
    
    // Toast close
    document.getElementById('toast-close').addEventListener('click', hideToast);
    
    // Click outside modal to close
    document.addEventListener('click', function(e) {
        const newGameModal = document.getElementById('new-game-modal');
        const deleteModal = document.getElementById('delete-modal');
        
        if (e.target === newGameModal) hideNewGameModal();
        if (e.target === deleteModal) hideDeleteModal();
    });
}

function showNewGameModal() {
    const modal = document.getElementById('new-game-modal');
    const companyNameInput = document.getElementById('company-name-input');
    const scenarioSelect = document.getElementById('scenario');
    
    // Pre-popola nome compagnia con suggerimento
    if (!companyNameInput.value) {
        const suggestions = [
            'Sky Express Airlines', 'European Wings', 'Global Air Transport',
            'Continental Airways', 'Freedom Airlines', 'Horizon Express',
            'Liberty Air', 'Transcontinental', 'World Connect Airways'
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        companyNameInput.value = randomSuggestion;
    }
    
    // Popola aeroporti in base allo scenario di default
    const defaultScenario = scenarioSelect ? scenarioSelect.value : 'aviation_dawn';
    populateStartingAirports(defaultScenario);
    
    modal.classList.remove('hidden');
}

function hideNewGameModal() {
    const modal = document.getElementById('new-game-modal');
    modal.classList.add('hidden');
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
    
    // Verifica che il nome salvataggio non esista già
    const existingSaves = authManager.getUserSaves();
    if (existingSaves[saveName]) {
        showToast('Un salvataggio con questo nome esiste già', 'error');
        return;
    }
    
    showLoading('Creazione nuovo gioco...');
    
    // Simula creazione gioco
    setTimeout(function() {
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
    
    // FLUSSO CORRETTO: Prima sincronizza con server, poi localStorage
    if (!currentUser.isGuest) {
        // Utente autenticato: DEVE sincronizzare col server
        syncGameWithServer(saveName, gameData).then((serverData) => {
            console.log('✅ Gioco sincronizzato con il server');
            
            // Aggiorna il gameData con l'UUID reale della compagnia
            if (companyData.data && companyData.data.id) {
                gameData.company.id = companyData.data.id;
            }
            // Solo dopo il successo server, salva in localStorage
            const saveResult = authManager.saveGame(saveName, gameData);
            hideLoading();
            
            if (saveResult) {
                showToast('Nuovo gioco creato e sincronizzato!', 'success');
                hideNewGameModal();
                
                setTimeout(function() {
                    loadUserSaves();
                    startGame(saveName);
                }, 1000);
            } else {
                showToast('Errore localStorage dopo sincronizzazione server', 'error');
            }
            
        }).catch(error => {
            console.error('❌ Errore sincronizzazione server:', error);
            hideLoading();
            
            // NON CONTINUARE SE FALLISCE IL SERVER
            showToast(`Errore sincronizzazione server: ${error.message}. Riprova.`, 'error');
            
            // Mantieni il modal aperto per permettere di riprovare
            // NON salvare in localStorage se il server fallisce
        });
    } else {
        // Utente guest: solo localStorage
        const saveResult = authManager.saveGame(saveName, gameData);
        hideLoading();
        
        if (saveResult) {
            showToast('Nuovo gioco creato (modalità offline)!', 'success');
            hideNewGameModal();
            
            setTimeout(function() {
                loadUserSaves();
                startGame(saveName);
            }, 1000);
        } else {
            showToast('Errore durante la creazione del gioco', 'error');
        }
    }
}

// Funzione per sincronizzare il gioco con il server
async function syncGameWithServer(saveName, gameData) {
    try {
        const user = authManager.getCurrentUser();
        
        if (!user || !user.id) {
            throw new Error('Utente non valido per la sincronizzazione');
        }
        
        console.log('🔄 Inizio sincronizzazione con server...', {
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
        
        console.log('📊 Creazione compagnia sul server...', companyPayload);
        
        const companyResponse = await fetch('/api/game/companies/create-or-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token || 'no-token'}`
            },
            body: JSON.stringify(companyPayload)
        });
        
        console.log('📊 Risposta server compagnia:', companyResponse.status, companyResponse.statusText);
        
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
        
        console.log('✅ Compagnia creata/aggiornata:', companyData.data?.name || 'Nome non disponibile');
        
        // Aggiorna localStorage per retrocompatibilità (legacy)
        localStorage.setItem('air-tycoon-company-id', companyData.data.id);
        // Avvia il gioco passando l'UUID corretto
        if (typeof initializeGame === 'function') {
            initializeGame(companyData.data.id);
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

function loadSave(saveKey) {
    showLoading('Caricamento partita...');
    
    setTimeout(function() {
        startGame(saveKey);
    }, 1000);
}

function startGame(saveKey) {
    console.log('🎮 Avvio gioco con salvataggio:', saveKey);
    // Salva il salvataggio corrente nel sessionStorage per il gioco
    sessionStorage.setItem('currentSave', saveKey);
    // Recupera il companyId UUID dal salvataggio
    const saves = authManager.getUserSaves();
    const save = saves[saveKey];
    let companyId = null;
    if (save && save.data && save.data.company && save.data.company.id) {
        companyId = save.data.company.id;
    } else if (save && save.data && save.data.company_id) {
        companyId = save.data.company_id;
    } else if (save && save.company_id) {
        companyId = save.company_id;
    }
    if (!companyId) {
        showToast('Errore: companyId non trovato nel salvataggio selezionato', 'error');
        return;
    }
    // Propaga il companyId UUID per il main.js
    window.selectedCompanyId = companyId;
    sessionStorage.setItem('selectedCompanyId', companyId);
    // Reindirizza al gioco
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
    
    setTimeout(function() {
        const deleteResult = authManager.deleteSave(selectedSaveToDelete);
        
        hideLoading();
        hideDeleteModal();
        
        if (deleteResult) {
            showToast('Salvataggio eliminato con successo', 'success');
            loadUserSaves(); // Ricarica la lista
        } else {
            showToast('Errore durante l\'eliminazione', 'error');
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

console.log('✅ game-select.js caricato');
