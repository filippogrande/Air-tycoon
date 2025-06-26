// Database degli aeromobili disponibili (versione compatibile)
console.log('📂 Caricamento AircraftData.js...');

// Funzione che restituisce la lista degli aeromobili
function getAircraftData() {
    return [
        // Aeromobili regionali
        {
            type: 'atr72',
            name: 'ATR 72-600',
            model: 'ATR 72-600',
            manufacturer: 'ATR',
            category: 'regional',
            capacity: 78,
            range: 1665,
            speed: 510,
            fuelConsumption: 2.2,
            price: 28000000,
            maintenanceCost: 450,
            yearIntroduced: 2010,
            description: 'Aeromobile regionale efficiente per rotte a corto raggio'
        },
        {
            type: 'dash8_q400',
            name: 'Bombardier Dash 8 Q400',
            model: 'Dash 8 Q400',
            manufacturer: 'Bombardier',
            category: 'regional',
            capacity: 86,
            range: 2040,
            speed: 667,
            fuelConsumption: 2.8,
            price: 32000000,
            maintenanceCost: 520,
            yearIntroduced: 1999,
            description: 'Aeromobile regionale versatile'
        },
        // Aeromobili a corridoio singolo
        {
            type: 'a320',
            name: 'Airbus A320',
            model: 'A320-200',
            manufacturer: 'Airbus',
            category: 'narrow_body',
            capacity: 180,
            range: 6150,
            speed: 828,
            fuelConsumption: 3.8,
            price: 110000000,
            maintenanceCost: 850,
            yearIntroduced: 1988,
            description: 'Aeromobile a corridoio singolo molto popolare'
        },
        {
            type: 'b737_800',
            name: 'Boeing 737-800',
            model: '737-800',
            manufacturer: 'Boeing',
            category: 'narrow_body',
            capacity: 189,
            range: 5765,
            speed: 842,
            fuelConsumption: 4.2,
            price: 112000000,
            maintenanceCost: 900,
            yearIntroduced: 1998,
            description: 'Versione estesa del popolare 737'
        },
        // Aeromobili a corridoio doppio
        {
            type: 'a350_900',
            name: 'Airbus A350-900',
            model: 'A350-900',
            manufacturer: 'Airbus',
            category: 'wide_body',
            capacity: 325,
            range: 15000,
            speed: 903,
            fuelConsumption: 5.8,
            price: 317000000,
            maintenanceCost: 1800,
            yearIntroduced: 2015,
            description: 'Aeromobile a lungo raggio di nuova generazione'
        },
        {
            type: 'b777_300er',
            name: 'Boeing 777-300ER',
            model: '777-300ER',
            manufacturer: 'Boeing',
            category: 'wide_body',
            capacity: 396,
            range: 14490,
            speed: 892,
            fuelConsumption: 6.8,
            price: 375000000,
            maintenanceCost: 2100,
            yearIntroduced: 2004,
            description: 'Aeromobile a lungo raggio ad alta capacità'
        }
    ];
}

// Classe compatibile AircraftData
class AircraftData {
    constructor() {
        // Non usato, tutti i metodi sono statici
    }
}

// Aggiungi i dati come proprietà statica
AircraftData.aircraft = getAircraftData();

// Metodi statici compatibili
AircraftData.getAllAircraft = function() {
    return AircraftData.aircraft.slice(); // Copia dell'array
};

AircraftData.getAircraftByType = function(type) {
    return AircraftData.aircraft.find(function(aircraft) {
        return aircraft.type === type;
    });
};

AircraftData.getAircraftByCategory = function(category) {
    return AircraftData.aircraft.filter(function(aircraft) {
        return aircraft.category === category;
    });
};

console.log('✅ AircraftData caricato, aeromobili disponibili:', AircraftData.aircraft.length);
