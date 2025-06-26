// RouteUIManager - Gestione interfaccia utente per creazione rotte
console.log('📂 Caricamento RouteUIManager.js...');

var RouteUIManager = {
    
    // Stato UI
    routeCreationState: {
        isOpen: false,
        activeSlot: null,
        originAirport: null,
        destinationAirport: null,
        originLocked: false
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
            
            console.log('✅ Pannello rotte aperto');
            return true;
        }
        return false;
    },
    
    // Chiudi pannello creazione rotte
    closeRouteCreationPanel: function() {
        console.log('🛣️ Chiusura pannello creazione rotte...');
        
        var panel = document.getElementById('route-creation-panel');
        var triggerBtn = document.getElementById('open-route-panel');
        
        if (panel && triggerBtn) {
            // Nascondi pannello e mostra bottone
            panel.classList.remove('active');
            triggerBtn.classList.remove('hidden');
            
            // Reset stato
            this.resetRouteCreationState();
            
            console.log('✅ Pannello rotte chiuso');
            return true;
        }
        return false;
    },
    
    // Reset stato creazione rotte
    resetRouteCreationState: function() {
        this.routeCreationState = {
            isOpen: false,
            activeSlot: null,
            originAirport: null,
            destinationAirport: null,
            originLocked: false
        };
        
        // Reset UI
        this.clearSlot('origin');
        this.clearSlot('destination');
        this.clearActiveSlots();
        this.updateCreateButton();
        this.hideRouteInfo();
        this.updateLockButton();
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
        
        // Calcola stime usando RouteCalculator
        var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
        
        // Aggiorna display
        document.getElementById('route-distance').textContent = Math.round(estimates.distance);
        document.getElementById('flight-time').textContent = estimates.flightTime.formatted;
        document.getElementById('estimated-passengers').textContent = estimates.displayPassengers;
        document.getElementById('estimated-cargo').textContent = estimates.displayCargo;
        
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
        
        if (this.routeCreationState.originLocked) {
            lockBtn.classList.add('locked');
            lockBtn.textContent = '🔒';
            lockBtn.title = 'Origine bloccata - clicca per sbloccare';
        } else {
            lockBtn.classList.remove('locked');
            lockBtn.textContent = '🔓';
            lockBtn.title = 'Blocca origine per confrontare destinazioni';
        }
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
        console.log('🔒 Toggle lock origine...');
        
        // Se non c'è un aeroporto di origine, non si può bloccare
        if (!this.routeCreationState.originAirport) {
            return { success: false, message: 'Seleziona prima un aeroporto di origine' };
        }
        
        // Toggle stato lock
        this.routeCreationState.originLocked = !this.routeCreationState.originLocked;
        
        // Aggiorna UI
        this.updateLockButton();
        this.updateOriginSlotAppearance();
        
        var status = this.routeCreationState.originLocked ? 'bloccata' : 'sbloccata';
        console.log('🔒 Origine ' + status);
        
        return { success: true, message: 'Origine ' + status };
    },
    
    // Pulisci destinazione
    clearDestination: function() {
        console.log('🔄 Pulizia destinazione...');
        
        this.routeCreationState.destinationAirport = null;
        this.clearSlot('destination');
        this.updateCreateButton();
        this.hideRouteInfo();
        
        // Seleziona lo slot destinazione per una nuova selezione
        this.selectSlot('destination');
        
        console.log('✅ Destinazione pulita');
        return { success: true, message: 'Destinazione pulita' };
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
    }
};

// Export per uso globale
window.RouteUIManager = RouteUIManager;
console.log('✅ RouteUIManager caricato');
