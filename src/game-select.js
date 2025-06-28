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

function loadUserSaves() {
    const saves = authManager.getUserSaves();
    const savesContainer = document.getElementById('saves-container');
    const noSavesDiv = document.getElementById('no-saves');
    
    // Pulisci container
    savesContainer.innerHTML = '';
    
    const saveKeys = Object.keys(saves);
    
    if (saveKeys.length === 0) {
        // Nessun salvataggio
        savesContainer.style.display = 'none';
        noSavesDiv.classList.remove('hidden');
    } else {
        // Mostra salvataggi
        savesContainer.style.display = 'grid';
        noSavesDiv.classList.add('hidden');
        
        saveKeys.forEach(saveKey => {
            const save = saves[saveKey];
            const saveCard = createSaveCard(saveKey, save);
            savesContainer.appendChild(saveCard);
        });
    }
    
    console.log('📂 Caricati', saveKeys.length, 'salvataggi');
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

function populateStartingAirports() {
    const select = document.getElementById('starting-airport');
    
    if (!window.AirportData || !window.AirportData.airports) {
        console.warn('⚠️ AirportData non disponibile');
        return;
    }
    
    // Filtra solo aeroporti grandi per la partenza e ordina per traffico passeggeri
    const largeAirports = window.AirportData.airports
        .filter(airport => airport.size === 'large')
        .sort((a, b) => (b.passengerTraffic || 0) - (a.passengerTraffic || 0));
    
    select.innerHTML = '<option value="">Seleziona hub di partenza...</option>';
    
    largeAirports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.code;
        
        // Formato migliorato con traffico passeggeri
        const trafficFormatted = airport.passengerTraffic 
            ? `${(airport.passengerTraffic / 1000000).toFixed(1)}M pax/anno`
            : '';
        
        option.textContent = `${airport.name} (${airport.code}) - ${airport.city}, ${airport.country}`;
        if (trafficFormatted) {
            option.textContent += ` • ${trafficFormatted}`;
        }
        
        select.appendChild(option);
    });
    
    console.log('🏢 Caricati', largeAirports.length, 'aeroporti grandi disponibili per la partenza');
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
    
    // Validazione
    if (!saveName || !companyName || !startingAirport || !difficulty) {
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
        createNewGame(saveName, companyName, startingAirport, difficulty);
    }, 1500);
}

function createNewGame(saveName, companyName, startingAirport, difficulty) {
    // Crea dati iniziali del gioco
    const difficultySettings = {
        easy: { money: 5000000, reputation: 60 },
        normal: { money: 2000000, reputation: 50 },
        hard: { money: 1000000, reputation: 40 }
    };
    
    const settings = difficultySettings[difficulty];
    
    const gameData = {
        company: {
            name: companyName,
            money: settings.money,
            reputation: settings.reputation,
            headquarters: startingAirport
        },
        homeAirport: startingAirport,
        difficulty: difficulty,
        gameTime: {
            currentDate: new Date().toISOString(),
            gameSpeed: 1
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
        // Utente autenticato: sincronizza prima col server
        syncGameWithServer(saveName, gameData).then((serverData) => {
            console.log('✅ Gioco sincronizzato con il server');
            
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
                showToast('Gioco creato sul server ma errore localStorage', 'warning');
                hideNewGameModal();
                setTimeout(() => startGame(saveName), 1000);
            }
            
        }).catch(error => {
            console.error('❌ Errore sincronizzazione server:', error);
            hideLoading();
            
            // Fallback: salva solo in localStorage se il server fallisce
            const saveResult = authManager.saveGame(saveName, gameData);
            if (saveResult) {
                showToast('Gioco creato offline (errore server)', 'warning');
                hideNewGameModal();
                setTimeout(function() {
                    loadUserSaves();
                    startGame(saveName);
                }, 1000);
            } else {
                showToast('Errore durante la creazione del gioco', 'error');
            }
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
        
        // Prima crea o aggiorna la compagnia
        const companyPayload = {
            id: `${user.id}_${saveName}`, // ID univoco basato su user + save
            name: gameData.company.name,
            money: gameData.company.money,
            reputation: gameData.company.reputation,
            founded: gameData.gameTime.currentDate,
            base_airport: gameData.homeAirport
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
            const errorData = await companyResponse.text();
            throw new Error(`Errore creazione compagnia (${companyResponse.status}): ${errorData}`);
        }
        
        const companyData = await companyResponse.json();
        console.log('✅ Compagnia creata/aggiornata:', companyData.data?.name || 'Nome non disponibile');
        
        // Poi salva il gioco
        const savePayload = {
            company_id: companyData.data.id,
            save_name: saveName,
            game_data: gameData
        };
        
        console.log('💾 Salvataggio gioco sul server...', {
            company_id: savePayload.company_id,
            save_name: savePayload.save_name
        });
        
        const saveResponse = await fetch('/api/game/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token || 'no-token'}`
            },
            body: JSON.stringify(savePayload)
        });
        
        console.log('💾 Risposta server salvataggio:', saveResponse.status, saveResponse.statusText);
        
        if (!saveResponse.ok) {
            const errorData = await saveResponse.text();
            throw new Error(`Errore salvataggio (${saveResponse.status}): ${errorData}`);
        }
        
        const saveData = await saveResponse.json();
        console.log('✅ Gioco salvato sul server:', saveData.data?.save_name || 'Nome non disponibile');
        
        return {
            company: companyData,
            save: saveData
        };
        
    } catch (error) {
        console.error('❌ Errore sincronizzazione server:', error);
        console.error('Stack trace:', error.stack);
        throw error;
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
    
    // Auto hide after 4 seconds
    setTimeout(hideToast, 4000);
}

function hideToast() {
    const toast = document.getElementById('message-toast');
    toast.classList.add('hidden');
}

console.log('✅ game-select.js caricato');
