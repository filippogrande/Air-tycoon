// Database degli aeromobili disponibili
class AircraftData {
    static aircraft = [
        // Aeromobili regionali
        {
            type: 'atr72',
            name: 'ATR 72-600',
            model: 'ATR 72-600',
            manufacturer: 'ATR',
            category: 'regional',
            capacity: 78,
            range: 1500, // km
            speed: 510, // km/h
            fuelConsumption: 2.8, // litri per km
            price: 26000000, // €26M
            maintenanceCost: 450, // €/ora
            yearIntroduced: 2010,
            description: 'Aeromobile regionale turboprop efficiente per rotte corte'
        },
        {
            type: 'embraer175',
            name: 'Embraer E175',
            model: 'E-Jet E175',
            manufacturer: 'Embraer',
            category: 'regional',
            capacity: 88,
            range: 3700,
            speed: 870,
            fuelConsumption: 3.2,
            price: 48000000, // €48M
            maintenanceCost: 650,
            yearIntroduced: 2005,
            description: 'Jet regionale moderno per rotte medie'
        },
        {
            type: 'crj900',
            name: 'Bombardier CRJ900',
            model: 'CRJ900',
            manufacturer: 'Bombardier',
            category: 'regional',
            capacity: 90,
            range: 2876,
            speed: 870,
            fuelConsumption: 3.1,
            price: 47000000,
            maintenanceCost: 620,
            yearIntroduced: 2003,
            description: 'Jet regionale affidabile'
        },
        
        // Aeromobili narrow-body
        {
            type: 'a320',
            name: 'Airbus A320',
            model: 'A320-200',
            manufacturer: 'Airbus',
            category: 'narrow-body',
            capacity: 180,
            range: 6150,
            speed: 840,
            fuelConsumption: 3.8,
            price: 101000000, // €101M
            maintenanceCost: 850,
            yearIntroduced: 1988,
            description: 'Aeromobile di linea molto popolare per rotte medie'
        },
        {
            type: 'a321',
            name: 'Airbus A321',
            model: 'A321-200',
            manufacturer: 'Airbus',
            category: 'narrow-body',
            capacity: 220,
            range: 5950,
            speed: 840,
            fuelConsumption: 4.2,
            price: 118000000,
            maintenanceCost: 920,
            yearIntroduced: 1994,
            description: 'Versione allungata dell\'A320 con maggiore capacità'
        },
        {
            type: 'b737-800',
            name: 'Boeing 737-800',
            model: '737-800',
            manufacturer: 'Boeing',
            category: 'narrow-body',
            capacity: 189,
            range: 5765,
            speed: 840,
            fuelConsumption: 3.9,
            price: 106000000,
            maintenanceCost: 880,
            yearIntroduced: 1998,
            description: 'Workhorse dell\'aviazione commerciale'
        },
        {
            type: 'b737max',
            name: 'Boeing 737 MAX 8',
            model: '737 MAX 8',
            manufacturer: 'Boeing',
            category: 'narrow-body',
            capacity: 189,
            range: 6570,
            speed: 840,
            fuelConsumption: 3.4,
            price: 121000000,
            maintenanceCost: 750,
            yearIntroduced: 2017,
            description: 'Versione moderna ed efficiente del 737'
        },
        
        // Aeromobili wide-body
        {
            type: 'a330-300',
            name: 'Airbus A330-300',
            model: 'A330-300',
            manufacturer: 'Airbus',
            category: 'wide-body',
            capacity: 335,
            range: 11750,
            speed: 870,
            fuelConsumption: 5.8,
            price: 264000000, // €264M
            maintenanceCost: 1450,
            yearIntroduced: 1994,
            description: 'Aeromobile wide-body per rotte intercontinentali'
        },
        {
            type: 'a350-900',
            name: 'Airbus A350-900',
            model: 'A350-900',
            manufacturer: 'Airbus',
            category: 'wide-body',
            capacity: 325,
            range: 15000,
            speed: 900,
            fuelConsumption: 4.9,
            price: 317000000,
            maintenanceCost: 1200,
            yearIntroduced: 2015,
            description: 'Aeromobile di nuova generazione molto efficiente'
        },
        {
            type: 'b777-300er',
            name: 'Boeing 777-300ER',
            model: '777-300ER',
            manufacturer: 'Boeing',
            category: 'wide-body',
            capacity: 396,
            range: 14685,
            speed: 890,
            fuelConsumption: 6.2,
            price: 375000000,
            maintenanceCost: 1550,
            yearIntroduced: 2004,
            description: 'Aeromobile a lungo raggio ad alta capacità'
        },
        {
            type: 'b787-9',
            name: 'Boeing 787-9 Dreamliner',
            model: '787-9',
            manufacturer: 'Boeing',
            category: 'wide-body',
            capacity: 290,
            range: 14800,
            speed: 900,
            fuelConsumption: 4.7,
            price: 292000000,
            maintenanceCost: 1100,
            yearIntroduced: 2014,
            description: 'Dreamliner efficiente per rotte lunghe'
        },
        
        // Aeromobili cargo
        {
            type: 'b747-8f',
            name: 'Boeing 747-8F',
            model: '747-8F',
            manufacturer: 'Boeing',
            category: 'cargo',
            capacity: 0, // cargo capacity in tons: 140
            cargoCapacity: 140,
            range: 8130,
            speed: 900,
            fuelConsumption: 8.5,
            price: 418000000,
            maintenanceCost: 2200,
            yearIntroduced: 2011,
            description: 'Cargo freighter di grandi dimensioni'
        },
        {
            type: 'a330-200f',
            name: 'Airbus A330-200F',
            model: 'A330-200F',
            manufacturer: 'Airbus',
            category: 'cargo',
            capacity: 0,
            cargoCapacity: 70,
            range: 7400,
            speed: 870,
            fuelConsumption: 6.1,
            price: 238000000,
            maintenanceCost: 1650,
            yearIntroduced: 2010,
            description: 'Cargo freighter medio-lungo raggio'
        }
    ];
    
    // Ottiene tutti gli aeromobili
    static getAllAircraft() {
        return [...this.aircraft];
    }
    
    // Ottiene un aeromobile per tipo
    static getAircraftByType(type) {
        return this.aircraft.find(aircraft => aircraft.type === type);
    }
    
    // Ottiene aeromobili per categoria
    static getAircraftByCategory(category) {
        return this.aircraft.filter(aircraft => aircraft.category === category);
    }
    
    // Ottiene aeromobili per costruttore
    static getAircraftByManufacturer(manufacturer) {
        return this.aircraft.filter(aircraft => aircraft.manufacturer === manufacturer);
    }
    
    // Ottiene tutti i tipi disponibili
    static getAllAircraftTypes() {
        return this.aircraft.map(aircraft => aircraft.type);
    }
    
    // Ottiene tutte le categorie
    static getAllCategories() {
        return [...new Set(this.aircraft.map(aircraft => aircraft.category))];
    }
    
    // Ottiene tutti i costruttori
    static getAllManufacturers() {
        return [...new Set(this.aircraft.map(aircraft => aircraft.manufacturer))];
    }
    
    // Filtra aeromobili per range di prezzo
    static getAircraftByPriceRange(minPrice, maxPrice) {
        return this.aircraft.filter(aircraft => 
            aircraft.price >= minPrice && aircraft.price <= maxPrice
        );
    }
    
    // Filtra aeromobili per capacità
    static getAircraftByCapacity(minCapacity, maxCapacity) {
        return this.aircraft.filter(aircraft => 
            aircraft.capacity >= minCapacity && aircraft.capacity <= maxCapacity
        );
    }
    
    // Filtra aeromobili per raggio d'azione
    static getAircraftByRange(minRange, maxRange = Infinity) {
        return this.aircraft.filter(aircraft => 
            aircraft.range >= minRange && aircraft.range <= maxRange
        );
    }
    
    // Trova gli aeromobili più adatti per una rotta
    static findSuitableAircraft(distance, passengerDemand, budget = Infinity) {
        return this.aircraft.filter(aircraft => {
            // Deve poter volare la distanza
            if (aircraft.range < distance) return false;
            
            // Deve essere nel budget
            if (aircraft.price > budget) return false;
            
            // La capacità dovrebbe essere ragionevole per la domanda
            if (aircraft.capacity && aircraft.capacity < passengerDemand * 0.3) return false;
            if (aircraft.capacity && aircraft.capacity > passengerDemand * 3) return false;
            
            return true;
        }).sort((a, b) => {
            // Ordina per efficienza (capacità vs costi)
            const efficiencyA = a.capacity / (a.fuelConsumption * distance + a.maintenanceCost);
            const efficiencyB = b.capacity / (b.fuelConsumption * distance + b.maintenanceCost);
            return efficiencyB - efficiencyA;
        });
    }
    
    // Statistiche degli aeromobili
    static getStatistics() {
        const stats = {
            totalAircraft: this.aircraft.length,
            categories: {},
            manufacturers: {},
            priceRange: {
                min: Math.min(...this.aircraft.map(a => a.price)),
                max: Math.max(...this.aircraft.map(a => a.price)),
                average: this.aircraft.reduce((sum, a) => sum + a.price, 0) / this.aircraft.length
            },
            capacityRange: {
                min: Math.min(...this.aircraft.filter(a => a.capacity > 0).map(a => a.capacity)),
                max: Math.max(...this.aircraft.map(a => a.capacity)),
                average: this.aircraft.filter(a => a.capacity > 0).reduce((sum, a) => sum + a.capacity, 0) / 
                        this.aircraft.filter(a => a.capacity > 0).length
            },
            rangeStats: {
                min: Math.min(...this.aircraft.map(a => a.range)),
                max: Math.max(...this.aircraft.map(a => a.range)),
                average: this.aircraft.reduce((sum, a) => sum + a.range, 0) / this.aircraft.length
            }
        };
        
        // Conta per categoria
        this.aircraft.forEach(aircraft => {
            stats.categories[aircraft.category] = (stats.categories[aircraft.category] || 0) + 1;
            stats.manufacturers[aircraft.manufacturer] = (stats.manufacturers[aircraft.manufacturer] || 0) + 1;
        });
        
        return stats;
    }
    
    // Genera raccomandazioni di acquisto
    static getRecommendations(companyBudget, existingFleet = [], targetRoutes = []) {
        const recommendations = [];
        
        // Analizza la flotta esistente
        const existingTypes = existingFleet.map(aircraft => aircraft.type);
        const missingCategories = this.getAllCategories().filter(category => 
            !existingFleet.some(aircraft => aircraft.category === category)
        );
        
        // Raccomanda diversificazione
        missingCategories.forEach(category => {
            const affordable = this.getAircraftByCategory(category)
                .filter(aircraft => aircraft.price <= companyBudget)
                .sort((a, b) => a.price - b.price);
                
            if (affordable.length > 0) {
                recommendations.push({
                    type: 'diversification',
                    category: category,
                    aircraft: affordable[0],
                    reason: `Diversifica la flotta con un aeromobile ${category}`,
                    priority: 'medium'
                });
            }
        });
        
        // Raccomanda per rotte specifiche
        targetRoutes.forEach(route => {
            const suitable = this.findSuitableAircraft(route.distance, route.demand, companyBudget);
            if (suitable.length > 0) {
                recommendations.push({
                    type: 'route-specific',
                    route: route,
                    aircraft: suitable[0],
                    reason: `Ottimale per la rotta ${route.origin}-${route.destination}`,
                    priority: 'high'
                });
            }
        });
        
        // Raccomanda best value
        const bestValue = this.aircraft
            .filter(aircraft => aircraft.price <= companyBudget)
            .sort((a, b) => {
                const valueA = a.capacity / (a.price / 1000000); // passeggeri per milione
                const valueB = b.capacity / (b.price / 1000000);
                return valueB - valueA;
            });
            
        if (bestValue.length > 0) {
            recommendations.push({
                type: 'best-value',
                aircraft: bestValue[0],
                reason: 'Miglior rapporto qualità/prezzo',
                priority: 'low'
            });
        }
        
        return recommendations.slice(0, 5); // Massimo 5 raccomandazioni
    }
    
    // Compara due aeromobili
    static compareAircraft(type1, type2) {
        const aircraft1 = this.getAircraftByType(type1);
        const aircraft2 = this.getAircraftByType(type2);
        
        if (!aircraft1 || !aircraft2) {
            return null;
        }
        
        return {
            aircraft1: aircraft1,
            aircraft2: aircraft2,
            comparison: {
                capacity: {
                    winner: aircraft1.capacity > aircraft2.capacity ? aircraft1.name : aircraft2.name,
                    difference: Math.abs(aircraft1.capacity - aircraft2.capacity)
                },
                range: {
                    winner: aircraft1.range > aircraft2.range ? aircraft1.name : aircraft2.name,
                    difference: Math.abs(aircraft1.range - aircraft2.range)
                },
                speed: {
                    winner: aircraft1.speed > aircraft2.speed ? aircraft1.name : aircraft2.name,
                    difference: Math.abs(aircraft1.speed - aircraft2.speed)
                },
                efficiency: {
                    winner: aircraft1.fuelConsumption < aircraft2.fuelConsumption ? aircraft1.name : aircraft2.name,
                    difference: Math.abs(aircraft1.fuelConsumption - aircraft2.fuelConsumption)
                },
                price: {
                    cheaper: aircraft1.price < aircraft2.price ? aircraft1.name : aircraft2.name,
                    difference: Math.abs(aircraft1.price - aircraft2.price)
                }
            }
        };
    }
}
