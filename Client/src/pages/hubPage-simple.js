// hubPage-simple.js - Versione compatibile per aggiornamento header
console.log('📄 Caricamento hubPage-simple.js...');

// Funzione per aggiornare l'header con i dati della compagnia
function updateCompanyHeader() {
    console.log('🏢 Aggiornamento header compagnia...');
    
    const companyNameEl = document.getElementById('company-name');
    const moneyEl = document.getElementById('money');
    const reputationEl = document.getElementById('reputation');
    const gameDateEl = document.getElementById('game-date');
    
    if (!companyNameEl || !moneyEl || !reputationEl) {
        console.warn('⚠️ Elementi header non trovati');
        return;
    }
    
    // Ottieni companyId dalla sessione
    const companyId = sessionStorage.getItem('selectedCompanyId') || 1;
    console.log('🏢 Caricamento dati compagnia ID:', companyId);
    
    // Carica i dati della compagnia dalla API
    fetch(`/api/game/companies/${companyId}`)
        .then(res => res.json())
        .then(response => {
            if (response.success && response.data && response.data.company) {
                const company = response.data.company;
                console.log('📊 Dati compagnia ricevuti:', company);
                
                // Aggiorna il nome della compagnia
                if (company.name) {
                    companyNameEl.textContent = company.name;
                }
                
                // Aggiorna il denaro
                if (typeof company.money !== 'undefined') {
                    const formattedMoney = '💰 €' + Number(company.money).toLocaleString();
                    moneyEl.textContent = formattedMoney;
                }
                
                // Aggiorna la reputazione
                if (typeof company.reputation !== 'undefined') {
                    const formattedReputation = '⭐ ' + company.reputation;
                    reputationEl.textContent = formattedReputation;
                }
                
                // Aggiorna la data di gioco (formattata correttamente)
                if (company.game_date && gameDateEl) {
                    const gameDate = new Date(company.game_date);
                    if (!isNaN(gameDate.getTime())) {
                        const mesi = [
                            'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
                        ];
                        const month = mesi[gameDate.getMonth()];
                        const year = gameDate.getFullYear();
                        gameDateEl.textContent = `📅 ${month} ${year}`;
                        console.log('📅 Data gioco aggiornata:', `${month} ${year}`);
                    }
                }
                
                console.log('✅ Header compagnia aggiornato');
            } else {
                console.warn('⚠️ Dati compagnia non trovati nella risposta:', response);
            }
        })
        .catch(error => {
            console.error('❌ Errore caricamento dati compagnia:', error);
        });
}

// Avvia l'aggiornamento dell'header quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        updateCompanyHeader();
        setupFleetButton();
    });
} else {
    // DOM già caricato
    setTimeout(function() {
        updateCompanyHeader();
        setupFleetButton();
    }, 100);
}

// Configura il bottone acquisto aeromobile
function setupFleetButton() {
    const buyAircraftBtn = document.getElementById('buy-aircraft');
    if (buyAircraftBtn) {
        buyAircraftBtn.addEventListener('click', function() {
            console.log('🛒 Apertura interfaccia acquisto aeromobile avanzata...');
            // Usa il sistema avanzato dal FleetTab-compatible
            if (typeof openFleetPurchaseUI === 'function') {
                openFleetPurchaseUI();
            } else {
                console.error('❌ Sistema acquisto avanzato non caricato');
                alert('Errore: Sistema acquisto non disponibile');
            }
        });
        console.log('✅ Bottone acquisto aeromobile configurato con sistema avanzato');
    } else {
        console.warn('⚠️ Bottone buy-aircraft non trovato');
    }
}

// Apre il modal per l'acquisto di aeromobili
function openAircraftModal() {
    console.log('📱 Apertura modal acquisto aeromobile...');
    
    const modal = document.getElementById('aircraft-modal');
    if (!modal) {
        console.error('❌ Modal aircraft-modal non trovato');
        return;
    }
    
    // Mostra il modal
    modal.classList.remove('hidden');
    
    // Carica gli aeromobili disponibili
    loadAircraftCatalog();
    
    // Setup close button
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.classList.add('hidden');
        };
    }
    
    // Chiudi modal se si clicca fuori
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
}

// Carica il catalogo degli aeromobili disponibili
function loadAircraftCatalog() {
    const catalog = document.getElementById('aircraft-catalog');
    if (!catalog) return;
    
    console.log('📋 Caricamento catalogo aeromobili...');
    catalog.innerHTML = '<p>🔄 Caricamento aeromobili disponibili...</p>';
    
    // Carica i dati dalla API
    fetch('/api/game/aircraft-data')
        .then(res => res.json())
        .then(response => {
            console.log('📊 Risposta API aeromobili:', response);
            
            // L'API restituisce { success: true, data: [...] }
            if (response && response.success && Array.isArray(response.data)) {
                renderAircraftCatalog(response.data);
            } else if (Array.isArray(response)) {
                // Fallback se la risposta è direttamente un array
                renderAircraftCatalog(response);
            } else {
                console.error('❌ Formato risposta API non riconosciuto:', response);
                catalog.innerHTML = '<p>❌ Errore nel formato dei dati degli aeromobili</p>';
            }
        })
        .catch(error => {
            console.error('❌ Errore caricamento aeromobili:', error);
            catalog.innerHTML = '<p>❌ Errore di connessione al server</p>';
        });
}

// Renderizza il catalogo degli aeromobili
function renderAircraftCatalog(aircraftData) {
    const catalog = document.getElementById('aircraft-catalog');
    if (!catalog) return;
    
    let html = '<div class="aircraft-grid">';
    
    aircraftData.forEach(aircraft => {
        // Converti il prezzo da stringa a numero
        let price = aircraft.purchase_price || aircraft.price || 0;
        if (typeof price === 'string') {
            price = parseInt(price) || 0;
        }
        
        const capacity = aircraft.capacity || 'N/A';
        const range = aircraft.range_km ? `${aircraft.range_km} km` : 'N/A';
        
        html += `
            <div class="aircraft-card">
                <h3>${aircraft.name}</h3>
                <p><strong>Produttore:</strong> ${aircraft.manufacturer}</p>
                <p><strong>Categoria:</strong> ${aircraft.category || 'N/A'}</p>
                <p><strong>Capacità:</strong> ${capacity} passeggeri</p>
                <p><strong>Autonomia:</strong> ${range}</p>
                <p><strong>Prezzo:</strong> €${price > 0 ? Math.round(price / 1000000).toLocaleString() + 'M' : 'N/A'}</p>
                <button class="buy-btn" onclick="buyAircraft('${aircraft.name}', ${price})">
                    💰 Acquista
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    catalog.innerHTML = html;
    
    console.log('✅ Catalogo aeromobili renderizzato:', aircraftData.length, 'aeromobili');
}

// Acquista un aeromobile specifico
function buyAircraft(aircraftName, price) {
    console.log('🛒 Acquisto aeromobile:', aircraftName, 'Prezzo:', price);
    
    // Per ora conferma l'acquisto con alert
    // Successivamente questo farà la chiamata API per l'acquisto
    const confirmed = confirm(`Confermi l'acquisto di ${aircraftName} per €${typeof price === 'number' ? price.toLocaleString() : price}?`);
    
    if (confirmed) {
        alert('🚧 Acquisto simulato!\n\nIn produzione verrà implementata la logica per:\n- Verificare fondi disponibili\n- Aggiornare la flotta\n- Aggiornare il budget');
        
        // Chiudi il modal
        const modal = document.getElementById('aircraft-modal');
        if (modal) modal.classList.add('hidden');
    }
}

// Esporta globalmente per uso esterno
window.updateCompanyHeader = updateCompanyHeader;
window.setupFleetButton = setupFleetButton;
window.openAircraftModal = openAircraftModal;
window.loadAircraftCatalog = loadAircraftCatalog;
window.renderAircraftCatalog = renderAircraftCatalog;
window.buyAircraft = buyAircraft;

console.log('✅ hubPage-simple compatibile caricato');
