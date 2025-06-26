// Sistema di salvataggio semplificato e compatibile
console.log('📂 Caricamento SaveLoad semplificato...');

// Oggetto SaveLoad compatibile con tutti i browser
window.SaveLoad = {
    SAVE_KEY: 'air-tycoon-2-save',
    
    // Salva i dati di gioco nel localStorage
    saveGame: function(gameData) {
        try {
            var saveData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: gameData
            };
            
            var jsonData = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, jsonData);
            
            console.log('💾 Gioco salvato con successo');
            return true;
        } catch (error) {
            console.error('❌ Errore durante il salvataggio:', error);
            return false;
        }
    },
    
    // Carica i dati di gioco dal localStorage
    loadGame: function() {
        try {
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
    }
};

console.log('✅ SaveLoad semplificato caricato');
