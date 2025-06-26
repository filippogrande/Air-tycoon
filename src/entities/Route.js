// Classe per rappresentare una rotta aerea
class Route {
    constructor(originCode, destinationCode, aircraftId) {
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
        this.totalCosts = 0;
        this.averageLoadFactor = 0; // percentuale di riempimento
        this.onTimePerformance = 100; // percentuale di puntualità
        
        // Stato della rotta
        this.status = 'planning'; // 'planning', 'active', 'suspended'
        this.lastFlightDate = null;
        this.nextFlightDate = null;
        
        this.createdDate = new Date();
        this.setupRoute();
    }
    
    generateId() {
        return 'RT_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    setupRoute() {
        const originAirport = AirportData.getAirportByCode(this.origin);
        const destinationAirport = AirportData.getAirportByCode(this.destination);
        
        if (!originAirport || !destinationAirport) {
            console.error('Aeroporti non trovati per la rotta:', this.origin, this.destination);
            return;
        }
        
        // Calcola distanza e tempo di volo
        this.distance = originAirport.calculateDistanceTo(destinationAirport);
        
        // Calcola domanda e prezzo suggerito
        this.demand = originAirport.getDemandTo(destinationAirport);
        this.ticketPrice = originAirport.getSuggestedTicketPrice(destinationAirport, 'narrow-body');
        
        console.log(`🛣️ Rotta creata: ${this.origin} → ${this.destination} (${Math.round(this.distance)}km)`);
    }
    
    // Calcola i ricavi potenziali per volo
    calculateRevenuePerFlight(aircraft) {
        if (!aircraft) return 0;
        
        const loadFactor = this.calculateLoadFactor();
        const passengers = Math.round(aircraft.capacity * loadFactor);
        
        return passengers * this.ticketPrice;
    }
    
    // Calcola i costi per volo
    calculateCostPerFlight(aircraft) {
        if (!aircraft) return 0;
        
        const originAirport = AirportData.getAirportByCode(this.origin);
        const destinationAirport = AirportData.getAirportByCode(this.destination);
        
        if (!originAirport || !destinationAirport) return 0;
        
        this.flightTime = aircraft.getFlightTime(this.distance);
        
        // Costi operativi
        const operatingCost = aircraft.getOperatingCostPerHour() * this.flightTime;
        
        // Tasse aeroportuali
        const landingFees = originAirport.landingFee + destinationAirport.landingFee;
        const parkingFees = (originAirport.parkingFee + destinationAirport.parkingFee) * 2; // andata e ritorno
        
        // Costo carburante
        const fuelNeeded = aircraft.fuelConsumption * this.distance;
        const avgFuelPrice = (originAirport.fuelPrice + destinationAirport.fuelPrice) / 2;
        const fuelCost = fuelNeeded * avgFuelPrice;
        
        // Costi dell'equipaggio (stimati)
        const crewCost = this.flightTime * 200; // €200 per ora per l'equipaggio
        
        return operatingCost + landingFees + parkingFees + fuelCost + crewCost;
    }
    
    // Calcola il fattore di carico (percentuale di riempimento)
    calculateLoadFactor() {
        // Fattore base basato sulla domanda
        const demandFactor = Math.min(1, this.demand / 200);
        
        // Fattore prezzo (prezzi più bassi = più passeggeri)
        const avgPrice = 150; // prezzo medio di riferimento
        const priceFactor = Math.max(0.3, Math.min(1.2, avgPrice / this.ticketPrice));
        
        // Fattore concorrenza
        const competitionFactor = Math.max(0.5, 1 - (this.competition / 100));
        
        // Fattore frequenza (più voli = più conveniente)
        const frequencyFactor = Math.min(1.2, this.frequency / 7);
        
        // Fattore stagionale e casuale
        const randomFactor = 0.8 + Math.random() * 0.4; // ±20% di variazione
        
        const loadFactor = demandFactor * priceFactor * competitionFactor * frequencyFactor * randomFactor;
        
        return Math.max(0.1, Math.min(1, loadFactor));
    }
    
    // Calcola il profitto per volo
    calculateProfitPerFlight(aircraft) {
        const revenue = this.calculateRevenuePerFlight(aircraft);
        const cost = this.calculateCostPerFlight(aircraft);
        
        return revenue - cost;
    }
    
    // Calcola il profitto mensile stimato
    calculateMonthlyProfit(aircraft) {
        const profitPerFlight = this.calculateProfitPerFlight(aircraft);
        const flightsPerMonth = (this.frequency * 4.33); // 4.33 settimane per mese
        
        return profitPerFlight * flightsPerMonth;
    }
    
    // Simula l'esecuzione di un volo
    executeFlight(aircraft) {
        if (!aircraft || aircraft.status !== 'available') {
            return false;
        }
        
        const loadFactor = this.calculateLoadFactor();
        const passengers = Math.round(aircraft.capacity * loadFactor);
        const revenue = passengers * this.ticketPrice;
        const cost = this.calculateCostPerFlight(aircraft);
        const profit = revenue - cost;
        
        // Aggiorna statistiche della rotta
        this.totalFlights++;
        this.totalPassengers += passengers;
        this.totalRevenue += revenue;
        this.totalCosts += cost;
        this.averageLoadFactor = (this.averageLoadFactor * (this.totalFlights - 1) + loadFactor) / this.totalFlights;
        
        // Aggiorna l'aeromobile
        aircraft.updateCondition(this.flightTime);
        aircraft.completeFlight(passengers, revenue);
        
        // Aggiorna date
        this.lastFlightDate = new Date();
        this.calculateNextFlightDate();
        
        // Simula la puntualità
        this.updateOnTimePerformance();
        
        console.log(`✈️ Volo completato: ${this.origin}-${this.destination}, ${passengers} passeggeri, €${Math.round(profit)} profitto`);
        
        return {
            passengers,
            revenue,
            cost,
            profit,
            loadFactor
        };
    }
    
    calculateNextFlightDate() {
        if (!this.lastFlightDate) {
            this.nextFlightDate = new Date();
            return;
        }
        
        const daysUntilNext = 7 / this.frequency; // giorni tra i voli
        this.nextFlightDate = new Date(this.lastFlightDate.getTime() + (daysUntilNext * 24 * 60 * 60 * 1000));
    }
    
    updateOnTimePerformance() {
        const originAirport = AirportData.getAirportByCode(this.origin);
        const destinationAirport = AirportData.getAirportByCode(this.destination);
        
        let delayMinutes = 0;
        
        if (originAirport) {
            delayMinutes += originAirport.getWeatherImpact().delay;
        }
        if (destinationAirport) {
            delayMinutes += destinationAirport.getWeatherImpact().delay;
        }
        
        // Considera il volo puntuale se il ritardo è < 15 minuti
        const isOnTime = delayMinutes < 15;
        
        // Aggiorna la media della puntualità
        this.onTimePerformance = (this.onTimePerformance * (this.totalFlights - 1) + (isOnTime ? 100 : 0)) / this.totalFlights;
    }
    
    // Modifica la frequenza dei voli
    setFrequency(newFrequency) {
        this.frequency = Math.max(1, Math.min(21, newFrequency)); // 1-21 voli per settimana
        this.calculateNextFlightDate();
    }
    
    // Modifica il prezzo del biglietto
    setTicketPrice(newPrice) {
        this.ticketPrice = Math.max(10, newPrice); // minimo €10
    }
    
    // Sospende la rotta
    suspend() {
        this.status = 'suspended';
        this.isActive = false;
    }
    
    // Riattiva la rotta
    activate() {
        this.status = 'active';
        this.isActive = true;
        this.calculateNextFlightDate();
    }
    
    // Dati per il salvataggio
    toSaveData() {
        return {
            id: this.id,
            origin: this.origin,
            destination: this.destination,
            aircraftId: this.aircraftId,
            frequency: this.frequency,
            ticketPrice: this.ticketPrice,
            isActive: this.isActive,
            status: this.status,
            totalFlights: this.totalFlights,
            totalPassengers: this.totalPassengers,
            totalRevenue: this.totalRevenue,
            totalCosts: this.totalCosts,
            averageLoadFactor: this.averageLoadFactor,
            onTimePerformance: this.onTimePerformance,
            lastFlightDate: this.lastFlightDate ? this.lastFlightDate.toISOString() : null,
            nextFlightDate: this.nextFlightDate ? this.nextFlightDate.toISOString() : null,
            createdDate: this.createdDate.toISOString()
        };
    }
    
    // Carica dati salvati
    loadFromData(data) {
        this.id = data.id;
        this.frequency = data.frequency;
        this.ticketPrice = data.ticketPrice;
        this.isActive = data.isActive;
        this.status = data.status;
        this.totalFlights = data.totalFlights;
        this.totalPassengers = data.totalPassengers;
        this.totalRevenue = data.totalRevenue;
        this.totalCosts = data.totalCosts;
        this.averageLoadFactor = data.averageLoadFactor;
        this.onTimePerformance = data.onTimePerformance;
        this.lastFlightDate = data.lastFlightDate ? new Date(data.lastFlightDate) : null;
        this.nextFlightDate = data.nextFlightDate ? new Date(data.nextFlightDate) : null;
        this.createdDate = new Date(data.createdDate);
    }
    
    // Informazioni per l'interfaccia
    getDisplayInfo() {
        return {
            id: this.id,
            origin: this.origin,
            destination: this.destination,
            distance: Math.round(this.distance),
            frequency: this.frequency,
            ticketPrice: this.ticketPrice,
            demand: this.demand,
            averageLoadFactor: Math.round(this.averageLoadFactor * 100),
            onTimePerformance: Math.round(this.onTimePerformance),
            totalFlights: this.totalFlights,
            totalProfit: this.totalRevenue - this.totalCosts,
            status: this.getStatusText(),
            isActive: this.isActive
        };
    }
    
    getStatusText() {
        switch (this.status) {
            case 'planning': return 'In pianificazione';
            case 'active': return 'Attiva';
            case 'suspended': return 'Sospesa';
            default: return 'Sconosciuto';
        }
    }
    
    getRouteName() {
        return `${this.origin} → ${this.destination}`;
    }
}
