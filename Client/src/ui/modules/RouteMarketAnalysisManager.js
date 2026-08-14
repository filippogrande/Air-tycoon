// RouteMarketAnalysisManager - Gestione analisi di mercato avanzata

var RouteMarketAnalysisManager = {
    
    // Cache per analisi di mercato
    marketCache: {},
    
    // Esegue analisi di mercato completa
    performMarketAnalysis: function(origin, destination) {
        if (!origin || !destination) {
            console.warn('⚠️ Origine o destinazione mancanti per analisi mercato');
            return false;
        }
        
        
        // Mostra loading
        this.showAnalysisLoading(true);
        
        var self = this;
        
        // Simula chiamata API asincrona
        setTimeout(function() {
            // Safe access to global `game`
            var gameRef = (typeof window !== 'undefined' && window.game) ? window.game : (typeof game !== 'undefined' ? game : null);
            
            if (gameRef && gameRef.apiManager && gameRef.apiManager.performMarketAnalysis) {
                // Usa API reale se disponibile
                gameRef.apiManager.performMarketAnalysis(origin.code, destination.code)
                    .then(function(data) {
                        self.displayMarketAnalysis(data);
                        self.showAnalysisLoading(false);
                    })
                    .catch(function(error) {
                        console.warn('⚠️ Errore API analisi mercato, fallback a simulazione:', error);
                        var simulatedData = self.performMarketAnalysisFallback(origin, destination);
                        self.displayMarketAnalysis(simulatedData);
                        self.showAnalysisLoading(false);
                    });
            } else {
                // Fallback con simulazione
                var simulatedData = self.performMarketAnalysisFallback(origin, destination);
                self.displayMarketAnalysis(simulatedData);
                self.showAnalysisLoading(false);
            }
        }, 1200);
        
        return true;
    },
    
    // Fallback per analisi di mercato (simulazione)
    performMarketAnalysisFallback: function(origin, destination) {
        
        var cacheKey = origin.code + '-' + destination.code + '-market';
        
        // Controlla cache
        if (this.marketCache[cacheKey]) {
            return this.marketCache[cacheKey];
        }
        
        // Calcola distanza
        var distance = this.calculateDistance(origin, destination);
        
        // Simula dati di mercato
        var marketData = {
            route: {
                origin: origin.name,
                destination: destination.name,
                distance: Math.round(distance)
            },
            competition: this.simulateCompetitionData(origin, destination),
            demand: this.simulateDemandForecast(origin, destination, distance),
            pricing: this.simulatePricingAnalysis(distance),
            seasonal: this.simulateSeasonalTrends(),
            profitability: this.simulateProfitabilityAnalysis(origin, destination, distance),
            recommendations: this.generateRecommendations(origin, destination, distance)
        };
        
        // Salva in cache
        this.marketCache[cacheKey] = marketData;
        
        return marketData;
    },
    
    // Simula dati competizione
    simulateCompetitionData: function(origin, destination) {
        var numCompetitors = Math.floor(Math.random() * 4); // 0-3 competitors
        var competitors = [];
        
        var competitorNames = ['AirEuropa', 'SkyConnect', 'GlobalWings', 'EuroFly', 'CoastalAir'];
        
        for (var i = 0; i < numCompetitors; i++) {
            competitors.push({
                name: competitorNames[i],
                marketShare: Math.random() * 0.4 + 0.1, // 10-50%
                avgPrice: Math.floor(Math.random() * 200 + 100),
                frequency: Math.floor(Math.random() * 7 + 1),
                reputation: Math.random() * 0.3 + 0.7 // 70-100%
            });
        }
        
        return {
            total: numCompetitors,
            competitors: competitors,
            marketSaturation: Math.min(numCompetitors * 0.25 + Math.random() * 0.3, 1.0)
        };
    },
    
    // Simula previsioni domanda
    simulateDemandForecast: function(origin, destination, distance) {
        var baseDemand = Math.floor((Math.random() * 300 + 100) * (1 - distance / 5000));
        
        var monthlyForecast = [];
        for (var i = 0; i < 12; i++) {
            var seasonal = 0.8 + Math.sin((i - 5) * Math.PI / 6) * 0.3; // Peak in estate
            monthlyForecast.push(Math.floor(baseDemand * seasonal * (0.9 + Math.random() * 0.2)));
        }
        
        return {
            current: baseDemand,
            trend: Math.random() > 0.5 ? 'crescente' : 'stabile',
            monthly: monthlyForecast,
            peakMonth: this.findPeakMonth(monthlyForecast),
            lowMonth: this.findLowMonth(monthlyForecast)
        };
    },
    
    // Simula analisi prezzi
    simulatePricingAnalysis: function(distance) {
        var basePrice = distance * (0.08 + Math.random() * 0.12);
        
        return {
            optimal: Math.round(basePrice),
            market: {
                min: Math.round(basePrice * 0.7),
                max: Math.round(basePrice * 1.5),
                avg: Math.round(basePrice * 1.1)
            },
            elasticity: Math.random() * 0.6 + 0.2, // 0.2-0.8
            recommendation: basePrice > 150 ? 'premium' : basePrice > 80 ? 'standard' : 'economico'
        };
    },
    
    // Simula trend stagionali
    simulateSeasonalTrends: function() {
        return {
            highSeason: ['giugno', 'luglio', 'agosto', 'dicembre'],
            lowSeason: ['gennaio', 'febbraio', 'novembre'],
            variability: Math.random() * 0.4 + 0.3, // 30-70% variazione
            pattern: 'turistico' // turistico, business, misto
        };
    },
    
    // Simula analisi profittabilità
    simulateProfitabilityAnalysis: function(origin, destination, distance) {
        var costs = {
            fuel: Math.round(distance * 0.45),
            crew: Math.round(distance * 0.12),
            maintenance: Math.round(distance * 0.08),
            airport: Math.floor(Math.random() * 500 + 200),
            other: Math.floor(Math.random() * 200 + 100)
        };
        
        var totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
        var estimatedRevenue = Math.round(totalCosts * (1.2 + Math.random() * 0.6));
        var profit = estimatedRevenue - totalCosts;
        var margin = (profit / estimatedRevenue * 100);
        
        return {
            costs: costs,
            totalCosts: totalCosts,
            estimatedRevenue: estimatedRevenue,
            profit: profit,
            margin: Math.round(margin * 10) / 10,
            paybackPeriod: Math.round(totalCosts / (profit * 52)), // settimane
            riskLevel: margin < 10 ? 'alto' : margin < 25 ? 'medio' : 'basso'
        };
    },
    
    // Genera raccomandazioni
    generateRecommendations: function(origin, destination, distance) {
        var recommendations = [];
        
        if (distance < 500) {
            recommendations.push('✈️ Considera voli frequenti (più di 5 a settimana) per rotte corte');
        } else if (distance > 2000) {
            recommendations.push('🌍 Voli internazionali richiedono marketing più aggressivo');
        }
        
        recommendations.push('📊 Monitora i prezzi dei competitor settimanalmente');
        recommendations.push('🎯 Ottimizza i prezzi in base alla stagionalità');
        
        if (Math.random() > 0.5) {
            recommendations.push('💺 Considera configurazione mista business/economy');
        }
        
        return recommendations;
    },
    
    // Mostra/nascondi loading analisi
    showAnalysisLoading: function(show) {
        var loadingElement = document.getElementById('market-analysis-loading');
        var contentElement = document.getElementById('market-analysis-content');
        
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
        if (contentElement) {
            contentElement.style.display = show ? 'none' : 'block';
        }
        
        // Aggiorna stato bottone
        this.updateAnalysisButton(show);
    },
    
    // Aggiorna bottone analisi
    updateAnalysisButton: function(isLoading) {
        var buttons = [
            document.getElementById('improve-analysis-btn'),
            document.getElementById('market-analysis-btn')
        ];
        
        buttons.forEach(function(button) {
            if (button) {
                button.disabled = isLoading;
                if (isLoading) {
                    button.textContent = '⏳ Analizzando...';
                } else {
                    button.textContent = button.id.includes('improve') ? 
                        '📊 Migliora Analisi' : '🏢 Analisi di Mercato';
                }
            }
        });
    },
    
    // Mostra risultati analisi nel DOM
    displayMarketAnalysis: function(data) {
        var container = document.getElementById('market-analysis-content');
        if (!container) {
            console.warn('⚠️ Container analisi mercato non trovato');
            return false;
        }
        
        var html = this.generateMarketAnalysisHTML(data);
        container.innerHTML = html;
        
        return true;
    },
    
    // Genera HTML per analisi mercato
    generateMarketAnalysisHTML: function(data) {
        var competitionLevel = data.competition.marketSaturation > 0.7 ? 'Alta' : 
                             data.competition.marketSaturation > 0.4 ? 'Media' : 'Bassa';
        var competitionColor = data.competition.marketSaturation > 0.7 ? 'red' : 
                              data.competition.marketSaturation > 0.4 ? 'orange' : 'green';
        
        var html = `
            <div class="market-analysis-results">
                <div class="analysis-header">
                    <h3>📊 Analisi di Mercato: ${data.route.origin} → ${data.route.destination}</h3>
                    <div class="route-distance">${data.route.distance} km</div>
                </div>
                
                <div class="analysis-grid">
                    <div class="analysis-section">
                        <h4>🏢 Competizione</h4>
                        <div class="competition-data">
                            <div class="stat-item">
                                <span class="label">Livello:</span>
                                <span class="value" style="color: ${competitionColor}">
                                    ${competitionLevel} (${Math.round(data.competition.marketSaturation * 100)}%)
                                </span>
                            </div>
                            <div class="stat-item">
                                <span class="label">Competitor:</span>
                                <span class="value">${data.competition.total}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>📈 Domanda</h4>
                        <div class="demand-data">
                            <div class="stat-item">
                                <span class="label">Attuale:</span>
                                <span class="value">${data.demand.current} pax/settimana</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">Trend:</span>
                                <span class="value">${data.demand.trend}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>💰 Prezzi</h4>
                        <div class="pricing-data">
                            <div class="stat-item">
                                <span class="label">Ottimale:</span>
                                <span class="value">€${data.pricing.optimal}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">Range Mercato:</span>
                                <span class="value">€${data.pricing.market.min} - €${data.pricing.market.max}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-section">
                        <h4>💹 Profittabilità</h4>
                        <div class="profit-data">
                            <div class="stat-item">
                                <span class="label">Margine:</span>
                                <span class="value" style="color: ${data.profitability.margin > 20 ? 'green' : data.profitability.margin > 10 ? 'orange' : 'red'}">
                                    ${data.profitability.margin}%
                                </span>
                            </div>
                            <div class="stat-item">
                                <span class="label">Rischio:</span>
                                <span class="value">${data.profitability.riskLevel}</span>
                            </div>
                        </div>
                    </div>
                </div>
        `;
        
        // Aggiungi competitor se presenti
        if (data.competition.competitors && data.competition.competitors.length > 0) {
            html += '<div class="competitors-section"><h4>🏢 Competitor Principali</h4><div class="competitors-list">';
            
            data.competition.competitors.forEach(function(competitor) {
                html += `
                    <div class="competitor-item">
                        <div class="competitor-name">${competitor.name}</div>
                        <div class="competitor-stats">
                            Share: ${Math.round(competitor.marketShare * 100)}% | 
                            €${competitor.avgPrice} | 
                            ${competitor.frequency} voli/sett
                        </div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        // Aggiungi raccomandazioni
        if (data.recommendations && data.recommendations.length > 0) {
            html += '<div class="recommendations-section"><h4>💡 Raccomandazioni</h4><div class="recommendations-list">';
            
            data.recommendations.forEach(function(rec) {
                html += `<div class="recommendation-item">${rec}</div>`;
            });
            
            html += '</div></div>';
        }
        
        html += '</div>'; // chiudi market-analysis-results
        
        return html;
    },
    
    // Utility functions
    calculateDistance: function(origin, destination) {
        if (!origin.lat || !origin.lon || !destination.lat || !destination.lon) {
            return 1000; // Default fallback
        }
        
        var R = 6371;
        var dLat = (destination.lat - origin.lat) * Math.PI / 180;
        var dLon = (destination.lon - origin.lon) * Math.PI / 180;
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    },
    
    findPeakMonth: function(monthlyData) {
        var maxIndex = 0;
        for (var i = 1; i < monthlyData.length; i++) {
            if (monthlyData[i] > monthlyData[maxIndex]) {
                maxIndex = i;
            }
        }
        var months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
        return months[maxIndex];
    },
    
    findLowMonth: function(monthlyData) {
        var minIndex = 0;
        for (var i = 1; i < monthlyData.length; i++) {
            if (monthlyData[i] < monthlyData[minIndex]) {
                minIndex = i;
            }
        }
        var months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
        return months[minIndex];
    },
    
    // Pulisci cache
    clearCache: function() {
        this.marketCache = {};
    }
};

// Export globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteMarketAnalysisManager;
} else if (typeof window !== 'undefined') {
    window.RouteMarketAnalysisManager = RouteMarketAnalysisManager;
}
