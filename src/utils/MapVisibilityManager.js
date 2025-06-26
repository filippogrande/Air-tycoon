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
        var airportsToShow = this.calculateVisibleAirports(visibleAirports, zoom);
        
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
    
    // Sistema intelligente anti-clutter
    calculateVisibleAirports: function(airportsInView, zoom) {
        if (airportsInView.length === 0) return [];
        
        // Parametri per zoom
        var maxAirports = this.getMaxAirportsForZoom(zoom);
        var minDistance = this.getMinDistanceForZoom(zoom);
        
        // Se ci sono pochi aeroporti, mostra tutti
        if (airportsInView.length <= maxAirports) {
            return airportsInView.map(function(item) { return item.code; });
        }
        
        // Ordina per rating (importanza)
        var sortedAirports = airportsInView.slice().sort(function(a, b) {
            return this.calculateAirportRating(b.airport) - this.calculateAirportRating(a.airport);
        }.bind(this));
        
        // Seleziona aeroporti evitando sovrapposizioni
        var selectedAirports = [];
        var selectedPositions = [];
        
        for (var i = 0; i < sortedAirports.length && selectedAirports.length < maxAirports; i++) {
            var airport = sortedAirports[i].airport;
            var position = { lat: airport.latitude, lng: airport.longitude };
            
            // Controlla distanza minima da aeroporti già selezionati
            var tooClose = false;
            for (var j = 0; j < selectedPositions.length; j++) {
                var distance = RouteCalculator.calculateDistance(
                    position.lat, position.lng,
                    selectedPositions[j].lat, selectedPositions[j].lng
                );
                
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                selectedAirports.push(sortedAirports[i].code);
                selectedPositions.push(position);
            }
        }
        
        return selectedAirports;
    },
    
    // Calcola rating importanza aeroporto
    calculateAirportRating: function(airport) {
        var rating = 0;
        
        // Rating base per dimensione
        switch (airport.size) {
            case 'large':
                rating += 100; // Aeroporti grandi sono i più importanti
                break;
            case 'medium':
                rating += 50;
                break;
            case 'small':
            default:
                rating += 20;
                break;
        }
        
        // Bonus per traffico business e turistico
        var businessLevel = airport.businessLevel || 50;
        var touristLevel = airport.touristLevel || 50;
        rating += (businessLevel + touristLevel) / 4; // Max +25
        
        // Bonus per capitali e città importanti
        var cityName = airport.city.toLowerCase();
        var importantCities = ['roma', 'milano', 'paris', 'london', 'berlin', 'madrid', 'amsterdam', 'munich'];
        if (importantCities.indexOf(cityName) !== -1) {
            rating += 30;
        }
        
        return rating;
    },
    
    // Configurazione massimo aeroporti per zoom
    getMaxAirportsForZoom: function(zoom) {
        if (zoom >= 10) return 50;    // Zoom alto: molti aeroporti
        if (zoom >= 8) return 30;     // Zoom medio-alto
        if (zoom >= 6) return 20;     // Zoom medio
        if (zoom >= 4) return 15;     // Zoom basso
        return 10;                    // Zoom molto basso
    },
    
    // Configurazione distanza minima per zoom
    getMinDistanceForZoom: function(zoom) {
        if (zoom >= 10) return 20;    // 20km
        if (zoom >= 8) return 50;     // 50km
        if (zoom >= 6) return 100;    // 100km
        if (zoom >= 4) return 200;    // 200km
        return 500;                   // 500km
    }
};

// Export per uso globale
window.MapVisibilityManager = MapVisibilityManager;
console.log('✅ MapVisibilityManager caricato');
