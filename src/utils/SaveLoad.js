// Sistema di salvataggio avanzato che usa sia localStorage che database
console.log('📂 Caricamento SaveLoad avanzato...');

// Oggetto SaveLoad compatibile con tutti i browser ma con supporto database
window.SaveLoad = {
    SAVE_KEY: 'air-tycoon-2-save',
    _companyId: null,
    _useDatabase: false,
    
    // Inizializza il sistema di salvataggio con l'ID della compagnia
    initialize: function(companyId) {
        this._companyId = companyId;
        this._useDatabase = true;
        console.log('🔧 SaveLoad inizializzato con compagnia ID:', companyId);
        this._testDatabaseConnection();
    },
    
    // Test della connessione al database
    _testDatabaseConnection: function() {
        if (!this._useDatabase) return;
        
        fetch('/api/game/companies')
            .then(response => {
                if (response.ok) {
                    console.log('🌐 Connessione database attiva');
                } else {
                    console.warn('⚠️ Database non raggiungibile, uso solo localStorage');
                    this._useDatabase = false;
                }
            })
            .catch(error => {
                console.warn('⚠️ Database non disponibile, uso solo localStorage:', error.message);
                this._useDatabase = false;
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
                this._saveToDatabaseAsync(saveData, saveName);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Errore durante il salvataggio:', error);
            return false;
        }
    },
    
    // Salvataggio asincrono su database
    _saveToDatabaseAsync: function(saveData, saveName) {
        fetch('/api/game/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                company_id: this._companyId,
                save_name: saveName,
                game_data: saveData
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                console.log('🌐 Gioco salvato su database');
                this._showSaveNotification('Gioco salvato su database');
            } else {
                console.warn('⚠️ Errore salvataggio database:', result.error);
                this._showSaveNotification('Salvato solo localmente (errore database)', 'warning');
            }
        })
        .catch(error => {
            console.warn('⚠️ Errore salvataggio database:', error.message);
            this._showSaveNotification('Salvato solo localmente (database non disponibile)', 'warning');
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
};

console.log('✅ SaveLoad avanzato caricato');
