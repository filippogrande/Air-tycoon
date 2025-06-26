// Database degli aeroporti mondiali
console.log('📂 Caricamento AirportData.js...');

class AirportData {
    // Metodo statico per ottenere la lista degli aeroporti
    static getAirports() {
        return AirportData.airports;
    }
}

// Definisci la proprietà statica dopo la classe
AirportData.airports = [
        // Italia
        {
            code: 'MXP',
            name: 'Milano Malpensa',
            city: 'Milano',
            country: 'Italia',
            continent: 'Europa',
            latitude: 45.6306,
            longitude: 8.7281,
            size: 'hub',
            runwayLength: 3920,
            maxAircraftSize: 'large',
            demandLevel: 85,
            competitionLevel: 75,
            economicLevel: 80,
            passengerTraffic: 28846000
        },
        {
            code: 'FCO',
            name: 'Roma Fiumicino',
            city: 'Roma',
            country: 'Italia',
            continent: 'Europa',
            latitude: 41.8003,
            longitude: 12.2389,
            size: 'hub',
            runwayLength: 3900,
            maxAircraftSize: 'large',
            demandLevel: 90,
            competitionLevel: 80,
            economicLevel: 75,
            passengerTraffic: 43532573
        },
        {
            code: 'VCE',
            name: 'Venezia Marco Polo',
            city: 'Venezia',
            country: 'Italia',
            continent: 'Europa',
            latitude: 45.5053,
            longitude: 12.3519,
            size: 'large',
            runwayLength: 3300,
            maxAircraftSize: 'large',
            demandLevel: 70,
            competitionLevel: 65,
            economicLevel: 85,
            passengerTraffic: 11184608
        },
        {
            code: 'NAP',
            name: 'Napoli Capodichino',
            city: 'Napoli',
            country: 'Italia',
            continent: 'Europa',
            latitude: 40.8860,
            longitude: 14.2908,
            size: 'medium',
            runwayLength: 2628,
            maxAircraftSize: 'medium',
            demandLevel: 60,
            competitionLevel: 50,
            economicLevel: 60,
            passengerTraffic: 10860068
        },
        
        // Europa Occidentale
        {
            code: 'CDG',
            name: 'Paris Charles de Gaulle',
            city: 'Parigi',
            country: 'Francia',
            continent: 'Europa',
            latitude: 49.0097,
            longitude: 2.5479,
            size: 'hub',
            runwayLength: 4200,
            maxAircraftSize: 'large',
            demandLevel: 95,
            competitionLevel: 85,
            economicLevel: 90,
            passengerTraffic: 76150007
        },
        {
            code: 'LHR',
            name: 'London Heathrow',
            city: 'Londra',
            country: 'Regno Unito',
            continent: 'Europa',
            latitude: 51.4700,
            longitude: -0.4543,
            size: 'hub',
            runwayLength: 3902,
            maxAircraftSize: 'large',
            demandLevel: 98,
            competitionLevel: 90,
            economicLevel: 95,
            passengerTraffic: 80884310
        },
        {
            code: 'FRA',
            name: 'Frankfurt am Main',
            city: 'Francoforte',
            country: 'Germania',
            continent: 'Europa',
            latitude: 50.0264,
            longitude: 8.5431,
            size: 'hub',
            runwayLength: 4000,
            maxAircraftSize: 'large',
            demandLevel: 90,
            competitionLevel: 85,
            economicLevel: 92,
            passengerTraffic: 70556072
        },
        {
            code: 'AMS',
            name: 'Amsterdam Schiphol',
            city: 'Amsterdam',
            country: 'Paesi Bassi',
            continent: 'Europa',
            latitude: 52.3105,
            longitude: 4.7683,
            size: 'hub',
            runwayLength: 3800,
            maxAircraftSize: 'large',
            demandLevel: 85,
            competitionLevel: 80,
            economicLevel: 88,
            passengerTraffic: 71707144
        },
        {
            code: 'MAD',
            name: 'Madrid Barajas',
            city: 'Madrid',
            country: 'Spagna',
            continent: 'Europa',
            latitude: 40.4983,
            longitude: -3.5676,
            size: 'hub',
            runwayLength: 4179,
            maxAircraftSize: 'large',
            demandLevel: 80,
            competitionLevel: 70,
            economicLevel: 75,
            passengerTraffic: 61734309
        },
        {
            code: 'BCN',
            name: 'Barcelona El Prat',
            city: 'Barcellona',
            country: 'Spagna',
            continent: 'Europa',
            latitude: 41.2971,
            longitude: 2.0785,
            size: 'large',
            runwayLength: 3500,
            maxAircraftSize: 'large',
            demandLevel: 75,
            competitionLevel: 70,
            economicLevel: 80,
            passengerTraffic: 52686314
        },
        
        // Nord America
        {
            code: 'JFK',
            name: 'John F. Kennedy International',
            city: 'New York',
            country: 'Stati Uniti',
            continent: 'Nord America',
            latitude: 40.6413,
            longitude: -73.7781,
            size: 'hub',
            runwayLength: 4423,
            maxAircraftSize: 'large',
            demandLevel: 95,
            competitionLevel: 85,
            economicLevel: 95,
            passengerTraffic: 62551253
        },
        {
            code: 'LAX',
            name: 'Los Angeles International',
            city: 'Los Angeles',
            country: 'Stati Uniti',
            continent: 'Nord America',
            latitude: 34.0522,
            longitude: -118.2437,
            size: 'hub',
            runwayLength: 3939,
            maxAircraftSize: 'large',
            demandLevel: 92,
            competitionLevel: 80,
            economicLevel: 90,
            passengerTraffic: 87534384
        },
        {
            code: 'YYZ',
            name: 'Toronto Pearson',
            city: 'Toronto',
            country: 'Canada',
            continent: 'Nord America',
            latitude: 43.6777,
            longitude: -79.6248,
            size: 'hub',
            runwayLength: 3389,
            maxAircraftSize: 'large',
            demandLevel: 80,
            competitionLevel: 70,
            economicLevel: 85,
            passengerTraffic: 50400000
        },
        
        // Asia
        {
            code: 'NRT',
            name: 'Tokyo Narita',
            city: 'Tokyo',
            country: 'Giappone',
            continent: 'Asia',
            latitude: 35.7720,
            longitude: 140.3929,
            size: 'hub',
            runwayLength: 4000,
            maxAircraftSize: 'large',
            demandLevel: 88,
            competitionLevel: 75,
            economicLevel: 90,
            passengerTraffic: 33294000
        },
        {
            code: 'SIN',
            name: 'Singapore Changi',
            city: 'Singapore',
            country: 'Singapore',
            continent: 'Asia',
            latitude: 1.3644,
            longitude: 103.9915,
            size: 'hub',
            runwayLength: 4000,
            maxAircraftSize: 'large',
            demandLevel: 92,
            competitionLevel: 80,
            economicLevel: 95,
            passengerTraffic: 68300000
        },
        {
            code: 'HKG',
            name: 'Hong Kong International',
            city: 'Hong Kong',
            country: 'Hong Kong',
            continent: 'Asia',
            latitude: 22.3080,
            longitude: 113.9185,
            size: 'hub',
            runwayLength: 3800,
            maxAircraftSize: 'large',
            demandLevel: 90,
            competitionLevel: 85,
            economicLevel: 92,
            passengerTraffic: 71540000
        },
        {
            code: 'PEK',
            name: 'Beijing Capital',
            city: 'Pechino',
            country: 'Cina',
            continent: 'Asia',
            latitude: 40.0799,
            longitude: 116.6031,
            size: 'hub',
            runwayLength: 3800,
            maxAircraftSize: 'large',
            demandLevel: 85,
            competitionLevel: 70,
            economicLevel: 75,
            passengerTraffic: 100013642
        },
        
        // Medio Oriente
        {
            code: 'DXB',
            name: 'Dubai International',
            city: 'Dubai',
            country: 'Emirati Arabi Uniti',
            continent: 'Medio Oriente',
            latitude: 25.2532,
            longitude: 55.3657,
            size: 'hub',
            runwayLength: 4000,
            maxAircraftSize: 'large',
            demandLevel: 95,
            competitionLevel: 80,
            economicLevel: 90,
            passengerTraffic: 89149387
        },
        {
            code: 'DOH',
            name: 'Hamad International',
            city: 'Doha',
            country: 'Qatar',
            continent: 'Medio Oriente',
            latitude: 25.2731,
            longitude: 51.6080,
            size: 'hub',
            runwayLength: 4850,
            maxAircraftSize: 'large',
            demandLevel: 88,
            competitionLevel: 75,
            economicLevel: 95,
            passengerTraffic: 38000000
        },
        
        // Africa
        {
            code: 'CAI',
            name: 'Cairo International',
            city: 'Il Cairo',
            country: 'Egitto',
            continent: 'Africa',
            latitude: 30.1219,
            longitude: 31.4056,
            size: 'large',
            runwayLength: 4000,
            maxAircraftSize: 'large',
            demandLevel: 65,
            competitionLevel: 50,
            economicLevel: 45,
            passengerTraffic: 17000000
        },
        {
            code: 'JNB',
            name: 'OR Tambo International',
            city: 'Johannesburg',
            country: 'Sudafrica',
            continent: 'Africa',
            latitude: -26.1367,
            longitude: 28.2411,
            size: 'hub',
            runwayLength: 4418,
            maxAircraftSize: 'large',
            demandLevel: 70,
            competitionLevel: 60,
            economicLevel: 55,
            passengerTraffic: 21000000
        },
        
        // Sud America
        {
            code: 'GRU',
            name: 'São Paulo Guarulhos',
            city: 'São Paulo',
            country: 'Brasile',
            continent: 'Sud America',
            latitude: -23.4356,
            longitude: -46.4731,
            size: 'hub',
            runwayLength: 3700,
            maxAircraftSize: 'large',
            demandLevel: 75,
            competitionLevel: 65,
            economicLevel: 60,
            passengerTraffic: 42000000
        },
        {
            code: 'EZE',
            name: 'Ezeiza International',
            city: 'Buenos Aires',
            country: 'Argentina',
            continent: 'Sud America',
            latitude: -34.8222,
            longitude: -58.5358,
            size: 'large',
            runwayLength: 3300,
            maxAircraftSize: 'large',
            demandLevel: 60,
            competitionLevel: 55,
            economicLevel: 50,
            passengerTraffic: 10500000
        },
        
        // Oceania
        {
            code: 'SYD',
            name: 'Sydney Kingsford Smith',
            city: 'Sydney',
            country: 'Australia',
            continent: 'Oceania',
            latitude: -33.9399,
            longitude: 151.1753,
            size: 'hub',
            runwayLength: 3962,
            maxAircraftSize: 'large',
            demandLevel: 85,
            competitionLevel: 70,
            economicLevel: 88,
            passengerTraffic: 44400000
        }
    ];
    
    // Inizializza le distanze tra aeroporti (cache)
    static distanceCache = new Map();
    
    // Ottiene tutti gli aeroporti
    static getAllAirports() {
        return this.airports.map(airport => new Airport(airport));
    }
    
    // Ottiene un aeroporto per codice IATA
    static getAirportByCode(code) {
        const airportData = this.airports.find(airport => airport.code === code);
        return airportData ? new Airport(airportData) : null;
    }
    
    // Ottiene aeroporti per paese
    static getAirportsByCountry(country) {
        return this.airports
            .filter(airport => airport.country === country)
            .map(airport => new Airport(airport));
    }
    
    // Ottiene aeroporti per continente
    static getAirportsByContinent(continent) {
        return this.airports
            .filter(airport => airport.continent === continent)
            .map(airport => new Airport(airport));
    }
    
    // Ottiene aeroporti per dimensione
    static getAirportsBySize(size) {
        return this.airports
            .filter(airport => airport.size === size)
            .map(airport => new Airport(airport));
    }
    
    // Ottiene tutti i codici IATA
    static getAllAirportCodes() {
        return this.airports.map(airport => airport.code);
    }
    
    // Ottiene tutti i paesi
    static getAllCountries() {
        return [...new Set(this.airports.map(airport => airport.country))].sort();
    }
    
    // Ottiene tutti i continenti
    static getAllContinents() {
        return [...new Set(this.airports.map(airport => airport.continent))].sort();
    }
    
    // Cerca aeroporti per nome o città
    static searchAirports(query) {
        const searchTerm = query.toLowerCase();
        return this.airports
            .filter(airport => 
                airport.name.toLowerCase().includes(searchTerm) ||
                airport.city.toLowerCase().includes(searchTerm) ||
                airport.code.toLowerCase().includes(searchTerm) ||
                airport.country.toLowerCase().includes(searchTerm)
            )
            .map(airport => new Airport(airport));
    }
    
    // Trova aeroporti vicini a coordinate specifiche
    static findNearbyAirports(latitude, longitude, radiusKm = 500) {
        return this.airports
            .map(airport => {
                const distance = this.calculateDistance(latitude, longitude, airport.latitude, airport.longitude);
                return {
                    airport: new Airport(airport),
                    distance: distance
                };
            })
            .filter(item => item.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
    }
    
    // Calcola la distanza tra due punti geografici
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raggio della Terra in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Ottiene la distanza tra due aeroporti (con cache)
    static getDistanceBetween(code1, code2) {
        const key = [code1, code2].sort().join('-');
        
        if (this.distanceCache.has(key)) {
            return this.distanceCache.get(key);
        }
        
        const airport1 = this.getAirportByCode(code1);
        const airport2 = this.getAirportByCode(code2);
        
        if (!airport1 || !airport2) {
            return null;
        }
        
        const distance = airport1.calculateDistanceTo(airport2);
        this.distanceCache.set(key, distance);
        
        return distance;
    }
    
    // Trova le rotte più popolari (basate sul traffico passeggeri)
    static getMostPopularRoutes(limit = 20) {
        const routes = [];
        
        for (let i = 0; i < this.airports.length; i++) {
            for (let j = i + 1; j < this.airports.length; j++) {
                const airport1 = this.airports[i];
                const airport2 = this.airports[j];
                const distance = this.calculateDistance(
                    airport1.latitude, airport1.longitude,
                    airport2.latitude, airport2.longitude
                );
                
                // Stima la popolarità basata sul traffico e la distanza
                const popularity = Math.min(airport1.passengerTraffic, airport2.passengerTraffic) / 
                                 Math.sqrt(distance);
                
                routes.push({
                    origin: airport1.code,
                    destination: airport2.code,
                    distance: Math.round(distance),
                    popularity: Math.round(popularity),
                    originTraffic: airport1.passengerTraffic,
                    destinationTraffic: airport2.passengerTraffic
                });
            }
        }
        
        return routes
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, limit);
    }
    
    // Trova hub internazionali (aeroporti grandi con alta connettività)
    static getInternationalHubs() {
        return this.airports
            .filter(airport => airport.size === 'hub' && airport.passengerTraffic > 30000000)
            .map(airport => new Airport(airport))
            .sort((a, b) => b.passengerTraffic - a.passengerTraffic);
    }
    
    // Analizza i mercati per continente
    static analyzeMarketsByContinent() {
        const analysis = {};
        
        this.getAllContinents().forEach(continent => {
            const airports = this.getAirportsByContinent(continent);
            const totalTraffic = airports.reduce((sum, airport) => sum + airport.passengerTraffic, 0);
            const averageDemand = airports.reduce((sum, airport) => sum + airport.demandLevel, 0) / airports.length;
            const averageCompetition = airports.reduce((sum, airport) => sum + airport.competitionLevel, 0) / airports.length;
            const averageEconomic = airports.reduce((sum, airport) => sum + airport.economicLevel, 0) / airports.length;
            
            analysis[continent] = {
                airportCount: airports.length,
                totalTraffic: totalTraffic,
                averageTraffic: Math.round(totalTraffic / airports.length),
                averageDemand: Math.round(averageDemand),
                averageCompetition: Math.round(averageCompetition),
                averageEconomic: Math.round(averageEconomic),
                marketSize: this.categorizeMarketSize(totalTraffic),
                competitiveness: this.categorizeCompetitiveness(averageCompetition)
            };
        });
        
        return analysis;
    }
    
    static categorizeMarketSize(traffic) {
        if (traffic > 500000000) return 'Molto Grande';
        if (traffic > 200000000) return 'Grande';
        if (traffic > 100000000) return 'Medio';
        if (traffic > 50000000) return 'Piccolo';
        return 'Molto Piccolo';
    }
    
    static categorizeCompetitiveness(competition) {
        if (competition > 80) return 'Molto Alta';
        if (competition > 65) return 'Alta';
        if (competition > 50) return 'Media';
        if (competition > 35) return 'Bassa';
        return 'Molto Bassa';
    }
    
    // Trova opportunità di mercato
    static findMarketOpportunities() {
        const opportunities = this.airports
            .map(airport => new Airport(airport))
            .filter(airport => {
                // Criteri per opportunità: alta domanda, bassa competizione
                return airport.demandLevel > 60 && airport.competitionLevel < 70;
            })
            .map(airport => {
                const opportunityScore = airport.demandLevel - airport.competitionLevel + 
                                       (airport.economicLevel * 0.5);
                return {
                    airport: airport,
                    score: opportunityScore,
                    reason: this.getOpportunityReason(airport)
                };
            })
            .sort((a, b) => b.score - a.score);
        
        return opportunities.slice(0, 10);
    }
    
    static getOpportunityReason(airport) {
        if (airport.demandLevel > 80 && airport.competitionLevel < 50) {
            return 'Alta domanda con bassa competizione';
        }
        if (airport.economicLevel > 85) {
            return 'Mercato economicamente forte';
        }
        if (airport.size === 'hub' && airport.competitionLevel < 60) {
            return 'Hub internazionale sottosfruttato';
        }
        return 'Mercato in crescita con buone prospettive';
    }
    
    // Statistiche generali
    static getStatistics() {
        const totalTraffic = this.airports.reduce((sum, airport) => sum + airport.passengerTraffic, 0);
        const avgDemand = this.airports.reduce((sum, airport) => sum + airport.demandLevel, 0) / this.airports.length;
        const avgCompetition = this.airports.reduce((sum, airport) => sum + airport.competitionLevel, 0) / this.airports.length;
        const avgEconomic = this.airports.reduce((sum, airport) => sum + airport.economicLevel, 0) / this.airports.length;
        
        const sizeDistribution = {};
        this.airports.forEach(airport => {
            sizeDistribution[airport.size] = (sizeDistribution[airport.size] || 0) + 1;
        });
        
        return {
            totalAirports: this.airports.length,
            totalPassengerTraffic: totalTraffic,
            averageTrafficPerAirport: Math.round(totalTraffic / this.airports.length),
            averageDemandLevel: Math.round(avgDemand),
            averageCompetitionLevel: Math.round(avgCompetition),
            averageEconomicLevel: Math.round(avgEconomic),
            sizeDistribution: sizeDistribution,
            continentDistribution: this.analyzeMarketsByContinent(),
            topAirports: this.airports
                .sort((a, b) => b.passengerTraffic - a.passengerTraffic)
                .slice(0, 10)
                .map(airport => ({
                    code: airport.code,
                    name: airport.name,
                    traffic: airport.passengerTraffic
                }))
        };
    }
}
