// FinanceManager compatibile
console.log('📂 Caricamento FinanceManager.js...');

function FinanceManager(gameState) {
    this.gameState = gameState;
}

FinanceManager.prototype.addRevenue = function(amount, source) {
    this.gameState.addMoney(amount);
    this.gameState.statistics.totalRevenue += amount;
    console.log('💰 Ricavo: €' + amount.toLocaleString() + ' da ' + (source || 'Sconosciuto'));
};

FinanceManager.prototype.addExpense = function(amount, source) {
    this.gameState.subtractMoney(amount);
    this.gameState.statistics.totalExpenses += amount;
    console.log('💸 Spesa: €' + amount.toLocaleString() + ' per ' + (source || 'Sconosciuto'));
};

FinanceManager.prototype.getBalance = function() {
    return this.gameState.company.money;
};

FinanceManager.prototype.canAfford = function(amount) {
    return this.gameState.canAfford(amount);
};

window.FinanceManager = FinanceManager;
console.log('✅ FinanceManager compatibile caricato');
