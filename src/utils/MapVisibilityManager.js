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
    
    // Calcola aeroporti da mostrare - LOGICA ORIGINALE FUNZIONANTE
    updateAirportVisibility: function(game, map, airportMarkers, zoom) {
        console.log('🔍 Aggiornamento visibilità aeroporti intelligente, zoom:', zoom);
        
        // Ottieni i bounds della mappa visibile
        var bounds = map.getBounds();
        var visibleAirports = this.getAirportsInView(bounds, airportMarkers);
        
        // Calcola aeroporti da mostrare con sistema anti-clutter
        var airportsToShow = this.calculateVisibleAirports(game, visibleAirports, zoom);
        
        var visibleCount = 0;
        
        // Nascondi tutti i marker prima
        for (var code in airportMarkers) {
            var marker = airportMarkers[code];
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
        
        // Mostra solo gli aeroporti selezionati
        for (var i = 0; i < airportsToShow.length; i++) {
            var airportCode = airportsToShow[i];
            var marker = airportMarkers[airportCode];
            
            if (marker && !map.hasLayer(marker)) {
                map.addLayer(marker);
                visibleCount++;
            }
        }
        
        console.log('✅ Aeroporti visibili:', visibleCount, '/', Object.keys(airportMarkers).length, 
                    '(da', visibleAirports.length, 'nell\'area)');
        
        // Aggiorna etichette città in base allo zoom
        this.updateCityLabels(map, airportMarkers, zoom);
    },
    
    // Gestisce la visualizzazione delle etichette delle città
    updateCityLabels: function(map, airportMarkers, zoom) {
        var shouldShowLabels = zoom >= 6; // Aumentato a zoom 6 per evitare sovrapposizioni precoci
        
        for (var code in airportMarkers) {
            var marker = airportMarkers[code];
            if (!marker || !marker.airportData) continue;
            
            var airport = marker.airportData;
            
            // Se il marker è visibile sulla mappa
            if (map.hasLayer(marker)) {
                if (shouldShowLabels && !marker.cityLabel) {
                    // Crea etichetta città se non esiste
                    this.createCityLabel(map, marker, airport);
                } else if (!shouldShowLabels && marker.cityLabel) {
                    // Rimuovi etichetta città se non dovrebbe essere visibile
                    this.removeCityLabel(map, marker);
                }
            } else if (marker.cityLabel) {
                // Se il marker non è visibile, rimuovi anche l'etichetta
                this.removeCityLabel(map, marker);
            }
        }
        
        console.log('🏷️ Etichette città:', shouldShowLabels ? 'MOSTRATE' : 'NASCOSTE', 'zoom:', zoom);
    },
    
    // Crea un'etichetta per la città dell'aeroporto
    createCityLabel: function(map, marker, airport) {
        var cityName = airport.city || airport.code;
        
        // Crea l'etichetta come DivIcon
        var labelIcon = L.divIcon({
            className: 'airport-city-label',
            html: '<span class="city-name">' + cityName + '</span>',
            iconSize: [100, 20],
            iconAnchor: [50, -15] // Posiziona sopra il marker dell'aeroporto
        });
        
        // Crea marker per l'etichetta
        var labelMarker = L.marker([airport.latitude, airport.longitude], {
            icon: labelIcon,
            interactive: false, // Non interattivo per non interferire con i click
            zIndexOffset: -100   // Sotto i marker degli aeroporti
        });
        
        // Aggiungi alla mappa
        labelMarker.addTo(map);
        
        // Salva riferimento nel marker principale
        marker.cityLabel = labelMarker;
    },
    
    // Rimuove l'etichetta della città
    removeCityLabel: function(map, marker) {
        if (marker.cityLabel) {
            map.removeLayer(marker.cityLabel);
            marker.cityLabel = null;
        }
    },
    
    // Ottieni aeroporti nell'area visibile della mappa
    getAirportsInView: function(bounds, airportMarkers) {
        var airportsInView = [];
        
        for (var code in airportMarkers) {
            var marker = airportMarkers[code];
            var airport = marker.airportData;
            var latlng = L.latLng(airport.latitude, airport.longitude);
            
            if (bounds.contains(latlng)) {
                airportsInView.push(airport);  // Restituisce direttamente l'oggetto airport
            }
        }
        
        return airportsInView;
    },
    
    // Sistema intelligente anti-clutter - LOGICA ORIGINALE FUNZIONANTE
    calculateVisibleAirports: function(game, airportsInView, zoom) {
        var self = this;
        
        // Calcola rating per ogni aeroporto
        var airportsWithRating = airportsInView.map(function(airport) {
            return {
                airport: airport,
                rating: self.calculateAirportRating(airport),
                isPlayerHub: game.hubManager && game.hubManager.hasHub(airport.code)
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
                    var distance = RouteCalculator.calculateDistance(
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
    },
    
    // Calcola rating importanza aeroporto - LOGICA ORIGINALE FUNZIONANTE
    calculateAirportRating: function(airport) {
        // Calcola rating basato su business e tourist level
        var businessLevel = airport.businessLevel || 50;  // Default 50 se mancante
        var touristLevel = airport.touristLevel || 50;    // Default 50 se mancante
        
        // Il traffico business vale di più del turistico per l'importanza dell'aeroporto
        // Business: peso 1.5, Tourist: peso 1.0
        var combinedTraffic = (businessLevel * 1.5) + (touristLevel * 1.0);
        
        // Converti in rating base (moltiplica per 10000 per ottenere valori ragionevoli)
        var baseRating = combinedTraffic * 10000;
        
        // Bonus per tipo di aeroporto (CORRETTO: senza 'hub')
        var typeMultiplier = 1;
        switch (airport.size) {
            case 'large':
                typeMultiplier = 2.0;
                break;
            case 'medium':
                typeMultiplier = 1.2;
                break;
            case 'small':
            default:
                typeMultiplier = 1.0;
                break;
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
    },
    
    // Calcola distanza in pixel tra due aeroporti sulla mappa
    calculatePixelDistance: function(map, airport1, airport2) {
        var point1 = map.latLngToContainerPoint([airport1.latitude, airport1.longitude]);
        var point2 = map.latLngToContainerPoint([airport2.latitude, airport2.longitude]);
        
        var dx = point1.x - point2.x;
        var dy = point1.y - point2.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Configurazione massimo aeroporti per zoom - ORIGINALE FUNZIONANTE + RIDUZIONE PER ETICHETTE
    getMaxAirportsForZoom: function(zoom) {
        // Quando le etichette sono attive (zoom >= 6), riduci il numero di aeroporti
        if (zoom >= 6) {
            if (zoom <= 6) return 40;    // Zoom 6: meno aeroporti per evitare clutter etichette
            if (zoom <= 7) return 80;    // Zoom 7: incremento graduale
            if (zoom <= 8) return 150;   // Zoom 8: più aeroporti ma controllato
            return 300;                  // Zoom 9+: molti aeroporti
        }
        
        // Comportamento normale quando non ci sono etichette
        if (zoom <= 2) return 50;    // Vista mondo: più aeroporti importanti 
        if (zoom <= 3) return 100;   // Continente: molti più aeroporti
        if (zoom <= 4) return 200;   // Regione: ancora di più
        if (zoom <= 5) return 400;   // Area: molti aeroporti
        return 600;                  // Default per zoom intermedi
    },
    
    // Configurazione distanza minima per zoom - ORIGINALE FUNZIONANTE + ANTI-CLUTTER SEVERO PER ETICHETTE
    getMinDistanceForZoom: function(zoom) {
        // Quando le etichette sono attive (zoom >= 6), rendi l'anti-clutter più severo
        if (zoom >= 6) {
            if (zoom <= 6) return 80;    // Zoom 6: distanza maggiore per evitare sovrapposizioni etichette
            if (zoom <= 7) return 50;    // Zoom 7: ancora distanza considerevole
            if (zoom <= 8) return 30;    // Zoom 8: distanza media
            return 15;                   // Zoom 9+: distanza minima
        }
        
        // Comportamento normale quando non ci sono etichette
        if (zoom <= 2) return 400;   // Vista mondo: meno distanziati
        if (zoom <= 3) return 200;   // Continente: meno distanziati
        if (zoom <= 4) return 100;   // Regione: ancora meno
        if (zoom <= 5) return 50;    // Area: vicini
        return 25;                   // Default per zoom intermedi
    }
};

// Export per uso globale
window.MapVisibilityManager = MapVisibilityManager;
console.log('✅ MapVisibilityManager caricato');
