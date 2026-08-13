// Gestione eventi UI e navigazione tab per Air Tycoon 2

window.setupUIEvents = function setupUIEvents(game, showNotification, toggleGameMenu) {
    console.debug('🔧 Setup eventi UI base...');
    setupTabNavigation(game);
    window.addEventListener('resize', function() {
        if (game && game.worldMap && game.worldMap.map) {
            setTimeout(function() {
                game.worldMap.map.invalidateSize();
            }, 100);
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            toggleGameMenu && toggleGameMenu();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (game && game.saveGame) {
                game.saveGame();
                showNotification && showNotification('Gioco salvato!', 'success');
            }
        }
    });
    console.debug('✅ Eventi UI base configurati');
};

window.setupTabNavigation = function setupTabNavigation(game) {
    console.debug('🏷️ Setup navigazione tab...');
    var tabButtons = document.querySelectorAll('.menu-btn[data-tab]');
    var tabContents = document.querySelectorAll('.tab-content');
    if (!tabButtons.length || !tabContents.length) {
        console.warn('⚠️ Tab buttons o content non trovati');
        return;
    }
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var targetTab = this.getAttribute('data-tab');
            if (targetTab) {
                switchToTab(targetTab, game);
            }
        });
    });
    console.debug('✅ Navigazione tab configurata');
};

window.switchToTab = function switchToTab(tabName, game) {
    console.debug('🔄 Cambio a tab:', tabName);
    var allButtons = document.querySelectorAll('.menu-btn[data-tab]');
    var allContents = document.querySelectorAll('.tab-content');
    allButtons.forEach(function(btn) { btn.classList.remove('active'); });
    allContents.forEach(function(content) { content.classList.remove('active'); });
    var targetButton = document.querySelector('.menu-btn[data-tab="' + tabName + '"]');
    if (targetButton) targetButton.classList.add('active');
    var targetContent = document.getElementById(tabName + '-tab');
    if (targetContent) targetContent.classList.add('active');
    handleTabSwitch(tabName, game);
    try {
        // Notify other modules that a tab was switched (useful for lazy-loading)
        document.dispatchEvent(new CustomEvent('tab-switched', { detail: { tab: tabName } }));
    } catch (e) { /* ignore */ }
};

window.getCurrentActiveTab = function getCurrentActiveTab() {
    var activeButton = document.querySelector('.menu-btn[data-tab].active');
    if (activeButton) {
        return activeButton.getAttribute('data-tab');
    }
    return 'world';
};

window.handleTabSwitch = function handleTabSwitch(tabName, game) {
    if (!game) {
        console.warn('⚠️ Game non disponibile per gestione tab switch');
        return;
    }
    switch(tabName) {
        case 'world':
            if (game.worldMap && game.worldMap.map) {
                setTimeout(function() {
                    game.worldMap.map.invalidateSize();
                }, 100);
            }
            break;
        case 'fleet':
            if (game.uiManager && game.uiManager.updateFleetUI) {
                game.uiManager.updateFleetUI();
            }
            break;
        case 'routes':
            if (game.routeUIManager && game.routeUIManager.updateRoutesList) {
                game.routeUIManager.updateRoutesList();
            }
            break;
        case 'finances':
            if (game.uiManager && game.uiManager.updateFinanceUI) {
                game.uiManager.updateFinanceUI();
            }
            break;
        case 'infrastructure':
            if (game.uiManager && game.uiManager.updateInfrastructureUI) {
                console.debug('🏗️ Aggiornamento UI infrastrutture...');
                game.uiManager.updateInfrastructureUI();
            } else {
                console.warn('⚠️ updateInfrastructureUI non disponibile');
            }
            break;
        case 'research':
            console.debug('🔬 Tab ricerca - funzionalità in sviluppo');
            break;
        default:
            console.debug('📋 Tab sconosciuto:', tabName);
    }
};
