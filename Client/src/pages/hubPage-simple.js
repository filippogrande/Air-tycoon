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
            
            if (data && data.company) {
                updateHeaderWithCompanyData(data.company);
            } else {
                console.warn('⚠️ Formato dati compagnia non riconosciuto');
                setFallbackCompanyData();
            }
        })
        .catch(err => {
            console.error('❌ Errore caricamento dati compagnia:', err);
            setFallbackCompanyData();
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

// Imposta dati di fallback se non si riesce a caricare dall'API
function setFallbackCompanyData() {
    const companyNameEl = document.getElementById('company-name');
    const companyMoneyEl = document.getElementById('company-money');
    const companyReputationEl = document.getElementById('company-reputation');
    const gameDate = document.getElementById('game-date');
    
    if (companyNameEl) companyNameEl.textContent = 'Mosca Airlines';
    if (companyMoneyEl) companyMoneyEl.textContent = '€2,000M';
    if (companyReputationEl) companyReputationEl.textContent = '50';
    if (gameDate) gameDate.textContent = formatGameDate();
    
    console.log('⚠️ Header impostato con dati di fallback');
}

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
    
    // Configura header
    const companyId = 1; // Hardcodato per ora
    setupCompanyHeader(companyId);
    
    // Setup fleet button
    setTimeout(setupFleetButton, 1000);
});

console.log('✅ hubPage-simple caricato');