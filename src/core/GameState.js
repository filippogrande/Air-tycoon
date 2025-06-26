// Gestisce lo stato del gioco
console.log('📂 Caricamento GameState.js...');

class GameState {
    constructor() {
        this.company = {
            name: "Air Express",
            money: 1000000,
            reputation: 50,
            founded: new Date(),
            baseAirport: null
        };
        
        this.gameTime = new GameTime();
        this.fleet = []; // Array di aeromobili
        this.routes = []; // Array di rotte
        this.research = {
            points: 0,
            completedProjects: [],
            activeProject: null
        };
        
        this.statistics = {
            totalPassengers: 0,
            totalFlights: 0,
            totalRevenue: 0,
            totalExpenses: 0
        };
    }
    
    toSaveData() {
        return {
            company: { ...this.company },
            gameTime: this.gameTime.toSaveData(),
            fleet: this.fleet.map(aircraft => aircraft.toSaveData()),
            routes: this.routes.map(route => route.toSaveData()),
            research: { ...this.research },
            statistics: { ...this.statistics },
            saveDate: new Date().toISOString()
        };
    }
    
    loadFromData(data) {
        if (data.company) {
            this.company = { ...data.company };
            this.company.founded = new Date(this.company.founded);
        }
        
        if (data.gameTime) {
            this.gameTime.loadFromData(data.gameTime);
        }
        
        if (data.fleet) {
            this.fleet = data.fleet.map(aircraftData => {
                const aircraft = new Aircraft(aircraftData.type, aircraftData.name);
                aircraft.loadFromData(aircraftData);
                return aircraft;
            });
        }
        
        if (data.routes) {
            this.routes = data.routes.map(routeData => {
                const route = new Route(routeData.origin, routeData.destination, routeData.aircraftId);
                route.loadFromData(routeData);
                return route;
            });
        }
        
        if (data.research) {
            this.research = { ...data.research };
        }
        
        if (data.statistics) {
            this.statistics = { ...data.statistics };
        }
        
        console.log('📊 Stato del gioco caricato:', data.saveDate);
    }
}

// Gestisce il tempo di gioco
class GameTime {
    constructor() {
        this.date = new Date(2024, 0, 1); // Inizia dal 1 gennaio 2024
        this.speed = 1; // Moltiplicatore di velocità
    }
    
    addHours(hours) {
        this.date.setTime(this.date.getTime() + (hours * 60 * 60 * 1000));
    }
    
    addDays(days) {
        this.addHours(days * 24);
    }
    
    addMonths(months) {
        this.date.setMonth(this.date.getMonth() + months);
    }
    
    getYear() {
        return this.date.getFullYear();
    }
    
    getMonth() {
        return this.date.getMonth() + 1; // 1-12
    }
    
    getDay() {
        return this.date.getDate();
    }
    
    getHour() {
        return this.date.getHours();
    }
    
    isNewMonth(previousDate) {
        return this.date.getMonth() !== previousDate.getMonth() || 
               this.date.getFullYear() !== previousDate.getFullYear();
    }
    
    isNewYear(previousDate) {
        return this.date.getFullYear() !== previousDate.getFullYear();
    }
    
    toSaveData() {
        return {
            date: this.date.toISOString(),
            speed: this.speed
        };
    }
    
    loadFromData(data) {
        this.date = new Date(data.date);
        this.speed = data.speed || 1;
    }
    
    formatDate() {
        return this.date.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    formatTime() {
        return this.date.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
