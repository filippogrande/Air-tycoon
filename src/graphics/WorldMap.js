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
    
    try {
        // Verifica che Leaflet sia disponibile
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet non caricato');
            return;
        }
        
        // Verifica che l'elemento mappa esista
        var mapElement = document.getElementById('world-map');
        if (!mapElement) {
            console.error('❌ Elemento world-map non trovato');
            return;
        }
        
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
        
    } catch (error) {
        console.error('❌ Errore inizializzazione WorldMap:', error);
        // Non rilanciare l'errore per non bloccare il gioco
    }
};

WorldMap.prototype.loadAirports = function() {
    if (!AirportData || !AirportData.airports) {
        console.warn('⚠️ AirportData non disponibile');
        return;
    }
    
    console.log('✈️ Caricamento aeroporti sulla mappa...');
    
    var airports = AirportData.airports;
    console.log('📊 Aeroporti disponibili:', airports.length);
    
    for (var i = 0; i < airports.length; i++) {
        var airport = airports[i];
        
        // Crea marker con icona appropriata
        var marker = this.createAirportMarker(airport);
        // Non aggiungere direttamente alla mappa - sarà gestito dalla visibilità
        
        this.airportMarkers[airport.code] = marker;
    }
    
    // Setup zoom-based visibility
    this.setupZoomBasedVisibility();
    
    console.log('✅ Creati marker per', airports.length, 'aeroporti');
};

WorldMap.prototype.createAirportMarker = function(airport) {
    var self = this;
    var isPlayerHub = this.game.hubManager && this.game.hubManager.hasHub(airport.code);
    var iconHtml, iconSize, zIndex;
    
    // Determina icona e dimensioni basate su tipo e proprietà
    if (isPlayerHub) {
        // Hub del giocatore - icona speciale
        iconHtml = '<div class="airport-icon player-hub">🏢</div>';
        iconSize = [24, 24];
        zIndex = 1000;
    } else if (airport.size === 'hub') {
        // Hub mondiale - esagono rosso come nel gioco originale
        iconHtml = '<div class="airport-icon world-hub">⬡</div>';
        iconSize = [20, 20];
        zIndex = 900;
    } else if (airport.size === 'large') {
        // Aeroporto grande - cerchio blu
        iconHtml = '<div class="airport-icon large-airport">⬢</div>';
        iconSize = [16, 16];
        zIndex = 800;
    } else if (airport.size === 'medium') {
        // Aeroporto medio - quadrato
        iconHtml = '<div class="airport-icon medium-airport">⬛</div>';
        iconSize = [12, 12];
        zIndex = 700;
    } else {
        // Aeroporto piccolo - punto
        iconHtml = '<div class="airport-icon small-airport">●</div>';
        iconSize = [8, 8];
        zIndex = 600;
    }
    
    var airportIcon = L.divIcon({
        className: 'airport-marker',
        html: iconHtml,
        iconSize: iconSize,
        iconAnchor: [iconSize[0]/2, iconSize[1]/2]
    });
    
    var marker = L.marker([airport.latitude, airport.longitude], {
        icon: airportIcon,
        title: airport.name + ' (' + airport.code + ')',
        zIndexOffset: zIndex
    });
    
    // Popup con informazioni aeroporto
    var popupContent = this.createAirportPopup(airport, isPlayerHub);
    marker.bindPopup(popupContent);
    
    // Event handler per click
    marker.on('click', function(e) {
        self.onAirportClick(airport, e);
    });
    
    // Salva riferimento airport nel marker
    marker.airportData = airport;
    
    return marker;
};

WorldMap.prototype.setupZoomBasedVisibility = function() {
    var self = this;
    
    // Aggiorna visibilità al cambio zoom
    this.map.on('zoomend', function() {
        var zoom = self.map.getZoom();
        self.updateAirportVisibility(zoom);
    });
    
    // Aggiorna visibilità quando si sposta la mappa
    this.map.on('moveend', function() {
        var zoom = self.map.getZoom();
        self.updateAirportVisibility(zoom);
    });
    
    // Imposta visibilità iniziale
    this.updateAirportVisibility(this.map.getZoom());
};

WorldMap.prototype.updateAirportVisibility = function(zoom) {
    console.log('🔍 Aggiornamento visibilità aeroporti intelligente, zoom:', zoom);
    
    // Ottieni i bounds della mappa visibile
    var bounds = this.map.getBounds();
    var visibleAirports = this.getAirportsInView(bounds);
    
    // Calcola aeroporti da mostrare con sistema anti-clutter
    var airportsToShow = this.calculateVisibleAirports(visibleAirports, zoom);
    
    var visibleCount = 0;
    
    // Nascondi tutti i marker prima
    for (var code in this.airportMarkers) {
        var marker = this.airportMarkers[code];
        if (this.map.hasLayer(marker)) {
            this.map.removeLayer(marker);
        }
    }
    
    // Mostra solo gli aeroporti selezionati
    for (var i = 0; i < airportsToShow.length; i++) {
        var airportCode = airportsToShow[i];
        var marker = this.airportMarkers[airportCode];
        
        if (marker && !this.map.hasLayer(marker)) {
            marker.addTo(this.map);
            visibleCount++;
        }
    }
    
    console.log('✅ Aeroporti visibili:', visibleCount, '/', Object.keys(this.airportMarkers).length, 
                '(da', visibleAirports.length, 'nell\'area)');
};

// Ottieni aeroporti nell'area visibile della mappa
WorldMap.prototype.getAirportsInView = function(bounds) {
    var airportsInView = [];
    
    for (var code in this.airportMarkers) {
        var marker = this.airportMarkers[code];
        var airport = marker.airportData;
        var latlng = L.latLng(airport.latitude, airport.longitude);
        
        if (bounds.contains(latlng)) {
            airportsInView.push(airport);
        }
    }
    
    return airportsInView;
};

// Calcola quali aeroporti mostrare basandosi su zoom e importanza
WorldMap.prototype.calculateVisibleAirports = function(airportsInView, zoom) {
    var self = this;
    
    // Calcola rating per ogni aeroporto
    var airportsWithRating = airportsInView.map(function(airport) {
        return {
            airport: airport,
            rating: self.calculateAirportRating(airport),
            isPlayerHub: self.game.hubManager && self.game.hubManager.hasHub(airport.code)
        };
    });
    
    // Ordina per rating (più alto = più importante)
    airportsWithRating.sort(function(a, b) {
        // Hub del giocatore sempre in cima
        if (a.isPlayerHub && !b.isPlayerHub) return -1;
        if (!a.isPlayerHub && b.isPlayerHub) return 1;
        
        return b.rating - a.rating;
    });
    
    // Determina quanti aeroporti mostrare basandosi su zoom
    var maxAirports = this.getMaxAirportsForZoom(zoom);
    var minDistance = this.getMinDistanceForZoom(zoom);
    
    var selectedAirports = [];
    
    for (var i = 0; i < airportsWithRating.length && selectedAirports.length < maxAirports; i++) {
        var current = airportsWithRating[i];
        
        // Hub del giocatore sempre visibili
        if (current.isPlayerHub) {
            selectedAirports.push(current.airport.code);
            continue;
        }
        
        // Controlla se l'aeroporto è troppo vicino ad altri già selezionati
        var tooClose = false;
        for (var j = 0; j < selectedAirports.length; j++) {
            var selectedCode = selectedAirports[j];
            var selectedAirport = AirportData.getAirportByCode(selectedCode);
            
            if (selectedAirport) {
                var distance = this.calculateDistance(
                    current.airport.latitude, current.airport.longitude,
                    selectedAirport.latitude, selectedAirport.longitude
                );
                
                // Se troppo vicino ad un aeroporto più importante, salta
                if (distance < minDistance) {
                    var selectedRating = this.calculateAirportRating(selectedAirport);
                    if (selectedRating > current.rating * 0.9) { // 10% di tolleranza
                        tooClose = true;
                        break;
                    }
                }
            }
        }
        
        if (!tooClose) {
            selectedAirports.push(current.airport.code);
        }
    }
    
    return selectedAirports;
};

// Calcola rating di importanza per un aeroporto
WorldMap.prototype.calculateAirportRating = function(airport) {
    var baseRating = airport.passengerTraffic || 1000000; // Default se mancano dati
    
    // Bonus per tipo di aeroporto
    var typeMultiplier = 1;
    switch (airport.size) {
        case 'hub':
            typeMultiplier = 3.0;
            break;
        case 'large':
            typeMultiplier = 2.0;
            break;
        case 'medium':
            typeMultiplier = 1.2;
            break;
        default:
            typeMultiplier = 1.0;
    }
    
    return baseRating * typeMultiplier;
};

// Determina numero massimo di aeroporti da mostrare per livello di zoom
WorldMap.prototype.getMaxAirportsForZoom = function(zoom) {
    if (zoom <= 2) return 20;   // Vista mondo: solo i più grandi
    if (zoom <= 3) return 40;   // Continente: più aeroporti
    if (zoom <= 4) return 80;   // Regione: ancora di più
    if (zoom <= 5) return 150;  // Area: molti aeroporti
    if (zoom <= 6) return 300;  // Zona: la maggior parte
    if (zoom <= 7) return 500;  // Dettaglio: quasi tutti
    return 1000;                // Massimo zoom: tutti
};

// Determina distanza minima tra aeroporti per livello di zoom (in km)
WorldMap.prototype.getMinDistanceForZoom = function(zoom) {
    if (zoom <= 2) return 800;  // Vista mondo: molto distanziati
    if (zoom <= 3) return 400;  // Continente: meno distanziati
    if (zoom <= 4) return 200;  // Regione: ancora meno
    if (zoom <= 5) return 100;  // Area: vicini
    if (zoom <= 6) return 50;   // Zona: molto vicini
    if (zoom <= 7) return 25;   // Dettaglio: qualsiasi distanza
    return 0;                   // Massimo zoom: nessuna restrizione
};

// Calcola distanza tra due punti in km (formula Haversine semplificata)
WorldMap.prototype.calculateDistance = function(lat1, lon1, lat2, lon2) {
    var R = 6371; // Raggio della Terra in km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

WorldMap.prototype.createAirportPopup = function(airport, isPlayerHub) {
    var hubInfo = '';
    var actions = '';
    
    if (isPlayerHub) {
        var hub = this.game.hubManager.getHub(airport.code);
        hubInfo = '<div class="hub-info">' +
                 '<p><strong>🏢 Il tuo Hub</strong></p>' +
                 '<p><strong>Gates:</strong> ' + hub.facilities.gates + '</p>' +
                 '<p><strong>Piste:</strong> ' + hub.facilities.runways + '</p>' +
                 '<p><strong>Manutenzione:</strong> €' + hub.monthlyMaintenanceCost.toLocaleString() + '/mese</p>' +
                 '</div>';
        
        actions = '<div class="airport-actions">' +
                 '<button onclick="game.worldMap.manageHub(\'' + airport.code + '\')">Gestisci Hub</button>' +
                 '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">Crea Rotta</button>' +
                 '</div>';
    } else {
        var canBuildHub = airport.size === 'hub' || airport.size === 'large';
        
        if (canBuildHub) {
            var buildCost = this.game.hubManager ? 
                           this.game.hubManager.calculateHubBuildCost(airport) : 
                           'N/A';
            
            actions = '<div class="airport-actions">' +
                     '<button onclick="game.worldMap.buildHubAt(\'' + airport.code + '\')">Costruisci Hub (€' + buildCost.toLocaleString() + ')</button>' +
                     '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">Crea Rotta</button>' +
                     '</div>';
        } else {
            actions = '<div class="airport-actions">' +
                     '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">Crea Rotta</button>' +
                     '<p class="small-text">💡 Solo aeroporti grandi possono diventare hub</p>' +
                     '</div>';
        }
    }
    
    var hubStatus = isPlayerHub ? '🏢 Il tuo Hub' : 
                   (airport.size === 'hub' ? '⬡ Hub Mondiale' : 
                   (airport.size === 'large' ? '⬢ Aeroporto Grande' : '● Aeroporto Regionale'));
    
    return '<div class="airport-popup">' +
           '<h3>' + airport.name + '</h3>' +
           '<p><strong>Codice:</strong> ' + airport.code + '</p>' +
           '<p><strong>Città:</strong> ' + airport.city + '</p>' +
           '<p><strong>Paese:</strong> ' + airport.country + '</p>' +
           '<p><strong>Tipo:</strong> ' + hubStatus + '</p>' +
           '<p><strong>Traffico:</strong> ' + airport.passengerTraffic.toLocaleString() + ' pax/anno</p>' +
           hubInfo +
           actions +
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

WorldMap.prototype.buildHubAt = function(airportCode) {
    console.log('🏗️ Costruzione hub a:', airportCode);
    
    if (!this.game.hubManager) {
        console.error('❌ HubManager non disponibile');
        return;
    }
    
    var result = this.game.hubManager.buildHub(airportCode);
    
    if (result.success) {
        // Aggiorna marker aeroporto
        this.updateAirportMarker(airportCode);
        
        // Notifica successo
        if (this.game.uiManager) {
            this.game.uiManager.showNotification(result.message, 'success');
        }
        
        console.log('✅ Hub costruito con successo:', airportCode);
    } else {
        // Mostra errore
        if (this.game.uiManager) {
            this.game.uiManager.showNotification(result.message, 'error');
        }
        
        console.warn('❌ Fallita costruzione hub:', result.message);
    }
};

WorldMap.prototype.manageHub = function(airportCode) {
    console.log('🏢 Gestione hub:', airportCode);
    
    if (this.game.uiManager) {
        this.game.uiManager.showHubManagement(airportCode);
    }
};

// Aggiorna marker di un aeroporto specifico (dopo costruzione hub)
WorldMap.prototype.updateAirportMarker = function(airportCode) {
    var marker = this.airportMarkers[airportCode];
    if (!marker) return;
    
    var airport = AirportData.getAirportByCode(airportCode);
    if (!airport) return;
    
    // Rimuovi vecchio marker
    this.map.removeLayer(marker);
    
    // Crea nuovo marker aggiornato
    var newMarker = this.createAirportMarker(airport);
    newMarker.addTo(this.map);
    
    // Sostituisci nel registro
    this.airportMarkers[airportCode] = newMarker;
    
    console.log('🔄 Marker aeroporto aggiornato:', airportCode);
    
    // Aggiorna anche la visibilità generale dato che potrebbero esserci cambiamenti
    this.updateAirportVisibility(this.map.getZoom());
};

// Refresh completo di tutti i marker (chiamato quando necessario)
WorldMap.prototype.refreshAirportMarkers = function() {
    console.log('🔄 Refresh completo marker aeroporti...');
    
    // Rimuovi tutti i marker esistenti
    for (var code in this.airportMarkers) {
        this.map.removeLayer(this.airportMarkers[code]);
    }
    
    // Ricarica tutti i marker
    this.airportMarkers = {};
    this.loadAirports();
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
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-weight: bold;
    }
    
    /* Hub del giocatore */
    .player-hub {
        background: linear-gradient(45deg, #2ecc71, #27ae60);
        border: 3px solid #1e8449;
        color: white;
        font-size: 14px;
        width: 24px;
        height: 24px;
        animation: pulse-hub 2s infinite;
    }
    
    @keyframes pulse-hub {
        0% { box-shadow: 0 2px 8px rgba(46,204,113,0.4); }
        50% { box-shadow: 0 4px 16px rgba(46,204,113,0.8); }
        100% { box-shadow: 0 2px 8px rgba(46,204,113,0.4); }
    }
    
    /* Hub mondiale (esagono rosso) */
    .world-hub {
        background: #e74c3c;
        border: 2px solid #c0392b;
        color: white;
        font-size: 16px;
        width: 20px;
        height: 20px;
        border-radius: 20%;
    }
    
    /* Aeroporto grande */
    .large-airport {
        background: #3498db;
        border: 2px solid #2980b9;
        color: white;
        font-size: 12px;
        width: 16px;
        height: 16px;
        border-radius: 15%;
    }
    
    /* Aeroporto medio */
    .medium-airport {
        background: #f39c12;
        border: 1px solid #e67e22;
        color: white;
        font-size: 10px;
        width: 12px;
        height: 12px;
        border-radius: 10%;
    }
    
    /* Aeroporto piccolo */
    .small-airport {
        background: #95a5a6;
        border: 1px solid #7f8c8d;
        color: white;
        font-size: 8px;
        width: 8px;
        height: 8px;
    }
    
    .airport-icon:hover {
        transform: scale(1.3);
        z-index: 1000;
    }
    
    .player-hub:hover {
        background: linear-gradient(45deg, #27ae60, #1e8449);
        transform: scale(1.4);
    }
    
    .world-hub:hover {
        background: #c0392b;
        transform: scale(1.3);
    }
    
    .large-airport:hover {
        background: #2980b9;
        transform: scale(1.3);
    }
    
    .airport-popup {
        min-width: 280px;
    }
    
    .airport-popup h3 {
        margin: 0 0 10px 0;
        color: #2c3e50;
        font-size: 16px;
    }
    
    .airport-popup p {
        margin: 5px 0;
        font-size: 14px;
    }
    
    .hub-info {
        background: rgba(46,204,113,0.1);
        padding: 8px;
        border-radius: 5px;
        margin: 10px 0;
        border-left: 3px solid #2ecc71;
    }
    
    .hub-info p {
        margin: 3px 0;
        font-size: 13px;
    }
    
    .airport-actions {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .airport-actions button {
        background: #4a90e2;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: background 0.3s ease;
    }
    
    .airport-actions button:hover {
        background: #357abd;
    }
    
    .small-text {
        font-size: 11px;
        color: #7f8c8d;
        margin: 5px 0 0 0;
        font-style: italic;
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
