// RouteCreationManager - Gestione creazione e configurazione rotte

var RouteCreationManager = {
    
    // Crea una nuova rotta
    createRoute: function() {
        
        // Ottieni stato corrente
        var state = window.RouteStateManager ? window.RouteStateManager.getCurrentState() : null;
        if (!state) {
            console.error('❌ Impossibile ottenere stato rotta');
            this.showCreationError('Errore interno: stato non disponibile');
            return false;
        }
        
        // Verifica prerequisiti
        if (!this.validateRouteData(state)) {
            return false;
        }
        
        // Mostra loading
        this.showCreationLoading(true);
        
        // Safe access to global `game`
        var gameRef = (typeof window !== 'undefined' && window.game) ? window.game : (typeof game !== 'undefined' ? game : null);
        
        if (!gameRef) {
            console.warn('⚠️ Game non inizializzato, fallback a simulazione');
            this.simulateRouteCreation(state);
            return false;
        }
        
        var self = this;
        
        try {
            // Prepara dati rotta
            var routeData = this.prepareRouteData(state);
            
            // Simula processo di creazione asincrono
            setTimeout(function() {
                if (gameRef.routeManager && gameRef.routeManager.createRoute) {
                    // Usa il manager delle rotte reale
                    gameRef.routeManager.createRoute(routeData)
                        .then(function(result) {
                            self.showCreationSuccess(result);
                            self.resetCreationForm();
                        })
                        .catch(function(error) {
                            console.error('❌ Errore nella creazione rotta:', error);
                            self.showCreationError(error.message || 'Errore sconosciuto');
                        })
                        .finally(function() {
                            self.showCreationLoading(false);
                        });
                } else {
                    // Fallback con simulazione
                    self.simulateRouteCreation(state);
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Errore durante preparazione rotta:', error);
            this.showCreationError('Errore nella preparazione dei dati');
            this.showCreationLoading(false);
            return false;
        }
        
        return true;
    },
    
    // Valida dati per creazione rotta
    validateRouteData: function(state) {
        var errors = [];
        
        if (!state.origin) {
            errors.push('Seleziona aeroporto di partenza');
        }
        
        if (!state.destination) {
            errors.push('Seleziona aeroporto di destinazione');
        }
        
        if (state.origin && state.destination && state.origin.code === state.destination.code) {
            errors.push('Partenza e destinazione devono essere diverse');
        }
        
        if (!state.selectedAircraftId) {
            errors.push('Seleziona un aeroplano');
        }
        
        if (!state.routeType) {
            errors.push('Seleziona tipo di rotta');
        }
        
        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }
        
        return true;
    },
    
    // Prepara dati per la creazione
    prepareRouteData: function(state) {
        // Safe access to global managers
        var gameRef = (typeof window !== 'undefined' && window.game) ? window.game : (typeof game !== 'undefined' ? game : null);
        
        var routeData = {
            origin: state.origin.code,
            destination: state.destination.code,
            aircraftId: state.selectedAircraftId,
            routeType: state.routeType,
            frequency: this.calculateOptimalFrequency(state),
            pricing: this.calculateOptimalPricing(state),
            schedule: this.generateSchedule(state),
            configuration: this.getAircraftConfiguration(state.selectedAircraftId)
        };
        
        // Aggiungi dati aggiuntivi se disponibili
        if (window.RouteDemandAnalysisManager) {
            var demandData = window.RouteDemandAnalysisManager.getCachedAnalysis(state.origin, state.destination, state.routeType);
            if (demandData) {
                routeData.demandEstimates = demandData;
            }
        }
        
        if (window.RouteMarketAnalysisManager) {
            var marketData = window.RouteMarketAnalysisManager.marketCache[state.origin.code + '-' + state.destination.code + '-market'];
            if (marketData) {
                routeData.marketAnalysis = marketData;
            }
        }
        
        return routeData;
    },
    
    // Calcola frequenza ottimale
    calculateOptimalFrequency: function(state) {
        var distance = this.calculateDistance(state.origin, state.destination);
        
        // Frequenza base in base alla distanza
        var baseFrequency = 3;
        if (distance < 500) baseFrequency = 7;
        else if (distance < 1000) baseFrequency = 5;
        else if (distance < 2000) baseFrequency = 3;
        else baseFrequency = 2;
        
        return Math.max(1, Math.min(baseFrequency, 14));
    },
    
    // Calcola pricing ottimale
    calculateOptimalPricing: function(state) {
        var distance = this.calculateDistance(state.origin, state.destination);
        var basePricePerKm = 0.12;
        
        if (state.routeType === 'cargo') {
            basePricePerKm = 0.08;
        } else if (state.routeType === 'premium') {
            basePricePerKm = 0.18;
        }
        
        var basePrice = distance * basePricePerKm;
        
        return {
            economy: Math.round(basePrice * 0.8),
            business: Math.round(basePrice * 1.5),
            firstClass: Math.round(basePrice * 2.8)
        };
    },
    
    // Genera schedule di volo
    generateSchedule: function(state) {
        var frequency = this.calculateOptimalFrequency(state);
        var schedule = [];
        
        // Distribuisci i voli nella settimana
        var daysOfWeek = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
        var selectedDays = [];
        
        if (frequency <= 7) {
            // Distribuisci uniformemente
            var step = Math.floor(7 / frequency);
            for (var i = 0; i < frequency; i++) {
                selectedDays.push(daysOfWeek[i * step % 7]);
            }
        } else {
            // Più voli al giorno
            var dailyFlights = Math.ceil(frequency / 7);
            for (var i = 0; i < 7; i++) {
                for (var j = 0; j < dailyFlights && schedule.length < frequency; j++) {
                    selectedDays.push(daysOfWeek[i]);
                }
            }
        }
        
        // Genera orari
        selectedDays.forEach(function(day, index) {
            var hour = 6 + (index % 3) * 6; // 6:00, 12:00, 18:00
            schedule.push({
                day: day,
                departureTime: hour + ':00',
                estimatedDuration: Math.round(state.distance / 800 * 60) + ' min'
            });
        });
        
        return schedule;
    },
    
    // Ottieni configurazione aeroplano
    getAircraftConfiguration: function(aircraftId) {
        // Safe access to global `game`
        var gameRef = (typeof window !== 'undefined' && window.game) ? window.game : (typeof game !== 'undefined' ? game : null);
        
        if (gameRef && gameRef.fleetManager) {
            var aircraft = gameRef.fleetManager.getAircraft(aircraftId);
            if (aircraft) {
                return aircraft.configuration || {
                    economy: aircraft.passengers * 0.8,
                    business: aircraft.passengers * 0.2,
                    cargo: aircraft.cargo || 0
                };
            }
        }
        
        // Fallback con configurazione base
        return {
            economy: 120,
            business: 30,
            cargo: 5
        };
    },
    
    // Simula creazione rotta (fallback)
    simulateRouteCreation: function(state) {
        var self = this;
        
        
        setTimeout(function() {
            var success = Math.random() > 0.2; // 80% successo
            
            if (success) {
                var routeResult = {
                    id: 'ROUTE_' + Date.now(),
                    origin: state.origin.code,
                    destination: state.destination.code,
                    status: 'active',
                    createdAt: new Date().toISOString()
                };
                
                self.showCreationSuccess(routeResult);
                self.resetCreationForm();
            } else {
                self.showCreationError('Simulazione: aeroplano non disponibile');
            }
            
            self.showCreationLoading(false);
        }, 2000);
    },
    
    // Mostra errori di validazione
    showValidationErrors: function(errors) {
        var errorContainer = document.getElementById('route-creation-errors');
        if (!errorContainer) {
            console.warn('⚠️ Container errori non trovato');
            alert('Errori: ' + errors.join(', '));
            return;
        }
        
        var html = '<div class="validation-errors">';
        html += '<h4>⚠️ Correggere i seguenti errori:</h4>';
        html += '<ul>';
        errors.forEach(function(error) {
            html += '<li>' + error + '</li>';
        });
        html += '</ul></div>';
        
        errorContainer.innerHTML = html;
        errorContainer.style.display = 'block';
        
        // Nascondi dopo 5 secondi
        setTimeout(function() {
            errorContainer.style.display = 'none';
        }, 5000);
    },
    
    // Mostra/nascondi loading creazione
    showCreationLoading: function(show) {
        var loadingElement = document.getElementById('route-creation-loading');
        var createButton = document.getElementById('confirm-create-route');
        
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
        
        if (createButton) {
            createButton.disabled = show;
            createButton.textContent = show ? '⏳ Creazione...' : '🛫 Conferma Creazione';
        }
    },
    
    // Mostra successo creazione
    showCreationSuccess: function(routeResult) {
        var successContainer = document.getElementById('route-creation-success');
        if (!successContainer) {
            alert('✅ Rotta creata con successo!');
            return;
        }
        
        successContainer.innerHTML = `
            <div class="success-message">
                <h4>✅ Rotta Creata con Successo!</h4>
                <p><strong>ID:</strong> ${routeResult.id}</p>
                <p><strong>Rotta:</strong> ${routeResult.origin} → ${routeResult.destination}</p>
                <p><strong>Status:</strong> ${routeResult.status}</p>
                <button id="view-route-details" class="btn-primary">📋 Visualizza Dettagli</button>
            </div>
        `;
        
        successContainer.style.display = 'block';
        
        // Nascondi dopo 8 secondi
        setTimeout(function() {
            successContainer.style.display = 'none';
        }, 8000);
        
        // Setup listener per visualizza dettagli
        var viewButton = document.getElementById('view-route-details');
        if (viewButton) {
            viewButton.addEventListener('click', function() {
                // Qui si potrebbe aprire un modal con i dettagli
            });
        }
    },
    
    // Mostra errore creazione
    showCreationError: function(errorMessage) {
        var errorContainer = document.getElementById('route-creation-errors');
        if (!errorContainer) {
            alert('❌ Errore: ' + errorMessage);
            return;
        }
        
        errorContainer.innerHTML = `
            <div class="creation-error">
                <h4>❌ Errore nella Creazione</h4>
                <p>${errorMessage}</p>
                <button id="retry-creation" class="btn-secondary">🔄 Riprova</button>
            </div>
        `;
        
        errorContainer.style.display = 'block';
        
        // Setup listener per riprova
        var retryButton = document.getElementById('retry-creation');
        if (retryButton) {
            var self = this;
            retryButton.addEventListener('click', function() {
                errorContainer.style.display = 'none';
                self.createRoute();
            });
        }
        
        // Nascondi dopo 10 secondi
        setTimeout(function() {
            errorContainer.style.display = 'none';
        }, 10000);
    },
    
    // Reset form di creazione
    resetCreationForm: function() {
        if (window.RouteStateManager) {
            window.RouteStateManager.resetState();
        }
        
        if (window.RoutePanelManager) {
            window.RoutePanelManager.closeCreationPanel();
        }
        
        if (window.RouteAircraftManager) {
            window.RouteAircraftManager.resetSelection();
        }
        
        // Nascondi messaggi di errore/successo
        var errorContainer = document.getElementById('route-creation-errors');
        var successContainer = document.getElementById('route-creation-success');
        
        if (errorContainer) errorContainer.style.display = 'none';
        if (successContainer) successContainer.style.display = 'none';
        
    },
    
    // Calcola distanza tra aeroporti
    calculateDistance: function(origin, destination) {
        if (!origin.lat || !origin.lon || !destination.lat || !destination.lon) {
            return 1000;
        }
        
        var R = 6371;
        var dLat = (destination.lat - origin.lat) * Math.PI / 180;
        var dLon = (destination.lon - origin.lon) * Math.PI / 180;
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    },
    
    // Salva rotta come draft
    saveDraft: function() {
        var state = window.RouteStateManager ? window.RouteStateManager.getCurrentState() : null;
        if (!state || !state.origin || !state.destination) {
            console.warn('⚠️ Stato insufficiente per salvare draft');
            return false;
        }
        
        var draftKey = 'route_draft_' + Date.now();
        var draftData = {
            ...state,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(draftKey, JSON.stringify(draftData));
            
            // Mostra conferma
            var notification = document.createElement('div');
            notification.className = 'draft-saved-notification';
            notification.textContent = '💾 Draft salvato';
            document.body.appendChild(notification);
            
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 3000);
            
            return true;
        } catch (error) {
            console.error('❌ Errore nel salvataggio draft:', error);
            return false;
        }
    },
    
    // Carica draft salvati
    loadDrafts: function() {
        var drafts = [];
        
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.startsWith('route_draft_')) {
                    var draftData = JSON.parse(localStorage.getItem(key));
                    drafts.push({
                        key: key,
                        data: draftData
                    });
                }
            }
        } catch (error) {
            console.error('❌ Errore nel caricamento drafts:', error);
        }
        
        // Ordina per data (più recenti prima)
        drafts.sort(function(a, b) {
            return new Date(b.data.savedAt) - new Date(a.data.savedAt);
        });
        
        return drafts;
    }
};

// Export globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteCreationManager;
} else if (typeof window !== 'undefined') {
    window.RouteCreationManager = RouteCreationManager;
}
