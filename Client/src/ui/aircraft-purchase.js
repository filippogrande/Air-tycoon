// Aircraft Purchase Configuration Script
let currentAircraft = null;
let companyId = null;
let quantity = 1;
let registrations = [];
let seatPresetCatalog = [];
let seatConfigurationState = null;
let seatDraftState = null;
let seatDraftBaseState = null;

function getCategoryLabel(category) {
    switch (category) {
        case 'regional':
            return 'Regionale';
        case 'narrow_body':
            return 'Narrow body';
        case 'wide_body':
            return 'Wide body';
        case 'cargo':
            return 'Cargo';
        default:
            return category ? String(category) : '-';
    }
}

function getMeasureLabel(aircraft) {
    if (!aircraft) return 'Spazio cabina';
    return aircraft.category === 'cargo' ? 'Capacità cargo' : 'Spazio cabina';
}

// Inizializzazione della pagina
document.addEventListener('DOMContentLoaded', async function() {
    // Ottieni parametri URL
    const urlParams = new URLSearchParams(window.location.search);
    const aircraftId = urlParams.get('aircraft_id');
    companyId = sessionStorage.getItem('selectedCompanyId');
    
    if (!aircraftId || !companyId) {
        showPurchaseError('Parametri mancanti. Torna alla selezione aeromobili.');
        return;
    }
    
    await loadAircraftData(aircraftId);
    await generateRegistrations();
    updateDisplay();
});

// Carica dati aeromobile
async function loadAircraftData(aircraftId) {
    try {
        const response = await fetch('/api/fleet/aircraft-types');
        if (!response.ok) throw new Error('Errore caricamento aeromobili');
        
        const data = await response.json();
        currentAircraft = data.data.find(a => a.id == aircraftId);
        
        if (!currentAircraft) {
            throw new Error('Aeromobile non trovato');
        }
        
        // Popola i dati dell'aeromobile
        document.getElementById('aircraftName').textContent = currentAircraft.name;
        document.getElementById('aircraftManufacturer').textContent = currentAircraft.manufacturer;
        document.getElementById('aircraftCategory').textContent = getCategoryLabel(currentAircraft.category);
        document.getElementById('aircraftCapacityLabel').textContent = getMeasureLabel(currentAircraft);
        document.getElementById('aircraftCapacity').textContent = formatAircraftCapacity(currentAircraft);
        document.getElementById('aircraftRange').textContent = uiUtils.formatNumber(currentAircraft.range_km, 'km');
        document.getElementById('aircraftSpeed').textContent = `${currentAircraft.cruise_speed} km/h`;
        document.getElementById('aircraftFuel').textContent = `${currentAircraft.fuel_consumption} L/h`;
        document.getElementById('aircraftPrice').textContent = uiUtils.formatCurrency(parseInt(currentAircraft.purchase_price));
        document.getElementById('aircraftYear').textContent = currentAircraft.market_entry_year || '-';
        
        // Imposta costo modifica campo aviazione
        if (currentAircraft.campo_aviazione_mod_available && currentAircraft.campo_aviazione_mod_cost) {
            document.getElementById('campoModCost').textContent = uiUtils.formatNumber(parseInt(currentAircraft.campo_aviazione_mod_cost));
        } else {
            document.getElementById('campoMod').disabled = true;
            document.getElementById('campoMod').parentElement.style.opacity = '0.5';
        }
        
        // Nascondi configurazione sedili per aeromobili cargo
        if (currentAircraft.category === 'cargo') {
            document.getElementById('seatConfigSection').style.display = 'none';
        } else {
            initializeSeatConfiguration();
        }
        
        // Imposta immagine se disponibile
        if (currentAircraft.image_path) {
            document.getElementById('aircraftImage').src = currentAircraft.image_path;
        }
        
    } catch (error) {
        console.error('Errore caricamento aeromobile:', error);
        showPurchaseError('Errore nel caricamento dei dati dell\'aeromobile: ' + error.message);
    }
}

function formatAircraftCapacity(aircraft) {
    if (!aircraft) return 'N/D';

    if (aircraft.category === 'cargo') {
        if (aircraft.capacity === null || aircraft.capacity === undefined || aircraft.capacity === '') {
            return 'N/D';
        }
        return `${Number(aircraft.capacity).toLocaleString('it-IT')} t`;
    }

    const area = computeCabinAreaMeters(aircraft);
    if (area) {
        return `${Number(area).toFixed(1)} m²`;
    }

    if (aircraft.capacity !== null && aircraft.capacity !== undefined && aircraft.capacity !== '') {
        return `${Number(aircraft.capacity).toLocaleString('it-IT')} posti`;
    }

    return 'N/D';
}

function computeCabinAreaMeters(aircraft) {
    if (!aircraft) return null;
    const length = parseFloat(aircraft.cabin_length_meters || aircraft.cabin_length || 0);
    const width = parseFloat(aircraft.cabin_width_meters || aircraft.cabin_width || 0);
    if (!length || !width) return null;
    return length * width;
}

function initializeSeatConfiguration() {
    seatPresetCatalog = buildSeatPresetCatalog();
    const defaultPreset = seatPresetCatalog.find(preset => preset.id === getDefaultSeatPresetId()) || seatPresetCatalog[1] || seatPresetCatalog[0];
    seatConfigurationState = cloneSeatConfig(defaultPreset);
    renderSeatConfigurationCard();
}

function cloneSeatConfig(config) {
    return JSON.parse(JSON.stringify(config));
}

function getCabinAreaEstimate() {
    return computeCabinAreaMeters(currentAircraft) || 0;
}

function getSeatCapacityEstimate() {
    const area = getCabinAreaEstimate();
    const densityMap = {
        regional: 0.55,
        narrow_body: 0.72,
        wide_body: 0.88,
        cargo: 0
    };
    const density = densityMap[currentAircraft?.category] || 0.7;
    return Math.max(8, Math.round(area * density));
}

function getDefaultSeatPresetId() {
    if (!currentAircraft) return 'balanced';
    if (currentAircraft.category === 'wide_body') return 'comfort';
    return 'balanced';
}

function getLayoutOptionsForCategory() {
    switch (currentAircraft?.category) {
        case 'regional':
            return ['1-2', '2-2'];
        case 'wide_body':
            return ['2-3-2', '2-4-2', '3-3-3'];
        case 'narrow_body':
        default:
            return ['2-2', '2-3', '3-3'];
    }
}

function getLayoutSeatsPerRow(layout) {
    if (!layout) return 0;
    return layout.split('-').reduce((total, group) => total + (parseInt(group, 10) || 0), 0);
}

function getLegroomMood(legroomCm) {
    if (legroomCm >= 104) return { label: 'Perfetta', emoji: '🟢', tone: 'perfetta', note: 'La gente la percepisce come molto spaziosa e premium.' };
    if (legroomCm >= 98) return { label: 'Ottima', emoji: '🟢', tone: 'ottima', note: 'Molto confortevole, ideale per le fasce alte.' };
    if (legroomCm >= 92) return { label: 'Buona', emoji: '🟡', tone: 'buona', note: 'Comfort solido, senza sacrificare troppi posti.' };
    if (legroomCm >= 86) return { label: 'Accettabile', emoji: '🟠', tone: 'accettabile', note: 'Si può vendere bene, ma non è il punto forte della cabina.' };
    if (legroomCm >= 80) return { label: 'Insoddisfacente', emoji: '🔴', tone: 'insoddisfacente', note: 'I passeggeri iniziano a notarla in modo negativo.' };
    if (legroomCm >= 74) return { label: 'Pessima', emoji: '🟥', tone: 'pessima', note: 'Molto stretta: utile solo se vuoi massimizzare i posti.' };
    return { label: 'Inaccettabile', emoji: '⛔', tone: 'inaccettabile', note: 'Troppo poco spazio: la cabina diventa rapidamente impopolare.' };
}

function getSeatModelMeta(model) {
    switch (model) {
        case 'comfort':
            return { label: 'Comfort', description: 'Seduta morbida, buon equilibrio tra densità e immagine.' };
        case 'premium':
            return { label: 'Premium', description: 'Seduta ampia e più elegante, adatta a cabina superiore.' };
        case 'lie_flat':
            return { label: 'Lie-flat', description: 'Posto completamente reclinabile per i segmenti lunghi.' };
        case 'standard':
        default:
            return { label: 'Standard', description: 'La soluzione più neutra e versatile.' };
    }
}

function buildSeatPresetCatalog() {
    const maxSeats = getSeatCapacityEstimate();
    const layouts = getLayoutOptionsForCategory();
    const defaultLayout = layouts[0] || '2-2';
    const comfortLayout = layouts[Math.min(1, layouts.length - 1)] || defaultLayout;
    const baseLegroom = currentAircraft?.category === 'wide_body' ? 86 : currentAircraft?.category === 'regional' ? 80 : 82;

    return [
        {
            id: 'high_density',
            name: 'Alta densità',
            seats: Math.max(6, Math.round(maxSeats * 1.06)),
            layout: defaultLayout,
            legroomCm: Math.min(84, baseLegroom - 4),
            model: 'standard',
            description: 'Più posti, meno spazio per singolo passeggero.',
            note: 'Conviene se vuoi puntare sulla capienza.'
        },
        {
            id: 'balanced',
            name: 'Bilanciata',
            seats: Math.max(6, Math.round(maxSeats * 0.92)),
            layout: defaultLayout,
            legroomCm: baseLegroom,
            model: 'comfort',
            description: 'Il compromesso più naturale tra comfort e ricavo.',
            note: 'È la scelta più stabile per la maggior parte degli aerei.'
        },
        {
            id: 'comfort',
            name: 'Comfort',
            seats: Math.max(6, Math.round(maxSeats * 0.78)),
            layout: comfortLayout,
            legroomCm: Math.min(104, baseLegroom + 8),
            model: currentAircraft?.category === 'wide_body' ? 'lie_flat' : 'premium',
            description: 'Meno posti ma una percezione nettamente migliore.',
            note: 'Buona per tratte più lunghe o flotte premium.'
        }
    ];
}

function renderSeatConfigurationCard() {
    const container = document.getElementById('seatConfigurationCard');
    if (!container || currentAircraft?.category === 'cargo') return;

    const activeConfig = seatConfigurationState || seatPresetCatalog[1] || seatPresetCatalog[0];
    const mood = getLegroomMood(activeConfig.legroomCm);

    container.innerHTML = `
        <div class="seat-config-card">
            <div class="seat-config-header">
                <div>
                    <h4 class="seat-config-title">${activeConfig.name}</h4>
                    <p class="seat-config-subtitle">${activeConfig.description}</p>
                </div>
                <div class="seat-config-badge">${mood.emoji} ${mood.label}</div>
            </div>

            <div class="seat-preset-grid">
                ${seatPresetCatalog.map(preset => {
                    const isActive = activeConfig.id === preset.id;
                    const presetMood = getLegroomMood(preset.legroomCm);
                    const seatModel = getSeatModelMeta(preset.model);
                    return `
                        <div class="seat-preset-card ${isActive ? 'active' : ''}">
                            <h4>${preset.name}</h4>
                            <div class="seat-preset-meta">
                                <span>${preset.seats} posti stimati</span>
                                <span>${preset.layout} · ${preset.legroomCm} cm</span>
                                <span>${seatModel.label}</span>
                            </div>
                            <div class="seat-preset-footer">
                                <span class="seat-preset-emoji">${presetMood.emoji}</span>
                                <button class="btn btn-secondary" type="button" onclick="applySeatPreset('${preset.id}')">${isActive ? 'Attivo' : 'Usa preset'}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="seat-config-actions">
                <button class="btn btn-primary" type="button" onclick="openSeatDesigner()">Crea da zero</button>
            </div>

            <p class="seat-config-note">Le configurazioni sono stimate sullo spazio cabina reale dell'aereo, non sulla vecchia capacity statica.</p>
        </div>
    `;
}

function applySeatPreset(presetId) {
    const preset = seatPresetCatalog.find(item => item.id === presetId);
    if (!preset) return;

    seatConfigurationState = cloneSeatConfig({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        note: preset.note,
        seats: preset.seats,
        layout: preset.layout,
        legroomCm: preset.legroomCm,
        model: preset.model
    });

    renderSeatConfigurationCard();
}

function openSeatDesigner() {
    if (currentAircraft?.category === 'cargo') return;

    seatDraftBaseState = cloneSeatConfig(seatConfigurationState || seatPresetCatalog[1] || seatPresetCatalog[0]);
    seatDraftState = cloneSeatConfig(seatDraftBaseState);
    populateSeatDesignerControls();
    updateSeatDraft();
    uiUtils.showModal('seatDesignerModal');
    document.body.style.overflow = 'hidden';
}

function closeSeatDesigner() {
    uiUtils.hideModal('seatDesignerModal');
    document.body.style.overflow = '';
}

function populateSeatDesignerControls() {
    const layoutSelect = document.getElementById('seatLayoutSelect');
    if (!layoutSelect) return;

    const layouts = getLayoutOptionsForCategory();
    layoutSelect.innerHTML = layouts.map(layout => `<option value="${layout}">${layout}</option>`).join('');

    const draft = seatDraftState || seatDraftBaseState || seatPresetCatalog[1] || seatPresetCatalog[0];
    document.getElementById('seatModelSelect').value = draft.model || 'standard';
    layoutSelect.value = draft.layout || layouts[0];

    const seatRange = document.getElementById('seatCountRange');
    const maxSeats = getSeatCapacityEstimate();
    const minSeats = Math.max(4, Math.round(maxSeats * 0.5));
    seatRange.max = String(maxSeats);
    seatRange.min = String(minSeats);
    seatRange.value = String(Math.max(minSeats, Math.min(maxSeats, draft.seats || maxSeats)));

    const legroomRange = document.getElementById('legroomRange');
    const baseLegroom = currentAircraft?.category === 'wide_body' ? 86 : currentAircraft?.category === 'regional' ? 80 : 82;
    legroomRange.value = String(draft.legroomCm || baseLegroom);
}

function updateSeatDraft() {
    if (currentAircraft?.category === 'cargo') return;

    const layout = document.getElementById('seatLayoutSelect')?.value || getLayoutOptionsForCategory()[0] || '2-2';
    const maxSeats = getSeatCapacityEstimate();
    const seatCountRange = document.getElementById('seatCountRange');
    const legroomRange = document.getElementById('legroomRange');
    const seatModel = document.getElementById('seatModelSelect')?.value || 'standard';

    const seatCount = Math.max(4, Math.min(maxSeats, parseInt(seatCountRange?.value || maxSeats, 10) || maxSeats));
    const legroomCm = Math.max(74, Math.min(110, parseInt(legroomRange?.value || 82, 10) || 82));

    if (seatCountRange) seatCountRange.value = String(seatCount);
    if (legroomRange) legroomRange.value = String(legroomCm);

    seatDraftState = {
        id: 'custom',
        name: 'Configurazione personalizzata',
        description: 'Cabina progettata manualmente.',
        note: 'Configurazione creata da zero.',
        seats: seatCount,
        layout,
        legroomCm,
        model: seatModel
    };

    renderSeatDesignerPreview();
}

function renderSeatDesignerPreview() {
    const draft = seatDraftState || seatDraftBaseState || seatPresetCatalog[1] || seatPresetCatalog[0];
    const seatsPerRow = getLayoutSeatsPerRow(draft.layout) || 4;
    const rows = Math.max(1, Math.ceil(draft.seats / seatsPerRow));
    const mood = getLegroomMood(draft.legroomCm);
    const model = getSeatModelMeta(draft.model);
    const visual = document.getElementById('seatDesignerVisual');

    if (!visual) return;

    const rowsToRender = Math.min(rows, 12);
    const renderedRows = [];

    for (let rowIndex = 0; rowIndex < rowsToRender; rowIndex++) {
        const groups = draft.layout.split('-').map(group => parseInt(group, 10) || 0);
        renderedRows.push(`
            <div class="cabin-row">
                <div class="row-index">${String(rowIndex + 1).padStart(2, '0')}</div>
                <div class="row-seat-groups">
                    ${groups.map((groupSize, groupIndex) => `
                        <div class="seat-group">
                            ${Array.from({ length: groupSize }, () => '<span class="seat-block"></span>').join('')}
                        </div>
                        ${groupIndex < groups.length - 1 ? '<div class="aisle">◦</div>' : ''}
                    `).join('')}
                </div>
            </div>
        `);
    }

    if (rows > rowsToRender) {
        renderedRows.push(`<div class="seat-config-note">+${rows - rowsToRender} file aggiuntive non mostrate nell'anteprima.</div>`);
    }

    visual.innerHTML = renderedRows.join('');

    const moodPill = document.getElementById('seatDesignerComfortPill');
    if (moodPill) {
        moodPill.className = `comfort-pill ${mood.tone}`;
        moodPill.textContent = `${mood.emoji} ${mood.label}`;
    }

    const seatsValue = document.getElementById('seatDesignerSeatsValue');
    const layoutValue = document.getElementById('seatDesignerLayoutValue');
    const modelValue = document.getElementById('seatDesignerModelValue');
    const noteValue = document.getElementById('seatFeelingNote');
    const countLabel = document.getElementById('seatCountRangeLabel');
    const maxLabel = document.getElementById('seatCountRangeMaxLabel');
    const legroomLabel = document.getElementById('legroomRangeLabel');
    const moodLabel = document.getElementById('legroomMoodLabel');

    if (seatsValue) seatsValue.textContent = `${draft.seats}`;
    if (layoutValue) layoutValue.textContent = `${draft.layout} · ${rows} file`;
    if (modelValue) modelValue.textContent = model.label;
    if (noteValue) noteValue.textContent = mood.note;
    if (countLabel) countLabel.textContent = `${draft.seats} posti`;
    if (maxLabel) maxLabel.textContent = `Max ${getSeatCapacityEstimate()}`;
    if (legroomLabel) legroomLabel.textContent = `${draft.legroomCm} cm`;
    if (moodLabel) moodLabel.textContent = `${mood.emoji} ${mood.label}`;

    const badge = document.getElementById('seatDesignerBadge');
    if (badge) {
        badge.textContent = `${draft.name} · ${draft.layout}`;
    }
}

function applySeatDraft() {
    if (!seatDraftState) return;

    seatConfigurationState = cloneSeatConfig(seatDraftState);
    renderSeatConfigurationCard();
    closeSeatDesigner();
}

function resetSeatDraft() {
    if (!seatDraftBaseState) return;
    seatDraftState = cloneSeatConfig(seatDraftBaseState);
    populateSeatDesignerControls();
    updateSeatDraft();
}

// Genera registrazioni automatiche
async function generateRegistrations() {
    registrations = [];
    
    try {
        for (let i = 0; i < quantity; i++) {
            const response = await fetch(`/api/fleet/generate-registration/${companyId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.registration) {
                    registrations.push(data.data.registration);
                } else {
                    registrations.push(generateFallbackRegistration());
                }
            } else {
                registrations.push(generateFallbackRegistration());
            }
        }
    } catch (error) {
        console.warn('Errore generazione registrazioni:', error);
        for (let i = 0; i < quantity; i++) {
            registrations.push(generateFallbackRegistration());
        }
    }
    
    updateRegistrationsList();
}

// Registrazione fallback
function generateFallbackRegistration() {
    return 'REG' + Math.floor(Math.random() * 90000 + 10000) + '-' + Date.now().toString().slice(-4);
}

// Aggiorna lista registrazioni
function updateRegistrationsList() {
    const container = document.getElementById('registrationsList');
    container.innerHTML = '';
    
    registrations.forEach((reg, index) => {
        const item = document.createElement('div');
        item.className = 'registration-item';
        item.innerHTML = `
            <span>Aeromobile ${index + 1}:</span>
            <input type="text" class="registration-input" value="${reg}" 
                   onchange="updateRegistration(${index}, this.value)">
            <button class="btn btn-secondary" style="padding: 5px 10px;" 
                    onclick="regenerateRegistration(${index})">Rigenera</button>
        `;
        container.appendChild(item);
    });
}

// Aggiorna registrazione singola
function updateRegistration(index, value) {
    registrations[index] = value;
}

// Rigenera registrazione singola
async function regenerateRegistration(index) {
    try {
        const response = await fetch(`/api/fleet/generate-registration/${companyId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.registration) {
                registrations[index] = data.data.registration;
            } else {
                registrations[index] = generateFallbackRegistration();
            }
        } else {
            registrations[index] = generateFallbackRegistration();
        }
        updateRegistrationsList();
    } catch (error) {
        console.warn('Errore rigenerazione registrazione:', error);
        registrations[index] = generateFallbackRegistration();
        updateRegistrationsList();
    }
}

// Cambia quantità
function changeQuantity(delta) {
    const newQuantity = Math.max(1, Math.min(50, quantity + delta));
    document.getElementById('quantity').value = newQuantity;
    updateQuantity();
}

// Aggiorna quantità
async function updateQuantity() {
    const newQuantity = Math.max(1, Math.min(50, parseInt(document.getElementById('quantity').value) || 1));
    
    if (newQuantity !== quantity) {
        quantity = newQuantity;
        await generateRegistrations();
        updateDisplay();
    }
}

// Toggle configurazione automatica sedili
function toggleAutoConfig() {
    if (currentAircraft?.category === 'cargo') return;
    initializeSeatConfiguration();
}

// Aggiorna configurazione sedili
function updateSeatConfiguration() {
    if (currentAircraft?.category === 'cargo') return;
    renderSeatConfigurationCard();
}

// Aggiorna costi
function updateCosts() {
    const basePrice = parseInt(currentAircraft.purchase_price);
    const baseCost = basePrice * quantity;
    
    // Modifica campo aviazione
    let campoModCost = 0;
    if (document.getElementById('campoMod').checked && currentAircraft.campo_aviazione_mod_cost) {
        campoModCost = parseInt(currentAircraft.campo_aviazione_mod_cost) * quantity;
    }
    
    // Livrea
    let liveryCost = 0;
    const livery = document.getElementById('livery').value;
    if (livery === 'custom') {
        liveryCost = 50000 * quantity;
    } else if (livery === 'premium') {
        liveryCost = 100000 * quantity;
    }
    
    const totalCost = baseCost + campoModCost + liveryCost;
    
    // Aggiorna display
    document.getElementById('quantityDisplay').textContent = quantity;
    document.getElementById('baseCost').textContent = uiUtils.formatNumber(baseCost);
    document.getElementById('campoModTotal').textContent = uiUtils.formatNumber(campoModCost);
    document.getElementById('liveryCost').textContent = uiUtils.formatNumber(liveryCost);
    document.getElementById('totalCost').textContent = uiUtils.formatNumber(totalCost);
    
    // Mostra/nascondi righe opzionali
    document.getElementById('campoModRow').style.display = campoModCost > 0 ? 'flex' : 'none';
    document.getElementById('liveryRow').style.display = liveryCost > 0 ? 'flex' : 'none';
}

// Aggiorna display
function updateDisplay() {
    updateCosts();
}

// Conferma acquisto
async function confirmPurchase() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const purchaseBtn = document.getElementById('purchaseBtn');
    
    try {
        // Validazioni
        if (!validatePurchase()) return;
        
        // Mostra loading
        loadingIndicator.style.display = 'block';
        purchaseBtn.disabled = true;
        
        const purchases = [];
        
        // Acquista ogni aeromobile
        for (let i = 0; i < quantity; i++) {
            const purchaseData = {
                company_id: companyId,
                aircraft_type_id: currentAircraft.id,
                registration: registrations[i],
                purchase_price: calculateSinglePrice(),
                configuration: getSeatConfiguration(),
                options: getSelectedOptions()
            };
            
            const response = await fetch('/api/fleet/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore durante l\'acquisto');
            }
            
            const result = await response.json();
            purchases.push(result.data);
        }
        
        // Successo
        showSuccess(`Acquisto completato! ${quantity} aeromobile/i acquistato/i con successo.`);
        
        // Torna alla pagina precedente dopo 2 secondi
        setTimeout(() => {
            goBack();
        }, 2000);
        
    } catch (error) {
        console.error('Errore acquisto:', error);
        showPurchaseError('Errore durante l\'acquisto: ' + error.message);
    } finally {
        loadingIndicator.style.display = 'none';
        purchaseBtn.disabled = false;
    }
}

// Validazioni
function validatePurchase() {
    // Controlla registrazioni duplicate
    const uniqueRegs = [...new Set(registrations)];
    if (uniqueRegs.length !== registrations.length) {
        showPurchaseError('Alcune registrazioni sono duplicate. Correggile o rigenera.');
        return false;
    }
    
    // Controlla registrazioni vuote
    if (registrations.some(reg => !reg.trim())) {
        showPurchaseError('Alcune registrazioni sono vuote.');
        return false;
    }
    
    return true;
}

// Calcola prezzo singolo aeromobile
function calculateSinglePrice() {
    let basePrice = parseInt(currentAircraft.purchase_price);
    
    if (document.getElementById('campoMod').checked && currentAircraft.campo_aviazione_mod_cost) {
        basePrice += parseInt(currentAircraft.campo_aviazione_mod_cost);
    }
    
    const livery = document.getElementById('livery').value;
    if (livery === 'custom') {
        basePrice += 50000;
    } else if (livery === 'premium') {
        basePrice += 100000;
    }
    
    return basePrice;
}

// Ottieni configurazione sedili
function getSeatConfiguration() {
    if (currentAircraft.category === 'cargo') return null;

    return seatConfigurationState ? cloneSeatConfig(seatConfigurationState) : null;
}

// Ottieni opzioni selezionate
function getSelectedOptions() {
    return {
        campo_mod: document.getElementById('campoMod').checked,
        livery: document.getElementById('livery').value
    };
}

// Torna indietro
function goBack() {
    // Use explicit navigation to hub to avoid popping history entries
    // that may re-dispatch purchase-opening events in the parent page.
    try {
        window.location.href = '../hub.html';
    } catch (e) {
        // Fallback to history.back if redirect fails
        try { window.history.back(); } catch (err) { /* ignore */ }
    }
}

// Mostra errore nella pagina acquisto
function showPurchaseError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Mostra successo
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// Rigenera tutte le registrazioni
async function regenerateAllRegistrations() {
    await generateRegistrations();
}
