// /Client/src/ui/WorldTab.js
window.initWorldTab = function initWorldTab() {
    if (window._worldTabInitialized) return;
    window._worldTabInitialized = true;
    // Inizializza la UI e gli event handler della tab Mappa
    console.debug('WorldTab inizializzato');

    // Game.js crea e inizializza già `window.game.worldMap`.
    // Qui evitiamo di creare una seconda istanza, che duplicava i listener globali.
    try {
        const worldMap = window.game && window.game.worldMap ? window.game.worldMap : null;
        if (worldMap && typeof worldMap.map === 'object' && worldMap.map && typeof worldMap.map.invalidateSize === 'function') {
            setTimeout(() => {
                try { worldMap.map.invalidateSize(); } catch (e) { /* ignore */ }
            }, 100);
        }
    } catch (err) {
        console.error('Errore nel refresh della mappa in WorldTab:', err && err.message);
    }
};
