// /Client/src/ui/FleetTab.js
// helper: resolve year and month from game state (game calendar) or fallback to game date
function resolveGameDate() {
    try {
        if (window.game && window.game.state) {
            const s = window.game.state;
            if (typeof s.year !== 'undefined' && typeof s.month !== 'undefined') {
                return { year: Number(s.year), month: Number(s.month) };
            }
            if (typeof s.gameYear !== 'undefined' && typeof s.gameMonth !== 'undefined') {
                return { year: Number(s.gameYear), month: Number(s.gameMonth) };
            }
            // support other common shapes used in the codebase
            if (s.gameDate) {
                const d = new Date(s.gameDate);
                if (!isNaN(d)) return { year: d.getFullYear(), month: d.getMonth() + 1 };
            }
            if (s.gameTime) {
                // gameTime may be a Date-like or an object with formatDate()
                try {
                    if (typeof s.gameTime.getFullYear === 'function') {
                        return { year: s.gameTime.getFullYear(), month: s.gameTime.getMonth() + 1 };
                    }
                    if (typeof s.gameTime.formatDate === 'function') {
                        const d2 = new Date(s.gameTime.formatDate());
                        if (!isNaN(d2)) return { year: d2.getFullYear(), month: d2.getMonth() + 1 };
                    }
                } catch (e) { /* ignore */ }
            }
            if (s.date) {
                const d = new Date(s.date);
                if (!isNaN(d)) return { year: d.getFullYear(), month: d.getMonth() + 1 };
            }
        }
    } catch (e) { /* ignore */ }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// group by manufacturer -> family -> models
function groupAircraft(types) {
    const byManufacturer = {};
    types.forEach(t => {
        const m = t.manufacturer || 'Unknown';
        // Prefer using the declared `category` (regional, narrow_body, wide_body, cargo)
        // as the secondary grouping when available; fall back to family/series if missing.
        const family = t.category || t.family || t.series || '';
        if (!byManufacturer[m]) byManufacturer[m] = {};
        if (!byManufacturer[m][family]) byManufacturer[m][family] = [];
        byManufacturer[m][family].push(t);
    });
    return byManufacturer;
}

function computeCabinAreaMeters(model) {
    const l = parseFloat(model.cabin_length_meters || model.cabin_length || 0);
    const w = parseFloat(model.cabin_width_meters || model.cabin_width || 0);
    if (!l || !w) return null;
    return l * w;
}

// Try to fetch the company's canonical game date (same source used by header)
// Returns { year, month } or null
async function getCompanyGameDate(companyId) {
    if (!companyId) return null;
    try {
        const r = await loggedFetch(`/api/game/companies/${companyId}`);
        if (!r.ok) return null;
        const json = await r.json().catch(() => null);
        if (!json || !json.success || !json.data || !json.data.company) return null;
        const c = json.data.company;
        const dateStr = c.game_date || c.founded || c.created_at || c.createdAt;
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
    } catch (e) {
        console.warn('[FleetTab] getCompanyGameDate error', e && e.message);
        return null;
    }
}

// Wrapper around fetch that logs full request and full response (clones response body)
async function loggedFetch(input, init) {
    try {
        console.debug('[loggedFetch] Request ->', { input, init });
        const res = await fetch(input, init);
        // clone so we can read body for logging without consuming the original stream
        const clone = res.clone();
        let bodyText = null;
        try {
            bodyText = await clone.text();
        } catch (e) { bodyText = '<unreadable>'; }
        console.debug('[loggedFetch] Response <-', { url: res.url, status: res.status, ok: res.ok, headers: Array.from(res.headers.entries()), body: bodyText });
        return res;
    } catch (err) {
        console.error('[loggedFetch] error', err);
        throw err;
    }
}

// Attempts purchase (module-scope so both modal and tab UI can call it)
async function attemptPurchase(aircraftType, includeCampoMod = false) {
    const companyId = sessionStorage.getItem('selectedCompanyId');
    if (!companyId) {
        alert('Nessuna compagnia selezionata.');
        return;
    }
    function genRegistration() { return 'REG' + Math.floor(Math.random() * 90000 + 10000) + '-' + Date.now().toString().slice(-4); }
    const registration = prompt('Inserisci la registrazione per il nuovo aeromobile (lascia vuoto per generarla):', genRegistration()) || genRegistration();
    if (!registration) return;
    if (!confirm(`Confermi l'acquisto di ${aircraftType.name || aircraftType.model || aircraftType.id} per la compagnia ${companyId}?`)) return;

    try {
        // includeCampoMod is an explicit flag (true when user picked "con modifica").
        let basePrice = (typeof aircraftType.purchase_price !== 'undefined' && aircraftType.purchase_price !== null) ? Number(aircraftType.purchase_price) : null;
        let extra = 0;
        try {
            if (includeCampoMod && aircraftType.campo_aviazione_mod_cost) {
                extra = Number(aircraftType.campo_aviazione_mod_cost) || 0;
            }
        } catch (e) { /* ignore */ }
        const finalPriceToSend = (basePrice !== null) ? (basePrice + extra) : null;

        const body = {
            company_id: companyId,
            aircraft_type_id: aircraftType.id,
            registration: registration,
            purchase_price: finalPriceToSend
        };
    const r = await loggedFetch('/api/fleet/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        let json = null;
        try { json = await r.json(); } catch(e) { /* ignore */ }
        if (!r.ok || !json || !json.success) {
            const err = (json && json.error) || ('Acquisto fallito ' + (r && r.status ? r.status : ''));
            alert('Errore acquisto: ' + err);
            return;
        }
        if (window.game && window.game.uiManager && window.game.uiManager.showNotification) {
            window.game.uiManager.showNotification('Aereo acquistato', 'success');
        }
        // hide modal if present
        try { const modal = document.getElementById('aircraft-modal'); if (modal) modal.classList.add('hidden'); } catch(e){}
        // refresh fleet UI if available
        try { if (window.game && window.game.uiManager && window.game.uiManager.updateFleetUI) window.game.uiManager.updateFleetUI(); } catch(e){}
    } catch (err) {
        console.warn('[FleetTab] errore durante acquisto:', err && err.message);
        alert('Errore durante l\'acquisto. Vedi console per dettagli.');
    }
}

// helper: render models into provided container for tab UI
// Render model list; clicking a model shows details in the provided detailsEl
function renderModelsInTab(modelsEl, models, detailsEl) {
    modelsEl.innerHTML = '';
    models.forEach(m => {
        const row = document.createElement('div'); row.className = 'model-row';
        row.style.padding = '8px';
        row.style.borderBottom = '1px solid rgba(0,0,0,0.04)';
        row.style.cursor = 'pointer';
        const title = document.createElement('div'); title.className = 'model-row-title';
        title.textContent = m.name || m.model || ('Model ' + (m.id || ''));
        const info = document.createElement('div'); info.className = 'model-row-info';
        const priceStr = (typeof m.purchase_price !== 'undefined' && m.purchase_price !== null) ? Number(m.purchase_price).toLocaleString('it-IT') + ' €' : '—';
        // Determine capacity/area display: cargo shows capacity (tonnellate), others show cabin area if capacity not set
        let capacityDisplay = 'N/A';
        if (m.category === 'cargo' && typeof m.capacity !== 'undefined' && m.capacity !== null) {
            capacityDisplay = String(m.capacity) + ' t';
        } else if (typeof m.capacity !== 'undefined' && m.capacity !== null) {
            capacityDisplay = String(m.capacity) + ' posti';
        } else {
            const area = computeCabinAreaMeters(m);
            capacityDisplay = area ? (Number(area).toFixed(1) + ' m²') : 'N/A';
        }
        info.textContent = `${capacityDisplay} • ${m.range_km || m.range || 'N/A'} km • ${priceStr}`;
        row.appendChild(title); row.appendChild(info);
        row.addEventListener('click', () => showModelDetails(detailsEl, m));
        modelsEl.appendChild(row);
    });
}

function showModelDetails(detailsEl, model) {
    if (!detailsEl) return;
    detailsEl.innerHTML = '';
    const wrapper = document.createElement('div'); wrapper.className = 'model-details';

    // Image area
    let img;
    if (model.image_path) {
        let imageSrc = String(model.image_path || '').trim();
        if (imageSrc && !/^https?:\/\//i.test(imageSrc)) {
            if (!imageSrc.startsWith('/')) imageSrc = '/assets/aircraft/' + imageSrc;
            if (!/\.[a-z0-9]{2,4}$/i.test(imageSrc)) imageSrc = imageSrc + '.png';
        }
        img = document.createElement('img');
        img.src = imageSrc;
        img.alt = model.name || model.model || 'Aircraft image';
        img.style.width = '100%'; img.style.maxWidth = '100%'; img.style.objectFit = 'contain'; img.style.border = '1px solid #e6e6e6'; img.style.marginBottom = '10px';
    } else {
        img = document.createElement('div'); img.className = 'model-image-placeholder';
        img.style.width = '100%'; img.style.height = '160px'; img.style.background = 'linear-gradient(90deg,#eee,#f7f7f7)'; img.style.border = '1px solid #e6e6e6'; img.style.marginBottom = '10px'; img.textContent = 'Immagine (placeholder)'; img.style.display = 'flex'; img.style.alignItems = 'center'; img.style.justifyContent = 'center'; img.style.color = '#888';
    }

    const title = document.createElement('h3'); title.textContent = model.name || model.model || 'Modello';

    const specs = document.createElement('div'); specs.className = 'model-specs';

    // capacity / area
    const capRow = document.createElement('div');
    if (model.category === 'cargo' && typeof model.capacity !== 'undefined' && model.capacity !== null) {
        capRow.innerHTML = `<strong>Capacità (t):</strong> ${String(model.capacity)}`;
    } else if (typeof model.capacity !== 'undefined' && model.capacity !== null) {
        capRow.innerHTML = `<strong>Posti:</strong> ${String(model.capacity)}`;
    } else {
        const area = computeCabinAreaMeters(model);
        capRow.innerHTML = `<strong>Dimensione (m²):</strong> ${area ? Number(area).toFixed(1) : 'N/A'}`;
    }
    specs.appendChild(capRow);

    const rangeRow = document.createElement('div'); rangeRow.innerHTML = `<strong>Range:</strong> ${model.range_km || model.range || 'N/A'} km`;
    specs.appendChild(rangeRow);

    const priceStr = (typeof model.purchase_price !== 'undefined' && model.purchase_price !== null) ? Number(model.purchase_price).toLocaleString('it-IT') + ' €' : '—';
    const priceRow = document.createElement('div'); priceRow.innerHTML = `<strong>Prezzo:</strong> ${priceStr}`;
    specs.appendChild(priceRow);

    specs.appendChild(document.createElement('hr'));

    const fuelStr = (typeof model.fuel_consumption !== 'undefined' && model.fuel_consumption !== null) ? String(model.fuel_consumption) + ' L/h' : 'N/A';
    const fuelRow = document.createElement('div'); fuelRow.innerHTML = `<strong>Consumo carburante:</strong> ${fuelStr}`;
    specs.appendChild(fuelRow);

    const maintStr = (typeof model.maintenance_cost_per_hour !== 'undefined' && model.maintenance_cost_per_hour !== null) ? Number(model.maintenance_cost_per_hour).toLocaleString('it-IT') + ' € / h' : 'N/A';
    const maintRow = document.createElement('div'); maintRow.innerHTML = `<strong>Costo manutenzione:</strong> ${maintStr}`;
    specs.appendChild(maintRow);

    const marketYear = model.market_entry_year || 'N/A';
    const marketRow = document.createElement('div'); marketRow.innerHTML = `<strong>Anno ingresso mercato:</strong> ${marketYear}`;
    specs.appendChild(marketRow);

    // Campo aviazione: preferiamo guardare `campo_aviazione_mod_available` come criterio primario.
    const modAvailablePrimary = !!model.campo_aviazione_mod_available;
    // If a modification is available we present the modification block and show Opera da campo aviazione: No
    // (business data guarantees these won't conflict). Otherwise show the actual can_operate value.
    const canOperate = modAvailablePrimary ? false : !!model.can_operate_campo_aviazione;
    const canOperateRow = document.createElement('div'); canOperateRow.innerHTML = `<strong>Opera da campo aviazione:</strong> ${canOperate ? 'Sì' : 'No'}`;
    specs.appendChild(canOperateRow);

    const campoBlock = document.createElement('div'); campoBlock.id = 'campo-mod-section'; campoBlock.style.marginTop = '6px';
    if (modAvailablePrimary) {
        const modAvailableRow = document.createElement('div'); modAvailableRow.innerHTML = `<strong>Modifica campo aviazione disponibile:</strong> Sì`;
        campoBlock.appendChild(modAvailableRow);
        const campoModCostRaw = (typeof model.campo_aviazione_mod_cost !== 'undefined' && model.campo_aviazione_mod_cost !== null) ? Number(model.campo_aviazione_mod_cost) : null;
        if (campoModCostRaw) {
            const costRow = document.createElement('div'); costRow.innerHTML = `<strong>Costo modifica campo:</strong> ${campoModCostRaw.toLocaleString('it-IT')} €`;
            campoBlock.appendChild(costRow);
            // action buttons are rendered in the actions container below to avoid duplication
        } else {
            const costRow = document.createElement('div'); costRow.innerHTML = `<strong>Costo modifica campo:</strong> —`;
            campoBlock.appendChild(costRow);
        }
    }

    specs.appendChild(campoBlock);

    // Ownership info placeholder (will be populated)
    const ownershipEl = document.createElement('div'); ownershipEl.id = 'model-ownership'; ownershipEl.style.marginTop = '8px'; ownershipEl.style.color = '#666'; ownershipEl.style.fontSize = '0.9em';
    specs.appendChild(ownershipEl);

    // Append built pieces to wrapper then to detailsEl so that later DOM queries work reliably
    wrapper.appendChild(img);
    wrapper.appendChild(title);
    wrapper.appendChild(specs);

    // Actions container: single full-width button, or two half-width buttons when campo-mod available
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.marginTop = '12px';

    // determine if campo mod and cost
    const campoModCostRaw = (typeof model.campo_aviazione_mod_cost !== 'undefined' && model.campo_aviazione_mod_cost !== null) ? Number(model.campo_aviazione_mod_cost) : null;
    if (modAvailablePrimary && campoModCostRaw) {
        const buyNormal = document.createElement('button');
        buyNormal.type = 'button'; buyNormal.className = 'buy-aircraft-btn'; buyNormal.textContent = 'Acquista aereo';
        buyNormal.style.flex = '1';
        buyNormal.addEventListener('click', () => attemptPurchase(model, false));

        const buyWithMod = document.createElement('button');
        buyWithMod.type = 'button'; buyWithMod.className = 'buy-aircraft-btn'; buyWithMod.textContent = 'Acquista aereo con modifica';
        buyWithMod.style.flex = '1';
        buyWithMod.addEventListener('click', () => attemptPurchase(model, true));

        actions.appendChild(buyNormal);
        actions.appendChild(buyWithMod);
    } else {
        const buySingle = document.createElement('button');
        buySingle.type = 'button'; buySingle.className = 'buy-aircraft-btn'; buySingle.textContent = 'Acquista aereo';
        buySingle.style.width = '100%'; buySingle.style.flex = '1';
        buySingle.addEventListener('click', () => attemptPurchase(model, false));
        actions.appendChild(buySingle);
    }

    wrapper.appendChild(actions);
    detailsEl.appendChild(wrapper);

    // Fetch company fleet to compute how many of this model the player already owns
    (async function loadOwnership() {
        try {
            const companyId = sessionStorage.getItem('selectedCompanyId');
            if (!ownershipEl) return;
            if (!companyId) {
                ownershipEl.innerHTML = '<em>Nessuna compagnia selezionata</em>';
                return;
            }
            ownershipEl.innerHTML = '<em>Caricamento informazioni proprietà...</em>';
            const r = await loggedFetch(`/api/fleet/company/${companyId}`);
            if (!r.ok) {
                ownershipEl.innerHTML = '<em>Impossibile recuperare la flotta della compagnia</em>';
                return;
            }
            const json = await r.json();
            if (!json || !json.success || !json.data || !Array.isArray(json.data.aircraft)) {
                ownershipEl.innerHTML = '<em>Dati flotta non disponibili</em>';
                return;
            }
            const fleet = json.data.aircraft;
            const sameModelCount = fleet.filter(a => Number(a.aircraft_type_id) === Number(model.id)).length;
            ownershipEl.innerHTML = `<strong>Possieduti:</strong> ${sameModelCount}`;
            ownershipEl.style.color = '#333';
            ownershipEl.style.fontWeight = '600';
        } catch (err) {
            if (ownershipEl) ownershipEl.innerHTML = '<em>Errore nel recupero proprietà</em>';
            console.warn('[FleetTab] loadOwnership error', err);
        }
    })();
}

function initFleetTab() {
    // If already initialized, don't re-run full init, but re-bind the buy button
    // in case the DOM was restored (listeners are lost when innerHTML is replaced).
    if (window._fleetTabInitialized) {
        try {
            const buyBtn = document.getElementById('buy-aircraft');
            if (buyBtn && !buyBtn._bound) {
                buyBtn.addEventListener('click', function() {
                    openFleetPurchaseUI('fleet');
                });
                buyBtn._bound = true;
            }
        } catch (e) { /* ignore */ }
        return;
    }
    window._fleetTabInitialized = true;
    console.debug('FleetTab inizializzato (enhanced)');

    const buyBtn = document.getElementById('buy-aircraft');
    const modal = document.getElementById('aircraft-modal');
    const catalog = document.getElementById('aircraft-catalog');
    const fleetTab = document.getElementById('fleet-tab');
    if (!buyBtn || !modal || !catalog || !fleetTab) {
        console.warn('[FleetTab] elementi UI mancanti per inizializzazione');
        return;
    }

    

    // render UI inside modal: left manufacturers, mid families, right models
    function renderModalUI(types) {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Acquista Aeromobile</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body fleet-market" style="display:flex; gap:12px; align-items:flex-start;">
                    <div class="column manufacturers" style="min-width:160px; max-width:240px; overflow:auto;"></div>
                    <div class="column families" style="min-width:160px; max-width:300px; overflow:auto;"></div>
                    <div class="column models" style="flex:1; overflow:auto;"></div>
                </div>
            </div>`;
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Acquista Aeromobile</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body fleet-market" style="display:flex; gap:12px; align-items:flex-start;">
                        <div class="column manufacturers" style="min-width:160px; max-width:240px; overflow:auto;"></div>
                        <div class="column families" style="min-width:160px; max-width:220px; overflow:auto;"></div>
                        <div class="column models" style="min-width:220px; max-width:360px; overflow:auto;"></div>
                        <div class="column details" style="flex:1; min-width:260px; overflow:auto;"></div>
                    </div>
                </div>`;

        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

        const grouped = groupAircraft(types);
        const manufacturersEl = modal.querySelector('.manufacturers');
        const familiesEl = modal.querySelector('.families');
        const modelsEl = modal.querySelector('.models');
        const detailsEl = modal.querySelector('.details');

        manufacturersEl.innerHTML = '';
        Object.keys(grouped).sort().forEach(man => {
            const b = document.createElement('div'); b.className = 'manufacturer'; b.textContent = man;
                // increase vertical spacing and add clearer divider
                b.style.padding = '12px 10px';
                b.style.cursor = 'pointer';
                b.style.borderBottom = '1px solid rgba(0,0,0,0.12)';
                b.style.minHeight = '44px';
                b.style.display = 'flex';
                b.style.alignItems = 'center';
            b.addEventListener('click', () => {
                // highlight
                manufacturersEl.querySelectorAll('.manufacturer').forEach(n => n.classList.remove('active'));
                b.classList.add('active');
                // render families
                renderFamilies(man, grouped[man]);
                modelsEl.innerHTML = '';
            });
            manufacturersEl.appendChild(b);
        });

        function renderFamilies(manufacturer, families) {
            familiesEl.innerHTML = '';
            Object.keys(families).sort().forEach(fam => {
                const el = document.createElement('div'); el.className = 'family'; el.textContent = fam;
                el.style.padding = '6px 8px';
                el.style.cursor = 'pointer';
                el.style.borderBottom = '1px solid rgba(0,0,0,0.04)';
                el.style.minHeight = '32px';
                el.addEventListener('click', () => {
                    familiesEl.querySelectorAll('.family').forEach(n => n.classList.remove('active'));
                    el.classList.add('active');
                    renderModels(families[fam]);
                });
                    el.addEventListener('click', () => {
                        familiesEl.querySelectorAll('.family').forEach(n => n.classList.remove('active'));
                        el.classList.add('active');
                        // render models into modal models column, and include details panel
                        renderModels(families[fam]);
                        // ensure clicking a model in modal will show details in modal detailsEl
                        const rows = modal.querySelectorAll('.model-row');
                        rows.forEach(r => {
                            r.addEventListener('click', function() {
                                const idx = Array.from(modelsEl.children).indexOf(r);
                                const model = families[fam][idx];
                                showModelDetails(detailsEl, model);
                            });
                        });
                    });
                familiesEl.appendChild(el);
            });
        }

        function renderModels(models) {
            modelsEl.innerHTML = '';
            models.forEach(m => {
                const card = document.createElement('div'); card.className = 'model-card';
                const title = document.createElement('div'); title.className = 'model-title';
                title.textContent = m.name || m.model || ('Model ' + (m.id || ''));
                const info = document.createElement('div'); info.className = 'model-info';
                const priceStr = (typeof m.purchase_price !== 'undefined' && m.purchase_price !== null) ? Number(m.purchase_price).toLocaleString('it-IT') + ' €' : '—';
                const capacityStr = (typeof m.capacity !== 'undefined' && m.capacity !== null) ? m.capacity : 'N/A';
                info.textContent = `${capacityStr} posti • ${m.range_km || m.range || 'N/A'} km • ${priceStr}`;
                const buy = document.createElement('button'); buy.className = 'buy-aircraft-btn'; buy.textContent = 'Acquista';
                buy.addEventListener('click', () => attemptPurchase(m));
                card.appendChild(title); card.appendChild(info); card.appendChild(buy);
                modelsEl.appendChild(card);
            });
        }
    }

    async function loadAvailable(year, month) {
        catalog.innerHTML = '<div class="loading">Caricamento catalogo...</div>';
        try {
                console.debug('[FleetTab] loadAvailable - resolved date', { year, month, gameState: (window.game && window.game.state) });
                const url = `/api/fleet/available?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
            const r = await loggedFetch(url);
            if (!r.ok) {
                // try to read JSON body for better error message
                let bodyText = null;
                try { bodyText = await r.text(); } catch (e) { /* ignore */ }
                console.error('[FleetTab] fetch available non OK', r.status, bodyText);
                throw new Error('HTTP ' + r.status + (bodyText ? ' - ' + bodyText : ''));
            }
            const json = await r.json();
            if (!json || !json.success) {
                const errMsg = (json && (json.error || (json.message))) || 'Invalid response';
                throw new Error(errMsg);
            }
            const types = json.data || [];
            if (!types.length) {
                catalog.innerHTML = '<div class="catalog-empty">Nessun aeromobile disponibile per l\'anno selezionato.</div>';
                return types;
            }
            renderModalUI(types);
            return types;
        } catch (err) {
            console.warn('[FleetTab] errore caricamento tipi disponibili:', err && err.message);
            catalog.innerHTML = '<div class="catalog-empty">Errore caricamento catalogo. Controlla la console per dettagli.</div>';
            return [];
        }
    }

    // Use module-scoped helpers attemptPurchase / renderModelsInTab

    // Apertura catalogo all'interno della tab Flotta (sostituisce il contenuto e mostra back)
    if (!buyBtn._bound) {
        buyBtn.addEventListener('click', function() {
            // Open purchase UI inside the fleet tab itself
            openFleetPurchaseUI('fleet');
        });
        buyBtn._bound = true;
    }
}

// Open purchase UI directly inside the Fleet tab (replaces tab content)
async function openFleetPurchaseUI(origin) {
    const fleetTab = document.getElementById('fleet-tab');
    if (!fleetTab) return;

    // Save previous content to restore later
    if (typeof fleetTab._previousContent === 'undefined') fleetTab._previousContent = fleetTab.innerHTML;

    // show loading
    fleetTab.innerHTML = '<div class="loading">Caricamento catalogo...</div>';

    // Prefer the company's canonical game_date (same as header) when available
    const companyId = sessionStorage.getItem('selectedCompanyId');
    let gd = null;
    try {
        if (companyId) {
            gd = await getCompanyGameDate(companyId);
            if (gd) console.debug('[FleetTab] openFleetPurchaseUI - using company game_date', gd);
        }
    } catch (e) { /* ignore */ }
    if (!gd) {
        gd = resolveGameDate();
        try { console.debug('[FleetTab] openFleetPurchaseUI - fallback resolved game date', gd, { gameState: (window.game && window.game.state) }); } catch (e) { }
    }
    try {
    const r = await loggedFetch(`/api/fleet/available?year=${encodeURIComponent(gd.year)}&month=${encodeURIComponent(gd.month)}`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const json = await r.json();
        if (!json || !json.success) throw new Error(json && json.error ? json.error : 'Invalid response');
        const types = json.data || [];

        // render inside fleetTab
        fleetTab.innerHTML = `
            <div class="fleet-purchase-root">
                <div class="fleet-purchase-header" style="position:relative;display:flex;align-items:center;gap:12px;padding-right:12px;">
                    <button id="fleet-purchase-back" type="button" class="buy-aircraft-btn" style="padding:8px 12px;font-size:14px;height:38px;width:auto;min-width:88px;max-width:180px;">← Torna</button>
                    <h2 style="position:absolute;left:50%;transform:translateX(-50%);margin:0;">Acquista Aeromobile</h2>
                </div>
                <div class="fleet-purchase-body" style="display:flex; gap:12px; align-items:flex-start;">
                    <div class="column manufacturers" style="min-width:160px; max-width:240px; overflow:auto;"></div>
                    <div class="column families" style="min-width:160px; max-width:220px; overflow:auto;"></div>
                    <div class="column models" style="min-width:220px; max-width:360px; overflow:auto;"></div>
                    <div class="column details" style="flex:1; min-width:260px; overflow:auto;"></div>
                </div>
            </div>
        `;

        const manufacturersEl = fleetTab.querySelector('.manufacturers');
        const familiesEl = fleetTab.querySelector('.families');
    const modelsEl = fleetTab.querySelector('.models');
    const detailsEl = fleetTab.querySelector('.details');

        const grouped = groupAircraft(types);
        manufacturersEl.innerHTML = '';
        Object.keys(grouped).sort().forEach(man => {
            const b = document.createElement('div'); b.className = 'manufacturer'; b.textContent = man;
            // increase vertical spacing and add clearer divider (same as modal)
            b.style.padding = '12px 10px';
            b.style.cursor = 'pointer';
            b.style.borderBottom = '1px solid rgba(0,0,0,0.12)';
            b.style.minHeight = '44px';
            b.style.display = 'flex';
            b.style.alignItems = 'center';
            b.addEventListener('click', () => {
                manufacturersEl.querySelectorAll('.manufacturer').forEach(n => n.classList.remove('active'));
                b.classList.add('active');
                // render families
                familiesEl.innerHTML = '';
                Object.keys(grouped[man]).sort().forEach(fam => {
                    const el = document.createElement('div'); el.className = 'family'; el.textContent = fam;
                    el.style.padding = '6px 8px';
                    el.style.cursor = 'pointer';
                    el.style.borderBottom = '1px solid rgba(0,0,0,0.04)';
                    el.style.minHeight = '32px';
                    el.addEventListener('click', () => {
                        familiesEl.querySelectorAll('.family').forEach(n => n.classList.remove('active'));
                        el.classList.add('active');
                        renderModelsInTab(modelsEl, grouped[man][fam], detailsEl);
                    });
                    familiesEl.appendChild(el);
                });
        // DO NOT auto-select first family: wait user interaction
            });
            manufacturersEl.appendChild(b);
        });

    // DO NOT auto-select first manufacturer: wait user interaction

        // back button behavior
        const backBtn = fleetTab.querySelector('#fleet-purchase-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // if origin is a tab name and different from fleet, switch back
                try {
                    if (origin && origin !== 'fleet') {
                        const btn = document.querySelector('.menu-btn[data-tab="' + origin + '"]');
                        if (btn) { btn.click(); return; }
                    }
                } catch (e) { /* ignore */ }

                // restore previous content
                if (fleetTab._previousContent) {
                    fleetTab.innerHTML = fleetTab._previousContent;
                    delete fleetTab._previousContent;
                    // re-initialize FleetTab handlers if needed
                    try { initFleetTab(); } catch (e) { /* ignore */ }
                }
            });
        }

    } catch (err) {
        console.warn('[FleetTab] errore caricamento tipi disponibili (tab):', err && err.message);
        fleetTab.innerHTML = '<div class="catalog-empty">Errore caricamento catalogo.</div>';
    }
}

// (renderModelsInTab is defined earlier at module scope)

// Esportazioni globali per compatibilità
window.initFleetTab = initFleetTab;
window.openFleetPurchaseUI = openFleetPurchaseUI;
window.resolveGameDate = resolveGameDate;
window.groupAircraft = groupAircraft;

console.log('✅ FleetTab caricato con sistema avanzato di acquisto aeromobili');
