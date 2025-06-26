// Classe per rappresentare un aeromobile
class Aircraft {
    constructor(type, customName = null) {
        const aircraftData = AircraftData.getAircraftByType(type);
        if (!aircraftData) {
            throw new Error(`Tipo di aeromobile non valido: ${type}`);
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
        
        // Stato dell'aeromobile
        this.condition = 100; // 0-100, degrada nel tempo
        this.age = 0; // anni
        this.totalFlightHours = 0;
        this.maintenanceCost = aircraftData.maintenanceCost || this.purchasePrice * 0.001; // costo per ora
        
        // Stato operativo
        this.status = 'available'; // 'available', 'in-flight', 'maintenance'
        this.currentRoute = null;
        this.assignedRoute = null;
        this.location = null; // codice aeroporto dove si trova
        
        // Statistiche
        this.totalPassengers = 0;
        this.totalRevenue = 0;
        this.totalFlights = 0;
        
        this.purchaseDate = new Date();
    }
    
    generateId() {
        return 'AC_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    // Calcola i costi operativi per ora di volo
    getOperatingCostPerHour() {
        const baseCost = this.maintenanceCost;
        const fuelCost = this.fuelConsumption * 0.8; // €0.80 per litro
        const conditionMultiplier = 1 + (100 - this.condition) / 100;
        
        return (baseCost + fuelCost) * conditionMultiplier;
    }
    
    // Calcola il tempo di volo tra due aeroporti
    getFlightTime(distance) {
        return distance / this.speed; // ore
    }
    
    // Verifica se può volare la distanza richiesta
    canFlyDistance(distance) {
        return distance <= this.range;
    }
    
    // Aggiorna la condizione dell'aeromobile
    updateCondition(flightHours) {
        const wear = flightHours * 0.01; // 0.01% di usura per ora di volo
        this.condition = Math.max(0, this.condition - wear);
        this.totalFlightHours += flightHours;
    }
    
    // Esegue manutenzione
    performMaintenance() {
        const maintenanceCost = this.purchasePrice * 0.05; // 5% del prezzo di acquisto
        this.condition = Math.min(100, this.condition + 25);
        this.status = 'available';
        
        return maintenanceCost;
    }
    
    // Verifica se necessita manutenzione
    needsMaintenance() {
        return this.condition < 30;
    }
    
    // Assegna a una rotta
    assignToRoute(route) {
        this.assignedRoute = route;
        this.status = 'assigned';
    }
    
    // Rimuove dall'assegnazione
    unassignFromRoute() {
        this.assignedRoute = null;
        this.status = 'available';
    }
    
    // Inizia un volo
    startFlight(route) {
        this.status = 'in-flight';
        this.currentRoute = route;
    }
    
    // Completa un volo
    completeFlight(passengers, revenue) {
        this.status = 'available';
        this.currentRoute = null;
        this.totalFlights++;
        this.totalPassengers += passengers;
        this.totalRevenue += revenue;
    }
    
    // Calcola il valore di rivendita
    getResaleValue() {
        const ageDepreciation = Math.pow(0.9, this.age); // 10% all'anno
        const conditionMultiplier = this.condition / 100;
        
        return this.purchasePrice * ageDepreciation * conditionMultiplier;
    }
    
    // Dati per il salvataggio
    toSaveData() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            condition: this.condition,
            age: this.age,
            totalFlightHours: this.totalFlightHours,
            status: this.status,
            assignedRoute: this.assignedRoute,
            location: this.location,
            totalPassengers: this.totalPassengers,
            totalRevenue: this.totalRevenue,
            totalFlights: this.totalFlights,
            purchaseDate: this.purchaseDate.toISOString()
        };
    }
    
    // Carica dati salvati
    loadFromData(data) {
        this.id = data.id;
        this.condition = data.condition;
        this.age = data.age;
        this.totalFlightHours = data.totalFlightHours;
        this.status = data.status;
        this.assignedRoute = data.assignedRoute;
        this.location = data.location;
        this.totalPassengers = data.totalPassengers;
        this.totalRevenue = data.totalRevenue;
        this.totalFlights = data.totalFlights;
        this.purchaseDate = new Date(data.purchaseDate);
        
        if (data.name !== this.name) {
            this.name = data.name; // Nome personalizzato
        }
    }
    
    // Informazioni per l'interfaccia
    getDisplayInfo() {
        return {
            id: this.id,
            name: this.name,
            model: this.model,
            manufacturer: this.manufacturer,
            capacity: this.capacity,
            range: this.range,
            speed: this.speed,
            condition: Math.round(this.condition),
            status: this.getStatusText(),
            totalFlights: this.totalFlights,
            totalPassengers: this.totalPassengers,
            efficiency: this.getEfficiencyRating()
        };
    }
    
    getStatusText() {
        switch (this.status) {
            case 'available': return 'Disponibile';
            case 'in-flight': return 'In volo';
            case 'maintenance': return 'In manutenzione';
            case 'assigned': return 'Assegnato';
            default: return 'Sconosciuto';
        }
    }
    
    getEfficiencyRating() {
        const conditionFactor = this.condition / 100;
        const utilizationFactor = this.totalFlights > 0 ? Math.min(1, this.totalFlights / 100) : 0;
        
        return Math.round((conditionFactor + utilizationFactor) * 50);
    }
}
