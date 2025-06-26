// Classe Route compatibile con tutti i browser
console.log('📂 Caricamento Route.js...');

function Route(originCode, destinationCode, aircraftId) {
    this.id = this.generateId();
    this.origin = originCode;
    this.destination = destinationCode;
    this.aircraftId = aircraftId;
    
    // Configurazione della rotta
    this.frequency = 7; // voli per settimana
    this.ticketPrice = 0; // calcolato automaticamente
    this.isActive = true;
    
    // Calcoli della rotta
    this.distance = 0;
    this.flightTime = 0; // ore
    this.demand = 0; // passeggeri potenziali
    this.competition = 0;
    
    // Statistiche operative
    this.totalFlights = 0;
    this.totalPassengers = 0;
    this.totalRevenue = 0;
    this.totalExpenses = 0;
    this.loadFactor = 0; // % riempimento medio
    
    // Stato della rotta
    this.profitability = 0; // % profitto
    this.reputation = 50; // 0-100
    this.established = new Date();
    
    // Inizializza la rotta
    this.initialize();
}

// Metodi del prototipo
Route.prototype.generateId = function() {
    return 'route_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

Route.prototype.initialize = function() {
    var originAirport = AirportData.getAirportByCode(this.origin);
    var destinationAirport = AirportData.getAirportByCode(this.destination);
    
    if (!originAirport || !destinationAirport) {
        throw new Error('Aeroporti non validi per la rotta');
    }
    
    // Calcola distanza
    this.distance = this.calculateDistance(originAirport, destinationAirport);
    
    // Verifica che l'aeromobile possa coprire la distanza
    var aircraft = this.getAircraft();
    if (aircraft && this.distance > aircraft.range) {
        throw new Error('Aeromobile non ha autonomia sufficiente per questa rotta');
    }
    
    // Calcola tempo di volo
    if (aircraft) {
        this.flightTime = this.distance / aircraft.speed;
    }
    
    // Calcola domanda
    this.demand = this.calculateDemand(originAirport, destinationAirport);
    
    // Calcola prezzo suggerito
    this.ticketPrice = this.calculateOptimalPrice();
    
    console.log('Rotta creata: ' + this.origin + ' → ' + this.destination + 
                ' (' + this.distance + 'km, €' + this.ticketPrice + ')');
};

Route.prototype.calculateDistance = function(origin, destination) {
    var R = 6371; // Raggio della Terra in km
    var lat1Rad = origin.latitude * Math.PI / 180;
    var lat2Rad = destination.latitude * Math.PI / 180;
    var deltaLatRad = (destination.latitude - origin.latitude) * Math.PI / 180;
    var deltaLonRad = (destination.longitude - origin.longitude) * Math.PI / 180;
    
    var a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return Math.round(R * c);
};

Route.prototype.calculateDemand = function(origin, destination) {
    var baseDemand = (origin.demandLevel + destination.demandLevel) / 2;
    
    // Fattore distanza
    var distanceFactor = 1;
    if (this.distance < 500) distanceFactor = 0.7;
    else if (this.distance > 10000) distanceFactor = 0.8;
    
    // Fattore competizione
    var competitionFactor = Math.max(0.3, 1 - (origin.competitionLevel / 100));
    
    return Math.round(baseDemand * distanceFactor * competitionFactor);
};

Route.prototype.calculateOptimalPrice = function() {
    var basePrice = 0.1; // €0.1 per km base
    var distancePrice = this.distance * basePrice;
    
    // Fattori di aggiustamento
    var demandFactor = this.demand / 50; // normalizzato
    var competitionFactor = Math.max(0.7, 1 - (this.competition / 100));
    
    return Math.round(distancePrice * demandFactor * competitionFactor);
};

Route.prototype.getAircraft = function() {
    // Simuliamo l'ottenimento dell'aeromobile
    // In un gioco reale, questo prenderebbe da FleetManager
    return AircraftData.getAircraftByType('a320'); // Per ora usa A320 di default
};

Route.prototype.getOriginAirport = function() {
    return AirportData.getAirportByCode(this.origin);
};

Route.prototype.getDestinationAirport = function() {
    return AirportData.getAirportByCode(this.destination);
};

Route.prototype.simulateFlight = function() {
    if (!this.isActive) return null;
    
    var aircraft = this.getAircraft();
    if (!aircraft) return null;
    
    // Simula riempimento basato su domanda e prezzo
    var maxPassengers = Math.min(aircraft.capacity, this.demand);
    var priceAttractiveness = Math.max(0.2, 1 - (this.ticketPrice / (this.distance * 0.2)));
    var actualPassengers = Math.floor(maxPassengers * priceAttractiveness * Math.random() * 1.2);
    actualPassengers = Math.min(actualPassengers, aircraft.capacity);
    
    // Calcola costi
    var fuelCost = this.distance * aircraft.fuelConsumption * 0.8;
    var airportFees = 1000; // Semplificato
    var crewCost = 500; // Semplificato
    var totalExpenses = fuelCost + airportFees + crewCost;
    
    // Calcola ricavi
    var revenue = actualPassengers * this.ticketPrice;
    var profit = revenue - totalExpenses;
    
    // Aggiorna statistiche
    this.totalFlights++;
    this.totalPassengers += actualPassengers;
    this.totalRevenue += revenue;
    this.totalExpenses += totalExpenses;
    this.loadFactor = this.totalPassengers / (this.totalFlights * aircraft.capacity) * 100;
    this.profitability = ((this.totalRevenue - this.totalExpenses) / this.totalRevenue) * 100;
    
    return {
        passengers: actualPassengers,
        revenue: revenue,
        expenses: totalExpenses,
        profit: profit,
        loadFactor: (actualPassengers / aircraft.capacity) * 100
    };
};

Route.prototype.setTicketPrice = function(price) {
    this.ticketPrice = Math.max(10, price); // Minimo €10
};

Route.prototype.setFrequency = function(frequency) {
    this.frequency = Math.max(1, Math.min(21, frequency)); // 1-21 voli/settimana
};

Route.prototype.activate = function() {
    this.isActive = true;
};

Route.prototype.deactivate = function() {
    this.isActive = false;
};

Route.prototype.getWeeklyProfit = function() {
    if (this.totalFlights === 0) return 0;
    var avgProfitPerFlight = (this.totalRevenue - this.totalExpenses) / this.totalFlights;
    return avgProfitPerFlight * this.frequency;
};

Route.prototype.isProfitable = function() {
    return this.totalRevenue > this.totalExpenses;
};

Route.prototype.toSaveData = function() {
    return {
        id: this.id,
        origin: this.origin,
        destination: this.destination,
        aircraftId: this.aircraftId,
        frequency: this.frequency,
        ticketPrice: this.ticketPrice,
        isActive: this.isActive,
        totalFlights: this.totalFlights,
        totalPassengers: this.totalPassengers,
        totalRevenue: this.totalRevenue,
        totalExpenses: this.totalExpenses,
        loadFactor: this.loadFactor,
        profitability: this.profitability,
        reputation: this.reputation,
        established: this.established.toISOString()
    };
};

Route.prototype.loadFromData = function(data) {
    this.id = data.id;
    this.frequency = data.frequency || 7;
    this.ticketPrice = data.ticketPrice || 0;
    this.isActive = data.isActive !== false;
    this.totalFlights = data.totalFlights || 0;
    this.totalPassengers = data.totalPassengers || 0;
    this.totalRevenue = data.totalRevenue || 0;
    this.totalExpenses = data.totalExpenses || 0;
    this.loadFactor = data.loadFactor || 0;
    this.profitability = data.profitability || 0;
    this.reputation = data.reputation || 50;
    this.established = new Date(data.established || Date.now());
};

Route.prototype.toString = function() {
    return this.origin + ' → ' + this.destination + 
           ' (€' + this.ticketPrice + ', ' + this.frequency + 'x/settimana)';
};

// Rendi disponibile globalmente
window.Route = Route;

console.log('✅ Route compatibile caricato');
