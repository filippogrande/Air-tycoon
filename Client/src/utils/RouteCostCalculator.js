// RouteCostCalculator - Calcoli costi e prezzi per rotte

var RouteCostCalculator = {
    
    // Calcola costo di creazione di una rotta
    calculateCreationCost: function(distance, countriesOverflown) {
        var baseCost = 25000; // €25,000 base
        var costPerKm = 15; // €15 per km
        var costPerCountry = 8000; // €8,000 per nazione sorvolata
        
        var distanceCost = distance * costPerKm;
        var countryCost = (countriesOverflown - 1) * costPerCountry; // -1 perché origine non conta
        
        return Math.round(baseCost + distanceCost + countryCost);
    },
    
    // Calcola costo per volo
    calculateFlightCost: function(distance) {
        var baseCost = 5000; // Costo base per volo
        var costPerKm = 2; // Costo aggiuntivo per km
        
        return Math.round(baseCost + (distance * costPerKm));
    },
    
    // Calcola ricavi stimati
    calculateRevenue: function(passengers, cargo, routeType) {
        var passengerRevenue = 0;
        var cargoRevenue = 0;
        
        if (routeType === 'passenger' || routeType === 'mixed') {
            passengerRevenue = passengers * 120; // €120 per passeggero
        }
        
        if (routeType === 'cargo' || routeType === 'mixed') {
            cargoRevenue = cargo * 800; // €800 per tonnellata
        }
        
        return {
            passenger: passengerRevenue,
            cargo: cargoRevenue,
            total: passengerRevenue + cargoRevenue
        };
    },
    
    // Calcola profitti mensili stimati
    calculateMonthlyProfit: function(dailyRevenue, distance, flightsPerDay) {
        flightsPerDay = flightsPerDay || 1;
        
        var monthlyRevenue = dailyRevenue * 30 * flightsPerDay;
        var costPerFlight = this.calculateFlightCost(distance);
        var monthlyCosts = costPerFlight * 30 * flightsPerDay;
        
        return {
            revenue: monthlyRevenue,
            costs: monthlyCosts,
            profit: monthlyRevenue - monthlyCosts,
            margin: monthlyCosts > 0 ? ((monthlyRevenue - monthlyCosts) / monthlyRevenue * 100) : 0
        };
    },
    
    // Calcola semplice stima di paesi sorvolati (euristica)
    calculateCountriesOverflown: function(origin, destination) {
        // Euristica semplice basata sulla distanza e continenti
        var distance = RouteCalculator.calculateDistance(
            origin.latitude, origin.longitude,
            destination.latitude, destination.longitude
        );
        
        // Stesso paese
        if (origin.country === destination.country) {
            return 1;
        }
        
        // Stesso continente
        if (origin.continent === destination.continent) {
            if (distance < 500) return 2;      // Paesi vicini
            if (distance < 1500) return 3;    // Europa centrale
            return 4;                          // Europa estesa
        }
        
        // Continenti diversi
        if (distance < 3000) return 5;        // Mediterraneo/Vicino Oriente
        if (distance < 8000) return 7;        // Intercontinentale medio
        return 10;                             // Intercontinentale lungo
    }
};

// Export per uso globale
window.RouteCostCalculator = RouteCostCalculator;
