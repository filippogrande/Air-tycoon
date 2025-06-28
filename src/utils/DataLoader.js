// Sistema di caricamento dati con sincronizzazione periodica SERVER → localStorage
console.log('📂 Caricamento DataLoader con sincronizzazione periodica...');

window.DataLoader = {
    _useDatabase: true,
    _cache: {},
    _syncInterval: null,
    _lastSync: {},
    SYNC_INTERVAL_MS: 5 * 60 * 1000, // 5 minuti
    CACHE_EXPIRY_MS: 15 * 60 * 1000, // 15 minuti
    
    // Inizializza il loader di dati
    initialize: function() {
        console.log('🔧 Inizializzazione DataLoader...');
        this._loadCacheFromLocalStorage();
        this._testDatabaseConnection();
        this._startPeriodicSync();
    },
    
    // Carica cache da localStorage
    _loadCacheFromLocalStorage: function() {
        try {
            var cacheData = localStorage.getItem('airTycoon_data_cache');
            if (cacheData) {
                var parsed = JSON.parse(cacheData);
                this._cache = parsed.cache || {};
                this._lastSync = parsed.lastSync || {};
                console.log('📂 Cache dati caricata da localStorage');
            }
        } catch (error) {
            console.warn('⚠️ Errore caricamento cache dati:', error);
            this._cache = {};
            this._lastSync = {};
        }
    },
    
    // Salva cache in localStorage
    _saveCacheToLocalStorage: function() {
        try {
            var cacheData = {
                cache: this._cache,
                lastSync: this._lastSync,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('airTycoon_data_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('⚠️ Errore salvataggio cache dati:', error);
        }
    },
    
    // Avvia sincronizzazione periodica
    _startPeriodicSync: function() {
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
        }
        
        this._syncInterval = setInterval(() => {
            this._performPeriodicSync();
        }, this.SYNC_INTERVAL_MS);
        
        console.log('🔄 Sincronizzazione periodica avviata (ogni 5 minuti)');
    },
    
    // Esegue sincronizzazione periodica
    _performPeriodicSync: function() {
        if (!this._useDatabase) return;
        
        console.log('🔄 Sincronizzazione periodica in corso...');
        
        // Sincronizza aeroporti se necessario
        this._syncAirportsIfNeeded();
        
        // Sincronizza altri dati se necessario
        // TODO: aggiungere altre sincronizzazioni
    },
    
    // Sincronizza aeroporti se scaduti
    _syncAirportsIfNeeded: function() {
        var now = Date.now();
        var lastAirportSync = this._lastSync.airports || 0;
        
        if (now - lastAirportSync > this.CACHE_EXPIRY_MS) {
            this._loadAirportsFromDatabase()
                .then(airports => {
                    if (airports && airports.length > 0) {
                        this._cache.airports = airports;
                        this._lastSync.airports = now;
                        this._saveCacheToLocalStorage();
                        console.log('🔄 Aeroporti sincronizzati:', airports.length);
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Errore sincronizzazione aeroporti:', error);
                });
        }
    },
    
    // Test connessione database
    _testDatabaseConnection: function() {
        fetch('/api/airports?limit=1')
            .then(response => {
                if (response.ok) {
                    console.log('🌐 Database disponibile per caricamento dati');
                    this._useDatabase = true;
                } else {
                    console.warn('⚠️ Database non raggiungibile, uso dati statici');
                    this._useDatabase = false;
                }
            })
            .catch(error => {
                console.warn('⚠️ Database non disponibile, uso dati statici:', error.message);
                this._useDatabase = false;
            });
    },
    
    // Carica aeroporti (CACHE-FIRST con sincronizzazione periodica)
    loadAirports: function() {
        // Prima: controlla cache
        if (this._cache.airports && this._isCacheValid('airports')) {
            console.log('📂 Caricamento aeroporti da cache locale');
            return Promise.resolve(this._cache.airports);
        }
        
        // Seconda: se cache scaduta o vuota, carica da server
        if (this._useDatabase) {
            return this._loadAirportsFromDatabase()
                .then(airports => {
                    if (airports && airports.length > 0) {
                        this._cache.airports = airports;
                        this._lastSync.airports = Date.now();
                        this._saveCacheToLocalStorage();
                        console.log('🌐 Aeroporti caricati da database e cache aggiornata:', airports.length);
                        return airports;
                    } else {
                        return this._loadAirportsFromStatic();
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Errore caricamento aeroporti da database:', error);
                    return this._loadAirportsFromStatic();
                });
        } else {
            return this._loadAirportsFromStatic();
        }
    },
    
    // Verifica se la cache è valida
    _isCacheValid: function(dataType) {
        var lastSync = this._lastSync[dataType] || 0;
        var now = Date.now();
        return (now - lastSync) < this.CACHE_EXPIRY_MS;
    },
    
    // Carica aeroporti dal database
    _loadAirportsFromDatabase: function() {
        return fetch('/api/airports?limit=1000')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.success && result.data) {
                    // Converte i dati dal formato database al formato del gioco
                    return result.data.map(airport => ({
                        id: airport.id,
                        name: airport.name,
                        code: airport.iata_code,
                        icao: airport.icao_code,
                        city: airport.city,
                        country: airport.country,
                        latitude: parseFloat(airport.latitude),
                        longitude: parseFloat(airport.longitude),
                        elevation: airport.elevation || 0,
                        timezone: airport.timezone || 'UTC',
                        passengers: airport.business_level || 50,
                        cargo: airport.tourist_level || 50,
                        slots: airport.slots_per_hour || 20,
                        runwayLength: airport.runway_length_meters || 2500
                    }));
                } else {
                    throw new Error('Formato dati non valido');
                }
            });
    },
    
    // Carica aeroporti dai dati statici (fallback)
    _loadAirportsFromStatic: function() {
        console.log('💾 Caricamento aeroporti da dati statici (fallback)');
        this._cache.airports = createAirportData();
        return Promise.resolve(this._cache.airports);
    },
    
    // Carica aeromobili (sempre statici per ora)
    loadAircraft: function() {
        if (this._cache.aircraft) {
            return Promise.resolve(this._cache.aircraft);
        }
        
        this._cache.aircraft = createAircraftData();
        console.log('📂 Aeromobili caricati da dati statici:', this._cache.aircraft.length);
        return Promise.resolve(this._cache.aircraft);
    },
    
    // Carica dati del gioco per un utente specifico
    loadGameData: function(companyId) {
        if (!this._useDatabase || !companyId) {
            console.log('💾 Caricamento dati gioco da localStorage (fallback)');
            return Promise.resolve(null);
        }
        
        return fetch(`/api/game/companies/${companyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.success && result.data) {
                    console.log('🌐 Dati compagnia caricati da database');
                    return result.data;
                } else {
                    return null;
                }
            })
            .catch(error => {
                console.warn('⚠️ Errore caricamento dati compagnia:', error);
                return null;
            });
    },
    
    // Pulisce la cache e ferma sincronizzazione
    clearCache: function() {
        this._cache = {};
        this._lastSync = {};
        localStorage.removeItem('airTycoon_data_cache');
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
            this._syncInterval = null;
        }
        console.log('🗑️ Cache DataLoader pulita e sincronizzazione fermata');
    },
    
    // Ferma sincronizzazione periodica
    stopSync: function() {
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
            this._syncInterval = null;
            console.log('⏹️ Sincronizzazione periodica fermata');
        }
    },
    
    // Riavvia sincronizzazione
    restartSync: function() {
        this.stopSync();
        this._startPeriodicSync();
    },
    
    // Forza sincronizzazione immediata
    forceSyncNow: function() {
        console.log('🔄 Sincronizzazione forzata...');
        this._performPeriodicSync();
    },
    
    // Forza il ricaricamento dal database
    forceRefresh: function() {
        this.clearCache();
        this._testDatabaseConnection();
        console.log('🔄 DataLoader forzato al refresh');
    }
};

// Auto-inizializza quando il modulo viene caricato
DataLoader.initialize();

console.log('✅ DataLoader avanzato caricato');

// Comandi debug
window.DataLoaderDebug = {
    status: function() {
        console.log('📊 Stato DataLoader:');
        console.log('🌐 Database attivo:', DataLoader._useDatabase);
        console.log('🗃️ Cache disponibile:', Object.keys(DataLoader._cache));
        console.log('🕐 Ultima sincronizzazione:', DataLoader._lastSync);
        console.log('⏰ Intervallo sync attivo:', DataLoader._syncInterval !== null);
    },
    
    showCache: function() {
        console.log('🗃️ Contenuto cache completa:', DataLoader._cache);
    },
    
    syncNow: function() {
        DataLoader.forceSyncNow();
    },
    
    clearAll: function() {
        DataLoader.clearCache();
        console.log('🗑️ Cache completamente pulita');
    },
    
    testAirports: function() {
        console.log('🧪 Test caricamento aeroporti...');
        DataLoader.loadAirports().then(airports => {
            console.log('✅ Aeroporti caricati:', airports.length);
            console.log('Primo aeroporto:', airports[0]);
        });
    },
    
    forceDatabase: function() {
        DataLoader._useDatabase = true;
        DataLoader.restartSync();
        console.log('🌐 Database forzatamente abilitato');
    },
    
    forceStatic: function() {
        DataLoader._useDatabase = false;
        DataLoader.stopSync();
        console.log('💾 Dati statici forzatamente abilitati');
    }
};

console.log('🔧 Comandi debug DataLoader disponibili:');
console.log('  DataLoaderDebug.status() - Stato sistema');
console.log('  DataLoaderDebug.showCache() - Mostra cache completa');
console.log('  DataLoaderDebug.syncNow() - Sincronizzazione immediata');
console.log('  DataLoaderDebug.clearAll() - Pulisci tutta la cache');
console.log('  DataLoaderDebug.testAirports() - Test caricamento aeroporti');
console.log('  DataLoaderDebug.forceDatabase() - Forza uso database');
console.log('  DataLoaderDebug.forceStatic() - Forza uso dati statici');
