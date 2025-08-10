// Gestione eventi menu di gioco per Air Tycoon 2 Clone
// Estratto da main.js

export function setupGameMenuEvents(game) {
    console.log('🎮 Setup eventi menu di gioco...');
    // Apri menu di gioco
    var gameMenuBtn = document.getElementById('game-menu-btn');
    var gameMenuModal = document.getElementById('game-menu-modal');
    var closeGameMenuBtn = document.getElementById('close-game-menu');

    if (gameMenuBtn && gameMenuModal) {
        gameMenuBtn.addEventListener('click', function() {
            console.log('📋 Apertura menu di gioco');
            updateGameMenuInfo(game);
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
                // Pulisci solo i dati di gioco, NON il login
                try {
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
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('🧹 Dati locali eliminati');
                } catch (e) {
                    console.warn('⚠️ Errore pulizia storage:', e);
                }
                var authManager = new AuthManager();
                authManager.logout();
                window.location.href = 'pages/auth/login.html';
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

export function updateGameMenuInfo(game) {
    console.log('📊 Aggiornamento info menu di gioco...');
    try {
        var authManager = new AuthManager();
        var currentUser = authManager.getCurrentUser();
        var currentSave = authManager.getCurrentSave();
        var saveNameEl = document.getElementById('current-save-name');
        if (saveNameEl) {
            saveNameEl.textContent = currentSave ? currentSave.name : 'Nessun salvataggio';
        }
        var companyNameEl = document.getElementById('current-company-name');
        if (companyNameEl && game && game.state) {
            companyNameEl.textContent = game.state.company.name || 'Sconosciuta';
        }
        var playTimeEl = document.getElementById('play-time');
        if (playTimeEl) {
            if (currentSave && currentSave.metadata && currentSave.metadata.createdAt) {
                var startTime = new Date(currentSave.metadata.createdAt);
                var now = new Date();
                var playTime = Math.round((now - startTime) / (1000 * 60));
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
