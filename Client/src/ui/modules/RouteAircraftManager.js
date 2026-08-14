// RouteAircraftManager - Gestione selezione aeroplani per rotte

var RouteAircraftManager = {
    
    // Setup dropdown selezione aeroplano
    setupSelector: function() {
        var selector = document.getElementById('aircraft-selector-main');
        if (!selector) {
            console.warn('⚠️ Dropdown selezione aeroplano non trovato');
            return false;
        }

        // Safe access to global `game`
        var gameRef = (typeof window !== 'undefined' && window.game) ? window.game : (typeof game !== 'undefined' ? game : null);
        if (!gameRef || !gameRef.fleetManager) {
            console.warn('⚠️ FleetManager non disponibile (game non inizializzato). Popolerò il dropdown al momento opportuno.');
            this.populateSelector();
            return false;
        }

        // Popola il dropdown con gli aeroplani disponibili
        this.populateSelector();

        // Gestisci cambio selezione
        var self = this;
        selector.addEventListener('change', function() {
            var aircraftId = this.value;

            if (aircraftId === '') {
                if (window.RouteStateManager) {
                    window.RouteStateManager.setSelectedAircraft(null);
                }
            } else {
                if (window.RouteStateManager) {
                    window.RouteStateManager.setSelectedAircraft(aircraftId);
                }
            }

            // Aggiorna i filtri degli aeroporti in base all'autonomia dell'aereo
            if (typeof self.updateAirportFilters === 'function') {
                try { self.updateAirportFilters(); } catch(e) { /* ignore */ }
            }
        });

        return true;
    },

    // Popola il dropdown con gli aeroplani disponibili
    populateSelector: function() {
        var selector = document.getElementById('aircraft-selector-main');
        var gameRef = (typeof window !== 'undefined' && window.game) ? window.game : (typeof game !== 'undefined' ? game : null);
        
        if (!selector || !gameRef || !gameRef.fleetManager) {
            // Populate con placeholder quando la flotta non è ancora disponibile
            if (selector) {
                while (selector.children.length > 1) {
                    selector.removeChild(selector.lastChild);
                }
                var option = document.createElement('option');
                option.value = '';
                option.textContent = '⏳ Flotta non disponibile';
                option.disabled = true;
                selector.appendChild(option);
            }
            return false;
        }
        
        // Svuota opzioni esistenti (tranne la prima - nessun aeroplano selezionato)
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        
        // Ottieni gli aeroplani dalla flotta
        var fleet = gameRef.fleetManager.getAllAircraft();
        
        if (!fleet || fleet.length === 0) {
            var option = document.createElement('option');
            option.value = '';
            option.textContent = '🚫 Nessun aereo in flotta';
            option.disabled = true;
            selector.appendChild(option);
            return false;
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
        
        return true;
    },
    
    // Ottieni aeroplani compatibili per una rotta
    getCompatibleAircraft: function(origin, destination) {
        if (!origin || !destination) return [];
        
        // Calcola distanza rotta
        var distance = 0;
        if (typeof RouteCalculator !== 'undefined') {
            var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
            distance = estimates.distance;
        }
        
        // Ottieni lista aeroplani dal FleetManager in modo sicuro
        var gameRef = (typeof window !== 'undefined' && window.game) ? window.game : (typeof game !== 'undefined' ? game : null);
        var fleetMgr = (gameRef && gameRef.fleetManager) ? gameRef.fleetManager : (typeof FleetManager !== 'undefined' ? FleetManager : null);
        var compatibleAircraft = [];
        
        if (fleetMgr && fleetMgr.getOwnedAircraft) {
            var ownedAircraft = fleetMgr.getOwnedAircraft();
            compatibleAircraft = ownedAircraft.filter(function(aircraft) {
                return aircraft.range >= distance;
            });
        }
        
        return compatibleAircraft;
    },
    
    // Aggiorna lista aeroplani compatibili nel DOM
    updateCompatibleAircraftDisplay: function(origin, destination) {
        var aircraftList = document.getElementById('compatible-aircraft');
        var warningDiv = document.getElementById('no-aircraft-warning');
        
        if (!aircraftList || !warningDiv) return false;
        
        var compatibleAircraft = this.getCompatibleAircraft(origin, destination);
        
        // Se non ci sono aeroplani compatibili, mostra warning
        if (compatibleAircraft.length === 0) {
            aircraftList.innerHTML = '';
            warningDiv.style.display = 'flex';
            
            var confirmBtn = document.getElementById('confirm-create-route');
            if (confirmBtn) confirmBtn.disabled = true;
            
            return false;
        } else {
            // Mostra lista aeroplani
            warningDiv.style.display = 'none';
            
            var listHTML = '';
            compatibleAircraft.forEach(function(aircraft, index) {
                var statusClass = aircraft.isAvailable ? 'available' : 'busy';
                var statusText = aircraft.isAvailable ? 'Disponibile' : 'In uso';
                var selectedClass = index === 0 ? 'selected' : '';
                
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
            
            var confirmBtn = document.getElementById('confirm-create-route');
            if (confirmBtn) confirmBtn.disabled = false;
            
            return true;
        }
    },
    
    // Setup selezione aeroplani dalla lista
    setupAircraftSelection: function() {
        var aircraftItems = document.querySelectorAll('.aircraft-item');
        
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
                
                if (window.RouteStateManager) {
                    window.RouteStateManager.setSelectedAircraft(aircraftId);
                }
                
            });
        });
        
        return true;
    },
    
    // Reset selezione aeroplano
    resetSelection: function() {
        var selector = document.getElementById('aircraft-selector-main');
        if (selector) {
            selector.value = '';
        }
        
        var aircraftItems = document.querySelectorAll('.aircraft-item');
        aircraftItems.forEach(function(item) {
            item.classList.remove('selected');
        });
        
        return true;
    },
    
    // Ottieni aeroplano selezionato
    getSelectedAircraft: function() {
        var state = window.RouteStateManager ? window.RouteStateManager.getCurrentState() : null;
        return state ? state.selectedAircraftId : null;
    }
};

// Export globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteAircraftManager;
} else if (typeof window !== 'undefined') {
    window.RouteAircraftManager = RouteAircraftManager;
}
