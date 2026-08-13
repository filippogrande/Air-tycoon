console.log('📂 Caricamento FinanceManager.js...');

function FinanceManager(gameState) {
    this.gameState = gameState;
}

FinanceManager.prototype.addRevenue = function(amount, source) {
    if (!this.gameState) return;
    if (typeof this.gameState.addMoney === 'function') this.gameState.addMoney(amount);
    try {
        if (!this.gameState.statistics) this.gameState.statistics = {};
        this.gameState.statistics.totalRevenue = (this.gameState.statistics.totalRevenue || 0) + amount;
    } catch (e) { /* ignore */ }
    console.log('💰 Ricavo: ' + (window && window.uiUtils ? uiUtils.formatCurrency(amount) : amount) + ' da ' + (source || 'Sconosciuto'));
    if (amount >= 1000 && typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
        SaveLoad.triggerAutoSave('ricavo_' + (source || 'generico'));
    }
};

FinanceManager.prototype.addExpense = function(amount, source) {
    if (!this.gameState) return;
    if (typeof this.gameState.subtractMoney === 'function') this.gameState.subtractMoney(amount);
    try {
        if (!this.gameState.statistics) this.gameState.statistics = {};
        this.gameState.statistics.totalExpenses = (this.gameState.statistics.totalExpenses || 0) + amount;
    } catch (e) { /* ignore */ }
    console.log('💸 Spesa: ' + (window && window.uiUtils ? uiUtils.formatCurrency(amount) : amount) + ' per ' + (source || 'Sconosciuto'));
    if (amount >= 1000 && typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
        SaveLoad.triggerAutoSave('spesa_' + (source || 'generico'));
    }
};

FinanceManager.prototype.getBalance = function() {
    try { return this.gameState && this.gameState.company && this.gameState.company.money; } catch (e) { return null; }
};

FinanceManager.prototype.canAfford = function(amount) {
    try { return this.gameState && typeof this.gameState.canAfford === 'function' ? this.gameState.canAfford(amount) : false; } catch (e) { return false; }
};

window.FinanceManager = FinanceManager;
console.log('✅ FinanceManager compatibile caricato');
