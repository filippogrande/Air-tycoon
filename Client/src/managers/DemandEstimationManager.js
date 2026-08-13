// DemandEstimationManager - Gestisce stime domanda persistenti
console.log('📂 Caricamento DemandEstimationManager.js...');

function DemandEstimationManager(gameState) {
    this.gameState = gameState;
    
    // Cache delle stime per rotta (chiave: origin_destination)
    this.routeEstimates = {};
    
    // Stime migliorate (scadono dopo 1 anno di gioco)
    this.improvedEstimates = {};
    
    // Stato dell'analisi
    this.analysisState = {
        lastUpdate: Date.now(),
        gameMonth: 0, // Mese di gioco corrente
        
        // Costi analisi
        basicAnalysisCost: 5000,      // €5,000 per migliorare stima domanda
        marketAnalysisCost: 15000     // €15,000 per analisi di mercato
    };
    
    console.log('📊 DemandEstimationManager inizializzato');
}

// Genera chiave unica per una rotta
DemandEstimationManager.prototype.getRouteKey = function(originCode, destinationCode) {
    // Normalizza l'ordine per evitare duplicati (A->B === B->A)
    var codes = [originCode, destinationCode].sort();
    return codes[0] + '_' + codes[1];
};

// Ottieni stima passeggeri per una rotta (con cache persistente)
DemandEstimationManager.prototype.getPassengerEstimate = function(origin, destination, forceRecalculate) {
    var routeKey = this.getRouteKey(origin.code, destination.code);
    
    // Se già nella cache e non è forzato il ricalcolo, usa quella
    if (!forceRecalculate && this.routeEstimates[routeKey]) {
        console.log('📋 Usando stima cached per', routeKey + ':', this.routeEstimates[routeKey].passengers, 'passeggeri');
        return this.routeEstimates[routeKey];
    }
    
    // Calcola distanza
    var distance = this.calculateDistance(origin, destination);
    
    // Determina livello di analisi
    var analysisLevel = this.getAnalysisLevel(routeKey);
    
    // Calcola stime usando RouteCalculator
    var estimates = this.calculateEstimates(origin, destination, distance, analysisLevel);
    
    // Salva nella cache
    this.routeEstimates[routeKey] = {
        passengers: estimates.passengers,
        cargo: estimates.cargo,
        revenue: estimates.revenue,
        distance: distance,
        analysisLevel: analysisLevel,
        lastCalculated: Date.now(),
        gameMonth: this.analysisState.gameMonth
    };
    
    console.log('📊 Nuova stima per', routeKey + ':', estimates.passengers, 'passeggeri (livello:', analysisLevel + ')');
    
    return this.routeEstimates[routeKey];
};

// Calcola stime basate su livello di analisi
DemandEstimationManager.prototype.calculateEstimates = function(origin, destination, distance, analysisLevel) {
    // Fattori base aeroporti
    var originFactor = this.getAirportTrafficFactor(origin);
    var destinationFactor = this.getAirportTrafficFactor(destination);
    var routeFactor = (originFactor + destinationFactor) / 2;
    
    // Fattore distanza
    var distanceFactor = this.getDistanceFactor(distance);
    
    // Calcolo base
    var basePassengers = Math.round(routeFactor * distanceFactor * 120);
    var baseCargo = Math.round(routeFactor * distanceFactor * 8);
    
    // Applica errore basato su livello di analisi
    var errorMultiplier = this.getErrorMultiplier(analysisLevel);
    
    var passengers = Math.max(10, Math.round(basePassengers * errorMultiplier));
    var cargo = Math.max(1, Math.round(baseCargo * errorMultiplier));
    var revenue = (passengers * 120) + (cargo * 800);
    
    // Integra con EconomyEngine se disponibile
    if (typeof EconomyEngine !== 'undefined' && EconomyEngine.getEconomyMultipliers) {
        var multipliers = EconomyEngine.getEconomyMultipliers();
        passengers = Math.round(passengers * multipliers.passengerDemand);
        cargo = Math.round(cargo * multipliers.cargoDemand);
        revenue = Math.round(revenue * multipliers.revenue);
    }
    
    // Applica impatto infrastrutture terrestri
    if (this.gameState && this.gameState.infrastructureManager) {
        var infrastructureImpact = this.gameState.infrastructureManager.getInfrastructureImpact(
            origin, destination, distance
        );
        passengers = Math.round(passengers * infrastructureImpact);
        revenue = Math.round(revenue * infrastructureImpact);
        
        // Log per debug (solo per rotte con impatto significativo)
        if (infrastructureImpact < 0.9) {
            console.log('🏗️ Impatto infrastrutture su', origin.code + '-' + destination.code + 
                       ': -' + Math.round((1 - infrastructureImpact) * 100) + '%');
        }
    }
    
    return {
        passengers: passengers,
        cargo: cargo,
        revenue: revenue
    };
};

// Ottieni fattore di traffico aeroporto
DemandEstimationManager.prototype.getAirportTrafficFactor = function(airport) {
    var sizeFactor = 1.0;
    switch (airport.size) {
        case 'large':
            sizeFactor = 2.5;
            break;
        case 'medium':
            sizeFactor = 1.2;
            break;
        case 'small':
        default:
            sizeFactor = 0.6;
            break;
    }
    
    var businessLevel = airport.businessLevel || 50;
    var touristLevel = airport.touristLevel || 50;
    var activityFactor = (businessLevel + touristLevel) / 100;
    
    return sizeFactor * activityFactor;
};

// Ottieni fattore distanza
DemandEstimationManager.prototype.getDistanceFactor = function(distance) {
    if (distance > 3000) return 1.2;      // Intercontinentali
    if (distance > 1500) return 1.1;      // Continentali lunghe
    if (distance < 500) return 0.8;       // Regionali brevi
    return 1.0;                           // Standard
};

// Ottieni moltiplicatore errore basato su livello analisi
DemandEstimationManager.prototype.getErrorMultiplier = function(analysisLevel) {
    switch (analysisLevel) {
        case 'basic':
            // Errore ±30%
            return 1 + (Math.random() - 0.5) * 0.6;
        case 'improved':
            // Errore ±8%
            return 1 + (Math.random() - 0.5) * 0.16;
        case 'precise':
            // Errore ±3%
            return 1 + (Math.random() - 0.5) * 0.06;
        default:
            return 1;
    }
};

// Ottieni livello di analisi per una rotta
DemandEstimationManager.prototype.getAnalysisLevel = function(routeKey) {
    // Controlla se c'è un'analisi migliorata valida
    var improved = this.improvedEstimates[routeKey];
    if (improved && this.isAnalysisValid(improved)) {
        return 'improved';
    }
    
    return 'basic';
};

// Controlla se l'analisi è ancora valida (non scaduta)
DemandEstimationManager.prototype.isAnalysisValid = function(analysis) {
    var monthsElapsed = this.analysisState.gameMonth - analysis.purchasedMonth;
    return monthsElapsed < 12; // Valida per 12 mesi di gioco
};

// Migliora analisi domanda per una rotta
DemandEstimationManager.prototype.improveAnalysis = function(originCode, destinationCode) {
    var cost = this.analysisState.basicAnalysisCost;
    
    // Controlla se il giocatore ha abbastanza denaro
    var currentMoney = this.gameState.money || this.gameState.company.money || 0;
    if (currentMoney < cost) {
        return {
            success: false,
            message: 'Fondi insufficienti. Servono ' + uiUtils.formatCurrency(cost)
        };
    }
    
    var routeKey = this.getRouteKey(originCode, destinationCode);
    
    // Controlla se l'analisi è già stata migliorata di recente
    var existing = this.improvedEstimates[routeKey];
    if (existing && this.isAnalysisValid(existing)) {
        return {
            success: false,
            message: 'Analisi già migliorata per questa rotta (valida fino al ' + 
                    this.getExpirationMonth(existing) + ')'
        };
    }
    
    // Deduci il costo
    if (this.gameState.spendMoney) {
        this.gameState.spendMoney(cost);
    } else {
        // Fallback per compatibilità
        if (this.gameState.money !== undefined) {
            this.gameState.money -= cost;
        } else {
            this.gameState.company.money -= cost;
        }
    }
    
    // Salva analisi migliorata
    this.improvedEstimates[routeKey] = {
        purchasedMonth: this.analysisState.gameMonth,
        expiresMonth: this.analysisState.gameMonth + 12
    };
    
    // Forza ricalcolo delle stime
    delete this.routeEstimates[routeKey];
    
    console.log('✅ Analisi migliorata per', routeKey, '- Costo: ' + uiUtils.formatCurrency(cost));
    
    return {
        success: true,
        message: 'Analisi migliorata! Stime più precise per 12 mesi.',
        cost: cost,
        validUntil: this.analysisState.gameMonth + 12
    };
};

// Ottieni mese di scadenza formattato
DemandEstimationManager.prototype.getExpirationMonth = function(analysis) {
    var months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 
                  'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    var month = analysis.expiresMonth % 12;
    var year = Math.floor(analysis.expiresMonth / 12) + 2024;
    return months[month] + ' ' + year;
};

// Avanza il tempo di gioco (chiamato quando passa un mese)
DemandEstimationManager.prototype.advanceGameTime = function() {
    this.analysisState.gameMonth++;
    
    // Controlla scadenze e pulisci cache se necessario
    this.cleanupExpiredAnalysis();
    
    console.log('📅 Avanzato al mese', this.analysisState.gameMonth);
};

// Pulisci analisi scadute
DemandEstimationManager.prototype.cleanupExpiredAnalysis = function() {
    var expired = [];
    
    for (var routeKey in this.improvedEstimates) {
        var analysis = this.improvedEstimates[routeKey];
        if (!this.isAnalysisValid(analysis)) {
            expired.push(routeKey);
            // Rimuovi anche la cache delle stime per forzare ricalcolo
            delete this.routeEstimates[routeKey];
        }
    }
    
    // Rimuovi analisi scadute
    for (var i = 0; i < expired.length; i++) {
        delete this.improvedEstimates[expired[i]];
        console.log('🗑️ Analisi scaduta per', expired[i]);
    }
    
    if (expired.length > 0) {
        return {
            expiredRoutes: expired.length,
            message: expired.length + ' analisi scadute. Stime tornate al livello base.'
        };
    }
    
    return null;
};

// Calcola distanza tra aeroporti
DemandEstimationManager.prototype.calculateDistance = function(origin, destination) {
    var R = 6371; // Raggio Terra in km
    var dLat = (destination.latitude - origin.latitude) * Math.PI / 180;
    var dLon = (destination.longitude - origin.longitude) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(origin.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Ottieni stato completo delle analisi
DemandEstimationManager.prototype.getAnalysisState = function() {
    var activeAnalysis = {};
    var expiringSoon = [];
    
    for (var routeKey in this.improvedEstimates) {
        var analysis = this.improvedEstimates[routeKey];
        if (this.isAnalysisValid(analysis)) {
            activeAnalysis[routeKey] = analysis;
            
            // Controlla se scade nei prossimi 2 mesi
            var monthsLeft = analysis.expiresMonth - this.analysisState.gameMonth;
            if (monthsLeft <= 2) {
                expiringSoon.push({
                    route: routeKey,
                    monthsLeft: monthsLeft
                });
            }
        }
    }
    
    return {
        currentMonth: this.analysisState.gameMonth,
        activeAnalysis: Object.keys(activeAnalysis).length,
        expiringSoon: expiringSoon,
        totalEstimates: Object.keys(this.routeEstimates).length
    };
};

// Salva stato
DemandEstimationManager.prototype.saveState = function() {
    return {
        routeEstimates: this.routeEstimates,
        improvedEstimates: this.improvedEstimates,
        analysisState: this.analysisState
    };
};

// Carica stato
DemandEstimationManager.prototype.loadState = function(savedState) {
    if (savedState) {
        this.routeEstimates = savedState.routeEstimates || {};
        this.improvedEstimates = savedState.improvedEstimates || {};
        this.analysisState = Object.assign(this.analysisState, savedState.analysisState || {});
        
        console.log('📊 Stato DemandEstimationManager caricato:', 
                   Object.keys(this.routeEstimates).length, 'stime cached');
    }
};

// Export
window.DemandEstimationManager = DemandEstimationManager;
console.log('✅ DemandEstimationManager caricato');
