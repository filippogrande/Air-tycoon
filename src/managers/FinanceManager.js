// Gestore delle finanze della compagnia
class FinanceManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.lastMonthlyUpdate = new Date();
        this.monthlyReports = [];
        this.expenses = {
            fuel: 0,
            maintenance: 0,
            salaries: 0,
            airportFees: 0,
            marketing: 0,
            insurance: 0,
            loan: 0,
            other: 0
        };
        this.revenues = {
            passengers: 0,
            cargo: 0,
            other: 0
        };
    }
    
    // Aggiorna le finanze
    update(deltaTime) {
        const currentDate = new Date(this.gameState.gameTime.date);
        
        // Verifica se è passato un mese
        if (this.isNewMonth(currentDate)) {
            this.processMonthlyFinances();
            this.lastMonthlyUpdate = currentDate;
        }
        
        // Aggiorna costi continui
        this.updateContinuousExpenses(deltaTime);
    }
    
    isNewMonth(currentDate) {
        return currentDate.getMonth() !== this.lastMonthlyUpdate.getMonth() ||
               currentDate.getFullYear() !== this.lastMonthlyUpdate.getFullYear();
    }
    
    processMonthlyFinances() {
        console.log('📊 Elaborazione finanze mensili...');
        
        // Calcola tutti i costi e ricavi mensili
        const monthlyExpenses = this.calculateMonthlyExpenses();
        const monthlyRevenues = this.calculateMonthlyRevenues();
        const monthlyProfit = monthlyRevenues - monthlyExpenses;
        
        // Aggiorna il denaro della compagnia
        this.gameState.company.money += monthlyProfit;
        
        // Aggiorna le statistiche
        this.gameState.statistics.totalRevenue += monthlyRevenues;
        this.gameState.statistics.totalExpenses += monthlyExpenses;
        
        // Crea report mensile
        const monthlyReport = {
            date: new Date(this.gameState.gameTime.date),
            revenues: { ...this.revenues },
            expenses: { ...this.expenses },
            totalRevenues: monthlyRevenues,
            totalExpenses: monthlyExpenses,
            profit: monthlyProfit,
            companyMoney: this.gameState.company.money,
            reputation: this.gameState.company.reputation
        };
        
        this.monthlyReports.push(monthlyReport);
        
        // Mantieni solo gli ultimi 24 mesi
        if (this.monthlyReports.length > 24) {
            this.monthlyReports.shift();
        }
        
        console.log(`💰 Bilancio mensile: €${this.formatMoney(monthlyProfit)} (${monthlyProfit >= 0 ? 'Profitto' : 'Perdita'})`);
        
        // Reset contatori mensili
        this.resetMonthlyCounters();
        
        // Verifica la situazione finanziaria
        this.checkFinancialHealth();
    }
    
    calculateMonthlyExpenses() {
        let total = 0;
        
        // Costi del personale (dipende dalla dimensione della flotta)
        this.expenses.salaries = this.calculateSalaryCosts();
        total += this.expenses.salaries;
        
        // Costi di manutenzione programmata
        this.expenses.maintenance = this.calculateMaintenanceCosts();
        total += this.expenses.maintenance;
        
        // Assicurazioni (percentuale del valore della flotta)
        this.expenses.insurance = this.calculateInsuranceCosts();
        total += this.expenses.insurance;
        
        // Marketing e pubblicità (opzionale, migliora la reputazione)
        this.expenses.marketing = this.calculateMarketingCosts();
        total += this.expenses.marketing;
        
        // Altri costi fissi
        this.expenses.other = this.calculateOtherCosts();
        total += this.expenses.other;
        
        // I costi di carburante e tasse aeroportuali sono già contabilizzati nei voli
        
        return total;
    }
    
    calculateMonthlyRevenues() {
        // I ricavi dai passeggeri sono già contabilizzati dai voli
        // Qui aggiungiamo eventuali ricavi extra
        
        this.revenues.other = this.calculateOtherRevenues();
        
        return this.revenues.passengers + this.revenues.cargo + this.revenues.other;
    }
    
    calculateSalaryCosts() {
        const baseStaffCost = 50000; // costo base mensile per una piccola compagnia
        const aircraftCount = this.gameState.fleet.length;
        const routeCount = this.gameState.routes.filter(r => r.isActive).length;
        
        // Più aeromobili e rotte = più personale necessario
        const staffMultiplier = 1 + (aircraftCount * 0.1) + (routeCount * 0.05);
        
        return baseStaffCost * staffMultiplier;
    }
    
    calculateMaintenanceCosts() {
        let totalMaintenanceCost = 0;
        
        this.gameState.fleet.forEach(aircraft => {
            // Costo base di manutenzione mensile
            const monthlyCost = aircraft.maintenanceCost * 100; // 100 ore di manutenzione al mese base
            
            // Aumenta con l'età e le ore di volo
            const ageFactor = 1 + (aircraft.age * 0.1);
            const usageFactor = 1 + (aircraft.totalFlightHours / 10000);
            
            totalMaintenanceCost += monthlyCost * ageFactor * usageFactor;
        });
        
        return totalMaintenanceCost;
    }
    
    calculateInsuranceCosts() {
        const fleetValue = this.gameState.fleet.reduce((total, aircraft) => {
            return total + aircraft.purchasePrice;
        }, 0);
        
        // 0.2% del valore della flotta al mese
        return fleetValue * 0.002;
    }
    
    calculateMarketingCosts() {
        // Costo marketing opzionale (per ora fisso)
        return 25000; // €25,000 al mese
    }
    
    calculateOtherCosts() {
        // Costi amministrativi, uffici, etc.
        const baseCost = 15000;
        const scaleFactor = 1 + (this.gameState.routes.length * 0.02);
        
        return baseCost * scaleFactor;
    }
    
    calculateOtherRevenues() {
        // Ricavi da servizi aggiuntivi, cargo, etc.
        const routeCount = this.gameState.routes.filter(r => r.isActive).length;
        const baseRevenue = routeCount * 5000; // €5,000 per rotta al mese
        
        return baseRevenue;
    }
    
    updateContinuousExpenses(deltaTime) {
        // Costi che si accumulano continuamente (fuel, tasse aeroportuali)
        // Questi sono già gestiti quando i voli vengono eseguiti
    }
    
    resetMonthlyCounters() {
        // Reset dei contatori per il mese successivo
        Object.keys(this.expenses).forEach(key => {
            if (key !== 'fuel' && key !== 'airportFees') {
                this.expenses[key] = 0;
            }
        });
        
        Object.keys(this.revenues).forEach(key => {
            if (key !== 'passengers') {
                this.revenues[key] = 0;
            }
        });
    }
    
    checkFinancialHealth() {
        const money = this.gameState.company.money;
        const monthlyExpenses = this.getMonthlyExpenses();
        
        // Calcola quanti mesi può sopravvivere la compagnia
        const monthsOfOperation = money / monthlyExpenses;
        
        if (monthsOfOperation < 1) {
            console.warn('🚨 ALLERTA FINANZIARIA: Fondi sufficienti per meno di 1 mese!');
        } else if (monthsOfOperation < 3) {
            console.warn('⚠️ Attenzione: Fondi limitati, considera di migliorare la redditività');
        }
        
        // Aggiorna la reputazione basata sulla salute finanziaria
        if (money < 0) {
            this.gameState.company.reputation = Math.max(0, this.gameState.company.reputation - 5);
        }
    }
    
    // Aggiunge ricavi da un volo
    addFlightRevenue(amount) {
        this.revenues.passengers += amount;
    }
    
    // Aggiunge costi da un volo
    addFlightExpense(fuelCost, airportFees) {
        this.expenses.fuel += fuelCost;
        this.expenses.airportFees += airportFees;
    }
    
    // Ottiene il reddito mensile stimato
    getMonthlyIncome() {
        let totalIncome = 0;
        
        this.gameState.routes.forEach(route => {
            if (route.isActive) {
                const aircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
                if (aircraft) {
                    const monthlyRevenue = route.calculateRevenuePerFlight(aircraft) * route.frequency * 4.33;
                    totalIncome += monthlyRevenue;
                }
            }
        });
        
        totalIncome += this.calculateOtherRevenues();
        
        return totalIncome;
    }
    
    // Ottiene i costi mensili stimati
    getMonthlyExpenses() {
        let totalExpenses = 0;
        
        // Costi operativi delle rotte
        this.gameState.routes.forEach(route => {
            if (route.isActive) {
                const aircraft = this.gameState.fleet.find(a => a.id === route.aircraftId);
                if (aircraft) {
                    const monthlyCost = route.calculateCostPerFlight(aircraft) * route.frequency * 4.33;
                    totalExpenses += monthlyCost;
                }
            }
        });
        
        // Costi fissi
        totalExpenses += this.calculateSalaryCosts();
        totalExpenses += this.calculateMaintenanceCosts();
        totalExpenses += this.calculateInsuranceCosts();
        totalExpenses += this.calculateMarketingCosts();
        totalExpenses += this.calculateOtherCosts();
        
        return totalExpenses;
    }
    
    // Ottiene il profitto mensile stimato
    getMonthlyProfit() {
        return this.getMonthlyIncome() - this.getMonthlyExpenses();
    }
    
    // Gestione prestiti
    requestLoan(amount, termMonths = 12) {
        const maxLoanAmount = this.calculateMaxLoanAmount();
        
        if (amount > maxLoanAmount) {
            console.error('Importo del prestito troppo elevato');
            return false;
        }
        
        const interestRate = this.calculateInterestRate();
        const monthlyPayment = this.calculateLoanPayment(amount, interestRate, termMonths);
        
        // Aggiunge il prestito
        this.gameState.company.money += amount;
        this.expenses.loan += monthlyPayment;
        
        console.log(`💳 Prestito approvato: €${this.formatMoney(amount)} a ${interestRate}% per ${termMonths} mesi`);
        return true;
    }
    
    calculateMaxLoanAmount() {
        const fleetValue = this.gameState.fleet.reduce((total, aircraft) => {
            return total + aircraft.getResaleValue();
        }, 0);
        
        const monthlyIncome = this.getMonthlyIncome();
        
        // Prestito basato sul valore della flotta (50%) e capacità di pagamento
        const assetBasedLoan = fleetValue * 0.5;
        const incomeBasedLoan = monthlyIncome * 12; // 12 volte il reddito mensile
        
        return Math.min(assetBasedLoan, incomeBasedLoan);
    }
    
    calculateInterestRate() {
        const baseRate = 5; // 5% base
        const reputationDiscount = (this.gameState.company.reputation - 50) / 100; // -0.5% to +0.5%
        const riskPremium = this.gameState.company.money < 0 ? 3 : 0; // +3% se in rosso
        
        return Math.max(2, baseRate - reputationDiscount + riskPremium);
    }
    
    calculateLoanPayment(principal, annualRate, months) {
        const monthlyRate = annualRate / 100 / 12;
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
        
        return payment;
    }
    
    // Statistiche finanziarie
    getFinancialStatistics() {
        const currentMonth = this.monthlyReports[this.monthlyReports.length - 1];
        const previousMonth = this.monthlyReports[this.monthlyReports.length - 2];
        
        const stats = {
            currentMoney: this.gameState.company.money,
            monthlyIncome: this.getMonthlyIncome(),
            monthlyExpenses: this.getMonthlyExpenses(),
            monthlyProfit: this.getMonthlyProfit(),
            fleetValue: this.gameState.fleet.reduce((total, aircraft) => total + aircraft.getResaleValue(), 0),
            totalRevenue: this.gameState.statistics.totalRevenue,
            totalExpenses: this.gameState.statistics.totalExpenses,
            profitMargin: 0,
            revenueGrowth: 0,
            expenseRatio: 0
        };
        
        if (stats.monthlyIncome > 0) {
            stats.profitMargin = (stats.monthlyProfit / stats.monthlyIncome) * 100;
            stats.expenseRatio = (stats.monthlyExpenses / stats.monthlyIncome) * 100;
        }
        
        if (currentMonth && previousMonth) {
            const revenueChange = ((currentMonth.totalRevenues - previousMonth.totalRevenues) / previousMonth.totalRevenues) * 100;
            stats.revenueGrowth = revenueChange;
        }
        
        return stats;
    }
    
    // Genera un report finanziario dettagliato
    generateFinancialReport() {
        const stats = this.getFinancialStatistics();
        const recentReports = this.monthlyReports.slice(-6); // ultimi 6 mesi
        
        return {
            timestamp: new Date().toISOString(),
            summary: stats,
            monthlyBreakdown: recentReports,
            recommendations: this.getFinancialRecommendations(stats),
            cashFlow: this.calculateCashFlow(),
            expenses: { ...this.expenses },
            revenues: { ...this.revenues }
        };
    }
    
    getFinancialRecommendations(stats) {
        const recommendations = [];
        
        if (stats.profitMargin < 10) {
            recommendations.push({
                type: 'low-profit-margin',
                message: 'Margine di profitto basso. Considera di ottimizzare i costi o aumentare i prezzi.',
                priority: 'high'
            });
        }
        
        if (stats.expenseRatio > 90) {
            recommendations.push({
                type: 'high-expenses',
                message: 'Costi troppo elevati rispetto ai ricavi. Rivedi le spese operative.',
                priority: 'high'
            });
        }
        
        if (stats.currentMoney < stats.monthlyExpenses * 2) {
            recommendations.push({
                type: 'low-cash',
                message: 'Riserve di cassa basse. Considera un prestito o riduci le spese.',
                priority: 'critical'
            });
        }
        
        if (stats.revenueGrowth < 0) {
            recommendations.push({
                type: 'declining-revenue',
                message: 'Ricavi in calo. Analizza le performance delle rotte e la concorrenza.',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }
    
    calculateCashFlow() {
        const months = [];
        
        this.monthlyReports.forEach(report => {
            months.push({
                date: report.date,
                inflow: report.totalRevenues,
                outflow: report.totalExpenses,
                netFlow: report.profit,
                balance: report.companyMoney
            });
        });
        
        return months;
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
    
    // Esporta dati finanziari per salvataggio
    toSaveData() {
        return {
            lastMonthlyUpdate: this.lastMonthlyUpdate.toISOString(),
            monthlyReports: this.monthlyReports,
            expenses: { ...this.expenses },
            revenues: { ...this.revenues }
        };
    }
    
    // Carica dati finanziari salvati
    loadFromData(data) {
        if (data.lastMonthlyUpdate) {
            this.lastMonthlyUpdate = new Date(data.lastMonthlyUpdate);
        }
        if (data.monthlyReports) {
            this.monthlyReports = data.monthlyReports.map(report => ({
                ...report,
                date: new Date(report.date)
            }));
        }
        if (data.expenses) {
            this.expenses = { ...this.expenses, ...data.expenses };
        }
        if (data.revenues) {
            this.revenues = { ...this.revenues, ...data.revenues };
        }
    }
}
