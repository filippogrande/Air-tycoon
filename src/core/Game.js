// Game compatibile con tutti i browser
console.log('📂 Caricamento Game.js...');

function Game(companyId) {
    console.log('🎮 Inizializzazione Game...');
    
    try {
        // Inizializza componenti
        this.state = new GameState(companyId);
        console.log('✅ GameState creato');
        
        this.fleetManager = new FleetManager(this.state);
        console.log('✅ FleetManager creato');
        
        this.routeManager = new RouteManager(this.state);
        console.log('✅ RouteManager creato');
        
        this.financeManager = new FinanceManager(this.state);
        console.log('✅ FinanceManager creato');
        
        this.hubManager = new HubManager(this.state);
        console.log('✅ HubManager creato');
        
        // Inizializza DemandEstimationManager
        this.demandManager = new DemandEstimationManager(this.state);
        console.log('✅ DemandEstimationManager creato');
        
        // Inizializza InfrastructureManager
        this.infrastructureManager = new InfrastructureManager(this.state);
        this.state.infrastructureManager = this.infrastructureManager; // Riferimento per altri manager
        console.log('✅ InfrastructureManager creato');
        
        // Inizializza EconomyEngine se disponibile
        if (typeof EconomyEngine !== 'undefined') {
            EconomyEngine.initialize(this.state);
            console.log('✅ EconomyEngine inizializzato');
        }
        
        this.uiManager = new UIManager(this);
        console.log('✅ UIManager creato');
        
        // Riferimento al RouteUIManager globale per coerenza
        this.routeUIManager = window.RouteUIManager;
        console.log('✅ RouteUIManager collegato');
        
        this.worldMap = new WorldMap(this);
        console.log('✅ WorldMap creato');
        
        this.isRunning = false;
        this.gameSpeed = 1; // 1x velocità normale
        this.lastUpdate = 0;
        
        console.log('🎮 Avvio inizializzazione...');
        this.init();
        
    } catch (error) {
        console.error('❌ Errore nel costruttore Game:', error);
        throw error;
    }
}

Game.prototype.init = function() {
    console.log('🛫 Air Tycoon 2 Clone - Inizializzazione...');
    
    try {
        console.log('🔄 Caricamento dati salvati...');
        // Carica dati salvati se esistenti
        var savedData = SaveLoad.loadGame();
        if (savedData) {
            this.state.loadFromData(savedData);
            console.log('💾 Dati salvati caricati');
        } else {
            console.log('🆕 Avvio nuovo gioco...');
            this.setupNewGame();
        }
        
        // Inizializza UI
        console.log('🎨 Inizializzazione UI...');
        try {
            this.uiManager.init();
            console.log('✅ UI inizializzata');
        } catch (error) {
            console.error('❌ Errore inizializzazione UI:', error);
            throw error;
        }
        
        console.log('🗺️ Inizializzazione WorldMap...');
        try {
            this.worldMap.init();
            console.log('✅ WorldMap inizializzata');
        } catch (error) {
            console.error('❌ Errore inizializzazione WorldMap:', error);
            throw error;
        }
        
        console.log('🔄 Aggiornamento UI...');
        try {
            this.updateUI();
            console.log('✅ UI aggiornata');
        } catch (error) {
            console.error('❌ Errore aggiornamento UI:', error);
            throw error;
        }
        
        // Avvia il game loop
        console.log('▶️ Avvio game loop...');
        try {
            this.start();
            console.log('✅ Game loop avviato');
        } catch (error) {
            console.error('❌ Errore avvio game loop:', error);
            throw error;
        }
        
        // Auto-save ogni 30 secondi
        var self = this;
        setInterval(function() {
            self.saveGame();
        }, 30000);
        
        console.log('✅ Gioco inizializzato correttamente');
        
    } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione:', error);
        throw error;
    }
};

Game.prototype.setupNewGame = function() {
    console.log('🆕 Setup nuova partita...');
    
    // Imposta valori iniziali per una nuova partita
    this.state.company.name = "Air Express";
    this.state.company.money = 1000000; // $1M iniziali
    this.state.company.reputation = 50;
    
    console.log('✅ Nuova partita configurata');
};

Game.prototype.start = function() {
    this.isRunning = true;
    this.lastUpdate = Date.now();
    this.gameLoop();
    console.log('▶️ Game loop avviato');
};

Game.prototype.pause = function() {
    this.isRunning = false;
    console.log('⏸️ Gioco in pausa');
};

Game.prototype.resume = function() {
    this.isRunning = true;
    this.lastUpdate = Date.now();
    this.gameLoop();
    console.log('▶️ Gioco ripreso');
};

Game.prototype.gameLoop = function() {
    if (!this.isRunning) return;
    
    var now = Date.now();
    var deltaTime = (now - this.lastUpdate) * this.gameSpeed;
    this.lastUpdate = now;
    
    // Aggiorna logica di gioco
    this.update(deltaTime);
    
    // Programma prossimo frame
    var self = this;
    requestAnimationFrame(function() {
        self.gameLoop();
    });
};

Game.prototype.update = function(deltaTime) {
    // Aggiorna tempo di gioco (accelerato)
    var gameHours = deltaTime / (1000 * 60); // 1 minuto reale = 1 ora di gioco
    this.state.gameTime.addHours(gameHours);
    
    // Aggiorna UI periodicamente
    if (Math.floor(Date.now() / 1000) % 5 === 0) { // Ogni 5 secondi
        this.updateUI();
    }
};

Game.prototype.updateUI = function() {
    try {
        this.uiManager.updateUI();
    } catch (error) {
        console.error('❌ Errore aggiornamento UI:', error);
    }
};

Game.prototype.saveGame = function() {
    try {
        var saveData = this.state.toSaveData();
        SaveLoad.saveGame(saveData);
        console.log('💾 Auto-save completato');
        return true;
    } catch (error) {
        console.error('❌ Errore durante il salvataggio:', error);
        return false;
    }
};

Game.prototype.loadGame = function() {
    try {
        var savedData = SaveLoad.loadGame();
        if (savedData) {
            this.state.loadFromData(savedData);
            this.updateUI();
            console.log('📂 Gioco caricato');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Errore durante il caricamento:', error);
        return false;
    }
};

// Avanza di un mese nel gioco
Game.prototype.advanceMonth = function() {
    console.log('📅 Avanzamento di un mese...');
    
    try {
        // Avanza il tempo nel DemandEstimationManager
        if (this.demandManager) {
            this.demandManager.advanceGameTime();
        }
        
        // Avanza sviluppo infrastrutture
        if (this.infrastructureManager) {
            this.infrastructureManager.advanceMonth();
        }
        
        // Aggiorna data di gioco
        if (!this.state.gameDate) {
            this.state.gameDate = new Date(2024, 0, 1); // Inizia da Gennaio 2024
        } else {
            this.state.gameDate.setMonth(this.state.gameDate.getMonth() + 1);
        }
        
        // Calcola ricavi e costi mensili per le rotte attive
        this.processMonthlyFinances();
        
        // Aggiorna UI con nuova data
        this.updateUI();
        
        // Notifica al giocatore
        var dateStr = this.state.gameDate.toLocaleDateString('it-IT', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        if (this.uiManager && this.uiManager.showNotification) {
            this.uiManager.showNotification('📅 Avanzato a ' + dateStr, 'info');
        }
        
        console.log('✅ Mese avanzato a:', dateStr);
        
        // Auto-save triggered dall'avanzamento mese
        if (typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
            SaveLoad.triggerAutoSave('avanzamento_mese');
        } else {
            this.saveGame(); // Fallback al metodo normale
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Errore avanzamento mese:', error);
        return false;
    }
};

// Processa finanze mensili
Game.prototype.processMonthlyFinances = function() {
    var totalRevenue = 0;
    var totalCosts = 0;
    
    // Processa rotte attive
    if (this.routeManager) {
        var activeRoutes = this.routeManager.getActiveRoutes();
        
        for (var i = 0; i < activeRoutes.length; i++) {
            var route = activeRoutes[i];
            
            // Simula operazioni mensili per la rotta
            var monthlyResult = this.simulateMonthlyRoute(route);
            
            totalRevenue += monthlyResult.revenue;
            totalCosts += monthlyResult.costs;
            
            // Aggiorna statistiche rotta
            route.totalRevenue += monthlyResult.revenue;
            route.totalExpenses += monthlyResult.costs;
            route.totalFlights += monthlyResult.flights;
            route.totalPassengers += monthlyResult.passengers;
        }
    }
    
    // Costi fissi flotta
    if (this.fleetManager) {
        var fleetCosts = this.fleetManager.getMonthlyMaintenanceCosts();
        totalCosts += fleetCosts;
    }
    
    // Aggiorna bilancio
    var netProfit = totalRevenue - totalCosts;
    if (this.state.earnMoney) {
        this.state.earnMoney(netProfit);
    } else {
        // Fallback
        this.state.money += netProfit;
        this.state.company.money = this.state.money;
    }
    
    // Aggiorna statistiche mensili
    if (!this.state.monthlyStats) {
        this.state.monthlyStats = [];
    }
    
    this.state.monthlyStats.push({
        month: new Date(this.state.gameDate),
        revenue: totalRevenue,
        costs: totalCosts,
        profit: netProfit,
        cash: this.state.money
    });
    
    // Mantieni solo ultimi 24 mesi
    if (this.state.monthlyStats.length > 24) {
        this.state.monthlyStats.shift();
    }
    
    console.log('💰 Finanze mensili:', {
        ricavi: totalRevenue.toLocaleString(),
        costi: totalCosts.toLocaleString(),
        profitto: netProfit.toLocaleString(),
        liquidità: this.state.money.toLocaleString()
    });
};

// Simula operazioni mensili per una rotta
Game.prototype.simulateMonthlyRoute = function(route) {
    var aircraft = this.fleetManager ? this.fleetManager.getAircraft(route.aircraftId) : null;
    
    if (!aircraft) {
        return { revenue: 0, costs: 0, flights: 0, passengers: 0 };
    }
    
    // Ottieni stime domanda aggiornate
    var origin = AirportData.getAirportByCode(route.origin);
    var destination = AirportData.getAirportByCode(route.destination);
    
    if (!origin || !destination) {
        return { revenue: 0, costs: 0, flights: 0, passengers: 0 };
    }
    
    var estimate = this.demandManager ? 
        this.demandManager.getPassengerEstimate(origin, destination) :
        { passengers: 100, revenue: 12000 }; // Fallback
    
    // Simula 30 giorni di operazioni
    var dailyFlights = route.frequency / 7; // da settimanale a giornaliera
    var monthlyFlights = Math.round(dailyFlights * 30);
    
    var totalPassengers = 0;
    var totalRevenue = 0;
    var totalCosts = 0;
    
    for (var day = 0; day < 30; day++) {
        var dailyDemand = estimate.passengers * (0.8 + Math.random() * 0.4); // ±20% variazione
        var actualPassengers = Math.min(dailyDemand, aircraft.capacity * dailyFlights);
        
        totalPassengers += actualPassengers;
        totalRevenue += actualPassengers * route.ticketPrice;
        totalCosts += (route.distance * 2.5) + 1000; // Costi operativi semplificati
    }
    
    return {
        revenue: totalRevenue,
        costs: totalCosts,
        flights: monthlyFlights,
        passengers: totalPassengers
    };
};

Game.prototype.newGame = function() {
    try {
        this.state = new GameState();
        this.setupNewGame();
        this.updateUI();
        SaveLoad.deleteSave();
        console.log('🆕 Nuova partita avviata');
        return true;
    } catch (error) {
        console.error('❌ Errore creazione nuova partita:', error);
        return false;
    }
};

// Rendi disponibile globalmente
window.Game = Game;

console.log('✅ Game compatibile caricato');
