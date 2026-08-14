// FleetManager compatibile con tutti i browser

function FleetManager(gameState) {
    this.gameState = gameState;
}

// Aggiunge un aeromobile alla flotta
FleetManager.prototype.addAircraft = function(aircraftData, customName) {
    if (customName === undefined) customName = null;
    
    try {
        var aircraft = new Aircraft(aircraftData.type, customName);
        this.gameState.fleet.push(aircraft);
        
        
        // Trigger auto-save per aggiunta aeromobile
        if (typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
            SaveLoad.triggerAutoSave('acquisto_aeromobile');
        }
        
        return aircraft;
    } catch (error) {
        console.error('Errore nell\'aggiunta dell\'aeromobile:', error);
        return null;
    }
};

// Rimuove un aeromobile dalla flotta
FleetManager.prototype.removeAircraft = function(aircraftId) {
    for (var i = this.gameState.fleet.length - 1; i >= 0; i--) {
        if (this.gameState.fleet[i].id === aircraftId) {
            var aircraft = this.gameState.fleet[i];
            this.gameState.fleet.splice(i, 1);
            
            // Trigger auto-save per rimozione aeromobile
            if (typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
                SaveLoad.triggerAutoSave('vendita_aeromobile');
            }
            
            return aircraft;
        }
    }
    console.warn('⚠️ Aeromobile non trovato: ' + aircraftId);
    return null;
};

// Ottiene un aeromobile per ID
FleetManager.prototype.getAircraft = function(aircraftId) {
    for (var i = 0; i < this.gameState.fleet.length; i++) {
        if (this.gameState.fleet[i].id === aircraftId) {
            return this.gameState.fleet[i];
        }
    }
    return null;
};

// Ottiene tutti gli aeromobili
FleetManager.prototype.getAllAircraft = function() {
    return this.gameState.fleet.slice(); // Copia dell'array
};

// Ottiene aeromobili disponibili
FleetManager.prototype.getAvailableAircraft = function() {
    var available = [];
    for (var i = 0; i < this.gameState.fleet.length; i++) {
        if (this.gameState.fleet[i].status === 'available') {
            available.push(this.gameState.fleet[i]);
        }
    }
    return available;
};

// Ottiene aeromobili per tipo
FleetManager.prototype.getAircraftByType = function(type) {
    var result = [];
    for (var i = 0; i < this.gameState.fleet.length; i++) {
        if (this.gameState.fleet[i].type === type) {
            result.push(this.gameState.fleet[i]);
        }
    }
    return result;
};

// Acquista un aeromobile
FleetManager.prototype.purchaseAircraft = function(aircraftType, customName) {
    if (customName === undefined) customName = null;
    
    var aircraftData = AircraftData.getAircraftByType(aircraftType);
    if (!aircraftData) {
        console.error('❌ Tipo di aeromobile non valido: ' + aircraftType);
        return null;
    }
    
    if (!this.gameState.canAfford(aircraftData.price)) {
        console.error('❌ Fondi insufficienti per acquistare: ' + aircraftData.name);
        return null;
    }
    
    var aircraft = this.addAircraft(aircraftData, customName);
    if (aircraft) {
        this.gameState.subtractMoney(aircraftData.price);
        
        // Aggiorna i soldi della compagnia
        if (window.game && window.game.state) {
            window.game.state.money -= aircraftData.price;
        }
    }
    
    return aircraft;
};

// Vende un aeromobile
FleetManager.prototype.sellAircraft = function(aircraftId) {
    var aircraft = this.getAircraft(aircraftId);
    if (!aircraft) {
        console.error('❌ Aeromobile non trovato: ' + aircraftId);
        return false;
    }
    
    var sellPrice = aircraft.retire();
    this.removeAircraft(aircraftId);
    this.gameState.addMoney(sellPrice);
    
    return true;
};

// Esegue manutenzione su un aeromobile
FleetManager.prototype.performMaintenance = function(aircraftId) {
    var aircraft = this.getAircraft(aircraftId);
    if (!aircraft) {
        console.error('❌ Aeromobile non trovato: ' + aircraftId);
        return false;
    }
    
    var cost = aircraft.performMaintenance();
    if (this.gameState.canAfford(cost)) {
        this.gameState.subtractMoney(cost);
        return true;
    } else {
        console.error('❌ Fondi insufficienti per la manutenzione');
        return false;
    }
};

// Ottiene statistiche della flotta
FleetManager.prototype.getFleetStatistics = function() {
    var stats = {
        totalAircraft: this.gameState.fleet.length,
        availableAircraft: 0,
        flyingAircraft: 0,
        maintenanceAircraft: 0,
        retiredAircraft: 0,
        totalValue: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        averageCondition: 0,
        totalFlightHours: 0
    };
    
    if (this.gameState.fleet.length === 0) {
        return stats;
    }
    
    var totalCondition = 0;
    
    for (var i = 0; i < this.gameState.fleet.length; i++) {
        var aircraft = this.gameState.fleet[i];
        
        // Conteggio per status
        switch (aircraft.status) {
            case 'available':
                stats.availableAircraft++;
                break;
            case 'flying':
                stats.flyingAircraft++;
                break;
            case 'maintenance':
                stats.maintenanceAircraft++;
                break;
            case 'retired':
                stats.retiredAircraft++;
                break;
        }
        
        // Somme
        stats.totalValue += aircraft.purchasePrice * (aircraft.condition / 100) * 0.5;
        stats.totalRevenue += aircraft.totalRevenue || 0;
        stats.totalExpenses += aircraft.totalExpenses || 0;
        stats.totalFlightHours += aircraft.totalFlightHours || 0;
        totalCondition += aircraft.condition || 100;
    }
    
    stats.averageCondition = totalCondition / this.gameState.fleet.length;
    
    return stats;
};

// Ottiene aeromobili che necessitano manutenzione
FleetManager.prototype.getAircraftNeedingMaintenance = function() {
    var needMaintenance = [];
    for (var i = 0; i < this.gameState.fleet.length; i++) {
        if (this.gameState.fleet[i].needsMaintenance && this.gameState.fleet[i].needsMaintenance()) {
            needMaintenance.push(this.gameState.fleet[i]);
        }
    }
    return needMaintenance;
};

// Ottiene il miglior aeromobile per una rotta
FleetManager.prototype.getBestAircraftForRoute = function(distance, passengerDemand) {
    var availableAircraft = this.getAvailableAircraft();
    var bestAircraft = null;
    var bestScore = -1;
    
    for (var i = 0; i < availableAircraft.length; i++) {
        var aircraft = availableAircraft[i];
        
        // Verifica se può coprire la distanza
        if (!aircraft.canFly || !aircraft.canFly(distance)) {
            continue;
        }
        
        // Calcola punteggio (semplificato)
        var capacityScore = Math.min(1, aircraft.capacity / passengerDemand);
        var efficiencyScore = 1 / (aircraft.fuelConsumption || 1);
        var conditionScore = aircraft.condition / 100;
        
        var totalScore = capacityScore + efficiencyScore + conditionScore;
        
        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestAircraft = aircraft;
        }
    }
    
    return bestAircraft;
};

// Aggiorna tutti gli aeromobili (chiamato dal game loop)
FleetManager.prototype.update = function(deltaTime) {
    // Placeholder per aggiornamenti futuri
    // Es: degrado automatico, manutenzione automatica, ecc.
};

// Rendi disponibile globalmente
window.FleetManager = FleetManager;

