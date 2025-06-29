// Sistema di salvataggio avanzato: Server-first con cache sincronizzata
console.log('📂 Caricamento SaveLoad avanzato...');

// Oggetto SaveLoad con strategia server-first
window.SaveLoad = {
    SAVE_KEY: 'air-tycoon-2-save', // Legacy per retrocompatibilità
    CACHE_KEY: 'air-tycoon-cache', // Cache sincronizzata
    SYNC_KEY: 'air-tycoon-sync-meta', // Metadati sincronizzazione
    _companyId: null,
    _useDatabase: false,
    _lastDatabaseSave: 0,
    _syncInterval: null,
    SYNC_INTERVAL_MS: 3 * 60 * 1000, // 3 minuti
    
    // Inizializza il sistema di salvataggio con l'ID della compagnia
    initialize: function(companyId) {
        if (!companyId || isNaN(Number(companyId))) {
            this._companyId = null;
            this._useDatabase = false;
            throw new Error('ID compagnia non valido: deve essere un numero.');
        }
        this._companyId = Number(companyId);
        this._useDatabase = true;
        console.log('🔧 SaveLoad inizializzato con compagnia ID:', companyId);
        this._testDatabaseConnection();
        this._startGameDataSync();
        
        // Dopo un piccolo delay, sincronizza la compagnia con il database
        setTimeout(() => {
            this._createOrUpdateCompanyInDatabase();
        }, 1000);
    },
    
    // Avvia sincronizzazione periodica dei dati di gioco
    _startGameDataSync: function() {
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
        }
        
        if (this._useDatabase && this._companyId) {
            this._syncInterval = setInterval(() => {
                this._syncGameDataFromServer();
            }, this.SYNC_INTERVAL_MS);
            
            console.log('🔄 Sincronizzazione dati gioco avviata (ogni 3 minuti)');
        }
    },
    
    // Sincronizza dati di gioco dal server
    _syncGameDataFromServer: function() {
        if (!this._useDatabase || !this._companyId) return;
        
        fetch(`/api/game/companies/${this._companyId}/latest-save`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            })
            .then(result => {
                if (result.success && result.data) {
                    // Aggiorna la cache solo se i dati del server sono più recenti
                    var serverData = result.data;
                    var localMeta = this._getLocalSyncMeta();
                    
                    if (!localMeta.lastServerSync || 
                        new Date(serverData.updated_at) > new Date(localMeta.lastServerSync)) {
                        
                        // Aggiorna cache
                        localStorage.setItem(this.CACHE_KEY, JSON.stringify(serverData.game_data));
                        
                        // Aggiorna metadati sincronizzazione
                        this._updateSyncMeta({
                            lastServerSync: serverData.updated_at,
                            syncTimestamp: new Date().toISOString()
                        });
                        
                        console.log('🔄 Dati gioco sincronizzati dal server');
                    }
                }
            })
            .catch(error => {
                console.warn('⚠️ Errore sincronizzazione dati gioco:', error.message);
            });
    },
    
    // Ottieni metadati sincronizzazione
    _getLocalSyncMeta: function() {
        try {
            var meta = localStorage.getItem(this.SYNC_KEY);
            return meta ? JSON.parse(meta) : {};
        } catch (error) {
            return {};
        }
    },
    
    // Aggiorna metadati sincronizzazione
    _updateSyncMeta: function(updates) {
        try {
            var meta = this._getLocalSyncMeta();
            Object.assign(meta, updates);
            localStorage.setItem(this.SYNC_KEY, JSON.stringify(meta));
        } catch (error) {
            console.warn('⚠️ Errore aggiornamento metadati sync:', error);
        }
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
    
    // Salva i dati di gioco (DATABASE-FIRST, poi localStorage come cache)
    saveGame: function(gameData, saveName = 'autosave') {
        try {
            var saveData = {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                data: gameData
            };
            if (this._useDatabase && this._companyId) {
                console.log('🌐 Salvataggio prioritario su database...');
                this._createOrUpdateCompanyInDatabase();
                return this._saveToDatabaseSync(saveData, saveName);
            } else {
                throw new Error('Salvataggio locale non supportato: database richiesto.');
            }
        } catch (error) {
            console.error('❌ Errore durante il salvataggio:', error);
            throw error;
        }
    },
    
    // Salvataggio solo su localStorage (fallback)
    _saveToLocalStorageOnly: function(saveData) {
        throw new Error('Salvataggio locale non più supportato.');
    },
    
    // Salvataggio SINCRONO su database (database-first)
    _saveToDatabaseSync: function(saveData, saveName) {
        // Verifica che i dati siano validi prima di inviarli
        if (!this._companyId) {
            console.warn('⚠️ ID compagnia mancante, fallback localStorage');
            return this._saveToLocalStorageOnly(saveData);
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
            return this._saveToLocalStorageOnly(saveData);
        }
        
        // Salvataggio sincrono con XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/game/save', false); // false = sincrono
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        try {
            xhr.send(JSON.stringify(payload));
            
            if (xhr.status === 200) {
                var result = JSON.parse(xhr.responseText);
                if (result && result.success) {
                    console.log('🌐 Gioco salvato su database (sync)');
                    this._showSaveNotification('Gioco salvato su database');
                    
                    // AGGIORNA LA CACHE localStorage dopo il successo del database
                    this._updateLocalStorageCache(saveData);
                    return true;
                } else {
                    console.warn('⚠️ Errore salvataggio database:', result ? result.error : 'Risposta non valida');
                    this._useDatabase = false; // Disabilita database per questa sessione
                    return this._saveToLocalStorageOnly(saveData);
                }
            } else {
                console.warn('⚠️ Errore HTTP salvataggio database:', xhr.status, xhr.statusText);
                this._useDatabase = false; // Disabilita database per questa sessione
                return this._saveToLocalStorageOnly(saveData);
            }
        } catch (error) {
            console.warn('⚠️ Errore comunicazione database:', error.message);
            this._useDatabase = false; // Disabilita database per questa sessione
            return this._saveToLocalStorageOnly(saveData);
        }
    },
    
    // Aggiorna la cache localStorage (solo dopo salvataggio database riuscito)
    _updateLocalStorageCache: function(saveData) {
        try {
            var jsonData = JSON.stringify(saveData);
            localStorage.setItem(this.CACHE_KEY, jsonData);
            console.log('🗃️ Cache localStorage aggiornata');
        } catch (error) {
            console.warn('⚠️ Errore aggiornamento cache localStorage:', error);
        }
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
    
    // Carica i dati di gioco (CACHE-FIRST: localStorage cache, poi database se necessario)
    loadGame: function() {
        try {
            // STRATEGIA CACHE-FIRST: prima prova a caricare dalla cache localStorage
            var cacheData = this._loadFromCache();
            if (cacheData) {
                console.log('📂 Dati caricati dalla cache localStorage');
                return cacheData;
            }
            
            // Se la cache è vuota, prova a caricare dal salvataggio legacy
            var legacyData = this._loadFromLegacySave();
            if (legacyData) {
                console.log('📂 Dati caricati da salvataggio legacy');
                // Aggiorna la cache con i dati legacy
                this._updateLocalStorageCache({
                    version: '2.0.0',
                    timestamp: new Date().toISOString(),
                    data: legacyData
                });
                return legacyData;
            }
            
            // TODO: In futuro, se cache e legacy sono vuoti, prova a caricare dal database
            if (this._useDatabase && this._companyId) {
                console.log('📂 TODO: Caricamento asincrono da database non ancora implementato');
                // Questo sarà implementato in futuro per caricare dal database
                // e aggiornare la cache localStorage
            }
            
            console.log('� Nessun salvataggio trovato');
            return null;
        } catch (error) {
            console.error('❌ Errore durante il caricamento:', error);
            return null;
        }
    },
    
    // Carica dalla cache localStorage
    _loadFromCache: function() {
        try {
            var jsonData = localStorage.getItem(this.CACHE_KEY);
            if (!jsonData) return null;
            
            var saveData = JSON.parse(jsonData);
            return saveData.data;
        } catch (error) {
            console.warn('⚠️ Errore caricamento cache:', error);
            return null;
        }
    },
    
    // Carica dal salvataggio legacy (per retrocompatibilità)
    _loadFromLegacySave: function() {
        try {
            var jsonData = localStorage.getItem(this.SAVE_KEY);
            if (!jsonData) return null;
            
            var saveData = JSON.parse(jsonData);
            return saveData.data;
        } catch (error) {
            console.warn('⚠️ Errore caricamento legacy save:', error);
            return null;
        }
    },
    
    // Verifica se esistono dati salvati (cache o legacy)
    hasSaveData: function() {
        return localStorage.getItem(this.CACHE_KEY) !== null || 
               localStorage.getItem(this.SAVE_KEY) !== null;
    },
    
    // Elimina i dati salvati (sia cache che legacy)
    deleteSave: function() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            localStorage.removeItem(this.SAVE_KEY);
            console.log('🗑️ Cache e salvataggio eliminati');
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
        console.log('💾 Cache localStorage disponibile:', localStorage.getItem(SaveLoad.CACHE_KEY) !== null);
        console.log('💾 Legacy save disponibile:', localStorage.getItem(SaveLoad.SAVE_KEY) !== null);
        console.log('🏢 Company ID:', SaveLoad._companyId);
        console.log('🌐 Database attivo:', SaveLoad._useDatabase);
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
            localStorage.removeItem(SaveLoad.CACHE_KEY);
            localStorage.removeItem('air-tycoon-company-id');
            console.log('🗑️ localStorage pulito (cache e legacy)');
        }
    },
    
    clearCacheOnly: function() {
        localStorage.removeItem(SaveLoad.CACHE_KEY);
        console.log('🗃️ Cache localStorage pulita');
    },
    
    forceDatabaseSave: function() {
        if (window.game && SaveLoad._companyId) {
            console.log('🌐 Forzando salvataggio database...');
            SaveLoad._useDatabase = true;
            var result = window.game.saveGame();
            console.log('🌐 Risultato salvataggio database:', result);
        } else {
            console.log('❌ Game o companyId non disponibili');
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
console.log('  SaveLoadDebug.forceDatabaseSave() - Forza salvataggio solo su database');
console.log('  SaveLoadDebug.clearLocalStorage() - Pulisci tutto localStorage');
console.log('  SaveLoadDebug.clearCacheOnly() - Pulisci solo cache');
console.log('  SaveLoadDebug.syncCompanyToDatabase() - Forza sincronizzazione compagnia');
