// RouteManager compatibile
console.log('📂 Caricamento RouteManager.js...');

function RouteManager(gameState) {
    this.gameState = gameState;
}

RouteManager.prototype.createRoute = function(originCode, destinationCode, aircraftId) {
    if (originCode === destinationCode) {
        console.error('Origine e destinazione devono essere diverse');
        return null;
    }
    
    try {
        var route = new Route(originCode, destinationCode, aircraftId);
        this.gameState.routes.push(route);
        console.log('🛣️ Rotta creata: ' + route.toString());
        return route;
    } catch (error) {
        console.error('Errore creazione rotta:', error);
        return null;
    }
};

RouteManager.prototype.removeRoute = function(routeId) {
    for (var i = this.gameState.routes.length - 1; i >= 0; i--) {
        if (this.gameState.routes[i].id === routeId) {
            var route = this.gameState.routes[i];
            this.gameState.routes.splice(i, 1);
            console.log('🗑️ Rotta rimossa: ' + route.toString());
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
