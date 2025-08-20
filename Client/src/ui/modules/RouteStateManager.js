// RouteStateManager - Gestione dello stato UI per creazione rotte
console.log('📂 Caricamento RouteStateManager.js...');

var RouteStateManager = {
    
    // Stato UI
    state: {
        isOpen: false,
        activeSlot: null,
        originAirport: null,
        destinationAirport: null,
        originLocked: true,  // Lucchetto attivo di default
        selectedAircraftId: null,
        selectedRouteType: 'passenger'  // Default passeggeri
    },
    
    // Reset stato creazione rotte
    resetState: function() {
        this.state = {
            isOpen: false,
            activeSlot: null,
            originAirport: null,
            destinationAirport: null,
            originLocked: true,
            selectedAircraftId: null,
            selectedRouteType: 'passenger'
        };
        
        console.log('🔄 Stato rotte resettato');
        return this.state;
    },
    
    // Aggiorna stato origine
    setOrigin: function(airport) {
        this.state.originAirport = airport;
        console.log('🛫 Origine impostata:', airport ? airport.code : null);
        return this.state.originAirport;
    },
    
    // Aggiorna stato destinazione
    setDestination: function(airport) {
        this.state.destinationAirport = airport;
        console.log('🛬 Destinazione impostata:', airport ? airport.code : null);
        return this.state.destinationAirport;
    },
    
    // Toggle lucchetto origine
    toggleOriginLock: function() {
        if (!this.state.originAirport) {
            return { success: false, message: 'Seleziona prima un aeroporto di origine' };
        }
        
        this.state.originLocked = !this.state.originLocked;
        var status = this.state.originLocked ? 'bloccata' : 'sbloccata';
        console.log('🔒 Origine', status, ':', this.state.originAirport.code);
        
        return { success: true, message: 'Origine ' + status, locked: this.state.originLocked };
    },
    
    // Imposta aeroplano selezionato
    setSelectedAircraft: function(aircraftId) {
        this.state.selectedAircraftId = aircraftId;
        console.log('✈️ Aeroplano selezionato:', aircraftId);
        return this.state.selectedAircraftId;
    },
    
    // Imposta tipo rotta
    setRouteType: function(type) {
        this.state.selectedRouteType = type;
        console.log('🎯 Tipo rotta selezionato:', type);
        return this.state.selectedRouteType;
    },
    
    // Imposta slot attivo
    setActiveSlot: function(slotType) {
        this.state.activeSlot = slotType;
        console.log('🎯 Slot attivo:', slotType);
        return this.state.activeSlot;
    },
    
    // Apri pannello
    openPanel: function() {
        this.state.isOpen = true;
        console.log('📂 Pannello aperto');
        return this.state.isOpen;
    },
    
    // Chiudi pannello
    closePanel: function() {
        this.state.isOpen = false;
        console.log('📂 Pannello chiuso');
        return this.state.isOpen;
    },
    
    // Verifica se può creare rotta
    canCreateRoute: function() {
        return !!(this.state.originAirport && this.state.destinationAirport);
    },
    
    // Ottieni stato corrente
    getCurrentState: function() {
        return JSON.parse(JSON.stringify(this.state)); // deep copy
    }
};

// Export globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteStateManager;
} else if (typeof window !== 'undefined') {
    window.RouteStateManager = RouteStateManager;
}
