// File principale - Avvio del gioco Air Tycoon 2 Clone

// Polyfill per compatibilità browser
(function() {
    // Polyfill per requestAnimationFrame
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = 
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
    }
    
    // Polyfill per cancelAnimationFrame
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = 
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            function(id) {
                clearTimeout(id);
            };
    }
    
    // Polyfill per fetch (base, per browser molto vecchi)
    if (!window.fetch) {
        console.warn('Fetch API non supportata, considera l\'aggiunta di un polyfill completo');
    }
})();

let game;

// Inizializzazione del gioco quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛫 Air Tycoon 2 Clone - Avvio in corso...');
    // Aspetta che Leaflet sia caricato
    function waitForLeaflet(callback) {
        if (typeof L !== 'undefined') {
            callback();
        } else {
            console.log('⏳ Attendo caricamento Leaflet...');
            setTimeout(function() { waitForLeaflet(callback); }, 100);
        }
    }

    // Nuova funzione: carica dati fondamentali via API
    function loadCoreDataAndStartGame(companyId) {
        // Controlla se AircraftData è già caricato (dati temporanei)
        if (window.AircraftData) {
            console.log('✅ AircraftData già disponibile (dati temporanei)');
            initializeGame(companyId);
            return;
        }
        
        // Carica solo AircraftData via API se non già presente
        fetch('/api/game/aircraft-data').then(r => r.json())
            .then(aircraftData => {
                window.AircraftData = aircraftData;
                console.log('✅ AircraftData caricato via API');
                initializeGame(companyId);
            })
            .catch(err => {
                console.error('❌ Errore nel caricamento dati fondamentali:', err);
                showError('Errore nel caricamento dei dati di gioco (Aircraft). Riprova.');
            });
    }

    waitForLeaflet(function() {
        console.log('✅ Leaflet caricato');
        const companyId = loadGameCompanyIdOrShowError(showError);
        if (!companyId) return;
        // Mostra la data di gioco nell'header
        fetchAndShowGameDate(companyId);
        loadCoreDataAndStartGame(companyId);
    });
});


function initializeGame(companyId) {
    // Debug: verifica che tutte le classi siano caricate
    const requiredClasses = [
        'GameState', 'Aircraft', 'Airport', 'Route', 
        'FleetManager', 'RouteManager', 'FinanceManager',
        'UIManager', 'WorldMap', 'SaveLoad', 'Game'
    ];
    const missingClasses = requiredClasses.filter(className => !window[className]);
    // Verifica solo che AircraftData sia caricato (AirportData ora è gestito in WorldMap)
    if (!window.AircraftData) {
        console.error('❌ Dati fondamentali mancanti:', ['AircraftData']);
        showError('Errore: dati fondamentali non caricati: AircraftData');
        return;
    }
    if (missingClasses.length > 0) {
        console.error('❌ Classi mancanti:', missingClasses);
        showError(`Errore: classi non caricate: ${missingClasses.join(', ')}`);
        return;
    }
    console.log('✅ Tutte le classi e i dati fondamentali sono caricati');
    // Verifica compatibilità browser
    if (!checkBrowserCompatibility()) {
        showError('Il tuo browser non supporta tutte le funzionalità richieste dal gioco.');
        return;
    }
    console.log('✅ Browser compatibile');
    // Verifica presenza e validità companyId
    if (!companyId || !/^[0-9]+$/.test(companyId)) {
        showError('Errore: companyId mancante o non valido. Impossibile avviare il gioco senza un identificativo compagnia valido.');
        return;
    }
    // Conversione companyId a numero
    const companyIdNum = Number(companyId);
    // Inizializza il gioco
    try {
        console.log('🎮 Creazione istanza Game...');
        game = new Game(companyIdNum);
        window.game = game;
        console.log('✅ Game creato');
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('resize', handleWindowResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        console.log('✅ Event listeners configurati');
        // Mostra messaggio di benvenuto
        showWelcomeMessage();
        // Setup eventi UI
        setupUIEvents();
        // Setup eventi del menu di gioco dopo che il game è inizializzato
        setupGameMenuEvents();
        console.log('✅ Gioco avviato con successo!');
    } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione del gioco:', error);
        console.error('❌ Stack trace:', error.stack);
        showError('Errore durante l\'avvio del gioco. Controlla la console per dettagli. Ricarica la pagina per riprovare.');
    }
}

// Gestione errori globali
function handleGlobalError(event) {
    console.error('❌ Errore globale:', event.error);
    // Mostra notifica all'utente
    showError('Si è verificato un errore.');
}

// Gestione promise rigettate
function handleUnhandledRejection(event) {
    console.error('❌ Promise rigettata:', event.reason);
    event.preventDefault(); // Previene il logging automatico nel console
}

// Gestione resize della finestra
function handleWindowResize() {
    if (game && game.uiManager && game.uiManager.handleResize) {
        game.uiManager.handleResize();
    }
    
    if (game && game.worldMap && game.worldMap.setupCanvasSize) {
        game.worldMap.setupCanvasSize();
        game.worldMap.render();
    }
}

// Gestione cambio visibilità pagina
function handleVisibilityChange() {
    if (!game) return;
    
    if (document.hidden) {
        // Pagina nascosta - pausa il gioco
        if (game.pause) {
            game.pause();
        }
        console.log('⏸️ Gioco in pausa (pagina nascosta)');
    } else {
        // Pagina visibile - riprendi il gioco
        if (game.start) {
            game.start();
        }
        console.log('▶️ Gioco ripreso (pagina visibile)');
    }
}

// Gestione chiusura pagina
function handleBeforeUnload(event) {
    // Mostra conferma solo se ci sono modifiche non salvate
    if (game && game.state && hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
        return event.returnValue;
    }
}

// Verifica se ci sono modifiche non salvate
function hasUnsavedChanges() {
    // Per ora assumiamo che non ci siano modifiche non salvate
    // In futuro si potrebbe implementare un sistema di tracking delle modifiche
    return false;
}

// Mostra messaggio di benvenuto
function showWelcomeMessage() {
    // Mostra sempre il messaggio di benvenuto (nessun controllo salvataggio)
    setTimeout(() => {
        if (game && game.uiManager && game.uiManager.showNotification) {
            game.uiManager.showNotification(
                '🎉 Benvenuto in Air Tycoon 2 Clone! Inizia acquistando il tuo primo aeromobile.',
                'info'
            );
        }
    }, 2000);
}

// Debug: Espone oggetti globali per testing (solo in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugGame = () => game;
    window.debugAircraftData = window.AircraftData || null;
    window.debugAirportData = window.AirportData || null;
    window.debugSaveLoad = SaveLoad;
    
    console.log('🐛 Modalità debug attiva. Usa window.debugGame() per accedere al gioco.');
}

// Funzioni di utilità globali
window.gameUtils = {
    // Cambia velocità gioco
    setGameSpeed: function(speed) {
        if (game && game.setGameSpeed) {
            game.setGameSpeed(speed);
        }
    },
    
    // Ottieni statistiche di gioco
    getGameStats: function() {
        if (game && game.fleetManager && game.routeManager && game.financeManager) {
            return {
                fleet: game.fleetManager.getFleetStatistics(),
                routes: game.routeManager.getRouteStatistics(),
                finances: game.financeManager.getFinancialStatistics()
            };
        }
        return null;
    }
};

// Comandi da console per facilitare il debug
console.log(`
🛫 Air Tycoon 2 Clone
Comandi disponibili:
- gameUtils.setGameSpeed(x) - Cambia velocità (0.1-10)
- gameUtils.getGameStats() - Statistiche di gioco
`);

// Inizializzazione completata
console.log('🎮 Sistema di gioco caricato e pronto!');

// Setup eventi del menu di gioco
function setupGameMenuEvents() {
    console.log('🎮 Setup eventi menu di gioco...');
    
    // Apri menu di gioco
    var gameMenuBtn = document.getElementById('game-menu-btn');
    var gameMenuModal = document.getElementById('game-menu-modal');
    var closeGameMenuBtn = document.getElementById('close-game-menu');
    
    if (gameMenuBtn && gameMenuModal) {
        gameMenuBtn.addEventListener('click', function() {
            console.log('📋 Apertura menu di gioco');
            updateGameMenuInfo();
            uiUtils.showModal('game-menu-modal');
        });
    }
    
    if (closeGameMenuBtn && gameMenuModal) {
        closeGameMenuBtn.addEventListener('click', function() {
            uiUtils.hideModal('game-menu-modal');
        });
    }
    
    // Salva e continua
    var saveAndContinueBtn = document.getElementById('save-and-continue');
    if (saveAndContinueBtn) {
        saveAndContinueBtn.addEventListener('click', function() {
            console.log('💾 Salvataggio partita...');
            if (game && game.saveGame) {
                try {
                    game.saveGame();
                    alert('✅ Partita salvata con successo!');
                    uiUtils.hideModal('game-menu-modal');
                } catch (error) {
                    console.error('❌ Errore nel salvataggio:', error);
                    alert('❌ Errore nel salvataggio: ' + error.message);
                }
            }
        });
    }
    
    // Torna alla selezione giochi
    var returnToGameSelectBtn = document.getElementById('return-to-game-select');
    if (returnToGameSelectBtn) {
        returnToGameSelectBtn.addEventListener('click', function() {
            console.log('🔙 Ritorno alla selezione giochi...');
            if (confirm('Vuoi davvero tornare alla selezione dei giochi? Assicurati di aver salvato la partita.')) {
                // Salva automaticamente prima di uscire
                if (game && game.saveGame) {
                    try {
                        game.saveGame();
                        console.log('💾 Partita salvata automaticamente prima dell\'uscita');
                    } catch (error) {
                        console.warn('⚠️ Errore nel salvataggio automatico:', error);
                    }
                }
                // Pulisci solo i dati di gioco, NON il login
                try {
                    // Esempio: rimuovi solo chiavi specifiche (companyId, save, ecc.)
                    localStorage.removeItem('companyId');
                    localStorage.removeItem('gameState');
                    localStorage.removeItem('currentSave');
                    sessionStorage.removeItem('companyId');
                    sessionStorage.removeItem('gameState');
                    sessionStorage.removeItem('currentSave');
                    console.log('🧹 Dati di gioco rimossi, login preservato');
                } catch (e) {
                    console.warn('⚠️ Errore pulizia dati di gioco:', e);
                }
                window.location.href = '/game/game/select.html';
            }
        });
    }
    
    // Impostazioni (placeholder)
    var gameSettingsBtn = document.getElementById('game-settings');
    if (gameSettingsBtn) {
        gameSettingsBtn.addEventListener('click', function() {
            alert('⚙️ Funzionalità impostazioni in sviluppo');
        });
    }
    
    // Logout
    var logoutFromGameBtn = document.getElementById('logout-from-game');
    if (logoutFromGameBtn) {
        logoutFromGameBtn.addEventListener('click', function() {
            console.log('🚪 Logout dal gioco...');
            if (confirm('Vuoi davvero fare il logout? Assicurati di aver salvato la partita.')) {
                // Pulisci tutti i dati locali (localStorage, sessionStorage)
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('🧹 Dati locali eliminati');
                } catch (e) {
                    console.warn('⚠️ Errore pulizia storage:', e);
                }
                // Effettua logout
                var authManager = new AuthManager();
                authManager.logout();
                window.location.href = 'auth.html';
            }
        });
    }
    
    // Gestione salvataggio rapido
    var saveGameBtn = document.getElementById('save-game-btn');
    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', function() {
            console.log('💾 Salvataggio rapido...');
            if (game && game.saveGame) {
                try {
                    game.saveGame();
                    // Mostra feedback visivo temporaneo
                    saveGameBtn.textContent = '✅ Salvato!';
                    saveGameBtn.style.background = '#2ecc71';
                    setTimeout(function() {
                        saveGameBtn.textContent = '💾 Salva';
                        saveGameBtn.style.background = '';
                    }, 2000);
                } catch (error) {
                    console.error('❌ Errore nel salvataggio rapido:', error);
                    saveGameBtn.textContent = '❌ Errore';
                    saveGameBtn.style.background = '#e74c3c';
                    setTimeout(function() {
                        saveGameBtn.textContent = '💾 Salva';
                        saveGameBtn.style.background = '';
                    }, 2000);
                }
            }
        });
    }
    
    // Gestione pausa
    var pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (game) {
                if (game.isPaused) {
                    game.resume();
                    pauseBtn.textContent = '⏸️ Pausa';
                    console.log('▶️ Gioco ripreso');
                } else {
                    game.pause();
                    pauseBtn.textContent = '▶️ Riprendi';
                    console.log('⏸️ Gioco in pausa');
                }
            }
        });
    }
    
    console.log('✅ Eventi menu di gioco configurati');
}

// Aggiorna informazioni nel menu di gioco
function updateGameMenuInfo() {
    console.log('📊 Aggiornamento info menu di gioco...');
    
    try {
        var authManager = new AuthManager();
        var currentUser = authManager.getCurrentUser();
        var currentSave = authManager.getCurrentSave();
        
        // Nome del salvataggio
        var saveNameEl = document.getElementById('current-save-name');
        if (saveNameEl) {
            saveNameEl.textContent = currentSave ? currentSave.name : 'Nessun salvataggio';
        }
        
        // Nome compagnia
        var companyNameEl = document.getElementById('current-company-name');
        if (companyNameEl && game && game.state) {
            companyNameEl.textContent = game.state.company.name || 'Sconosciuta';
        }
        
        // Tempo di gioco (placeholder)
        var playTimeEl = document.getElementById('play-time');
        if (playTimeEl) {
            // Calcola tempo dalla data di creazione del salvataggio se disponibile
            if (currentSave && currentSave.metadata && currentSave.metadata.createdAt) {
                var startTime = new Date(currentSave.metadata.createdAt);
                var now = new Date();
                var playTime = Math.round((now - startTime) / (1000 * 60)); // minuti
                
                if (playTime < 60) {
                    playTimeEl.textContent = playTime + ' minuti';
                } else {
                    var hours = Math.floor(playTime / 60);
                    var minutes = playTime % 60;
                    playTimeEl.textContent = hours + 'h ' + minutes + 'm';
                }
            } else {
                playTimeEl.textContent = 'N/A';
            }
        }
        
        // Ultimo salvataggio
        var lastSaveEl = document.getElementById('last-save-time');
        if (lastSaveEl) {
            if (currentSave && currentSave.metadata && currentSave.metadata.lastSaved) {
                var lastSave = new Date(currentSave.metadata.lastSaved);
                lastSaveEl.textContent = lastSave.toLocaleString('it-IT');
            } else {
                lastSaveEl.textContent = 'Mai salvato';
            }
        }
        
    } catch (error) {
        console.error('❌ Errore aggiornamento info menu:', error);
    }
}

// Gestione eventi UI
function setupUIEvents() {
    console.log('🔧 Setup eventi UI base...');
    
    // Setup tab navigation
    setupTabNavigation();
    
    // Gestione resize finestra
    window.addEventListener('resize', function() {
        if (game && game.worldMap && game.worldMap.map) {
            // Invalida la dimensione della mappa per Leaflet
            setTimeout(function() {
                game.worldMap.map.invalidateSize();
            }, 100);
        }
    });
    
    // Gestione tasti di scelta rapida
    document.addEventListener('keydown', function(e) {
        // ESC per aprire/chiudere menu
        if (e.key === 'Escape') {
            toggleGameMenu();
        }
        
        // Salvataggio rapido con Ctrl+S
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (game) {
                game.saveGame();
                showNotification('Gioco salvato!', 'success');
            }
        }
    });
    
    console.log('✅ Eventi UI base configurati');
}

// Setup navigazione tra tab
function setupTabNavigation() {
    console.log('🏷️ Setup navigazione tab...');
    
    if (window._tabNavigationBound) {
        console.debug('🏷️ Navigazione tab già configurata, skip');
        return;
    }
    
    var tabButtons = document.querySelectorAll('.menu-btn[data-tab]');
    var tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.warn('⚠️ Tab buttons o content non trovati');
        return;
    }
    
    // Aggiungi event listener a ogni pulsante tab
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var targetTab = this.getAttribute('data-tab');
            if (targetTab) {
                switchToTab(targetTab);
            }
        });
    });
    
    window._tabNavigationBound = true;
    
    console.log('✅ Navigazione tab configurata');
}

// Cambia tab attivo
function switchToTab(tabName) {
    console.log('🔄 Cambio a tab:', tabName);
    
    // Rimuovi classe active da tutti i pulsanti e contenuti
    var allButtons = document.querySelectorAll('.menu-btn[data-tab]');
    var allContents = document.querySelectorAll('.tab-content');
    
    allButtons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    allContents.forEach(function(content) {
        content.classList.remove('active');
    });
    
    // Aggiungi classe active al pulsante selezionato
    var targetButton = document.querySelector('.menu-btn[data-tab="' + tabName + '"]');
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Aggiungi classe active al contenuto selezionato
    var targetContent = document.getElementById(tabName + '-tab');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Gestisci azioni specifiche per tab
    handleTabSwitch(tabName);
}

// Ottieni il tab attualmente attivo
function getCurrentActiveTab() {
    var activeButton = document.querySelector('.menu-btn[data-tab].active');
    if (activeButton) {
        return activeButton.getAttribute('data-tab');
    }
    return 'world'; // Default fallback
}

// Funzione helper per aprire un tab specifico (utilizzabile da altri moduli)
window.switchToTab = switchToTab;
window.getCurrentActiveTab = getCurrentActiveTab;

// Gestisce azioni specifiche quando si cambia tab
function handleTabSwitch(tabName) {
    if (!game) {
        console.warn('⚠️ Game non disponibile per gestione tab switch');
        return;
    }
    
    switch(tabName) {
        case 'world':
            // Assicurati che la mappa sia ridimensionata correttamente
            if (game.worldMap && game.worldMap.map) {
                setTimeout(function() {
                    game.worldMap.map.invalidateSize();
                }, 100);
            }
            break;
            
        case 'fleet':
            // Aggiorna UI della flotta
            if (game.uiManager && game.uiManager.updateFleetUI) {
                game.uiManager.updateFleetUI();
            }
            break;
            
        case 'routes':
            // Aggiorna UI delle rotte
            if (game.routeUIManager && game.routeUIManager.updateRoutesList) {
                game.routeUIManager.updateRoutesList();
            }
            break;
            
        case 'finances':
            // Aggiorna UI finanze
            if (game.uiManager && game.uiManager.updateFinanceUI) {
                game.uiManager.updateFinanceUI();
            }
            break;
            
        case 'infrastructure':
            // Aggiorna UI infrastrutture
            if (game.uiManager && game.uiManager.updateInfrastructureUI) {
                console.log('🏗️ Aggiornamento UI infrastrutture...');
                game.uiManager.updateInfrastructureUI();
            } else {
                console.warn('⚠️ updateInfrastructureUI non disponibile');
            }
            break;
            
        case 'research':
            // Aggiorna UI ricerca (placeholder per futuro sviluppo)
            console.log('🔬 Tab ricerca - funzionalità in sviluppo');
            break;
            
        default:
            console.log('📋 Tab sconosciuto:', tabName);
    }
}




// Inizializzazione completata
console.log('🎮 Sistema di gioco caricato e pronto!');

// Setup eventi del menu di gioco
function setupGameMenuEvents() {
    console.log('🎮 Setup eventi menu di gioco...');
    
    // Apri menu di gioco
    var gameMenuBtn = document.getElementById('game-menu-btn');
    var gameMenuModal = document.getElementById('game-menu-modal');
    var closeGameMenuBtn = document.getElementById('close-game-menu');
    
    if (gameMenuBtn && gameMenuModal) {
        gameMenuBtn.addEventListener('click', function() {
            console.log('📋 Apertura menu di gioco');
            updateGameMenuInfo();
            uiUtils.showModal('game-menu-modal');
        });
    }
    
    if (closeGameMenuBtn && gameMenuModal) {
        closeGameMenuBtn.addEventListener('click', function() {
            uiUtils.hideModal('game-menu-modal');
        });
    }
    
    // Salva e continua
    var saveAndContinueBtn = document.getElementById('save-and-continue');
    if (saveAndContinueBtn) {
        saveAndContinueBtn.addEventListener('click', function() {
            console.log('💾 Salvataggio partita...');
            if (game && game.saveGame) {
                try {
                    game.saveGame();
                    alert('✅ Partita salvata con successo!');
                    uiUtils.hideModal('game-menu-modal');
                } catch (error) {
                    console.error('❌ Errore nel salvataggio:', error);
                    alert('❌ Errore nel salvataggio: ' + error.message);
                }
            }
        });
    }
    
    // Torna alla selezione giochi
    var returnToGameSelectBtn = document.getElementById('return-to-game-select');
    if (returnToGameSelectBtn) {
        returnToGameSelectBtn.addEventListener('click', function() {
            console.log('🔙 Ritorno alla selezione giochi...');
            if (confirm('Vuoi davvero tornare alla selezione dei giochi? Assicurati di aver salvato la partita.')) {
                // Pulisci solo i dati di gioco, NON il login
                try {
                    // Esempio: rimuovi solo chiavi specifiche (companyId, save, ecc.)
                    localStorage.removeItem('companyId');
                    localStorage.removeItem('gameState');
                    localStorage.removeItem('currentSave');
                    sessionStorage.removeItem('companyId');
                    sessionStorage.removeItem('gameState');
                    sessionStorage.removeItem('currentSave');
                    console.log('🧹 Dati di gioco rimossi, login preservato');
                } catch (e) {
                    console.warn('⚠️ Errore pulizia dati di gioco:', e);
                }
                window.location.href = '/game/game/select.html';
            }
        });
    }
    
    // Impostazioni (placeholder)
    var gameSettingsBtn = document.getElementById('game-settings');
    if (gameSettingsBtn) {
        gameSettingsBtn.addEventListener('click', function() {
            alert('⚙️ Funzionalità impostazioni in sviluppo');
        });
    }
    
    // Logout
    var logoutFromGameBtn = document.getElementById('logout-from-game');
    if (logoutFromGameBtn) {
        logoutFromGameBtn.addEventListener('click', function() {
            console.log('🚪 Logout dal gioco...');
            if (confirm('Vuoi davvero fare il logout? Assicurati di aver salvato la partita.')) {
                // Pulisci tutti i dati locali (localStorage, sessionStorage)
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('🧹 Dati locali eliminati');
                } catch (e) {
                    console.warn('⚠️ Errore pulizia storage:', e);
                }
                // Effettua logout
                var authManager = new AuthManager();
                authManager.logout();
                window.location.href = 'auth.html';
            }
        });
    }
    
    // Gestione salvataggio rapido
    var saveGameBtn = document.getElementById('save-game-btn');
    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', function() {
            console.log('💾 Salvataggio rapido...');
            if (game && game.saveGame) {
                try {
                    game.saveGame();
                    // Mostra feedback visivo temporaneo
                    saveGameBtn.textContent = '✅ Salvato!';
                    saveGameBtn.style.background = '#2ecc71';
                    setTimeout(function() {
                        saveGameBtn.textContent = '💾 Salva';
                        saveGameBtn.style.background = '';
                    }, 2000);
                } catch (error) {
                    console.error('❌ Errore nel salvataggio rapido:', error);
                    saveGameBtn.textContent = '❌ Errore';
                    saveGameBtn.style.background = '#e74c3c';
                    setTimeout(function() {
                        saveGameBtn.textContent = '💾 Salva';
                        saveGameBtn.style.background = '';
                    }, 2000);
                }
            }
        });
    }
    
    // Gestione pausa
    var pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (game) {
                if (game.isPaused) {
                    game.resume();
                    pauseBtn.textContent = '⏸️ Pausa';
                    console.log('▶️ Gioco ripreso');
                } else {
                    game.pause();
                    pauseBtn.textContent = '▶️ Riprendi';
                    console.log('⏸️ Gioco in pausa');
                }
            }
        });
    }
    
    console.log('✅ Eventi menu di gioco configurati');
}

// Aggiorna informazioni nel menu di gioco
function updateGameMenuInfo() {
    console.log('📊 Aggiornamento info menu di gioco...');
    
    try {
        var authManager = new AuthManager();
        var currentUser = authManager.getCurrentUser();
        var currentSave = authManager.getCurrentSave();
        
        // Nome del salvataggio
        var saveNameEl = document.getElementById('current-save-name');
        if (saveNameEl) {
            saveNameEl.textContent = currentSave ? currentSave.name : 'Nessun salvataggio';
        }
        
        // Nome compagnia
        var companyNameEl = document.getElementById('current-company-name');
        if (companyNameEl && game && game.state) {
            companyNameEl.textContent = game.state.company.name || 'Sconosciuta';
        }
        
        // Tempo di gioco (placeholder)
        var playTimeEl = document.getElementById('play-time');
        if (playTimeEl) {
            // Calcola tempo dalla data di creazione del salvataggio se disponibile
            if (currentSave && currentSave.metadata && currentSave.metadata.createdAt) {
                var startTime = new Date(currentSave.metadata.createdAt);
                var now = new Date();
                var playTime = Math.round((now - startTime) / (1000 * 60)); // minuti
                
                if (playTime < 60) {
                    playTimeEl.textContent = playTime + ' minuti';
                } else {
                    var hours = Math.floor(playTime / 60);
                    var minutes = playTime % 60;
                    playTimeEl.textContent = hours + 'h ' + minutes + 'm';
                }
            } else {
                playTimeEl.textContent = 'N/A';
            }
        }
        
        // Ultimo salvataggio
        var lastSaveEl = document.getElementById('last-save-time');
        if (lastSaveEl) {
            if (currentSave && currentSave.metadata && currentSave.metadata.lastSaved) {
                var lastSave = new Date(currentSave.metadata.lastSaved);
                lastSaveEl.textContent = lastSave.toLocaleString('it-IT');
            } else {
                lastSaveEl.textContent = 'Mai salvato';
            }
        }
        
    } catch (error) {
        console.error('❌ Errore aggiornamento info menu:', error);
    }
}

// Gestione eventi UI
function setupUIEvents() {
    console.log('🔧 Setup eventi UI base...');
    
    // Setup tab navigation
    setupTabNavigation();
    
    // Gestione resize finestra
    window.addEventListener('resize', function() {
        if (game && game.worldMap && game.worldMap.map) {
            // Invalida la dimensione della mappa per Leaflet
            setTimeout(function() {
                game.worldMap.map.invalidateSize();
            }, 100);
        }
    });
    
    // Gestione tasti di scelta rapida
    document.addEventListener('keydown', function(e) {
        // ESC per aprire/chiudere menu
        if (e.key === 'Escape') {
            toggleGameMenu();
        }
        
        // Salvataggio rapido con Ctrl+S
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (game) {
                game.saveGame();
                showNotification('Gioco salvato!', 'success');
            }
        }
    });
    
    console.log('✅ Eventi UI base configurati');
}

// Setup navigazione tra tab
function setupTabNavigation() {
    console.log('🏷️ Setup navigazione tab...');
    
    var tabButtons = document.querySelectorAll('.menu-btn[data-tab]');
    var tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.warn('⚠️ Tab buttons o content non trovati');
        return;
    }
    
    // Aggiungi event listener a ogni pulsante tab
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var targetTab = this.getAttribute('data-tab');
            if (targetTab) {
                switchToTab(targetTab);
            }
        });
    });
    
    console.log('✅ Navigazione tab configurata');
}

// Cambia tab attivo
function switchToTab(tabName) {
    console.log('🔄 Cambio a tab:', tabName);
    
    // Rimuovi classe active da tutti i pulsanti e contenuti
    var allButtons = document.querySelectorAll('.menu-btn[data-tab]');
    var allContents = document.querySelectorAll('.tab-content');
    
    allButtons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    allContents.forEach(function(content) {
        content.classList.remove('active');
    });
    
    // Aggiungi classe active al pulsante selezionato
    var targetButton = document.querySelector('.menu-btn[data-tab="' + tabName + '"]');
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Aggiungi classe active al contenuto selezionato
    var targetContent = document.getElementById(tabName + '-tab');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Gestisci azioni specifiche per tab
    handleTabSwitch(tabName);
}

// Ottieni il tab attualmente attivo
function getCurrentActiveTab() {
    var activeButton = document.querySelector('.menu-btn[data-tab].active');
    if (activeButton) {
        return activeButton.getAttribute('data-tab');
    }
    return 'world'; // Default fallback
}

// Funzione helper per aprire un tab specifico (utilizzabile da altri moduli)
window.switchToTab = switchToTab;
window.getCurrentActiveTab = getCurrentActiveTab;

// Gestisce azioni specifiche quando si cambia tab
function handleTabSwitch(tabName) {
    if (!game) {
        console.warn('⚠️ Game non disponibile per gestione tab switch');
        return;
    }
    
    switch(tabName) {
        case 'world':
            // Assicurati che la mappa sia ridimensionata correttamente
            if (game.worldMap && game.worldMap.map) {
                setTimeout(function() {
                    game.worldMap.map.invalidateSize();
                }, 100);
            }
            break;
            
        case 'fleet':
            // Aggiorna UI della flotta
            if (game.uiManager && game.uiManager.updateFleetUI) {
                game.uiManager.updateFleetUI();
            }
            break;
            
        case 'routes':
            // Aggiorna UI delle rotte
            if (game.routeUIManager && game.routeUIManager.updateRoutesList) {
                game.routeUIManager.updateRoutesList();
            }
            break;
            
        case 'finances':
            // Aggiorna UI finanze
            if (game.uiManager && game.uiManager.updateFinanceUI) {
                game.uiManager.updateFinanceUI();
            }
            break;
            
        case 'infrastructure':
            // Aggiorna UI infrastrutture
            if (game.uiManager && game.uiManager.updateInfrastructureUI) {
                console.log('🏗️ Aggiornamento UI infrastrutture...');
                game.uiManager.updateInfrastructureUI();
            } else {
                console.warn('⚠️ updateInfrastructureUI non disponibile');
            }
            break;
            
        case 'research':
            // Aggiorna UI ricerca (placeholder per futuro sviluppo)
            console.log('🔬 Tab ricerca - funzionalità in sviluppo');
            break;
            
        default:
            console.log('📋 Tab sconosciuto:', tabName);
    }
}
