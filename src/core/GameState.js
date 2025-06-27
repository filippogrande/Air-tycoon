// GameState compatibile con tutti i browser
console.log('📂 Caricamento GameState.js...');

// Prima definiamo GameTime
function GameTime() {
    this.date = new Date(2024, 0, 1); // Inizia dal 1 gennaio 2024
    this.speed = 1; // Moltiplicatore di velocità
}

GameTime.prototype.addHours = function(hours) {
    this.date.setTime(this.date.getTime() + (hours * 60 * 60 * 1000));
};

GameTime.prototype.addDays = function(days) {
    this.addHours(days * 24);
};

GameTime.prototype.addMonths = function(months) {
    this.date.setMonth(this.date.getMonth() + months);
};

GameTime.prototype.getYear = function() {
    return this.date.getFullYear();
};

GameTime.prototype.getMonth = function() {
    return this.date.getMonth() + 1; // 1-12
};

GameTime.prototype.getDay = function() {
    return this.date.getDate();
};

GameTime.prototype.getHour = function() {
    return this.date.getHours();
};

GameTime.prototype.isNewMonth = function(previousDate) {
    return this.date.getMonth() !== previousDate.getMonth() || 
           this.date.getFullYear() !== previousDate.getFullYear();
};

GameTime.prototype.isNewYear = function(previousDate) {
    return this.date.getFullYear() !== previousDate.getFullYear();
};

GameTime.prototype.toSaveData = function() {
    return {
        date: this.date.toISOString(),
        speed: this.speed
    };
};

GameTime.prototype.loadFromData = function(data) {
    this.date = new Date(data.date);
    this.speed = data.speed || 1;
};

GameTime.prototype.formatDate = function() {
    return this.date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

GameTime.prototype.formatTime = function() {
    return this.date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Ora definiamo GameState
function GameState() {
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
    
    // Proprietà di convenienza per accesso rapido
    this.money = this.company.money;
    this.gameDate = null; // Data di gioco aggiuntiva per funzionalità estese
}

GameState.prototype.toSaveData = function() {
    return {
        company: {
            name: this.company.name,
            money: this.company.money,
            reputation: this.company.reputation,
            founded: this.company.founded.toISOString(),
            baseAirport: this.company.baseAirport
        },
        gameTime: this.gameTime.toSaveData(),
        fleet: this.fleet.map(function(aircraft) {
            return aircraft.toSaveData ? aircraft.toSaveData() : aircraft;
        }),
        routes: this.routes.map(function(route) {
            return route.toSaveData ? route.toSaveData() : route;
        }),
        research: this.research,
        statistics: this.statistics,
        
        // Salva stati sistema estesi
        demandEstimationState: this.game && this.game.demandManager ? 
            this.game.demandManager.saveState() : null,
        infrastructureState: this.infrastructureManager ?
            this.infrastructureManager.saveState() : null,
        economyState: (typeof EconomyEngine !== 'undefined' && EconomyEngine.saveEconomyState) ?
            EconomyEngine.saveEconomyState() : null,
        weatherState: (typeof WeatherEngine !== 'undefined' && WeatherEngine.saveWeatherState) ?
            WeatherEngine.saveWeatherState() : null,
        
        saveDate: new Date().toISOString(),
        version: '1.0.0'
    };
};

GameState.prototype.loadFromData = function(data) {
    try {
        // Carica dati compagnia
        this.company.name = data.company.name || "Air Express";
        this.company.money = data.company.money || 1000000;
        this.company.reputation = data.company.reputation || 50;
        this.company.founded = new Date(data.company.founded || Date.now());
        this.company.baseAirport = data.company.baseAirport || null;
        
        // Carica tempo di gioco
        if (data.gameTime) {
            this.gameTime.loadFromData(data.gameTime);
        }
        
        // Carica flotta
        this.fleet = data.fleet || [];
        
        // Carica rotte
        this.routes = data.routes || [];
        
        // Carica ricerca
        this.research = data.research || {
            points: 0,
            completedProjects: [],
            activeProject: null
        };
        
        // Carica stati sistema estesi se presenti
        if (data.demandEstimationState && this.game && this.game.demandManager) {
            this.game.demandManager.loadState(data.demandEstimationState);
        }
        
        if (data.infrastructureState && this.infrastructureManager) {
            this.infrastructureManager.loadState(data.infrastructureState);
        }
        
        if (data.economyState && typeof EconomyEngine !== 'undefined' && EconomyEngine.loadEconomyState) {
            EconomyEngine.loadEconomyState(data.economyState);
        }
        
        if (data.weatherState && typeof WeatherEngine !== 'undefined' && WeatherEngine.loadWeatherState) {
            WeatherEngine.loadWeatherState(data.weatherState);
        }

        // Carica statistiche
        this.statistics = data.statistics || {
            totalPassengers: 0,
            totalFlights: 0,
            totalRevenue: 0,
            totalExpenses: 0
        };
        
        console.log('📊 Stato del gioco caricato:', data.saveDate);
    } catch (error) {
        console.error('❌ Errore durante il caricamento dello stato:', error);
        throw error;
    }
};

GameState.prototype.addMoney = function(amount) {
    this.company.money += amount;
    this.company.money = Math.max(0, this.company.money);
};

GameState.prototype.subtractMoney = function(amount) {
    if (this.company.money >= amount) {
        this.company.money -= amount;
        return true;
    }
    return false;
};

GameState.prototype.canAfford = function(amount) {
    return this.company.money >= amount;
};

GameState.prototype.addReputation = function(amount) {
    this.company.reputation = Math.max(0, Math.min(100, this.company.reputation + amount));
};

GameState.prototype.addAircraft = function(aircraft) {
    this.fleet.push(aircraft);
};

GameState.prototype.removeAircraft = function(aircraftId) {
    for (var i = this.fleet.length - 1; i >= 0; i--) {
        if (this.fleet[i].id === aircraftId) {
            this.fleet.splice(i, 1);
            break;
        }
    }
};

GameState.prototype.addRoute = function(route) {
    this.routes.push(route);
};

GameState.prototype.removeRoute = function(routeId) {
    for (var i = this.routes.length - 1; i >= 0; i--) {
        if (this.routes[i].id === routeId) {
            this.routes.splice(i, 1);
            break;
        }
    }
};

GameState.prototype.getNetWorth = function() {
    var fleetValue = 0;
    for (var i = 0; i < this.fleet.length; i++) {
        if (this.fleet[i].purchasePrice) {
            fleetValue += this.fleet[i].purchasePrice * (this.fleet[i].condition / 100) * 0.5;
        }
    }
    return this.company.money + fleetValue;
};

GameState.prototype.getMonthlyProfit = function() {
    var totalRevenue = 0;
    var totalExpenses = 0;
    
    for (var i = 0; i < this.routes.length; i++) {
        if (this.routes[i].getWeeklyProfit) {
            var weeklyProfit = this.routes[i].getWeeklyProfit();
            totalRevenue += Math.max(0, weeklyProfit) * 4.33; // settimane per mese
            totalExpenses += Math.max(0, -weeklyProfit) * 4.33;
        }
    }
    
    return totalRevenue - totalExpenses;
};

// Metodo per sincronizzare le proprietà di convenienza
GameState.prototype.syncConvenienceProperties = function() {
    this.money = this.company.money;
};

// Metodo per aggiornare denaro e sincronizzare
GameState.prototype.updateMoney = function(amount) {
    this.company.money = amount;
    this.money = amount;
};

// Metodo per spendere denaro
GameState.prototype.spendMoney = function(amount) {
    if (this.company.money >= amount) {
        this.company.money -= amount;
        this.money = this.company.money;
        return true;
    }
    return false;
};

// Metodo per guadagnare denaro
GameState.prototype.earnMoney = function(amount) {
    this.company.money += amount;
    this.money = this.company.money;
};

// Rendi disponibili globalmente
window.GameState = GameState;
window.GameTime = GameTime;

console.log('✅ GameState compatibile caricato');
