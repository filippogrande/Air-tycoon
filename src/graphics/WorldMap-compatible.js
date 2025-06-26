// WorldMap compatibile
console.log('📂 Caricamento WorldMap.js...');

function WorldMap(game) {
    this.game = game;
    this.canvas = null;
    this.ctx = null;
}

WorldMap.prototype.init = function() {
    this.canvas = document.getElementById('world-map');
    if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvasSize();
        console.log('🗺️ WorldMap inizializzato');
        this.render();
    } else {
        console.warn('⚠️ Canvas world-map non trovato');
    }
};

WorldMap.prototype.setupCanvasSize = function() {
    if (!this.canvas) return;
    
    // Imposta dimensioni canvas
    this.canvas.width = 1200;
    this.canvas.height = 600;
    console.log('📐 Canvas dimensioni: ' + this.canvas.width + 'x' + this.canvas.height);
};

WorldMap.prototype.render = function() {
    if (!this.ctx) return;
    
    // Pulisci canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Sfondo
    this.ctx.fillStyle = '#87CEEB'; // Azzurro cielo
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Disegna aeroporti
    this.drawAirports();
    
    // Disegna rotte
    this.drawRoutes();
};

WorldMap.prototype.drawAirports = function() {
    if (!AirportData || !AirportData.airports) return;
    
    var airports = AirportData.airports;
    
    for (var i = 0; i < airports.length; i++) {
        var airport = airports[i];
        var x = this.longitudeToX(airport.longitude);
        var y = this.latitudeToY(airport.latitude);
        
        // Disegna aeroporto
        this.ctx.fillStyle = '#FFD700'; // Oro
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Etichetta
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(airport.code, x + 8, y + 4);
    }
};

WorldMap.prototype.drawRoutes = function() {
    if (!this.game.state || !this.game.state.routes) return;
    
    var routes = this.game.state.routes;
    
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        if (!route.isActive) continue;
        
        var origin = AirportData.getAirportByCode(route.origin);
        var destination = AirportData.getAirportByCode(route.destination);
        
        if (origin && destination) {
            var x1 = this.longitudeToX(origin.longitude);
            var y1 = this.latitudeToY(origin.latitude);
            var x2 = this.longitudeToX(destination.longitude);
            var y2 = this.latitudeToY(destination.latitude);
            
            // Disegna linea rotta
            this.ctx.strokeStyle = '#FF0000'; // Rosso
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }
};

WorldMap.prototype.longitudeToX = function(longitude) {
    // Converte longitudine (-180 a 180) in coordinata X canvas (0 a width)
    return ((longitude + 180) / 360) * this.canvas.width;
};

WorldMap.prototype.latitudeToY = function(latitude) {
    // Converte latitudine (-90 a 90) in coordinata Y canvas (0 a height)
    // Invertito perché Y cresce verso il basso
    return ((90 - latitude) / 180) * this.canvas.height;
};

WorldMap.prototype.handleClick = function(event) {
    console.log('🖱️ Click sulla mappa:', event);
};

window.WorldMap = WorldMap;
console.log('✅ WorldMap compatibile caricato');
