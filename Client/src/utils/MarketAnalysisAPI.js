// Client API per gestione analisi di mercato e azioni a pagamento

var MarketAnalysisAPI = {
    
    // Base URL per le API
    baseURL: '/api/market-analysis',
    
    // Configurazione default
    config: {
        timeout: 10000, // 10 secondi
        retries: 3
    },
    
    // =====================================================
    // ANALISI DI MERCATO
    // =====================================================
    
    /**
     * Verifica se esiste un'analisi di mercato per una rotta
     * @param {string} originCode - Codice IATA aeroporto origine
     * @param {string} destinationCode - Codice IATA aeroporto destinazione
     * @param {number} companyId - ID della compagnia
     * @param {string} analysisType - Tipo di analisi ('standard', 'premium', 'detailed')
     * @returns {Promise} - Risultato della verifica
     */
    checkMarketAnalysis: function(originCode, destinationCode, companyId, analysisType = 'standard') {
        
        return this.makeRequest(
            'GET',
            `/market-analysis/${originCode}/${destinationCode}?company_id=${companyId}&analysis_type=${analysisType}`
        ).then(function(response) {
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Errore controllo analisi');
            }
        });
    },
    
    /**
     * Acquista una nuova analisi di mercato
     * @param {Object} data - Dati per l'acquisto
     * @returns {Promise} - Risultato dell'acquisto
     */
    purchaseMarketAnalysis: function(data) {
        
        // Validazione input
        if (!data.company_id || !data.origin_airport_code || !data.destination_airport_code || !data.cost) {
            return Promise.reject(new Error('Dati mancanti per l\'acquisto dell\'analisi'));
        }
        
        return this.makeRequest('POST', '/market-analysis', data)
            .then(function(response) {
                if (response.success) {
                    return response;
                } else {
                    throw new Error(response.message || 'Errore acquisto analisi');
                }
            });
    },
    
    // =====================================================
    // MIGLIORAMENTI DOMANDA
    // =====================================================
    
    /**
     * Ottiene i miglioramenti domanda per una rotta
     * @param {string} originCode - Codice IATA aeroporto origine
     * @param {string} destinationCode - Codice IATA aeroporto destinazione
     * @param {number} companyId - ID della compagnia
     * @returns {Promise} - Lista dei miglioramenti
     */
    getDemandImprovements: function(originCode, destinationCode, companyId) {
        
        return this.makeRequest(
            'GET',
            `/demand-improvements/${originCode}/${destinationCode}?company_id=${companyId}`
        );
    },
    
    /**
     * Acquista un nuovo miglioramento domanda
     * @param {Object} data - Dati per l'acquisto
     * @returns {Promise} - Risultato dell'acquisto
     */
    purchaseDemandImprovement: function(data) {
        
        return this.makeRequest('POST', '/demand-improvements', data)
            .then(function(response) {
                if (response.success) {
                    return response;
                } else {
                    throw new Error(response.message || 'Errore acquisto miglioramento');
                }
            });
    },
    
    // =====================================================
    // HELPER METHODS
    // =====================================================
    
    /**
     * Effettua una richiesta HTTP con retry automatico
     * @param {string} method - Metodo HTTP
     * @param {string} endpoint - Endpoint API
     * @param {Object} data - Dati da inviare (per POST/PUT)
     * @returns {Promise} - Risposta della richiesta
     */
    makeRequest: function(method, endpoint, data = null) {
        const url = this.baseURL + endpoint;
        
        return this.performRequest(method, url, data, 0);
    },
    
    /**
     * Esegue la richiesta HTTP effettiva con gestione retry
     * @param {string} method - Metodo HTTP
     * @param {string} url - URL completo
     * @param {Object} data - Dati da inviare
     * @param {number} attempt - Numero tentativo corrente
     * @returns {Promise} - Risposta della richiesta
     */
    performRequest: function(method, url, data, attempt) {
        const self = this;
        
        return new Promise(function(resolve, reject) {
            const xhr = new XMLHttpRequest();
            
            // Timeout
            const timeoutId = setTimeout(function() {
                xhr.abort();
                reject(new Error('Request timeout'));
            }, self.config.timeout);
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    clearTimeout(timeoutId);
                    
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            reject(new Error('Errore parsing risposta JSON'));
                        }
                    } else if (xhr.status >= 500 && attempt < self.config.retries) {
                        // Retry per errori server
                        console.warn(`⚠️ Errore ${xhr.status}, tentativo ${attempt + 1}/${self.config.retries}`);
                        setTimeout(function() {
                            self.performRequest(method, url, data, attempt + 1)
                                .then(resolve)
                                .catch(reject);
                        }, 1000 * (attempt + 1)); // Exponential backoff
                    } else {
                        try {
                            const errorResponse = JSON.parse(xhr.responseText);
                            reject(new Error(errorResponse.message || `HTTP ${xhr.status}`));
                        } catch (e) {
                            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                        }
                    }
                }
            };
            
            xhr.onerror = function() {
                clearTimeout(timeoutId);
                if (attempt < self.config.retries) {
                    console.warn(`⚠️ Errore di rete, tentativo ${attempt + 1}/${self.config.retries}`);
                    setTimeout(function() {
                        self.performRequest(method, url, data, attempt + 1)
                            .then(resolve)
                            .catch(reject);
                    }, 1000 * (attempt + 1));
                } else {
                    reject(new Error('Errore di rete'));
                }
            };
            
            // Configura richiesta
            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            // Invia richiesta
            if (data && (method === 'POST' || method === 'PUT')) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
    },
    
    /**
     * Ottiene ID della compagnia corrente
     * @returns {number|null} - ID della compagnia o null se non trovato
     */
    getCurrentCompanyId: function() {
        if (typeof game !== 'undefined' && game.state && game.state.company) {
            return game.state.company.id;
        }
        
        // Fallback: prova a ottenere dalla sessionStorage o localStorage
        try {
            const savedGame = JSON.parse(localStorage.getItem('airTycoonSave') || '{}');
            return savedGame.company?.id || null;
        } catch (e) {
            console.warn('⚠️ Impossibile ottenere company ID');
            return null;
        }
    },
    
    /**
     * Verifica se i fondi sono sufficienti per un acquisto
     * @param {number} cost - Costo dell'acquisto
     * @returns {Object} - Risultato della verifica
     */
    checkFunds: function(cost) {
        let currentMoney = 0;
        
        if (typeof game !== 'undefined' && game.state) {
            if (game.state.money !== undefined) {
                currentMoney = game.state.money;
            } else if (game.state.company && game.state.company.money !== undefined) {
                currentMoney = game.state.company.money;
            }
        }
        
        return {
            sufficient: currentMoney >= cost,
            current: currentMoney,
            required: cost,
            deficit: Math.max(0, cost - currentMoney)
        };
    },
    
    /**
     * Aggiorna il denaro locale dopo un acquisto
     * @param {number} cost - Costo dell'acquisto
     */
    updateLocalMoney: function(cost) {
        if (typeof game !== 'undefined' && game.state) {
            if (game.state.money !== undefined) {
                game.state.money -= cost;
            } else if (game.state.company && game.state.company.money !== undefined) {
                game.state.company.money -= cost;
            }
            
            // Aggiorna UI se disponibile
            if (game.uiManager && game.uiManager.updateUI) {
                game.uiManager.updateUI();
            }
        }
    }
};

// Export per uso globale
window.MarketAnalysisAPI = MarketAnalysisAPI;
