// /Client/src/pages/selectPage.js
// Logica principale della pagina select.html (selezione salvataggio)

import { getScenarioDate, continents } from '../utils/gameUtils.js';

// Caricamento dinamico modali (come in hubPage.js)
const modalTemplates = [
    { id: 'new-game-modal', path: '../../pages/modals/new-game-modal.html' },
    { id: 'delete-modal', path: '../../pages/modals/delete-modal.html' },
    { id: 'select-hub-modal', path: '../../pages/modals/select-hub-modal.html' }
];
window.addEventListener('DOMContentLoaded', () => {
    modalTemplates.forEach(modal => {
        fetch(modal.path)
            .then(res => res.text())
            .then(html => {
                const container = document.getElementById(modal.id);
                if (container) container.innerHTML = html;
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
    document.getElementById('select-hub-modal').classList.remove('hidden');
    populateContinents();
    resetSelect('country-select');
    resetSelect('airport-select');
    document.getElementById('country-select').disabled = true;
    document.getElementById('airport-select').disabled = true;
    document.getElementById('confirm-hub-btn').disabled = true;
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
    document.getElementById('continent-select').addEventListener('change', function(e) {
        populateCountries(e.target.value);
    });
    document.getElementById('country-select').addEventListener('change', function(e) {
        populateAirports(e.target.value);
    });
    document.getElementById('airport-select').addEventListener('change', function(e) {
        document.getElementById('confirm-hub-btn').disabled = !e.target.value;
    });
    document.getElementById('close-hub-modal').addEventListener('click', closeSelectHubModal);
    document.getElementById('cancel-hub-select').addEventListener('click', closeSelectHubModal);
    document.getElementById('select-hub-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const airport = document.getElementById('airport-select').value;
        if (airport) {
            document.getElementById('starting-airport').value = airport;
            closeSelectHubModal();
        }
    });
    document.getElementById('new-game-form').addEventListener('submit', function(e) {
        const scenario = document.getElementById('scenario').value;
        if (!document.getElementById('starting-airport').value) {
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
    document.getElementById('starting-airport').addEventListener('change', updateSelectedHubSummary);
    document.getElementById('open-hub-modal-btn').addEventListener('click', function() {
        const scenario = document.getElementById('scenario').value;
        openSelectHubModal(scenario);
    });
    document.getElementById('select-hub-form').addEventListener('submit', function() {
        updateSelectedHubSummary();
    });
    document.addEventListener('DOMContentLoaded', updateSelectedHubSummary);
});
