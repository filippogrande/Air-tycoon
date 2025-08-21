// Gestione eventi menu di gioco per Air Tycoon 2 Clone
// Estratto da main.js
// Compatibilità globale - rimuovo import ES6

function setupGameMenuEvents(game) {
    console.debug('🎮 Setup eventi menu di gioco...');
    // Apri menu di gioco
    var gameMenuBtn = document.getElementById('game-menu-btn');
    var gameMenuModal = document.getElementById('game-menu-modal');
    var closeGameMenuBtn = document.getElementById('close-game-menu');

    if (gameMenuBtn && gameMenuModal) {
        gameMenuBtn.addEventListener('click', function() {
            console.debug('📋 Apertura menu di gioco');
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
            console.debug('💾 Salvataggio partita...');
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
            console.debug('🔙 Ritorno alla selezione giochi...');
            if (confirm('Vuoi davvero tornare alla selezione dei giochi? Assicurati di aver salvato la partita.')) {
                // Salva automaticamente prima di uscire
                if (game && game.saveGame) {
                    try {
                        game.saveGame();
                        console.debug('💾 Partita salvata automaticamente prima dell\'uscita');
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
                    console.debug('🧹 Dati di gioco rimossi, login preservato');
                } catch (e) {
                    console.warn('⚠️ Errore pulizia dati di gioco:', e);
                }
                window.location.href = '/game/game/select.html';
            }
        });
    }

    // Impostazioni: apri lo stesso overlay di impostazioni usato dall'header
    var gameSettingsBtn = document.getElementById('game-settings');
    if (gameSettingsBtn) {
        gameSettingsBtn.addEventListener('click', function() {
            // Prova a trovare l'overlay condiviso (#settings-overlay)
            var sharedOverlay = document.getElementById('settings-overlay');
            console.debug('[gameMenuEvents] game-settings clicked; overlay element found?', !!sharedOverlay);
            if (!sharedOverlay) {
                // fallback: non esiste overlay nel DOM
                alert('⚙️ Funzionalità impostazioni in sviluppo');
                return;
            }

            // If overlay is empty, try to lazy-load the template from server
            var alreadyHasContent = sharedOverlay.innerHTML && sharedOverlay.innerHTML.trim().length > 0;
            console.debug('[gameMenuEvents] overlay has content?', alreadyHasContent, 'innerLength:', sharedOverlay.innerHTML ? sharedOverlay.innerHTML.length : 0);
            function openOverlay() {
                sharedOverlay.classList.toggle('active');
                console.debug('[gameMenuEvents] toggled overlay class, now:', sharedOverlay.className);
                // Quick diagnostic: check computed style and force display if required
                try {
                    var cs = window.getComputedStyle(sharedOverlay);
                    console.info('[gameMenuEvents] computed display after toggle:', cs.display, 'visibility:', cs.visibility, 'opacity:', cs.opacity);
                    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) {
                        console.info('[gameMenuEvents] overlay not visible after toggle; applying inline fallback styles');
                        sharedOverlay.style.display = 'flex';
                        sharedOverlay.style.zIndex = '99999';
                        sharedOverlay.classList.add('active');
                    }
                    var rect = sharedOverlay.getBoundingClientRect();
                    console.info('[gameMenuEvents] overlay rect:', rect.width, 'x', rect.height, 'y', rect.top);
                } catch (diagErr) { console.warn('[gameMenuEvents] diag error', diagErr && diagErr.message); }
                try {
                    var firstBtn = sharedOverlay.querySelector('button, input, select, a');
                    if (firstBtn) firstBtn.focus();
                } catch (e) { /* ignore */ }
            }

            if (!alreadyHasContent) {
                // attempt to fetch the modal template (same path used by page injector)
                console.debug('[gameMenuEvents] overlay empty; fetching /game/modals/settings-overlay.html');
                fetch('/game/modals/settings-overlay.html')
                    .then(function(r) { console.debug('[gameMenuEvents] fetch status:', r && r.status); return r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)); })
                    .then(function(html) {
                        sharedOverlay.innerHTML = html;
                        console.debug('[gameMenuEvents] loaded settings HTML, length=', sharedOverlay.innerHTML.length);
                        try { 
                            if (typeof window.bindSettingsButtons === 'function') {
                                window.bindSettingsButtons(sharedOverlay, game);
                            }
                        } catch (e) { console.warn('[gameMenuEvents] bindSettingsButtons failed', e && e.message); }
                        // attach close on click outside if not already attached
                        if (!sharedOverlay._closeHandlerAttached) {
                            sharedOverlay.addEventListener('click', function(evt) {
                                if (evt.target === sharedOverlay) sharedOverlay.classList.remove('active');
                            });
                            sharedOverlay._closeHandlerAttached = true;
                        }
                        openOverlay();
                    })
                    .catch(function(err) {
                        console.warn('[gameMenuEvents] unable to load settings overlay template:', err && err.message);
                        // still toggle to show overlay (it will be empty or contain default markup)
                        openOverlay();
                    });
            } else {
                openOverlay();
            }
        });
    }

    // Logout
    var logoutFromGameBtn = document.getElementById('logout-from-game');
    if (logoutFromGameBtn) {
        logoutFromGameBtn.addEventListener('click', function() {
            console.debug('🚪 Logout dal gioco...');
            if (confirm('Vuoi davvero fare il logout? Assicurati di aver salvato la partita.')) {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.debug('🧹 Dati locali eliminati');
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
            console.debug('💾 Salvataggio rapido...');
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
                    console.debug('▶️ Gioco ripreso');
                } else {
                    game.pause();
                    pauseBtn.textContent = '▶️ Riprendi';
                    console.debug('⏸️ Gioco in pausa');
                }
            }
        });
    }

    console.debug('✅ Eventi menu di gioco configurati');
}

function updateGameMenuInfo(game) {
    console.debug('📊 Aggiornamento info menu di gioco...');
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

// Export globale per compatibilità
if (typeof window !== 'undefined') {
    window.setupGameMenuEvents = setupGameMenuEvents;
    window.updateGameMenuInfo = updateGameMenuInfo;
}
