// Gestore delle rotte aeree
class RouteManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.flightScheduler = new FlightScheduler();
    }
    
    // Crea una nuova rotta
    createRoute(originCode, destinationCode, aircraftId) {
        // Validazioni
        if (originCode === destinationCode) {
            console.error('Origine e destinazione devono essere diverse');
            return null;
        }
        
        const aircraft = this.gameState.fleet.find(a => a.id === aircraftId);
        if (!aircraft) {
            console.error('Aeromobile non trovato:', aircraftId);
            return null;
        }
        
        if (aircraft.assignedRoute) {
            console.error('Aeromobile già assegnato a una rotta');
            return null;
        }
        
        // Verifica che gli aeroporti esistano
        const originAirport = AirportData.getAirportByCode(originCode);
        const destinationAirport = AirportData.getAirportByCode(destinationCode);
        
        if (!originAirport || !destinationAirport) {
            console.error('Aeroporti non validi:', originCode, destinationCode);
            return null;
        }
        
        // Verifica che l'aeromobile possa volare la distanza
        const distance = originAirport.calculateDistanceTo(destinationAirport);
        if (!aircraft.canFlyDistance(distance)) {
            console.error('Distanza troppo lunga per questo aeromobile');
            return null;
        }
        
        // Crea la rotta
        const route = new Route(originCode, destinationCode, aircraftId);
        
        // Assegna l'aeromobile alla rotta
        aircraft.assignToRoute(route.id);
        aircraft.location = originCode;
        
        // Aggiunge alla lista delle rotte
        this.gameState.routes.push(route);
        
        // Attiva la rotta
        route.activate();
        
        console.log(`🛣️ Rotta creata: ${route.getRouteName()} con ${aircraft.name}`);
        return route;
    }
    
    // Rimuove una rotta
    removeRoute(routeId) {
        const routeIndex = this.gameState.routes.findIndex(r => r.id === routeId);
        
        if (routeIndex === -1) {
            console.error('Rotta non trovata:', routeId);
            return false;
        }
        
        const route = this.gameState.routes[routeIndex];
        
        // Libera l'aeromobile assegnato
        const aircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
        if (aircraft) {
            aircraft.unassignFromRoute();
        }
        
        // Rimuove la rotta
        this.gameState.routes.splice(routeIndex, 1);
        
        console.log(`🗑️ Rotta rimossa: ${route.getRouteName()}`);
        return true;
    }
    
    // Sospende una rotta
    suspendRoute(routeId) {
        const route = this.getRouteById(routeId);
        if (!route) {
            console.error('Rotta non trovata:', routeId);
            return false;
        }
        
        route.suspend();
        
        // Libera l'aeromobile
        const aircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
        if (aircraft) {
            aircraft.unassignFromRoute();
        }
        
        console.log(`⏸️ Rotta sospesa: ${route.getRouteName()}`);
        return true;
    }
    
    // Riattiva una rotta
    reactivateRoute(routeId, newAircraftId = null) {
        const route = this.getRouteById(routeId);
        if (!route) {
            console.error('Rotta non trovata:', routeId);
            return false;
        }
        
        // Se specificato un nuovo aeromobile, lo assegna
        if (newAircraftId) {
            const newAircraft = this.gameState.fleet.find(a => a.id === newAircraftId);
            if (!newAircraft || newAircraft.assignedRoute) {
                console.error('Aeromobile non disponibile:', newAircraftId);
                return false;
            }
            
            route.aircraftId = newAircraftId;
            newAircraft.assignToRoute(route.id);
        } else {
            // Verifica che l'aeromobile originale sia ancora disponibile
            const originalAircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
            if (!originalAircraft || originalAircraft.assignedRoute) {
                console.error('Aeromobile originale non più disponibile');
                return false;
            }
            
            originalAircraft.assignToRoute(route.id);
        }
        
        route.activate();
        
        console.log(`▶️ Rotta riattivata: ${route.getRouteName()}`);
        return true;
    }
    
    // Trova una rotta per ID
    getRouteById(routeId) {
        return this.gameState.routes.find(r => r.id === routeId);
    }
    
    // Ottiene tutte le rotte attive
    getActiveRoutes() {
        return this.gameState.routes.filter(r => r.isActive);
    }
    
    // Ottiene rotte sospese
    getSuspendedRoutes() {
        return this.gameState.routes.filter(r => r.status === 'suspended');
    }
    
    // Ottiene rotte redditizie
    getProfitableRoutes() {
        return this.gameState.routes.filter(r => {
            const aircraft = this.gameState.fleet.find(a => a.id === r.aircraftId);
            return aircraft && r.calculateMonthlyProfit(aircraft) > 0;
        });
    }
    
    // Ottiene rotte in perdita
    getUnprofitableRoutes() {
        return this.gameState.routes.filter(r => {
            const aircraft = this.gameState.fleet.find(a => a.id === r.aircraftId);
            return aircraft && r.calculateMonthlyProfit(aircraft) < 0;
        });
    }
    
    // Aggiorna tutte le rotte
    update(deltaTime) {
        const activeRoutes = this.getActiveRoutes();
        
        activeRoutes.forEach(route => {
            this.updateRoute(route, deltaTime);
        });
        
        // Esegue voli programmati
        this.flightScheduler.processScheduledFlights(this.gameState);
    }
    
    updateRoute(route, deltaTime) {
        const aircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
        if (!aircraft) {
            console.warn(`Aeromobile non trovato per la rotta ${route.id}`);
            return;
        }
        
        // Verifica se è ora di un volo
        if (route.nextFlightDate && new Date() >= route.nextFlightDate) {
            this.executeFlight(route, aircraft);
        }
    }
    
    executeFlight(route, aircraft) {
        if (aircraft.status !== 'available') {
            console.warn(`Aeromobile ${aircraft.id} non disponibile per il volo`);
            return;
        }
        
        // Esegue il volo
        const flightResult = route.executeFlight(aircraft);
        
        if (flightResult) {
            // Aggiorna le statistiche della compagnia
            this.gameState.company.money += flightResult.profit;
            this.gameState.statistics.totalPassengers += flightResult.passengers;
            this.gameState.statistics.totalFlights++;
            this.gameState.statistics.totalRevenue += flightResult.revenue;
            this.gameState.statistics.totalExpenses += flightResult.cost;
            
            // Aggiorna la reputazione basata sulle performance
            this.updateReputationFromFlight(route, flightResult);
        }
    }
    
    updateReputationFromFlight(route, flightResult) {
        let reputationChange = 0;
        
        // Fattore di carico influenza la reputazione
        if (flightResult.loadFactor > 0.8) {
            reputationChange += 0.1;
        } else if (flightResult.loadFactor < 0.3) {
            reputationChange -= 0.2;
        }
        
        // Puntualità influenza la reputazione
        if (route.onTimePerformance > 90) {
            reputationChange += 0.1;
        } else if (route.onTimePerformance < 70) {
            reputationChange -= 0.2;
        }
        
        // Applica il cambiamento
        this.gameState.company.reputation = Math.max(0, Math.min(100, 
            this.gameState.company.reputation + reputationChange
        ));
    }
    
    // Calcola statistiche delle rotte
    getRouteStatistics() {
        const stats = {
            totalRoutes: this.gameState.routes.length,
            activeRoutes: this.getActiveRoutes().length,
            suspendedRoutes: this.getSuspendedRoutes().length,
            profitableRoutes: this.getProfitableRoutes().length,
            unprofitableRoutes: this.getUnprofitableRoutes().length,
            totalMonthlyRevenue: 0,
            totalMonthlyCosts: 0,
            totalMonthlyProfit: 0,
            averageLoadFactor: 0,
            averageOnTimePerformance: 0
        };
        
        let totalLoadFactor = 0;
        let totalOnTime = 0;
        let routeCount = 0;
        
        this.gameState.routes.forEach(route => {
            const aircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
            if (aircraft && route.isActive) {
                const monthlyProfit = route.calculateMonthlyProfit(aircraft);
                const monthlyRevenue = route.calculateRevenuePerFlight(aircraft) * route.frequency * 4.33;
                const monthlyCosts = route.calculateCostPerFlight(aircraft) * route.frequency * 4.33;
                
                stats.totalMonthlyRevenue += monthlyRevenue;
                stats.totalMonthlyCosts += monthlyCosts;
                stats.totalMonthlyProfit += monthlyProfit;
                
                totalLoadFactor += route.averageLoadFactor;
                totalOnTime += route.onTimePerformance;
                routeCount++;
            }
        });
        
        if (routeCount > 0) {
            stats.averageLoadFactor = (totalLoadFactor / routeCount) * 100;
            stats.averageOnTimePerformance = totalOnTime / routeCount;
        }
        
        return stats;
    }
    
    // Ottiene raccomandazioni per le rotte
    getRouteRecommendations() {
        const recommendations = [];
        
        // Analizza rotte non redditizie
        const unprofitableRoutes = this.getUnprofitableRoutes();
        unprofitableRoutes.forEach(route => {
            const aircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
            if (aircraft) {
                const monthlyLoss = Math.abs(route.calculateMonthlyProfit(aircraft));
                
                recommendations.push({
                    type: 'unprofitable-route',
                    route: route,
                    monthlyLoss: monthlyLoss,
                    suggestions: this.getRouteImprovementSuggestions(route, aircraft),
                    priority: monthlyLoss > 50000 ? 'high' : 'medium'
                });
            }
        });
        
        // Cerca opportunità di nuove rotte
        const routeOpportunities = this.findRouteOpportunities();
        routeOpportunities.forEach(opportunity => {
            recommendations.push({
                type: 'new-route-opportunity',
                opportunity: opportunity,
                priority: 'medium'
            });
        });
        
        // Analizza la concorrenza
        const competitionAnalysis = this.analyzeCompetition();
        if (competitionAnalysis.highCompetitionRoutes.length > 0) {
            recommendations.push({
                type: 'high-competition',
                routes: competitionAnalysis.highCompetitionRoutes,
                suggestion: 'Considera di ridurre la frequenza o migliorare il servizio',
                priority: 'low'
            });
        }
        
        return recommendations;
    }
    
    getRouteImprovementSuggestions(route, aircraft) {
        const suggestions = [];
        
        // Analizza il prezzo
        const originAirport = AirportData.getAirportByCode(route.origin);
        const destinationAirport = AirportData.getAirportByCode(route.destination);
        const suggestedPrice = originAirport.getSuggestedTicketPrice(destinationAirport, aircraft.type);
        
        if (route.ticketPrice > suggestedPrice * 1.2) {
            suggestions.push('Riduci il prezzo del biglietto');
        } else if (route.ticketPrice < suggestedPrice * 0.8) {
            suggestions.push('Aumenta il prezzo del biglietto');
        }
        
        // Analizza la frequenza
        if (route.averageLoadFactor < 0.5) {
            suggestions.push('Riduci la frequenza dei voli');
        } else if (route.averageLoadFactor > 0.9) {
            suggestions.push('Aumenta la frequenza dei voli');
        }
        
        // Analizza l\'aeromobile
        if (aircraft.capacity < route.demand * 0.5) {
            suggestions.push('Usa un aeromobile più grande');
        } else if (aircraft.capacity > route.demand * 2) {
            suggestions.push('Usa un aeromobile più piccolo');
        }
        
        return suggestions;
    }
    
    findRouteOpportunities() {
        const opportunities = [];
        const availableAircraft = this.gameState.fleet.filter(a => !a.assignedRoute);
        const airports = AirportData.getAllAirports();
        
        // Cerca combinazioni di aeroporti non ancora collegate
        for (let i = 0; i < airports.length; i++) {
            for (let j = i + 1; j < airports.length; j++) {
                const origin = airports[i];
                const destination = airports[j];
                
                // Verifica se già esiste una rotta
                const existingRoute = this.gameState.routes.find(r => 
                    (r.origin === origin.code && r.destination === destination.code) ||
                    (r.origin === destination.code && r.destination === origin.code)
                );
                
                if (!existingRoute) {
                    const demand = origin.getDemandTo(destination);
                    const distance = origin.calculateDistanceTo(destination);
                    
                    // Trova aeromobili adatti
                    const suitableAircraft = availableAircraft.filter(aircraft => 
                        aircraft.canFlyDistance(distance)
                    );
                    
                    if (demand > 100 && suitableAircraft.length > 0) {
                        opportunities.push({
                            origin: origin.code,
                            destination: destination.code,
                            demand: demand,
                            distance: Math.round(distance),
                            suitableAircraft: suitableAircraft.map(a => a.id),
                            estimatedProfit: this.estimateRouteProfit(origin, destination, suitableAircraft[0])
                        });
                    }
                }
            }
        }
        
        // Ordina per profitto stimato
        return opportunities.sort((a, b) => b.estimatedProfit - a.estimatedProfit).slice(0, 10);
    }
    
    estimateRouteProfit(originAirport, destinationAirport, aircraft) {
        if (!aircraft) return 0;
        
        const tempRoute = new Route(originAirport.code, destinationAirport.code, aircraft.id);
        return tempRoute.calculateMonthlyProfit(aircraft);
    }
    
    analyzeCompetition() {
        // Simula l'analisi della concorrenza
        const highCompetitionRoutes = this.gameState.routes.filter(route => {
            const originAirport = AirportData.getAirportByCode(route.origin);
            const destinationAirport = AirportData.getAirportByCode(route.destination);
            
            return originAirport && destinationAirport && 
                   (originAirport.competitionLevel > 70 || destinationAirport.competitionLevel > 70);
        });
        
        return {
            highCompetitionRoutes: highCompetitionRoutes.map(r => r.id),
            averageCompetition: 50 // placeholder
        };
    }
    
    // Esporta dati delle rotte per report
    exportRouteData() {
        return {
            timestamp: new Date().toISOString(),
            statistics: this.getRouteStatistics(),
            routes: this.gameState.routes.map(route => route.getDisplayInfo()),
            recommendations: this.getRouteRecommendations()
        };
    }
}

// Classe per gestire la programmazione dei voli
class FlightScheduler {
    constructor() {
        this.scheduledFlights = [];
    }
    
    processScheduledFlights(gameState) {
        const now = new Date();
        
        // Trova voli che devono essere eseguiti
        gameState.routes.forEach(route => {
            if (route.isActive && route.nextFlightDate && now >= route.nextFlightDate) {
                const aircraft = gameState.fleet.find(a => a.id === route.aircraftId);
                if (aircraft && aircraft.status === 'available') {
                    this.scheduleImmediateFlight(route, aircraft);
                }
            }
        });
    }
    
    scheduleImmediateFlight(route, aircraft) {
        // Programma il volo per l'esecuzione immediata
        console.log(`📅 Volo programmato: ${route.getRouteName()} con ${aircraft.name}`);
        
        // In un'implementazione più realistica, qui si gestirebbe il tempo di volo
        // Per ora eseguiamo immediatamente
        route.executeFlight(aircraft);
    }
}
