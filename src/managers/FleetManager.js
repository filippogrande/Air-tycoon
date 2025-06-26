// Gestore della flotta di aeromobili
class FleetManager {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    // Aggiunge un aeromobile alla flotta
    addAircraft(aircraftData, customName = null) {
        try {
            const aircraft = new Aircraft(aircraftData.type, customName);
            this.gameState.fleet.push(aircraft);
            
            console.log(`✈️ Aeromobile aggiunto alla flotta: ${aircraft.name} (${aircraft.id})`);
            return aircraft;
        } catch (error) {
            console.error('Errore nell\'aggiunta dell\'aeromobile:', error);
            return null;
        }
    }
    
    // Rimuove un aeromobile dalla flotta
    removeAircraft(aircraftId) {
        const index = this.gameState.fleet.findIndex(aircraft => aircraft.id === aircraftId);
        
        if (index === -1) {
            console.error('Aeromobile non trovato:', aircraftId);
            return false;
        }
        
        const aircraft = this.gameState.fleet[index];
        
        // Verifica se l'aeromobile è assegnato a una rotta
        if (aircraft.assignedRoute) {
            console.warn('Impossibile vendere: aeromobile assegnato a una rotta');
            return false;
        }
        
        // Calcola il valore di rivendita
        const resaleValue = aircraft.getResaleValue();
        this.gameState.company.money += resaleValue;
        
        // Rimuove dalla flotta
        this.gameState.fleet.splice(index, 1);
        
        console.log(`💰 Aeromobile venduto: ${aircraft.name} per €${Math.round(resaleValue)}`);
        return true;
    }
    
    // Trova un aeromobile per ID
    getAircraftById(aircraftId) {
        return this.gameState.fleet.find(aircraft => aircraft.id === aircraftId);
    }
    
    // Ottiene tutti gli aeromobili disponibili
    getAvailableAircraft() {
        return this.gameState.fleet.filter(aircraft => aircraft.status === 'available');
    }
    
    // Ottiene aeromobili assegnati a rotte
    getAssignedAircraft() {
        return this.gameState.fleet.filter(aircraft => aircraft.assignedRoute !== null);
    }
    
    // Ottiene aeromobili in volo
    getAircraftInFlight() {
        return this.gameState.fleet.filter(aircraft => aircraft.status === 'in-flight');
    }
    
    // Ottiene aeromobili che necessitano manutenzione
    getAircraftNeedingMaintenance() {
        return this.gameState.fleet.filter(aircraft => aircraft.needsMaintenance());
    }
    
    // Esegue manutenzione su un aeromobile
    performMaintenance(aircraftId) {
        const aircraft = this.getAircraftById(aircraftId);
        
        if (!aircraft) {
            console.error('Aeromobile non trovato per manutenzione:', aircraftId);
            return false;
        }
        
        if (aircraft.status === 'in-flight') {
            console.warn('Impossibile eseguire manutenzione: aeromobile in volo');
            return false;
        }
        
        const maintenanceCost = aircraft.performMaintenance();
        
        if (this.gameState.company.money < maintenanceCost) {
            console.warn('Fondi insufficienti per la manutenzione');
            return false;
        }
        
        this.gameState.company.money -= maintenanceCost;
        
        console.log(`🔧 Manutenzione completata per ${aircraft.name}: €${Math.round(maintenanceCost)}`);
        return true;
    }
    
    // Calcola i costi di manutenzione totali
    calculateMaintenanceCosts() {
        return this.gameState.fleet.reduce((total, aircraft) => {
            if (aircraft.needsMaintenance()) {
                return total + (aircraft.purchasePrice * 0.05);
            }
            return total;
        }, 0);
    }
    
    // Calcola il valore totale della flotta
    getTotalFleetValue() {
        return this.gameState.fleet.reduce((total, aircraft) => {
            return total + aircraft.getResaleValue();
        }, 0);
    }
    
    // Calcola le statistiche della flotta
    getFleetStatistics() {
        const stats = {
            totalAircraft: this.gameState.fleet.length,
            availableAircraft: this.getAvailableAircraft().length,
            assignedAircraft: this.getAssignedAircraft().length,
            aircraftInFlight: this.getAircraftInFlight().length,
            aircraftNeedingMaintenance: this.getAircraftNeedingMaintenance().length,
            totalCapacity: 0,
            averageCondition: 0,
            totalFlightHours: 0,
            totalPassengers: 0,
            totalRevenue: 0,
            fleetValue: this.getTotalFleetValue()
        };
        
        if (stats.totalAircraft > 0) {
            this.gameState.fleet.forEach(aircraft => {
                stats.totalCapacity += aircraft.capacity;
                stats.averageCondition += aircraft.condition;
                stats.totalFlightHours += aircraft.totalFlightHours;
                stats.totalPassengers += aircraft.totalPassengers;
                stats.totalRevenue += aircraft.totalRevenue;
            });
            
            stats.averageCondition = stats.averageCondition / stats.totalAircraft;
        }
        
        return stats;
    }
    
    // Aggiorna lo stato degli aeromobili
    update(deltaTime) {
        this.gameState.fleet.forEach(aircraft => {
            // Aggiorna l'età degli aeromobili
            const ageIncrease = deltaTime / (365 * 24 * 3600); // anni
            aircraft.age += ageIncrease;
            
            // Degrado naturale della condizione
            const naturalWear = deltaTime * 0.000001; // molto lento quando non in uso
            aircraft.condition = Math.max(0, aircraft.condition - naturalWear);
            
            // Aggiorna la posizione se necessario
            this.updateAircraftLocation(aircraft);
        });
        
        // Programma manutenzioni automatiche se abilitato
        this.scheduleAutoMaintenance();
    }
    
    updateAircraftLocation(aircraft) {
        // Se l'aeromobile è assegnato a una rotta ma non in volo, dovrebbe essere nell'aeroporto di origine
        if (aircraft.assignedRoute && aircraft.status === 'available') {
            const route = this.gameState.routes.find(r => r.id === aircraft.assignedRoute);
            if (route) {
                aircraft.location = route.origin;
            }
        }
    }
    
    scheduleAutoMaintenance() {
        // Cerca aeromobili che necessitano manutenzione urgente
        const urgentMaintenanceAircraft = this.gameState.fleet.filter(aircraft => 
            aircraft.condition < 20 && aircraft.status === 'available'
        );
        
        urgentMaintenanceAircraft.forEach(aircraft => {
            if (this.gameState.company.money >= aircraft.purchasePrice * 0.05) {
                console.log(`🚨 Manutenzione urgente programmata per ${aircraft.name}`);
                this.performMaintenance(aircraft.id);
            }
        });
    }
    
    // Ottiene raccomandazioni per l'acquisto di aeromobili
    getAircraftRecommendations() {
        const recommendations = [];
        const currentFleet = this.gameState.fleet;
        const activeRoutes = this.gameState.routes.filter(r => r.isActive);
        
        // Analizza le esigenze basate sulle rotte
        activeRoutes.forEach(route => {
            const assignedAircraft = currentFleet.find(a => a.assignedRoute === route.id);
            
            if (!assignedAircraft) {
                // Rotta senza aeromobile assegnato
                const suitableAircraft = this.findSuitableAircraftForRoute(route);
                if (suitableAircraft.length > 0) {
                    recommendations.push({
                        type: 'route-coverage',
                        route: route,
                        suggestedAircraft: suitableAircraft,
                        priority: 'high'
                    });
                }
            }
        });
        
        // Analizza la diversificazione della flotta
        const fleetTypes = [...new Set(currentFleet.map(a => a.type))];
        const missingTypes = ['regional', 'narrow-body', 'wide-body'].filter(type => 
            !fleetTypes.includes(type)
        );
        
        missingTypes.forEach(type => {
            recommendations.push({
                type: 'fleet-diversification',
                aircraftType: type,
                reason: 'Diversificazione della flotta',
                priority: 'medium'
            });
        });
        
        return recommendations;
    }
    
    findSuitableAircraftForRoute(route) {
        const availableTypes = AircraftData.getAllAircraftTypes();
        const suitableTypes = [];
        
        availableTypes.forEach(type => {
            const aircraftData = AircraftData.getAircraftByType(type);
            if (aircraftData && aircraftData.range >= route.distance) {
                suitableTypes.push({
                    type: type,
                    data: aircraftData,
                    efficiency: this.calculateRouteEfficiency(route, aircraftData)
                });
            }
        });
        
        // Ordina per efficienza
        return suitableTypes.sort((a, b) => b.efficiency - a.efficiency);
    }
    
    calculateRouteEfficiency(route, aircraftData) {
        // Calcola un punteggio di efficienza basato su capacità, costi e redditività
        const capacityMatch = Math.min(1, route.demand / aircraftData.capacity);
        const fuelEfficiency = 1 / (aircraftData.fuelConsumption || 1);
        const priceEfficiency = 1000000 / aircraftData.price; // preferisce aeromobili meno costosi
        
        return (capacityMatch * 0.4 + fuelEfficiency * 0.3 + priceEfficiency * 0.3) * 100;
    }
    
    // Esporta dati della flotta per report
    exportFleetData() {
        return {
            timestamp: new Date().toISOString(),
            statistics: this.getFleetStatistics(),
            aircraft: this.gameState.fleet.map(aircraft => aircraft.getDisplayInfo()),
            recommendations: this.getAircraftRecommendations()
        };
    }
}
