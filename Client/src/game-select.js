// Script per la selezione dei salvataggi - Sistema Unificato
console.log('🎮 Caricamento game-select.js...');

let authManager;
let currentUser;
let selectedSaveToDelete = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Inizializzazione pagina selezione giochi...');
    
    authManager = new AuthManager();
    
    // Verifica autenticazione
    if (!authManager.loadCurrentUser()) {
        console.log('❌ Utente non autenticato, reindirizzo al login...');
        window.location.href = 'pages/auth/login.html';
        return;
    }
    
    currentUser = authManager.getCurrentUser();
    console.log('✅ Utente autenticato:', currentUser.email);
    
    // Carica i modali necessari
    loadAllModals().then(() => {
        initializeGameSelectPage();
        setupDeleteModalListeners();
    });
});

async function loadAllModals() {
    console.log('📂 Caricamento modali...');
    const modalsToLoad = [
        { id: 'delete-modal', path: '/game/pages/modals/delete-modal.html' },
        { id: 'new-game-modal', path: '/game/pages/modals/new-game-modal.html' },
        { id: 'select-hub-modal', path: '/game/pages/modals/select-hub-modal.html' }
    ];
    
    for (const modal of modalsToLoad) {
        try {
            console.log(`📄 Caricamento modal: ${modal.id} da ${modal.path}`);
            const response = await fetch(modal.path);
            if (response.ok) {
                const html = await response.text();
                const container = document.getElementById(modal.id);
                if (container) {
                    // Invece di mettere il contenuto dentro il container, sostituiamo il container
                    container.outerHTML = html;
                    console.log(`✅ Modal ${modal.id} caricato con successo`);
                    
                    // Assicuriamoci che sia nascosto
                    const loadedModal = document.getElementById(modal.id);
                    if (loadedModal && !loadedModal.classList.contains('hidden')) {
                        loadedModal.classList.add('hidden');
                    }
                } else {
                    console.warn(`⚠️ Container ${modal.id} non trovato nel DOM`);
                }
            } else {
                console.error(`❌ Errore caricamento ${modal.path}: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error(`❌ Errore caricamento modal ${modal.id}:`, error);
        }
    }
    
    // Attiva i listeners dopo che tutti i modali sono stati caricati
    attachDeleteModalListeners();
    attachHubModalListeners();
    attachNewGameModalListeners();
}

function setupDeleteModalListeners() {
    // Questa funzione è stata spostata in attachDeleteModalListeners()
    // per essere chiamata dopo il caricamento dinamico del modal
}

function attachNewGameModalListeners() {
    console.log('🔗 Attivazione listeners new-game-modal...');
    const newGameFormEl = document.getElementById('new-game-form');
    if (newGameFormEl) {
        newGameFormEl.addEventListener('submit', handleNewGame);
        console.log('✅ Listener form nuovo gioco attivato');
    }
    
    const openHubBtn = document.getElementById('open-hub-modal-btn');
    if (openHubBtn) {
        openHubBtn.addEventListener('click', function() { 
            const scenario = document.getElementById('scenario')?.value; 
            openSelectHubModal(scenario); 
        });
        console.log('✅ Listener apertura hub modal attivato');
    }
    
    const cancelBtn = document.getElementById('cancel-new-game');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const modal = document.getElementById('new-game-modal');
            if (modal) modal.classList.add('hidden');
        });
        console.log('✅ Listener annulla nuovo gioco attivato');
    }
    
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = document.getElementById('new-game-modal');
            if (modal) modal.classList.add('hidden');
        });
        console.log('✅ Listener chiudi modal attivato');
    }
}

function attachHubModalListeners() {
    console.log('🔗 Attivazione listeners hub-modal...');
    const closeHubModalBtn = document.getElementById('close-hub-modal');
    if (closeHubModalBtn) {
        closeHubModalBtn.addEventListener('click', function() {
            const modal = document.getElementById('select-hub-modal');
            if (modal) modal.classList.add('hidden');
        });
        console.log('✅ Listener chiudi hub modal attivato');
    }
}

async function initializeGameSelectPage() {
    // Mostra nome utente
    updateUserInfo();
    
    // Carica salvataggi
    await loadUserSaves();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Pagina selezione giochi inizializzata');
}

function updateUserInfo() {
    const welcomeText = document.getElementById('welcome-text');
    const userName = currentUser.email.split('@')[0];
    welcomeText.innerHTML = `Benvenuto, <strong>${userName}</strong>`;
}

async function loadUserSaves() {
    const savesContainer = document.getElementById('saves-container');
    const noSavesDiv = document.getElementById('no-saves');
    savesContainer.innerHTML = '';

    console.log('🔍 Debug: inizio loadUserSaves');
    console.log('🔍 savesContainer:', savesContainer);
    console.log('🔍 noSavesDiv:', noSavesDiv);
    console.log('🔍 noSavesDiv classes:', noSavesDiv?.classList.toString());

    // Utente autenticato: carica compagnie dal backend
    try {
        const res = await fetch('/api/game/companies');
        if (!res.ok) throw new Error('Errore nel recupero compagnie dal server');
        const result = await res.json();
        const companies = (result && result.data) ? result.data : [];
        
        console.log('🔍 Compagnie trovate:', companies.length);
        
        if (companies.length === 0) {
            console.log('🔍 Nessuna compagnia, mostro no-saves div');
            savesContainer.style.display = 'none';
            noSavesDiv.classList.remove('hidden');
            
            // Debug: verifico che il pulsante sia visibile dopo aver mostrato no-saves
            setTimeout(() => {
                const startFirstBtn = document.getElementById('start-first-game');
                console.log('🔍 start-first-game dopo timeout:', startFirstBtn);
                console.log('🔍 start-first-game visibile?', startFirstBtn?.offsetParent !== null);
            }, 100);
            
        } else {
            console.log('🔍 Compagnie trovate, mostro saves container');
            savesContainer.style.display = 'grid';
            noSavesDiv.classList.add('hidden');
            companies.forEach(company => {
                const card = createCompanyCard(company);
                savesContainer.appendChild(card);
            });
        }
        console.log('📂 Caricate', companies.length, 'compagnie dal server');
    } catch (e) {
        console.log('🔍 Errore, mostro no-saves div');
        savesContainer.style.display = 'none';
        noSavesDiv.classList.remove('hidden');
        showToast('Errore caricamento compagnie: ' + e.message, 'error');
    }
}

function createCompanyCard(company) {
    const card = document.createElement('div');
    card.className = 'save-card';
    const money = company.money ? '€' + company.money.toLocaleString() : 'N/A';
    const reputation = company.reputation || 0;
    const aircraftCount = company.aircraft_count || 0;
    const routeCount = company.routes_count || 0;
    const founded = company.founded ? new Date(company.founded).toLocaleDateString('it-IT') : 'N/A';
    // Placeholder per hub, verrà aggiornato async
    let hub = '...';
    card.innerHTML = `
        <div class="save-header">
            <div class="save-title">
                <h3>${company.name}</h3>
            </div>
            <button class="delete-save-btn red" title="Elimina salvataggio" onclick="showDeleteSaveModal('${company.id}', '${company.name}')">
                🗑️
            </button>
        </div>
        <div class="save-info">
            <p><strong>📅 Fondata:</strong> ${founded}</p>
            <p><strong>💰 Budget:</strong> ${money}</p>
        </div>
        <div class="save-stats">
            <div class="stat-item">
                <span class="stat-value">⭐ ${reputation}</span>
                <span class="stat-label">Reputazione</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">✈️ ${aircraftCount}</span>
                <span class="stat-label">Aeromobili</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">🛣️ ${routeCount}</span>
                <span class="stat-label">Rotte</span>
            </div>
            <div class="stat-item hub-item">
                <span class="stat-value hub-value">${hub}</span>
                <span class="stat-label">Hub Principale</span>
            </div>
        </div>
        <button class="action-btn primary load-save-btn" onclick="startGameFromCompany('${company.id}')">
            🎮 Carica Partita
        </button>
    `;
    // Aggiorna async il codice IATA dell'hub
    if (company.base_airport) {
        fetch(`/api/airports/${company.base_airport}`)
            .then(res => res.json())
            .then(data => {
                // Corretto: estrai iata_code da data.data.airport
                const iata = data && data.data && data.data.airport && data.data.airport.iata_code
                    ? data.data.airport.iata_code
                    : company.base_airport;
                const hubSpan = card.querySelector('.hub-value');
                if (hubSpan) hubSpan.textContent = iata;
            })
            .catch(() => {
                const hubSpan = card.querySelector('.hub-value');
                if (hubSpan) hubSpan.textContent = company.base_airport;
            });
    }
    return card;
}

window.startGameFromCompany = function(companyId) {
    // Salva il companyId selezionato in sessionStorage e reindirizza
    sessionStorage.setItem('selectedCompanyId', companyId);
    console.log('[DEBUG] Salvato selectedCompanyId in sessionStorage:', companyId, '| typeof:', typeof companyId);
    
    // Redirect alla pagina hub (che ha tutti gli script necessari)
    window.location.href = '/game/pages/hub.html';
}

// ========== SISTEMA DRILL-DOWN GEOGRAFICO ==========

let allAirportsData = null; // Cache globale aeroporti

async function loadAirportsData(selectedScenario = null) {
    if (allAirportsData) {
        console.log('🎯 Usando cache aeroporti esistente');
        return allAirportsData; // Usa cache se già caricati
    }
    
    try {
        console.log('🛫 Caricamento aeroporti dal database...');
        const response = await fetch('/api/airports');
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const airports = await response.json();
        console.log(`✅ Caricati ${airports.length} aeroporti dal server`);
        console.log('📊 Sample airport:', airports[0]); // Log del primo aeroporto per debug
        
        // Se non c'è uno scenario selezionato, prova a prenderlo dal form
        if (!selectedScenario) {
            const scenarioSelect = document.getElementById('scenario');
            selectedScenario = scenarioSelect ? scenarioSelect.value : 'aviation_dawn';
        }
        
        // Mappatura scenario -> anno
        const scenarioYears = {
            aviation_dawn: 1950,
            jet_age: 1970,
            deregulation: 1990,
            modern_era: 2024
        };
        
        const targetYear = scenarioYears[selectedScenario] || 1950;
        console.log(`🎯 Scenario: ${selectedScenario}, Anno target: ${targetYear}`);
        
        // Costruisci URL con parametri per filtrare per anno e dimensione aeroporto
        const apiUrl = new URL('/api/airports', window.location.origin);
        apiUrl.searchParams.set('before', `${targetYear}-12-31`); // Filtra aeroporti aperti prima del 31 dicembre dell'anno target
        apiUrl.searchParams.set('size', 'large,medium'); // Solo aeroporti grandi e medi per la partenza
        apiUrl.searchParams.set('limit', '1000'); // Aumenta il limite per avere più opzioni
        
        console.log('🌐 URL API completo:', apiUrl.toString());
        
        // Richiama l'API con i parametri corretti
        const responseWithParams = await fetch(apiUrl);
        console.log('📡 Response status con parametri:', responseWithParams.status, responseWithParams.statusText);
        
        if (!responseWithParams.ok) {
            throw new Error(`API error: ${responseWithParams.status} ${responseWithParams.statusText}`);
        }
        
        const airportsFiltered = await responseWithParams.json();
        console.log(`✅ Caricati ${airportsFiltered.length} aeroporti filtrati dal server`);
        console.log('📊 Sample airport filtrato:', airportsFiltered[0]); // Log del primo aeroporto per debug
        
        // Il server ha già filtrato per anno e dimensione, non serve filtrare ulteriormente
        allAirportsData = airportsFiltered;
        console.log(`💾 Cache aggiornata con ${allAirportsData.length} aeroporti`);
        
        return allAirportsData;
        return allAirportsData;
        
    } catch (error) {
        console.error('❌ Errore caricamento aeroporti:', error);
        throw error;
    }
}

function getContinentsFromAirports(airports) {
    const continents = new Set();

    airports.forEach(airport => {
        // Estrai continente dal timezone (formato: Europe/Rome, America/New_York, etc.)
        let continent = '';
        if (airport.timezone) {
            const timezoneParts = airport.timezone.split('/');
            if (timezoneParts.length >= 1) {
                const timezoneContinent = timezoneParts[0];
                
                // Mappa timezone continents a nomi italiani
                switch (timezoneContinent) {
                    case 'Europe':
                        continent = 'Europa';
                        break;
                    case 'America':
                        // Distingui tra Nord e Sud America in base alla latitudine
                        if (airport.latitude && parseFloat(airport.latitude) >= 0) {
                            continent = 'Nord America';
                        } else {
                            continent = 'Sud America';
                        }
                        break;
                    case 'Asia':
                        continent = 'Asia';
                        break;
                    case 'Africa':
                        continent = 'Africa';
                        break;
                    case 'Australia':
                        continent = 'Oceania';
                        break;
                }
            }
        }
        
        if (continent && continent.length > 2) continents.add(continent);
    });

    return Array.from(continents).sort();
}

function getCountriesFromAirports(airports, selectedContinent) {
    const countries = new Set();
    
    airports
        .filter(airport => {
            // Usa la stessa logica di getContinentsFromAirports per determinare il continente
            let continent = '';
            if (airport.timezone) {
                const timezoneParts = airport.timezone.split('/');
                if (timezoneParts.length >= 1) {
                    const timezoneContinent = timezoneParts[0];
                    
                    switch (timezoneContinent) {
                        case 'Europe':
                            continent = 'Europa';
                            break;
                        case 'America':
                            if (airport.latitude && parseFloat(airport.latitude) >= 0) {
                                continent = 'Nord America';
                            } else {
                                continent = 'Sud America';
                            }
                            break;
                        case 'Asia':
                            continent = 'Asia';
                            break;
                        case 'Africa':
                            continent = 'Africa';
                            break;
                        case 'Australia':
                            continent = 'Oceania';
                            break;
                    }
                }
            }
            return continent === selectedContinent;
        })
        .forEach(airport => {
            if (airport.country) {
                countries.add(airport.country);
            }
        });
    
    return Array.from(countries).sort();
}

function getAirportsFromCountry(airports, selectedCountry) {
    return airports
        .filter(airport => airport.country === selectedCountry)
        .sort((a, b) => (b.business_level || 0) - (a.business_level || 0));
}

async function populateContinents() {
    console.log('🌍 populateContinents chiamata');
    const continentSelect = document.getElementById('continent-select');
    if (!continentSelect) {
        console.error('❌ continent-select non trovato');
        return;
    }
    
    try {
        console.log('📡 Chiamata loadAirportsData...');
        const airports = await loadAirportsData();
        console.log('✈️ Aeroporti ricevuti:', airports?.length || 0);
        
        if (!airports || airports.length === 0) {
            console.error('❌ Nessun aeroporto ricevuto');
            continentSelect.innerHTML = '<option value="">Nessun aeroporto disponibile</option>';
            return;
        }
        
        const continents = getContinentsFromAirports(airports);
        console.log('🌍 Continenti estratti:', continents);
        
        continentSelect.innerHTML = '<option value="">Seleziona continente...</option>';
        
        continents.forEach(continent => {
            const option = document.createElement('option');
            option.value = continent;
            option.textContent = `🌍 ${continent}`;
            continentSelect.appendChild(option);
        });
        
        console.log(`✅ Popolati ${continents.length} continenti`);
        
    } catch (error) {
        console.error('❌ Errore popolamento continenti:', error);
        continentSelect.innerHTML = '<option value="">Errore caricamento continenti</option>';
    }
}

function populateCountries(selectedContinent) {
    const countrySelect = document.getElementById('country-select');
    const airportSelect = document.getElementById('airport-select');
    
    if (!countrySelect || !allAirportsData) return;
    
    // Reset campi successivi
    countrySelect.innerHTML = '<option value="">Seleziona nazione...</option>';
    countrySelect.disabled = false;
    
    airportSelect.innerHTML = '<option value="">Seleziona aeroporto...</option>';
    airportSelect.disabled = true;
    
    const confirmBtn = document.getElementById('confirm-hub-btn');
    if (confirmBtn) confirmBtn.disabled = true;
    
    const countries = getCountriesFromAirports(allAirportsData, selectedContinent);
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        
        // Aggiungi bandiera/emoji se disponibile
        const countryFlags = {
            'United States': '🇺🇸',
            'United Kingdom': '🇬🇧',
            'Germany': '🇩🇪',
            'France': '🇫🇷',
            'Italy': '🇮🇹',
            'Spain': '🇪🇸',
            'Japan': '🇯🇵',
            'China': '🇨🇳',
            'Canada': '🇨🇦',
            'Australia': '🇦🇺',
            'Brazil': '🇧🇷'
        };
        
        const flag = countryFlags[country] || '🏳️';
        option.textContent = `${flag} ${country}`;
        countrySelect.appendChild(option);
    });
    
    console.log(`✅ Popolate ${countries.length} nazioni per ${selectedContinent}`);
}

function populateAirports(selectedCountry) {
    const airportSelect = document.getElementById('airport-select');
    
    if (!airportSelect || !allAirportsData) return;
    
    // Reset
    airportSelect.innerHTML = '<option value="">Seleziona aeroporto...</option>';
    airportSelect.disabled = false;
    
    const confirmBtn = document.getElementById('confirm-hub-btn');
    if (confirmBtn) confirmBtn.disabled = true;
    
    const airports = getAirportsFromCountry(allAirportsData, selectedCountry);
    
    airports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.iata_code;
        
        // Formato con informazioni utili
        const openedYear = airport.opened_date ? new Date(airport.opened_date).getFullYear() : '';
        const eraInfo = openedYear ? `(dal ${openedYear})` : '';
        const sizeIcon = airport.airport_size === 'large' ? '🏢' : '🏬';
        const businessInfo = airport.business_level ? ` - Business: ${airport.business_level}%` : '';
        
        option.textContent = `${sizeIcon} ${airport.name} (${airport.iata_code}) - ${airport.city} ${eraInfo}${businessInfo}`;
        option.setAttribute('data-airport-name', airport.name);
        option.setAttribute('data-airport-city', airport.city);
        option.setAttribute('data-airport-country', airport.country);
        option.setAttribute('data-business-level', airport.business_level || 0);
        option.setAttribute('data-tourist-level', airport.tourist_level || 0);
        option.setAttribute('data-airport-size', airport.airport_size);
        
        airportSelect.appendChild(option);
    });
    
    console.log(`✅ Popolati ${airports.length} aeroporti per ${selectedCountry}`);
}

// Funzione di compatibilità con il sistema esistente
async function populateStartingAirports(selectedScenario = null) {
    console.log('🔄 Inizializzando sistema drill-down aeroporti...');
    await populateContinents();
}

function setupEventListeners() {
    console.log('🔧 Setup event listeners...');
    
    // Debug: verifica tutti i pulsanti nel DOM
    console.log('🔍 Verifica pulsanti nel DOM:');
    console.log('  - new-game-btn:', document.getElementById('new-game-btn'));
    console.log('  - start-first-game:', document.getElementById('start-first-game'));
    console.log('  - no-saves div:', document.getElementById('no-saves'));
    console.log('  - no-saves hidden?', document.getElementById('no-saves')?.classList.contains('hidden'));
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showLoading('Logout in corso...');
            setTimeout(function() {
                if (authManager && typeof authManager.logout === 'function') authManager.logout();
                window.location.href = '/game/pages/auth/login.html';
            }, 500);
        });
        console.log('✅ Logout button event listener attivato');
    } else {
        console.warn('[game-select] logout-btn non trovato in DOM');
    }
    
    // New game buttons
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function(e) {
            console.log('🎯 Click su new-game-btn!');
            showNewGameModal();
        });
        console.log('✅ new-game-btn event listener attivato');
    } else {
        console.warn('[game-select] new-game-btn non trovato');
    }
    
    const startFirstBtn = document.getElementById('start-first-game');
    if (startFirstBtn) {
        startFirstBtn.addEventListener('click', function(e) {
            console.log('🎯 Click su start-first-game!');
            showNewGameModal();
        });
        console.log('✅ start-first-game event listener attivato');
    } else {
        console.warn('[game-select] start-first-game non trovato');
    }
    
    console.log('🔧 Setup event listeners completato');
    
    // Scenario change listener - ricarica aeroporti quando cambia lo scenario
    document.addEventListener('change', async function(e) {
        if (e.target && e.target.id === 'scenario') {
            const selectedScenario = e.target.value;
            console.log('📅 Scenario cambiato:', selectedScenario);
            // Reset cache per ricaricare con nuovo scenario
            allAirportsData = null;
            await populateStartingAirports(selectedScenario);
        }
    });
    
    // DRILL-DOWN EVENT LISTENERS
    
    // Continente selezionato
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'continent-select') {
            const selectedContinent = e.target.value;
            if (selectedContinent) {
                console.log('🌍 Continente selezionato:', selectedContinent);
                populateCountries(selectedContinent);
            } else {
                // Reset se deselezionato
                const countrySelect = document.getElementById('country-select');
                const airportSelect = document.getElementById('airport-select');
                const confirmBtn = document.getElementById('confirm-hub-btn');
                
                if (countrySelect) {
                    countrySelect.innerHTML = '<option value="">Seleziona nazione...</option>';
                    countrySelect.disabled = true;
                }
                if (airportSelect) {
                    airportSelect.innerHTML = '<option value="">Seleziona aeroporto...</option>';
                    airportSelect.disabled = true;
                }
                if (confirmBtn) confirmBtn.disabled = true;
            }
        }
    });
    
    // Nazione selezionata
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'country-select') {
            const selectedCountry = e.target.value;
            if (selectedCountry) {
                console.log('🏳️ Nazione selezionata:', selectedCountry);
                populateAirports(selectedCountry);
            } else {
                // Reset se deselezionato
                const airportSelect = document.getElementById('airport-select');
                const confirmBtn = document.getElementById('confirm-hub-btn');
                
                if (airportSelect) {
                    airportSelect.innerHTML = '<option value="">Seleziona aeroporto...</option>';
                    airportSelect.disabled = true;
                }
                if (confirmBtn) confirmBtn.disabled = true;
            }
        }
    });
    
    // Aeroporto selezionato
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'airport-select') {
            const selectedAirport = e.target.value;
            const confirmBtn = document.getElementById('confirm-hub-btn');
            
            if (selectedAirport && confirmBtn) {
                const option = e.target.selectedOptions[0];
                const airportName = option.getAttribute('data-airport-name');
                const airportCity = option.getAttribute('data-airport-city');
                const airportCountry = option.getAttribute('data-airport-country');
                const airportSize = option.getAttribute('data-airport-size');
                
                console.log('✈️ Aeroporto selezionato:', selectedAirport, '-', airportName);
                confirmBtn.disabled = false;
                confirmBtn.textContent = `✅ Conferma ${airportName} (${selectedAirport})`;
            } else if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.textContent = '✅ Conferma Hub';
            }
        }
    });
    
    // Modal controls (safely attach only if present)
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideNewGameModal);
    const cancelNewBtn = document.getElementById('cancel-new-game');
    if (cancelNewBtn) cancelNewBtn.addEventListener('click', hideNewGameModal);
    const newGameFormEl = document.getElementById('new-game-form');
    if (newGameFormEl) newGameFormEl.addEventListener('submit', handleNewGame);
    
    // Hub Selection Modal controls
    const closeHubModalBtn = document.getElementById('close-hub-modal');
    if (closeHubModalBtn) closeHubModalBtn.addEventListener('click', closeSelectHubModal);
    const cancelHubBtn = document.getElementById('cancel-hub-select');
    if (cancelHubBtn) cancelHubBtn.addEventListener('click', closeSelectHubModal);
    const confirmHubBtn = document.getElementById('confirm-hub-btn');
    if (confirmHubBtn) confirmHubBtn.addEventListener('click', confirmHubSelection);
    
    // Previeni submit del form hub selection
    const selectHubForm = document.getElementById('select-hub-form');
    if (selectHubForm) {
        selectHubForm.addEventListener('submit', (e) => {
            e.preventDefault();
            confirmHubSelection();
        });
    }
    
    // Delete modal controls
    const closeDeleteBtn = document.getElementById('close-delete-modal');
    if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', hideDeleteModal);
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    // Toast close
    const toastCloseBtn = document.getElementById('toast-close');
    if (toastCloseBtn) toastCloseBtn.addEventListener('click', hideToast);
    
    // Click outside modal to close
    document.addEventListener('click', function(e) {
        const newGameModal = document.getElementById('new-game-modal');
        const selectHubModal = document.getElementById('select-hub-modal');
        const deleteModal = document.getElementById('delete-modal');
    
        if (e.target === newGameModal) hideNewGameModal();
        if (e.target === selectHubModal) closeSelectHubModal();
        if (e.target === deleteModal) hideDeleteModal();
    });
}

// Hook used by selectPage.js after it injects modal HTML. This ensures listeners
// that depend on modal DOM are attached even if templates were loaded asynchronously.
window.onModalInjected = function(modalId) {
    console.log(`🔗 Modal ${modalId} iniettato, attivazione listeners...`);
    
    if (modalId === 'new-game-modal') {
        attachNewGameModalListeners();
    }

    if (modalId === 'select-hub-modal') {
        attachHubModalListeners();
    }

    if (modalId === 'delete-modal') {
        attachDeleteModalListeners();
    }
};

// Funzione per mostrare la modale di eliminazione salvataggio
window.showDeleteSaveModal = function(saveId, saveName) {
    console.log('🗑️ Richiesta apertura modal eliminazione per:', saveId, saveName);
    
    const modal = document.getElementById('delete-modal');
    const saveNameSpan = document.getElementById('delete-save-name');
    
    console.log('🔍 Elementi DOM trovati:', {
        modal: !!modal,
        saveNameSpan: !!saveNameSpan,
        modalClasses: modal ? Array.from(modal.classList) : 'n/a',
        modalDisplay: modal ? getComputedStyle(modal).display : 'n/a',
        modalVisible: modal ? modal.offsetParent !== null : 'n/a'
    });
    
    if (modal && saveNameSpan) {
        selectedSaveToDelete = saveId;
        saveNameSpan.textContent = saveName;
        
        // Rimuovi hidden e forza la visualizzazione
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Forza display flex per i modal
        
        console.log('✅ Modal eliminazione mostrato per:', saveName);
        console.log('🔍 Stato finale modal:', {
            classes: Array.from(modal.classList),
            display: getComputedStyle(modal).display,
            visible: modal.offsetParent !== null
        });
    } else {
        console.error('❌ Modal elementi non trovati:', {
            'delete-modal': !!modal,
            'delete-save-name': !!saveNameSpan
        });
        
        // Prova a ricaricare i modali se non sono stati caricati
        loadAllModals().then(() => {
            console.log('🔄 Riprovo ad aprire il modal dopo ricaricamento...');
            const retryModal = document.getElementById('delete-modal');
            const retrySaveNameSpan = document.getElementById('delete-save-name');
            
            if (retryModal && retrySaveNameSpan) {
                selectedSaveToDelete = saveId;
                retrySaveNameSpan.textContent = saveName;
                retryModal.classList.remove('hidden');
                retryModal.style.display = 'flex';
                console.log('✅ Modal eliminazione mostrato al secondo tentativo');
            } else {
                showToast('Errore apertura modal eliminazione', 'error');
            }
        });
    }
};

function attachDeleteModalListeners() {
    const closeDeleteBtn = document.getElementById('close-delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    console.log('🔌 Attivazione listeners modal eliminazione:', {
        close: !!closeDeleteBtn,
        cancel: !!cancelDeleteBtn,
        confirm: !!confirmDeleteBtn
    });
    
    if (closeDeleteBtn) {
        closeDeleteBtn.addEventListener('click', hideDeleteModal);
        console.log('✅ Listener "close" attivato');
    } else {
        console.warn('⚠️ Pulsante close-delete-modal non trovato');
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
        console.log('✅ Listener "cancel" attivato');
    } else {
        console.warn('⚠️ Pulsante cancel-delete non trovato');
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
        console.log('✅ Listener "confirm" attivato');
    } else {
        console.warn('⚠️ Pulsante confirm-delete non trovato');
    }
}


async function showNewGameModal() {
    console.log('🎬 showNewGameModal chiamata!');
    
    const modal = document.getElementById('new-game-modal');
    const companyNameInput = document.getElementById('company-name-input');
    const scenarioSelect = document.getElementById('scenario');

    console.log('🔍 Modal elements:');
    console.log('  - new-game-modal:', modal);
    console.log('  - company-name-input:', companyNameInput);
    console.log('  - scenario:', scenarioSelect);

    if (!modal) {
        console.warn('[game-select] new-game-modal element not present yet; will attempt to open after injection');
        return;
    }

    // Verifica stile computed prima
    const computedStyle = window.getComputedStyle(modal);
    console.log('🎨 Display prima:', computedStyle.display);
    console.log('🔍 Visibilità prima:', computedStyle.visibility);
    console.log('📄 Modal innerHTML:', modal.innerHTML);

    // Pre-popola nome compagnia con suggerimento (solo se input esiste)
    if (companyNameInput && !companyNameInput.value) {
        const suggestions = [
            'Sky Express Airlines', 'European Wings', 'Global Air Transport',
            'Continental Airways', 'Freedom Airlines', 'Horizon Express',
            'Liberty Air', 'Transcontinental', 'World Connect Airways'
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        companyNameInput.value = randomSuggestion;
        console.log('✅ Nome compagnia suggerito:', randomSuggestion);
    }

    modal.classList.remove('hidden');
    console.log('👁️ Classe hidden rimossa, classList ora:', modal.classList.toString());
    
    // Verifica stile computed dopo
    const computedStyleAfter = window.getComputedStyle(modal);
    console.log('🎨 Display dopo:', computedStyleAfter.display);
    console.log('🔍 Visibilità dopo:', computedStyleAfter.visibility);
    
    // Force display se necessario
    if (computedStyleAfter.display === 'none') {
        console.log('🔧 Forzo display flex');
        modal.style.display = 'flex';
    }
    console.log('✅ Modal mostrato!');
}

function hideNewGameModal() {
    const modal = document.getElementById('new-game-modal');
    if (modal) modal.classList.add('hidden');
}

async function openSelectHubModal(scenario = 'aviation_dawn') {
    const modal = document.getElementById('select-hub-modal');
    if (!modal) {
        console.error('select-hub-modal non trovato');
        return;
    }

    // Reset del form e stato
    const continentSelect = document.getElementById('continent-select');
    const countrySelect = document.getElementById('country-select');
    const airportSelect = document.getElementById('airport-select');
    const confirmBtn = document.getElementById('confirm-hub-btn');
    
    if (continentSelect) continentSelect.value = '';
    if (countrySelect) {
        countrySelect.innerHTML = '<option value="">Seleziona nazione...</option>';
        countrySelect.disabled = true;
    }
    if (airportSelect) {
        airportSelect.innerHTML = '<option value="">Seleziona aeroporto...</option>';
        airportSelect.disabled = true;
    }
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '✅ Conferma Hub';
    }

    // Mostra il modal
    modal.classList.remove('hidden');

    // Carica i continenti per lo scenario selezionato
    try {
        console.log('🌍 Caricamento continenti per scenario:', scenario);
        // Reset cache per nuovo scenario
        allAirportsData = null;
        await populateStartingAirports(scenario);
    } catch (error) {
        console.error('❌ Errore caricamento continenti per hub modal:', error);
        showToast('Errore caricamento aeroporti', 'error');
    }
}

function closeSelectHubModal() {
    const modal = document.getElementById('select-hub-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function confirmHubSelection() {
    const airportSelect = document.getElementById('airport-select');
    const selectedHubSummary = document.getElementById('selected-hub-summary');
    const hiddenInput = document.getElementById('starting-airport');
    
    if (!airportSelect || !selectedHubSummary || !hiddenInput) {
        console.error('Elementi hub selection non trovati');
        return;
    }
    
    const selectedValue = airportSelect.value;
    if (!selectedValue) {
        showToast('Seleziona un aeroporto prima di confermare', 'error');
        return;
    }
    
    // Ottieni dati dall'opzione selezionata
    const selectedOption = airportSelect.selectedOptions[0];
    const airportName = selectedOption.getAttribute('data-airport-name');
    const airportCity = selectedOption.getAttribute('data-airport-city');
    const airportCountry = selectedOption.getAttribute('data-airport-country');
    const airportSize = selectedOption.getAttribute('data-airport-size');
    const businessLevel = selectedOption.getAttribute('data-business-level');
    
    // Aggiorna il riassunto nel modal principale
    const sizeIcon = airportSize === 'large' ? '🏢' : '🏬';
    const businessInfo = businessLevel ? ` (Business: ${businessLevel}%)` : '';
    
    selectedHubSummary.textContent = `${sizeIcon} ${airportName} (${selectedValue}) - ${airportCity}, ${airportCountry}${businessInfo}`;
    selectedHubSummary.classList.add('selected');
    
    // Salva il valore nel campo nascosto
    hiddenInput.value = selectedValue;
    
    // Chiudi il modal
    closeSelectHubModal();
    
    console.log('✅ Hub selezionato:', selectedValue, '-', airportName);
    showToast(`Hub selezionato: ${airportName}`, 'success');
}

function handleNewGame(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const saveName = formData.get('saveName').trim();
    const companyName = formData.get('companyName').trim();
    const startingAirport = formData.get('startingAirport');
    const scenario = formData.get('scenario');
    
    // Validazione
    if (!saveName || !companyName || !startingAirport || !scenario) {
        showToast('Tutti i campi sono obbligatori', 'error');
        return;
    }
    
    showLoading('Creazione nuovo gioco...');
    
    // Simula creazione gioco
    setTimeout(function() {
        createNewGame(saveName, companyName, startingAirport, scenario);
    }, 1500);
}

function createNewGame(saveName, companyName, startingAirport, scenario) {
    // Configurazioni scenario
    const scenarioSettings = {
        aviation_dawn: {
            year: 1950,
            description: "Inizio epoca del trasporto aereo",
            availableAircraft: ["DC-3", "Lockheed L-049"],
            technology: "basic",
            fuelCost: 0.3,
            regulations: "minimal"
        },
        jet_age: {
            year: 1970,
            description: "Era dei jet commerciali",
            availableAircraft: ["Boeing 707", "DC-8", "Sud Caravelle"],
            technology: "jet_early",
            fuelCost: 0.4,
            regulations: "moderate"
        },
        deregulation: {
            year: 1990,
            description: "Deregolamentazione globale",
            availableAircraft: ["Boeing 737", "A320", "MD-80"],
            technology: "modern",
            fuelCost: 0.5,
            regulations: "competitive"
        },
        modern_era: {
            year: 2020,
            description: "Era moderna",
            availableAircraft: ["A350", "Boeing 787", "A320neo"],
            technology: "advanced",
            fuelCost: 0.8,
            regulations: "strict"
        }
    };
    
    // Dati iniziali fissi per MVP
    const settings = { money: 2000000, reputation: 50 };
    const scenarioData = scenarioSettings[scenario];
    const gameData = {
        company: {
            name: companyName,
            money: settings.money,
            reputation: settings.reputation,
            headquarters: startingAirport
        },
        scenario: {
            id: scenario,
            ...scenarioData
        },
        homeAirport: startingAirport,
        gameTime: {
            currentDate: new Date(scenarioData.year, 0, 1).toISOString(),
            gameSpeed: 1,
            startYear: scenarioData.year
        },
        fleet: [],
        routes: [],
        hubs: [startingAirport], // Il primo hub è gratuito
        research: {
            completedResearch: [],
            currentResearch: null
        },
        stats: {
            totalPassengers: 0,
            totalRevenue: 0,
            totalExpenses: 0
        }
    };
    
    // FLUSSO CORRETTO: sincronizza solo col server
    syncGameWithServer(saveName, gameData).then(() => {
        hideLoading();
        showToast('Nuovo gioco creato e sincronizzato!', 'success');
        hideNewGameModal();
        setTimeout(function() {
            loadUserSaves();
        }, 1000);
    }).catch(error => {
        console.error('❌ Errore sincronizzazione server:', error);
        hideLoading();
        showToast(`Errore sincronizzazione server: ${error.message}. Riprova.`, 'error');
    });
}

// Funzione per sincronizzare il gioco con il server
async function syncGameWithServer(saveName, gameData) {
    try {
        const user = authManager.getCurrentUser();
        
        if (!user || !user.id) {
            throw new Error('Utente non valido per la sincronizzazione');
        }
        
        console.log('🔄 Inizio sincronizzazione con server...', {
            userId: user.id,
            saveName: saveName,
            companyName: gameData.company.name
        });
        
        // Test connessione server prima di iniziare
        try {
            const testResponse = await fetch('/api/game/companies', { method: 'GET' });
            if (!testResponse.ok && testResponse.status === 404) {
                throw new Error('API del server non disponibili (404). Verifica che il server sia avviato.');
            }
        } catch (testError) {
            if (testError.message.includes('Failed to fetch')) {
                throw new Error('Impossibile connettersi al server. Verifica che sia in esecuzione.');
            }
            throw testError;
        }
        
        // Prima crea o aggiorna la compagnia
        const companyPayload = {
            // id: `${user.id}_${saveName}`, // RIMOSSO: lascia generazione id al backend
            name: gameData.company.name,
            money: gameData.company.money,
            reputation: gameData.company.reputation,
            founded: gameData.gameTime.currentDate,
            base_airport: gameData.homeAirport,
            user_id: user.id // <--- AGGIUNTO
        };
        
        console.log('📊 Creazione compagnia sul server...', companyPayload);
        
        const companyResponse = await fetch('/api/game/companies/create-or-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token || 'no-token'}`
            },
            body: JSON.stringify(companyPayload)
        });
        
        console.log('📊 Risposta server compagnia:', companyResponse.status, companyResponse.statusText);
        
        if (!companyResponse.ok) {
            let errorMessage = `Errore HTTP ${companyResponse.status}`;
            try {
                const errorData = await companyResponse.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                const errorText = await companyResponse.text();
                errorMessage = errorText || errorMessage;
            }
            throw new Error(`Creazione compagnia fallita: ${errorMessage}`);
        }
        
        const companyData = await companyResponse.json();
        if (!companyData.success || !companyData.data) {
            throw new Error('Risposta compagnia non valida dal server');
        }
        
        console.log('✅ Compagnia creata/aggiornata:', companyData.data?.name || 'Nome non disponibile');
        
        // SEMPLIFICATO: salva solo l'UUID in sessionStorage e avvia subito il gioco
        if (companyData.data && companyData.data.id) {
            sessionStorage.setItem('selectedCompanyId', companyData.data.id);
            console.log('[DEBUG] Salvato selectedCompanyId in sessionStorage (nuovo gioco):', companyData.data.id, '| typeof:', typeof companyData.data.id);
            window.location.href = 'index.html';
            return;
        }
        
    } catch (error) {
        console.error('❌ Errore sincronizzazione server:', error);
        console.error('Stack trace:', error.stack);
        
        // Rilancia l'errore con messaggio più user-friendly
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Server non raggiungibile. Verifica la connessione di rete.');
        } else if (error.message.includes('404')) {
            throw new Error('API non trovate. Verifica che il server Air Tycoon sia avviato.');
        } else {
            throw error;
        }
    }
}


function hideDeleteModal() {
    console.log('❌ Chiusura modal eliminazione');
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none'; // Forza nascondere
        console.log('✅ Modal nascosto');
    }
    selectedSaveToDelete = null;
}

function confirmDelete() {
    if (!selectedSaveToDelete) return;
    
    showLoading('Eliminazione salvataggio...');
    
    // Usa l'API corretta per eliminare una compagnia
    fetch(`/api/game/companies/${selectedSaveToDelete}`, { 
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Errore ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(result => {
        hideLoading();
        hideDeleteModal();
        showToast('Salvataggio eliminato con successo', 'success');
        loadUserSaves(); // Ricarica la lista
    })
    .catch(error => {
        console.error('Errore eliminazione:', error);
        hideLoading();
        hideDeleteModal();
        showToast('Errore durante l\'eliminazione: ' + error.message, 'error');
    });
}

function showLoading(message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('hidden');
}

function showToast(message, type) {
    const toast = document.getElementById('message-toast');
    const toastText = document.getElementById('toast-text');
    
    toastText.textContent = message;
    
    // Reset classes
    toast.classList.remove('error', 'warning', 'success');
    
    // Add type class
    if (type === 'error') {
        toast.classList.add('error');
    } else if (type === 'warning') {
        toast.classList.add('warning');
    }
    // success is default style
    
    toast.classList.remove('hidden');
    
    // Auto hide after 6 seconds for errors (più tempo per leggere)
    const hideDelay = type === 'error' ? 6000 : 4000;
    setTimeout(hideToast, hideDelay);
}

function hideToast() {
    const toast = document.getElementById('message-toast');
    toast.classList.add('hidden');
}

console.log('✅ game-select.js caricato');
