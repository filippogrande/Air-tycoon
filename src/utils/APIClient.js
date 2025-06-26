/**
 * API Client per Air Tycoon 2 Clone
 * Gestisce le chiamate al backend PostgreSQL
 */

class APIClient {
    constructor(baseUrl = 'http://localhost:3001/api') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Effettua una chiamata HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // =====================================
    // COMPANY / GAME MANAGEMENT
    // =====================================

    async getCompanies() {
        return this.request('/game/companies');
    }

    async getCompany(id) {
        return this.request(`/game/companies/${id}`);
    }

    async createCompany(companyData) {
        return this.request('/game/companies', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }

    async updateCompany(id, companyData) {
        return this.request(`/game/companies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(companyData)
        });
    }

    // =====================================
    // SAVE / LOAD SYSTEM
    // =====================================

    async saveGame(companyId, saveName, gameData) {
        return this.request('/game/save', {
            method: 'POST',
            body: JSON.stringify({
                company_id: companyId,
                save_name: saveName,
                game_data: gameData
            })
        });
    }

    async loadGame(saveId) {
        return this.request(`/game/save/${saveId}`);
    }

    async getSaves(companyId) {
        return this.request(`/game/saves/${companyId}`);
    }

    // =====================================
    // FLEET MANAGEMENT
    // =====================================

    async getAircraftTypes() {
        return this.request('/fleet/aircraft-types');
    }

    async getFleet(companyId) {
        return this.request(`/fleet/company/${companyId}`);
    }

    async purchaseAircraft(purchaseData) {
        return this.request('/fleet/purchase', {
            method: 'POST',
            body: JSON.stringify(purchaseData)
        });
    }

    async updateAircraft(aircraftId, updateData) {
        return this.request(`/fleet/${aircraftId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async sellAircraft(aircraftId, salePrice) {
        return this.request(`/fleet/${aircraftId}`, {
            method: 'DELETE',
            body: JSON.stringify({ sale_price: salePrice })
        });
    }

    async performMaintenance(aircraftId, maintenanceType = 'routine') {
        return this.request(`/fleet/${aircraftId}/maintenance`, {
            method: 'POST',
            body: JSON.stringify({ maintenance_type: maintenanceType })
        });
    }

    // =====================================
    // ROUTE MANAGEMENT
    // =====================================

    async getRoutes(companyId) {
        return this.request(`/routes/company/${companyId}`);
    }

    async getRoute(routeId) {
        return this.request(`/routes/${routeId}`);
    }

    async createRoute(routeData) {
        return this.request('/routes', {
            method: 'POST',
            body: JSON.stringify(routeData)
        });
    }

    async updateRoute(routeId, routeData) {
        return this.request(`/routes/${routeId}`, {
            method: 'PUT',
            body: JSON.stringify(routeData)
        });
    }

    async deleteRoute(routeId) {
        return this.request(`/routes/${routeId}`, {
            method: 'DELETE'
        });
    }

    async scheduleFlight(routeId, flightData) {
        return this.request(`/routes/${routeId}/schedule`, {
            method: 'POST',
            body: JSON.stringify(flightData)
        });
    }

    async getRouteAnalysis(companyId) {
        return this.request(`/routes/analysis/${companyId}`);
    }

    // =====================================
    // AIRPORT DATA
    // =====================================

    async getAirports(searchParams = {}) {
        const params = new URLSearchParams(searchParams).toString();
        return this.request(`/airports${params ? '?' + params : ''}`);
    }

    async getAirport(airportId) {
        return this.request(`/airports/${airportId}`);
    }

    async getNearbyAirports(lat, lng, radius = 100, limit = 20) {
        return this.request(`/airports/near/${lat}/${lng}?radius=${radius}&limit=${limit}`);
    }

    async getCountries() {
        return this.request('/airports/countries');
    }

    // =====================================
    // FINANCIAL DATA
    // =====================================

    async getFinancialRecords(companyId, filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/finance/company/${companyId}${params ? '?' + params : ''}`);
    }

    async getFinancialSummary(companyId, period = 30) {
        return this.request(`/finance/summary/${companyId}?period=${period}`);
    }

    async addTransaction(transactionData) {
        return this.request('/finance/transaction', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }

    async getProfitLossReport(companyId, startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        return this.request(`/finance/profit-loss/${companyId}${params.toString() ? '?' + params.toString() : ''}`);
    }

    async getCashFlowReport(companyId, months = 12) {
        return this.request(`/finance/cash-flow/${companyId}?months=${months}`);
    }

    // =====================================
    // HEALTH CHECK
    // =====================================

    async healthCheck() {
        return this.request('/health');
    }
}

/**
 * Singleton instance dell'API client
 */
const apiClient = new APIClient();

/**
 * Enhanced SaveLoad class che utilizza sia localStorage che database
 * Mantiene backward compatibility con il sistema localStorage esistente
 */
class EnhancedSaveLoad {
    constructor() {
        this.api = apiClient;
        this.currentCompanyId = null;
        this.useDatabase = true; // Flag per abilitare/disabilitare il database
        
        // Test connessione database all'avvio
        this.testDatabaseConnection();
    }

    async testDatabaseConnection() {
        try {
            await this.api.healthCheck();
            console.log('✅ Database connesso e disponibile');
            this.useDatabase = true;
        } catch (error) {
            console.warn('⚠️ Database non disponibile, uso solo localStorage:', error.message);
            this.useDatabase = false;
        }
    }

    // =====================================
    // METODI COMPATIBILI CON SAVELOAD ESISTENTE
    // =====================================

    async saveGame(gameData, saveName = 'autosave') {
        const timestamp = new Date().toISOString();
        const saveData = {
            ...gameData,
            timestamp,
            version: '2.0.0'
        };

        // Salva sempre in localStorage per backup
        try {
            localStorage.setItem(`air_tycoon_${saveName}`, JSON.stringify(saveData));
            console.log(`💾 Gioco salvato in localStorage: ${saveName}`);
        } catch (error) {
            console.error('❌ Errore salvataggio localStorage:', error);
        }

        // Salva nel database se disponibile
        if (this.useDatabase && this.currentCompanyId) {
            try {
                await this.api.saveGame(this.currentCompanyId, saveName, saveData);
                console.log(`🌐 Gioco salvato nel database: ${saveName}`);
                return { success: true, location: 'database', timestamp };
            } catch (error) {
                console.error('❌ Errore salvataggio database:', error);
                return { success: true, location: 'localStorage', timestamp, warning: 'Database non disponibile' };
            }
        }

        return { success: true, location: 'localStorage', timestamp };
    }

    async loadGame(saveName = 'autosave') {
        // Prova a caricare dal database prima
        if (this.useDatabase && this.currentCompanyId) {
            try {
                const saves = await this.api.getSaves(this.currentCompanyId);
                const save = saves.data.find(s => s.save_name === saveName);
                
                if (save) {
                    const saveData = await this.api.loadGame(save.id);
                    console.log(`🌐 Gioco caricato dal database: ${saveName}`);
                    return saveData.data.game_data;
                }
            } catch (error) {
                console.warn('⚠️ Errore caricamento database, provo localStorage:', error.message);
            }
        }

        // Fallback a localStorage
        try {
            const saveData = localStorage.getItem(`air_tycoon_${saveName}`);
            if (saveData) {
                console.log(`💾 Gioco caricato da localStorage: ${saveName}`);
                return JSON.parse(saveData);
            }
        } catch (error) {
            console.error('❌ Errore caricamento localStorage:', error);
        }

        throw new Error(`Salvataggio '${saveName}' non trovato`);
    }

    async getSavesList() {
        const saves = [];

        // Ottieni salvataggi dal database
        if (this.useDatabase && this.currentCompanyId) {
            try {
                const dbSaves = await this.api.getSaves(this.currentCompanyId);
                saves.push(...dbSaves.data.map(save => ({
                    name: save.save_name,
                    timestamp: save.updated_at,
                    location: 'database',
                    id: save.id
                })));
            } catch (error) {
                console.warn('⚠️ Errore ottenimento salvataggi database:', error.message);
            }
        }

        // Ottieni salvataggi da localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('air_tycoon_')) {
                    const saveName = key.replace('air_tycoon_', '');
                    const saveData = JSON.parse(localStorage.getItem(key));
                    
                    saves.push({
                        name: saveName,
                        timestamp: saveData.timestamp || 'Sconosciuto',
                        location: 'localStorage'
                    });
                }
            }
        } catch (error) {
            console.error('❌ Errore ottenimento salvataggi localStorage:', error);
        }

        return saves;
    }

    exportSave(saveName) {
        // Metodo esistente per export/import
        try {
            const saveData = localStorage.getItem(`air_tycoon_${saveName}`);
            if (!saveData) {
                throw new Error(`Salvataggio '${saveName}' non trovato`);
            }
            
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `air_tycoon_${saveName}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('❌ Errore export salvataggio:', error);
            return false;
        }
    }

    // =====================================
    // NUOVI METODI PER DATABASE
    // =====================================

    setCurrentCompany(companyId) {
        this.currentCompanyId = companyId;
    }

    async syncToDatabase() {
        if (!this.useDatabase || !this.currentCompanyId) {
            return false;
        }

        try {
            // Sincronizza tutti i salvataggi localStorage al database
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('air_tycoon_')) {
                    const saveName = key.replace('air_tycoon_', '');
                    const saveData = JSON.parse(localStorage.getItem(key));
                    
                    await this.api.saveGame(this.currentCompanyId, saveName, saveData);
                }
            }
            console.log('✅ Sincronizzazione al database completata');
            return true;
        } catch (error) {
            console.error('❌ Errore sincronizzazione database:', error);
            return false;
        }
    }
}

// Crea istanza globale del nuovo sistema di salvataggio
const enhancedSaveLoad = new EnhancedSaveLoad();

// Export per uso nei moduli
window.apiClient = apiClient;
window.SaveLoad = enhancedSaveLoad; // Sostituisce il SaveLoad esistente
