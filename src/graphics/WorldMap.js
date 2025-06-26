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
        title: airport.name + ' (' + airport.code + ')',
        zIndexOffset: zIndex
    });
    
    // Popup con informazioni aeroporto
    var popupContent = this.createAirportPopup(airport, isPlayerHub);
    marker.bindPopup(popupContent);
    
    // Event handler per click
    marker.on('click', function(e) {
        // Aggiorna il popup con il testo corretto del bottone
        var popupContent = self.createAirportPopup(airport, isPlayerHub);
        marker.setPopupContent(popupContent);
        
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
    var self = this; // Aggiungiamo self per scope corretto
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
    
    // DEBUG: Se non vediamo abbastanza aeroporti, mostra informazioni aggiuntive
    if (visibleCount < 5 && zoom <= 4) {
        console.log('⚠️ DEBUG: Pochi aeroporti visibili, dettagli:');
        console.log('   - Bounds mappa:', bounds.toBBoxString());
        console.log('   - Aeroporti nell\'area:', visibleAirports.length);
        console.log('   - Max aeroporti per zoom', zoom + ':', this.getMaxAirportsForZoom(zoom));
        console.log('   - Min distanza per zoom', zoom + ':', this.getMinDistanceForZoom(zoom), 'km');
        
        if (visibleAirports.length > 0) {
            console.log('   - Primi 3 aeroporti nell\'area:', visibleAirports.slice(0, 3).map(function(a) {
                var rating = self.calculateAirportRating(a);
                return a.code + ' (' + a.size + ') B:' + (a.businessLevel || 'N/A') + 
                       ' T:' + (a.touristLevel || 'N/A') + ' rating:' + Math.round(rating);
            }));
        }
    }
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
    // Calcola rating basato su business e tourist level
    var businessLevel = airport.businessLevel || 50;  // Default 50 se mancante
    var touristLevel = airport.touristLevel || 50;    // Default 50 se mancante
    
    // Il traffico business vale di più del turistico per l'importanza dell'aeroporto
    // Business: peso 1.5, Tourist: peso 1.0
    var combinedTraffic = (businessLevel * 1.5) + (touristLevel * 1.0);
    
    // Converti in rating base (moltiplica per 10000 per ottenere valori ragionevoli)
    var baseRating = combinedTraffic * 10000;
    
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
        case 'regional':
        case 'small':
            typeMultiplier = 1.0;
            break;
        default:
            typeMultiplier = 1.0;
    }
    
    var finalRating = baseRating * typeMultiplier;
    
    // Debug occasionale per verificare i calcoli
    if (Math.random() < 0.1) { // 10% delle volte
        console.log('🧮 Rating calcolato per', airport.code + ':', 
                   'business=' + businessLevel, 
                   'tourist=' + touristLevel, 
                   'combined=' + Math.round(combinedTraffic),
                   'final=' + Math.round(finalRating));
    }
    
    return finalRating;
};

// Determina numero massimo di aeroporti da mostrare per livello di zoom (WIP: aumentiamo i numeri)
WorldMap.prototype.getMaxAirportsForZoom = function(zoom) {
    if (zoom <= 2) return 50;    // Vista mondo: più aeroporti importanti 
    if (zoom <= 3) return 100;   // Continente: molti più aeroporti
    if (zoom <= 4) return 200;   // Regione: ancora di più
    if (zoom <= 5) return 400;   // Area: molti aeroporti
    if (zoom <= 6) return 600;   // Zona: la maggior parte
    if (zoom <= 7) return 800;   // Dettaglio: quasi tutti
    return 1500;                 // Massimo zoom: tutti
};

// Determina distanza minima tra aeroporti per livello di zoom (WIP: riduciamo le distanze)
WorldMap.prototype.getMinDistanceForZoom = function(zoom) {
    if (zoom <= 2) return 400;   // Vista mondo: meno distanziati
    if (zoom <= 3) return 200;   // Continente: meno distanziati
    if (zoom <= 4) return 100;   // Regione: ancora meno
    if (zoom <= 5) return 50;    // Area: vicini
    if (zoom <= 6) return 25;    // Zona: molto vicini
    if (zoom <= 7) return 10;    // Dettaglio: qualsiasi distanza
    return 0;                    // Massimo zoom: nessuna restrizione
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
        
        // Cambia testo bottone se pannello rotte è aperto
        var routeButtonText = this.routeCreationState && this.routeCreationState.isOpen ? 
                             'Aggiungi a Rotta' : 'Crea Rotta';
        
        actions = '<div class="airport-actions">' +
                 '<button onclick="game.worldMap.manageHub(\'' + airport.code + '\')">Gestisci Hub</button>' +
                 '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">' + routeButtonText + '</button>' +
                 '</div>';
    } else {
        var canBuildHub = airport.size === 'hub' || airport.size === 'large';
        
        // Cambia testo bottone se pannello rotte è aperto
        var routeButtonText = this.routeCreationState && this.routeCreationState.isOpen ? 
                             'Aggiungi a Rotta' : 'Crea Rotta';
        
        if (canBuildHub) {
            var buildCost = this.game.hubManager ? 
                           this.game.hubManager.calculateHubBuildCost(airport) : 
                           'N/A';
            
            actions = '<div class="airport-actions">' +
                     '<button onclick="game.worldMap.buildHubAt(\'' + airport.code + '\')">Costruisci Hub (€' + buildCost.toLocaleString() + ')</button>' +
                     '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">' + routeButtonText + '</button>' +
                     '</div>';
        } else {
            actions = '<div class="airport-actions">' +
                     '<button onclick="game.worldMap.createRouteFromAirport(\'' + airport.code + '\')">' + routeButtonText + '</button>' +
                     '<p class="small-text">💡 Solo aeroporti grandi possono diventare hub</p>' +
                     '</div>';
        }
    }
    
    var hubStatus = isPlayerHub ? '🏢 Il tuo Hub' : 
                   (airport.size === 'hub' ? '⬡ Hub Mondiale' : 
                   (airport.size === 'large' ? '⬢ Aeroporto Grande' : 
                   (airport.size === 'medium' ? '◆ Aeroporto Medio' : '● Aeroporto Regionale')));
    
    // Mostra business e tourist level invece di traffico
    var businessLevel = airport.businessLevel || 'N/A';
    var touristLevel = airport.touristLevel || 'N/A';
    var trafficInfo = 'Business: ' + businessLevel + ' | Turismo: ' + touristLevel;
    
    return '<div class="airport-popup">' +
           '<h3>' + airport.name + '</h3>' +
           '<p><strong>Codice:</strong> ' + airport.code + '</p>' +
           '<p><strong>Città:</strong> ' + airport.city + '</p>' +
           '<p><strong>Paese:</strong> ' + airport.country + '</p>' +
           '<p><strong>Tipo:</strong> ' + hubStatus + '</p>' +
           '<p><strong>Traffico:</strong> ' + trafficInfo + '</p>' +
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

// METODI PER CREAZIONE ROTTE

WorldMap.prototype.openRouteCreationPanel = function() {
    console.log('🛣️ Apertura pannello creazione rotte...');
    
    var panel = document.getElementById('route-creation-panel');
    var triggerBtn = document.getElementById('open-route-panel');
    
    if (panel && triggerBtn) {
        // Mostra pannello e nascondi bottone
        panel.classList.add('active');
        triggerBtn.classList.add('hidden');
        
        // Aggiorna stato
        this.routeCreationState.isOpen = true;
        
        // Auto-popolamento slot origine
        this.autoPopulateOriginSlot();
        
        console.log('✅ Pannello rotte aperto');
    }
};

WorldMap.prototype.closeRouteCreationPanel = function() {
    console.log('🛣️ Chiusura pannello creazione rotte...');
    
    var panel = document.getElementById('route-creation-panel');
    var triggerBtn = document.getElementById('open-route-panel');
    
    if (panel && triggerBtn) {
        // Nascondi pannello e mostra bottone
        panel.classList.remove('active');
        triggerBtn.classList.remove('hidden');
        
        // Reset stato
        this.resetRouteCreationState();
        
        console.log('✅ Pannello rotte chiuso');
    }
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
    
    // Calcola distanza
    var distance = this.calculateDistance(
        origin.latitude, origin.longitude,
        destination.latitude, destination.longitude
    );
    
    // Calcola tempo di volo stimato (assumendo velocità media di 800 km/h)
    var flightHours = distance / 800;
    var hours = Math.floor(flightHours);
    var minutes = Math.round((flightHours - hours) * 60);
    var flightTime = hours + 'h ' + minutes + 'm';
    
    // Calcola stime traffico con errore
    var estimates = this.calculateTrafficEstimatesWithError(origin, destination, distance, 'basic');
    
    // Aggiorna display
    document.getElementById('route-distance').textContent = Math.round(distance);
    document.getElementById('flight-time').textContent = flightTime;
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

// NUOVI METODI PER SISTEMA DI BLOCCO

WorldMap.prototype.toggleOriginLock = function() {
    console.log('🔐 Toggle blocco origine...');
    
    // Se non c'è un aeroporto di origine, non può essere bloccato
    if (!this.routeCreationState.originAirport) {
        console.log('⚠️ Nessun aeroporto di origine da bloccare');
        return;
    }
    
    // Cambia stato blocco
    this.routeCreationState.originLocked = !this.routeCreationState.originLocked;
    
    // Aggiorna UI
    this.updateLockButton();
    this.updateOriginSlotAppearance();
    
    var status = this.routeCreationState.originLocked ? 'bloccata' : 'sbloccata';
    console.log('🔐 Origine', status, ':', this.routeCreationState.originAirport.code);
    
    // Se bloccato, attiva automaticamente lo slot destinazione
    if (this.routeCreationState.originLocked) {
        this.selectSlot('destination');
    }
};

WorldMap.prototype.clearDestination = function() {
    console.log('🔄 Reset destinazione...');
    
    // Pulisci destinazione
    this.routeCreationState.destinationAirport = null;
    this.clearSlot('destination');
    
    // Aggiorna UI
    this.updateCreateButton();
    this.hideRouteInfo();
    
    // Attiva automaticamente lo slot destinazione per nuova selezione
    this.selectSlot('destination');
    
    console.log('✅ Destinazione resettata, pronto per nuova selezione');
};

WorldMap.prototype.updateLockButton = function() {
    var lockBtn = document.getElementById('lock-origin-btn');
    if (!lockBtn) return;
    
    var isLocked = this.routeCreationState.originLocked;
    var hasOrigin = this.routeCreationState.originAirport !== null;
    
    // Aggiorna icona e stato
    lockBtn.textContent = isLocked ? '🔒' : '🔓';
    lockBtn.title = isLocked ? 'Sblocca origine' : 'Blocca origine per confrontare destinazioni';
    
    // Aggiorna classi CSS
    if (isLocked) {
        lockBtn.classList.add('locked');
    } else {
        lockBtn.classList.remove('locked');
    }
    
    // Disabilita se non c'è origine
    lockBtn.disabled = !hasOrigin;
    lockBtn.style.opacity = hasOrigin ? '1' : '0.5';
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

// METODI PER CALCOLO STIME TRAFFICO CON ERRORE REALISTICO

WorldMap.prototype.calculateTrafficEstimatesWithError = function(origin, destination, distance, analysisLevel) {
    // Prima calcola i valori "reali" (quello che succederà davvero)
    var realData = this.calculateRealTrafficData(origin, destination, distance);
    
    // Poi aggiungi errore basato sul livello di analisi
    var errorRange = analysisLevel === 'improved' ? 0.1 : 0.3; // ±10% vs ±30%
    var cargoErrorRange = analysisLevel === 'improved' ? 0.08 : 0.25; // ±8% vs ±25%
    
    // Genera errore casuale (distribuzione normale approssimata)
    var passengerError = (Math.random() - 0.5) * 2 * errorRange; // -30% a +30%
    var cargoError = (Math.random() - 0.5) * 2 * cargoErrorRange;
    
    // Applica errore ai valori reali
    var displayPassengers = Math.max(0, Math.round(realData.dailyPassengers * (1 + passengerError)));
    var displayCargo = Math.max(0, Math.round(realData.dailyCargo * (1 + cargoError)));
    
    return {
        displayPassengers: displayPassengers,
        displayCargo: displayCargo,
        realPassengers: realData.dailyPassengers,
        realCargo: realData.dailyCargo,
        realRevenue: realData.monthlyRevenue,
        businessPassengers: realData.businessPassengers,
        touristPassengers: realData.touristPassengers
    };
};

WorldMap.prototype.calculateRealTrafficData = function(origin, destination, distance) {
    // Calcolo valori reali (senza errore) che verranno poi usati nella simulazione
    
    // Fattori base per il calcolo
    var originBusiness = origin.businessLevel || 50;
    var originTourist = origin.touristLevel || 50;
    var destBusiness = destination.businessLevel || 50;
    var destTourist = destination.touristLevel || 50;
    
    // Media dei livelli di traffico
    var avgBusiness = (originBusiness + destBusiness) / 2;
    var avgTourist = (originTourist + destTourist) / 2;
    
    // Fattore distanza (più lungo = meno passeggeri locali, più business)
    var distanceFactor = 1;
    if (distance > 3000) distanceFactor = 1.2; // Voli intercontinentali
    else if (distance > 1500) distanceFactor = 1.1; // Voli continentali
    else if (distance < 500) distanceFactor = 0.8; // Voli regionali
    
    // Calcolo passeggeri giornalieri (base: 1 passeggero ogni 2 punti di traffico)
    var businessPassengers = Math.round((avgBusiness * distanceFactor) / 2);
    var touristPassengers = Math.round((avgTourist * distanceFactor * 0.8) / 2);
    var totalDailyPassengers = businessPassengers + touristPassengers;
    
    // Calcolo cargo giornaliero (tonnellate, base: 1t ogni 10 punti business)
    var dailyCargo = Math.round((avgBusiness * distanceFactor) / 10);
    
    // Calcolo ricavi mensili reali
    var avgTicketPrice = this.calculateAverageTicketPrice(distance);
    var cargoRatePerTon = 2000; // €2000 per tonnellata
    
    var monthlyPassengerRevenue = totalDailyPassengers * avgTicketPrice * 30;
    var monthlyCargoRevenue = dailyCargo * cargoRatePerTon * 30;
    var totalMonthlyRevenue = monthlyPassengerRevenue + monthlyCargoRevenue;
    
    return {
        dailyPassengers: totalDailyPassengers,
        dailyCargo: dailyCargo,
        monthlyRevenue: Math.round(totalMonthlyRevenue),
        businessPassengers: businessPassengers,
        touristPassengers: touristPassengers
    };
};

// METODO PER CALCOLARE NAZIONI SORVOLATE
WorldMap.prototype.calculateCountriesOverflown = function(origin, destination) {
    // Stima semplificata basata su distanza e posizione geografica
    var distance = this.calculateDistance(
        origin.latitude, origin.longitude,
        destination.latitude, destination.longitude
    );
    
    // Logica semplificata per stimare nazioni sorvolate
    var countries = 2; // Almeno paese origine e destinazione
    
    // Aggiungi nazioni basandosi su distanza
    if (distance > 1000) countries += 1; // Volo continentale
    if (distance > 2000) countries += 1; // Volo intercontinentale
    if (distance > 4000) countries += 2; // Volo transpacifico/transatlantico
    if (distance > 8000) countries += 3; // Volo molto lungo (es. Sydney-Londra)
    
    // Aggiusta per differenza di continenti (semplificato)
    var originContinent = this.getContinent(origin.latitude, origin.longitude);
    var destContinent = this.getContinent(destination.latitude, destination.longitude);
    
    if (originContinent !== destContinent) {
        countries += 1; // Attraversamento continentale
    }
    
    return Math.min(countries, 12); // Max 12 nazioni realisticamente
};

WorldMap.prototype.getContinent = function(lat, lng) {
    // Determinazione continente semplificata basata su coordinate
    if (lat > 60) return 'Arctic';
    if (lat < -60) return 'Antarctica';
    if (lng >= -30 && lng <= 70 && lat >= -35 && lat <= 70) return 'Europe/Africa';
    if (lng >= 70 && lng <= 180 && lat >= -50 && lat <= 80) return 'Asia';
    if (lng >= -180 && lng <= -30 && lat >= -60 && lat <= 80) return 'Americas';
    if (lng >= 110 && lng <= 180 && lat >= -50 && lat <= -10) return 'Oceania';
    return 'Other';
};

WorldMap.prototype.calculateAverageTicketPrice = function(distance) {
    // Prezzo base per km + costi fissi
    var basePrice = 50; // €50 fisso
    var pricePerKm = 0.15; // €0.15 per km
    
    // Fattore economia di scala per voli lunghi
    var scaleFactor = 1;
    if (distance > 2000) scaleFactor = 0.9; // Sconto per voli lunghi
    
    return Math.round((basePrice + (distance * pricePerKm)) * scaleFactor);
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
    
    // Reset stato configurazione
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
    
    console.log('✅ Pannello configurazione chiuso');
};

WorldMap.prototype.updateRouteConfigDisplay = function() {
    var origin = this.routeCreationState.originAirport;
    var destination = this.routeCreationState.destinationAirport;
    
    if (!origin || !destination) return;
    
    // Calcola distanza
    var distance = this.calculateDistance(
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
    
    var flightHours = distance / 800;
    var hours = Math.floor(flightHours);
    var minutes = Math.round((flightHours - hours) * 60);
    document.getElementById('config-flight-time').textContent = hours + 'h ' + minutes + 'm';
    
    // Calcola stime traffico con errore
    var estimates = this.calculateTrafficEstimatesWithError(origin, destination, distance, this.routeConfigState.analysisLevel);
    
    // Salva dati nello stato
    this.routeConfigState.estimatedPassengers = estimates.displayPassengers;
    this.routeConfigState.estimatedCargo = estimates.displayCargo;
    this.routeConfigState.realPassengers = estimates.realPassengers;
    this.routeConfigState.realCargo = estimates.realCargo;
    this.routeConfigState.realRevenue = estimates.realRevenue;
    this.routeConfigState.countriesOverflown = countriesCount;
    
    // Calcola costi
    this.routeConfigState.creationCost = this.calculateRouteCreationCost(distance, countriesCount);
    this.routeConfigState.costPerFlight = this.calculateFlightCost(distance);
    
    // Aggiorna display
    this.updateConfigEstimates();
    this.updateConfigCosts();
    
    // Reset analisi di mercato
    this.routeConfigState.marketAnalysis = false;
    this.updateMarketAnalysisDisplay();
    
    // Reset tipo rotta a passeggeri
    this.selectRouteType('passenger');
};

WorldMap.prototype.updateConfigEstimates = function() {
    var analysisAccuracy = this.routeConfigState.analysisLevel === 'improved' ? '±10%' : '±30%';
    var cargoAccuracy = this.routeConfigState.analysisLevel === 'improved' ? '±8%' : '±25%';
    
    document.getElementById('config-passengers').textContent = this.routeConfigState.estimatedPassengers;
    document.getElementById('config-cargo').textContent = this.routeConfigState.estimatedCargo;
    
    // Aggiorna accuratezza
    var accuracySpans = document.querySelectorAll('.estimate-accuracy');
    if (accuracySpans[0]) accuracySpans[0].textContent = '(' + analysisAccuracy + ')';
    if (accuracySpans[1]) accuracySpans[1].textContent = '(' + cargoAccuracy + ')';
};

WorldMap.prototype.updateConfigCosts = function() {
    document.getElementById('route-creation-cost').textContent = this.routeConfigState.creationCost.toLocaleString();
    
    // Solo se l'analisi di mercato è stata acquistata
    if (this.routeConfigState.marketAnalysis) {
        document.getElementById('cost-per-flight').textContent = this.routeConfigState.costPerFlight.toLocaleString();
        
        // Usa ricavi reali per calcolo profitto
        var monthlyRevenue = this.calculateRevenueForRouteType(this.routeConfigState.routeType);
        document.getElementById('config-monthly-revenue').textContent = monthlyRevenue.toLocaleString();
        
        // Calcola profitto stimato (ricavi - costi mensili)
        var flightsPerMonth = 60; // 2 voli al giorno * 30 giorni
        var monthlyCosts = this.routeConfigState.costPerFlight * flightsPerMonth;
        var estimatedProfit = monthlyRevenue - monthlyCosts;
        
        document.getElementById('estimated-profit').textContent = estimatedProfit.toLocaleString();
        
        // Colore profitto
        var profitElement = document.querySelector('.profit-value');
        if (profitElement) {
            profitElement.style.color = estimatedProfit >= 0 ? '#27ae60' : '#e74c3c';
        }
    }
};

WorldMap.prototype.calculateRevenueForRouteType = function(routeType) {
    var baseRevenue = this.routeConfigState.realRevenue;
    
    if (routeType === 'cargo') {
        return Math.round(baseRevenue * 0.9); // Focus cargo, meno passeggeri
    } else if (routeType === 'mixed') {
        return Math.round(baseRevenue * 1.1); // Bilanciato, più efficiente
    }
    // 'passenger' usa revenue base
    return baseRevenue;
};

WorldMap.prototype.updateMarketAnalysisDisplay = function() {
    var lockedDiv = document.getElementById('market-locked');
    var unlockedDiv = document.getElementById('market-unlocked');
    
    if (this.routeConfigState.marketAnalysis) {
        lockedDiv.style.display = 'none';
        unlockedDiv.style.display = 'block';
        this.updateConfigCosts(); // Aggiorna i costi ora visibili
    } else {
        lockedDiv.style.display = 'block';
        unlockedDiv.style.display = 'none';
    }
};

WorldMap.prototype.calculateRouteCreationCost = function(distance, countriesOverflown) {
    // Costo base + costo per distanza + costo per nazioni sorvolate
    var baseCost = 25000; // €25,000 base (ridotto)
    var costPerKm = 15; // €15 per km (ridotto)
    var costPerCountry = 8000; // €8,000 per nazione sorvolata (diritti sorvolo, paperwork, etc.)
    
    var distanceCost = distance * costPerKm;
    var countryCost = (countriesOverflown - 1) * costPerCountry; // -1 perché origine non conta
    
    return baseCost + distanceCost + countryCost;
};

WorldMap.prototype.calculateFlightCost = function(distance) {
    // Costo carburante + equipaggio + manutenzione
    var fuelCostPerKm = 1.2; // €1.20 per km
    var crewCost = 800; // €800 fisso per equipaggio
    var maintenanceCostPerKm = 0.8; // €0.80 per km
    
    return Math.round((distance * fuelCostPerKm) + crewCost + (distance * maintenanceCostPerKm));
};

WorldMap.prototype.selectRouteType = function(type) {
    console.log('📋 Selezione tipo rotta:', type);
    
    this.routeConfigState.routeType = type;
    
    // Aggiorna bottoni attivi
    var buttons = document.querySelectorAll('.route-type-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    
    var activeButton = document.getElementById('route-type-' + type);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Aggiorna stime basate sul tipo
    this.updateEstimatesForRouteType(type);
};

WorldMap.prototype.updateEstimatesForRouteType = function(type) {
    // Modifica le stime basandosi sul tipo di rotta
    var basePassengers = this.routeConfigState.estimatedPassengers;
    var baseCargo = this.routeConfigState.estimatedCargo;
    
    var passengers = basePassengers;
    var cargo = baseCargo;
    
    if (type === 'cargo') {
        // Focus su cargo, meno passeggeri
        passengers = Math.round(basePassengers * 0.3);
        cargo = Math.round(baseCargo * 1.5);
    } else if (type === 'mixed') {
        // Bilanciato
        passengers = Math.round(basePassengers * 0.8);
        cargo = Math.round(baseCargo * 1.2);
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
    var distance = this.calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
    var estimates = this.calculateTrafficEstimatesWithError(origin, destination, distance, 'improved');
    
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
            console.log('✅ Rotta creata con successo');
            
            // Deduce costo creazione
            this.game.state.company.money -= creationCost;
            
            // Aggiungi rotta alla mappa
            this.addRouteToMap(result.route);
            
            // Chiudi pannelli
            this.closeRouteConfigPanel();
            
            // Se l'origine è bloccata, mantieni il pannello aperto e pulisci solo destinazione
            if (this.routeCreationState.originLocked) {
                this.clearDestination();
                this.selectSlot('destination');
                console.log('🔒 Origine bloccata, pronto per nuova destinazione');
            } else {
                // Chiudi pannello completamente
                this.closeRouteCreationPanel();
            }
            
            // Notifica successo
            if (this.game.uiManager) {
                this.game.uiManager.showNotification(
                    'Rotta ' + routeType + ' creata: ' + origin.code + ' → ' + destination.code + 
                    ' (€' + creationCost.toLocaleString() + ')', 'success'
                );
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

window.WorldMap = WorldMap;
console.log('✅ WorldMap con Leaflet caricato');
