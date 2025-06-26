// Classe per rappresentare un aeroporto
class Airport {
    constructor(data) {
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
        
        // Costi operativi
        this.landingFee = data.landingFee || this.calculateLandingFee();
        this.parkingFee = data.parkingFee || this.calculateParkingFee();
        this.fuelPrice = data.fuelPrice || this.calculateFuelPrice();
        
        // Stato dell'aeroporto
        this.hasSlots = data.hasSlots !== false; // disponibilità slot
        this.weatherCondition = 'clear'; // 'clear', 'cloudy', 'rain', 'storm'
        this.isOpen = true;
        
        // Statistiche di traffico
        this.passengerTraffic = data.passengerTraffic || this.calculatePassengerTraffic();
        this.cargoTraffic = data.cargoTraffic || 0;
        
        // Relazioni con altri aeroporti
        this.connections = []; // array di codici aeroporto collegati
        this.distances = new Map(); // mappa delle distanze verso altri aeroporti
    }
    
    calculateLandingFee() {
        const baseFee = 500;
        const sizeMultiplier = {
            'small': 0.5,
            'medium': 1,
            'large': 1.5,
            'hub': 2
        };
        
        return baseFee * (sizeMultiplier[this.size] || 1) * (this.economicLevel / 50);
    }
    
    calculateParkingFee() {
        return this.landingFee * 0.1; // 10% della tassa di atterraggio
    }
    
    calculateFuelPrice() {
        const basePrice = 0.8; // €0.80 per litro
        const locationMultiplier = this.economicLevel / 50;
        const sizeDiscount = {
            'small': 1.2,
            'medium': 1,
            'large': 0.9,
            'hub': 0.8
        };
        
        return basePrice * locationMultiplier * (sizeDiscount[this.size] || 1);
    }
    
    calculatePassengerTraffic() {
        const baseTraffic = {
            'small': 50000,
            'medium': 500000,
            'large': 2000000,
            'hub': 10000000
        };
        
        return (baseTraffic[this.size] || 500000) * (this.demandLevel / 50);
    }
    
    // Calcola la distanza verso un altro aeroporto
    calculateDistanceTo(otherAirport) {
        if (this.distances.has(otherAirport.code)) {
            return this.distances.get(otherAirport.code);
        }
        
        const R = 6371; // Raggio della Terra in km
        const dLat = this.toRadians(otherAirport.latitude - this.latitude);
        const dLon = this.toRadians(otherAirport.longitude - this.longitude);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(otherAirport.latitude)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Salva nella cache
        this.distances.set(otherAirport.code, distance);
        
        return distance;
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Verifica se può accettare un tipo di aeromobile
    canAcceptAircraft(aircraft) {
        const aircraftSizes = {
            'regional': 'small',
            'narrow-body': 'medium',
            'wide-body': 'large',
            'cargo': 'large'
        };
        
        const sizeHierarchy = ['small', 'medium', 'large'];
        const aircraftSize = aircraftSizes[aircraft.type] || 'medium';
        const maxIndex = sizeHierarchy.indexOf(this.maxAircraftSize);
        const aircraftIndex = sizeHierarchy.indexOf(aircraftSize);
        
        return aircraftIndex <= maxIndex && aircraft.range >= 0; // placeholder per logica più complessa
    }
    
    // Calcola la domanda per una destinazione
    getDemandTo(destinationAirport) {
        const distance = this.calculateDistanceTo(destinationAirport);
        const baseDemand = Math.min(this.passengerTraffic, destinationAirport.passengerTraffic) / 10000;
        
        // Fattori che influenzano la domanda
        const distanceFactor = this.getDistanceFactor(distance);
        const economicFactor = (this.economicLevel + destinationAirport.economicLevel) / 100;
        const competitionFactor = 1 - (this.competitionLevel / 200); // meno competizione = più domanda
        
        const continentBonus = this.continent === destinationAirport.continent ? 1.2 : 1.0;
        const hubBonus = (this.size === 'hub' || destinationAirport.size === 'hub') ? 1.3 : 1.0;
        
        return Math.round(baseDemand * distanceFactor * economicFactor * competitionFactor * continentBonus * hubBonus);
    }
    
    getDistanceFactor(distance) {
        if (distance < 500) return 1.5; // rotte regionali molto richieste
        if (distance < 1500) return 1.2; // rotte nazionali/europee
        if (distance < 5000) return 1.0; // rotte continentali
        if (distance < 10000) return 0.8; // rotte intercontinentali
        return 0.6; // rotte molto lunghe
    }
    
    // Calcola il prezzo del biglietto suggerito
    getSuggestedTicketPrice(destinationAirport, aircraftType) {
        const distance = this.calculateDistanceTo(destinationAirport);
        const basePrice = 0.15; // €0.15 per km
        
        const distancePrice = distance * basePrice;
        const economicFactor = (this.economicLevel + destinationAirport.economicLevel) / 100;
        const competitionFactor = 1 + (this.competitionLevel / 100);
        
        const aircraftMultiplier = {
            'regional': 0.8,
            'narrow-body': 1.0,
            'wide-body': 1.3,
            'cargo': 0.5
        };
        
        return Math.round(distancePrice * economicFactor * competitionFactor * (aircraftMultiplier[aircraftType] || 1));
    }
    
    // Aggiorna le condizioni dell'aeroporto
    updateConditions() {
        // Simula cambiamenti meteorologici
        const weatherChance = Math.random();
        if (weatherChance < 0.05) {
            this.weatherCondition = 'storm';
        } else if (weatherChance < 0.15) {
            this.weatherCondition = 'rain';
        } else if (weatherChance < 0.35) {
            this.weatherCondition = 'cloudy';
        } else {
            this.weatherCondition = 'clear';
        }
        
        // Le condizioni meteorologiche influenzano i costi e la puntualità
    }
    
    getWeatherImpact() {
        const impacts = {
            'clear': { delay: 0, costMultiplier: 1.0 },
            'cloudy': { delay: 5, costMultiplier: 1.02 },
            'rain': { delay: 15, costMultiplier: 1.05 },
            'storm': { delay: 60, costMultiplier: 1.2 }
        };
        
        return impacts[this.weatherCondition] || impacts['clear'];
    }
    
    // Informazioni per l'interfaccia
    getDisplayInfo() {
        return {
            code: this.code,
            name: this.name,
            city: this.city,
            country: this.country,
            size: this.size,
            demandLevel: this.demandLevel,
            competitionLevel: this.competitionLevel,
            economicLevel: this.economicLevel,
            landingFee: this.landingFee,
            fuelPrice: this.fuelPrice,
            weatherCondition: this.weatherCondition,
            passengerTraffic: this.passengerTraffic
        };
    }
    
    getSizeText() {
        const sizes = {
            'small': 'Piccolo',
            'medium': 'Medio',
            'large': 'Grande',
            'hub': 'Hub Internazionale'
        };
        return sizes[this.size] || 'Medio';
    }
    
    getWeatherText() {
        const weather = {
            'clear': '☀️ Sereno',
            'cloudy': '☁️ Nuvoloso',
            'rain': '🌧️ Pioggia',
            'storm': '⛈️ Tempesta'
        };
        return weather[this.weatherCondition] || '☀️ Sereno';
    }
}
