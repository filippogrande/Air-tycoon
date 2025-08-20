<<<<<<< Updated upstream
// ...contenuto originale di RouteCalculator.js da spostare qui...
=======
// RouteCalculator - Calcoli per rotte aeree
console.log('📂 Caricamento RouteCalculator.js...');

var RouteCalculator = {
    
    // Calcola distanza tra due aeroporti (formula haversine)
    calculateDistance: function(lat1, lon1, lat2, lon2) {
        var R = 6371; // Raggio della Terra in km
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    
    // Calcola fattore di traffico di un aeroporto
    getAirportTrafficFactor: function(airport) {
        var sizeFactor = 1.0;
        switch (airport.size) {
            case 'large':
                sizeFactor = 2.5; // Aeroporti grandi hanno il fattore più alto
                break;
            case 'medium':
                sizeFactor = 1.2;
                break;
            case 'small':
            default: // small/regional/altri
                sizeFactor = 0.6;
                break;
        }
        
        // Fattore business e turistico (0-100 scale)
        var businessLevel = airport.businessLevel || 50;
        var touristLevel = airport.touristLevel || 50;
        var activityFactor = (businessLevel + touristLevel) / 100; // Media 0.5-1.0
        
        return sizeFactor * activityFactor;
    },
    
    // Calcola passeggeri stimati per una rotta
    calculatePassengers: function(origin, destination, distance, errorPercent) {
        var originFactor = this.getAirportTrafficFactor(origin);
        var destinationFactor = this.getAirportTrafficFactor(destination);
        var routeFactor = (originFactor + destinationFactor) / 2;
        
        // Fattore distanza
        var distanceFactor = 1.0;
        if (distance > 3000) {
            distanceFactor = 1.2; // Rotte intercontinentali
        } else if (distance > 1500) {
            distanceFactor = 1.1; // Rotte continentali lunghe
        } else if (distance < 500) {
            distanceFactor = 0.8; // Rotte regionali brevi
        }
        
        // Passeggeri base
        var basePassengers = Math.round(routeFactor * distanceFactor * 150);
        
        // Applica errore se specificato
        if (errorPercent && errorPercent > 0) {
            var errorMultiplier = 1 + (Math.random() - 0.5) * 2 * (errorPercent / 100);
            return Math.max(10, Math.round(basePassengers * errorMultiplier));
        }
        
        return basePassengers;
    },
    
    // Calcola cargo stimato per una rotta
    calculateCargo: function(origin, destination, distance, errorPercent) {
        var originFactor = this.getAirportTrafficFactor(origin);
        var destinationFactor = this.getAirportTrafficFactor(destination);
        var routeFactor = (originFactor + destinationFactor) / 2;
        
        // Fattore distanza
        var distanceFactor = 1.0;
        if (distance > 3000) {
            distanceFactor = 1.2;
        } else if (distance > 1500) {
            distanceFactor = 1.1;
        } else if (distance < 500) {
            distanceFactor = 0.8;
        }
        
        // Cargo base (tonnellate)
        var baseCargo = Math.round(routeFactor * distanceFactor * 12);
        
        // Applica errore se specificato
        if (errorPercent && errorPercent > 0) {
            var errorMultiplier = 1 + (Math.random() - 0.5) * 2 * (errorPercent / 100);
            return Math.max(1, Math.round(baseCargo * errorMultiplier));
        }
        
        return baseCargo;
    },
    
    // Calcola tutte le stime per una rotta con errori
    calculateRouteEstimates: async function(origin, destination, analysisLevel, year) {
        var distance = this.calculateDistance(
            origin.latitude, origin.longitude,
            destination.latitude, destination.longitude
        );
        // Definisci errori per livello di analisi
        var errors = {
            basic: { passenger: 30, cargo: 25 },
            improved: { passenger: 10, cargo: 8 }
        };
        var currentError = errors[analysisLevel] || errors.basic;
        // Calcola stime
        var realPassengers = this.calculatePassengers(origin, destination, distance, 0);
        var realCargo = this.calculateCargo(origin, destination, distance, 0);
        var displayPassengers = this.calculatePassengers(origin, destination, distance, currentError.passenger);
        var displayCargo = this.calculateCargo(origin, destination, distance, currentError.cargo);
        // Ottieni tempo di volo reale dal backend
        var min_time = null, max_time = null;
        try {
            var response = await fetch('/api/routes/flight_time_range', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin_iata: origin.iata_code,
                    destination_iata: destination.iata_code,
                    year: year || new Date().getFullYear()
                })
            });
            if (response.ok) {
                var data = await response.json();
                min_time = data.min_time_hours;
                max_time = data.max_time_hours;
            }
        } catch (e) {
            console.warn('Impossibile ottenere tempo di volo reale dal backend:', e);
        }
        // Formatta sempre come "min–max h"
        var formattedFlightTime = (min_time && max_time)
            ? (Number(min_time).toFixed(1) + '–' + Number(max_time).toFixed(1) + ' h')
            : '--';
        return {
            distance: distance,
            min_time_hours: min_time,
            max_time_hours: max_time,
            flightTimeFormatted: formattedFlightTime,
            realPassengers: realPassengers,
            realCargo: realCargo,
            displayPassengers: displayPassengers,
            displayCargo: displayCargo,
            realRevenue: (realPassengers * 120) + (realCargo * 800),
            analysisLevel: analysisLevel,
            errorMargins: {
                passenger: currentError.passenger + '%',
                cargo: currentError.cargo + '%'
            }
        };
    }
};

// Export per uso globale
window.RouteCalculator = RouteCalculator;
console.log('✅ RouteCalculator caricato');
>>>>>>> Stashed changes
