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
        
        // Aggiungi tile layer con mare blu per aviazione
        // OpenStreetMap standard con bellissimo mare blu
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
    console.log('✈️ Caricamento aeroporti sulla mappa...');
    
    if (!AirportData) {
        console.error('❌ AirportData non definito');
        return;
    }
    
    if (!AirportData.airports) {
        console.error('❌ AirportData.airports non definito');
        return;
    }
    
    var airports = AirportData.airports;
    console.log('📊 Aeroporti disponibili:', airports.length);
    
    if (airports.length === 0) {
        console.warn('⚠️ Nessun aeroporto nei dati');
        return;
    }
    
    // Debug: mostra primi 3 aeroporti
    console.log('🔍 DEBUG: Primi 3 aeroporti:', airports.slice(0, 3).map(function(a) {
        return a.code + ' (' + a.name + ') - ' + a.latitude + ',' + a.longitude + ' - size: ' + a.size;
    }));
    
    for (var i = 0; i < airports.length; i++) {
        var airport = airports[i];
        
        // Verifica che l'aeroporto abbia dati validi
        if (!airport.latitude || !airport.longitude || !airport.code) {
            console.warn('⚠️ Aeroporto con dati invalidi:', airport);
            continue;
        }
        
        // Crea marker con icona appropriata
        var marker = this.createAirportMarker(airport);
        // Non aggiungere direttamente alla mappa - sarà gestito dalla visibilità
        
        this.airportMarkers[airport.code] = marker;
    }
    
    console.log('📋 Marker creati:', Object.keys(this.airportMarkers).length);
    
    // Inizializza il MapVisibilityManager
    if (typeof MapVisibilityManager !== 'undefined') {
        console.log('✅ MapVisibilityManager disponibile, inizializzazione...');
        var self = this;
        MapVisibilityManager.setupZoomBasedVisibility(this.map, function(zoom) {
            console.log('🔍 Callback visibilità chiamato, zoom:', zoom);
            MapVisibilityManager.updateAirportVisibility(self.game, self.map, self.airportMarkers, zoom);
        });
    } else {
        console.warn('⚠️ MapVisibilityManager non caricato, usando logica semplificata');
        this.setupZoomBasedVisibility();
    }
    
    console.log('✅ Creati marker per', airports.length, 'aeroporti');
};

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

// Calcola distanza tra due punti in km (formula Haversine semplificata)
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
    
    // Setup eventi pannello creazione rotte
    this.setupRouteCreationEvents();
};

WorldMap.prototype.setupRouteCreationEvents = function() {
    var self = this;
    
    // Stato del pannello di creazione rotte
    this.routeCreationState = {
        isOpen: false,
        activeSlot: null, // 'origin' o 'destination'
        originAirport: null,
        destinationAirport: null,
        originLocked: false // Nuovo: stato blocco origine
    };
    
    // Stato configurazione rotta avanzata
    this.routeConfigState = {
        isOpen: false,
        routeType: 'passenger', // 'passenger', 'cargo', 'mixed'
        analysisLevel: 'basic', // 'basic', 'improved'
        marketAnalysis: false, // se è stata acquistata l'analisi di mercato
        estimatedPassengers: 0,
        estimatedCargo: 0,
        costPerFlight: 0,
        monthlyRevenue: 0,
        creationCost: 0,
        countriesOverflown: 0,
        // Valori "reali" per calcolare errore
        realPassengers: 0,
        realCargo: 0,
        realRevenue: 0
    };
    
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
    
    // Bottoni pannello configurazione
    var confirmCreateBtn = document.getElementById('confirm-create-route');
    if (confirmCreateBtn) {
        confirmCreateBtn.addEventListener('click', function() {
            self.createRouteFromConfig();
        });
    }
    
    var backToSelectionBtn = document.getElementById('back-to-selection');
    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function() {
            self.closeRouteConfigPanel();
        });
    }
    
    var improveAnalysisBtn = document.getElementById('improve-analysis-btn');
    if (improveAnalysisBtn) {
        improveAnalysisBtn.addEventListener('click', function() {
            self.improveRouteAnalysis();
        });
    }
    
    var marketAnalysisBtn = document.getElementById('market-analysis-btn');
    if (marketAnalysisBtn) {
        marketAnalysisBtn.addEventListener('click', function() {
            self.purchaseMarketAnalysis();
        });
    }
    
    // Bottoni tipo rotta
    var routeTypeButtons = document.querySelectorAll('.route-type-btn');
    for (var i = 0; i < routeTypeButtons.length; i++) {
        routeTypeButtons[i].addEventListener('click', function() {
            self.selectRouteType(this.dataset.type);
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
};

WorldMap.prototype.onAirportClick = function(airport, e) {
    console.log('🏢 Click su aeroporto:', airport.code);
    this.selectedAirport = airport;
    
    // Se il pannello di creazione rotte è aperto
    if (this.routeCreationState && this.routeCreationState.isOpen) {
        // Se l'origine è bloccata, qualsiasi aeroporto selezionato va sempre in destinazione
        if (this.routeCreationState.originLocked) {
            console.log('🔒 Origine bloccata, aeroporto va in destinazione:', airport.code);
            this.selectAirportForSlot(airport, 'destination');
            return;
        }
        
        // Se l'origine non è bloccata e c'è uno slot attivo, usa quello
        if (this.routeCreationState.activeSlot) {
            this.selectAirportForSlot(airport, this.routeCreationState.activeSlot);
            return;
        }
        
        // Se non c'è slot attivo, auto-seleziona il primo slot libero
        if (!this.routeCreationState.originAirport) {
            this.selectAirportForSlot(airport, 'origin');
        } else if (!this.routeCreationState.destinationAirport) {
            this.selectAirportForSlot(airport, 'destination');
        }
        return;
    }
    
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
        console.log('� Origine non bloccata, sostituisco origine con:', airportCode);
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

// METODI PER CREAZIONE ROTTE - Migrati a RouteUIManager

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

WorldMap.prototype.resetRouteCreationState = function() {
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
};

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
            originAirport = AirportData.getAirportByCode(hubCode);
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

WorldMap.prototype.selectSlot = function(slotType) {
    console.log('🎯 Selezione slot:', slotType);
    
    // Pulisci selezioni precedenti
    this.clearActiveSlots();
    
    // Imposta slot attivo
    this.routeCreationState.activeSlot = slotType;
    
    // Evidenzia visivamente lo slot
    var slotElement = document.getElementById(slotType + '-airport');
    if (slotElement) {
        slotElement.classList.add('active');
    }
    
    console.log('✅ Slot attivo:', slotType);
};

WorldMap.prototype.selectAirportForSlot = function(airport, slotType) {
    // Se slotType non è fornito, usa activeSlot
    if (!slotType) {
        slotType = this.routeCreationState.activeSlot;
    }
    
    console.log('✈️ Selezione aeroporto', airport.code, 'per slot', slotType);
    
    // Verifica che non sia lo stesso aeroporto dell'altro slot
    if (slotType === 'origin' && this.routeCreationState.destinationAirport && 
        this.routeCreationState.destinationAirport.code === airport.code) {
        console.warn('⚠️ Non è possibile selezionare lo stesso aeroporto per origine e destinazione');
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Non puoi usare lo stesso aeroporto per origine e destinazione', 'error');
        }
        return;
    }
    
    if (slotType === 'destination' && this.routeCreationState.originAirport && 
        this.routeCreationState.originAirport.code === airport.code) {
        console.warn('⚠️ Non è possibile selezionare lo stesso aeroporto per origine e destinazione');
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Non puoi usare lo stesso aeroporto per origine e destinazione', 'error');
        }
        return;
    }
    
    // Imposta aeroporto nel slot
    this.routeCreationState[slotType + 'Airport'] = airport;
    
    // Aggiorna visualizzazione
    this.updateSlotDisplay(slotType, airport);
    
    // Pulisci selezione attiva
    this.clearActiveSlots();
    this.routeCreationState.activeSlot = null;
    
    // Aggiorna UI
    this.updateCreateButton();
    this.updateRouteInfo();
    
    console.log('✅ Aeroporto selezionato per', slotType + ':', airport.code);
};

WorldMap.prototype.updateSlotDisplay = function(slotType, airport) {
    var slotElement = document.getElementById(slotType + '-airport');
    if (!slotElement || !airport) return;
    
    // Crea contenuto slot
    var content = '<div class="airport-info">' + airport.name + ' (' + airport.code + ')</div>' +
                 '<div class="airport-details">' + airport.city + ', ' + airport.country + '</div>';
    
    slotElement.innerHTML = content;
    slotElement.classList.add('selected');
    slotElement.classList.remove('active');
    
    // Se è l'origine e aggiorniamo il lock button
    if (slotType === 'origin') {
        this.updateLockButton();
        this.updateOriginSlotAppearance();
    }
};

WorldMap.prototype.clearSlot = function(slotType) {
    var slotElement = document.getElementById(slotType + '-airport');
    if (!slotElement) return;
    
    var placeholder = slotType === 'origin' ? 'Seleziona aeroporto di partenza' : 'Seleziona aeroporto di arrivo';
    
    slotElement.innerHTML = '<span class="placeholder">' + placeholder + '</span>';
    slotElement.classList.remove('selected', 'active', 'locked');
    
    // Se è l'origine, aggiorna anche il lock button
    if (slotType === 'origin') {
        this.updateLockButton();
    }
};

WorldMap.prototype.clearActiveSlots = function() {
    var originSlot = document.getElementById('origin-airport');
    var destinationSlot = document.getElementById('destination-airport');
    
    if (originSlot) originSlot.classList.remove('active');
    if (destinationSlot) destinationSlot.classList.remove('active');
};

WorldMap.prototype.updateCreateButton = function() {
    var createBtn = document.getElementById('create-route-btn');
    if (!createBtn) return;
    
    var canCreate = this.routeCreationState.originAirport && this.routeCreationState.destinationAirport;
    
    createBtn.disabled = !canCreate;
    createBtn.textContent = canCreate ? 'Configura Rotta' : 'Seleziona Aeroporti';
};

WorldMap.prototype.updateRouteInfo = function() {
    var routeInfoPanel = document.getElementById('route-info');
    if (!routeInfoPanel) return;
    
    var origin = this.routeCreationState.originAirport;
    var destination = this.routeCreationState.destinationAirport;
    
    if (!origin || !destination) {
        routeInfoPanel.style.display = 'none';
        return;
    }
    
    // Calcola stime traffico con errore usando RouteCalculator
    var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'basic');
    
    // Aggiorna display
    document.getElementById('route-distance').textContent = Math.round(estimates.distance);
    document.getElementById('flight-time').textContent = estimates.flightTime.formatted;
    document.getElementById('estimated-passengers').textContent = estimates.displayPassengers;
    document.getElementById('estimated-cargo').textContent = estimates.displayCargo;
    
    routeInfoPanel.style.display = 'block';
};

WorldMap.prototype.hideRouteInfo = function() {
    var routeInfoPanel = document.getElementById('route-info');
    if (routeInfoPanel) {
        routeInfoPanel.style.display = 'none';
    }
};

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

// METODI PER PANNELLO CONFIGURAZIONE ROTTA

WorldMap.prototype.openRouteConfigPanel = function() {
    console.log('⚙️ Apertura pannello configurazione rotta...');
    
    var configPanel = document.getElementById('route-config-panel');
    var creationPanel = document.getElementById('route-creation-panel');
    
    if (!configPanel || !creationPanel) return;
    
    // Nascondi pannello selezione e mostra configurazione
    creationPanel.classList.remove('active');
    configPanel.classList.add('active');
    
    // Imposta stato configurazione
    this.routeConfigState.isOpen = true;
    this.routeConfigState.routeType = 'passenger';
    this.routeConfigState.analysisLevel = 'basic';  
    this.routeConfigState.marketAnalysis = false;
    
    // Reset bottoni analisi
    var improveBtn = document.getElementById('improve-analysis-btn');
    if (improveBtn) {
        improveBtn.disabled = false;
        improveBtn.textContent = '🔍 Migliora Stima Domanda (€5,000)';
    }
    
    // Popola i dati della rotta
    this.updateRouteConfigDisplay();
    
    console.log('✅ Pannello configurazione aperto');
};

WorldMap.prototype.closeRouteConfigPanel = function() {
    console.log('⚙️ Chiusura pannello configurazione rotta...');
    
    var configPanel = document.getElementById('route-config-panel');
    var creationPanel = document.getElementById('route-creation-panel');
    
    if (!configPanel || !creationPanel) return;
    
    // Mostra pannello selezione e nascondi configurazione
    configPanel.classList.remove('active');
    creationPanel.classList.add('active');
    
    // Reset stato configurazione
    this.routeConfigState.isOpen = false;
    
    // Reset analisi di mercato
    this.routeConfigState.marketAnalysis = false;
    this.updateMarketAnalysisDisplay();
    
    // Reset tipo rotta a passeggeri
    this.selectRouteType('passenger');
};

WorldMap.prototype.updateConfigEstimates = function() {
    var analysisAccuracy = this.routeConfigState.analysisLevel === 'improved' ? '±10%' : '±30%';
    var cargoAccuracy = this.routeConfigState.analysisLevel === 'improved' ? '±8%' : '±25%';
    
    var passengers = this.routeConfigState.estimatedPassengers;
    var cargo = this.routeConfigState.estimatedCargo;
    
    // Aggiorna display stime
    document.getElementById('config-passengers').textContent = passengers;
    document.getElementById('config-cargo').textContent = cargo;
    
    // Aggiorna accuratezza
    var accuracySpans = document.querySelectorAll('.config-accuracy');
    if (accuracySpans[0]) accuracySpans[0].textContent = '(' + analysisAccuracy + ')';
    if (accuracySpans[1]) accuracySpans[1].textContent = '(' + cargoAccuracy + ')';
    
    // Aggiorna anche i costi se l'analisi di mercato è disponibile
    if (this.routeConfigState.marketAnalysis) {
        this.updateConfigCosts();
    }
};

WorldMap.prototype.updateConfigCosts = function() {
    var routeType = this.routeConfigState.routeType;
    var distance = this.routeConfigState.distance;
    
    // Calcola ricavi stimati
    var dailyRevenue = 0;
    if (routeType === 'passenger') {
        dailyRevenue = this.routeConfigState.estimatedPassengers * 120; // €120 per passeggero medio
    } else if (routeType === 'cargo') {
        dailyRevenue = this.routeConfigState.estimatedCargo * 800; // €800 per tonnellata
    } else {
        dailyRevenue = (this.routeConfigState.estimatedPassengers * 120) + 
                      (this.routeConfigState.estimatedCargo * 800);
    }
    
    var monthlyRevenue = dailyRevenue * 30;
    
    // Calcola costi operativi (più alti per distanze maggiori)
    var costPerFlight = 5000 + (distance * 2);
    var flightsPerMonth = 30; // 1 volo al giorno
    var monthlyCost = costPerFlight * flightsPerMonth;
    
    var estimatedProfit = monthlyRevenue - monthlyCost;
    
    // Aggiorna display
    document.getElementById('cost-per-flight').textContent = costPerFlight.toLocaleString();
    document.getElementById('config-monthly-revenue').textContent = monthlyRevenue.toLocaleString();
    document.getElementById('monthly-operating-cost').textContent = monthlyCost.toLocaleString();
    document.getElementById('estimated-profit').textContent = estimatedProfit.toLocaleString();
    
    // Colora il profitto
    var profitElement = document.getElementById('estimated-profit');
    if (profitElement) {
        profitElement.style.color = estimatedProfit > 0 ? '#27ae60' : '#e74c3c';
    }
    
    // Salva i valori per uso futuro
    this.routeConfigState.costPerFlight = costPerFlight;
    this.routeConfigState.monthlyRevenue = monthlyRevenue;
    this.routeConfigState.monthlyCost = monthlyCost;
    this.routeConfigState.estimatedProfit = estimatedProfit;
};

WorldMap.prototype.updateRouteConfigDisplay = function() {
    var origin = this.routeCreationState.originAirport;
    var destination = this.routeCreationState.destinationAirport;
    
    // Calcola distanza usando RouteCalculator
    var distance = RouteCalculator.calculateDistance(
        origin.latitude, origin.longitude,
        destination.latitude, destination.longitude
    );
    
    // Calcola nazioni sorvolate
    var countriesCount = this.calculateCountriesOverflown(origin, destination);
    
    // Aggiorna informazioni base
    document.getElementById('config-origin').textContent = origin.code;
    document.getElementById('config-destination').textContent = destination.code;
    document.getElementById('config-distance').textContent = Math.round(distance);
    document.getElementById('countries-count').textContent = countriesCount;
        
    var flightHours = distance / 800; // Velocità approssimativa di crociera
    var hours = Math.floor(flightHours);
    var minutes = Math.round((flightHours - hours) * 60);
    document.getElementById('config-flight-time').textContent = hours + 'h ' + minutes + 'm';
    
    // Calcola stime traffico con errore
    var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, this.routeConfigState.analysisLevel);
    
    // Salva dati nello stato
    this.routeConfigState.estimatedPassengers = estimates.displayPassengers;
    this.routeConfigState.estimatedCargo = estimates.displayCargo;
    this.routeConfigState.realPassengers = estimates.realPassengers;
    this.routeConfigState.realCargo = estimates.realCargo;
    this.routeConfigState.realRevenue = estimates.realRevenue;
    this.routeConfigState.distance = distance;
    this.routeConfigState.countriesOverflown = countriesCount;
    
    // Calcola costi
    this.routeConfigState.creationCost = this.calculateRouteCreationCost(distance, countriesCount);
    this.routeConfigState.costPerFlight = this.calculateFlightCost(distance);
    
    // Aggiorna display
    document.getElementById('route-creation-cost').textContent = this.routeConfigState.creationCost.toLocaleString();
    this.updateConfigEstimates();
    this.updateConfigCosts();
    
    // Reset analisi di mercato
    this.routeConfigState.marketAnalysis = false;
    this.updateMarketAnalysisDisplay();
    
    // Reset tipo rotta a passeggeri
    this.selectRouteType('passenger');
};

WorldMap.prototype.selectRouteType = function(type) {
    console.log('✈️ Selezione tipo rotta:', type);
    
    this.routeConfigState.routeType = type;
    
    // Aggiorna bottoni UI
    var buttons = document.querySelectorAll('.route-type-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Aggiorna stime basate sul tipo
    this.updateEstimatesForRouteType(type);
};

WorldMap.prototype.updateEstimatesForRouteType = function(type) {
    // Modifica le stime basandosi sul tipo di rotta
    var basePassengers = this.routeConfigState.estimatedPassengers;
    var baseCargo = this.routeConfigState.estimatedCargo;
    
    var passengers = basePassengers;
    var cargo = baseCargo;
    
    if (type === 'passenger') {
        // Priorità passeggeri: +20% passeggeri, -30% cargo
        passengers = Math.round(basePassengers * 1.2);
        cargo = Math.round(baseCargo * 0.7);
    } else if (type === 'cargo') {
        // Priorità cargo: -40% passeggeri, +50% cargo
        passengers = Math.round(basePassengers * 0.6);
        cargo = Math.round(baseCargo * 1.5);
    }
    // type === 'passenger' usa i valori originali
    
    // Aggiorna display stime
    document.getElementById('config-passengers').textContent = passengers;
    document.getElementById('config-cargo').textContent = cargo;
    
    // Aggiorna anche i costi se l'analisi di mercato è disponibile
    if (this.routeConfigState.marketAnalysis) {
        this.updateConfigCosts();
    }
};

WorldMap.prototype.calculateRouteCreationCost = function(distance, countriesOverflown) {
    // Costo base + costo per distanza + costo per nazioni sorvolate
    var baseCost = 25000; // €25,000 base (ridotto)
    var costPerKm = 15; // €15 per km (ridotto)
    var costPerCountry = 8000; // €8,000 per nazione sorvolata (diritti sorvolo, paperwork, etc.)
    
    var distanceCost = distance * costPerKm;
    var countryCost = (countriesOverflown - 1) * costPerCountry; // -1 perché origine non conta
    
    return Math.round(baseCost + distanceCost + countryCost);
};

WorldMap.prototype.calculateFlightCost = function(distance) {
    // Calcola costo per volo basato su distanza
    var baseCost = 5000; // €5,000 base per volo
    var costPerKm = 2; // €2 per km (carburante, equipaggio, etc.)
    
    return Math.round(baseCost + (distance * costPerKm));
};

WorldMap.prototype.calculateCountriesOverflown = function(origin, destination) {
    // Semplificazione: calcola in base alla distanza geografica
    // In un'implementazione reale, useresti un servizio di routing aereo
    
    var distance = RouteCalculator.calculateDistance(
        origin.latitude, origin.longitude,
        destination.latitude, destination.longitude
    );
    
    // Logica semplificata basata su distanza
    if (distance < 500) return 1; // Volo nazionale o molto vicino
    if (distance < 1500) return 2; // Europa/regionale
    if (distance < 3000) return 3; // Intercontinentale breve
    if (distance < 6000) return 4; // Intercontinentale medio
    return 5; // Intercontinentale lungo
};

WorldMap.prototype.updateMarketAnalysisDisplay = function() {
    var marketSection = document.getElementById('market-analysis-section');
    var marketBtn = document.getElementById('market-analysis-btn');
    
    if (this.routeConfigState.marketAnalysis) {
        marketSection.style.display = 'block';
        marketBtn.style.display = 'none';
    } else {
        marketSection.style.display = 'none';
        marketBtn.style.display = 'block';
    }
};

WorldMap.prototype.improveRouteAnalysis = function() {
    console.log('🔍 Miglioramento analisi domanda...');
    
    var cost = 5000;
    
    // Controlla se il giocatore ha abbastanza soldi
    if (this.game.state && this.game.state.company && this.game.state.company.money < cost) {
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Fondi insufficienti per migliorare l\'analisi', 'error');
        }
        return;
    }
    
    // Deduce il costo
    this.game.state.company.money -= cost;
    
    // Migliora accuratezza
    this.routeConfigState.analysisLevel = 'improved';
    
    // Ricalcola stime con migliore accuratezza
    var origin = this.routeCreationState.originAirport;
    var destination = this.routeCreationState.destinationAirport;
    var estimates = RouteCalculator.calculateRouteEstimates(origin, destination, 'improved');
    
    this.routeConfigState.estimatedPassengers = estimates.displayPassengers;
    this.routeConfigState.estimatedCargo = estimates.displayCargo;
    
    // Aggiorna display
    this.updateConfigEstimates();
    
    // Disabilita bottone
    var improveBtn = document.getElementById('improve-analysis-btn');
    if (improveBtn) {
        improveBtn.disabled = true;
        improveBtn.textContent = '✅ Analisi Migliorata';
    }
    
    if (this.game.uiManager) {
        this.game.uiManager.showNotification('Analisi domanda migliorata! Stime più accurate.', 'success');
    }
    
    console.log('✅ Analisi domanda migliorata');
};

WorldMap.prototype.purchaseMarketAnalysis = function() {
    console.log('📊 Acquisto analisi di mercato...');
    
    var cost = 15000;
    
    // Controlla se il giocatore ha abbastanza soldi
    if (this.game.state && this.game.state.company && this.game.state.company.money < cost) {
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Fondi insufficienti per l\'analisi di mercato (€' + cost.toLocaleString() + ')', 'error');
        }
        return;
    }
    
    // Deduce il costo
    this.game.state.company.money -= cost;
    
    // Sblocca analisi di mercato
    this.routeConfigState.marketAnalysis = true;
    
    // Aggiorna display per mostrare costi e ricavi
    this.updateMarketAnalysisDisplay();
    
    if (this.game.uiManager) {
        this.game.uiManager.showNotification('Analisi di mercato completata! Costi e profitti ora visibili.', 'success');
    }
    
    console.log('✅ Analisi di mercato acquistata');
};

WorldMap.prototype.createRouteFromConfig = function() {
    console.log('🛠️ Creazione rotta dalla configurazione...');
    
    var origin = this.routeCreationState.originAirport;
    var destination = this.routeCreationState.destinationAirport;
    var routeType = this.routeConfigState.routeType;
    var creationCost = this.routeConfigState.creationCost;
    
    if (!origin || !destination) {
        console.error('❌ Aeroporti origine/destinazione mancanti');
        return;
    }
    
    // Controlla fondi
    if (this.game.state && this.game.state.company && this.game.state.company.money < creationCost) {
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Fondi insufficienti per creare la rotta (€' + creationCost.toLocaleString() + ')', 'error');
        }
        return;
    }
    
    console.log('📋 Creazione rotta configurata:', origin.code, '→', destination.code, 'Tipo:', routeType);
    
    // Delega al route manager con informazioni aggiuntive
    if (this.game.routeManager) {
        var result = this.game.routeManager.createRoute(origin.code, destination.code, null, {
            routeType: routeType,
            creationCost: creationCost,
            estimatedPassengers: this.routeConfigState.estimatedPassengers,
            estimatedCargo: this.routeConfigState.estimatedCargo
        });
        
        if (result.success) {
            if (this.game.uiManager) {
                this.game.uiManager.showNotification(
                    'Rotta creata: ' + origin.code + ' → ' + destination.code + 
                    ' (€' + creationCost.toLocaleString() + ')', 'success'
                );
            }
            
            // Aggiungi rotta alla mappa
            this.addRouteToMap(result.route);
            
            // Chiudi pannelli
            this.closeRouteCreationPanel();
            this.closeRouteConfigPanel();
            
            console.log('✅ Rotta creata con successo');
        } else {
            if (this.game.uiManager) {
                this.game.uiManager.showNotification(result.message, 'error');
            }
            console.error('❌ Errore creazione rotta:', result.message);
        }
    } else {
        console.error('❌ RouteManager non disponibile');
    }
};

// Nuovo metodo per aggiornare tutti i popup degli aeroporti
WorldMap.prototype.updateAllAirportPopups = function() {
    console.log('🔄 Aggiornamento popup aeroporti...');
    
    var self = this;
    
    // Aggiorna tutti i marker degli aeroporti
    for (var code in this.airportMarkers) {
        var marker = this.airportMarkers[code];
        if (marker && marker.airportData) {
            var airport = marker.airportData;
            var newContent = self.createAirportPopup(airport, false); // Sempre false per ora
            
            // Aggiorna il contenuto del popup bindato
            marker.setPopupContent(newContent);
        }
    }
};

WorldMap.prototype.updateLockButton = function() {
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
};

WorldMap.prototype.updateOriginSlotAppearance = function() {
    var originSlot = document.getElementById('origin-airport');
    if (!originSlot) return;
    
    if (this.routeCreationState.originLocked) {
        originSlot.classList.add('locked');
    } else {
        originSlot.classList.remove('locked');
    }
};

WorldMap.prototype.toggleOriginLock = function() {
    console.log('🔒 Toggle lock origine...');
    
    // Se non c'è un aeroporto di origine, non si può bloccare
    if (!this.routeCreationState.originAirport) {
        if (this.game.uiManager) {
            this.game.uiManager.showNotification('Seleziona prima un aeroporto di origine', 'warning');
        }
        return;
    }
    
    // Toggle stato lock
    this.routeCreationState.originLocked = !this.routeCreationState.originLocked;
    
    // Aggiorna UI
    this.updateLockButton();
    this.updateOriginSlotAppearance();
    
    var status = this.routeCreationState.originLocked ? 'bloccata' : 'sbloccata';
    console.log('🔒 Origine ' + status);
    
    if (this.game.uiManager) {
        this.game.uiManager.showNotification('Origine ' + status, 'info');
    }
};

WorldMap.prototype.clearDestination = function() {
    console.log('🔄 Pulizia destinazione...');
    
    this.routeCreationState.destinationAirport = null;
    this.clearSlot('destination');
    this.updateCreateButton();
    this.updateRouteInfo();
    
    // Seleziona lo slot destinazione per una nuova selezione
    this.selectSlot('destination');
    
    console.log('✅ Destinazione pulita');
};

// Calcola stime di traffico passeggeri e cargo con errore casuale
// Fine del file - Tutte le funzioni di calcolo sono state spostate nei moduli utils/
window.WorldMap = WorldMap;
console.log('✅ WorldMap con Leaflet caricato');