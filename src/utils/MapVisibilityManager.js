// MapVisibilityManager - Gestione intelligente della visibilità aeroporti sulla mappa
console.log('📂 Caricamento MapVisibilityManager.js...');

var MapVisibilityManager = {
    
    // Configurazione visibilità per zoom
    setupZoomBasedVisibility: function(map, updateCallback) {
        var self = this;
        
        // Aggiorna visibilità al cambio zoom
        map.on('zoomend', function() {
            var zoom = map.getZoom();
            updateCallback(zoom);
        });
        
        // Aggiorna visibilità quando si sposta la mappa
        map.on('moveend', function() {
            var zoom = map.getZoom();
            updateCallback(zoom);
        });
        
        // Imposta visibilità iniziale
        updateCallback(map.getZoom());
    },
    
    // Calcola aeroporti da mostrare
    updateAirportVisibility: function(map, airportMarkers, zoom) {
        console.log('🔍 Aggiornamento visibilità aeroporti intelligente, zoom:', zoom);
        
        // Ottieni i bounds della mappa visibile
        var bounds = map.getBounds();
        var visibleAirports = this.getAirportsInView(bounds, airportMarkers);
        
        // Calcola aeroporti da mostrare con sistema anti-clutter
        var airportsToShow = this.calculateVisibleAirports(map, visibleAirports, zoom);
        
        var visibleCount = 0;
        for (var code in airportMarkers) {
            var marker = airportMarkers[code];
            var shouldShow = airportsToShow.indexOf(code) !== -1;
            
            if (shouldShow && !map.hasLayer(marker)) {
                map.addLayer(marker);
                visibleCount++;
            } else if (!shouldShow && map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
        
        console.log('✅ Aeroporti visibili:', visibleCount, '/', Object.keys(airportMarkers).length, 
                   'zoom:', zoom, 'bounds:', bounds.toBBoxString());
    },
    
    // Ottieni aeroporti nell'area visibile
    getAirportsInView: function(bounds, airportMarkers) {
        var airportsInView = [];
        
        for (var code in airportMarkers) {
            var marker = airportMarkers[code];
            var airport = marker.airportData;
            
            if (airport && bounds.contains([airport.latitude, airport.longitude])) {
                airportsInView.push({
                    code: code,
                    airport: airport,
                    marker: marker
                });
            }
        }
        
        return airportsInView;
    },
    
    // Sistema intelligente anti-clutter basato su traffico e distanza in pixel
    calculateVisibleAirports: function(map, airportsInView, zoom) {
        if (airportsInView.length === 0) return [];
        
        // Parametri per zoom
        var maxAirports = this.getMaxAirportsForZoom(zoom);
        var minPixelDistance = this.getMinPixelDistanceForZoom(zoom);
        
        // Se ci sono pochi aeroporti, mostra tutti
        if (airportsInView.length <= maxAirports) {
            return airportsInView.map(function(item) { return item.code; });
        }
        
        // Ordina per rating (importanza basata su traffico)
        var sortedAirports = airportsInView.slice().sort(function(a, b) {
            return this.calculateAirportRating(b.airport) - this.calculateAirportRating(a.airport);
        }.bind(this));
        
        // Seleziona aeroporti evitando sovrapposizioni in pixel
        var selectedAirports = [];
        var selectedAirportData = [];
        
        for (var i = 0; i < sortedAirports.length && selectedAirports.length < maxAirports; i++) {
            var currentAirport = sortedAirports[i].airport;
            
            // Controlla distanza minima IN PIXEL da aeroporti già selezionati
            var tooClose = false;
            for (var j = 0; j < selectedAirportData.length; j++) {
                var pixelDistance = this.calculatePixelDistance(map, currentAirport, selectedAirportData[j]);
                
                if (pixelDistance < minPixelDistance) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                selectedAirports.push(sortedAirports[i].code);
                selectedAirportData.push(currentAirport);
            }
        }
        
        console.log('🎯 Anti-clutter: selezionati', selectedAirports.length, 'aeroporti da', airportsInView.length, 
                   'zoom:', zoom, 'minPixels:', minPixelDistance);
        
        return selectedAirports;
    },
    
    // Calcola rating importanza aeroporto basato SOLO sui livelli di traffico
    calculateAirportRating: function(airport) {
        // Rating basato sulla somma dei livelli di traffico
        var businessLevel = airport.businessLevel || 0;
        var touristLevel = airport.touristLevel || 0;
        
        // Somma diretta dei livelli di traffico (0-200 range)
        var trafficRating = businessLevel + touristLevel;
        
        return trafficRating;
    },
    
    // Calcola distanza in pixel tra due aeroporti sulla mappa
    calculatePixelDistance: function(map, airport1, airport2) {
        var point1 = map.latLngToContainerPoint([airport1.latitude, airport1.longitude]);
        var point2 = map.latLngToContainerPoint([airport2.latitude, airport2.longitude]);
        
        var dx = point1.x - point2.x;
        var dy = point1.y - point2.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Configurazione massimo aeroporti per zoom
    getMaxAirportsForZoom: function(zoom) {
        if (zoom >= 10) return 100;   // Zoom alto: molti aeroporti
        if (zoom >= 8) return 60;     // Zoom medio-alto
        if (zoom >= 6) return 40;     // Zoom medio
        if (zoom >= 4) return 25;     // Zoom basso
        if (zoom >= 3) return 15;     // Zoom molto basso
        return 10;                    // Zoom minimo
    },
    
    // Configurazione distanza minima IN PIXEL per zoom
    getMinPixelDistanceForZoom: function(zoom) {
        if (zoom >= 10) return 20;    // 20 pixel
        if (zoom >= 8) return 30;     // 30 pixel
        if (zoom >= 6) return 40;     // 40 pixel
        if (zoom >= 4) return 50;     // 50 pixel
        if (zoom >= 3) return 60;     // 60 pixel
        return 80;                    // 80 pixel per zoom molto bassi
    }
};

// Export per uso globale
window.MapVisibilityManager = MapVisibilityManager;
console.log('✅ MapVisibilityManager caricato');
