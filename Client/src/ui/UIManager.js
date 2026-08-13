// UIManager compatibile
console.log('📂 Caricamento UIManager.js...');

function UIManager(game) {
    this.game = game;
}

UIManager.prototype.init = function() {
    console.log('🎨 UIManager inizializzato');
    this.updateUI();
};

UIManager.prototype.updateUI = function() {
    // Aggiorna elementi UI base
    var moneyElement = document.getElementById('money');
    if (moneyElement && this.game.state) {
        var money = this.game.state.money || this.game.state.company.money || 0;
        moneyElement.textContent = '💰 €' + money.toLocaleString();
    }
    
    var reputationElement = document.getElementById('reputation');
    if (reputationElement && this.game.state) {
        reputationElement.textContent = '⭐ ' + this.game.state.company.reputation;
    }
    
    var dateElement = document.getElementById('date');
    if (dateElement && this.game.state) {
        if (this.game.state.gameDate) {
            var dateStr = this.game.state.gameDate.toLocaleDateString('it-IT', { 
                month: 'short', 
                year: 'numeric' 
            });
            dateElement.textContent = '📅 ' + dateStr;
        } else if (this.game.state.gameTime) {
            dateElement.textContent = '📅 ' + this.game.state.gameTime.formatDate();
        } else {
            dateElement.textContent = '📅 Gen 2024';
        }
    }
    
    // Aggiorna UI infrastrutture se il tab è attivo
    var infrastructureTab = document.getElementById('infrastructure-tab');
    if (infrastructureTab && infrastructureTab.classList.contains('active')) {
        this.updateInfrastructureUI();
    }
};

UIManager.prototype.handleResize = function() {
    console.log('📐 UI resize handled');
};

UIManager.prototype.showNotification = function(message, type) {
    console.log('🔔 ' + (type || 'INFO') + ': ' + message);
};

UIManager.prototype.showAirportInfo = function(airport) {
    console.log('🏢 Mostra info aeroporto:', airport.code);
    
    var infoPanel = document.getElementById('airport-info');
    if (infoPanel) {
        var nameEl = document.getElementById('airport-name');
        var detailsEl = document.getElementById('airport-details');
        
        if (nameEl) nameEl.textContent = airport.name + ' (' + airport.code + ')';
        if (detailsEl) {
            var businessLevel = airport.businessLevel || 'N/A';
            var touristLevel = airport.touristLevel || 'N/A';
            var size = airport.size || 'unknown';
            var runwayLength = airport.runwayLength || 'N/A';
            
            detailsEl.innerHTML = 
                '<p><strong>Città:</strong> ' + airport.city + '</p>' +
                '<p><strong>Paese:</strong> ' + airport.country + '</p>' +
                '<p><strong>Dimensione:</strong> ' + size + '</p>' +
                '<p><strong>Pista:</strong> ' + runwayLength + 'm</p>' +
                '<p><strong>Traffico Business:</strong> ' + businessLevel + '/100</p>' +
                '<p><strong>Traffico Turistico:</strong> ' + touristLevel + '/100</p>';
        }
        
        uiUtils.show('info-panel');
    } else {
        console.warn('⚠️ Elemento airport-info non trovato nel DOM');
    }
};

UIManager.prototype.hideAirportInfo = function() {
    console.log('🏢 Nascondi info aeroporto');
    
    var infoPanel = document.getElementById('airport-info');
    if (infoPanel) {
        uiUtils.hide('info-panel');
    }
};

UIManager.prototype.startRouteCreation = function(originAirportCode) {
    console.log('🛣️ Inizio creazione rotta da:', originAirportCode);
    
    // TODO: Implementare UI per creazione rotta
    this.showNotification('Creazione rotta da ' + originAirportCode + ' - Funzionalità in sviluppo', 'info');
};

UIManager.prototype.updateInfrastructureUI = function() {
    if (!this.game.infrastructureManager) return;
    
    var status = this.game.infrastructureManager.getInfrastructureStatus();
    
    // Aggiorna anno corrente
    var yearElement = document.getElementById('infrastructure-year');
    if (yearElement) {
        yearElement.textContent = 'Anno: ' + status.currentYear;
    }
    
    // Aggiorna tendenze globali
    var trendsElement = document.getElementById('infrastructure-trends');
    if (trendsElement) {
        trendsElement.innerHTML = '';
        if (status.globalTrends.length === 0) {
            trendsElement.innerHTML = '<div class="trend-item">🌍 Sviluppo infrastrutturale limitato</div>';
        } else {
            status.globalTrends.forEach(function(trend) {
                var trendDiv = document.createElement('div');
                trendDiv.className = 'trend-item';
                trendDiv.textContent = trend;
                trendsElement.appendChild(trendDiv);
            });
        }
    }
    
    // Aggiorna dati regionali
    var regionsElement = document.getElementById('infrastructure-regions');
    if (regionsElement) {
        regionsElement.innerHTML = '';
        
        var sortedRegions = Object.keys(status.regionData).sort();
        if (sortedRegions.length === 0) {
            regionsElement.innerHTML = '<div class="region-card"><h5>Nessun dato disponibile</h5></div>';
        } else {
            sortedRegions.forEach(function(region) {
                var data = status.regionData[region];
                var regionCard = document.createElement('div');
                regionCard.className = 'region-card';
                
                regionCard.innerHTML = 
                    '<h5>' + region + '</h5>' +
                    '<div class="infrastructure-bars">' +
                        '<div class="infrastructure-bar">' +
                            '<div class="bar-label">' +
                                '<span>🚂 Ferrovie</span>' +
                                '<span>' + data.railway + '%</span>' +
                            '</div>' +
                            '<div class="bar-container">' +
                                '<div class="bar-fill railway" style="width: ' + data.railway + '%"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="infrastructure-bar">' +
                            '<div class="bar-label">' +
                                '<span>🛣️ Autostrade</span>' +
                                '<span>' + data.highway + '%</span>' +
                            '</div>' +
                            '<div class="bar-container">' +
                                '<div class="bar-fill highway" style="width: ' + data.highway + '%"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="infrastructure-bar">' +
                            '<div class="bar-label">' +
                                '<span>🚄 Alta Velocità</span>' +
                                '<span>' + data.highSpeedRail + '%</span>' +
                            '</div>' +
                            '<div class="bar-container">' +
                                '<div class="bar-fill high-speed-rail" style="width: ' + data.highSpeedRail + '%"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                
                regionsElement.appendChild(regionCard);
            });
        }
    }
};

window.UIManager = UIManager;
console.log('✅ UIManager compatibile caricato');
