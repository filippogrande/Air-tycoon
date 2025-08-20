// InfrastructureManager - Gestisce l'evoluzione delle infrastrutture terrestri
console.log('📂 Caricamento InfrastructureManager.js...');

function InfrastructureManager(gameState) {
    this.gameState = gameState;
    
    // Storico infrastrutture per regione/paese
    this.infrastructureData = {};
    
    // Anno base del gioco (viene impostato quando il gioco inizia)
    this.baseYear = 1960;
    
    // Configurazione sviluppo infrastrutture
    this.config = {
        // Soglie di distanza per l'impatto delle infrastrutture
        minDistanceForImpact: 50,    // km - sotto questa distanza, impatto massimo
        maxDistanceForImpact: 500,   // km - sopra questa distanza, impatto minimo
        
        // Periodi di sviluppo infrastrutturale
        railwayBoomStart: 1960,      // Inizio boom ferroviario
        railwayBoomPeak: 1980,       // Picco boom ferroviario
        railwayBoomEnd: 2000,        // Fine boom ferroviario
        
        highwayBoomStart: 1970,      // Inizio boom autostrade
        highwayBoomPeak: 1990,       // Picco boom autostrade
        highwayBoomEnd: 2010,        // Fine boom autostrade
        
        highSpeedRailStart: 1990,    // Inizio treni ad alta velocità (TGV era operativo)
        highSpeedRailPeak: 2010,     // Picco treni ad alta velocità (Frecciarossa, ICE, AVE, ecc.)
        
        // Intensità massima dell'impatto
        maxRailwayImpact: 0.3,       // Riduzione massima domanda per ferrovia
        maxHighwayImpact: 0.25,      // Riduzione massima domanda per autostrade  
        maxHighSpeedRailImpact: 0.7  // Riduzione massima domanda per alta velocità (impatto maggiore)
    };
    
    console.log('🏗️ InfrastructureManager inizializzato');
}

// Inizializza dati infrastrutture per una regione
InfrastructureManager.prototype.initializeRegionData = function(regionCode) {
    if (!this.infrastructureData[regionCode]) {
        this.infrastructureData[regionCode] = {
            railwayDevelopment: 0,      // 0-1, livello sviluppo ferroviario
            highwayDevelopment: 0,      // 0-1, livello sviluppo autostradale
            highSpeedRailDevelopment: 0, // 0-1, livello sviluppo alta velocità
            
            // Fattori regionali
            economicDevelopment: this.getRegionalEconomicLevel(regionCode),
            geographicDifficulty: this.getRegionalGeographicDifficulty(regionCode)
        };
    }
};

// Ottieni livello economico regionale (influenza velocità sviluppo)
InfrastructureManager.prototype.getRegionalEconomicLevel = function(regionCode) {
    // Classificazione più realistica per continenti/paesi
    var veryHighDevRegions = ['DEU', 'FRA', 'JPN', 'CHE', 'NLD', 'BEL', 'AUT'];  // Germania, Francia, Giappone, etc.
    var highDevRegions = ['GBR', 'ITA', 'ESP', 'USA', 'CAN', 'AUS', 'SWE', 'NOR', 'DNK']; // UK, Italia, Spagna, USA, etc.
    var mediumDevRegions = ['RUS', 'CHN', 'BRA', 'MEX', 'ARG', 'POL', 'CZE', 'KOR']; // Russia, Cina, Brasile, etc.
    var lowDevRegions = ['IND', 'THA', 'TUR', 'ZAF', 'EGY', 'MAR']; // India, Thailandia, Turchia, etc.
    
    // Controllo specifico per codici paese
    if (veryHighDevRegions.some(r => regionCode.includes(r))) {
        return 0.95;
    } else if (highDevRegions.some(r => regionCode.includes(r))) {
        return 0.8;
    } else if (mediumDevRegions.some(r => regionCode.includes(r))) {
        return 0.5;
    } else if (lowDevRegions.some(r => regionCode.includes(r))) {
        return 0.3;
    }
    
    // Fallback per continenti generici
    if (regionCode.startsWith('EUR')) return 0.75; // Europa media
    if (regionCode.startsWith('NAM')) return 0.85; // Nord America
    if (regionCode.startsWith('ASI')) return 0.4;  // Asia media
    if (regionCode.startsWith('AUS')) return 0.8;  // Australia
    if (regionCode.startsWith('SAM')) return 0.4;  // Sud America
    if (regionCode.startsWith('AFR')) return 0.2;  // Africa (basso sviluppo infrastrutturale)
    
    return 0.25; // Default molto basso
};

// Ottieni difficoltà geografica regionale (influenza costi sviluppo)
InfrastructureManager.prototype.getRegionalGeographicDifficulty = function(regionCode) {
    // Montagne, isole = difficoltà alta
    var difficultRegions = ['ALP', 'AND', 'HIM', 'ISL'];
    var mediumDifficultyRegions = ['EUR', 'NAM'];
    
    if (difficultRegions.some(r => regionCode.includes(r))) {
        return 0.8;
    } else if (mediumDifficultyRegions.some(r => regionCode.startsWith(r))) {
        return 0.4;
    }
    return 0.2; // Pianure, facile accesso
};

// Aggiorna sviluppo infrastrutture per un mese
InfrastructureManager.prototype.advanceMonth = function() {
    var currentYear = this.baseYear + Math.floor(this.gameState.gameMonth / 12);
    
    for (var regionCode in this.infrastructureData) {
        this.updateRegionInfrastructure(regionCode, currentYear);
    }
    
    console.log('🏗️ Infrastrutture aggiornate per anno', currentYear);
};

// Aggiorna infrastrutture di una regione
InfrastructureManager.prototype.updateRegionInfrastructure = function(regionCode, currentYear) {
    var data = this.infrastructureData[regionCode];
    var config = this.config;
    var characteristics = this.getRegionalTransportCharacteristics(regionCode);
    
    // Sviluppo ferroviario
    var railwayProgress = this.calculateInfrastructureProgress(
        currentYear,
        config.railwayBoomStart,
        config.railwayBoomPeak,
        config.railwayBoomEnd,
        data.economicDevelopment,
        data.geographicDifficulty
    ) * characteristics.railwayFocus;
    data.railwayDevelopment = Math.min(1, data.railwayDevelopment + railwayProgress);
    
    // Sviluppo autostradale
    var highwayProgress = this.calculateInfrastructureProgress(
        currentYear,
        config.highwayBoomStart,
        config.highwayBoomPeak,
        config.highwayBoomEnd,
        data.economicDevelopment,
        data.geographicDifficulty
    ) * characteristics.highwayFocus;
    data.highwayDevelopment = Math.min(1, data.highwayDevelopment + highwayProgress);
    
    // Sviluppo alta velocità ferroviaria
    if (currentYear >= config.highSpeedRailStart) {
        var hsrProgress = this.calculateInfrastructureProgress(
            currentYear,
            config.highSpeedRailStart,
            config.highSpeedRailPeak,
            config.highSpeedRailPeak + 30, // Sviluppo continuo fino a 2040
            data.economicDevelopment,
            data.geographicDifficulty
        ) * 0.3 * characteristics.highSpeedRailCapability; // Sviluppo più lento e regione-specifico
        data.highSpeedRailDevelopment = Math.min(1, data.highSpeedRailDevelopment + hsrProgress);
    }
};

// Calcola progresso mensile infrastrutture
InfrastructureManager.prototype.calculateInfrastructureProgress = function(
    currentYear, startYear, peakYear, endYear, economicLevel, geographicDifficulty
) {
    if (currentYear < startYear || currentYear > endYear) {
        return 0;
    }
    
    var baseProgress;
    if (currentYear <= peakYear) {
        // Fase di crescita
        var growthProgress = (currentYear - startYear) / (peakYear - startYear);
        baseProgress = 0.02 * Math.sin(growthProgress * Math.PI / 2); // Crescita progressiva
    } else {
        // Fase di declino
        var declineProgress = (currentYear - peakYear) / (endYear - peakYear);
        baseProgress = 0.02 * Math.cos(declineProgress * Math.PI / 2); // Declino progressivo
    }
    
    // Applica fattori regionali
    var economicMultiplier = 0.5 + (economicLevel * 0.5); // 0.5-1.0
    var difficultyMultiplier = 1.2 - geographicDifficulty; // 0.4-1.2
    
    return baseProgress * economicMultiplier * difficultyMultiplier / 12; // Progresso mensile
};

// Calcola impatto infrastrutture sulla domanda di una rotta
InfrastructureManager.prototype.getInfrastructureImpact = function(origin, destination, distance) {
    // Determina regioni degli aeroporti
    var originRegion = this.getAirportRegion(origin);
    var destinationRegion = this.getAirportRegion(destination);
    
    // Inizializza dati se necessario
    this.initializeRegionData(originRegion);
    this.initializeRegionData(destinationRegion);
    
    // Calcola impatto basato su distanza
    var distanceImpact = this.calculateDistanceImpact(distance);
    if (distanceImpact === 0) {
        return 1.0; // Nessun impatto per rotte lunghe
    }
    
    // Ottieni livelli infrastrutture (media tra origine e destinazione)
    var avgInfrastructure = this.getAverageInfrastructure(originRegion, destinationRegion);
    
    // Calcola riduzione totale domanda
    var totalReduction = 0;
    
    totalReduction += avgInfrastructure.railway * this.config.maxRailwayImpact;
    totalReduction += avgInfrastructure.highway * this.config.maxHighwayImpact;
    totalReduction += avgInfrastructure.highSpeedRail * this.config.maxHighSpeedRailImpact;
    
    // Applica l'impatto della distanza
    totalReduction *= distanceImpact;
    
    // Ritorna moltiplicatore (1.0 = nessun impatto, 0.0 = domanda azzerata)
    return Math.max(0.1, 1.0 - totalReduction);
};

// Calcola impatto basato sulla distanza
InfrastructureManager.prototype.calculateDistanceImpact = function(distance) {
    var config = this.config;
    
    if (distance <= config.minDistanceForImpact) {
        return 1.0; // Impatto massimo per rotte molto brevi
    } else if (distance >= config.maxDistanceForImpact) {
        return 0.0; // Nessun impatto per rotte lunghe
    } else {
        // Impatto decrescente linearmente
        return 1.0 - ((distance - config.minDistanceForImpact) / 
                     (config.maxDistanceForImpact - config.minDistanceForImpact));
    }
};

// Ottieni media infrastrutture tra due regioni
InfrastructureManager.prototype.getAverageInfrastructure = function(regionA, regionB) {
    var dataA = this.infrastructureData[regionA];
    var dataB = this.infrastructureData[regionB];
    
    return {
        railway: (dataA.railwayDevelopment + dataB.railwayDevelopment) / 2,
        highway: (dataA.highwayDevelopment + dataB.highwayDevelopment) / 2,
        highSpeedRail: (dataA.highSpeedRailDevelopment + dataB.highSpeedRailDevelopment) / 2
    };
};

// Determina regione di un aeroporto (semplificato)
InfrastructureManager.prototype.getAirportRegion = function(airport) {
    // Usa codice paese come regione (semplificazione)
    if (airport.country) {
        return airport.country;
    }
    
    // Fallback basato su codice aeroporto
    var code = airport.code || airport.iata || airport.icao;
    if (code) {
        // Mapping semplificato basato su prima lettera
        var firstLetter = code.charAt(0).toUpperCase();
        if (['E', 'L'].includes(firstLetter)) return 'EUR';
        if (['K', 'C'].includes(firstLetter)) return 'NAM';
        if (['R', 'U'].includes(firstLetter)) return 'RUS';
        if (['V', 'Z'].includes(firstLetter)) return 'ASI';
        if (['Y'].includes(firstLetter)) return 'AUS';
        if (['S'].includes(firstLetter)) return 'SAM';
    }
    
    return 'OTH'; // Altro
};

// Ottieni stato infrastrutture per l'UI
InfrastructureManager.prototype.getInfrastructureStatus = function() {
    var currentYear = this.baseYear + Math.floor(this.gameState.gameMonth / 12);
    var status = {
        currentYear: currentYear,
        globalTrends: this.getGlobalTrends(currentYear),
        regionData: {}
    };
    
    for (var region in this.infrastructureData) {
        var data = this.infrastructureData[region];
        status.regionData[region] = {
            railway: Math.round(data.railwayDevelopment * 100),
            highway: Math.round(data.highwayDevelopment * 100),
            highSpeedRail: Math.round(data.highSpeedRailDevelopment * 100)
        };
    }
    
    return status;
};

// Ottieni tendenze globali correnti
InfrastructureManager.prototype.getGlobalTrends = function(currentYear) {
    var trends = [];
    
    if (currentYear >= this.config.railwayBoomStart && currentYear <= this.config.railwayBoomEnd) {
        if (currentYear <= this.config.railwayBoomPeak) {
            trends.push('🚂 Espansione delle reti ferroviarie');
        } else {
            trends.push('🚂 Consolidamento delle ferrovie esistenti');
        }
    }
    
    if (currentYear >= this.config.highwayBoomStart && currentYear <= this.config.highwayBoomEnd) {
        if (currentYear <= this.config.highwayBoomPeak) {
            trends.push('🛣️ Era delle autostrade');
        } else {
            trends.push('🛣️ Completamento reti autostradali');
        }
    }
    
    if (currentYear >= this.config.highSpeedRailStart) {
        if (currentYear < 2000) {
            trends.push('🚄 Pionieri dell\'alta velocità (TGV, Shinkansen)');
        } else if (currentYear < 2015) {
            trends.push('🚄 Boom treni alta velocità (Frecciarossa, ICE, AVE)');
        } else {
            trends.push('🚄 Era matura dell\'alta velocità ferroviaria');
        }
    }
    
    // Aggiungi tendenze specifiche per anni
    if (currentYear >= 2020) {
        trends.push('🌱 Focus su sostenibilità dei trasporti');
    }
    
    if (trends.length === 0) {
        trends.push('🚗 Era pre-moderna dei trasporti');
    }
    
    return trends;
};

// Salva stato
InfrastructureManager.prototype.saveState = function() {
    return {
        infrastructureData: this.infrastructureData,
        baseYear: this.baseYear
    };
};

// Carica stato
InfrastructureManager.prototype.loadState = function(data) {
    if (data) {
        this.infrastructureData = data.infrastructureData || {};
        this.baseYear = data.baseYear || 1960;
        console.log('🏗️ Stato InfrastructureManager caricato');
    }
};

// Ottieni caratteristiche specifiche di trasporto per regione
InfrastructureManager.prototype.getRegionalTransportCharacteristics = function(regionCode) {
    var characteristics = {
        railwayFocus: 1.0,      // Quanto la regione si concentra su ferrovie
        highwayFocus: 1.0,      // Quanto la regione si concentra su autostrade  
        highSpeedRailCapability: 1.0  // Capacità di sviluppare alta velocità
    };
    
    // Caratteristiche specifiche per paese/regione
    if (regionCode.includes('USA') || regionCode.includes('CAN')) {
        // Nord America: focus su autostrade, ferrovie passeggeri limitate
        characteristics.railwayFocus = 0.3;
        characteristics.highwayFocus = 1.5;
        characteristics.highSpeedRailCapability = 0.2; // Pochissimi treni ad alta velocità
    } else if (regionCode.includes('JPN')) {
        // Giappone: pioniere dell'alta velocità
        characteristics.railwayFocus = 1.5;
        characteristics.highwayFocus = 0.8;
        characteristics.highSpeedRailCapability = 1.8;
    } else if (regionCode.includes('FRA') || regionCode.includes('DEU') || regionCode.includes('ESP')) {
        // Europa occidentale: bilanciamento, buona alta velocità
        characteristics.railwayFocus = 1.2;
        characteristics.highwayFocus = 1.1;
        characteristics.highSpeedRailCapability = 1.4;
    } else if (regionCode.includes('ITA')) {
        // Italia: ottima alta velocità, autostrade buone
        characteristics.railwayFocus = 1.1;
        characteristics.highwayFocus = 1.2;
        characteristics.highSpeedRailCapability = 1.3;
    } else if (regionCode.includes('CHN')) {
        // Cina: sviluppo massivo di alta velocità recente
        characteristics.railwayFocus = 1.3;
        characteristics.highwayFocus = 1.0;
        characteristics.highSpeedRailCapability = 1.6;
    } else if (regionCode.includes('GBR')) {
        // Regno Unito: ferrovie storiche, autostrade moderate
        characteristics.railwayFocus = 1.0;
        characteristics.highwayFocus = 0.9;
        characteristics.highSpeedRailCapability = 0.6; // Eurostar limitato
    } else if (regionCode.includes('RUS')) {
        // Russia: ferrovie importanti per le distanze, poche autostrade
        characteristics.railwayFocus = 1.4;
        characteristics.highwayFocus = 0.6;
        characteristics.highSpeedRailCapability = 0.3;
    } else if (regionCode.startsWith('AFR')) {
        // Africa: infrastrutture limitate
        characteristics.railwayFocus = 0.4;
        characteristics.highwayFocus = 0.5;
        characteristics.highSpeedRailCapability = 0.1;
    } else if (regionCode.startsWith('SAM')) {
        // Sud America: focus su autostrade, ferrovie limitate
        characteristics.railwayFocus = 0.6;
        characteristics.highwayFocus = 1.2;
        characteristics.highSpeedRailCapability = 0.2;
    }
    
    return characteristics;
};

console.log('✅ InfrastructureManager caricato');
