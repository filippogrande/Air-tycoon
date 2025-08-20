// Core utilities per Air Tycoon 2 Clone
// Consolidazione di tutte le utility necessarie per l'inizializzazione

// =====================================
// UTILITY DI BASE
// =====================================

function showError(message) {
    console.error('❌ Errore:', message);
    alert(message);
}

function checkBrowserCompatibility() {
    // Check per Promises
    if (typeof Promise === 'undefined') {
        console.error('❌ Browser non supporta Promises');
        return false;
    }
    // Check per fetch API
    if (typeof fetch === 'undefined') {
        console.error('❌ Browser non supporta Fetch API');
        return false;
    }
    // Check per localStorage
    if (typeof localStorage === 'undefined') {
        console.error('❌ Browser non supporta localStorage');
        return false;
    }
    // Check per requestAnimationFrame
    if (typeof requestAnimationFrame === 'undefined') {
        console.error('❌ Browser non supporta requestAnimationFrame');
        return false;
    }
    console.debug('✅ Browser compatibile');
    return true;
}

function fetchAndShowGameDate(companyId) {
    // Versione semplificata - imposta data corrente
    const gameDate = document.getElementById('game-date');
    if (gameDate) {
        const today = new Date();
        gameDate.textContent = today.toLocaleDateString('it-IT');
        console.debug('📅 Data gioco impostata:', today.toLocaleDateString('it-IT'));
    }
}

// =====================================
// GESTIONE COMPANY ID
// =====================================

function isValidCompanyId(id) {
    return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

function loadGameCompanyIdOrShowError(showError) {
    let companyId = sessionStorage.getItem('selectedCompanyId');
    
    // Se non c'è companyId, creane uno di default per test
    if (!companyId) {
        console.log('⚠️ Nessun companyId trovato, imposto default per test...');
        companyId = '2'; // Mosca Airlines dal database
        sessionStorage.setItem('selectedCompanyId', companyId);
        console.log('✅ CompanyId test impostato: 2 (Mosca Airlines)');
    }
    
    if (!isValidCompanyId(companyId)) {
        showError('Errore: companyId non valido. Seleziona una compagnia valida dalla schermata di selezione partita.');
        return null;
    }
    
    return companyId;
}

// =====================================
// CARICAMENTO DATI DA API
// =====================================

function loadCoreDataAndStartGame(companyId, initCallback) {
    console.debug('📡 Caricamento dati core da API...');
    
    // Carica AircraftData
    fetch('/api/game/aircraft-data')
        .then(r => r.json())
        .then(aircraftData => {
            window.AircraftData = aircraftData;
            console.debug('✅ AircraftData caricato:', Object.keys(aircraftData).length + ' tipi');
            
            // Esegui callback di inizializzazione
            if (initCallback && typeof initCallback === 'function') {
                initCallback(companyId);
            }
        })
        .catch(err => {
            console.error('❌ Errore nel caricamento AircraftData:', err);
            showError('Errore nel caricamento dei dati di gioco (Aircraft). Riprova.');
        });
}

// =====================================
// INIZIALIZZAZIONE SEMPLIFICATA
// =====================================

function initializeGameSimple(companyId) {
    console.debug('🎯 Inizializzazione game semplificata con companyId:', companyId);
    
    // Verifica che tutte le classi siano caricate
    const requiredClasses = [
        'GameState', 'Aircraft', 'Airport', 'Route', 
        'FleetManager', 'RouteManager', 'FinanceManager',
        'UIManager', 'WorldMap', 'SaveLoad', 'Game'
    ];
    
    const missingClasses = requiredClasses.filter(className => typeof window[className] === 'undefined');
    
    if (missingClasses.length > 0) {
        console.error('❌ Classi mancanti:', missingClasses);
        showError(`Errore: classi non caricate: ${missingClasses.join(', ')}`);
        return;
    }
    
    if (!window.AircraftData) {
        console.error('❌ AircraftData non caricato');
        showError('Errore: dati fondamentali non caricati: AircraftData');
        return;
    }
    
    // Verifica compatibilità browser
    if (!checkBrowserCompatibility()) {
        showError('Il tuo browser non supporta tutte le funzionalità richieste dal gioco.');
        return;
    }
    
    // Verifica companyId
    if (!companyId || !/^[0-9]+$/.test(companyId)) {
        showError('Errore: companyId mancante o non valido.');
        return;
    }
    
    const companyIdNum = Number(companyId);
    
    // Crea il game object
    try {
        console.debug('🎮 Creazione istanza Game...');
        const game = new Game(companyIdNum);
        window.game = game;
        console.debug('✅ Game creato e assegnato a window.game');
        
        // Setup eventi globali
        setupGlobalEventHandlers();
        
        // Setup UI events
        setupBasicUIEvents();
        
        // Setup game menu se disponibile
        if (typeof setupGameMenuEvents === 'function') {
            setupGameMenuEvents(game);
        }
        
        console.debug('🎉 Inizializzazione completata con successo!');
        
    } catch (error) {
        console.error('❌ Errore durante inizializzazione del gioco:', error);
        console.error('❌ Stack trace:', error.stack);
        showError('Errore durante l\'avvio del gioco. Controlla la console per dettagli.');
    }
}

function setupGlobalEventHandlers() {
    window.addEventListener('error', function(event) {
        console.error('❌ Errore globale:', event.error);
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        console.error('❌ Promise rigettata:', event.reason);
        event.preventDefault();
    });
    
    window.addEventListener('resize', function() {
        if (window.game && window.game.uiManager && window.game.uiManager.handleResize) {
            window.game.uiManager.handleResize();
        }
        
        if (window.game && window.game.worldMap && window.game.worldMap.setupCanvasSize) {
            window.game.worldMap.setupCanvasSize();
            window.game.worldMap.render();
        }
    });
    
    console.debug('✅ Event handler globali configurati');
}

function setupBasicUIEvents() {
    // Setup settings overlay se disponibile
    if (typeof setupSettingsOverlay === 'function') {
        setupSettingsOverlay();
    }
    
    console.debug('✅ UI events di base configurati');
}

// =====================================
// ESPORTAZIONE GLOBALE
// =====================================

// Attach tutte le funzioni a window per compatibilità
window.showError = showError;
window.checkBrowserCompatibility = checkBrowserCompatibility;
window.fetchAndShowGameDate = fetchAndShowGameDate;
window.isValidCompanyId = isValidCompanyId;
window.loadGameCompanyIdOrShowError = loadGameCompanyIdOrShowError;
window.loadCoreDataAndStartGame = loadCoreDataAndStartGame;
window.initializeGameSimple = initializeGameSimple;
window.setupGlobalEventHandlers = setupGlobalEventHandlers;
window.setupBasicUIEvents = setupBasicUIEvents;

console.debug('✅ Core utilities caricate e disponibili globalmente');
