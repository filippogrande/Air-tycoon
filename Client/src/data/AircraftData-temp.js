// File temporaneo con dati aeromobili di base per il testing
// Questo file sarà sostituito dai dati del database quando il server funzionerà

console.log('⚠️ Caricamento AircraftData temporaneo per testing...');

const tempAircraftData = {
    'a320': {
        name: 'Airbus A320',
        model: 'A320',
        manufacturer: 'Airbus',
        category: 'narrow-body',
        capacity: 160,
        range: 6100,
        speed: 840,
        fuelConsumption: 2.4,
        price: 101000000,
        maintenanceCost: 5000,
        yearIntroduced: 1988
    },
    'b737': {
        name: 'Boeing 737',
        model: '737-800',
        manufacturer: 'Boeing',
        category: 'narrow-body',
        capacity: 162,
        range: 5765,
        speed: 838,
        fuelConsumption: 2.3,
        price: 96000000,
        maintenanceCost: 4800,
        yearIntroduced: 1998
    },
    'a350': {
        name: 'Airbus A350',
        model: 'A350-900',
        manufacturer: 'Airbus',
        category: 'wide-body',
        capacity: 325,
        range: 15000,
        speed: 903,
        fuelConsumption: 2.9,
        price: 317000000,
        maintenanceCost: 12000,
        yearIntroduced: 2015
    }
};

// Crea oggetto AircraftData con metodo getAircraftByType
window.AircraftData = {
    getAircraftByType: function(type) {
        console.log('🛩️ Richiesta dati aeromobile:', type);
        return tempAircraftData[type.toLowerCase()] || tempAircraftData['a320'];
    },
    
    getAllAircraft: function() {
        return tempAircraftData;
    }
};

console.log('✅ AircraftData temporaneo caricato con successo');
