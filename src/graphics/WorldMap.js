// WorldMap con Leaflet e OpenStreetMap - Versione Pulita
console.log('📂 Caricamento WorldMap.js...');

function WorldMap(game) {
    this.game = game;
    this.map = null;
    this.airportMarkers = {};
    this.routeLines = {};
    this.selectedAirport = null;
}

// Getter per accedere allo stato di creazione rotte dal RouteUIManager
Object.defineProperty(WorldMap.prototype, 'routeCreationState', {
    get: function() {
        if (typeof RouteUIManager !== 'undefined') {
            return RouteUIManager.routeCreationState;
        }
        // Fallback se RouteUIManager non è disponibile
        return this._fallbackRouteState || {
            isOpen: false,
            activeSlot: null,
            originAirport: null,
            destinationAirport: null,
            originLocked: true,  // Lucchetto attivo di default
            selectedAircraftId: null,
            selectedRouteType: 'passenger'
        };
    },
    set: function(value) {
        if (typeof RouteUIManager !== 'undefined') {
            RouteUIManager.routeCreationState = value;
        } else {
            this._fallbackRouteState = value;
        }
    }
});


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
        
        // Aggiungi tile layer con mare blu per aviazione
        // OpenStreetMap standard con bellissimo mare blu
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        console.log('✅ Mappa Leaflet inizializzata');
        
        // Inizializza pannelli UI delle rotte (asincrono)
        this.initializeRouteUI();
        
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

// Inizializza UI pannelli rotte
WorldMap.prototype.initializeRouteUI = function() {
    console.log('🔧 Inizializzazione UI pannelli rotte...');
    
    var self = this;
    
    if (typeof RouteUIManager !== 'undefined') {
        RouteUIManager.initializeRoutePanels()
            .then(function(success) {
                if (success) {
                    console.log('✅ Pannelli UI rotte inizializzati');
                    // Setup eventi dopo che i pannelli sono stati caricati
                    self.setupRouteCreationEvents();
                } else {
                    console.warn('⚠️ Fallback: pannelli UI non caricati, usando events base');
                }
            })
            .catch(function(error) {
                console.error('❌ Errore inizializzazione pannelli UI:', error);
            });
    } else {
        console.warn('⚠️ RouteUIManager non disponibile');
    }
};

// Carica aeroporti e hub in modo sincrono: prima hub, poi aeroporti
WorldMap.prototype.loadAirports = function() {
    var self = this;
    console.log('✈️ Caricamento hub e aeroporti dalla API backend...');
    var companyId = (this.game && this.game.companyId)
        ? this.game.companyId
        : (sessionStorage.getItem('selectedCompanyId') || 1);
    // 1. Carica hub del player
    fetch('/api/game/companies/' + companyId + '/hubs')
        .then(res => res.json())
        .then(hubResponse => {
            console.log('[loadAirports] Risposta hubs:', hubResponse);
            var hubCodes = [];
            if (hubResponse.success && Array.isArray(hubResponse.data)) {
                hubCodes = hubResponse.data.map(hub => hub.iata_code || hub.icao_code || hub.code);
            }
            // 2. Carica aeroporti (con data di gioco se disponibile)
            return fetch('/api/game/companies/' + companyId)
                .then(res => res.json())
                .then(response => {
                    if (!response.success || !response.data || !response.data.company) {
                        console.warn('⚠️ Data di gioco non trovata, carico tutti gli aeroporti');
                        return fetch('/api/airports?limit=2000')
                            .then(res => res.json())
                            .then(airports => ({ airports, hubCodes }));
                    }
                    var gameDate = response.data.company.game_date;
                    if (!gameDate) {
                        console.warn('⚠️ Data di gioco non trovata, carico tutti gli aeroporti');
                        return fetch('/api/airports?limit=2000')
                            .then(res => res.json())
                            .then(airports => ({ airports, hubCodes }));
                    }
                    // Chiedi solo aeroporti aperti alla data di gioco
                    return fetch('/api/airports?limit=2000&before=' + encodeURIComponent(gameDate))
                        .then(res => res.json())
                        .then(airports => ({ airports, hubCodes }));
                });
        })
        .then(({ airports, hubCodes }) => {
            if (!Array.isArray(airports) || airports.length === 0) {
                console.warn('⚠️ Nessun aeroporto ricevuto dal backend');
                return;
            }
            self._renderAirportsOnMap(airports, hubCodes);
        })
        .catch(error => {
            console.error('❌ Errore caricamento aeroporti/hub dal backend:', error);
        });
};

// Renderizza aeroporti sulla mappa
WorldMap.prototype._renderAirportsOnMap = function(airports, hubCodes) {
    console.log('🗺️ Rendering aeroporti sulla mappa:', airports.length, 'hubCodes:', hubCodes);
    window.AirportData = window.AirportData || {};
    window.AirportData.airports = airports;
    window.AirportData._airportByCode = {};
    hubCodes = hubCodes || [];
    for (var i = 0; i < airports.length; i++) {
        var airport = airports[i];
        var code = airport.iata_code || airport.icao_code || airport.code;
        var lat = parseFloat(airport.latitude);
        var lon = parseFloat(airport.longitude);
        var latOk = !isNaN(lat);
        var lonOk = !isNaN(lon);
        if (code) {
            window.AirportData._airportByCode[code] = airport;
        }
        if (!latOk || !lonOk || !code) {
            console.warn('⚠️ Aeroporto con dati invalidi:', airport);
            continue;
        }
        // Determina se è hub
        var isPlayerHub = hubCodes.includes(code);
        var marker = this.createAirportMarker({
            ...airport,
            code: code,
            latitude: lat,
            longitude: lon,
            businessLevel: airport.businessLevel !== undefined ? airport.businessLevel : airport.business_level,
            touristLevel: airport.touristLevel !== undefined ? airport.touristLevel : airport.tourist_level,
            size: airport.size || airport.airport_size
        }, isPlayerHub);
        marker.isPlayerHub = isPlayerHub;
        this.airportMarkers[code] = marker;
    }
    // Definisci o sovrascrivi getAirportByCode per usare solo i dati reali
    window.AirportData.getAirportByCode = function(code) {
        return window.AirportData._airportByCode[code] || null;
    };
    
    console.log('📋 Marker creati:', Object.keys(this.airportMarkers).length);
    
    // Inizializza il MapVisibilityManager
    if (typeof MapVisibilityManager !== 'undefined') {
        console.log('✅ MapVisibilityManager disponibile, inizializzazione...');
        var self = this;
        MapVisibilityManager.setupZoomBasedVisibility(this.map, function(zoom) {
            // Aggiorna visibilità aeroporti, ma gli hub del player sono sempre visibili
            MapVisibilityManager.updateAirportVisibility(self.game, self.map, self.airportMarkers, zoom);
            // Forza sempre la visibilità degli hub
            for (var code in self.airportMarkers) {
                var marker = self.airportMarkers[code];
                if (marker.isPlayerHub && !self.map.hasLayer(marker)) {
                    marker.addTo(self.map);
                }
            }
        });
    } else {
        console.warn('⚠️ MapVisibilityManager non caricato, usando logica semplificata');
        this.setupZoomBasedVisibility();
    }
    
    console.log('✅ Creati marker per', airports.length, 'aeroporti');
    // Carica e evidenzia gli hub del player dopo aver creato i marker
};

// Mapping tipo aeroporto leggibile
WorldMap.prototype.getAirportTypeLabel = function(airport) {
    var size = airport.size || airport.airport_size;
    switch ((size || '').toLowerCase()) {
        case 'large':
            return '● Aeroporto Internazionale';
        case 'medium':
            return '● Aeroporto Regionale';
        case 'small':
            return '● Aeroporto Locale';
        case 'campo_aviazione':
        case 'campo aviazione':
            return '● Campo Aviazione';
        default:
            return '● Aeroporto';
    }
};

// Crea popup per un aeroporto
WorldMap.prototype.createAirportPopup = function(airport, isPlayerHub) {
    // Usa RouteUIManager se disponibile, altrimenti fallback
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.createAirportPopup(airport, isPlayerHub);
    }
    // Fallback con label tipo aeroporto
    return '<div class="airport-popup">' +
           '<h3>' + (airport.name || 'Nome non disponibile') + '</h3>' +
           '<p><strong>Codice:</strong> ' + (airport.code || 'N/A') + '</p>' +
           '<p><strong>Città:</strong> ' + (airport.city || '-') + '</p>' +
           '<p><strong>Paese:</strong> ' + (airport.country || '-') + '</p>' +
           '<p><strong>Tipo:</strong> ' + this.getAirportTypeLabel(airport) + '</p>' +
           '<p><strong>Traffico:</strong> Business: ' + (airport.businessLevel || airport.business_level || '-') +
           ' | Turismo: ' + (airport.touristLevel || airport.tourist_level || '-') + '</p>' +
           '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">Crea Rotta</button>' +
           '</div>';
};

// Utility per normalizzare la grandezza e restituire icona, dimensione e zIndex
WorldMap.prototype.getAirportIconProps = function(airport, isPlayerHub) {
    // Normalizza il campo size
    var size = (airport.size || airport.airport_size || '').toLowerCase();
    var iconSize, zIndex, iconHtml;
    console.log('[getAirportIconProps] airport:', airport, 'isPlayerHub:', isPlayerHub, 'size:', size);
    if (isPlayerHub) {
        // Hub del player: bersaglio verde, dimensione coerente con grandezza aeroporto
        if (size === 'large') {
            console.log('[getAirportIconProps] HUB: size large');
            iconSize = [28, 28];
            zIndex = 1200;
        } else if (size === 'medium') {
            console.log('[getAirportIconProps] HUB: size medium');
            iconSize = [22, 22];
            zIndex = 1100;
        } else {
            console.log('[getAirportIconProps] HUB: size small/other');
            iconSize = [16, 16];
            zIndex = 1000;
        }
        iconHtml = '<svg width="' + iconSize[0] + '" height="' + iconSize[1] + '" viewBox="0 0 24 24" class="airport-icon player-hub" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#27ae60" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#27ae60"/></svg>';
    } else {
        // Aeroporto normale: pin
        if (size === 'large') {
            console.log('[getAirportIconProps] NORMAL: size large');
            iconSize = [20, 25];
            zIndex = 800;
        } else if (size === 'medium') {
            console.log('[getAirportIconProps] NORMAL: size medium');
            iconSize = [14, 18];
            zIndex = 700;
        } else {
            console.log('[getAirportIconProps] NORMAL: size small/other');
            iconSize = [10, 12];
            zIndex = 600;
        }
        iconHtml = '<div class="airport-icon standard-airport"></div>';
    }
    return { iconHtml, iconSize, zIndex };
};

// Crea marker per un aeroporto
WorldMap.prototype.createAirportMarker = function(airport, isPlayerHub) {
    var self = this;
    var props = this.getAirportIconProps(airport, isPlayerHub);
    var airportIcon = L.divIcon({
        className: 'airport-marker',
        html: props.iconHtml,
        iconSize: props.iconSize,
        iconAnchor: [props.iconSize[0]/2, props.iconSize[1]/2]
    });
    
    // Conversione sicura di lat/lon a numeri
    var lat = parseFloat(airport.latitude);
    var lon = parseFloat(airport.longitude);
    
    var marker = L.marker([lat, lon], {
        icon: airportIcon,
        title: (airport.name || 'Aeroporto sconosciuto') + ' (' + (airport.code || 'N/A') + ')',
        zIndexOffset: props.zIndex
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
    marker._nameLabel = null;
    marker.isPlayerHub = isPlayerHub;
    return marker;
};

// Aggiorna la visibilità delle label dei nomi aeroporti in base a zoom
WorldMap.prototype.updateAirportNameLabels = function() {
    var zoom = this.map.getZoom();
    for (var code in this.airportMarkers) {
        var marker = this.airportMarkers[code];
        var airport = marker.airportData;
        if (!airport) continue;
        var showLabel = false;
        if (airport.size === 'large' || airport.airport_size === 'large') {
            showLabel = zoom >= 5;
        } else if (airport.size === 'medium' || airport.airport_size === 'medium') {
            showLabel = zoom >= 6;
        } else {
            showLabel = zoom >= 8;
        }
        // Crea o aggiorna label
        if (showLabel) {
            if (!marker._nameLabel) {
                marker._nameLabel = L.marker(marker.getLatLng(), {
                    icon: L.divIcon({
                        className: 'airport-name-label',
                        html: '<span>' + (airport.name || airport.code) + '</span>',
                        iconSize: null,
                        iconAnchor: [0, 0]
                    }),
                    interactive: false
                }).addTo(this.map);
            }
        } else {
            if (marker._nameLabel) {
                this.map.removeLayer(marker._nameLabel);
                marker._nameLabel = null;
            }
        }
    }
};

// Aggiorna anche su zoom/moveend
var _oldSetupZoomBasedVisibility = WorldMap.prototype.setupZoomBasedVisibility;
WorldMap.prototype.setupZoomBasedVisibility = function() {
    var self = this;
    if (_oldSetupZoomBasedVisibility) _oldSetupZoomBasedVisibility.call(this);
    this.map.on('zoomend', function() { self.updateAirportNameLabels(); });
    this.map.on('moveend', function() { self.updateAirportNameLabels(); });
    this.updateAirportNameLabels();
};

// Carica rotte esistenti
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

// Aggiungi rotta alla mappa
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

// Rimuovi rotta dalla mappa
WorldMap.prototype.removeRouteFromMap = function(route) {
    var routeKey = route.origin + '-' + route.destination;
    if (this.routeLines[routeKey]) {
        this.map.removeLayer(this.routeLines[routeKey]);
        delete this.routeLines[routeKey];
    }
};

// Setup eventi mappa
WorldMap.prototype.setupMapEvents = function() {
    var self = this;
    
    // Event per zoom
    this.map.on('zoomend', function() {
        // Zoom event handler - può essere usato per aggiornamenti futuri
    });
    
    // Event per click sulla mappa (non su marker)
    this.map.on('click', function(e) {
        self.onMapClick(e);
    });
    
    // Setup eventi pannello creazione rotte
    this.setupRouteCreationEvents();
};

// Setup eventi per creazione rotte
WorldMap.prototype.setupRouteCreationEvents = function() {
    var self = this;
    
    // Bottone per aprire pannello
    var openRouteBtn = document.getElementById('open-route-panel');
    if (openRouteBtn) {
        openRouteBtn.addEventListener('click', function() {
            self.openRouteCreationPanel();
        });
    }
    
    // Bottone annulla
    var cancelBtn = document.getElementById('cancel-route-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            self.closeRouteCreationPanel();
        });
    }
    
    // Bottone crea rotta (ora apre configurazione)
    var createBtn = document.getElementById('create-route-btn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            self.openRouteConfigPanel();
        });
    }
    
    // Bottone blocco origine
    var lockBtn = document.getElementById('lock-origin-btn');
    if (lockBtn) {
        lockBtn.addEventListener('click', function() {
            self.toggleOriginLock();
        });
    }
    
    // Bottone reset destinazione
    var clearDestBtn = document.getElementById('clear-destination-btn');
    if (clearDestBtn) {
        clearDestBtn.addEventListener('click', function() {
            self.clearDestination();
        });
    }
    
    // Slot aeroporti
    var originSlot = document.getElementById('origin-airport');
    var destinationSlot = document.getElementById('destination-airport');
    
    if (originSlot) {
        originSlot.addEventListener('click', function() {
            // Se l'origine è bloccata, non permettere la selezione
            if (self.routeCreationState.originLocked) {
                console.log('🔒 Origine bloccata, click ignorato');
                if (self.game.uiManager) {
                    self.game.uiManager.showNotification('Origine bloccata. Sblocca per modificare.', 'warning');
                }
                return;
            }
            self.selectSlot('origin');
        });
    }
    
    if (destinationSlot) {
        destinationSlot.addEventListener('click', function() {
            self.selectSlot('destination');
        });
    }
    
    // Bottoni pannello configurazione rotta
    var backToSelectionBtn = document.getElementById('back-to-selection');
    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function() {
            if (typeof RouteUIManager !== 'undefined' && RouteUIManager.backToSelection) {
                RouteUIManager.backToSelection();
            }
        });
    }
    
    var confirmCreateBtn = document.getElementById('confirm-create-route');
    if (confirmCreateBtn) {
        confirmCreateBtn.addEventListener('click', function() {
            self.confirmCreateRoute();
        });
    }
    
    // Listener per bottone acquista aereo nel warning
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('buy-aircraft-btn')) {
            console.log('🛒 Richiesta acquisto aereo dalla configurazione rotta');
            
            // Chiudi pannello configurazione
            if (typeof RouteUIManager !== 'undefined' && RouteUIManager.closeRouteCreationPanel) {
                RouteUIManager.closeRouteCreationPanel();
            }
            
            // Vai al tab flotta
            if (self.game.uiManager && self.game.uiManager.switchTab) {
                self.game.uiManager.switchTab('fleet');
            }
            
            // Mostra notifica
            if (self.game.uiManager) {
                self.game.uiManager.showNotification('Vai al tab Flotta per acquistare un aereo', 'info');
            }
        }
        
        // Listener per bottoni tipo di rotta
        if (e.target && e.target.closest('.route-type-btn-compact')) {
            var button = e.target.closest('.route-type-btn-compact');
            var routeType = button.getAttribute('data-type');
            
            // Rimuovi classe active da tutti i bottoni
            var allRouteTypeBtns = document.querySelectorAll('.route-type-btn-compact');
            allRouteTypeBtns.forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // Aggiungi classe active al bottone cliccato
            button.classList.add('active');
            
            console.log('📋 Tipo di rotta selezionato:', routeType);
            
            // Salva selezione nello stato
            if (typeof RouteUIManager !== 'undefined') {
                RouteUIManager.routeCreationState.selectedRouteType = routeType;
            }
            
            // Aggiorna stime basate sul tipo di rotta
            if (typeof RouteUIManager !== 'undefined' && RouteUIManager.updateRouteTypeEstimates) {
                RouteUIManager.updateRouteTypeEstimates(routeType);
            }
        }
    });
};

// Gestisce click su aeroporto
WorldMap.prototype.onAirportClick = function(airport, e) {
    console.log('🏢 Click su aeroporto:', airport.code);
    this.selectedAirport = airport;
    
    // Se il pannello di creazione rotte è aperto
    if (this.routeCreationState && this.routeCreationState.isOpen) {
        // Usa sempre la logica intelligente del RouteUIManager
        console.log('� Pannello rotte aperto, delegando al RouteUIManager...');
        this.selectAirportForSlot(airport, 'auto');
        return;
    }
    
    // Notifica al game manager
    if (this.game.uiManager) {
        this.game.uiManager.showAirportInfo(airport);
    }
};

// Gestisce click sulla mappa
WorldMap.prototype.onMapClick = function(e) {
    console.log('🗺️ Click su mappa:', e.latlng);
    
    // Nascondi pannello info se visibile
    if (this.game.uiManager) {
        this.game.uiManager.hideAirportInfo();
    }
};

// Crea rotta da aeroporto
WorldMap.prototype.createRouteFromAirport = function(airportCode) {
    console.log('🛣️ Azione aeroporto:', airportCode);
    
    var airport = AirportData.getAirportByCode(airportCode);
    if (!airport) return;
    
    // Se il pannello NON è aperto, comportamento normale: apri e imposta origine
    if (!this.routeCreationState.isOpen) {
        console.log('📋 Apertura pannello e impostazione origine:', airportCode);
        this.openRouteCreationPanel();
        
        this.routeCreationState.originAirport = airport;
        this.updateSlotDisplay('origin', airport);
        this.updateCreateButton();
        this.selectSlot('destination');
        
        return;
    }
    
    // Se il pannello È APERTO, logica "Aggiungi a Rotta"
    console.log('➕ Aggiunta aeroporto a rotta esistente:', airportCode);
    
    // Verifica che non sia già utilizzato
    if ((this.routeCreationState.originAirport && this.routeCreationState.originAirport.code === airportCode) ||
        (this.routeCreationState.destinationAirport && this.routeCreationState.destinationAirport.code === airportCode)) {
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Aeroporto già presente nella rotta', 'warning');
        }
        return;
    }
    
    // Determina dove mettere l'aeroporto basandosi sul blocco origine
    if (this.routeCreationState.originLocked && this.routeCreationState.originAirport) {
        // Origine bloccata: sostituisci sempre destinazione
        console.log('🔒 Origine bloccata, sostituisco destinazione con:', airportCode);
        this.routeCreationState.destinationAirport = airport;
        this.updateSlotDisplay('destination', airport);
    } else {
        // Origine non bloccata: sostituisci primo slot (origine prioritaria)
        console.log('🔓 Origine non bloccata, sostituisco origine con:', airportCode);
        this.routeCreationState.originAirport = airport;
        this.updateSlotDisplay('origin', airport);
        
        // Se non c'è destinazione, attiva il suo slot
        if (!this.routeCreationState.destinationAirport) {
            this.selectSlot('destination');
        }
    }
    
    // Aggiorna UI
    this.updateCreateButton();
    this.updateRouteInfo();
    
    console.log('✅ Aeroporto aggiunto alla rotta');
};

// Aggiorna marker di un aeroporto specifico
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
};

// Refresh completo di tutti i marker
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

// Evidenzia un aeroporto
WorldMap.prototype.highlightAirport = function(airportCode) {
    var marker = this.airportMarkers[airportCode];
    if (marker) {
        marker.openPopup();
        this.map.setView(marker.getLatLng(), 6);
    }
};

// Rendering mappa
WorldMap.prototype.render = function() {
    // Refresh della mappa se necessario
    if (this.map) {
        this.map.invalidateSize();
    }
};

// === FUNZIONI DELEGATE A RouteUIManager ===

WorldMap.prototype.openRouteCreationPanel = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.openRouteCreationPanel();
    }
    console.warn('⚠️ RouteUIManager non disponibile');
    return false;
};

WorldMap.prototype.closeRouteCreationPanel = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.closeRouteCreationPanel();
    }
    console.warn('⚠️ RouteUIManager non disponibile');
    return false;
};

WorldMap.prototype.toggleOriginLock = function() {
    if (typeof RouteUIManager !== 'undefined') {
        var result = RouteUIManager.toggleOriginLock();
        if (!result.success && this.game.uiManager) {
            this.game.uiManager.showNotification(result.message, 'warning');
        }
        return result;
    }
    console.warn('⚠️ RouteUIManager non disponibile');
    return { success: false, message: 'RouteUIManager non disponibile' };
};

WorldMap.prototype.clearDestination = function() {
    if (typeof RouteUIManager !== 'undefined') {
        var result = RouteUIManager.clearDestination();
        return result;
    }
    console.warn('⚠️ RouteUIManager non disponibile');
    return { success: false, message: 'RouteUIManager non disponibile' };
};

WorldMap.prototype.updateLockButton = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.updateLockButton();
    }
    console.warn('⚠️ RouteUIManager non disponibile');
};

WorldMap.prototype.updateOriginSlotAppearance = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.updateOriginSlotAppearance();
    }
    console.warn('⚠️ RouteUIManager non disponibile');
};

WorldMap.prototype.selectSlot = function(slotType) {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.selectSlot(slotType);
    }
    console.warn('⚠️ RouteUIManager non disponibile');
};

WorldMap.prototype.selectAirportForSlot = function(airport, slotType) {
    if (typeof RouteUIManager !== 'undefined' && RouteUIManager.selectAirportForSlot) {
        return RouteUIManager.selectAirportForSlot(airport, slotType);
    }
    console.warn('⚠️ RouteUIManager.selectAirportForSlot non disponibile');
    
    // Fallback semplice per evitare errori
    console.log('🛫 Fallback: selezione aeroporto', airport.code, 'per slot', slotType);
    return false;
};

WorldMap.prototype.updateSlotDisplay = function(slotType, airport) {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.updateSlotDisplay(slotType, airport);
    }
    console.warn('⚠️ RouteUIManager non disponibile');
};

WorldMap.prototype.updateCreateButton = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.updateCreateButton();
    }
    console.warn('⚠️ RouteUIManager non disponibile');
};

WorldMap.prototype.updateRouteInfo = function() {
    if (typeof RouteUIManager !== 'undefined') {
        var origin = this.routeCreationState.originAirport;
        var destination = this.routeCreationState.destinationAirport;
        return RouteUIManager.updateRouteInfo(origin, destination);
    }
    console.warn('⚠️ RouteUIManager non disponibile');
};

WorldMap.prototype.openRouteConfigPanel = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.openRouteConfigPanel();
    }
    console.warn('⚠️ RouteUIManager non disponibile');
    return false;
};

// Reset stato creazione rotte
WorldMap.prototype.resetRouteCreationState = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.resetRouteCreationState();
    }
    
    // Fallback
    this.routeCreationState = {
        isOpen: false,
        activeSlot: null,
        originAirport: null,
        destinationAirport: null,
        originLocked: false
    };
    
    console.log('✅ Stato creazione rotte resettato');
};

// Auto-popolamento slot origine
WorldMap.prototype.autoPopulateOriginSlot = function() {
    console.log('🤖 Auto-popolamento slot origine...');
    var originAirport = null;
    // Priorità 1: Ultimo aeroporto selezionato
    if (this.selectedAirport) {
        originAirport = this.selectedAirport;
        console.log('📍 Usando aeroporto selezionato:', originAirport.code);
    }
    // Priorità 2: Hub principale del giocatore
    else if (this.game.hubManager) {
        var hubs = this.game.hubManager.getPlayerHubCodes();
        if (hubs.length > 0) {
            // Prendi il primo hub (potremmo ordinare per dimensione/importanza)
            var hubCode = hubs[0];
            originAirport = window.AirportData && window.AirportData.getAirportByCode ? window.AirportData.getAirportByCode(hubCode) : null;
            console.log('🏢 Usando hub principale:', hubCode);
        }
    }
    // Popolamento automatico
    if (originAirport) {
        this.routeCreationState.originAirport = originAirport;
        this.updateSlotDisplay('origin', originAirport);
        console.log('✅ Slot origine auto-popolato:', originAirport.code);
    } else {
        console.log('ℹ️ Nessun aeroporto per auto-popolamento origine');
    }
};

// Pulisci slot origine/destinazione
WorldMap.prototype.clearSlot = function(slotType) {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.clearSlot(slotType);
    }
    
    // Fallback
    var slotElement = document.getElementById(slotType + '-airport');
    if (!slotElement) return;
    
    var placeholder = slotType === 'origin' ? 'Seleziona aeroporto di partenza' : 'Seleziona aeroporto di arrivo';
    
    slotElement.innerHTML = '<span class="placeholder">' + placeholder + '</span>';
    slotElement.classList.remove('selected', 'active', 'locked');
    
    console.log('✅ Slot', slotType, 'pulito');
};

// Pulisci tutti gli slot attivi (delegata ma serve fallback)
WorldMap.prototype.clearActiveSlots = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.clearActiveSlots();
    }
    
    // Fallback
    var originSlot = document.getElementById('origin-airport');
    var destinationSlot = document.getElementById('destination-airport');
    
    if (originSlot) originSlot.classList.remove('active');
    if (destinationSlot) destinationSlot.classList.remove('active');
    
    console.log('✅ Slot attivi puliti');
};

// Nascondi info rotte (delegata ma serve fallback)
WorldMap.prototype.hideRouteInfo = function() {
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.hideRouteInfo();
    }
    
    // Fallback
    var routeInfoPanel = document.getElementById('route-info');
    if (routeInfoPanel) {
        routeInfoPanel.style.display = 'none';
    }
    
    console.log('✅ Info rotte nascoste');
};

// Creazione rotta dal pannello
WorldMap.prototype.createRouteFromPanel = function() {
    console.log('🛠️ Creazione rotta dal pannello...');
    
    var origin = this.routeCreationState.originAirport;
    var destination = this.routeCreationState.destinationAirport;
    
    if (!origin || !destination) {
        console.error('❌ Aeroporti origine/destinazione mancanti');
        return;
    }
    
    console.log('📋 Creazione rotta:', origin.code, '→', destination.code);
    
    // Delega al route manager
    if (this.game.routeManager) {
        var result = this.game.routeManager.createRoute(origin.code, destination.code);
        
        if (result.success) {
            console.log('✅ Rotta creata con successo');
            
            // Aggiungi rotta alla mappa
            this.addRouteToMap(result.route);
            
            // Se l'origine è bloccata, mantieni il pannello aperto e pulisci solo destinazione
            if (this.routeCreationState.originLocked) {
                this.clearDestination();
                this.selectSlot('destination'); // Seleziona automaticamente destinazione per prossima rotta
                console.log('🔒 Origine bloccata, pronto per nuova destinazione');
            } else {
                // Chiudi pannello completamente
                this.closeRouteCreationPanel();
            }
            
            // Notifica successo
            if (this.game.uiManager) {
                this.game.uiManager.showNotification('Rotta creata: ' + origin.code + ' → ' + destination.code, 'success');
            }
        } else {
            console.warn('❌ Errore creazione rotta:', result.message);
            
            // Mostra errore
            if (this.game.uiManager) {
                this.game.uiManager.showNotification(result.message, 'error');
            }
        }
    } else {
        console.error('❌ RouteManager non disponibile');
    }
};

// Aggiorna tutti i popup degli aeroporti
WorldMap.prototype.updateAllAirportPopups = function() {
    console.log('🔄 Aggiornamento popup aeroporti...');
    var self = this;
    for (var code in this.airportMarkers) {
        var marker = this.airportMarkers[code];
        if (marker && marker.airportData) {
            var airport = marker.airportData;
            var isPlayerHub = marker.isPlayerHub === true; // solo flag aggiornato da loadPlayerHubs
            var newContent = self.createAirportPopup(airport, isPlayerHub);
            marker.setPopupContent(newContent);
        }
    }
    console.log('✅ Popup aeroporti aggiornati');
};

// Carica e visualizza gli hub del player sulla mappa SOLO tramite API
WorldMap.prototype.loadPlayerHubs = function() {
    var self = this;
    var companyId = this.game && this.game.companyId ? this.game.companyId : 1;
    fetch('/api/game/companies/' + companyId + '/hubs')
        .then(res => res.json())
        .then(response => {
            if (!response.success || !Array.isArray(response.data)) {
                console.warn('⚠️ Nessun hub ricevuto dal backend');
                return;
            }
            var hubs = response.data;
            // Evidenzia i marker hub sulla mappa SOLO dopo fetch
            hubs.forEach(function(hub) {
                var code = hub.iata_code || hub.icao_code || hub.code;
                var marker = self.airportMarkers[code];
                if (marker) {
                    marker.isPlayerHub = true;
                    // Aggiorna icona e popup usando la funzione centralizzata
                    var props = self.getAirportIconProps(marker.airportData, true);
                    var airportIcon = L.divIcon({
                        className: 'airport-marker',
                        html: props.iconHtml,
                        iconSize: props.iconSize,
                        iconAnchor: [props.iconSize[0]/2, props.iconSize[1]/2]
                    });
                    marker.setIcon(airportIcon);
                    marker.setPopupContent(self.createAirportPopup(marker.airportData, true));
                    // Forza la visibilità dell'hub
                    marker.addTo(self.map);
                }
            });
        })
        .catch(error => {
            console.error('❌ Errore caricamento hub dal backend:', error);
        });
};
