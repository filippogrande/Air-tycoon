// RouteDemandAnalysisManager - Gestione analisi domanda e previsioni traffico

var RouteDemandAnalysisManager = {
    
    // Cache per risultati analisi
    analysisCache: {},
    
    // Popola le stime della domanda per la rotta
    populateDemandEstimates: function(origin, destination, routeType) {
        routeType = routeType || 'passenger';
        
        var demandContainer = document.getElementById('demand-estimates');
        var loadingElement = document.getElementById('demand-loading');
        var demandContent = document.getElementById('demand-content');
        
        if (!demandContainer) {
            console.warn('⚠️ Container per stime domanda non trovato');
            return false;
        }
        
        if (!origin || !destination) {
            demandContainer.style.display = 'none';
            return false;
        }
        
        demandContainer.style.display = 'block';
        
        // Mostra loading
        if (loadingElement) loadingElement.style.display = 'block';
        if (demandContent) demandContent.style.display = 'none';
        
        
        var self = this;
        // Simula caricamento asincrono
        setTimeout(function() {
            var estimates = self.calculateDemandEstimates(origin, destination, routeType);
            self.displayDemandEstimates(estimates);
            
            // Nascondi loading
            if (loadingElement) loadingElement.style.display = 'none';
            if (demandContent) demandContent.style.display = 'block';
            
        }, 800);
        
        return true;
    },
    
    // Calcola stime della domanda
    calculateDemandEstimates: function(origin, destination, routeType) {
        routeType = routeType || 'passenger';
        
        // Crea chiave cache
        var cacheKey = origin.code + '-' + destination.code + '-' + routeType;
        
        // Controlla cache
        if (this.analysisCache[cacheKey]) {
            return this.analysisCache[cacheKey];
        }
        
        // Calcola distanza
        var distance = this.calculateDistance(origin, destination);
        
        // Base demand in base alla popolazione degli aeroporti
        var originPop = origin.population || origin.size || 1000000;
        var destPop = destination.population || destination.size || 1000000;
        var popFactor = Math.sqrt(originPop * destPop) / 1000000;
        
        // Fattore distanza (domanda più alta per distanze medie)
        var distanceFactor = 1.0;
        if (distance < 500) distanceFactor = 0.7;
        else if (distance < 1500) distanceFactor = 1.0;
        else if (distance < 3000) distanceFactor = 0.9;
        else distanceFactor = 0.8;
        
        // Fattore stagionale (simulato)
        var seasonalFactor = 0.8 + (Math.random() * 0.4); // 0.8 - 1.2
        
        // Calcola domanda base
        var baseDemand = Math.floor(popFactor * distanceFactor * seasonalFactor * 100);
        
        var estimates = {
            routeType: routeType,
            distance: Math.round(distance),
            baseDemand: Math.max(baseDemand, 50),
            seasonal: {
                high: Math.floor(baseDemand * 1.3),
                medium: baseDemand,
                low: Math.floor(baseDemand * 0.7)
            },
            weeklyFrequency: this.calculateOptimalFrequency(baseDemand, distance),
            priceRange: this.calculatePriceRange(distance, routeType),
            competitionLevel: this.assessCompetition(origin, destination),
            profitability: this.assessProfitability(baseDemand, distance)
        };
        
        // Salva in cache
        this.analysisCache[cacheKey] = estimates;
        
        return estimates;
    },
    
    // Mostra le stime nel DOM
    displayDemandEstimates: function(estimates) {
        var container = document.getElementById('demand-content');
        if (!container) return false;
        
        var profitColor = 'green';
        if (estimates.profitability < 0.3) profitColor = 'red';
        else if (estimates.profitability < 0.6) profitColor = 'orange';
        
        var competitionText = 'Bassa';
        var competitionColor = 'green';
        if (estimates.competitionLevel > 0.7) {
            competitionText = 'Alta';
            competitionColor = 'red';
        } else if (estimates.competitionLevel > 0.4) {
            competitionText = 'Media';
            competitionColor = 'orange';
        }
        
        container.innerHTML = `
            <div class="demand-summary">
                <div class="demand-stat">
                    <span class="label">Domanda Base:</span>
                    <span class="value">${estimates.baseDemand} pax/settimana</span>
                </div>
                <div class="demand-stat">
                    <span class="label">Distanza:</span>
                    <span class="value">${estimates.distance} km</span>
                </div>
                <div class="demand-stat">
                    <span class="label">Frequenza Ottimale:</span>
                    <span class="value">${estimates.weeklyFrequency} voli/settimana</span>
                </div>
            </div>
            
            <div class="demand-details">
                <div class="demand-section">
                    <h4>📈 Variazioni Stagionali</h4>
                    <div class="seasonal-data">
                        <div class="season-item">
                            <span class="season-label">Alta stagione:</span>
                            <span class="season-value">${estimates.seasonal.high} pax</span>
                        </div>
                        <div class="season-item">
                            <span class="season-label">Media stagione:</span>
                            <span class="season-value">${estimates.seasonal.medium} pax</span>
                        </div>
                        <div class="season-item">
                            <span class="season-label">Bassa stagione:</span>
                            <span class="season-value">${estimates.seasonal.low} pax</span>
                        </div>
                    </div>
                </div>
                
                <div class="demand-section">
                    <h4>💰 Range Prezzi Suggeriti</h4>
                    <div class="price-range">
                        <span>€${estimates.priceRange.min} - €${estimates.priceRange.max}</span>
                    </div>
                </div>
                
                <div class="demand-section">
                    <h4>🏢 Analisi Mercato</h4>
                    <div class="market-analysis">
                        <div class="market-item">
                            <span class="label">Competizione:</span>
                            <span class="value" style="color: ${competitionColor}">${competitionText}</span>
                        </div>
                        <div class="market-item">
                            <span class="label">Potenziale Profitto:</span>
                            <span class="value" style="color: ${profitColor}">${Math.round(estimates.profitability * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return true;
    },
    
    // Calcola distanza tra due aeroporti (formula dell'emisfera)
    calculateDistance: function(origin, destination) {
        if (!origin.lat || !origin.lon || !destination.lat || !destination.lon) {
            return 1000; // Default fallback
        }
        
        var R = 6371; // Raggio della Terra in km
        var dLat = this.deg2rad(destination.lat - origin.lat);
        var dLon = this.deg2rad(destination.lon - origin.lon);
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(origin.lat)) * Math.cos(this.deg2rad(destination.lat)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = R * c;
        
        return distance;
    },
    
    // Converti gradi in radianti
    deg2rad: function(deg) {
        return deg * (Math.PI/180);
    },
    
    // Calcola frequenza ottimale dei voli
    calculateOptimalFrequency: function(baseDemand, distance) {
        // Più domanda = più frequenza
        var demandFactor = Math.min(baseDemand / 200, 7);
        
        // Distanze più lunghe = meno frequenza
        var distanceFactor = 1.0;
        if (distance > 2000) distanceFactor = 0.7;
        else if (distance > 1000) distanceFactor = 0.85;
        
        var frequency = Math.max(1, Math.round(demandFactor * distanceFactor));
        return Math.min(frequency, 14); // Max 2 voli al giorno
    },
    
    // Calcola range prezzi
    calculatePriceRange: function(distance, routeType) {
        routeType = routeType || 'passenger';
        
        var basePrice = 0;
        if (routeType === 'passenger') {
            // €0.10-0.20 per km base
            basePrice = distance * (0.10 + Math.random() * 0.10);
        } else if (routeType === 'cargo') {
            // €0.05-0.15 per km per cargo
            basePrice = distance * (0.05 + Math.random() * 0.10);
        }
        
        return {
            min: Math.round(basePrice * 0.8),
            max: Math.round(basePrice * 1.4)
        };
    },
    
    // Valuta livello competizione
    assessCompetition: function(origin, destination) {
        // Simulazione basata su dimensione aeroporti
        var originSize = origin.size || 'medium';
        var destSize = destination.size || 'medium';
        
        var competition = 0.3; // Base competition
        
        if (originSize === 'large' || destSize === 'large') {
            competition += 0.3;
        }
        if (originSize === 'hub' || destSize === 'hub') {
            competition += 0.4;
        }
        
        return Math.min(competition + (Math.random() * 0.2), 1.0);
    },
    
    // Valuta potenziale profittabilità
    assessProfitability: function(baseDemand, distance) {
        var demandScore = Math.min(baseDemand / 300, 1.0);
        
        // Distanze medie sono più profittevoli
        var distanceScore = 1.0;
        if (distance < 300) distanceScore = 0.6;
        else if (distance < 800) distanceScore = 1.0;
        else if (distance < 2000) distanceScore = 0.9;
        else distanceScore = 0.7;
        
        return (demandScore * 0.6 + distanceScore * 0.4);
    },
    
    // Resetta cache analisi
    clearCache: function() {
        this.analysisCache = {};
    },
    
    // Ottieni analisi cached
    getCachedAnalysis: function(origin, destination, routeType) {
        routeType = routeType || 'passenger';
        var cacheKey = origin.code + '-' + destination.code + '-' + routeType;
        return this.analysisCache[cacheKey] || null;
    },
    
    // Aggiorna analisi per una rotta specifica
    refreshAnalysis: function(origin, destination, routeType) {
        routeType = routeType || 'passenger';
        var cacheKey = origin.code + '-' + destination.code + '-' + routeType;
        
        // Rimuovi dalla cache per forzare ricalcolo
        delete this.analysisCache[cacheKey];
        
        // Ricalcola
        return this.populateDemandEstimates(origin, destination, routeType);
    }
};

// Export globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteDemandAnalysisManager;
} else if (typeof window !== 'undefined') {
    window.RouteDemandAnalysisManager = RouteDemandAnalysisManager;
}
