// RoutePanelManager - Gestione dei pannelli UI per creazione rotte

var RoutePanelManager = {
    
    // Elementi DOM cache
    elements: {},
    
    // Inizializza cache elementi DOM
    initElements: function() {
        this.elements = {
            routeCreationPanel: document.getElementById('route-creation-panel'),
            routeConfigPanel: document.getElementById('route-config-panel'),
            openRoutePanelBtn: document.getElementById('open-route-panel'),
            originSlot: document.getElementById('origin-airport'),
            destinationSlot: document.getElementById('destination-airport'),
            lockOriginBtn: document.getElementById('lock-origin-btn'),
            clearDestinationBtn: document.getElementById('clear-destination-btn'),
            createRouteBtn: document.getElementById('create-route-btn'),
            routeInfoPanel: document.getElementById('route-info'),
            aircraftSelector: document.getElementById('aircraft-selector-main')
        };
        
        return this.elements;
    },
    
    // Apri pannello creazione rotte
    openCreationPanel: function() {
        
        if (!this.elements.routeCreationPanel) this.initElements();
        
        var panel = this.elements.routeCreationPanel;
        var triggerBtn = this.elements.openRoutePanelBtn;
        
        if (panel && triggerBtn) {
            panel.classList.add('active');
            uiUtils.hide(triggerId);
            return true;
        }
        return false;
    },
    
    // Chiudi pannello creazione rotte
    closeCreationPanel: function() {
        
        var panel = this.elements.routeCreationPanel;
        var configPanel = this.elements.routeConfigPanel;
        var triggerBtn = this.elements.openRoutePanelBtn;
        
        if (panel) panel.classList.remove('active');
        if (configPanel) configPanel.classList.remove('active');
        if (triggerBtn) uiUtils.show(triggerId);
        
        return true;
    },
    
    // Apri pannello configurazione rotta
    openConfigPanel: function() {
        
        var selectionPanel = this.elements.routeCreationPanel;
        var configPanel = this.elements.routeConfigPanel;
        
        if (selectionPanel) selectionPanel.classList.remove('active');
        if (configPanel) {
            configPanel.classList.add('active');
            return true;
        }
        
        console.error('❌ Pannello configurazione rotta non trovato');
        return false;
    },
    
    // Torna alla selezione aeroporti
    backToSelection: function() {
        
        var configPanel = this.elements.routeConfigPanel;
        var selectionPanel = this.elements.routeCreationPanel;
        
        if (configPanel) configPanel.classList.remove('active');
        if (selectionPanel) selectionPanel.classList.add('active');
        
        return true;
    },
    
    // Aggiorna display slot aeroporto
    updateSlotDisplay: function(slotType, airport) {
        var slotElement = document.getElementById(slotType + '-airport');
        if (!slotElement || !airport) return false;
        
        var content = '<div class="airport-info">' +
                     '<div class="airport-name">' + airport.name + '</div>' +
                     '<div class="airport-code">' + airport.code + '</div>' +
                     '</div>';
        
        slotElement.innerHTML = content;
        slotElement.classList.add('selected');
        slotElement.classList.remove('active');
        
        return true;
    },
    
    // Pulisci slot aeroporto
    clearSlot: function(slotType) {
        var slotElement = document.getElementById(slotType + '-airport');
        if (!slotElement) return false;
        
        var placeholder = slotType === 'origin' ? 
            'Seleziona aeroporto di partenza' : 
            'Seleziona aeroporto di arrivo';
        
        slotElement.innerHTML = '<span class="placeholder">' + placeholder + '</span>';
        slotElement.classList.remove('selected', 'active', 'locked');
        
        return true;
    },
    
    // Seleziona slot attivo
    selectSlot: function(slotType) {
        this.clearActiveSlots();
        
        var slotElement = document.getElementById(slotType + '-airport');
        if (slotElement) {
            slotElement.classList.add('active');
            return true;
        }
        return false;
    },
    
    // Pulisci tutti gli slot attivi
    clearActiveSlots: function() {
        var slots = ['origin', 'destination'];
        for (var i = 0; i < slots.length; i++) {
            var slotElement = document.getElementById(slots[i] + '-airport');
            if (slotElement) {
                slotElement.classList.remove('active');
            }
        }
        return true;
    },
    
    // Aggiorna bottone crea rotta
    updateCreateButton: function(canCreate) {
        var createBtn = this.elements.createRouteBtn || document.getElementById('create-route-btn');
        if (createBtn) {
            createBtn.disabled = !canCreate;
            return true;
        }
        return false;
    },
    
    // Aggiorna bottone lock origine
    updateLockButton: function(hasOrigin, isLocked) {
        var lockBtn = this.elements.lockOriginBtn || document.getElementById('lock-origin-btn');
        if (!lockBtn) return false;
        
        lockBtn.textContent = isLocked ? '🔒' : '🔓';
        lockBtn.title = isLocked ? 'Sblocca origine' : 'Blocca origine per confrontare destinazioni';
        
        if (isLocked) {
            lockBtn.classList.add('locked');
        } else {
            lockBtn.classList.remove('locked');
        }
        
        lockBtn.disabled = !hasOrigin;
        lockBtn.style.opacity = hasOrigin ? '1' : '0.5';
        
        return true;
    },
    
    // Aggiorna aspetto slot origine
    updateOriginSlotAppearance: function(isLocked) {
        var originSlot = this.elements.originSlot || document.getElementById('origin-airport');
        if (!originSlot) return false;
        
        if (isLocked) {
            originSlot.classList.add('locked');
        } else {
            originSlot.classList.remove('locked');
        }
        
        return true;
    },
    
    // Mostra/nascondi pannello informazioni rotta
    showRouteInfo: function() {
        var routeInfoPanel = this.elements.routeInfoPanel || document.getElementById('route-info');
        if (routeInfoPanel) {
            routeInfoPanel.style.display = 'block';
            return true;
        }
        return false;
    },
    
    hideRouteInfo: function() {
        var routeInfoPanel = this.elements.routeInfoPanel || document.getElementById('route-info');
        if (routeInfoPanel) {
            routeInfoPanel.style.display = 'none';
            return true;
        }
        return false;
    },
    
    // Carica template HTML
    loadTemplate: function(templatePath) {
        
        return fetch(templatePath)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Errore caricamento template: ' + response.status);
                }
                return response.text();
            })
            .then(function(html) {
                var worldTab = document.getElementById('world-tab');
                if (!worldTab) {
                    throw new Error('Container world-tab non trovato');
                }
                
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                while (tempDiv.firstChild) {
                    worldTab.appendChild(tempDiv.firstChild);
                }
                
                return true;
            })
            .catch(function(error) {
                console.error('❌ Errore caricamento template:', error);
                return false;
            });
    }
};

// Export globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoutePanelManager;
} else if (typeof window !== 'undefined') {
    window.RoutePanelManager = RoutePanelManager;
}
