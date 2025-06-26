// Game compatibile con tutti i browser
console.log('📂 Caricamento Game.js...');

function Game() {
    console.log('🎮 Inizializzazione Game...');
    
    try {
        // Inizializza componenti
        this.state = new GameState();
        console.log('✅ GameState creato');
        
        this.fleetManager = new FleetManager(this.state);
        console.log('✅ FleetManager creato');
        
        this.routeManager = new RouteManager(this.state);
        console.log('✅ RouteManager creato');
        
        this.financeManager = new FinanceManager(this.state);
        console.log('✅ FinanceManager creato');
        
        this.uiManager = new UIManager(this);
        console.log('✅ UIManager creato');
        
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
        // Carica dati salvati se esistenti
        var savedData = SaveLoad.loadGame();
        if (savedData) {
            this.state.loadFromData(savedData);
            console.log('💾 Dati salvati caricati');
        } else {
            this.setupNewGame();
        }
        
        // Inizializza UI
        console.log('🎨 Inizializzazione UI...');
        this.uiManager.init();
        
        console.log('🗺️ Inizializzazione WorldMap...');
        this.worldMap.init();
        
        console.log('🔄 Aggiornamento UI...');
        this.updateUI();
        
        // Avvia il game loop
        console.log('▶️ Avvio game loop...');
        this.start();
        
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
