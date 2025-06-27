// WeatherEngine - Sistema meteorologico e eventi straordinari
console.log('📂 Caricamento WeatherEngine.js...');

var WeatherEngine = {
    
    // Stato meteo globale
    weatherState: {
        // Eventi meteo attivi (per regione)
        activeWeatherEvents: {},
        
        // Stagioni per regioni (0-3: primavera, estate, autunno, inverno)
        regionalSeasons: {},
        
        // Prossimo controllo eventi
        nextWeatherCheck: Date.now() + (1000 * 60 * 60 * 6), // 6 ore
        
        // Probabilità eventi per stagione
        seasonalEventProbability: {
            spring: 0.15,  // 15% tempeste primaverili
            summer: 0.20,  // 20% temporali estivi
            autumn: 0.18,  // 18% maltempo autunnale
            winter: 0.25   // 25% tempeste invernali
        }
    },
    
    // Definizioni regioni climatiche
    climateRegions: {
        'Europa': {
            seasonOffset: 0,      // Stagioni standard
            volatility: 0.8,      // Moderata volatilità
            hurricaneRisk: 0.05,  // Basso rischio uragani
            winterSeverity: 0.7   // Inverni moderati
        },
        'Nord America': {
            seasonOffset: 0,
            volatility: 1.2,      // Alta volatilità 
            hurricaneRisk: 0.3,   // Alto rischio uragani
            winterSeverity: 1.0   // Inverni severi
        },
        'Sud America': {
            seasonOffset: 6,      // Stagioni invertite
            volatility: 0.9,
            hurricaneRisk: 0.15,
            winterSeverity: 0.3   // Inverni lievi
        },
        'Asia': {
            seasonOffset: 0,
            volatility: 1.0,
            hurricaneRisk: 0.25,  // Tifoni
            winterSeverity: 0.8
        },
        'Africa': {
            seasonOffset: 0,
            volatility: 0.6,      // Clima più stabile
            hurricaneRisk: 0.08,
            winterSeverity: 0.2   // Inverni miti
        },
        'Oceania': {
            seasonOffset: 6,      // Stagioni invertite
            volatility: 0.7,
            hurricaneRisk: 0.12,
            winterSeverity: 0.4
        }
    },
    
    // Tipi di eventi meteorologici
    weatherEventTypes: [
        {
            name: 'Thunderstorm',
            displayName: 'Forte Temporale',
            description: 'Temporali intensi causano ritardi e cancellazioni',
            effects: {
                flightDelayChance: 0.4,
                cancellationChance: 0.1,
                demandReduction: 0.15,
                operationalCostIncrease: 0.2
            },
            duration: { min: 3, max: 12 }, // ore
            severity: 'medium',
            seasonalMultiplier: { spring: 1.2, summer: 1.5, autumn: 1.0, winter: 0.5 }
        },
        {
            name: 'Blizzard',
            displayName: 'Tempesta di Neve',
            description: 'Neve intensa blocca aeroporti',
            effects: {
                flightDelayChance: 0.7,
                cancellationChance: 0.4,
                demandReduction: 0.4,
                operationalCostIncrease: 0.5
            },
            duration: { min: 12, max: 48 },
            severity: 'high',
            seasonalMultiplier: { spring: 0.2, summer: 0.0, autumn: 0.3, winter: 2.0 }
        },
        {
            name: 'Hurricane',
            displayName: 'Uragano',
            description: 'Uragano devasta la regione',
            effects: {
                flightDelayChance: 0.9,
                cancellationChance: 0.8,
                demandReduction: 0.7,
                operationalCostIncrease: 1.0,
                airportClosure: true
            },
            duration: { min: 24, max: 96 },
            severity: 'extreme',
            seasonalMultiplier: { spring: 0.1, summer: 0.8, autumn: 1.5, winter: 0.0 }
        },
        {
            name: 'Fog',
            displayName: 'Nebbia Fitta',
            description: 'Visibilità ridotta causa ritardi',
            effects: {
                flightDelayChance: 0.6,
                cancellationChance: 0.05,
                demandReduction: 0.05,
                operationalCostIncrease: 0.1
            },
            duration: { min: 2, max: 8 },
            severity: 'low',
            seasonalMultiplier: { spring: 1.0, summer: 0.3, autumn: 1.4, winter: 1.2 }
        },
        {
            name: 'Heatwave',
            displayName: 'Ondata di Calore',
            description: 'Temperature estreme riducono efficienza aeromobili',
            effects: {
                flightDelayChance: 0.2,
                cancellationChance: 0.1,
                demandReduction: 0.1,
                operationalCostIncrease: 0.3,
                fuelConsumptionIncrease: 0.15
            },
            duration: { min: 24, max: 168 }, // Può durare una settimana
            severity: 'medium',
            seasonalMultiplier: { spring: 0.3, summer: 2.0, autumn: 0.4, winter: 0.0 }
        },
        {
            name: 'VolcanicAsh',
            displayName: 'Cenere Vulcanica',
            description: 'Ceneri vulcaniche chiudono spazio aereo',
            effects: {
                flightDelayChance: 1.0,
                cancellationChance: 0.9,
                demandReduction: 0.8,
                operationalCostIncrease: 0.0, // Nessun costo se non si vola
                airspaceClose: true
            },
            duration: { min: 48, max: 336 }, // Può durare settimane
            severity: 'extreme',
            seasonalMultiplier: { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 } // Sempre uguale
        }
    ],
    
    // Inizializza il sistema meteo
    initialize: function(gameState) {
        console.log('🌦️ Inizializzazione Weather Engine...');
        
        // Carica stato meteo salvato
        var savedWeather = this.loadWeatherState(gameState);
        if (savedWeather) {
            this.weatherState = savedWeather;
        }
        
        // Inizializza stagioni per tutte le regioni
        this.initializeSeasons();
        
        // Avvia ciclo di controllo meteo
        this.startWeatherCycle();
        
        console.log('✅ Weather Engine attivo');
        return true;
    },
    
    // Inizializza le stagioni per regione
    initializeSeasons: function() {
        var currentMonth = new Date().getMonth(); // 0-11
        
        for (var region in this.climateRegions) {
            var seasonOffset = this.climateRegions[region].seasonOffset;
            var adjustedMonth = (currentMonth + seasonOffset) % 12;
            
            // Calcola stagione (0-3)
            var season = Math.floor(adjustedMonth / 3);
            this.weatherState.regionalSeasons[region] = season;
        }
        
        console.log('🗓️ Stagioni inizializzate:', this.weatherState.regionalSeasons);
    },
    
    // Avvia ciclo di controllo meteo
    startWeatherCycle: function() {
        var self = this;
        
        // Controllo ogni 30 minuti per test, poi ogni 6 ore
        setInterval(function() {
            self.updateWeather();
        }, 1800000); // 30 minuti per test
        
        console.log('🔄 Ciclo meteorologico avviato');
    },
    
    // Aggiorna condizioni meteo
    updateWeather: function() {
        var now = Date.now();
        
        if (now < this.weatherState.nextWeatherCheck) return;
        
        console.log('🌤️ Controllo condizioni meteorologiche...');
        
        // Rimuovi eventi scaduti
        this.removeExpiredWeatherEvents();
        
        // Aggiorna stagioni se necessario
        this.updateSeasons();
        
        // Controlla nuovi eventi meteo per ogni regione
        for (var region in this.climateRegions) {
            this.checkWeatherEventsForRegion(region);
        }
        
        // Prossimo controllo tra 4-8 ore
        this.weatherState.nextWeatherCheck = now + (1000 * 60 * 60 * (4 + Math.random() * 4));
    },
    
    // Aggiorna stagioni se necessario
    updateSeasons: function() {
        var currentMonth = new Date().getMonth();
        var updated = false;
        
        for (var region in this.climateRegions) {
            var seasonOffset = this.climateRegions[region].seasonOffset;
            var adjustedMonth = (currentMonth + seasonOffset) % 12;
            var newSeason = Math.floor(adjustedMonth / 3);
            
            if (this.weatherState.regionalSeasons[region] !== newSeason) {
                console.log('🍂 Cambio stagione in', region + ':', this.getSeasonName(newSeason));
                this.weatherState.regionalSeasons[region] = newSeason;
                updated = true;
            }
        }
        
        return updated;
    },
    
    // Controlla eventi meteo per una regione
    checkWeatherEventsForRegion: function(region) {
        // Se c'è già un evento attivo, probabilità ridotta di nuovi eventi
        if (this.weatherState.activeWeatherEvents[region]) {
            if (Math.random() < 0.1) { // 10% se già c'è un evento
                this.generateWeatherEvent(region);
            }
            return;
        }
        
        var climateData = this.climateRegions[region];
        var currentSeason = this.weatherState.regionalSeasons[region];
        var seasonName = this.getSeasonName(currentSeason);
        
        // Probabilità base basata su stagione e volatilità regionale
        var baseProbability = this.weatherState.seasonalEventProbability[seasonName] || 0.1;
        var adjustedProbability = baseProbability * climateData.volatility;
        
        if (Math.random() < adjustedProbability) {
            this.generateWeatherEvent(region);
        }
    },
    
    // Genera evento meteorologico per regione
    generateWeatherEvent: function(region) {
        var climateData = this.climateRegions[region];
        var currentSeason = this.weatherState.regionalSeasons[region];
        var seasonName = this.getSeasonName(currentSeason);
        
        // Filtra eventi appropriati per stagione e regione
        var appropriateEvents = this.weatherEventTypes.filter(function(eventType) {
            var seasonMultiplier = eventType.seasonalMultiplier[seasonName] || 0;
            
            // Eventi speciali per regione
            if (eventType.name === 'Hurricane' && climateData.hurricaneRisk < 0.1) {
                return false; // No uragani in regioni a basso rischio
            }
            
            return seasonMultiplier > 0.2; // Solo eventi stagionalmente appropriati
        });
        
        if (appropriateEvents.length === 0) return;
        
        // Seleziona evento casuale pesato per stagione
        var eventType = this.selectWeightedEvent(appropriateEvents, seasonName);
        if (!eventType) return;
        
        // Calcola durata
        var duration = eventType.duration.min + 
            Math.random() * (eventType.duration.max - eventType.duration.min);
        
        // Crea evento
        var weatherEvent = {
            type: eventType.name,
            displayName: eventType.displayName,
            description: eventType.description,
            effects: { ...eventType.effects },
            region: region,
            startTime: Date.now(),
            endTime: Date.now() + (duration * 60 * 60 * 1000), // ore -> millisecondi
            severity: eventType.severity
        };
        
        // Applica moltiplicatore stagionale agli effetti
        var seasonMultiplier = eventType.seasonalMultiplier[seasonName];
        for (var effect in weatherEvent.effects) {
            if (typeof weatherEvent.effects[effect] === 'number') {
                weatherEvent.effects[effect] *= seasonMultiplier;
            }
        }
        
        this.weatherState.activeWeatherEvents[region] = weatherEvent;
        
        console.log('⛈️ Evento meteo in', region + ':', eventType.displayName);
        console.log('📊 Durata:', Math.round(duration), 'ore | Severità:', eventType.severity);
    },
    
    // Seleziona evento pesato per stagione
    selectWeightedEvent: function(events, seasonName) {
        var totalWeight = 0;
        var weights = [];
        
        // Calcola pesi
        for (var i = 0; i < events.length; i++) {
            var weight = events[i].seasonalMultiplier[seasonName] || 0;
            weights.push(weight);
            totalWeight += weight;
        }
        
        if (totalWeight === 0) return null;
        
        // Selezione casuale pesata
        var random = Math.random() * totalWeight;
        var accumulatedWeight = 0;
        
        for (var j = 0; j < events.length; j++) {
            accumulatedWeight += weights[j];
            if (random <= accumulatedWeight) {
                return events[j];
            }
        }
        
        return events[events.length - 1]; // Fallback
    },
    
    // Rimuove eventi meteo scaduti
    removeExpiredWeatherEvents: function() {
        var now = Date.now();
        var expiredRegions = [];
        
        for (var region in this.weatherState.activeWeatherEvents) {
            var event = this.weatherState.activeWeatherEvents[region];
            if (now > event.endTime) {
                expiredRegions.push(region);
                console.log('🌤️ Evento meteo terminato in', region + ':', event.displayName);
            }
        }
        
        // Rimuovi eventi scaduti
        for (var i = 0; i < expiredRegions.length; i++) {
            delete this.weatherState.activeWeatherEvents[expiredRegions[i]];
        }
    },
    
    // Utility: ottieni nome stagione
    getSeasonName: function(seasonIndex) {
        var seasons = ['spring', 'summer', 'autumn', 'winter'];
        return seasons[seasonIndex] || 'spring';
    },
    
    // API: Ottieni effetti meteo per un aeroporto
    getWeatherEffectsForAirport: function(airport) {
        var region = airport.continent || 'Europa';
        var event = this.weatherState.activeWeatherEvents[region];
        
        if (!event) {
            return {
                hasWeatherEvent: false,
                effects: {
                    flightDelayChance: 0,
                    cancellationChance: 0,
                    demandReduction: 0,
                    operationalCostIncrease: 0
                }
            };
        }
        
        return {
            hasWeatherEvent: true,
            eventName: event.displayName,
            description: event.description,
            severity: event.severity,
            timeRemaining: Math.max(0, event.endTime - Date.now()),
            effects: event.effects
        };
    },
    
    // API: Ottieni moltiplicatore domanda per regione
    getDemandMultiplierForRoute: function(originAirport, destinationAirport) {
        var originEffects = this.getWeatherEffectsForAirport(originAirport);
        var destEffects = this.getWeatherEffectsForAirport(destinationAirport);
        
        var reductionOrigin = originEffects.effects.demandReduction || 0;
        var reductionDest = destEffects.effects.demandReduction || 0;
        
        // Prendi la riduzione peggiore tra origine e destinazione
        var maxReduction = Math.max(reductionOrigin, reductionDest);
        
        return 1 - maxReduction;
    },
    
    // API: Ottieni stato meteo completo
    getWeatherState: function() {
        return {
            activeEvents: { ...this.weatherState.activeWeatherEvents },
            seasons: { ...this.weatherState.regionalSeasons },
            summary: this.getWeatherSummary()
        };
    },
    
    // Genera riassunto condizioni meteo
    getWeatherSummary: function() {
        var summary = {
            totalActiveEvents: Object.keys(this.weatherState.activeWeatherEvents).length,
            severityBreakdown: { low: 0, medium: 0, high: 0, extreme: 0 },
            affectedRegions: []
        };
        
        for (var region in this.weatherState.activeWeatherEvents) {
            var event = this.weatherState.activeWeatherEvents[region];
            summary.affectedRegions.push({
                region: region,
                event: event.displayName,
                severity: event.severity
            });
            
            summary.severityBreakdown[event.severity]++;
        }
        
        return summary;
    },
    
    // Salva stato meteo
    saveWeatherState: function() {
        return {
            ...this.weatherState
        };
    },
    
    // Carica stato meteo
    loadWeatherState: function(gameState) {
        if (gameState && gameState.weatherState) {
            return gameState.weatherState;
        }
        return null;
    }
};

// Export per uso globale
window.WeatherEngine = WeatherEngine;
console.log('✅ WeatherEngine caricato');
