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

window.UIManager = UIManager;
console.log('✅ UIManager compatibile caricato');
