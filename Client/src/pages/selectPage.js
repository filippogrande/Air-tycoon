// /Client/src/pages/selectPage.js
// Logica principale della pagina select.html (selezione salvataggio)

import { getScenarioDate, continents } from '../utils/gameUtils.js';

// Caricamento dinamico modali (come in hubPage.js)
const modalTemplates = [
    { id: 'new-game-modal', path: '/game/modals/new-game-modal.html' },
    { id: 'delete-modal', path: '/game/modals/delete-modal.html' },
    { id: 'select-hub-modal', path: '/game/modals/select-hub-modal.html' }
];

window.addEventListener('DOMContentLoaded', () => {
    modalTemplates.forEach(modal => {
        fetch(modal.path)
            .then(res => {
                if (!res.ok) throw new Error('Template non trovato: ' + modal.path);
                return res.text();
            })
            .then(html => {
                const container = document.getElementById(modal.id);
                if (container) {
                    // Insert the modal markup right after the placeholder and remove the placeholder
                    container.insertAdjacentHTML('afterend', html);
                    // remove the placeholder element to avoid duplicate IDs
                    container.remove();
                    // After injection the real modal element exists in the DOM; attach listeners
                    attachModalListeners(modal.id);
                    // Notify any page-level code that a modal was injected (hook for other modules)
                    try {
                        if (window.onModalInjected) {
                            window.onModalInjected(modal.id);
                        } else {
                            window.__injectedModals = window.__injectedModals || [];
                            window.__injectedModals.push(modal.id);
                        }
                    } catch (err) {
                        console.warn('[selectPage] onModalInjected hook failed', err.message);
                        window.__injectedModals = window.__injectedModals || [];
                        window.__injectedModals.push(modal.id);
                    }
                    // Dispatch a custom event so any listeners can react immediately
                    try {
                        const ev = new CustomEvent('modalInjected', { detail: { id: modal.id } });
                        document.dispatchEvent(ev);
                    } catch (e) {
                        // ignore if CustomEvent not available
                    }
                }
            })
            .catch(err => {
                console.warn('[selectPage] modal load failed', modal.path, err.message);
            });
    });
});

// --- LOGICA DI PAGINA ---

async function populateStartingAirports(scenario) {
    const scenarioDate = getScenarioDate(scenario);
    const select = document.getElementById('starting-airport');
    if (!select) return;
    select.innerHTML = '<option value="">Caricamento hub disponibili...</option>';
    try {
        const res = await fetch(`/api/airports?size=large&before=${scenarioDate}`);
        if (!res.ok) throw new Error('Errore fetch aeroporti');
        const airports = await res.json();
        select.innerHTML = '<option value="">Seleziona hub di partenza...</option>';
        airports.forEach(a => {
            const label = `${a.name} (${a.iata_code || a.code}) - ${a.city}, ${a.country}`;
            const opt = document.createElement('option');
            opt.value = a.iata_code || a.code;
            opt.textContent = label;
            select.appendChild(opt);
        });
        if (airports.length === 0) {
            select.innerHTML = '<option value="">Nessun hub disponibile per questo scenario</option>';
        }
    } catch (e) {
        select.innerHTML = '<option value="">Errore nel caricamento aeroporti</option>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var scenarioSelect = document.getElementById('scenario');
    if (scenarioSelect) {
        populateStartingAirports(scenarioSelect.value);
        scenarioSelect.addEventListener('change', function(e) {
            populateStartingAirports(e.target.value);
        });
    }
});

// === LOGICA MODALE SELEZIONE HUB ===
let selectedScenario = null;

function openSelectHubModal(scenario) {
    selectedScenario = scenario;
    const modal = document.getElementById('select-hub-modal');
    if (!modal) return console.warn('[selectPage] select-hub-modal not injected');
    modal.classList.remove('hidden');
    populateContinents();
    resetSelect('country-select');
    resetSelect('airport-select');
    const countrySel = document.getElementById('country-select');
    const airportSel = document.getElementById('airport-select');
    const confirmBtn = document.getElementById('confirm-hub-btn');
    if (countrySel) countrySel.disabled = true;
    if (airportSel) airportSel.disabled = true;
    if (confirmBtn) confirmBtn.disabled = true;
}

function closeSelectHubModal() {
    document.getElementById('select-hub-modal').classList.add('hidden');
}

function resetSelect(id) {
    const sel = document.getElementById(id);
    sel.innerHTML = `<option value="">Seleziona ${id.split('-')[0]}...</option>`;
}

function populateContinents() {
    const select = document.getElementById('continent-select');
    if (!select) return;
    select.innerHTML = '<option value="">Seleziona continente...</option>';
    continents.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = c.label;
        select.appendChild(opt);
    });
}

async function populateCountries(continent) {
    const scenarioDate = getScenarioDate(selectedScenario);
    const select = document.getElementById('country-select');
    resetSelect('country-select');
    resetSelect('airport-select');
    document.getElementById('airport-select').disabled = true;
    document.getElementById('confirm-hub-btn').disabled = true;
    if (!continent) {
        select.disabled = true;
        return;
    }
    select.disabled = false;
    select.innerHTML = '<option value="">Caricamento nazioni...</option>';
    const res = await fetch(`/api/airports?continent=${continent}&before=${scenarioDate}`);
    const airports = await res.json();
    const countries = [...new Set(airports.map(a => a.country))].sort();
    select.innerHTML = '<option value="">Seleziona nazione...</option>';
    countries.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

async function populateAirports(country) {
    const scenarioDate = getScenarioDate(selectedScenario);
    const select = document.getElementById('airport-select');
    resetSelect('airport-select');
    document.getElementById('confirm-hub-btn').disabled = true;
    if (!country) {
        select.disabled = true;
        return;
    }
    select.disabled = false;
    select.innerHTML = '<option value="">Caricamento aeroporti...</option>';
    const res = await fetch(`/api/airports?country=${encodeURIComponent(country)}&size=large,medium&before=${scenarioDate}`);
    const airports = await res.json();
    select.innerHTML = '<option value="">Seleziona aeroporto...</option>';
    airports.forEach(a => {
        const label = `${a.name} (${a.iata_code}) - ${a.city} <span style='color:#888'>(${a.airport_size})</span>`;
        const opt = document.createElement('option');
        opt.value = a.iata_code;
        opt.innerHTML = label;
        select.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Attach listeners only if elements exist (modal may be injected async)
    const continent = document.getElementById('continent-select');
    if (continent) continent.addEventListener('change', function(e) { populateCountries(e.target.value); });
    const country = document.getElementById('country-select');
    if (country) country.addEventListener('change', function(e) { populateAirports(e.target.value); });
    const airport = document.getElementById('airport-select');
    if (airport) airport.addEventListener('change', function(e) { const btn = document.getElementById('confirm-hub-btn'); if (btn) btn.disabled = !e.target.value; });
    const closeBtn = document.getElementById('close-hub-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeSelectHubModal);
    const cancelBtn = document.getElementById('cancel-hub-select');
    if (cancelBtn) cancelBtn.addEventListener('click', closeSelectHubModal);
    const selectForm = document.getElementById('select-hub-form');
    if (selectForm) selectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const airportVal = document.getElementById('airport-select')?.value;
        if (airportVal) {
            const start = document.getElementById('starting-airport');
            if (start) start.value = airportVal;
            closeSelectHubModal();
        }
    });
    const newGameForm = document.getElementById('new-game-form');
    if (newGameForm) newGameForm.addEventListener('submit', function(e) {
        const scenario = document.getElementById('scenario')?.value;
        if (!document.getElementById('starting-airport')?.value) {
            e.preventDefault();
            openSelectHubModal(scenario);
        }
    });
    function updateSelectedHubSummary() {
        const val = document.getElementById('starting-airport').value;
        const summary = document.getElementById('selected-hub-summary');
        if (!val) {
            summary.textContent = 'Nessun hub selezionato';
            return;
        }
        const airportSel = document.getElementById('airport-select');
        const opt = Array.from(airportSel.options).find(o => o.value === val);
        if (opt) {
            summary.innerHTML = `Hub selezionato: <b>${opt.textContent}</b>`;
        } else {
            summary.textContent = `Hub selezionato: ${val}`;
        }
    }
    const startingAirportEl = document.getElementById('starting-airport');
    if (startingAirportEl) startingAirportEl.addEventListener('change', updateSelectedHubSummary);

    const openHubBtn = document.getElementById('open-hub-modal-btn');
    if (openHubBtn) openHubBtn.addEventListener('click', function() {
        const scenario = document.getElementById('scenario')?.value;
        openSelectHubModal(scenario);
    });

    const selectHubFormEl = document.getElementById('select-hub-form');
    if (selectHubFormEl) selectHubFormEl.addEventListener('submit', function() {
        updateSelectedHubSummary();
    });
    document.addEventListener('DOMContentLoaded', updateSelectedHubSummary);
});

// Called after a modal template is injected so listeners that depend on modal DOM can be bound
function attachModalListeners(modalId) {
    if (modalId === 'select-hub-modal') {
        const continent = document.getElementById('continent-select');
        if (continent) continent.addEventListener('change', function(e) { populateCountries(e.target.value); });
        const country = document.getElementById('country-select');
        if (country) country.addEventListener('change', function(e) { populateAirports(e.target.value); });
        const closeBtn = document.getElementById('close-hub-modal');
        if (closeBtn) closeBtn.addEventListener('click', closeSelectHubModal);
        const cancelBtn = document.getElementById('cancel-hub-select');
        if (cancelBtn) cancelBtn.addEventListener('click', closeSelectHubModal);
        const selectForm = document.getElementById('select-hub-form');
        if (selectForm) selectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const airportVal = document.getElementById('airport-select')?.value;
            if (airportVal) {
                const start = document.getElementById('starting-airport');
                if (start) start.value = airportVal;
                closeSelectHubModal();
            }
        });
        // Ensure confirm button works even if submit handler wasn't attached for any reason
        const confirmBtn = document.getElementById('confirm-hub-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const airportVal = document.getElementById('airport-select')?.value;
                console.debug('[selectPage] confirm-hub-btn clicked, airportVal=', airportVal);
                if (!airportVal) return;
                const start = document.getElementById('starting-airport');
                if (start) start.value = airportVal;
                // Update summary if present
                const summary = document.getElementById('selected-hub-summary');
                if (summary) {
                    const airportOpt = document.getElementById('airport-select');
                    const opt = airportOpt ? Array.from(airportOpt.options).find(o => o.value === airportVal) : null;
                    if (opt) summary.innerHTML = `Hub selezionato: <b>${opt.textContent}</b>`;
                    else summary.textContent = `Hub selezionato: ${airportVal}`;
                }
                closeSelectHubModal();
            });
        }
        // Ensure confirm button is enabled/disabled when airport selection changes
        const airportSelectEl = document.getElementById('airport-select');
        if (airportSelectEl) {
            airportSelectEl.addEventListener('change', function(e) {
                const btn = document.getElementById('confirm-hub-btn');
                if (btn) btn.disabled = !e.target.value;
            });
        }
    }
}

// Esponi la funzione per altri moduli che potrebbero chiamarla (compatibilità)
if (typeof window !== 'undefined') {
    window.attachModalListeners = attachModalListeners;
}

// Compatibilità: rendiamo disponibili anche le API di apertura/chiusura della
// modal di selezione hub in modo che altri script (es. game-select.js) possano
// chiamarle senza dipendere dall'ordine di caricamento dei moduli.
if (typeof window !== 'undefined') {
    window.openSelectHubModal = openSelectHubModal;
    window.closeSelectHubModal = closeSelectHubModal;
}
