// FinanceManager compatibile
console.log('📂 Caricamento FinanceManager.js...');

function FinanceManager(gameState) {
    this.gameState = gameState;
}

FinanceManager.prototype.addRevenue = function(amount, source) {
    this.gameState.addMoney(amount);
    this.gameState.statistics.totalRevenue += amount;
    console.log('💰 Ricavo: €' + amount.toLocaleString() + ' da ' + (source || 'Sconosciuto'));
    
    // Trigger auto-save per entrate significative (sopra €1000)
    if (amount >= 1000 && typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
        SaveLoad.triggerAutoSave('ricavo_' + (source || 'generico'));
    }
};

FinanceManager.prototype.addExpense = function(amount, source) {
    this.gameState.subtractMoney(amount);
    this.gameState.statistics.totalExpenses += amount;
    console.log('💸 Spesa: €' + amount.toLocaleString() + ' per ' + (source || 'Sconosciuto'));
    
    // Trigger auto-save per spese significative (sopra €1000)
    if (amount >= 1000 && typeof SaveLoad !== 'undefined' && SaveLoad.triggerAutoSave) {
        SaveLoad.triggerAutoSave('spesa_' + (source || 'generico'));
    }
};

FinanceManager.prototype.getBalance = function() {
    return this.gameState.company.money;
};

FinanceManager.prototype.canAfford = function(amount) {
    return this.gameState.canAfford(amount);
};

window.FinanceManager = FinanceManager;
console.log('✅ FinanceManager compatibile caricato');
