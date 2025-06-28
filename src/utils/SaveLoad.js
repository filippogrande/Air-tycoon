// Sistema di salvataggio avanzato che usa sia localStorage che database
console.log('📂 Caricamento SaveLoad avanzato...');

// Oggetto SaveLoad compatibile con tutti i browser ma con supporto database
window.SaveLoad = {
    SAVE_KEY: 'air-tycoon-2-save',
    _companyId: null,
    _useDatabase: false,
    
    // Inizializza il sistema di salvataggio con l'ID della compagnia
    initialize: function(companyId, forceLocalStorageOnly = false) {
        this._companyId = companyId;
        
        if (forceLocalStorageOnly) {
            this._useDatabase = false;
            console.log('🔧 SaveLoad inizializzato in modalità solo localStorage');
            return;
        }
        
        this._useDatabase = true;
        console.log('🔧 SaveLoad inizializzato con compagnia ID:', companyId);
        this._testDatabaseConnection();
        
        // Dopo un piccolo delay, sincronizza la compagnia con il database
        setTimeout(() => {
            this._createOrUpdateCompanyInDatabase();
        }, 1000);
    },
    
    // Test della connessione al database
    _testDatabaseConnection: function() {
        if (!this._useDatabase) return;
        
        fetch('/api/game/companies')
            .then(response => {
                if (response.ok) {
                    console.log('🌐 Connessione database attiva');
                    return true;
                } else {
                    console.warn('⚠️ Database non raggiungibile (status:', response.status, '), uso solo localStorage');
                    this._useDatabase = false;
                    return false;
                }
            })
            .catch(error => {
                console.warn('⚠️ Database non disponibile, uso solo localStorage:', error.message);
                this._useDatabase = false;
                return false;
            });
    },
    
    // Salva i dati di gioco (localStorage + database se disponibile)
    saveGame: function(gameData, saveName = 'autosave') {
        try {
            var saveData = {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                data: gameData
            };
            
            // Salvataggio localStorage (sempre)
            var jsonData = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, jsonData);
            console.log('💾 Gioco salvato su localStorage');
            
            // Salvataggio database (se disponibile)
            if (this._useDatabase && this._companyId) {
                // Prima sincronizza la compagnia, poi salva il gioco
                this._createOrUpdateCompanyInDatabase();
                setTimeout(() => {
                    this._saveToDatabaseAsync(saveData, saveName);
                }, 500); // Piccolo delay per permettere la sincronizzazione
            }
            
            return true;
        } catch (error) {
            console.error('❌ Errore durante il salvataggio:', error);
            return false;
        }
    },
    
    // Salvataggio asincrono su database
    _saveToDatabaseAsync: function(saveData, saveName) {
        // Verifica che i dati siano validi prima di inviarli
        if (!this._companyId) {
            console.warn('⚠️ ID compagnia mancante, skip salvataggio database');
            return;
        }
        
        // Prepara i dati per il database
        const payload = {
            company_id: this._companyId,
            save_name: saveName,
            game_data: saveData
        };
        
        // Verifica che il payload sia serializzabile
        try {
            JSON.stringify(payload);
        } catch (jsonError) {
            console.error('❌ Errore serializzazione dati per database:', jsonError);
            this._showSaveNotification('Salvato solo localmente (dati non serializzabili)', 'warning');
            return;
        }
        
        fetch('/api/game/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                // Log dell'errore HTTP
                console.warn('⚠️ Errore HTTP salvataggio database:', response.status, response.statusText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(result => {
            if (result && result.success) {
                console.log('🌐 Gioco salvato su database');
                this._showSaveNotification('Gioco salvato su database');
            } else {
                console.warn('⚠️ Errore salvataggio database:', result ? result.error : 'Risposta non valida');
                this._showSaveNotification('Salvato solo localmente (errore database)', 'warning');
                this._useDatabase = false; // Disabilita database per questa sessione
            }
        })
        .catch(error => {
            console.warn('⚠️ Errore salvataggio database:', error.message);
            this._showSaveNotification('Salvato solo localmente (database non disponibile)', 'warning');
            
            // Se l'errore è un 500, disabilita temporaneamente il database
            if (error.message.includes('500')) {
                this._useDatabase = false;
                console.warn('⚠️ Database disabilitato per questa sessione a causa di errori server');
            }
        });
    },
    
    // Mostra notifica di salvataggio
    _showSaveNotification: function(message, type = 'success') {
        // Crea una notifica temporanea
        var notification = document.createElement('div');
        var backgroundColor = '#4CAF50'; // Verde per success
        if (type === 'warning') backgroundColor = '#FF9800'; // Arancione per warning
        if (type === 'info') backgroundColor = '#2196F3'; // Blu per info
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: ${backgroundColor};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Rimuovi dopo 3 secondi (2 secondi per info)
        var timeout = type === 'info' ? 2000 : 3000;
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, timeout);
    },
    
    // Carica i dati di gioco (prova database prima, poi localStorage)
    loadGame: function() {
        try {
            // Se il database è disponibile e abbiamo un ID compagnia, prova a caricare da lì
            if (this._useDatabase && this._companyId) {
                // Per ora manteniamo sincrono, in futuro si può rendere asincrono
                console.log('📂 Caricamento da localStorage (database asincrono non implementato)');
            }
            
            // Caricamento da localStorage
            var jsonData = localStorage.getItem(this.SAVE_KEY);
            
            if (!jsonData) {
                console.log('📄 Nessun salvataggio trovato');
                return null;
            }
            
            var saveData = JSON.parse(jsonData);
            console.log('📂 Dati caricati dal salvataggio');
            return saveData.data;
        } catch (error) {
            console.error('❌ Errore durante il caricamento:', error);
            return null;
        }
    },
    
    // Verifica se esistono dati salvati
    hasSaveData: function() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },
    
    // Elimina i dati salvati
    deleteSave: function() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('🗑️ Salvataggio eliminato');
            return true;
        } catch (error) {
            console.error('❌ Errore eliminazione salvataggio:', error);
            return false;
        }
    },
    
    // Auto-save intelligente con debouncing per evitare troppi salvataggi
    _autoSaveTimeout: null,
    _lastAutoSave: 0,
    AUTO_SAVE_DELAY: 2000, // 2 secondi di delay
    MIN_AUTO_SAVE_INTERVAL: 10000, // Minimo 10 secondi tra auto-save
    
    // Triggered auto-save quando l'utente fa azioni significative
    triggerAutoSave: function(reason = 'user_action') {
        var now = Date.now();
        
        // Se è troppo presto dall'ultimo auto-save, usa il debouncing
        if (now - this._lastAutoSave < this.MIN_AUTO_SAVE_INTERVAL) {
            console.log('🔄 Auto-save rimandato (troppo recente):', reason);
            this._scheduleAutoSave(reason);
            return;
        }
        
        // Cancella eventuali auto-save programmati
        if (this._autoSaveTimeout) {
            clearTimeout(this._autoSaveTimeout);
            this._autoSaveTimeout = null;
        }
        
        // Esegui il salvataggio
        this._performTriggeredAutoSave(reason);
    },
    
    // Programma un auto-save con delay
    _scheduleAutoSave: function(reason) {
        // Cancella timeout precedente
        if (this._autoSaveTimeout) {
            clearTimeout(this._autoSaveTimeout);
        }
        
        // Programma nuovo auto-save
        this._autoSaveTimeout = setTimeout(() => {
            this._performTriggeredAutoSave(reason);
            this._autoSaveTimeout = null;
        }, this.AUTO_SAVE_DELAY);
        
        console.log('⏰ Auto-save programmato per:', reason);
    },
    
    // Esegui l'auto-save triggered
    _performTriggeredAutoSave: function(reason) {
        try {
            if (window.game && window.game.saveGame) {
                var success = window.game.saveGame();
                if (success) {
                    this._lastAutoSave = Date.now();
                    console.log('💾 Auto-save completato per:', reason);
                    this._showSaveNotification('Auto-save: ' + reason, 'info');
                } else {
                    console.warn('⚠️ Auto-save fallito per:', reason);
                }
            } else {
                console.warn('⚠️ Game non disponibile per auto-save:', reason);
            }
        } catch (error) {
            console.error('❌ Errore durante auto-save triggered:', error);
        }
    },
    
    // Metodi di controllo per debug
    enableDatabase: function() {
        this._useDatabase = true;
        console.log('🌐 Database riabilitato');
        this._testDatabaseConnection();
    },
    
    disableDatabase: function() {
        this._useDatabase = false;
        console.log('💾 Database disabilitato, solo localStorage');
    },
    
    getDatabaseStatus: function() {
        return {
            enabled: this._useDatabase,
            companyId: this._companyId
        };
    },
    
    // Crea o aggiorna la compagnia nel database
    _createOrUpdateCompanyInDatabase: function() {
        if (!this._useDatabase || !this._companyId) {
            return;
        }
        
        // Ottieni i dati della compagnia dal game state
        var companyData = null;
        if (window.game && window.game.state && window.game.state.company) {
            companyData = window.game.state.company;
        }
        
        if (!companyData) {
            console.warn('⚠️ Dati compagnia non disponibili per sincronizzazione database');
            return;
        }
        
        var payload = {
            id: this._companyId,
            name: companyData.name || 'Air Express',
            money: companyData.money || 1000000,
            reputation: companyData.reputation || 50,
            founded: companyData.founded ? companyData.founded.toISOString() : new Date().toISOString(),
            base_airport: companyData.baseAirport || null
        };
        
        fetch('/api/game/companies/create-or-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(result => {
            if (result && result.success) {
                console.log('🏢 Compagnia sincronizzata con database:', result.data.name);
            } else {
                console.warn('⚠️ Errore sincronizzazione compagnia:', result ? result.error : 'Risposta non valida');
            }
        })
        .catch(error => {
            console.warn('⚠️ Errore sincronizzazione compagnia database:', error.message);
        });
    },
};

console.log('✅ SaveLoad avanzato caricato');

// Comandi debug per la console del browser
window.SaveLoadDebug = {
    status: function() {
        console.log('📊 Stato SaveLoad:', SaveLoad.getDatabaseStatus());
        console.log('💾 localStorage disponibile:', SaveLoad.hasSaveData());
        console.log('🏢 Company ID:', SaveLoad._companyId);
    },
    
    enableDatabase: function() {
        SaveLoad.enableDatabase();
    },
    
    disableDatabase: function() {
        SaveLoad.disableDatabase();
    },
    
    testSave: function() {
        if (window.game) {
            console.log('🧪 Test salvataggio...');
            var result = window.game.saveGame();
            console.log('🧪 Risultato:', result);
        } else {
            console.log('❌ Game non disponibile');
        }
    },
    
    clearLocalStorage: function() {
        if (confirm('Vuoi cancellare tutti i dati localStorage del gioco?')) {
            localStorage.removeItem(SaveLoad.SAVE_KEY);
            localStorage.removeItem('air-tycoon-company-id');
            console.log('🗑️ localStorage pulito');
        }
    },
    
    syncCompanyToDatabase: function() {
        console.log('🔄 Forzando sincronizzazione compagnia...');
        SaveLoad._createOrUpdateCompanyInDatabase();
    }
};

console.log('🔧 Comandi debug disponibili in SaveLoadDebug:');
console.log('  SaveLoadDebug.status() - Mostra stato sistema');
console.log('  SaveLoadDebug.enableDatabase() - Riabilita database');
console.log('  SaveLoadDebug.disableDatabase() - Disabilita database');
console.log('  SaveLoadDebug.testSave() - Test salvataggio');
console.log('  SaveLoadDebug.clearLocalStorage() - Pulisci localStorage');
console.log('  SaveLoadDebug.syncCompanyToDatabase() - Forza sincronizzazione compagnia');
