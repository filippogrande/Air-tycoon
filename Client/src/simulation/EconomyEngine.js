// EconomyEngine - Sistema economico dinamico per Air Tycoon

var EconomyEngine = {
    
    // Stato dell'economia globale
    economyState: {
        // Indici economici principali (0-200, baseline 100)
        globalGDP: 100,           // Crescita economica mondiale
        inflationRate: 102,       // Tasso di inflazione 
        fuelPriceIndex: 100,      // Prezzo del carburante
        passengerConfidence: 100, // Fiducia dei passeggeri nel volo
        businessTravelIndex: 100, // Indice viaggi business
        leisureTravelIndex: 100,  // Indice viaggi leisure
        
        // Trend e variazioni
        lastUpdate: Date.now(),
        monthlyGrowthTarget: 0.5, // Crescita mensile target (%)
        volatility: 0.2,          // Volatilità del mercato (0-1)
        
        // Eventi economici attivi
        activeEvents: [],
        nextEventCheck: Date.now() + (1000 * 60 * 60 * 24) // 1 giorno
    },
    
    // Inizializza l'engine economico
    initialize: function(gameState) {
        
        // Carica stato salvato o inizializza
        var savedEconomy = this.loadEconomyState(gameState);
        if (savedEconomy) {
            this.economyState = savedEconomy;
        }
        
        // Avvia ciclo di aggiornamento
        this.startUpdateCycle();
        
        return true;
    },
    
    // Avvia il ciclo di aggiornamento automatico
    startUpdateCycle: function() {
        var self = this;
        
        // Aggiornamento ogni ora di gioco (o secondo IRL per test)
        setInterval(function() {
            self.updateEconomy();
        }, 60000); // 1 minuto per test, poi 3600000 per 1 ora reale
        
    },
    
    // Aggiorna l'economia periodicamente
    updateEconomy: function() {
        var now = Date.now();
        var timeDiff = now - this.economyState.lastUpdate;
        var monthsPassed = timeDiff / (1000 * 60 * 60 * 24 * 30); // Mesi simulati
        
        if (monthsPassed < 0.1) return; // Non aggiornare troppo spesso
        
        
        // Applica crescita di base
        this.applyBaselineGrowth(monthsPassed);
        
        // Applica volatilità casuale
        this.applyMarketVolatility();
        
        // Controlla eventi economici
        this.checkEconomicEvents();
        
        // Mantieni bounds realistici
        this.clampEconomicIndicators();
        
        this.economyState.lastUpdate = now;
        
        // Notifica cambiamenti significativi
        this.notifyEconomicChanges();
    },
    
    // Applica crescita economica di base
    applyBaselineGrowth: function(monthsPassed) {
        var growth = this.economyState.monthlyGrowthTarget * monthsPassed;
        
        // GDP cresce gradualmente
        this.economyState.globalGDP += growth * 0.8;
        
        // Business travel segue il GDP
        this.economyState.businessTravelIndex += growth * 1.2;
        
        // Leisure travel cresce più lentamente
        this.economyState.leisureTravelIndex += growth * 0.6;
        
        // Inflazione leggera
        this.economyState.inflationRate += growth * 0.1;
        
        // Carburante segue inflazione + volatilità
        this.economyState.fuelPriceIndex += growth * 0.3;
    },
    
    // Applica volatilità del mercato
    applyMarketVolatility: function() {
        var volatility = this.economyState.volatility;
        
        // Ogni indicatore ha una fluttuazione casuale
        var indicators = [
            'globalGDP', 'inflationRate', 'fuelPriceIndex', 
            'passengerConfidence', 'businessTravelIndex', 'leisureTravelIndex'
        ];
        
        for (var i = 0; i < indicators.length; i++) {
            var indicator = indicators[i];
            var currentValue = this.economyState[indicator];
            
            // Fluttuazione casuale (-volatility a +volatility)
            var change = (Math.random() - 0.5) * 2 * volatility * 5;
            
            // Applicazione con smoothing
            this.economyState[indicator] = currentValue + change;
        }
    },
    
    // Controlla e genera eventi economici
    checkEconomicEvents: function() {
        var now = Date.now();
        
        if (now < this.economyState.nextEventCheck) return;
        
        // Possibilità di evento economico (5% ogni controllo)
        if (Math.random() < 0.05) {
            this.generateEconomicEvent();
        }
        
        // Prossimo controllo tra 1-7 giorni
        this.economyState.nextEventCheck = now + (1000 * 60 * 60 * 24 * (1 + Math.random() * 6));
        
        // Rimuovi eventi scaduti
        this.removeExpiredEvents();
    },
    
    // Genera un evento economico casuale
    generateEconomicEvent: function() {
        var events = [
            {
                name: 'Oil Crisis',
                description: 'Crisi petrolifera aumenta costi carburante',
                effects: { fuelPriceIndex: 25, passengerConfidence: -10 },
                duration: 90 // giorni
            },
            {
                name: 'Economic Boom',
                description: 'Boom economico stimola viaggi business',
                effects: { businessTravelIndex: 20, globalGDP: 15 },
                duration: 120
            },
            {
                name: 'Tourism Campaign',
                description: 'Campagna turismo internazionale',
                effects: { leisureTravelIndex: 30, passengerConfidence: 10 },
                duration: 60
            },
            {
                name: 'Recession Warning',
                description: 'Timori recessione riducono viaggi',
                effects: { businessTravelIndex: -15, leisureTravelIndex: -10, passengerConfidence: -20 },
                duration: 180
            },
            {
                name: 'Tech Innovation',
                description: 'Innovazioni tecnologiche riducono costi operativi',
                effects: { globalGDP: 10, businessTravelIndex: 15 },
                duration: 365
            }
        ];
        
        var event = events[Math.floor(Math.random() * events.length)];
        
        // Crea evento con scadenza
        var economicEvent = {
            ...event,
            startDate: Date.now(),
            endDate: Date.now() + (event.duration * 24 * 60 * 60 * 1000)
        };
        
        // Applica effetti immediati
        for (var effect in event.effects) {
            if (this.economyState[effect] !== undefined) {
                this.economyState[effect] += event.effects[effect];
            }
        }
        
        this.economyState.activeEvents.push(economicEvent);
        
    },
    
    // Rimuove eventi scaduti
    removeExpiredEvents: function() {
        var now = Date.now();
        var eventsToRemove = [];
        
        for (var i = 0; i < this.economyState.activeEvents.length; i++) {
            var event = this.economyState.activeEvents[i];
            
            if (now > event.endDate) {
                // Rimuovi effetti dell'evento
                for (var effect in event.effects) {
                    if (this.economyState[effect] !== undefined) {
                        this.economyState[effect] -= event.effects[effect];
                    }
                }
                
                eventsToRemove.push(i);
            }
        }
        
        // Rimuovi eventi scaduti (dal fondo per non alterare indici)
        for (var j = eventsToRemove.length - 1; j >= 0; j--) {
            this.economyState.activeEvents.splice(eventsToRemove[j], 1);
        }
    },
    
    // Mantieni indicatori in range realistici
    clampEconomicIndicators: function() {
        // Bounds per ogni indicatore
        var bounds = {
            globalGDP: [60, 200],           // Da recessione severa a boom
            inflationRate: [95, 130],       // Deflazione lieve a inflazione alta
            fuelPriceIndex: [70, 250],      // Carburante economico a crisi
            passengerConfidence: [40, 150], // Da panico a fiducia alta
            businessTravelIndex: [50, 180], // Da recessione a boom business
            leisureTravelIndex: [60, 160]   // Da contrazione a crescita forte
        };
        
        for (var indicator in bounds) {
            if (this.economyState[indicator] !== undefined) {
                var min = bounds[indicator][0];
                var max = bounds[indicator][1];
                this.economyState[indicator] = Math.max(min, Math.min(max, this.economyState[indicator]));
            }
        }
    },
    
    // Notifica cambiamenti economici significativi
    notifyEconomicChanges: function() {
        // Per ora log, in futuro può essere UI notification
        if (Math.random() < 0.1) { // 10% delle volte
                GDP: Math.round(this.economyState.globalGDP),
                Business: Math.round(this.economyState.businessTravelIndex),
                Leisure: Math.round(this.economyState.leisureTravelIndex),
                Fuel: Math.round(this.economyState.fuelPriceIndex),
                Confidence: Math.round(this.economyState.passengerConfidence)
            });
        }
    },
    
    // API: Ottieni moltiplicatore per demand passengers business
    getBusinessDemandMultiplier: function() {
        return this.economyState.businessTravelIndex / 100;
    },
    
    // API: Ottieni moltiplicatore per demand passengers leisure
    getLeisureDemandMultiplier: function() {
        return this.economyState.leisureTravelIndex / 100;
    },
    
    // API: Ottieni moltiplicatore per costi carburante
    getFuelCostMultiplier: function() {
        return this.economyState.fuelPriceIndex / 100;
    },
    
    // API: Ottieni moltiplicatore per fiducia passeggeri (load factor)
    getPassengerConfidenceMultiplier: function() {
        return this.economyState.passengerConfidence / 100;
    },
    
    // API: Ottieni moltiplicatori economici per calcoli esterni
    getEconomyMultipliers: function() {
        return {
            passengerDemand: this.economyState.passengerConfidence / 100 * 
                           (this.economyState.businessTravelIndex + this.economyState.leisureTravelIndex) / 200,
            cargoDemand: this.economyState.globalGDP / 100,
            fuelCosts: this.economyState.fuelPriceIndex / 100,
            revenue: (this.economyState.globalGDP + this.economyState.passengerConfidence) / 200,
            operationalCosts: (this.economyState.inflationRate + this.economyState.fuelPriceIndex) / 200
        };
    },
    
    // Salva stato economia
    saveEconomyState: function() {
        return {
            ...this.economyState
        };
    },
    
    // Carica stato economia
    loadEconomyState: function(gameState) {
        if (gameState && gameState.economyState) {
            return gameState.economyState;
        }
        return null;
    }
};

// Export per uso globale
window.EconomyEngine = EconomyEngine;
