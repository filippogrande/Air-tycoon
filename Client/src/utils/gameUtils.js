// /Client/src/utils/gameUtils.js
// Funzioni di utilità generica per il gioco

/**
 * Restituisce la data di inizio per uno scenario storico.
 * @param {string} scenario
 * @returns {string} data in formato YYYY-MM-DD
 */
export function getScenarioDate(scenario) {
    switch (scenario) {
        case 'aviation_dawn': return '1950-01-01';
        case 'jet_age': return '1970-01-01';
        case 'deregulation': return '1990-01-01';
        case 'modern_era': return '2024-01-01';
        default: return '1950-01-01';
    }
}

/**
 * Lista dei continenti usata in più pagine.
 */
export const continents = [
    { code: 'Europe', label: 'Europa' },
    { code: 'Asia', label: 'Asia' },
    { code: 'NorthAmerica', label: 'Nord America' },
    { code: 'SouthAmerica', label: 'Sud America' },
    { code: 'Africa', label: 'Africa' },
    { code: 'Oceania', label: 'Oceania' }
];

// Verifica compatibilità del browser
export function checkBrowserCompatibility() {
    try {
        if (!window.localStorage) return false;
        if (!window.JSON) return false;
        const canvas = document.createElement('canvas');
        if (!canvas.getContext) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        return true;
    } catch (error) {
        console.error('Errore nel controllo compatibilità:', error);
        return false;
    }
}

// Mostra errore all'utente
export function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f44336;
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Mostra la data di gioco nell'header
export function updateGameDateInHeader(dateString) {
    var el = document.getElementById('game-date');
    if (!el) return;
    if (!dateString) {
        el.textContent = '';
        return;
    }
    var d = new Date(dateString);
    if (!isNaN(d.getTime())) {
        var mesi = [
            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
        ];
        var month = mesi[d.getMonth()];
        var year = d.getFullYear();
        el.textContent = `📅 ${month} ${year}`;
    } else {
        el.textContent = `📅 ${dateString}`;
    }
}

// Aggiorna soldi e reputazione nell'header
export function updateCompanyStatsInHeader(company) {
    var moneyEl = document.getElementById('money');
    if (moneyEl && company.money !== undefined) {
        let euro = Number(company.money) || 0;
        moneyEl.textContent = `💰 ${euro.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}`;
    }
    var repEl = document.getElementById('reputation');
    if (repEl && company.reputation !== undefined) {
        repEl.textContent = `⭐ ${company.reputation}`;
    }
}

// Carica la data di gioco dopo aver caricato la compagnia
export function fetchAndShowGameDate(companyId) {
    fetch('/api/game/companies/' + companyId)
        .then(res => res.json())
        .then(response => {
            if (response.success && response.data && response.data.company) {
                if (response.data.company.game_date) {
                    updateGameDateInHeader(response.data.company.game_date);
                }
                updateCompanyStatsInHeader(response.data.company);
            }
        });
}
