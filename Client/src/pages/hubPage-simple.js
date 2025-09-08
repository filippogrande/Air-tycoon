// hubPage-simple.js - Gestione header per la pagina hub

console.log('📄 Caricamento hubPage-simple...');

// Funzione per impostare le informazioni della compagnia nell'header
function setupCompanyHeader(companyId) {
    console.log('🏢 Setup header per compagnia:', companyId);
    
    // Carica dati compagnia dall'API
    fetch(`/api/game/companies/${companyId}`)
        .then(res => res.json())
        .then(data => {
            console.log('📊 Dati compagnia ricevuti:', data);
            
            // La struttura API è data.data.company
            const company = data.data.company;
            
            if (company && company.name) {
                updateHeaderWithCompanyData(company);
            } else {
                console.error('❌ Dati compagnia non validi:', data);
                throw new Error('Dati compagnia non disponibili o non validi');
            }
        })
        .catch(err => {
            console.error('❌ Errore caricamento dati compagnia:', err);
            throw err; // Non usare fallback, propaga l'errore
        });
}

// Aggiorna header con i dati reali della compagnia
function updateHeaderWithCompanyData(company) {
    const companyNameEl = document.getElementById('company-name');
    const companyMoneyEl = document.getElementById('company-money');
    const companyReputationEl = document.getElementById('company-reputation');
    const gameDate = document.getElementById('game-date');
    
    if (companyNameEl) companyNameEl.textContent = company.name || 'Nome Compagnia';
    if (companyMoneyEl) companyMoneyEl.textContent = formatMoney(company.money || 2000000000);
    if (companyReputationEl) companyReputationEl.textContent = company.reputation || '50';
    if (gameDate) gameDate.textContent = formatGameDate();
    
    console.log('✅ Header aggiornato con dati compagnia');
}

// Inizializzazione quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM caricato, inizializzazione header...');
    
    // Recupera l'ID della compagnia da sessionStorage
    const companyId = sessionStorage.getItem('selectedCompanyId');
    
    if (!companyId) {
        console.error('❌ Nessun ID compagnia trovato in sessionStorage');
        throw new Error('ID compagnia non trovato');
    }
    
    // Setup header con dati veri
    setupCompanyHeader(companyId);
});

// Formatta il denaro per display
function formatMoney(amount) {
    if (typeof amount === 'string') {
        amount = parseInt(amount) || 0;
    }
    return '€' + Math.round(amount / 1000000).toLocaleString() + 'M';
}

// Formatta la data di gioco
function formatGameDate() {
    // Per ora usa una data fissa fittizia
    return 'Dicembre 1949';
}

// Setup del bottone fleet
function setupFleetButton() {
    const buyButton = document.getElementById('buy-aircraft');
    if (buyButton && typeof openFleetPurchaseUI === 'function') {
        buyButton.addEventListener('click', openFleetPurchaseUI);
        console.log('✅ Bottone fleet collegato al sistema avanzato');
    }
}

// Inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 HubPage-simple: DOM pronto');
    
    // Ottieni companyId dal sessionStorage
    const companyId = sessionStorage.getItem('selectedCompanyId');
    console.log('🔍 Company ID dal sessionStorage:', companyId);
    
    if (companyId) {
        setupCompanyHeader(companyId);
    } else {
        console.error('❌ Nessun companyId trovato in sessionStorage');
        // Fallback per sviluppo - usa ID 1
        console.warn('🔧 Utilizzo fallback companyId = 1 per sviluppo');
        setupCompanyHeader(1);
    }
    
    // Setup fleet button
    setTimeout(setupFleetButton, 1000);
});

console.log('✅ hubPage-simple caricato');