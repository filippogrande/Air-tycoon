// RouteUIManager - Gestione interfaccia utente per creazione rotte
console.log('📂 Caricamento RouteUIManager.js...');

var RouteUIManager = {
    
    // Stato UI
    routeCreationState: {
        isOpen: false,
        activeSlot: null,
        originAirport: null,
        destinationAirport: null,
        originLocked: true,  // Lucchetto attivo di default come richiesto
        selectedAircraftId: null,
        selectedRouteType: 'passenger'  // Default passeggeri
    },
    
    // Apri pannello creazione rotte
    openRouteCreationPanel: function() {
        console.log('🛣️ Apertura pannello creazione rotte...');
        
        var panel = document.getElementById('route-creation-panel');
        var triggerBtn = document.getElementById('open-route-panel');
        
        if (panel && triggerBtn) {
            // Mostra pannello e nascondi bottone
            panel.classList.add('active');
            triggerBtn.classList.add('hidden');
            
            // Aggiorna stato
            this.routeCreationState.isOpen = true;
            
            // Setup e mostra la selezione aeroplano subito
            this.setupAircraftSelector();
            
            console.log('✅ Pannello rotte aperto');
            return true;
        }
        return false;
    },
    
    // Chiudi pannello creazione rotte
    closeRouteCreationPanel: function() {
        console.log('🛣️ Chiusura pannello creazione rotte...');
        
        var panel = document.getElementById('route-creation-panel');
        var configPanel = document.getElementById('route-config-panel');
        var triggerBtn = document.getElementById('open-route-panel');
        
        // Chiudi entrambi i pannelli
        if (panel) {
            panel.classList.remove('active');
        }
        if (configPanel) {
            configPanel.classList.remove('active');
        }
        
        if (triggerBtn) {
            triggerBtn.classList.remove('hidden');
        }
        
        // Reset stato
        this.resetRouteCreationState();
        
        console.log('✅ Pannelli rotte chiusi');
        return true;
    },
    
    // Reset stato creazione rotte
    resetRouteCreationState: function() {
        this.routeCreationState = {
            isOpen: false,
            activeSlot: null,
            originAirport: null,
            destinationAirport: null,
            originLocked: true,  // Lucchetto attivo di default come richiesto
            selectedAircraftId: null,
            selectedRouteType: 'passenger'  // Default passeggeri
        };
        
        // Reset UI
        this.clearSlot('origin');
        this.clearSlot('destination');
        this.clearActiveSlots();
        this.updateCreateButton();
        this.hideRouteInfo();
        this.updateLockButton();
        
        // Reset selezione aeroplano
        var selector = document.getElementById('aircraft-selector-main');
        if (selector) {
            selector.value = '';
        }
    },
    
    // Aggiorna display slot
    updateSlotDisplay: function(slotType, airport) {
        var slotElement = document.getElementById(slotType + '-airport');
        if (!slotElement || !airport) return;
        
        var content = '<div class="airport-info">' +
                     '<div class="airport-name">' + airport.name + '</div>' +
                     '<div class="airport-code">' + airport.code + '</div>' +
                     '</div>' +
                     '<div class="airport-details">' + airport.city + ', ' + airport.country + '</div>';
        
        slotElement.innerHTML = content;
        slotElement.classList.add('selected');
        slotElement.classList.remove('active');
        
        // Se è l'origine aggiorna il lock button
        if (slotType === 'origin') {
            this.updateLockButton();
            this.updateOriginSlotAppearance();
        }
    },
    
    // Pulisci slot
    clearSlot: function(slotType) {
        var slotElement = document.getElementById(slotType + '-airport');
        if (!slotElement) return;
        
        var placeholder = slotType === 'origin' ? 'Seleziona aeroporto di partenza' : 'Seleziona aeroporto di arrivo';
        
        slotElement.innerHTML = '<span class="placeholder">' + placeholder + '</span>';
        slotElement.classList.remove('selected', 'active', 'locked');
        
        if (slotType === 'origin') {
            this.updateLockButton();
        }
    },
    
    // Seleziona slot attivo
    selectSlot: function(slotType) {
        this.clearActiveSlots();
        
        var slotElement = document.getElementById(slotType + '-airport');
        if (slotElement) {
            slotElement.classList.add('active');
            this.routeCreationState.activeSlot = slotType;
        }
    },
    
    // Pulisci tutti gli slot attivi
    clearActiveSlots: function() {
        var slots = ['origin', 'destination'];
        for (var i = 0; i < slots.length; i++) {
            var slotElement = document.getElementById(slots[i] + '-airport');
            if (slotElement) {
                slotElement.classList.remove('active');
            }
        }
    },
    
    // Aggiorna bottone crea rotta
    updateCreateButton: function() {
        var createBtn = document.getElementById('create-route-btn');
        if (!createBtn) return;
        
        var hasOrigin = this.routeCreationState.originAirport !== null;
        var hasDestination = this.routeCreationState.destinationAirport !== null;
        
        createBtn.disabled = !(hasOrigin && hasDestination);
    },
     // Mostra informazioni rotta
    updateRouteInfo: function(origin, destination) {
        if (!origin || !destination) {
            this.hideRouteInfo();
            return;
        }

        var routeInfoPanel = document.getElementById('route-info');
        if (!routeInfoPanel) return;

        // Usa DemandEstimationManager se disponibile per stime consistenti
        var estimates;
        if (game.demandManager) {
            var demandEstimate = game.demandManager.getPassengerEstimate(origin, destination);
            estimates = {
                distance: demandEstimate.distance,
                displayPassengers: demandEstimate.passengers,
                displayCargo: demandEstimate.cargo
            };
            
            // Calcola tempo di volo usando RouteCalculator
            if (typeof RouteCalculator !== 'undefined') {
                var routeCalc = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
                estimates.flightTime = routeCalc.flightTime;
            } else {
                estimates.flightTime = { formatted: 'N/A' };
            }
        } else {
            // Fallback al RouteCalculator
            estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
        }

        // Aggiorna display
        document.getElementById('route-distance').textContent = Math.round(estimates.distance);
        document.getElementById('flight-time').textContent = estimates.flightTime.formatted;
        document.getElementById('estimated-passengers').textContent = estimates.displayPassengers.toLocaleString();
        document.getElementById('estimated-cargo').textContent = estimates.displayCargo.toLocaleString();

        routeInfoPanel.style.display = 'block';
    },
    
    // Nascondi informazioni rotta
    hideRouteInfo: function() {
        var routeInfoPanel = document.getElementById('route-info');
        
        if (routeInfoPanel) {
            routeInfoPanel.style.display = 'none';
        }
    },
    
    // Aggiorna bottone lock
    updateLockButton: function() {
        var lockBtn = document.getElementById('lock-origin-btn');
        if (!lockBtn) return;
        
        var isLocked = this.routeCreationState.originLocked;
        var hasOrigin = this.routeCreationState.originAirport !== null;
        
        // Aggiorna icona e stato
        lockBtn.textContent = isLocked ? '🔒' : '🔓';
        lockBtn.title = isLocked ? 'Sblocca origine' : 'Blocca origine per confrontare destinazioni';
        
        // Aggiorna classi CSS
        if (isLocked) {
            lockBtn.classList.add('locked');
        } else {
            lockBtn.classList.remove('locked');
        }
        
        // Disabilita se non c'è origine
        lockBtn.disabled = !hasOrigin;
        lockBtn.style.opacity = hasOrigin ? '1' : '0.5';
    },
    
    // Aggiorna aspetto slot origine
    updateOriginSlotAppearance: function() {
        var originSlot = document.getElementById('origin-airport');
        if (!originSlot) return;
        
        if (this.routeCreationState.originLocked) {
            originSlot.classList.add('locked');
        } else {
            originSlot.classList.remove('locked');
        }
    },
    
    // Toggle lock origine
    toggleOriginLock: function() {
        console.log('� Toggle blocco origine...');
        
        // Se non c'è un aeroporto di origine, non può essere bloccato
        if (!this.routeCreationState.originAirport) {
            console.log('⚠️ Nessun aeroporto di origine da bloccare');
            return { success: false, message: 'Seleziona prima un aeroporto di origine' };
        }
        
        // Cambia stato blocco
        this.routeCreationState.originLocked = !this.routeCreationState.originLocked;
        
        // Aggiorna UI
        this.updateLockButton();
        this.updateOriginSlotAppearance();
        
        var status = this.routeCreationState.originLocked ? 'bloccata' : 'sbloccata';
        console.log('� Origine', status, ':', this.routeCreationState.originAirport.code);
        
        // Se bloccato, attiva automaticamente lo slot destinazione
        if (this.routeCreationState.originLocked) {
            this.selectSlot('destination');
        }
        
        return { success: true, message: 'Origine ' + status };
    },
    
    // Pulisci destinazione
    clearDestination: function() {
        console.log('🔄 Reset destinazione...');
        
        // Pulisci destinazione
        this.routeCreationState.destinationAirport = null;
        this.clearSlot('destination');
        
        // Aggiorna UI
        this.updateCreateButton();
        this.hideRouteInfo();
        
        // Attiva automaticamente lo slot destinazione per nuova selezione
        this.selectSlot('destination');
        
        console.log('✅ Destinazione resettata, pronto per nuova selezione');
        return { success: true, message: 'Destinazione resettata' };
    },
    
    // Crea popup per un aeroporto
    createAirportPopup: function(airport, isPlayerHub) {
        try {
            // Per ora ignoriamo isPlayerHub e mostriamo sempre un popup semplice
            
            // Cambia testo bottone se pannello rotte è aperto
            var routeButtonText = this.routeCreationState && this.routeCreationState.isOpen ? 
                                 'Aggiungi a Rotta' : 'Crea Rotta';
            
            var actions = '<div class="airport-actions">' +
                         '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">' + routeButtonText + '</button>' +
                         '</div>';
            
            // Tipo di aeroporto
            var hubStatus = airport.size === 'large' ? '⬢ Aeroporto Internazionale' : 
                           (airport.size === 'medium' ? '◆ Aeroporto Regionale' : '● Aeroporto Locale');
            
            // Mostra business e tourist level
            var businessLevel = airport.businessLevel || 'N/A';
            var touristLevel = airport.touristLevel || 'N/A';
            var trafficInfo = 'Business: ' + businessLevel + ' | Turismo: ' + touristLevel;
            
            return '<div class="airport-popup">' +
                   '<h3>' + (airport.name || 'Nome non disponibile') + '</h3>' +
                   '<p><strong>Codice:</strong> ' + (airport.code || 'N/A') + '</p>' +
                   '<p><strong>Città:</strong> ' + (airport.city || 'N/A') + '</p>' +
                   '<p><strong>Paese:</strong> ' + (airport.country || 'N/A') + '</p>' +
                   '<p><strong>Tipo:</strong> ' + hubStatus + '</p>' +
                   '<p><strong>Traffico:</strong> ' + trafficInfo + '</p>' +
                   actions +
                   '</div>';
        } catch (error) {
            console.error('❌ Errore nella creazione del popup aeroporto:', error);
            return '<div class="airport-popup">' +
                   '<h3>' + (airport.name || 'Errore') + '</h3>' +
                   '<p>Si è verificato un errore nel caricamento dei dati dell\'aeroporto.</p>' +
                   '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">Crea Rotta</button>' +
                   '</div>';
        }
    },
    
    // Inizializza i pannelli UI delle rotte caricando il template
    initializeRoutePanels: function() {
        console.log('🔧 Inizializzazione pannelli UI rotte...');
        
        return fetch('templates/route-panels.html')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Errore caricamento template: ' + response.status);
                }
                return response.text();
            })
            .then(function(html) {
                // Trova il container per i pannelli rotte (dentro world-tab)
                var worldTab = document.getElementById('world-tab');
                if (!worldTab) {
                    throw new Error('Container world-tab non trovato');
                }
                
                // Crea un container temporaneo per parsare l'HTML
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                // Aggiungi tutti gli elementi del template al world-tab
                while (tempDiv.firstChild) {
                    worldTab.appendChild(tempDiv.firstChild);
                }
                
                console.log('✅ Pannelli UI rotte caricati dinamicamente');
                return true;
            })
            .catch(function(error) {
                console.error('❌ Errore caricamento pannelli UI rotte:', error);
                return false;
            });
    },
    
    // Seleziona aeroporto per uno slot specifico
    selectAirportForSlot: function(airport, slotType) {
        console.log('🛫 Selezione aeroporto per slot:', airport.code, 'slot:', slotType);
        
        if (!airport) {
            console.warn('⚠️ Parametri mancanti per selectAirportForSlot');
            return false;
        }
        
        // Verifica che il pannello sia aperto
        if (!this.routeCreationState.isOpen) {
            console.log('📋 Pannello rotte non aperto, apertura automatica...');
            this.openRouteCreationPanel();
        }
        
        // Se slotType è 'auto' o non specificato, usa la logica intelligente
        if (!slotType || slotType === 'auto') {
            return this.smartAirportSelection(airport);
        }
        
        // Logica per slot specifici (per compatibilità con vecchio codice)
        if (slotType === 'origin') {
            this.routeCreationState.originAirport = airport;
            this.updateSlotDisplay('origin', airport);
        } else if (slotType === 'destination') {
            this.routeCreationState.destinationAirport = airport;
            this.updateSlotDisplay('destination', airport);
        }
        
        // Clear active slot dopo la selezione
        this.routeCreationState.activeSlot = null;
        this.clearActiveSlots();
        
        // Aggiorna UI
        this.updateCreateButton();
        
        // Se abbiamo entrambi gli aeroporti, mostra info rotta
        if (this.routeCreationState.originAirport && this.routeCreationState.destinationAirport) {
            this.updateRouteInfo(this.routeCreationState.originAirport, this.routeCreationState.destinationAirport);
        }
        
        return true;
    },
    
    // Logica di selezione intelligente degli aeroporti
    smartAirportSelection: function(airport) {
        var origin = this.routeCreationState.originAirport;
        var destination = this.routeCreationState.destinationAirport;
        var isLocked = this.routeCreationState.originLocked;
        
        // Se non c'è origine, questo aeroporto diventa origine
        if (!origin) {
            console.log('🔹 Primo aeroporto selezionato come origine:', airport.code);
            this.routeCreationState.originAirport = airport;
            this.updateSlotDisplay('origin', airport);
            
            // Seleziona automaticamente lo slot destinazione per il prossimo click
            this.selectSlot('destination');
            
        } else if (!destination) {
            // Se c'è origine ma non destinazione, questo diventa destinazione
            console.log('🔹 Secondo aeroporto selezionato come destinazione:', airport.code);
            this.routeCreationState.destinationAirport = airport;
            this.updateSlotDisplay('destination', airport);
            
        } else {
            // Entrambi gli slot sono occupati - comportamento dipende dal lucchetto
            if (isLocked) {
                // Con lucchetto: mantieni origine, cambia destinazione
                console.log('🔒 Lucchetto attivo - mantengo origine, cambio destinazione:', airport.code);
                this.routeCreationState.destinationAirport = airport;
                this.updateSlotDisplay('destination', airport);
            } else {
                // Senza lucchetto: la destinazione attuale diventa origine, nuovo aeroporto diventa destinazione
                console.log('🔄 Selezione sequenziale - la destinazione diventa origine:', airport.code);
                this.routeCreationState.originAirport = this.routeCreationState.destinationAirport;
                this.routeCreationState.destinationAirport = airport;
                this.updateSlotDisplay('origin', this.routeCreationState.originAirport);
                this.updateSlotDisplay('destination', airport);
            }
        }
        
        // Clear active slot dopo la selezione
        this.routeCreationState.activeSlot = null;
        this.clearActiveSlots();
        
        // Aggiorna UI
        this.updateCreateButton();
        
        // Se abbiamo entrambi gli aeroporti, mostra info rotta
        if (this.routeCreationState.originAirport && this.routeCreationState.destinationAirport) {
            this.updateRouteInfo(this.routeCreationState.originAirport, this.routeCreationState.destinationAirport);
        }
        
        console.log('✅ Aeroporto selezionato. Origine:', 
            this.routeCreationState.originAirport?.code, 
            'Destinazione:', 
            this.routeCreationState.destinationAirport?.code,
            'Locked:', this.routeCreationState.originLocked);
        return true;
    },
    
    // Apri pannello configurazione rotta
    openRouteConfigPanel: function() {
        console.log('⚙️ Apertura pannello configurazione rotta...');
        
        // Verifica che abbiamo origine e destinazione
        if (!this.routeCreationState.originAirport || !this.routeCreationState.destinationAirport) {
            console.warn('⚠️ Origine o destinazione mancante per configurazione rotta');
            return false;
        }
        
        // Nascondi pannello selezione
        var selectionPanel = document.getElementById('route-creation-panel');
        if (selectionPanel) {
            selectionPanel.classList.remove('active');
        }
        
        // Mostra pannello configurazione
        var configPanel = document.getElementById('route-config-panel');
        if (configPanel) {
            configPanel.classList.add('active');
            
            // Popola i dati della rotta
            this.populateRouteConfigData();
            
            console.log('✅ Pannello configurazione rotta aperto');
            return true;
        }
        
        console.error('❌ Pannello configurazione rotta non trovato');
        return false;
    },
    
    // Popola i dati nel pannello configurazione
    populateRouteConfigData: function() {
        var origin = this.routeCreationState.originAirport;
        var destination = this.routeCreationState.destinationAirport;
        
        if (!origin || !destination) return;
        
        // Aggiorna origine e destinazione
        var originSpan = document.getElementById('config-origin');
        var destinationSpan = document.getElementById('config-destination');
        
        if (originSpan) originSpan.textContent = origin.name + ' (' + origin.code + ')';
        if (destinationSpan) destinationSpan.textContent = destination.name + ' (' + destination.code + ')';
        
        // Popola stime domanda usando DemandEstimationManager
        this.populateDemandEstimates(origin, destination);
        
        // Setup event listener per miglioramento analisi
        this.setupDemandAnalysisButton(origin, destination);
        
        // Calcola dati rotta
        if (typeof RouteCalculator !== 'undefined') {
            var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
            
            // Aggiorna distanza e tempo di volo
            var distanceSpan = document.getElementById('config-distance');
            var flightTimeSpan = document.getElementById('config-flight-time');
            
            if (distanceSpan) distanceSpan.textContent = Math.round(estimates.distance);
            if (flightTimeSpan) flightTimeSpan.textContent = estimates.flightTime.formatted;
        }
        
        // Calcola costi
        this.updateRouteConfigCosts();
        
        // Popola aeroplani compatibili
        this.updateCompatibleAircraft();
    },
    
    // Aggiorna costi nel pannello configurazione
    updateRouteConfigCosts: function() {
        // Per ora impostiamo un costo base, in futuro può essere calcolato dinamicamente
        var baseCost = 50000; // €50,000 costo base
        
        var costSpan = document.getElementById('route-creation-cost');
        if (costSpan) {
            costSpan.textContent = baseCost.toLocaleString();
        }
        
        // Abilita il bottone di creazione
        var confirmBtn = document.getElementById('confirm-create-route');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    },
    
    // Aggiorna lista aeroplani compatibili
    updateCompatibleAircraft: function() {
        var origin = this.routeCreationState.originAirport;
        var destination = this.routeCreationState.destinationAirport;
        
        if (!origin || !destination) return;
        
        var aircraftList = document.getElementById('compatible-aircraft');
        var warningDiv = document.getElementById('no-aircraft-warning');
        
        if (!aircraftList || !warningDiv) return;
        
        // Calcola distanza rotta
        var distance = 0;
        if (typeof RouteCalculator !== 'undefined') {
            var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
            distance = estimates.distance;
        }
        
        // Ottieni lista aeroplani dal FleetManager
        var compatibleAircraft = [];
        if (typeof FleetManager !== 'undefined' && FleetManager.getOwnedAircraft) {
            var ownedAircraft = FleetManager.getOwnedAircraft();
            
            compatibleAircraft = ownedAircraft.filter(function(aircraft) {
                // Verifica se l'aereo può fare questa distanza
                return aircraft.range >= distance;
            });
        }
        
        // Se non ci sono aeroplani compatibili, mostra warning
        if (compatibleAircraft.length === 0) {
            aircraftList.innerHTML = '';
            warningDiv.style.display = 'flex';
            
            // Disabilita bottone creazione rotta
            var confirmBtn = document.getElementById('confirm-create-route');
            if (confirmBtn) {
                confirmBtn.disabled = true;
            }
        } else {
            // Mostra lista aeroplani
            warningDiv.style.display = 'none';
            
            var listHTML = '';
            compatibleAircraft.forEach(function(aircraft, index) {
                var statusClass = aircraft.isAvailable ? 'available' : 'busy';
                var statusText = aircraft.isAvailable ? 'Disponibile' : 'In uso';
                var selectedClass = index === 0 ? 'selected' : ''; // Seleziona il primo per default
                
                listHTML += '<div class="aircraft-item ' + selectedClass + '" data-aircraft-id="' + aircraft.id + '">' +
                           '<div class="aircraft-icon">✈️</div>' +
                           '<div class="aircraft-details">' +
                           '<div class="aircraft-name">' + aircraft.name + '</div>' +
                           '<div class="aircraft-specs">' + 
                           'Autonomia: ' + aircraft.range + 'km | ' +
                           'Passeggeri: ' + aircraft.passengers + ' | ' +
                           'Cargo: ' + aircraft.cargo + 't' +
                           '</div>' +
                           '</div>' +
                           '<div class="aircraft-status ' + statusClass + '">' + statusText + '</div>' +
                           '</div>';
            });
            
            aircraftList.innerHTML = listHTML;
            
            // Aggiungi listener per selezione aeroplano
            this.setupAircraftSelection();
            
            // Abilita bottone creazione rotta
            var confirmBtn = document.getElementById('confirm-create-route');
            if (confirmBtn) {
                confirmBtn.disabled = false;
            }
        }
    },
    
    // Setup selezione aeroplani
    setupAircraftSelection: function() {
        var aircraftItems = document.querySelectorAll('.aircraft-item');
        var self = this;
        
        aircraftItems.forEach(function(item) {
            item.addEventListener('click', function() {
                // Rimuovi selezione precedente
                aircraftItems.forEach(function(otherItem) {
                    otherItem.classList.remove('selected');
                });
                
                // Aggiungi selezione a questo item
                this.classList.add('selected');
                
                // Salva aeroplano selezionato
                var aircraftId = this.getAttribute('data-aircraft-id');
                self.routeCreationState.selectedAircraftId = aircraftId;
                
                console.log('✈️ Aeroplano selezionato:', aircraftId);
            });
        });
    },

    // Setup dropdown selezione aeroplano
    setupAircraftSelector: function() {
        var selector = document.getElementById('aircraft-selector-main');
        var self = this;
        
        if (!selector) {
            console.warn('⚠️ Dropdown selezione aeroplano non trovato');
            return;
        }
        
        if (!game.fleetManager) {
            console.warn('⚠️ FleetManager non disponibile');
            return;
        }
        
        // Popola il dropdown con gli aeroplani disponibili
        this.populateAircraftSelector();
        
        // Gestisci cambio selezione
        selector.addEventListener('change', function() {
            var aircraftId = this.value;
            
            if (aircraftId === '') {
                // Nessun aeroplano selezionato
                self.routeCreationState.selectedAircraftId = null;
                console.log('🚫 Nessun aereoplano selezionato');
            } else {
                // Aeroplano specifico selezionato
                self.routeCreationState.selectedAircraftId = aircraftId;
                console.log('✈️ Aeroplano selezionato:', aircraftId);
            }
            
            // Aggiorna i filtri degli aeroporti in base all'autonomia dell'aereo
            self.updateAirportFilters();
        });
    },
    
    // Popola il dropdown con gli aeroplani disponibili
    populateAircraftSelector: function() {
        var selector = document.getElementById('aircraft-selector-main');
        if (!selector || !game.fleetManager) return;
        
        // Svuota opzioni esistenti (tranne la prima - nessun aeroplano selezionato)
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        
        // Ottieni gli aeroplani dalla flotta
        var fleet = game.fleetManager.getAllAircraft();
        
        if (!fleet || fleet.length === 0) {
            // Nessun aeroplano nella flotta
            var option = document.createElement('option');
            option.value = '';
            option.textContent = '🚫 Nessun aereo in flotta';
            option.disabled = true;
            selector.appendChild(option);
            console.log('⚠️ Nessun aeroplano disponibile nella flotta');
            return;
        }
        
        fleet.forEach(function(aircraft) {
            var option = document.createElement('option');
            option.value = aircraft.id;
            option.textContent = aircraft.model + ' (' + aircraft.status + ')';
            
            // Disabilita se l'aereo è già assegnato
            if (aircraft.status !== 'available') {
                option.disabled = true;
                option.textContent += ' - Non Disponibile';
            }
            
            selector.appendChild(option);
        });
        
        console.log('✈️ Caricati', fleet.length, 'aeroplani nel dropdown');
    },
    
    // Chiudi pannello configurazione e torna alla selezione
    backToSelection: function() {
        console.log('⬅️ Ritorno alla selezione aeroporti...');
        
        // Nascondi pannello configurazione
        var configPanel = document.getElementById('route-config-panel');
        if (configPanel) {
            configPanel.classList.remove('active');
        }
        
        // Mostra pannello selezione
        var selectionPanel = document.getElementById('route-creation-panel');
        if (selectionPanel) {
            selectionPanel.classList.add('active');
        }
        
        console.log('✅ Tornato alla selezione aeroporti');
        return true;
    },
    
    // Chiudi pannello configurazione rotta
    closeRouteConfigPanel: function() {
        console.log('🔄 Chiusura pannello configurazione rotta...');
        
        var configPanel = document.getElementById('route-config-panel');
        if (configPanel) {
            configPanel.classList.remove('active');
            console.log('✅ Pannello configurazione chiuso');
            return true;
        }
        
        return false;
    },
    
    // Popola stime domanda usando DemandEstimationManager
    populateDemandEstimates: function(origin, destination) {
        if (!origin || !destination) return;
        
        var passengerSpan = document.getElementById('config-passengers');
        var cargoSpan = document.getElementById('config-cargo');
        
        if (!passengerSpan || !cargoSpan) return;
        
        // Usa DemandEstimationManager se disponibile, altrimenti fallback a RouteCalculator
        if (game.demandManager) {
            var estimate = game.demandManager.getPassengerEstimate(origin, destination);
            
            if (passengerSpan) passengerSpan.textContent = estimate.passengers.toLocaleString();
            if (cargoSpan) cargoSpan.textContent = estimate.cargo.toLocaleString();
            
            console.log('📊 Stime aggiornate:', estimate.passengers, 'passeggeri,', estimate.cargo, 'tonnellate cargo');
            
            // Mostra accuratezza della stima
            this.updateEstimateAccuracy(estimate.analysisLevel);
            
        } else if (typeof RouteCalculator !== 'undefined') {
            // Fallback al RouteCalculator
            var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
            
            if (passengerSpan) passengerSpan.textContent = estimates.displayPassengers;
            if (cargoSpan) cargoSpan.textContent = estimates.displayCargo;
            
            console.log('📊 Stime base (RouteCalculator):', estimates.displayPassengers, 'passeggeri');
        }
    },
    
    // Aggiorna indicatore accuratezza stima
    updateEstimateAccuracy: function(analysisLevel) {
        var demandEstimates = document.getElementById('demand-estimates');
        if (!demandEstimates) return;
        
        // Rimuovi classi precedenti
        demandEstimates.classList.remove('basic-analysis', 'improved-analysis', 'precise-analysis');
        
        // Aggiungi classe appropriata
        switch (analysisLevel) {
            case 'basic':
                demandEstimates.classList.add('basic-analysis');
                break;
            case 'improved':
                demandEstimates.classList.add('improved-analysis');
                break;
            case 'precise':
                demandEstimates.classList.add('precise-analysis');
                break;
        }
        
        // Aggiorna tooltip o indicatore
        var accuracyIndicator = demandEstimates.querySelector('.accuracy-indicator');
        if (!accuracyIndicator) {
            accuracyIndicator = document.createElement('div');
            accuracyIndicator.className = 'accuracy-indicator';
            demandEstimates.appendChild(accuracyIndicator);
        }
        
        switch (analysisLevel) {
            case 'basic':
                accuracyIndicator.innerHTML = '📊 <span class="accuracy-text">Stima Base (±30%)</span>';
                break;
            case 'improved':
                accuracyIndicator.innerHTML = '📈 <span class="accuracy-text">Stima Migliorata (±8%)</span>';
                break;
            case 'precise':
                accuracyIndicator.innerHTML = '🎯 <span class="accuracy-text">Stima Precisa (±3%)</span>';
                break;
        }
    },
    
    // Setup event listener per pulsante miglioramento analisi
    setupDemandAnalysisButton: function(origin, destination) {
        var improveBtn = document.getElementById('improve-analysis-btn');
        var self = this;
        
        if (!improveBtn) return;
        
        // Rimuovi listener precedenti
        var newBtn = improveBtn.cloneNode(true);
        improveBtn.parentNode.replaceChild(newBtn, improveBtn);
        improveBtn = newBtn;
        
        // Controlla stato del pulsante
        this.updateImproveAnalysisButton(origin, destination);
        
        // Aggiungi nuovo listener
        improveBtn.addEventListener('click', function() {
            self.improveRouteAnalysis(origin, destination);
        });
    },
    
    // Aggiorna stato pulsante miglioramento analisi
    updateImproveAnalysisButton: function(origin, destination) {
        var improveBtn = document.getElementById('improve-analysis-btn');
        if (!improveBtn || !game.demandManager) return;
        
        var routeKey = game.demandManager.getRouteKey(origin.code, destination.code);
        var improved = game.demandManager.improvedEstimates[routeKey];
        
        var btnTitle = improveBtn.querySelector('.btn-title');
        var btnSubtitle = improveBtn.querySelector('.btn-subtitle');
        var btnPrice = improveBtn.querySelector('.btn-price');
        
        if (improved && game.demandManager.isAnalysisValid(improved)) {
            // Analisi già migliorata
            improveBtn.disabled = true;
            improveBtn.classList.add('completed');
            
            if (btnTitle) btnTitle.textContent = 'Analisi Migliorata';
            if (btnSubtitle) {
                var expirationMonth = game.demandManager.getExpirationMonth(improved);
                btnSubtitle.textContent = 'Valida fino a ' + expirationMonth;
            }
            if (btnPrice) btnPrice.textContent = '✅ Completata';
            
        } else {
            // Analisi non ancora migliorata o scaduta
            improveBtn.disabled = false;
            improveBtn.classList.remove('completed');
            
            if (btnTitle) btnTitle.textContent = 'Migliora Stima Domanda';
            if (btnSubtitle) btnSubtitle.textContent = 'Analisi dettagliata del traffico';
            if (btnPrice) btnPrice.textContent = '€' + game.demandManager.analysisState.basicAnalysisCost.toLocaleString();
            
            // Controlla se il giocatore ha abbastanza denaro
            var currentMoney = game.state.money || game.state.company.money || 0;
            if (currentMoney < game.demandManager.analysisState.basicAnalysisCost) {
                improveBtn.disabled = true;
                improveBtn.classList.add('insufficient-funds');
                if (btnPrice) btnPrice.textContent = '💰 Fondi insufficienti';
            } else {
                improveBtn.classList.remove('insufficient-funds');
            }
        }
    },
    
    // Migliora analisi per la rotta
    improveRouteAnalysis: function(origin, destination) {
        if (!game.demandManager) {
            console.error('❌ DemandEstimationManager non disponibile');
            return;
        }
        
        console.log('🔍 Miglioramento analisi per rotta:', origin.code, '→', destination.code);
        
        var result = game.demandManager.improveAnalysis(origin.code, destination.code);
        
        if (result.success) {
            // Successo
            console.log('✅ Analisi migliorata:', result.message);
            
            // Aggiorna UI
            this.populateDemandEstimates(origin, destination);
            this.updateImproveAnalysisButton(origin, destination);
            
            // Aggiorna denaro nel header
            if (game.uiManager && game.uiManager.updateUI) {
                game.uiManager.updateUI();
            }
            
            // Mostra notifica
            if (game.uiManager && game.uiManager.showNotification) {
                game.uiManager.showNotification(
                    '📈 Analisi migliorata! Stime più precise per 12 mesi. -€' + result.cost.toLocaleString(),
                    'success'
                );
            }
            
            // Effetto visivo
            this.showAnalysisImprovementEffect();
            
        } else {
            // Errore
            console.warn('⚠️ Errore miglioramento analisi:', result.message);
            
            if (game.uiManager && game.uiManager.showNotification) {
                game.uiManager.showNotification(result.message, 'warning');
            }
        }
    },
    
    // Effetto visivo per miglioramento analisi
    showAnalysisImprovementEffect: function() {
        var demandEstimates = document.getElementById('demand-estimates');
        if (!demandEstimates) return;
        
        // Effetto di highlight temporaneo
        demandEstimates.classList.add('analysis-improved');
        
        setTimeout(function() {
            demandEstimates.classList.remove('analysis-improved');
        }, 2000);
        
        // Effetto particelle se si vuole essere più fancy
        this.createAnalysisParticles();
    },
    
    // Crea effetto particelle per analisi migliorata
    createAnalysisParticles: function() {
        var demandSection = document.querySelector('.demand-analysis');
        if (!demandSection) return;
        
        var particles = ['📊', '📈', '🎯', '✨'];
        
        for (var i = 0; i < 6; i++) {
            setTimeout(function() {
                var particle = document.createElement('div');
                particle.className = 'analysis-particle';
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                particle.style.position = 'absolute';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = '50%';
                particle.style.fontSize = '16px';
                particle.style.pointerEvents = 'none';
                particle.style.animation = 'floatUp 1.5s ease-out forwards';
                
                demandSection.style.position = 'relative';
                demandSection.appendChild(particle);
                
                setTimeout(function() {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1500);
            }, i * 200);
        }
    },
};

// Export per uso globale
window.RouteUIManager = RouteUIManager;
console.log('✅ RouteUIManager caricato');
