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
        const family = t.family || (t.series || 'Generic');
        if (!byManufacturer[m]) byManufacturer[m] = {};
        if (!byManufacturer[m][family]) byManufacturer[m][family] = [];
        byManufacturer[m][family].push(t);
    });
    return byManufacturer;
}

// Attempts purchase (module-scope so both modal and tab UI can call it)
async function attemptPurchase(aircraftType) {
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
        const body = {
            company_id: companyId,
            aircraft_type_id: aircraftType.id,
            registration: registration,
            purchase_price: aircraftType.purchase_price || null
        };
        const r = await fetch('/api/fleet/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
        const capacityStr = (typeof m.capacity !== 'undefined' && m.capacity !== null) ? m.capacity : 'N/A';
        info.textContent = `${capacityStr} posti • ${m.range_km || m.range || 'N/A'} km • ${priceStr}`;
        row.appendChild(title); row.appendChild(info);
        row.addEventListener('click', () => showModelDetails(detailsEl, m));
        modelsEl.appendChild(row);
    });
}

function showModelDetails(detailsEl, model) {
    if (!detailsEl) return;
    detailsEl.innerHTML = '';
    const wrapper = document.createElement('div'); wrapper.className = 'model-details';
    let img;
    if (model.image_path) {
        // allow storing either full path (/assets/aircraft/x.png) or just filename (a320.png or a320)
        let imageSrc = String(model.image_path || '').trim();
        if (imageSrc && !/^https?:\/\//i.test(imageSrc)) {
            if (!imageSrc.startsWith('/')) {
                // treat as filename and prepend folder
                imageSrc = '/assets/aircraft/' + imageSrc;
            }
            // add default extension if missing
            if (!/\.[a-z0-9]{2,4}$/i.test(imageSrc)) imageSrc = imageSrc + '.png';
        }
        img = document.createElement('img');
        img.src = imageSrc;
        img.alt = model.name || model.model || 'Aircraft image';
        img.style.width = '100%'; img.style.height = '160px'; img.style.objectFit = 'cover'; img.style.border = '1px solid #e6e6e6'; img.style.marginBottom = '10px';
    } else {
        img = document.createElement('div'); img.className = 'model-image-placeholder';
        img.style.width = '100%'; img.style.height = '160px'; img.style.background = 'linear-gradient(90deg,#eee,#f7f7f7)'; img.style.border = '1px solid #e6e6e6'; img.style.marginBottom = '10px'; img.textContent = 'Immagine (placeholder)'; img.style.display = 'flex'; img.style.alignItems = 'center'; img.style.justifyContent = 'center'; img.style.color = '#888';
    }
    const title = document.createElement('h3'); title.textContent = model.name || model.model || 'Modello';
    const specs = document.createElement('div'); specs.className = 'model-specs';
    const capacityStr = (typeof model.capacity !== 'undefined' && model.capacity !== null) ? model.capacity : 'N/A';
    const priceStr = (typeof model.purchase_price !== 'undefined' && model.purchase_price !== null) ? Number(model.purchase_price).toLocaleString('it-IT') + ' €' : '—';
    specs.innerHTML = `<div><strong>Posti:</strong> ${capacityStr}</div><div><strong>Range:</strong> ${model.range_km || model.range || 'N/A'} km</div><div><strong>Prezzo:</strong> ${priceStr}</div>`;
    const buy = document.createElement('button'); buy.className = 'buy-aircraft-btn'; buy.type = 'button'; buy.textContent = 'Acquista questo aeromobile';
    buy.style.marginTop = '12px';
    buy.addEventListener('click', () => attemptPurchase(model));
    wrapper.appendChild(img); wrapper.appendChild(title); wrapper.appendChild(specs); wrapper.appendChild(buy);
    detailsEl.appendChild(wrapper);
}

export function initFleetTab() {
    if (window._fleetTabInitialized) return;
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
            b.style.padding = '8px 10px';
            b.style.cursor = 'pointer';
            b.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
            b.style.minHeight = '36px';
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
            const url = `/api/fleet/available?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
            const r = await fetch(url);
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
export async function openFleetPurchaseUI(origin) {
    const fleetTab = document.getElementById('fleet-tab');
    if (!fleetTab) return;

    // Save previous content to restore later
    if (typeof fleetTab._previousContent === 'undefined') fleetTab._previousContent = fleetTab.innerHTML;

    // show loading
    fleetTab.innerHTML = '<div class="loading">Caricamento catalogo...</div>';

    const gd = resolveGameDate();
    try {
        const r = await fetch(`/api/fleet/available?year=${encodeURIComponent(gd.year)}&month=${encodeURIComponent(gd.month)}`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const json = await r.json();
        if (!json || !json.success) throw new Error(json && json.error ? json.error : 'Invalid response');
        const types = json.data || [];

        // render inside fleetTab
        fleetTab.innerHTML = `
            <div class="fleet-purchase-root">
                <div class="fleet-purchase-header">
                    <button id="fleet-purchase-back" type="button" class="btn">← Torna</button>
                    <h2>Acquista Aeromobile</h2>
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
