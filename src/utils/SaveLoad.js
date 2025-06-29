// Sistema di salvataggio avanzato: Server-first (solo database)
console.log('📂 Caricamento SaveLoad avanzato...');

// Oggetto SaveLoad con strategia server-first
window.SaveLoad = {
    _companyId: null,
    _useDatabase: false,

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
                    console.warn('⚠️ Database non raggiungibile (status:', response.status, ')');
                    this._useDatabase = false;
                    return false;
                }
            })
            .catch(error => {
                console.warn('⚠️ Database non disponibile:', error.message);
                this._useDatabase = false;
                return false;
            });
    },

    // Metodi di controllo per debug
    enableDatabase: function() {
        this._useDatabase = true;
        console.log('🌐 Database riabilitato');
        this._testDatabaseConnection();
    },
    disableDatabase: function() {
        this._useDatabase = false;
        console.log('💾 Database disabilitato');
    },
    getDatabaseStatus: function() {
        return {
            enabled: this._useDatabase,
            companyId: this._companyId
        };
    }
};

console.log('✅ SaveLoad avanzato caricato');

// Comandi debug per la console del browser
window.SaveLoadDebug = {
    status: function() {
        console.log('📊 Stato SaveLoad:', SaveLoad.getDatabaseStatus());
        console.log('🏢 Company ID:', SaveLoad._companyId);
        console.log('🌐 Database attivo:', SaveLoad._useDatabase);
    },
    enableDatabase: function() {
        SaveLoad.enableDatabase();
    },
    disableDatabase: function() {
        SaveLoad.disableDatabase();
    }
};

console.log('🔧 Comandi debug disponibili in SaveLoadDebug:');
console.log('  SaveLoadDebug.status() - Mostra stato sistema');
console.log('  SaveLoadDebug.enableDatabase() - Riabilita database');
console.log('  SaveLoadDebug.disableDatabase() - Disabilita database');
