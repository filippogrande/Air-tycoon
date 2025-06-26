// WorldMap con Leaflet e OpenStreetMap
console.log('📂 Caricamento WorldMap.js...');

function WorldMap(game) {
    this.game = game;
    this.map = null;
    this.airportMarkers = {};
    this.routeLines = {};
    this.selectedAirport = null;
}

WorldMap.prototype.init = function() {
    console.log('🗺️ Inizializzazione WorldMap con Leaflet...');
    
    // Inizializza mappa Leaflet centrata sul mondo
    this.map = L.map('world-map', {
        center: [30, 0], // Centro del mondo
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        worldCopyJump: true,
        zoomControl: true
    });
    
    // Aggiungi tile layer con stile pulito per aviazione
    // Usiamo CartoDB Positron per uno stile pulito e minimale
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(this.map);
    
    console.log('✅ Mappa Leaflet inizializzata');
    
    // Carica aeroporti e rotte
    this.loadAirports();
    this.loadRoutes();
    
    // Setup eventi
    this.setupMapEvents();
};

WorldMap.prototype.loadAirports = function() {
    if (!AirportData || !AirportData.airports) {
        console.warn('⚠️ AirportData non disponibile');
        return;
    }
    
    console.log('✈️ Caricamento aeroporti sulla mappa...');
    
    var airports = AirportData.airports;
    var airportIcon = L.divIcon({
        className: 'airport-marker',
        html: '<div class="airport-icon">✈</div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    for (var i = 0; i < airports.length; i++) {
        var airport = airports[i];
        
        var marker = L.marker([airport.latitude, airport.longitude], {
            icon: airportIcon,
            title: airport.name + ' (' + airport.code + ')'
        }).addTo(this.map);
        
        // Popup con informazioni aeroporto
        var popupContent = this.createAirportPopup(airport);
        marker.bindPopup(popupContent);
        
        // Event handler per click
        marker.on('click', this.onAirportClick.bind(this, airport));
        
        this.airportMarkers[airport.code] = marker;
    }
    
    console.log('✅ Caricati', airports.length, 'aeroporti');
};

WorldMap.prototype.createAirportPopup = function(airport) {
    return '<div class="airport-popup">' +
           '<h3>' + airport.name + '</h3>' +
           '<p><strong>Codice:</strong> ' + airport.code + '</p>' +
           '<p><strong>Città:</strong> ' + airport.city + '</p>' +
           '<p><strong>Paese:</strong> ' + airport.country + '</p>' +
           '<p><strong>Traffico:</strong> ' + airport.passengerTraffic.toLocaleString() + ' pax/anno</p>' +
           '<div class="airport-actions">' +
           '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">Crea Rotta</button>' +
           '</div>' +
           '</div>';
};

WorldMap.prototype.loadRoutes = function() {
    if (!this.game.state || !this.game.state.routes) return;
    
    console.log('🛣️ Caricamento rotte sulla mappa...');
    
    var routes = this.game.state.routes;
    
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        if (route.isActive) {
            this.addRouteToMap(route);
        }
    }
};

WorldMap.prototype.addRouteToMap = function(route) {
    var origin = AirportData.getAirportByCode(route.origin);
    var destination = AirportData.getAirportByCode(route.destination);
    
    if (!origin || !destination) return;
    
    var routeLine = L.polyline([
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude]
    ], {
        color: '#FF4444',
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1
    }).addTo(this.map);
    
    // Popup per la rotta
    var routeInfo = '<div class="route-popup">' +
                   '<h4>Rotta: ' + route.origin + ' → ' + route.destination + '</h4>' +
                   '<p><strong>Distanza:</strong> ' + Math.round(route.distance) + ' km</p>' +
                   '<p><strong>Aeromobile:</strong> ' + (route.aircraftId || 'Non assegnato') + '</p>' +
                   '</div>';
    
    routeLine.bindPopup(routeInfo);
    
    this.routeLines[route.origin + '-' + route.destination] = routeLine;
};

WorldMap.prototype.removeRouteFromMap = function(route) {
    var routeKey = route.origin + '-' + route.destination;
    if (this.routeLines[routeKey]) {
        this.map.removeLayer(this.routeLines[routeKey]);
        delete this.routeLines[routeKey];
    }
};

WorldMap.prototype.setupMapEvents = function() {
    var self = this;
    
    // Event per zoom
    this.map.on('zoomend', function() {
        console.log('🔍 Zoom level:', self.map.getZoom());
    });
    
    // Event per click sulla mappa (non su marker)
    this.map.on('click', function(e) {
        self.onMapClick(e);
    });
};

WorldMap.prototype.onAirportClick = function(airport, e) {
    console.log('🏢 Click su aeroporto:', airport.code);
    this.selectedAirport = airport;
    
    // Notifica al game manager
    if (this.game.uiManager) {
        this.game.uiManager.showAirportInfo(airport);
    }
};

WorldMap.prototype.onMapClick = function(e) {
    console.log('🗺️ Click su mappa:', e.latlng);
    
    // Nascondi pannello info se visibile
    if (this.game.uiManager) {
        this.game.uiManager.hideAirportInfo();
    }
};

WorldMap.prototype.createRouteFromAirport = function(airportCode) {
    console.log('🛣️ Creazione rotta da:', airportCode);
    
    if (this.game.uiManager) {
        this.game.uiManager.startRouteCreation(airportCode);
    }
};

WorldMap.prototype.highlightAirport = function(airportCode) {
    var marker = this.airportMarkers[airportCode];
    if (marker) {
        marker.openPopup();
        this.map.setView(marker.getLatLng(), 6);
    }
};

WorldMap.prototype.render = function() {
    // Refresh della mappa se necessario
    if (this.map) {
        this.map.invalidateSize();
    }
};

// CSS per i marker personalizzati
var style = document.createElement('style');
style.textContent = `
    .airport-marker {
        background: none !important;
        border: none !important;
    }
    
    .airport-icon {
        background: #FFD700;
        border: 2px solid #FF8C00;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
    }
    
    .airport-icon:hover {
        transform: scale(1.2);
        background: #FFA500;
    }
    
    .airport-popup h3 {
        margin: 0 0 10px 0;
        color: #2c3e50;
    }
    
    .airport-popup p {
        margin: 5px 0;
        font-size: 14px;
    }
    
    .airport-actions {
        margin-top: 10px;
    }
    
    .airport-actions button {
        background: #4a90e2;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    }
    
    .airport-actions button:hover {
        background: #357abd;
    }
    
    .route-popup h4 {
        margin: 0 0 8px 0;
        color: #d32f2f;
    }
    
    .route-popup p {
        margin: 3px 0;
        font-size: 13px;
    }
`;
document.head.appendChild(style);

window.WorldMap = WorldMap;
console.log('✅ WorldMap con Leaflet caricato');
