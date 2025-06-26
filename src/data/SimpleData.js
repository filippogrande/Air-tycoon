// Versione semplificata e compatibile dei dati
console.log('📂 Caricamento dati semplificati...');

// Dati aeromobili (compatibile)
function createAircraftData() {
    return [
        {
            type: 'atr72',
            name: 'ATR 72-600',
            manufacturer: 'ATR',
            category: 'regional',
            capacity: 78,
            range: 1665,
            speed: 510,
            fuelConsumption: 2.2,
            price: 28000000,
            maintenanceCost: 450,
            yearIntroduced: 2010
        },
        {
            type: 'a320',
            name: 'Airbus A320',
            manufacturer: 'Airbus',
            category: 'narrow_body',
            capacity: 180,
            range: 6150,
            speed: 828,
            fuelConsumption: 3.8,
            price: 110000000,
            maintenanceCost: 850,
            yearIntroduced: 1988
        },
        {
            type: 'b737',
            name: 'Boeing 737-800',
            manufacturer: 'Boeing',
            category: 'narrow_body',
            capacity: 189,
            range: 5765,
            speed: 842,
            fuelConsumption: 4.2,
            price: 112000000,
            maintenanceCost: 900,
            yearIntroduced: 1998
        },
        {
            type: 'a350',
            name: 'Airbus A350-900',
            manufacturer: 'Airbus',
            category: 'wide_body',
            capacity: 325,
            range: 15000,
            speed: 903,
            fuelConsumption: 5.8,
            price: 317000000,
            maintenanceCost: 1800,
            yearIntroduced: 2015
        }
    ];
}

// Dati aeroporti (compatibile)
function createAirportData() {
    return [
        {
            code: 'MXP',
            name: 'Milano Malpensa',
            city: 'Milano',
            country: 'Italia',
            continent: 'Europa',
            latitude: 45.6306,
            longitude: 8.7281,
            size: 'hub',
            runwayLength: 3920,
            maxAircraftSize: 'large',
            demandLevel: 85
        },
        {
            code: 'FCO',
            name: 'Roma Fiumicino',
            city: 'Roma',
            country: 'Italia',
            continent: 'Europa',
            latitude: 41.8003,
            longitude: 12.2389,
            size: 'hub',
            runwayLength: 3900,
            maxAircraftSize: 'large',
            demandLevel: 90
        },
        {
            code: 'LHR',
            name: 'London Heathrow',
            city: 'London',
            country: 'United Kingdom',
            continent: 'Europa',
            latitude: 51.4706,
            longitude: -0.4619,
            size: 'hub',
            runwayLength: 3900,
            maxAircraftSize: 'large',
            demandLevel: 95
        },
        {
            code: 'CDG',
            name: 'Paris Charles de Gaulle',
            city: 'Paris',
            country: 'France',
            continent: 'Europa',
            latitude: 49.0097,
            longitude: 2.5479,
            size: 'hub',
            runwayLength: 4200,
            maxAircraftSize: 'large',
            demandLevel: 92
        },
        {
            code: 'JFK',
            name: 'John F Kennedy Intl',
            city: 'New York',
            country: 'United States',
            continent: 'Nord America',
            latitude: 40.6413,
            longitude: -73.7781,
            size: 'hub',
            runwayLength: 4400,
            maxAircraftSize: 'large',
            demandLevel: 98
        }
    ];
}

// Classe AircraftData compatibile
window.AircraftData = {
    aircraft: createAircraftData(),
    
    getAllAircraft: function() {
        return this.aircraft.slice();
    },
    
    getAircraftByType: function(type) {
        for (var i = 0; i < this.aircraft.length; i++) {
            if (this.aircraft[i].type === type) {
                return this.aircraft[i];
            }
        }
        return null;
    },
    
    getAircraftByCategory: function(category) {
        var result = [];
        for (var i = 0; i < this.aircraft.length; i++) {
            if (this.aircraft[i].category === category) {
                result.push(this.aircraft[i]);
            }
        }
        return result;
    }
};

// Classe AirportData compatibile
window.AirportData = {
    airports: createAirportData(),
    
    getAirports: function() {
        return this.airports;
    },
    
    getAllAirports: function() {
        return this.airports.slice();
    },
    
    getAirportByCode: function(code) {
        for (var i = 0; i < this.airports.length; i++) {
            if (this.airports[i].code === code) {
                return this.airports[i];
            }
        }
        return null;
    },
    
    getAirportsByCountry: function(country) {
        var result = [];
        for (var i = 0; i < this.airports.length; i++) {
            if (this.airports[i].country === country) {
                result.push(this.airports[i]);
            }
        }
        return result;
    },
    
    // Filtra aeroporti per tipo hub
    getHubAirports: function() {
        var result = [];
        for (var i = 0; i < this.airports.length; i++) {
            if (this.airports[i].size === 'hub') {
                result.push(this.airports[i]);
            }
        }
        return result;
    },
    
    // Filtra aeroporti regionali
    getRegionalAirports: function() {
        var result = [];
        for (var i = 0; i < this.airports.length; i++) {
            if (this.airports[i].size === 'regional' || this.airports[i].size === 'small') {
                result.push(this.airports[i]);
            }
        }
        return result;
    },
    
    // Ottieni aeroporti in un raggio (km) da coordinate
    getAirportsInRadius: function(lat, lng, radiusKm) {
        var result = [];
        for (var i = 0; i < this.airports.length; i++) {
            var airport = this.airports[i];
            var distance = this.calculateDistance(lat, lng, airport.latitude, airport.longitude);
            if (distance <= radiusKm) {
                result.push({
                    airport: airport,
                    distance: distance
                });
            }
        }
        return result.sort(function(a, b) { return a.distance - b.distance; });
    },
    
    // Calcola distanza tra due punti (formula haversine)
    calculateDistance: function(lat1, lon1, lat2, lon2) {
        var R = 6371; // Raggio Terra in km
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
};

console.log('✅ Dati semplificati caricati:', 
    AircraftData.aircraft.length, 'aeromobili,', 
    AirportData.airports.length, 'aeroporti');
