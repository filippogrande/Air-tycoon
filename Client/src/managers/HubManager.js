// HubManager - Gestione hub aeroportuali del giocatore

function HubManager(gameState) {
    this.gameState = gameState;
    this.playerHubs = {}; // { airportCode: hubData }
    this.hubUpgrades = {}; // { airportCode: { upgrade1: level, upgrade2: level } }
}

// Inizializza il primo hub gratuito
HubManager.prototype.initializeStartingHub = function(airportCode) {
    
    var airport = AirportData.getAirportByCode(airportCode);
    if (!airport) {
        console.error('❌ Aeroporto non trovato:', airportCode);
        return false;
    }
    
    this.playerHubs[airportCode] = {
        airportCode: airportCode,
        establishedDate: new Date().toISOString(),
        level: 1,
        isStartingHub: true,
        facilities: {
            terminals: 1,
            gates: 12,
            runways: 2,
            maintenanceHangar: 1,
            cargoTerminal: 1
        },
        upgrades: {
            passengerCapacity: 1,
            cargoCapacity: 1,
            fuelEfficiency: 1,
            maintenanceSpeed: 1,
            weatherResistance: 1
        },
        monthlyMaintenanceCost: 25000,
        reputation: 50
    };
    
    // Trigger auto-save per hub di partenza
    if (typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
        SaveLoad.triggerAutoSave('hub_partenza');
    }
    
    return true;
};

// Costruisce un nuovo hub (a pagamento)
HubManager.prototype.buildHub = function(airportCode) {
    if (this.playerHubs[airportCode]) {
        return { success: false, message: 'Hub già esistente in questo aeroporto' };
    }
    
    var airport = AirportData.getAirportByCode(airportCode);
    if (!airport) {
        return { success: false, message: 'Aeroporto non trovato' };
    }
    
    var buildCost = this.calculateHubBuildCost(airport);
    
    if (this.gameState.company.money < buildCost) {
        return { 
            success: false, 
            message: 'Fondi insufficienti. Costo: ' + uiUtils.formatCurrency(buildCost) 
        };
    }
    
    // Detrai costo
    this.gameState.company.money -= buildCost;
    
    // Crea hub
    this.playerHubs[airportCode] = {
        airportCode: airportCode,
        establishedDate: new Date().toISOString(),
        level: 1,
        isStartingHub: false,
        buildCost: buildCost,
        facilities: {
            terminals: 1,
            gates: 6,
            runways: 1,
            maintenanceHangar: 0,
            cargoTerminal: 0
        },
        upgrades: {
            passengerCapacity: 1,
            cargoCapacity: 1,
            fuelEfficiency: 1,
            maintenanceSpeed: 1,
            weatherResistance: 1
        },
        monthlyMaintenanceCost: this.calculateMaintenanceCost(airport),
        reputation: 30
    };
    
    
    // Trigger auto-save per costruzione hub
    if (typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
        SaveLoad.triggerAutoSave('costruzione_hub');
    }
    
    return { 
        success: true, 
        message: 'Hub costruito con successo!',
        cost: buildCost
    };
};

// Calcola costo costruzione hub
HubManager.prototype.calculateHubBuildCost = function(airport) {
    var baseCost = 5000000; // 5 milioni base
    
    // Fattori che influenzano il costo
    var sizeFactor = 1;
    if (airport.size === 'hub') sizeFactor = 2.5;
    else if (airport.size === 'large') sizeFactor = 2.0;
    else if (airport.size === 'medium') sizeFactor = 1.5;
    
    var demandFactor = airport.demandLevel / 50; // Normalizzato
    var economicFactor = airport.economicLevel / 50;
    
    return Math.round(baseCost * sizeFactor * demandFactor * economicFactor);
};

// Calcola costo manutenzione mensile
HubManager.prototype.calculateMaintenanceCost = function(airport) {
    var baseCost = 15000;
    
    var sizeFactor = 1;
    if (airport.size === 'hub') sizeFactor = 3;
    else if (airport.size === 'large') sizeFactor = 2;
    else if (airport.size === 'medium') sizeFactor = 1.5;
    
    return Math.round(baseCost * sizeFactor);
};

// Ottieni tutti gli hub del giocatore
HubManager.prototype.getPlayerHubs = function() {
    return this.playerHubs;
};

// Ottieni lista codici aeroporti hub del giocatore
HubManager.prototype.getPlayerHubCodes = function() {
    return Object.keys(this.playerHubs);
};

// Ottieni lista codici hub del giocatore
HubManager.prototype.getPlayerHubCodes = function() {
    return Object.keys(this.playerHubs);
};

// Verifica se il giocatore possiede un hub
HubManager.prototype.hasHub = function(airportCode) {
    return this.playerHubs.hasOwnProperty(airportCode);
};

// Ottieni info hub specifico
HubManager.prototype.getHub = function(airportCode) {
    return this.playerHubs[airportCode] || null;
};

// Migliora hub (future implementazioni)
HubManager.prototype.upgradeHub = function(airportCode, upgradeType) {
    var hub = this.playerHubs[airportCode];
    if (!hub) {
        return { success: false, message: 'Hub non trovato' };
    }
    
    // TODO: Implementare sistema upgrade
    return { success: false, message: 'Sistema upgrade in sviluppo' };
};

// Calcola costi manutenzione totali mensili
HubManager.prototype.getTotalMonthlyMaintenanceCost = function() {
    var total = 0;
    for (var hubCode in this.playerHubs) {
        total += this.playerHubs[hubCode].monthlyMaintenanceCost;
    }
    return total;
};

// Applica costi manutenzione (chiamato ogni mese di gioco)
HubManager.prototype.applyMonthlyMaintenance = function() {
    var totalCost = this.getTotalMonthlyMaintenanceCost();
    
    if (this.gameState.company.money >= totalCost) {
        this.gameState.company.money -= totalCost;
        return { success: true, cost: totalCost };
    } else {
        // Penalità per mancato pagamento
        console.warn('⚠️ Fondi insufficienti per manutenzione hub');
        this.gameState.company.reputation -= 5;
        return { success: false, cost: totalCost, penalty: true };
    }
};

// Ottieni statistiche hub
HubManager.prototype.getHubStats = function() {
    var hubCount = Object.keys(this.playerHubs).length;
    var totalMaintenance = this.getTotalMonthlyMaintenanceCost();
    var totalGates = 0;
    var totalRunways = 0;
    
    for (var hubCode in this.playerHubs) {
        var hub = this.playerHubs[hubCode];
        totalGates += hub.facilities.gates;
        totalRunways += hub.facilities.runways;
    }
    
    return {
        hubCount: hubCount,
        totalMaintenance: totalMaintenance,
        totalGates: totalGates,
        totalRunways: totalRunways
    };
};

// Serializzazione per salvataggio
HubManager.prototype.serialize = function() {
    return {
        playerHubs: this.playerHubs,
        hubUpgrades: this.hubUpgrades
    };
};

// Deserializzazione da salvataggio
HubManager.prototype.deserialize = function(data) {
    if (data) {
        this.playerHubs = data.playerHubs || {};
        this.hubUpgrades = data.hubUpgrades || {};
    }
};

window.HubManager = HubManager;
