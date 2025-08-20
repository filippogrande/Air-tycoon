// RouteManager compatibile
console.log('📂 Caricamento RouteManager.js...');

function RouteManager(gameState) {
    this.gameState = gameState;
}

RouteManager.prototype.createRoute = function(originCode, destinationCode, aircraftId, routeConfig) {
    console.log('🛠️ RouteManager: Creazione rotta', originCode, '→', destinationCode);
    
    // Validazioni base
    if (originCode === destinationCode) {
        return {
            success: false,
            message: 'Origine e destinazione devono essere diverse'
        };
    }
    
    // Verifica che gli aeroporti esistano
    var origin = AirportData.getAirportByCode(originCode);
    var destination = AirportData.getAirportByCode(destinationCode);
    
    if (!origin) {
        return {
            success: false,
            message: 'Aeroporto di origine non trovato: ' + originCode
        };
    }
    
    if (!destination) {
        return {
            success: false,
            message: 'Aeroporto di destinazione non trovato: ' + destinationCode
        };
    }
    
    // Verifica che non esista già una rotta identica
    for (var i = 0; i < this.gameState.routes.length; i++) {
        var existingRoute = this.gameState.routes[i];
        if ((existingRoute.origin === originCode && existingRoute.destination === destinationCode) ||
            (existingRoute.origin === destinationCode && existingRoute.destination === originCode)) {
            return {
                success: false,
                message: 'Esiste già una rotta tra questi aeroporti'
            };
        }
    }
    
    // Verifica che il giocatore abbia almeno un hub tra origine e destinazione
    var hasHub = false;
    if (this.gameState.game && this.gameState.game.hubManager) {
        hasHub = this.gameState.game.hubManager.hasHub(originCode) || 
                this.gameState.game.hubManager.hasHub(destinationCode);
    }
    
    if (!hasHub) {
        return {
            success: false,
            message: 'Devi avere un hub in uno dei due aeroporti per creare una rotta'
        };
    }
    
    try {
        var route = new Route(originCode, destinationCode, aircraftId);
        
        // Aggiungi configurazione aggiuntiva se fornita
        if (routeConfig) {
            route.routeType = routeConfig.routeType || 'passenger';
            route.creationCost = routeConfig.creationCost || 0;
            route.estimatedPassengers = routeConfig.estimatedPassengers || 0;
            route.estimatedCargo = routeConfig.estimatedCargo || 0;
        }
        
        this.gameState.routes.push(route);
        
        console.log('✅ Rotta creata con successo:', route.toString());
        
        // Trigger auto-save per creazione rotta
        if (typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
            SaveLoad.triggerAutoSave('creazione_rotta');
        }
        
        return {
            success: true,
            route: route,
            message: 'Rotta creata con successo'
        };
        
    } catch (error) {
        console.error('❌ Errore creazione rotta:', error);
        return {
            success: false,
            message: 'Errore tecnico nella creazione della rotta'
        };
    }
};

RouteManager.prototype.removeRoute = function(routeId) {
    for (var i = this.gameState.routes.length - 1; i >= 0; i--) {
        if (this.gameState.routes[i].id === routeId) {
            var route = this.gameState.routes[i];
            this.gameState.routes.splice(i, 1);
            console.log('🗑️ Rotta rimossa: ' + route.toString());
            
            // Trigger auto-save per rimozione rotta
            if (typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
                SaveLoad.triggerAutoSave('rimozione_rotta');
            }
            
            return route;
        }
    }
    return null;
};

RouteManager.prototype.getAllRoutes = function() {
    return this.gameState.routes.slice();
};

RouteManager.prototype.getActiveRoutes = function() {
    var active = [];
    for (var i = 0; i < this.gameState.routes.length; i++) {
        if (this.gameState.routes[i].isActive) {
            active.push(this.gameState.routes[i]);
        }
    }
    return active;
};

window.RouteManager = RouteManager;
console.log('✅ RouteManager compatibile caricato');
