// WorldMap con Leaflet e OpenStreetMap - Versione client ESM
console.debug('📂 Caricamento Client WorldMap.js...');

function WorldMap(game) {
    this.game = game || {};
    this.map = null;
    this.airportMarkers = {};
    this.routeLines = {};
    this.selectedAirport = null;
}

Object.defineProperty(WorldMap.prototype, 'routeCreationState', {
    get: function() {
        if (typeof RouteUIManager !== 'undefined') return RouteUIManager.routeCreationState;
        return this._fallbackRouteState || {
            isOpen: false,
            activeSlot: null,
            originAirport: null,
            destinationAirport: null,
            originLocked: true,
            selectedAircraftId: null,
            selectedRouteType: 'passenger'
        };
    },
    set: function(value) {
        if (typeof RouteUIManager !== 'undefined') RouteUIManager.routeCreationState = value;
        else this._fallbackRouteState = value;
    }
});

WorldMap.prototype.init = function() {
    console.debug('🗺️ Inizializzazione Client WorldMap con Leaflet...');
    try {
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet non caricato');
            return;
        }
        var mapElement = document.getElementById('world-map');
        if (!mapElement) {
            console.error('❌ Elemento world-map non trovato');
            return;
        }
        this.map = L.map('world-map', { center: [30,0], zoom: 2, minZoom: 2, maxZoom: 10, worldCopyJump: true, zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(this.map);
    console.debug('✅ Mappa Leaflet inizializzata');
        this.initializeRouteUI();
        this.loadAirports();
        this.loadRoutes();
        this.setupMapEvents();
    } catch (error) {
        console.error('❌ Errore inizializzazione WorldMap (client):', error);
    }
};

WorldMap.prototype.initializeRouteUI = function() {
    var self = this;
    if (typeof RouteUIManager !== 'undefined') {
        RouteUIManager.initializeRoutePanels()
            .then(function(success) { if (success) { self.setupRouteCreationEvents(); } })
            .catch(function(err){ console.error('Errore init panels', err); });
    }
};

WorldMap.prototype.loadAirports = function() {
    var self = this;
    // Resolve companyId in this order: this.game.companyId, sessionStorage.selectedCompanyId, first company from server
    var resolvedCompanyIdPromise;
    var sessionCompanyId = sessionStorage.getItem('selectedCompanyId');
    if (this.game && this.game.companyId) {
        resolvedCompanyIdPromise = Promise.resolve(this.game.companyId);
    } else if (sessionCompanyId) {
        resolvedCompanyIdPromise = Promise.resolve(sessionCompanyId);
    } else {
        // No session/company in memory: fetch companies and pick first if available
        resolvedCompanyIdPromise = fetch('/api/game/companies').then(r=>r.json()).then(resp=>{
            if (resp && resp.success && Array.isArray(resp.data) && resp.data.length>0) {
                var id = resp.data[0].id;
                try { sessionStorage.setItem('selectedCompanyId', id); } catch(e){}
                return id;
            }
            return null;
        }).catch(err=>{ console.warn('Could not resolve company id from server', err); return null; });
    }

    resolvedCompanyIdPromise.then(function(companyId){
        if (!companyId) {
            // No company context available: just fetch all airports (no before filter)
            return fetch('/api/airports?limit=2000').then(r=>r.json()).then(a=>({airports:a, hubCodes:[]}));
        }
        return fetch('/api/game/companies/' + companyId + '/hubs').then(res => res.json()).then(hubResp => {
            var hubCodes = [];
            if (hubResp && hubResp.success && Array.isArray(hubResp.data)) hubCodes = hubResp.data.map(h=>h.iata_code||h.icao_code||h.code);
            return fetch('/api/game/companies/' + companyId).then(r=>r.json()).then(companyResp => {
                if (!companyResp || !companyResp.success || !companyResp.data || !companyResp.data.company) return fetch('/api/airports?limit=2000').then(r=>r.json()).then(a=>({airports:a,hubCodes}));
                var gameDate = companyResp.data.company.game_date;
                if (!gameDate) return fetch('/api/airports?limit=2000').then(r=>r.json()).then(a=>({airports:a,hubCodes}));
                return fetch('/api/airports?limit=2000&before=' + encodeURIComponent(gameDate)).then(r=>r.json()).then(a=>({airports:a,hubCodes}));
            });
        });
    }).then(({airports, hubCodes})=>{
        if (!Array.isArray(airports) || airports.length===0) return console.warn('⚠️ Nessun aeroporto ricevuto');
        self._renderAirportsOnMap(airports, hubCodes);
    }).catch(err=>{ console.error('❌ Errore loading airports client:', err); });
};

WorldMap.prototype._renderAirportsOnMap = function(airports, hubCodes) {
    window.AirportData = window.AirportData || {};
    window.AirportData.airports = airports;
    window.AirportData._airportByCode = {};
    hubCodes = hubCodes || [];
    for (var i=0;i<airports.length;i++){
        var airport = airports[i];
        var code = airport.iata_code || airport.icao_code || airport.code;
        var lat = parseFloat(airport.latitude); var lon = parseFloat(airport.longitude);
        if (code) window.AirportData._airportByCode[code]=airport;
        if (isNaN(lat) || isNaN(lon) || !code) continue;
        var isPlayerHub = hubCodes.includes(code);
        var marker = this.createAirportMarker({ ...airport, code, latitude:lat, longitude:lon, size: airport.size || airport.airport_size }, isPlayerHub);
        marker.isPlayerHub = isPlayerHub;
        this.airportMarkers[code] = marker;
        // Add marker to the map by default so airports are visible even without MapVisibilityManager
        if (this.map && !this.map.hasLayer(marker)) {
            marker.addTo(this.map);
        }
    }
    window.AirportData.getAirportByCode = function(code){ return window.AirportData._airportByCode[code]||null; };
    if (typeof MapVisibilityManager !== 'undefined') MapVisibilityManager.setupZoomBasedVisibility(this.map, (zoom)=>{ MapVisibilityManager.updateAirportVisibility(this.game, this.map, this.airportMarkers, zoom); for(var c in this.airportMarkers){ var m=this.airportMarkers[c]; if(m.isPlayerHub && !this.map.hasLayer(m)) m.addTo(this.map);} });
};

WorldMap.prototype.getAirportTypeLabel = function(airport) { var size = (airport.size||airport.airport_size||'').toLowerCase(); switch(size){ case 'large': return '● Aeroporto Internazionale'; case 'medium': return '● Aeroporto Regionale'; case 'small': return '● Aeroporto Locale'; default: return '● Aeroporto'; } };

WorldMap.prototype.createAirportPopup = function(airport,isPlayerHub){ if(typeof RouteUIManager !== 'undefined') return RouteUIManager.createAirportPopup(airport,isPlayerHub); return '<div class="airport-popup"><h3>'+(airport.name||'')+'</h3><p><strong>Codice:</strong> '+(airport.code||'')+'</p><p><strong>Città:</strong> '+(airport.city||'')+'</p><p><button onclick="game && game.worldMap && game.worldMap.createRouteFromAirport(\''+(airport.code||'')+'\')">Crea Rotta</button></p></div>'; };

WorldMap.prototype.getAirportIconProps = function(airport,isPlayerHub){ var size=(airport.size||airport.airport_size||'').toLowerCase(); var iconSize=[14,18], zIndex=700, iconHtml='<div class="airport-icon standard-airport"></div>'; if(isPlayerHub){ iconSize=[22,22]; zIndex=1100; iconHtml='<svg width="'+iconSize[0]+'" height="'+iconSize[1]+'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#27ae60" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#27ae60"/></svg>'; } return {iconHtml, iconSize, zIndex}; };

WorldMap.prototype.createAirportMarker = function(airport,isPlayerHub){ var self=this; var props=this.getAirportIconProps(airport,isPlayerHub); var airportIcon=L.divIcon({ className:'airport-marker', html:props.iconHtml, iconSize:props.iconSize, iconAnchor:[props.iconSize[0]/2, props.iconSize[1]/2] }); var marker=L.marker([airport.latitude, airport.longitude], { icon: airportIcon, title:(airport.name||'')+' ('+(airport.code||'')+')', zIndexOffset: props.zIndex }); marker.bindPopup(this.createAirportPopup(airport,isPlayerHub)); marker.on('click', function(e){ self.onAirportClick(airport,e); }); marker.airportData = airport; marker._nameLabel = null; marker.isPlayerHub = isPlayerHub; return marker; };

WorldMap.prototype.updateAirportNameLabels = function(){ var zoom=this.map.getZoom(); for(var code in this.airportMarkers){ var marker=this.airportMarkers[code]; var airport=marker.airportData; if(!airport) continue; var show=false; if((airport.size||airport.airport_size||'')==='large') show = zoom>=5; else if((airport.size||airport.airport_size||'')==='medium') show = zoom>=6; else show = zoom>=8; if(show){ if(!marker._nameLabel){ marker._nameLabel = L.marker(marker.getLatLng(), { icon: L.divIcon({ className:'airport-name-label', html:'<span>'+(airport.name||airport.code||'')+'</span>' }), interactive:false }).addTo(this.map); } } else { if(marker._nameLabel){ this.map.removeLayer(marker._nameLabel); marker._nameLabel = null; } } } };

WorldMap.prototype.setupZoomBasedVisibility = function(){ var self=this; if(this.map) { this.map.on('zoomend', function(){ self.updateAirportNameLabels(); }); this.map.on('moveend', function(){ self.updateAirportNameLabels(); }); this.updateAirportNameLabels(); } };

WorldMap.prototype.loadRoutes = function(){ if(!this.game.state || !this.game.state.routes) return; var routes=this.game.state.routes; for(var i=0;i<routes.length;i++){ var r=routes[i]; if(r.isActive) this.addRouteToMap(r); } };

WorldMap.prototype.addRouteToMap = function(route){ var origin = window.AirportData && window.AirportData.getAirportByCode ? window.AirportData.getAirportByCode(route.origin) : null; var destination = window.AirportData && window.AirportData.getAirportByCode ? window.AirportData.getAirportByCode(route.destination) : null; if(!origin||!destination) return; var line = L.polyline([[origin.latitude, origin.longitude],[destination.latitude, destination.longitude]], { color:'#FF4444', weight:3, opacity:0.8 }).addTo(this.map); var key = route.origin+'-'+route.destination; this.routeLines[key]=line; };

WorldMap.prototype.setupMapEvents = function(){ var self=this; if(!this.map) return; this.map.on('click', function(e){ self.onMapClick(e); }); this.setupRouteCreationEvents(); };

WorldMap.prototype.setupRouteCreationEvents = function(){ var self=this; var openRouteBtn = document.getElementById('open-route-panel'); if(openRouteBtn) openRouteBtn.addEventListener('click', function(){ self.openRouteCreationPanel(); }); var cancelBtn = document.getElementById('cancel-route-btn'); if(cancelBtn) cancelBtn.addEventListener('click', function(){ self.closeRouteCreationPanel(); }); };

WorldMap.prototype.onAirportClick = function(airport,e){ this.selectedAirport = airport; if(this.routeCreationState && this.routeCreationState.isOpen){ this.selectAirportForSlot(airport,'auto'); return; } if(this.game.uiManager) this.game.uiManager.showAirportInfo(airport); };

WorldMap.prototype.onMapClick = function(e){ if(this.game && this.game.uiManager) this.game.uiManager.hideAirportInfo(); };

WorldMap.prototype.createRouteFromAirport = function(airportCode){ var airport = window.AirportData && window.AirportData.getAirportByCode ? window.AirportData.getAirportByCode(airportCode) : null; if(!airport) return; if(!this.routeCreationState.isOpen){ this.openRouteCreationPanel(); this.routeCreationState.originAirport = airport; this.updateSlotDisplay('origin', airport); this.updateCreateButton(); this.selectSlot('destination'); return; } if(this.routeCreationState.originLocked && this.routeCreationState.originAirport){ this.routeCreationState.destinationAirport = airport; this.updateSlotDisplay('destination', airport); } else { this.routeCreationState.originAirport = airport; this.updateSlotDisplay('origin', airport); if(!this.routeCreationState.destinationAirport) this.selectSlot('destination'); } this.updateCreateButton(); this.updateRouteInfo(); };

WorldMap.prototype.updateAirportMarker = function(airportCode){ var marker=this.airportMarkers[airportCode]; if(!marker) return; var airport = window.AirportData && window.AirportData.getAirportByCode ? window.AirportData.getAirportByCode(airportCode) : null; if(!airport) return; this.map.removeLayer(marker); var newMarker = this.createAirportMarker(airport); newMarker.addTo(this.map); this.airportMarkers[airportCode] = newMarker; };

WorldMap.prototype.refreshAirportMarkers = function(){ for(var c in this.airportMarkers){ if(this.map && this.airportMarkers[c]) this.map.removeLayer(this.airportMarkers[c]); } this.airportMarkers = {}; this.loadAirports(); };

WorldMap.prototype.highlightAirport = function(airportCode){ var marker=this.airportMarkers[airportCode]; if(marker){ marker.openPopup(); this.map.setView(marker.getLatLng(),6); } };

WorldMap.prototype.render = function(){ if(this.map) this.map.invalidateSize(); };

// Expose global and default export
if (typeof window !== 'undefined') window.WorldMap = WorldMap;
export default WorldMap;
// ...contenuto originale di WorldMap.js da spostare qui...
