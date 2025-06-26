// Classe principale del gioco Air Tycoon 2 Clone
class Game {
    constructor() {
        this.state = new GameState();
        this.fleetManager = new FleetManager(this.state);
        this.routeManager = new RouteManager(this.state);
        this.financeManager = new FinanceManager(this.state);
        this.uiManager = new UIManager(this);
        this.worldMap = new WorldMap(this);
        
        this.isRunning = false;
        this.gameSpeed = 1; // 1x velocità normale
        this.lastUpdate = 0;
        
        this.init();
    }
    
    init() {
        console.log('🛫 Air Tycoon 2 Clone - Inizializzazione...');
        
        // Carica dati salvati se esistenti
        const savedData = SaveLoad.loadGame();
        if (savedData) {
            this.state.loadFromData(savedData);
            console.log('💾 Dati salvati caricati');
        } else {
            this.setupNewGame();
        }
        
        // Inizializza UI
        this.uiManager.init();
        this.worldMap.init();
        this.updateUI();
        
        // Avvia il game loop
        this.start();
        
        // Auto-save ogni 30 secondi
        setInterval(() => {
            this.saveGame();
        }, 30000);
        
        console.log('✅ Gioco inizializzato correttamente');
    }
    
    setupNewGame() {
        // Imposta valori iniziali per una nuova partita
        this.state.company.name = "Air Express";
        this.state.company.money = 1000000; // $1M iniziali
        this.state.company.reputation = 50;
        this.state.company.founded = new Date();
        
        // Aggiungi un aeroporto base (es. Milano Malpensa)
        const baseAirport = AirportData.airports.find(a => a.code === 'MXP');
        if (baseAirport) {
            this.state.company.baseAirport = baseAirport.code;
        }
        
        console.log('🆕 Nuova partita inizializzata');
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastUpdate = Date.now();
            this.gameLoop();
            console.log('▶️ Gioco avviato');
        }
    }
    
    pause() {
        this.isRunning = false;
        console.log('⏸️ Gioco in pausa');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // secondi
        this.lastUpdate = now;
        
        // Aggiorna la logica del gioco
        this.update(deltaTime);
        
        // Continua il loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Aggiorna il tempo di gioco (1 secondo reale = 1 ora di gioco)
        const gameHours = deltaTime * this.gameSpeed * 3600; // ore di gioco
        this.state.gameTime.addHours(gameHours);
        
        // Aggiorna manager
        this.routeManager.update(deltaTime);
        this.financeManager.update(deltaTime);
        
        // Aggiorna UI se necessario
        if (Math.floor(now / 1000) !== Math.floor((now - deltaTime * 1000) / 1000)) {
            this.updateUI();
        }
    }
    
    updateUI() {
        // Aggiorna header con informazioni generali
        document.getElementById('company-name').textContent = this.state.company.name;
        document.getElementById('money').textContent = `💰 $${this.formatMoney(this.state.company.money)}`;
        document.getElementById('reputation').textContent = `⭐ ${this.state.company.reputation}`;
        document.getElementById('date').textContent = `📅 ${this.formatDate(this.state.gameTime.date)}`;
        
        // Aggiorna finanze
        this.updateFinanceUI();
    }
    
    updateFinanceUI() {
        const monthlyIncome = this.financeManager.getMonthlyIncome();
        const monthlyCosts = this.financeManager.getMonthlyCosts();
        const monthlyProfit = monthlyIncome - monthlyCosts;
        
        const incomeEl = document.getElementById('monthly-income');
        const costsEl = document.getElementById('monthly-costs');
        const profitEl = document.getElementById('monthly-profit');
        
        if (incomeEl) incomeEl.textContent = `$${this.formatMoney(monthlyIncome)}`;
        if (costsEl) costsEl.textContent = `$${this.formatMoney(monthlyCosts)}`;
        if (profitEl) {
            profitEl.textContent = `$${this.formatMoney(monthlyProfit)}`;
            profitEl.style.color = monthlyProfit >= 0 ? '#4CAF50' : '#f44336';
        }
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('it-IT').format(Math.round(amount));
    }
    
    formatDate(date) {
        return date.toLocaleDateString('it-IT', { 
            month: 'short', 
            year: 'numeric' 
        });
    }
    
    buyAircraft(aircraftType) {
        const aircraft = AircraftData.getAircraftByType(aircraftType);
        if (!aircraft) {
            console.error('Tipo di aeromobile non trovato:', aircraftType);
            return false;
        }
        
        if (this.state.company.money < aircraft.price) {
            alert('Fondi insufficienti per acquistare questo aeromobile!');
            return false;
        }
        
        // Acquista l'aeromobile
        this.state.company.money -= aircraft.price;
        const newAircraft = this.fleetManager.addAircraft(aircraft);
        
        console.log('✈️ Aeromobile acquistato:', newAircraft.name);
        this.updateUI();
        this.uiManager.updateFleetDisplay();
        
        return true;
    }
    
    createRoute(originCode, destinationCode, aircraftId) {
        return this.routeManager.createRoute(originCode, destinationCode, aircraftId);
    }
    
    saveGame() {
        const saveData = this.state.toSaveData();
        SaveLoad.saveGame(saveData);
        console.log('💾 Gioco salvato automaticamente');
    }
    
    setGameSpeed(speed) {
        this.gameSpeed = Math.max(0.1, Math.min(10, speed));
        console.log(`⏩ Velocità gioco: ${this.gameSpeed}x`);
    }
}
