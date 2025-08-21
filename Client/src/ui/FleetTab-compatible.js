// FleetTab-compatible.js - Versione compatibile del sistema acquisto aeromobili
console.log('📄 Caricamento FleetTab-compatible.js...');

// Helper: resolve year and month from game state (game calendar) or fallback to game date
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
            if (s.gameDate) {
                const d = new Date(s.gameDate);
                if (!isNaN(d)) return { year: d.getFullYear(), month: d.getMonth() + 1 };
            }
            if (s.gameTime) {
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

// Group aircraft by manufacturer -> category -> models
function groupAircraft(types) {
    const byManufacturer = {};
    types.forEach(t => {
        const m = t.manufacturer || 'Unknown';
        const family = t.category || t.family || t.series || '';
        if (!byManufacturer[m]) byManufacturer[m] = {};
        if (!byManufacturer[m][family]) byManufacturer[m][family] = [];
        byManufacturer[m][family].push(t);
    });
    return byManufacturer;
}

// Apre l'interfaccia di acquisto aeromobili sostituendo il contenuto del tab
function openFleetPurchaseUI() {
    console.log('🛒 Apertura sistema acquisto aeromobili nel tab...');
    
    // Trova il tab flotta invece del modal
    const fleetTab = document.getElementById('fleet-tab');
    if (!fleetTab) {
        console.error('❌ Tab fleet-tab non trovato');
        return;
    }
    
    // Assicurati che il tab flotta sia attivo
    activateFleetTab();
    
    // Sostituisci il contenuto del tab con il sistema di acquisto
    loadAndRenderAdvancedPurchaseSystem(fleetTab);
}

// Attiva il tab flotta
function activateFleetTab() {
    // Rimuovi active da tutti i tab
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    
    // Attiva il tab flotta
    const fleetTab = document.getElementById('fleet-tab');
    const fleetBtn = document.querySelector('.menu-btn[data-tab="fleet"]');
    
    if (fleetTab) fleetTab.classList.add('active');
    if (fleetBtn) fleetBtn.classList.add('active');
}

// Carica e renderizza il sistema di acquisto avanzato nel tab
function loadAndRenderAdvancedPurchaseSystem(container) {
    console.log('📋 Caricamento sistema acquisto nel tab flotta...');
    container.innerHTML = '<p>🔄 Caricamento aeromobili disponibili...</p>';
    
    fetch('/api/game/aircraft-data')
        .then(res => res.json())
        .then(response => {
            console.log('📊 Risposta API aeromobili:', response);
            
            let aircraftData = [];
            if (response && response.success && Array.isArray(response.data)) {
                aircraftData = response.data;
            } else if (Array.isArray(response)) {
                aircraftData = response;
            } else {
                throw new Error('Formato dati non riconosciuto');
            }
            
            renderAdvancedPurchaseInterface(container, aircraftData);
        })
        .catch(error => {
            console.error('❌ Errore caricamento aeromobili:', error);
            container.innerHTML = '<p>❌ Errore di connessione al server</p>';
        });
}

// Renderizza l'interfaccia avanzata con le 4 colonne nel tab
function renderAdvancedPurchaseInterface(container, aircraftData) {
    console.log('🎨 Rendering interfaccia acquisto nel tab flotta...');
    
    const html = `
        <div class="fleet-purchase-root" style="height: 100%; display: flex; flex-direction: column;">
            <div class="fleet-purchase-header" style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:2px solid #ddd;background:#f5f5f5;">
                <button id="fleet-purchase-back" type="button" class="btn-back" style="padding:8px 16px;background:#666;color:white;border:none;border-radius:4px;cursor:pointer;">← Torna alla Flotta</button>
                <h2 style="margin:0;flex:1;text-align:center;color:#333;">🛒 Acquista Aeromobile</h2>
            </div>
            <div class="fleet-purchase-body" style="display:flex; gap:12px; flex:1; padding:12px; min-height:500px;">
                <div class="column manufacturers" style="min-width:180px; max-width:240px; border:2px solid #ddd; border-radius:6px; background:white;">
                    <div class="column-header" style="background:#e3f2fd; padding:12px; border-bottom:1px solid #ddd; font-weight:bold; text-align:center;">🏭 Produttori</div>
                    <div class="manufacturers-list" style="padding:8px; max-height:400px; overflow-y:auto;"></div>
                </div>
                <div class="column families" style="min-width:160px; max-width:220px; border:2px solid #ddd; border-radius:6px; background:white;">
                    <div class="column-header" style="background:#e8f5e8; padding:12px; border-bottom:1px solid #ddd; font-weight:bold; text-align:center;">📂 Categorie</div>
                    <div class="families-list" style="padding:8px; max-height:400px; overflow-y:auto;"></div>
                </div>
                <div class="column models" style="min-width:220px; max-width:360px; border:2px solid #ddd; border-radius:6px; background:white;">
                    <div class="column-header" style="background:#fff3e0; padding:12px; border-bottom:1px solid #ddd; font-weight:bold; text-align:center;">✈️ Modelli</div>
                    <div class="models-list" style="padding:8px; max-height:400px; overflow-y:auto;"></div>
                </div>
                <div class="column details" style="flex:1; min-width:300px; border:2px solid #ddd; border-radius:6px; background:white;">
                    <div class="column-header" style="background:#f3e5f5; padding:12px; border-bottom:1px solid #ddd; font-weight:bold; text-align:center;">📋 Dettagli</div>
                    <div class="details-content" style="padding:12px; max-height:400px; overflow-y:auto;">Seleziona un aeromobile per visualizzare i dettagli</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Setup back button per tornare alla vista normale della flotta
    const backBtn = container.querySelector('#fleet-purchase-back');
    if (backBtn) {
        backBtn.onclick = function() {
            restoreFleetTab();
        };
    }
    
    // Setup the advanced interface
    setupAdvancedInterface(container, aircraftData);
}

// Ripristina la vista normale del tab flotta
function restoreFleetTab() {
    console.log('🔙 Ripristino vista normale flotta...');
    
    const fleetTab = document.getElementById('fleet-tab');
    if (!fleetTab) return;
    
    // Ripristina il contenuto originale del tab flotta
    fleetTab.innerHTML = `
        <div class="fleet-header" style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid #ddd;">
            <h2 style="margin:0;">La Tua Flotta</h2>
            <button id="buy-aircraft" style="padding:10px 20px;background:#4caf50;color:white;border:none;border-radius:4px;cursor:pointer;">Acquista Aeromobile</button>
        </div>
        <div id="aircraft-list" class="aircraft-grid" style="padding:16px;">
            <p>La tua flotta è vuota. Acquista il tuo primo aeromobile!</p>
        </div>
    `;
    
    // Riattiva il bottone acquisto
    setTimeout(function() {
        if (window.setupFleetButton) {
            setupFleetButton();
        }
    }, 100);
}

// Setup dell'interfaccia avanzata con drill-down
function setupAdvancedInterface(container, aircraftData) {
    const manufacturersListEl = container.querySelector('.manufacturers-list');
    const familiesListEl = container.querySelector('.families-list');
    const modelsListEl = container.querySelector('.models-list');
    const detailsContentEl = container.querySelector('.details-content');
    
    const grouped = groupAircraft(aircraftData);
    
    // Render manufacturers
    manufacturersListEl.innerHTML = '';
    Object.keys(grouped).sort().forEach(manufacturer => {
        const div = document.createElement('div');
        div.className = 'manufacturer-item';
        div.textContent = manufacturer;
        div.style.cssText = 'padding:8px; cursor:pointer; border-bottom:1px solid #eee; hover:background:#f5f5f5;';
        
        div.addEventListener('click', () => {
            // Clear active states
            manufacturersListEl.querySelectorAll('.manufacturer-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            div.style.backgroundColor = '#e3f2fd';
            
            // Render families/categories
            renderFamilies(familiesListEl, grouped[manufacturer], modelsListEl, detailsContentEl);
        });
        
        manufacturersListEl.appendChild(div);
    });
    
    console.log('✅ Interfaccia avanzata configurata con', Object.keys(grouped).length, 'produttori');
}

// Renderizza le categorie/famiglie
function renderFamilies(familiesListEl, manufacturerData, modelsListEl, detailsContentEl) {
    familiesListEl.innerHTML = '';
    modelsListEl.innerHTML = '';
    detailsContentEl.innerHTML = 'Seleziona una categoria per vedere i modelli';
    
    Object.keys(manufacturerData).sort().forEach(family => {
        const div = document.createElement('div');
        div.className = 'family-item';
        div.textContent = family || 'Altro';
        div.style.cssText = 'padding:6px; cursor:pointer; border-bottom:1px solid #eee; hover:background:#f5f5f5;';
        
        div.addEventListener('click', () => {
            // Clear active states
            familiesListEl.querySelectorAll('.family-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            div.style.backgroundColor = '#e8f5e8';
            
            // Render models
            renderModels(modelsListEl, manufacturerData[family], detailsContentEl);
        });
        
        familiesListEl.appendChild(div);
    });
}

// Renderizza i modelli
function renderModels(modelsListEl, modelsData, detailsContentEl) {
    modelsListEl.innerHTML = '';
    detailsContentEl.innerHTML = 'Seleziona un modello per vedere i dettagli';
    
    modelsData.forEach(aircraft => {
        const div = document.createElement('div');
        div.className = 'model-item';
        
        // Creiamo un contenuto più ricco con miniatura
        const imagePath = aircraft.image_path || '/assets/aircraft/default.png';
        let price = aircraft.purchase_price || aircraft.price || 0;
        if (typeof price === 'string') {
            price = parseInt(price) || 0;
        }
        const priceFormatted = price > 0 ? '€' + Math.round(price / 1000000).toLocaleString() + 'M' : 'N/A';
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${imagePath}" alt="${aircraft.name}" 
                     style="width: 40px; height: 24px; object-fit: contain; border: 1px solid #ddd; border-radius: 3px; background: #f9f9f9; flex-shrink: 0;"
                     onerror="this.src='/assets/aircraft/default.png'; this.style.opacity='0.5';">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; color: #333; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${aircraft.name}</div>
                    <div style="font-size: 11px; color: #666;">${priceFormatted}</div>
                </div>
            </div>
        `;
        
        div.style.cssText = 'padding:8px; cursor:pointer; border-bottom:1px solid #eee; transition: background 0.2s;';
        div.addEventListener('mouseenter', () => div.style.background = '#f5f5f5');
        div.addEventListener('mouseleave', () => {
            if (!div.classList.contains('active')) div.style.background = '';
        });
        
        div.addEventListener('click', () => {
            // Clear active states
            modelsListEl.querySelectorAll('.model-item').forEach(el => {
                el.classList.remove('active');
                el.style.backgroundColor = '';
            });
            div.classList.add('active');
            div.style.backgroundColor = '#fff3e0';
            
            // Render details
            renderAircraftDetails(detailsContentEl, aircraft);
        });
        
        modelsListEl.appendChild(div);
    });
}

// Renderizza i dettagli dell'aeromobile
function renderAircraftDetails(detailsContentEl, aircraft) {
    let price = aircraft.purchase_price || aircraft.price || 0;
    if (typeof price === 'string') {
        price = parseInt(price) || 0;
    }
    
    const priceFormatted = price > 0 ? Math.round(price / 1000000).toLocaleString() + 'M' : 'N/A';
    
    // Calcolo capacità: se capacity è null = aereo passeggeri (metri quadri), se diverso da null = aereo cargo (tonnellate)
    let capacityInfo = '';
    if (aircraft.capacity === null || aircraft.capacity === undefined) {
        // Aereo passeggeri - calcola metri quadri dalla lunghezza e larghezza cabina
        const length = parseFloat(aircraft.cabin_length_meters) || 0;
        const width = parseFloat(aircraft.cabin_width_meters) || 0;
        const area = length * width;
        capacityInfo = area > 0 ? area.toFixed(1) + ' m²' : 'N/A';
    } else {
        // Aereo cargo - mostra tonnellate
        const tons = parseInt(aircraft.capacity) || 0;
        capacityInfo = tons > 0 ? (tons / 1000).toLocaleString() + ' t' : 'N/A';
    }
    
    const range = aircraft.range_km ? aircraft.range_km.toLocaleString() + ' km' : 'N/A';
    const fuelConsumption = aircraft.fuel_consumption || 'N/A';
    const cruiseSpeed = aircraft.cruise_speed || 'N/A';
    const marketEntry = aircraft.market_entry_year || 'N/A';
    
    // Campo di aviazione
    const canOperateCampo = aircraft.can_operate_campo_aviazione;
    const campoModAvailable = aircraft.campo_aviazione_mod_available;
    const campoModCost = aircraft.campo_aviazione_mod_cost;
    
    let campoInfo = '';
    if (canOperateCampo) {
        campoInfo = '✅ Sì';
    } else if (campoModAvailable && campoModCost) {
        const modCostFormatted = Math.round(parseInt(campoModCost) / 1000000).toLocaleString() + 'M';
        campoInfo = `❌ No (mod. disponibile: €${modCostFormatted})`;
    } else {
        campoInfo = '❌ No';
    }
    
    // Immagine dell'aeromobile - usa il path dal database
    const imagePath = aircraft.image_path || '/assets/aircraft/default.png';
    
    const html = `
        <div class="aircraft-details">
            <div class="aircraft-header" style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                <div class="aircraft-image" style="flex-shrink: 0;">
                    <img src="${imagePath}" alt="${aircraft.name}" 
                         style="width: 200px; height: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px; background: #f9f9f9;"
                         onerror="this.src='/assets/aircraft/default.png'; this.style.opacity='0.5';">
                </div>
                <div class="aircraft-info" style="flex: 1;">
                    <h3 style="margin: 0 0 8px 0; color: #333;">${aircraft.name}</h3>
                    <p style="margin: 0; color: #666; font-size: 14px;">${aircraft.manufacturer} • ${aircraft.category || 'N/A'}</p>
                </div>
            </div>
            
            <div class="details-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin:16px 0;">
                <div><strong>Capacità:</strong> ${capacityInfo}</div>
                <div><strong>Autonomia:</strong> ${range}</div>
                <div><strong>Velocità crociera:</strong> ${cruiseSpeed} km/h</div>
                <div><strong>Consumo carburante:</strong> ${fuelConsumption} L/h</div>
                <div><strong>Entrata mercato:</strong> ${marketEntry}</div>
                <div><strong>Campi di aviazione:</strong> ${campoInfo}</div>
            </div>
            
            <div class="price-section" style="margin:16px 0; padding:12px; background:#f9f9f9; border-radius:4px;">
                <div style="font-size:18px; font-weight:bold; color:#2e7d32;">Prezzo: €${priceFormatted}</div>
                <div style="margin-top:8px; font-size:14px; color:#666;">Costo manutenzione: €${aircraft.maintenance_cost_per_hour || 'N/A'}/h</div>
            </div>
            
            <div class="purchase-actions" style="margin-top:16px; display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn-purchase" onclick="purchaseAircraft('${aircraft.name}', ${price})" 
                        style="background:#4caf50; color:white; padding:12px 24px; border:none; border-radius:4px; cursor:pointer; font-size:16px;">
                    💰 Acquista €${priceFormatted}
                </button>
                ${campoModAvailable && campoModCost && !canOperateCampo ? `
                <button class="btn-purchase-campo" onclick="purchaseAircraftCampo('${aircraft.name}', ${price}, ${campoModCost})" 
                        style="background:#ff9800; color:white; padding:12px 24px; border:none; border-radius:4px; cursor:pointer; font-size:16px;">
                    ✈️ Versione Campo €${Math.round((parseInt(price) + parseInt(campoModCost)) / 1000000).toLocaleString() + 'M'}
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    detailsContentEl.innerHTML = html;
}

// Funzione di acquisto aeromobile
function purchaseAircraft(aircraftName, price) {
    console.log('🛒 Tentativo acquisto:', aircraftName, 'Prezzo:', price);
    
    const priceFormatted = Math.round(price / 1000000).toLocaleString() + 'M';
    const confirmed = confirm(`Confermi l'acquisto di ${aircraftName} per €${priceFormatted}?`);
    
    if (confirmed) {
        alert('🚧 Acquisto simulato!\n\nL\'aeromobile sarà aggiunto alla flotta quando sarà implementata la logica completa di acquisto.');
        
        // Chiudi il modal
        const modal = document.getElementById('aircraft-modal');
        if (modal) modal.classList.add('hidden');
    }
}

// Funzione di acquisto aeromobile versione per campo di aviazione
function purchaseAircraftCampo(aircraftName, basePrice, modCost) {
    console.log('🛒 Tentativo acquisto versione campo:', aircraftName, 'Prezzo base:', basePrice, 'Costo modifica:', modCost);
    
    const totalPrice = parseInt(basePrice) + parseInt(modCost);
    const totalPriceFormatted = Math.round(totalPrice / 1000000).toLocaleString() + 'M';
    const modCostFormatted = Math.round(parseInt(modCost) / 1000000).toLocaleString() + 'M';
    
    const confirmed = confirm(`Confermi l'acquisto di ${aircraftName} VERSIONE CAMPO DI AVIAZIONE per €${totalPriceFormatted}?\n\n(Include modifica da €${modCostFormatted})`);
    
    if (confirmed) {
        alert('🚧 Acquisto simulato!\n\nL\'aeromobile (versione campo) sarà aggiunto alla flotta quando sarà implementata la logica completa di acquisto.');
        
        // Chiudi il modal
        const modal = document.getElementById('aircraft-modal');
        if (modal) modal.classList.add('hidden');
    }
}

// Esporta le funzioni globalmente
window.resolveGameDate = resolveGameDate;
window.groupAircraft = groupAircraft;
window.openFleetPurchaseUI = openFleetPurchaseUI;
window.purchaseAircraft = purchaseAircraft;
window.purchaseAircraftCampo = purchaseAircraftCampo;
window.restoreFleetTab = restoreFleetTab;

console.log('✅ FleetTab-compatible caricato con sistema acquisto avanzato');
