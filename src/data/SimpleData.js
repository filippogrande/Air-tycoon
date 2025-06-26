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
            size: 'large',  // Aeroporto internazionale grande
            runwayLength: 3920,
            maxAircraftSize: 'large',
            businessLevel: 85,
            touristLevel: 75
        },
        {
            code: 'FCO',
            name: 'Roma Fiumicino',
            city: 'Roma',
            country: 'Italia',
            continent: 'Europa',
            latitude: 41.8003,
            longitude: 12.2389,
            size: 'large',  // Aeroporto internazionale grande
            runwayLength: 3900,
            maxAircraftSize: 'large',
            businessLevel: 80,
            touristLevel: 90
        },
        {
            code: 'LHR',
            name: 'London Heathrow',
            city: 'London',
            country: 'United Kingdom',
            continent: 'Europa',
            latitude: 51.4706,
            longitude: -0.4619,
            size: 'large',  // Aeroporto internazionale molto grande
            runwayLength: 3900,
            maxAircraftSize: 'large',
            businessLevel: 95,
            touristLevel: 70
        },
        {
            code: 'CDG',
            name: 'Paris Charles de Gaulle',
            city: 'Paris',
            country: 'France',
            continent: 'Europa',
            latitude: 49.0097,
            longitude: 2.5479,
            size: 'large',  // Aeroporto internazionale grande
            runwayLength: 4200,
            maxAircraftSize: 'large',
            businessLevel: 90,
            touristLevel: 80
        },
        {
            code: 'JFK',
            name: 'John F Kennedy Intl',
            city: 'New York',
            country: 'United States',
            continent: 'Nord America',
            latitude: 40.6413,
            longitude: -73.7781,
            size: 'large',  // Aeroporto internazionale molto grande
            runwayLength: 4400,
            maxAircraftSize: 'large',
            businessLevel: 98,
            touristLevel: 85
        },
        // Aeroporti medi per test icone
        {
            code: 'BLQ',
            name: 'Bologna Guglielmo Marconi',
            city: 'Bologna',
            country: 'Italia',
            continent: 'Europa',
            latitude: 44.5354,
            longitude: 11.2887,
            size: 'medium',  // Aeroporto regionale
            runwayLength: 2800,
            maxAircraftSize: 'medium',
            businessLevel: 65,
            touristLevel: 70
        },
        {
            code: 'VRN',
            name: 'Verona Villafranca',
            city: 'Verona',
            country: 'Italia',
            continent: 'Europa',
            latitude: 45.3957,
            longitude: 10.8885,
            size: 'medium',  // Aeroporto regionale
            runwayLength: 3000,
            maxAircraftSize: 'medium',
            businessLevel: 55,
            touristLevel: 80
        },
        // Aeroporti piccoli per test icone
        {
            code: 'AOT',
            name: 'Aosta Airport',
            city: 'Aosta',
            country: 'Italia',
            continent: 'Europa',
            latitude: 45.7386,
            longitude: 7.3697,
            size: 'small',  // Aeroporto locale
            runwayLength: 1800,
            maxAircraftSize: 'small',
            businessLevel: 30,
            touristLevel: 60
        },
        {
            code: 'ELB',
            name: 'Elba Airport',
            city: 'Portoferraio',
            country: 'Italia',
            continent: 'Europa',
            latitude: 42.7603,
            longitude: 10.2394,
            size: 'small',  // Aeroporto turistico piccolo
            runwayLength: 1000,
            maxAircraftSize: 'small',
            businessLevel: 20,
            touristLevel: 90
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
