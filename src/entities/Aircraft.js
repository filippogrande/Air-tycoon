// Classe Aircraft compatibile con tutti i browser
console.log('📂 Caricamento Aircraft.js...');

function Aircraft(type, customName) {
    // Compatibilità parametri di default
    if (customName === undefined) customName = null;
    
    var aircraftData = AircraftData.getAircraftByType(type);
    if (!aircraftData) {
        throw new Error('Tipo di aeromobile non valido: ' + type);
    }
    
    this.id = this.generateId();
    this.type = type;
    this.name = customName || aircraftData.name;
    this.model = aircraftData.model;
    this.manufacturer = aircraftData.manufacturer;
    
    // Caratteristiche tecniche
    this.capacity = aircraftData.capacity;
    this.range = aircraftData.range; // km
    this.speed = aircraftData.speed; // km/h
    this.fuelConsumption = aircraftData.fuelConsumption; // litri per km
    this.purchasePrice = aircraftData.price;
    this.maintenanceCost = aircraftData.maintenanceCost; // per volo
    this.yearIntroduced = aircraftData.yearIntroduced;
    
    // Stato operativo
    this.condition = 100; // 0-100%
    this.totalFlightHours = 0;
    this.totalFlights = 0;
    this.location = null; // Airport object
    this.status = 'available'; // available, flying, maintenance, retired
    
    // Finanze
    this.totalRevenue = 0;
    this.totalExpenses = 0;
    this.lastMaintenanceDate = new Date();
    this.nextMaintenanceHours = 100;
    
    // Storico
    this.purchaseDate = new Date();
    this.routes = []; // Array di Route IDs
}

// Metodi del prototipo (compatibili)
Aircraft.prototype.generateId = function() {
    return 'aircraft_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

Aircraft.prototype.fly = function(distance, passengers, ticketPrice) {
    if (passengers === undefined) passengers = 0;
    if (ticketPrice === undefined) ticketPrice = 0;
    
    if (this.status !== 'available') {
        throw new Error('Aeromobile non disponibile per il volo');
    }
    
    var flightHours = distance / this.speed;
    var fuelCost = distance * this.fuelConsumption * 0.8; // €0.8 per litro
    var revenue = passengers * ticketPrice;
    var expenses = fuelCost + this.maintenanceCost;
    
    // Aggiorna statistiche
    this.totalFlightHours += flightHours;
    this.totalFlights += 1;
    this.totalRevenue += revenue;
    this.totalExpenses += expenses;
    
    // Degrado condizione
    var conditionLoss = Math.max(0.1, distance / 10000);
    this.condition = Math.max(0, this.condition - conditionLoss);
    
    // Controllo manutenzione
    this.nextMaintenanceHours -= flightHours;
    if (this.nextMaintenanceHours <= 0) {
        this.status = 'maintenance_required';
    }
    
    return {
        flightHours: flightHours,
        fuelCost: fuelCost,
        revenue: revenue,
        expenses: expenses,
        profit: revenue - expenses
    };
};

Aircraft.prototype.performMaintenance = function() {
    var cost = this.purchasePrice * 0.02; // 2% del prezzo d'acquisto
    
    this.condition = Math.min(100, this.condition + 20);
    this.nextMaintenanceHours = 100;
    this.lastMaintenanceDate = new Date();
    this.status = 'available';
    this.totalExpenses += cost;
    
    return cost;
};

Aircraft.prototype.getAge = function() {
    var now = new Date();
    var ageMs = now - this.purchaseDate;
    return Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000)); // anni
};

Aircraft.prototype.getProfitability = function() {
    if (this.totalRevenue === 0) return 0;
    return ((this.totalRevenue - this.totalExpenses) / this.totalRevenue) * 100;
};

Aircraft.prototype.needsMaintenance = function() {
    return this.condition < 70 || this.nextMaintenanceHours <= 0;
};

Aircraft.prototype.canFly = function(distance) {
    return this.status === 'available' && 
           this.condition >= 30 && 
           distance <= this.range;
};

Aircraft.prototype.retire = function() {
    this.status = 'retired';
    var sellPrice = this.purchasePrice * Math.max(0.1, (this.condition / 100) * 0.5);
    return sellPrice;
};

Aircraft.prototype.toSaveData = function() {
    return {
        id: this.id,
        type: this.type,
        name: this.name,
        condition: this.condition,
        totalFlightHours: this.totalFlightHours,
        totalFlights: this.totalFlights,
        location: this.location ? this.location.code : null,
        status: this.status,
        totalRevenue: this.totalRevenue,
        totalExpenses: this.totalExpenses,
        lastMaintenanceDate: this.lastMaintenanceDate.toISOString(),
        nextMaintenanceHours: this.nextMaintenanceHours,
        purchaseDate: this.purchaseDate.toISOString(),
        routes: this.routes.slice()
    };
};

Aircraft.prototype.loadFromData = function(data) {
    this.id = data.id;
    this.condition = data.condition || 100;
    this.totalFlightHours = data.totalFlightHours || 0;
    this.totalFlights = data.totalFlights || 0;
    this.status = data.status || 'available';
    this.totalRevenue = data.totalRevenue || 0;
    this.totalExpenses = data.totalExpenses || 0;
    this.lastMaintenanceDate = new Date(data.lastMaintenanceDate || Date.now());
    this.nextMaintenanceHours = data.nextMaintenanceHours || 100;
    this.purchaseDate = new Date(data.purchaseDate || Date.now());
    this.routes = data.routes || [];
};

// Rendi disponibile globalmente
window.Aircraft = Aircraft;

console.log('✅ Aircraft compatibile caricato');
