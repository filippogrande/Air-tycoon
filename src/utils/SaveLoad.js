// Sistema di salvataggio e caricamento
console.log('📂 Caricamento SaveLoad.js...');

class SaveLoad {
    constructor() {
        // Non usato, tutti i metodi sono statici
    }
}

// Proprietà statiche compatibili
SaveLoad.SAVE_KEY = 'air-tycoon-2-save';
SaveLoad.AUTO_SAVE_INTERVAL = 30000; // 30 secondi

// Salva i dati di gioco nel localStorage
SaveLoad.saveGame = function(gameData) {
        try {
            const saveData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: gameData
            };
            
            const jsonData = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, jsonData);
            
            console.log('💾 Gioco salvato con successo');
            return true;
        } catch (error) {
            console.error('❌ Errore durante il salvataggio:', error);
            return false;
        }
    }
    
    // Carica i dati di gioco dal localStorage
    static loadGame() {
        try {
            const jsonData = localStorage.getItem(this.SAVE_KEY);
            
            if (!jsonData) {
                console.log('📂 Nessun salvataggio trovato');
                return null;
            }
            
            const saveData = JSON.parse(jsonData);
            
            // Verifica versione compatibilità
            if (!this.isCompatibleVersion(saveData.version)) {
                console.warn('⚠️ Versione del salvataggio non compatibile');
                return null;
            }
            
            console.log('📂 Dati caricati con successo dal', saveData.timestamp);
            return saveData.data;
        } catch (error) {
            console.error('❌ Errore durante il caricamento:', error);
            return null;
        }
    }
    
    // Verifica se la versione del salvataggio è compatibile
    static isCompatibleVersion(version) {
        // Per ora accetta tutte le versioni 1.x.x
        return version && version.startsWith('1.');
    }
    
    // Elimina il salvataggio
    static deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('🗑️ Salvataggio eliminato');
            return true;
        } catch (error) {
            console.error('❌ Errore durante l\'eliminazione:', error);
            return false;
        }
    }
    
    // Verifica se esiste un salvataggio
    static hasSaveData() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
    
    // Ottiene informazioni sul salvataggio senza caricarlo
    static getSaveInfo() {
        try {
            const jsonData = localStorage.getItem(this.SAVE_KEY);
            
            if (!jsonData) {
                return null;
            }
            
            const saveData = JSON.parse(jsonData);
            
            return {
                version: saveData.version,
                timestamp: new Date(saveData.timestamp),
                hasData: true,
                size: new Blob([jsonData]).size // dimensione in bytes
            };
        } catch (error) {
            console.error('❌ Errore nel leggere le informazioni del salvataggio:', error);
            return null;
        }
    }
    
    // Esporta i dati di gioco come file JSON
    static exportSave(gameData, filename = null) {
        try {
            if (!filename) {
                const date = new Date().toISOString().split('T')[0];
                filename = `air-tycoon-save-${date}.json`;
            }
            
            const saveData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                exported: true,
                data: gameData
            };
            
            const jsonData = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Crea link per download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            
            // Cleanup
            URL.revokeObjectURL(url);
            
            console.log('📤 Salvataggio esportato come', filename);
            return true;
        } catch (error) {
            console.error('❌ Errore durante l\'esportazione:', error);
            return false;
        }
    }
    
    // Importa dati di gioco da file JSON
    static importSave(file) {
        return new Promise((resolve, reject) => {
            if (!file || file.type !== 'application/json') {
                reject(new Error('File non valido. Seleziona un file JSON.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    if (!saveData.version || !saveData.data) {
                        reject(new Error('File di salvataggio non valido.'));
                        return;
                    }
                    
                    if (!this.isCompatibleVersion(saveData.version)) {
                        reject(new Error('Versione del salvataggio non compatibile.'));
                        return;
                    }
                    
                    console.log('📥 Salvataggio importato con successo');
                    resolve(saveData.data);
                } catch (error) {
                    reject(new Error('Errore nel parsing del file JSON: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Errore nella lettura del file.'));
            };
            
            reader.readAsText(file);
        });
    }
    
    // Crea backup automatico
    static createBackup(gameData) {
        try {
            const backupKey = this.SAVE_KEY + '_backup';
            const currentSave = localStorage.getItem(this.SAVE_KEY);
            
            if (currentSave) {
                localStorage.setItem(backupKey, currentSave);
                console.log('🔄 Backup creato');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Errore durante la creazione del backup:', error);
            return false;
        }
    }
    
    // Ripristina dal backup
    static restoreFromBackup() {
        try {
            const backupKey = this.SAVE_KEY + '_backup';
            const backupData = localStorage.getItem(backupKey);
            
            if (!backupData) {
                console.log('📂 Nessun backup trovato');
                return null;
            }
            
            const saveData = JSON.parse(backupData);
            console.log('🔄 Backup ripristinato');
            return saveData.data;
        } catch (error) {
            console.error('❌ Errore durante il ripristino del backup:', error);
            return null;
        }
    }
    
    // Ottiene statistiche di utilizzo storage
    static getStorageStats() {
        try {
            let totalSize = 0;
            let gameDataSize = 0;
            
            // Calcola dimensioni
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = new Blob([localStorage[key]]).size;
                    totalSize += size;
                    
                    if (key.startsWith('air-tycoon')) {
                        gameDataSize += size;
                    }
                }
            }
            
            // Stima quota disponibile (di solito 5-10MB per localStorage)
            const estimatedQuota = 5 * 1024 * 1024; // 5MB
            
            return {
                totalUsed: totalSize,
                gameDataUsed: gameDataSize,
                estimatedQuota: estimatedQuota,
                percentUsed: (totalSize / estimatedQuota) * 100,
                formattedSizes: {
                    total: this.formatBytes(totalSize),
                    gameData: this.formatBytes(gameDataSize),
                    quota: this.formatBytes(estimatedQuota)
                }
            };
        } catch (error) {
            console.error('❌ Errore nel calcolo delle statistiche storage:', error);
            return null;
        }
    }
    
    // Formatta bytes in formato leggibile
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Pulisce salvataggi vecchi o corrotti
    static cleanupOldSaves() {
        try {
            const keysToRemove = [];
            
            for (let key in localStorage) {
                if (key.startsWith('air-tycoon') && key !== this.SAVE_KEY) {
                    try {
                        const data = JSON.parse(localStorage[key]);
                        
                        // Rimuove salvataggi più vecchi di 30 giorni
                        if (data.timestamp) {
                            const saveDate = new Date(data.timestamp);
                            const daysDiff = (Date.now() - saveDate.getTime()) / (1000 * 60 * 60 * 24);
                            
                            if (daysDiff > 30) {
                                keysToRemove.push(key);
                            }
                        }
                    } catch (e) {
                        // Rimuove salvataggi corrotti
                        keysToRemove.push(key);
                    }
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            if (keysToRemove.length > 0) {
                console.log(`🧹 Rimossi ${keysToRemove.length} salvataggi vecchi/corrotti`);
            }
            
            return keysToRemove.length;
        } catch (error) {
            console.error('❌ Errore durante la pulizia:', error);
            return 0;
        }
    }
    
    // Valida i dati di gioco prima del salvataggio
    static validateGameData(gameData) {
        const errors = [];
        
        // Verifica struttura base
        if (!gameData.company) {
            errors.push('Dati compagnia mancanti');
        }
        
        if (!gameData.gameTime) {
            errors.push('Dati tempo di gioco mancanti');
        }
        
        if (!Array.isArray(gameData.fleet)) {
            errors.push('Dati flotta non validi');
        }
        
        if (!Array.isArray(gameData.routes)) {
            errors.push('Dati rotte non validi');
        }
        
        // Verifica integrità dati
        if (gameData.company && typeof gameData.company.money !== 'number') {
            errors.push('Denaro della compagnia non valido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}
