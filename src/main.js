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
        Promise.all([
            fetch('/api/game/aircraft-data').then(r => r.json()),
            fetch('/api/game/airport-data').then(r => r.json())
        ]).then(([aircraftData, airportData]) => {
            window.AircraftData = aircraftData;
            window.AirportData = airportData;
            console.log('✅ AircraftData e AirportData caricati via API');
            initializeGame(companyId);
        }).catch(err => {
            console.error('❌ Errore nel caricamento dati fondamentali:', err);
            showError('Errore nel caricamento dei dati di gioco (Aircraft/Airport). Riprova.');
        });
    }

    waitForLeaflet(function() {
        console.log('✅ Leaflet caricato');
        const companyId = loadGameCompanyIdOrShowError(showError);
console.log('[DEBUG] companyId restituito da loadGameCompanyIdOrShowError:', companyId, typeof companyId);
        if (!companyId) return;
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
    // Verifica anche che i dati fondamentali siano caricati
    if (!window.AircraftData || !window.AirportData) {
        console.error('❌ Dati fondamentali mancanti:', [!window.AircraftData && 'AircraftData', !window.AirportData && 'AirportData'].filter(Boolean));
        showError('Errore: dati fondamentali non caricati: ' + [!window.AircraftData && 'AircraftData', !window.AirportData && 'AirportData'].filter(Boolean).join(', '));
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
    if (!companyId || !/^\d+$/.test(companyId)) {
    showError('Errore: companyId mancante o non valido. Impossibile avviare il gioco senza un identificativo compagnia valido.');
    return;
}
    // Inizializza il gioco
    try {
        console.log('🎮 Creazione istanza Game...');
        game = new Game(companyId);
        // Rendi il gioco disponibile globalmente per l'UI
        window.game = game;
        console.log('✅ Game creato');
        
        // Gestione errori globali
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
        // Gestione resize della finestra
        window.addEventListener('resize', handleWindowResize);
        
        // Gestione visibilità pagina (per pause automatica)
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Salvataggio automatico prima di chiudere la pagina
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        console.log('✅ Event listeners configurati');
        
        // Mostra messaggio di benvenuto
        console.log('🎉 Mostrando messaggio di benvenuto...');
        showWelcomeMessage();
        
        // Setup eventi UI
        console.log('🔧 Setup eventi UI...');
        setupUIEvents();
        
        // Setup eventi del menu di gioco dopo che il game è inizializzato
        console.log('🔧 Setup eventi menu di gioco...');
        setupGameMenuEvents();
        
        // Setup salvataggio automatico
        console.log('🔧 Setup salvataggio automatico...');
        setupAutoSave();
        
        console.log('✅ Gioco avviato con successo!');
        
    } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione del gioco:', error);
        console.error('❌ Stack trace:', error.stack);
        showError('Errore durante l\'avvio del gioco. Controlla la console per dettagli. Ricarica la pagina per riprovare.');
    }
}

// Verifica compatibilità del browser
function checkBrowserCompatibility() {
    try {
        // Verifica localStorage
        if (!window.localStorage) return false;
        
        // Verifica JSON
        if (!window.JSON) return false;
        
        // Verifica Canvas support
        const canvas = document.createElement('canvas');
        if (!canvas.getContext) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        
        // requestAnimationFrame è ora garantito dal polyfill
        
        return true;
    } catch (error) {
        console.error('Errore nel controllo compatibilità:', error);
        return false;
    }
}

// Gestione errori globali
function handleGlobalError(event) {
    console.error('❌ Errore globale:', event.error);
    
    // Prova a salvare il gioco in caso di errore
    if (game && game.saveGame) {
        try {
            game.saveGame();
            console.log('💾 Gioco salvato automaticamente dopo errore');
        } catch (saveError) {
            console.error('❌ Impossibile salvare dopo errore:', saveError);
        }
    }
    
    // Mostra notifica all'utente
    showError('Si è verificato un errore. Il gioco è stato salvato automaticamente.');
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
    if (game && game.saveGame) {
        try {
            game.saveGame();
            console.log('💾 Gioco salvato prima della chiusura');
        } catch (error) {
            console.error('❌ Errore nel salvataggio prima della chiusura:', error);
        }
    }
    
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
    // Verifica se è la prima volta che l'utente gioca
    const isFirstTime = !SaveLoad.hasSaveData();
    
    if (isFirstTime) {
        setTimeout(() => {
            if (game && game.uiManager && game.uiManager.showNotification) {
                game.uiManager.showNotification(
                    '🎉 Benvenuto in Air Tycoon 2 Clone! Inizia acquistando il tuo primo aeromobile.',
                    'info'
                );
            }
        }, 2000);
    } else {
        setTimeout(() => {
            if (game && game.uiManager && game.uiManager.showNotification) {
                game.uiManager.showNotification(
                    '👋 Bentornato! Il tuo gioco è stato caricato.',
                    'success'
                );
            }
        }, 1000);
    }
}

// Mostra errore all'utente
function showError(message) {
    // Crea elemento errore
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f44336;
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Debug: Espone oggetti globali per testing (solo in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugGame = () => game;
    window.debugAircraftData = AircraftData;
    window.debugAirportData = AirportData;
    window.debugSaveLoad = SaveLoad;
    
    console.log('🐛 Modalità debug attiva. Usa window.debugGame() per accedere al gioco.');
}

// Funzioni di utilità globali
window.gameUtils = {
    // Resetta il gioco
    resetGame: function() {
        if (confirm('Sei sicuro di voler resettare il gioco? Tutti i progressi andranno persi.')) {
            SaveLoad.deleteSave();
            location.reload();
        }
    },
    
    // Esporta salvataggio
    exportSave: function() {
        if (game && game.state) {
            const saveData = game.state.toSaveData();
            SaveLoad.exportSave(saveData);
        }
    },
    
    // Importa salvataggio
    importSave: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                SaveLoad.importSave(file)
                    .then(saveData => {
                        if (confirm('Importare questo salvataggio? I progressi attuali andranno persi.')) {
                            game.state.loadFromData(saveData);
                            game.updateUI();
                            if (game.uiManager) {
                                game.uiManager.showNotification('📥 Salvataggio importato con successo!', 'success');
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Errore nell\'importazione:', error);
                        if (game.uiManager) {
                            game.uiManager.showNotification('❌ Errore nell\'importazione: ' + error.message, 'error');
                        }
                    });
            }
        };
        
        input.click();
    },
    
    // Statistiche storage
    showStorageStats: function() {
        const stats = SaveLoad.getStorageStats();
        if (stats) {
            console.log('📊 Statistiche Storage:', stats);
            alert(`Storage utilizzato: ${stats.formattedSizes.gameData} del gioco su ${stats.formattedSizes.total} totali (${Math.round(stats.percentUsed)}% della quota stimata)`);
        }
    },
    
    // Pulizia storage
    cleanupStorage: function() {
        const removed = SaveLoad.cleanupOldSaves();
        if (game.uiManager) {
            game.uiManager.showNotification(`🧹 Puliti ${removed} salvataggi vecchi`, 'info');
        }
    },
    
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
- gameUtils.resetGame() - Resetta il gioco
- gameUtils.exportSave() - Esporta salvataggio
- gameUtils.importSave() - Importa salvataggio
- gameUtils.showStorageStats() - Mostra statistiche storage
- gameUtils.cleanupStorage() - Pulisce storage vecchi
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
            gameMenuModal.classList.remove('hidden');
        });
    }
    
    if (closeGameMenuBtn && gameMenuModal) {
        closeGameMenuBtn.addEventListener('click', function() {
            gameMenuModal.classList.add('hidden');
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
                    gameMenuModal.classList.add('hidden');
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
                window.location.href = 'game-select.html';
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
                // Salva automaticamente prima del logout
                if (game && game.saveGame) {
                    try {
                        game.saveGame();
                        console.log('💾 Partita salvata automaticamente prima del logout');
                    } catch (error) {
                        console.warn('⚠️ Errore nel salvataggio automatico:', error);
                    }
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
            gameMenuModal.classList.remove('hidden');
        });
    }
    
    if (closeGameMenuBtn && gameMenuModal) {
        closeGameMenuBtn.addEventListener('click', function() {
            gameMenuModal.classList.add('hidden');
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
                    gameMenuModal.classList.add('hidden');
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
                window.location.href = 'game-select.html';
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
                // Salva automaticamente prima del logout
                if (game && game.saveGame) {
                    try {
                        game.saveGame();
                        console.log('💾 Partita salvata automaticamente prima del logout');
                    } catch (error) {
                        console.warn('⚠️ Errore nel salvataggio automatico:', error);
                    }
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


// Inizializzazione completata
console.log('🎮 Sistema di gioco caricato e pronto!');

// Setup del sistema di salvataggio automatico
function setupAutoSave() {
    // Auto-save ogni 2 minuti (120 secondi)
    const AUTOSAVE_INTERVAL = 120 * 1000;
    let autoSaveTimer;
    
    function performAutoSave() {
        try {
            if (game && game.saveGame) {
                var success = game.saveGame();
                if (success) {
                    console.log('💾 Auto-save completato:', new Date().toLocaleTimeString());
                } else {
                    console.warn('⚠️ Auto-save fallito');
                }
            }
        } catch (error) {
            console.error('❌ Errore durante auto-save:', error);
        }
    }
    
    // Avvia il timer di auto-save
    function startAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
        }
        
        autoSaveTimer = setInterval(performAutoSave, AUTOSAVE_INTERVAL);
        console.log('⏰ Auto-save attivato: ogni', AUTOSAVE_INTERVAL / 1000, 'secondi');
        
        // Primo auto-save dopo 30 secondi dall'inizio
        setTimeout(performAutoSave, 30 * 1000);
    }
    
    // Ferma il timer di auto-save
    function stopAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
            console.log('⏸️ Auto-save fermato');
        }
    }
    
    // Avvia auto-save
    startAutoSave();
    
    // Ferma auto-save quando la pagina diventa invisibile
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            performAutoSave(); // Salva subito prima di nascondere
            stopAutoSave();
        } else {
            startAutoSave(); // Riprendi quando torna visibile
        }
    });
    
    // Esporta le funzioni per controllo manuale se necessario
    window.autoSaveControl = {
        start: startAutoSave,
        stop: stopAutoSave,
        saveNow: performAutoSave
    };
}
