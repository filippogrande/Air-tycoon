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

// Carica aeroporti sulla mappa (sempre dal backend)
WorldMap.prototype.loadAirports = function() {
    console.log('✈️ Caricamento aeroporti dalla API backend...');
    fetch('/api/airports?limit=2000')
        .then(res => res.json())
        .then(airports => {
            if (!Array.isArray(airports) || airports.length === 0) {
                console.warn('⚠️ Nessun aeroporto ricevuto dal backend');
                return;
            }
            this._renderAirportsOnMap(airports);
        })
        .catch(error => {
            console.error('❌ Errore caricamento aeroporti dal backend:', error);
        });
};

// Fallback statico rimosso: ora sempre da backend
WorldMap.prototype._loadAirportsStaticFallback = function() {
    console.error('❌ Fallback statico aeroporti disabilitato: usa solo backend');
};

// Renderizza aeroporti sulla mappa
WorldMap.prototype._renderAirportsOnMap = function(airports) {
    console.log('🗺️ Rendering aeroporti sulla mappa:', airports.length);
    // Aggiorna window.AirportData con i dati reali dal backend
    window.AirportData = window.AirportData || {};
    window.AirportData.airports = airports;
    // Ricostruisci l'indice per getAirportByCode
    window.AirportData._airportByCode = {};
    for (var i = 0; i < airports.length; i++) {
        var airport = airports[i];
        if (airport.code) {
            window.AirportData._airportByCode[airport.code] = airport;
        }
        // Verifica che l'aeroporto abbia dati validi
        if (!airport.latitude || !airport.longitude || !airport.code) {
            console.warn('⚠️ Aeroporto con dati invalidi:', airport);
            continue;
        }
        var marker = this.createAirportMarker(airport);
        this.airportMarkers[airport.code] = marker;
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
            MapVisibilityManager.updateAirportVisibility(self.game, self.map, self.airportMarkers, zoom);
        });
    } else {
        console.warn('⚠️ MapVisibilityManager non caricato, usando logica semplificata');
        this.setupZoomBasedVisibility();
    }
    
    console.log('✅ Creati marker per', airports.length, 'aeroporti');
};

// Crea marker per un aeroporto
WorldMap.prototype.createAirportMarker = function(airport) {
    var self = this;
    var isPlayerHub = this.game.hubManager && this.game.hubManager.hasHub(airport.code);
    var iconHtml, iconSize, zIndex;
    
    // Determina icona e dimensioni basate su tipo e proprietà
    if (isPlayerHub) {
        // Hub del giocatore - target verde
        iconHtml = '<div class="airport-icon player-hub"></div>';
        iconSize = [20, 20];
        zIndex = 1000;
    } else {
        // Tutti gli altri aeroporti - map-pin con dimensioni diverse
        iconHtml = '<div class="airport-icon standard-airport"></div>';
        
        // Dimensione dell'icona basata sulla dimensione dell'aeroporto
        // Map-pin ha proporzioni 4:5 (larghezza:altezza)
        // Differenze più marcate per distinguerli chiaramente
        if (airport.size === 'large') {
            iconSize = [20, 25];  // Aeroporti grandi ben visibili
            zIndex = 800;
        } else if (airport.size === 'medium') {
            iconSize = [14, 18];  // Aeroporti medi di dimensione media
            zIndex = 700;
        } else {
            iconSize = [10, 12];  // Aeroporti piccoli più discreti
            zIndex = 600;
        }
    }
    
    var airportIcon = L.divIcon({
        className: 'airport-marker',
        html: iconHtml,
        iconSize: iconSize,
        iconAnchor: [iconSize[0]/2, iconSize[1]/2]
    });
    
    var marker = L.marker([airport.latitude, airport.longitude], {
        icon: airportIcon,
        title: (airport.name || 'Aeroporto sconosciuto') + ' (' + (airport.code || 'N/A') + ')',
        zIndexOffset: zIndex
    });
    
    // Popup con informazioni aeroporto
    var popupContent = this.createAirportPopup(airport, isPlayerHub);
    marker.bindPopup(popupContent);
    
    // Event handler per click
    marker.on('click', function(e) {
        // Non aggiorniamo il popup qui per evitare conflitti con Leaflet
        // Il popup si aprirà automaticamente con il contenuto bindato
        self.onAirportClick(airport, e);
    });
    
    // Salva riferimento airport nel marker
    marker.airportData = airport;
    
    return marker;
};

// Crea popup per un aeroporto
WorldMap.prototype.createAirportPopup = function(airport, isPlayerHub) {
    // Usa RouteUIManager se disponibile, altrimenti fallback
    if (typeof RouteUIManager !== 'undefined') {
        return RouteUIManager.createAirportPopup(airport, isPlayerHub);
    }
    
    // Fallback semplice
    return '<div class="airport-popup">' +
           '<h3>' + (airport.name || 'Nome non disponibile') + '</h3>' +
           '<p><strong>Codice:</strong> ' + (airport.code || 'N/A') + '</p>' +
           '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">Crea Rotta</button>' +
           '</div>';
};

// Setup visibilità basata su zoom (fallback)
WorldMap.prototype.setupZoomBasedVisibility = function() {
    // Fallback se MapVisibilityManager non è disponibile
    var self = this;
    
    this.map.on('zoomend', function() {
        self.updateAirportVisibilitySimple();
    });
    
    this.map.on('moveend', function() {
        self.updateAirportVisibilitySimple();
    });
    
    this.updateAirportVisibilitySimple();
};

// Aggiorna visibilità aeroporti (versione semplice)
WorldMap.prototype.updateAirportVisibilitySimple = function() {
    // Logica fallback semplice se MapVisibilityManager non è disponibile
    var zoom = this.map.getZoom();
    var visibleCount = 0;
    
    for (var code in this.airportMarkers) {
        var marker = this.airportMarkers[code];
        var shouldShow = zoom >= 3; // Mostra tutti gli aeroporti a zoom >= 3
        
        if (shouldShow && !this.map.hasLayer(marker)) {
            marker.addTo(this.map);
            visibleCount++;
        } else if (!shouldShow && this.map.hasLayer(marker)) {
            this.map.removeLayer(marker);
        }
    }
    
    console.log('✅ Visibilità fallback: aeroporti visibili:', visibleCount);
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
    
    // Aggiorna tutti i marker degli aeroporti
    for (var code in this.airportMarkers) {
        var marker = this.airportMarkers[code];
        if (marker && marker.airportData) {
            var airport = marker.airportData;
            var isPlayerHub = this.game.hubManager && this.game.hubManager.hasHub(airport.code);
            var newContent = self.createAirportPopup(airport, isPlayerHub);
            
            // Aggiorna il contenuto del popup bindato
            marker.setPopupContent(newContent);
        }
    }
    
    console.log('✅ Popup aeroporti aggiornati');
};

// Conferma creazione rotta
WorldMap.prototype.confirmCreateRoute = function() {
    console.log('✅ Conferma creazione rotta...');
    
    if (!this.routeCreationState.originAirport || !this.routeCreationState.destinationAirport) {
        console.warn('⚠️ Origine o destinazione mancante');
        return false;
    }
    
    var origin = this.routeCreationState.originAirport;
    var destination = this.routeCreationState.destinationAirport;
    
    // Crea la rotta usando il RouteManager
    if (typeof RouteManager !== 'undefined') {
        var success = RouteManager.createRoute(origin, destination);
        
        if (success) {
            console.log('✅ Rotta creata con successo!');
            
            // Chiudi pannelli
            this.closeRouteCreationPanel();
            
            // Reset stato
            this.resetRouteCreationState();
            
            // Aggiorna visualizzazione mappa
            this.updateRouteDisplay();
            
            return true;
        } else {
            console.error('❌ Errore nella creazione della rotta');
            return false;
        }
    }
    
    console.warn('⚠️ RouteManager non disponibile');
    return false;
};

// Export per uso globale
window.WorldMap = WorldMap;
console.log('✅ WorldMap con Leaflet caricato');
