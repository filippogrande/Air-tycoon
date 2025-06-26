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
    
    // Debug: verifica che tutte le classi siano caricate
    const requiredClasses = [
        'GameState', 'Aircraft', 'Airport', 'Route', 
        'FleetManager', 'RouteManager', 'FinanceManager',
        'UIManager', 'WorldMap', 'AircraftData', 'AirportData'
    ];
    
    const missingClasses = requiredClasses.filter(className => !window[className]);
    if (missingClasses.length > 0) {
        console.error('❌ Classi mancanti:', missingClasses);
        showError(`Errore: classi non caricate: ${missingClasses.join(', ')}`);
        return;
    }
    
    console.log('✅ Tutte le classi sono caricate');
    
    // Verifica compatibilità browser
    if (!checkBrowserCompatibility()) {
        showError('Il tuo browser non supporta tutte le funzionalità richieste dal gioco.');
        return;
    }
    
    console.log('✅ Browser compatibile');
    
    // Inizializza il gioco
    try {
        game = new Game();
        
        // Gestione errori globali
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
        // Gestione resize della finestra
        window.addEventListener('resize', handleWindowResize);
        
        // Gestione visibilità pagina (per pause automatica)
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Salvataggio automatico prima di chiudere la pagina
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        console.log('✅ Gioco avviato con successo!');
        
        // Mostra messaggio di benvenuto
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione del gioco:', error);
        showError('Errore durante l\'avvio del gioco. Ricarica la pagina per riprovare.');
    }
});

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
