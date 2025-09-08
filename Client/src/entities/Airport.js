// Classe Airport compatibile con tutti i browser
console.log('📂 Caricamento Airport.js...');

function Airport(data) {
    this.code = data.code; // IATA code (es. MXP)
    this.name = data.name;
    this.city = data.city;
    this.country = data.country;
    this.continent = data.continent;
    
    // Coordinate geografiche
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    
    // Caratteristiche dell'aeroporto
    this.size = data.size || 'medium'; // 'small', 'medium', 'large', 'hub'
    this.runwayLength = data.runwayLength || 3000; // metri
    this.maxAircraftSize = data.maxAircraftSize || 'large';
    
    // Statistiche economiche
    this.demandLevel = data.demandLevel || 50; // 0-100
    this.competitionLevel = data.competitionLevel || 50; // 0-100
    this.economicLevel = data.economicLevel || 50; // 0-100
    this.passengerTraffic = data.passengerTraffic || 0; // annuale
    
    // Costi operativi
    this.landingFee = data.landingFee || this.calculateLandingFee();
    this.terminalFee = data.terminalFee || this.calculateTerminalFee();
    this.fuelPrice = data.fuelPrice || this.calculateFuelPrice();
    
    // Stato dell'aeroporto nel gioco
    this.isBase = false; // Se è la base della compagnia
    this.hasService = false; // Se la compagnia ha servizi qui
    this.routes = []; // Array di Route IDs
    this.aircraft = []; // Array di Aircraft IDs stazionati qui
    
    // Storico
    this.totalFlights = 0;
    this.totalPassengers = 0;
    this.totalRevenue = 0;
}

// Metodi del prototipo
Airport.prototype.calculateLandingFee = function() {
    var baseFee = 500; // €500 base
    var sizeFactor = 1;
    
    switch (this.size) {
        case 'small': sizeFactor = 0.5; break;
        case 'medium': sizeFactor = 1; break;
        case 'large': sizeFactor = 1.5; break;
        case 'hub': sizeFactor = 2; break;
    }
    
    return Math.round(baseFee * sizeFactor * (this.demandLevel / 50));
};

Airport.prototype.calculateTerminalFee = function() {
    return Math.round(this.landingFee * 0.3);
};

Airport.prototype.calculateFuelPrice = function() {
    var basePrice = 0.8; // €0.8 per litro
    var countryFactor = 1;
    
    // Fattori per paese (semplificato)
    if (this.country === 'United States') countryFactor = 0.9;
    else if (this.country === 'Italia') countryFactor = 1.2;
    else if (this.country === 'United Kingdom') countryFactor = 1.3;
    
    return basePrice * countryFactor;
};

Airport.prototype.distanceTo = function(otherAirport) {
    var R = 6371; // Raggio della Terra in km
    var lat1Rad = this.latitude * Math.PI / 180;
    var lat2Rad = otherAirport.latitude * Math.PI / 180;
    var deltaLatRad = (otherAirport.latitude - this.latitude) * Math.PI / 180;
    var deltaLonRad = (otherAirport.longitude - this.longitude) * Math.PI / 180;
    
    var a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return Math.round(R * c);
};

Airport.prototype.canAccommodate = function(aircraftType) {
    var aircraftData = AircraftData.getAircraftByType(aircraftType);
    if (!aircraftData) return false;
    
    // Verifica dimensioni aeromobile vs aeroporto
    var aircraftSize = aircraftData.category;
    
    if (this.maxAircraftSize === 'small') {
        return aircraftSize === 'regional';
    } else if (this.maxAircraftSize === 'medium') {
        return aircraftSize === 'regional' || aircraftSize === 'narrow_body';
    } else {
        return true; // large può accogliere tutto
    }
};

Airport.prototype.getDemandForRoute = function(destinationAirport) {
    var baseDemand = (this.demandLevel + destinationAirport.demandLevel) / 2;
    var distance = this.distanceTo(destinationAirport);
    
    // Fattore distanza (richiesta ottimale a media distanza)
    var distanceFactor = 1;
    if (distance < 500) distanceFactor = 0.7; // troppo vicino
    else if (distance > 10000) distanceFactor = 0.8; // troppo lontano
    
    // Fattore competizione
    var competitionFactor = Math.max(0.3, 1 - (this.competitionLevel / 100));
    
    return Math.round(baseDemand * distanceFactor * competitionFactor);
};

Airport.prototype.addRoute = function(routeId) {
    if (this.routes.indexOf(routeId) === -1) {
        this.routes.push(routeId);
    }
};

Airport.prototype.removeRoute = function(routeId) {
    var index = this.routes.indexOf(routeId);
    if (index !== -1) {
        this.routes.splice(index, 1);
    }
};

Airport.prototype.addAircraft = function(aircraftId) {
    if (this.aircraft.indexOf(aircraftId) === -1) {
        this.aircraft.push(aircraftId);
    }
};

Airport.prototype.removeAircraft = function(aircraftId) {
    var index = this.aircraft.indexOf(aircraftId);
    if (index !== -1) {
        this.aircraft.splice(index, 1);
    }
};

Airport.prototype.setAsBase = function() {
    this.isBase = true;
    this.hasService = true;
};

Airport.prototype.addService = function() {
    this.hasService = true;
};

Airport.prototype.removeService = function() {
    if (!this.isBase) {
        this.hasService = false;
    }
};

Airport.prototype.getTotalOperatingCost = function() {
    return this.landingFee + this.terminalFee;
};

Airport.prototype.toSaveData = function() {
    return {
        code: this.code,
        isBase: this.isBase,
        hasService: this.hasService,
        routes: this.routes.slice(),
        aircraft: this.aircraft.slice(),
        totalFlights: this.totalFlights,
        totalPassengers: this.totalPassengers,
        totalRevenue: this.totalRevenue
    };
};

Airport.prototype.loadFromData = function(data) {
    this.isBase = data.isBase || false;
    this.hasService = data.hasService || false;
    this.routes = data.routes || [];
    this.aircraft = data.aircraft || [];
    this.totalFlights = data.totalFlights || 0;
    this.totalPassengers = data.totalPassengers || 0;
    this.totalRevenue = data.totalRevenue || 0;
};

Airport.prototype.toString = function() {
    return this.code + ' - ' + this.name + ' (' + this.city + ')';
};

// Rendi disponibile globalmente
window.Airport = Airport;

console.log('✅ Airport compatibile caricato');
