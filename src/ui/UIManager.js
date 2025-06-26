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
        moneyElement.textContent = '💰 €' + this.game.state.company.money.toLocaleString();
    }
    
    var reputationElement = document.getElementById('reputation');
    if (reputationElement && this.game.state) {
        reputationElement.textContent = '⭐ ' + this.game.state.company.reputation;
    }
    
    var dateElement = document.getElementById('date');
    if (dateElement && this.game.state && this.game.state.gameTime) {
        dateElement.textContent = '📅 ' + this.game.state.gameTime.formatDate();
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
        
        infoPanel.classList.remove('hidden');
    } else {
        console.warn('⚠️ Elemento airport-info non trovato nel DOM');
    }
};

UIManager.prototype.hideAirportInfo = function() {
    console.log('🏢 Nascondi info aeroporto');
    
    var infoPanel = document.getElementById('airport-info');
    if (infoPanel) {
        infoPanel.classList.add('hidden');
    }
};

UIManager.prototype.startRouteCreation = function(originAirportCode) {
    console.log('🛣️ Inizio creazione rotta da:', originAirportCode);
    
    // TODO: Implementare UI per creazione rotta
    this.showNotification('Creazione rotta da ' + originAirportCode + ' - Funzionalità in sviluppo', 'info');
};

window.UIManager = UIManager;
console.log('✅ UIManager compatibile caricato');
