// Gestore dell'interfaccia utente
class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTab = 'world';
        this.modals = {};
        this.eventListeners = [];
    }
    
    init() {
        this.setupTabNavigation();
        this.setupModals();
        this.setupEventListeners();
        this.initializeDisplays();
        
        console.log('🖥️ UI Manager inizializzato');
    }
    
    setupTabNavigation() {
        const menuButtons = document.querySelectorAll('.menu-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        menuButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        // Rimuove classe active da tutti i bottoni e tab
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        
        // Aggiunge classe active al bottone e tab correnti
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Aggiorna il contenuto del tab
        this.updateTabContent(tabName);
    }
    
    updateTabContent(tabName) {
        switch (tabName) {
            case 'world':
                this.updateWorldTab();
                break;
            case 'fleet':
                this.updateFleetDisplay();
                break;
            case 'routes':
                this.updateRoutesDisplay();
                break;
            case 'finances':
                this.updateFinancesDisplay();
                break;
            case 'research':
                this.updateResearchDisplay();
                break;
        }
    }
    
    updateWorldTab() {
        // La mappa è gestita dal WorldMap class
        this.game.worldMap.render();
    }
    
    updateFleetDisplay() {
        const aircraftList = document.getElementById('aircraft-list');
        const fleet = this.game.state.fleet;
        
        aircraftList.innerHTML = '';
        
        if (fleet.length === 0) {
            aircraftList.innerHTML = `
                <div class="empty-state">
                    <h3>🛩️ Nessun aeromobile nella flotta</h3>
                    <p>Inizia acquistando il tuo primo aeromobile!</p>
                    <button onclick="document.getElementById('aircraft-modal').classList.remove('hidden')">
                        Acquista Aeromobile
                    </button>
                </div>
            `;
            return;
        }
        
        fleet.forEach(aircraft => {
            const aircraftCard = this.createAircraftCard(aircraft);
            aircraftList.appendChild(aircraftCard);
        });
    }
    
    createAircraftCard(aircraft) {
        const card = document.createElement('div');
        card.className = 'aircraft-card';
        
        const displayInfo = aircraft.getDisplayInfo();
        const statusColor = this.getStatusColor(aircraft.status);
        
        card.innerHTML = `
            <div class="aircraft-header">
                <h4>${displayInfo.name}</h4>
                <span class="aircraft-status" style="color: ${statusColor}">
                    ${displayInfo.status}
                </span>
            </div>
            <div class="aircraft-details">
                <p><strong>Modello:</strong> ${displayInfo.manufacturer} ${displayInfo.model}</p>
                <p><strong>Capacità:</strong> ${displayInfo.capacity} passeggeri</p>
                <p><strong>Autonomia:</strong> ${displayInfo.range.toLocaleString()} km</p>
            </div>
            <div class="aircraft-stats">
                <div class="stat">
                    <span class="stat-label">Condizione</span>
                    <span class="stat-value">${displayInfo.condition}%</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Velocità</span>
                    <span class="stat-value">${displayInfo.speed} km/h</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Voli Totali</span>
                    <span class="stat-value">${displayInfo.totalFlights}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Efficienza</span>
                    <span class="stat-value">${displayInfo.efficiency}%</span>
                </div>
            </div>
            <div class="aircraft-actions">
                ${this.getAircraftActions(aircraft)}
            </div>
        `;
        
        return card;
    }
    
    getStatusColor(status) {
        const colors = {
            'available': '#4CAF50',
            'in-flight': '#2196F3',
            'maintenance': '#FF9800',
            'assigned': '#9C27B0'
        };
        return colors[status] || '#666';
    }
    
    getAircraftActions(aircraft) {
        let actions = '';
        
        if (aircraft.status === 'available') {
            actions += `<button onclick="window.uiManager.assignAircraftToRoute('${aircraft.id}')">Assegna a Rotta</button>`;
        }
        
        if (aircraft.needsMaintenance()) {
            actions += `<button onclick="window.uiManager.performMaintenance('${aircraft.id}')" class="maintenance-btn">Manutenzione</button>`;
        }
        
        actions += `<button onclick="window.uiManager.showAircraftDetails('${aircraft.id}')" class="details-btn">Dettagli</button>`;
        
        return actions;
    }
    
    updateRoutesDisplay() {
        const routesList = document.getElementById('routes-list');
        const routes = this.game.state.routes;
        
        routesList.innerHTML = '';
        
        if (routes.length === 0) {
            routesList.innerHTML = `
                <div class="empty-state">
                    <h3>🛣️ Nessuna rotta attiva</h3>
                    <p>Crea la tua prima rotta per iniziare a operare!</p>
                    <button onclick="window.uiManager.showCreateRouteModal()">
                        Crea Rotta
                    </button>
                </div>
            `;
            return;
        }
        
        routes.forEach(route => {
            const routeCard = this.createRouteCard(route);
            routesList.appendChild(routeCard);
        });
    }
    
    createRouteCard(route) {
        const card = document.createElement('div');
        card.className = 'route-card';
        
        const aircraft = this.game.state.fleet.find(a => a.id === route.aircraftId);
        const displayInfo = route.getDisplayInfo();
        const monthlyProfit = aircraft ? route.calculateMonthlyProfit(aircraft) : 0;
        const profitClass = monthlyProfit >= 0 ? '' : 'negative';
        
        card.innerHTML = `
            <div class="route-info">
                <div class="route-path">
                    <h4>${displayInfo.origin} → ${displayInfo.destination}</h4>
                    <p>${displayInfo.distance} km</p>
                </div>
                <div class="route-stats">
                    <div class="route-stat">
                        <span class="stat-label">Frequenza</span>
                        <span class="stat-value">${displayInfo.frequency}/settimana</span>
                    </div>
                    <div class="route-stat">
                        <span class="stat-label">Carico Medio</span>
                        <span class="stat-value">${displayInfo.averageLoadFactor}%</span>
                    </div>
                    <div class="route-stat">
                        <span class="stat-label">Puntualità</span>
                        <span class="stat-value">${displayInfo.onTimePerformance}%</span>
                    </div>
                    <div class="route-profit ${profitClass}">
                        €${this.formatMoney(monthlyProfit)}/mese
                    </div>
                </div>
            </div>
            <div class="route-actions">
                <button onclick="window.uiManager.editRoute('${route.id}')" class="edit-btn">Modifica</button>
                ${route.isActive ? 
                    `<button onclick="window.uiManager.suspendRoute('${route.id}')" class="suspend-btn">Sospendi</button>` :
                    `<button onclick="window.uiManager.activateRoute('${route.id}')" class="activate-btn">Attiva</button>`
                }
                <button onclick="window.uiManager.deleteRoute('${route.id}')" class="delete-btn">Elimina</button>
            </div>
        `;
        
        return card;
    }
    
    updateFinancesDisplay() {
        const stats = this.game.financeManager.getFinancialStatistics();
        
        // Aggiorna le card delle statistiche
        const incomeEl = document.getElementById('monthly-income');
        const costsEl = document.getElementById('monthly-costs');
        const profitEl = document.getElementById('monthly-profit');
        
        if (incomeEl) incomeEl.textContent = `€${this.formatMoney(stats.monthlyIncome)}`;
        if (costsEl) costsEl.textContent = `€${this.formatMoney(stats.monthlyExpenses)}`;
        if (profitEl) {
            profitEl.textContent = `€${this.formatMoney(stats.monthlyProfit)}`;
            profitEl.style.color = stats.monthlyProfit >= 0 ? '#4CAF50' : '#f44336';
        }
        
        // TODO: Aggiungere grafici e dettagli finanziari
    }
    
    updateResearchDisplay() {
        const researchProjects = document.getElementById('research-projects');
        
        researchProjects.innerHTML = `
            <div class="research-coming-soon">
                <h3>🔬 Centro Ricerca</h3>
                <p>Il sistema di ricerca sarà disponibile in una futura versione!</p>
                <div class="research-preview">
                    <h4>Progetti pianificati:</h4>
                    <ul>
                        <li>🛩️ Efficienza del carburante</li>
                        <li>👥 Servizi passeggeri migliorati</li>
                        <li>🔧 Tecnologie di manutenzione</li>
                        <li>📡 Sistemi di navigazione avanzati</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    setupModals() {
        // Modal acquisto aeromobili
        this.setupAircraftModal();
        
        // Modal creazione rotte
        this.setupRouteModal();
        
        // Gestione chiusura modali
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });
        
        // Chiusura modal cliccando fuori
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }
    
    setupAircraftModal() {
        const catalog = document.getElementById('aircraft-catalog');
        const allAircraft = AircraftData.getAllAircraft();
        
        catalog.innerHTML = '';
        
        allAircraft.forEach(aircraftData => {
            const item = document.createElement('div');
            item.className = 'aircraft-catalog-item';
            
            const canAfford = this.game.state.company.money >= aircraftData.price;
            
            item.innerHTML = `
                <h4>${aircraftData.name}</h4>
                <p class="aircraft-manufacturer">${aircraftData.manufacturer}</p>
                <div class="aircraft-specs">
                    <p><strong>Capacità:</strong> ${aircraftData.capacity} passeggeri</p>
                    <p><strong>Autonomia:</strong> ${aircraftData.range.toLocaleString()} km</p>
                    <p><strong>Velocità:</strong> ${aircraftData.speed} km/h</p>
                </div>
                <p class="aircraft-price">€${this.formatMoney(aircraftData.price)}</p>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''} 
                        onclick="window.uiManager.buyAircraft('${aircraftData.type}')">
                    ${canAfford ? 'Acquista' : 'Fondi insufficienti'}
                </button>
            `;
            
            catalog.appendChild(item);
        });
    }
    
    setupRouteModal() {
        const originSelect = document.getElementById('origin-airport');
        const destinationSelect = document.getElementById('destination-airport');
        const aircraftSelect = document.getElementById('route-aircraft');
        
        // Popola aeroporti
        const airports = AirportData.getAllAirports();
        originSelect.innerHTML = '<option value="">Seleziona aeroporto di partenza</option>';
        destinationSelect.innerHTML = '<option value="">Seleziona destinazione</option>';
        
        airports.forEach(airport => {
            const option1 = document.createElement('option');
            option1.value = airport.code;
            option1.textContent = `${airport.code} - ${airport.name} (${airport.city})`;
            originSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = airport.code;
            option2.textContent = `${airport.code} - ${airport.name} (${airport.city})`;
            destinationSelect.appendChild(option2);
        });
        
        // Aggiorna aeromobili disponibili quando cambia la selezione
        const updateAvailableAircraft = () => {
            const availableAircraft = this.game.fleetManager.getAvailableAircraft();
            aircraftSelect.innerHTML = '<option value="">Seleziona aeromobile</option>';
            
            availableAircraft.forEach(aircraft => {
                const option = document.createElement('option');
                option.value = aircraft.id;
                option.textContent = `${aircraft.name} (${aircraft.capacity} pax, ${aircraft.range}km)`;
                aircraftSelect.appendChild(option);
            });
        };
        
        originSelect.addEventListener('change', updateAvailableAircraft);
        destinationSelect.addEventListener('change', updateAvailableAircraft);
        
        // Conferma creazione rotta
        document.getElementById('confirm-route').addEventListener('click', () => {
            this.createRoute();
        });
    }
    
    setupEventListeners() {
        // Bottone acquista aeromobile
        document.getElementById('buy-aircraft').addEventListener('click', () => {
            this.setupAircraftModal(); // Aggiorna prezzi
            document.getElementById('aircraft-modal').classList.remove('hidden');
        });
        
        // Bottone aggiungi rotta
        document.getElementById('add-route').addEventListener('click', () => {
            this.showCreateRouteModal();
        });
        
        // Esponi i metodi nell'oggetto window per l'accesso da HTML
        window.uiManager = this;
    }
    
    initializeDisplays() {
        // Inizializza tutte le visualizzazioni
        this.updateFleetDisplay();
        this.updateRoutesDisplay();
        this.updateFinancesDisplay();
        this.updateResearchDisplay();
    }
    
    // Metodi pubblici per interazione
    buyAircraft(aircraftType) {
        const success = this.game.buyAircraft(aircraftType);
        if (success) {
            document.getElementById('aircraft-modal').classList.add('hidden');
            this.updateFleetDisplay();
            this.showNotification('✈️ Aeromobile acquistato con successo!', 'success');
        }
    }
    
    showCreateRouteModal() {
        // Aggiorna la lista degli aeromobili disponibili
        const aircraftSelect = document.getElementById('route-aircraft');
        const availableAircraft = this.game.fleetManager.getAvailableAircraft();
        
        aircraftSelect.innerHTML = '<option value="">Seleziona aeromobile</option>';
        
        if (availableAircraft.length === 0) {
            aircraftSelect.innerHTML = '<option value="">Nessun aeromobile disponibile</option>';
            this.showNotification('⚠️ Devi avere almeno un aeromobile disponibile per creare una rotta', 'warning');
            return;
        }
        
        availableAircraft.forEach(aircraft => {
            const option = document.createElement('option');
            option.value = aircraft.id;
            option.textContent = `${aircraft.name} (${aircraft.capacity} pax, ${aircraft.range}km)`;
            aircraftSelect.appendChild(option);
        });
        
        document.getElementById('route-modal').classList.remove('hidden');
    }
    
    createRoute() {
        const origin = document.getElementById('origin-airport').value;
        const destination = document.getElementById('destination-airport').value;
        const aircraftId = document.getElementById('route-aircraft').value;
        
        if (!origin || !destination || !aircraftId) {
            this.showNotification('⚠️ Compila tutti i campi per creare la rotta', 'warning');
            return;
        }
        
        if (origin === destination) {
            this.showNotification('⚠️ Origine e destinazione devono essere diverse', 'warning');
            return;
        }
        
        const route = this.game.createRoute(origin, destination, aircraftId);
        if (route) {
            document.getElementById('route-modal').classList.add('hidden');
            this.updateRoutesDisplay();
            this.updateFleetDisplay(); // Aggiorna anche la flotta
            this.showNotification('🛣️ Rotta creata con successo!', 'success');
            
            // Reset form
            document.getElementById('origin-airport').value = '';
            document.getElementById('destination-airport').value = '';
            document.getElementById('route-aircraft').value = '';
        }
    }
    
    suspendRoute(routeId) {
        const success = this.game.routeManager.suspendRoute(routeId);
        if (success) {
            this.updateRoutesDisplay();
            this.updateFleetDisplay();
            this.showNotification('⏸️ Rotta sospesa', 'info');
        }
    }
    
    activateRoute(routeId) {
        const success = this.game.routeManager.reactivateRoute(routeId);
        if (success) {
            this.updateRoutesDisplay();
            this.updateFleetDisplay();
            this.showNotification('▶️ Rotta riattivata', 'success');
        }
    }
    
    deleteRoute(routeId) {
        if (confirm('Sei sicuro di voler eliminare questa rotta?')) {
            const success = this.game.routeManager.removeRoute(routeId);
            if (success) {
                this.updateRoutesDisplay();
                this.updateFleetDisplay();
                this.showNotification('🗑️ Rotta eliminata', 'info');
            }
        }
    }
    
    performMaintenance(aircraftId) {
        const success = this.game.fleetManager.performMaintenance(aircraftId);
        if (success) {
            this.updateFleetDisplay();
            this.showNotification('🔧 Manutenzione completata', 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        // Crea elemento notifica
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Stili CSS in linea per la notifica
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            minWidth: '300px',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Colori per tipo
        const colors = {
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#f44336',
            info: '#2196F3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animazione entrata
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Rimozione automatica
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('it-IT').format(Math.round(amount));
    }
    
    // Gestione responsive
    handleResize() {
        // Adatta l'interfaccia per dispositivi mobili
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
    
    // Cleanup
    destroy() {
        this.eventListeners.forEach(listener => {
            listener.element.removeEventListener(listener.event, listener.handler);
        });
        this.eventListeners = [];
    }
}
