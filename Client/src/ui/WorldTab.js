// /Client/src/ui/WorldTab.js
export function initWorldTab() {
    if (window._worldTabInitialized) return;
    window._worldTabInitialized = true;
    // Inizializza la UI e gli event handler della tab Mappa
    console.debug('WorldTab inizializzato');

    // Carica la classe WorldMap e inizializzala nella zona #world-map
    import('/src/graphics/WorldMap.js')
        .then(module => {
            try {
                console.debug('[WorldTab] imported module keys:', Object.keys(module || {}));
            } catch (e) { /* ignore in old browsers */ }

            // Try multiple locations for the constructor
            let WorldMapCtor = null;

            // 1) window global (most robust for legacy files)
            if (typeof window !== 'undefined' && typeof window.WorldMap === 'function') {
                WorldMapCtor = window.WorldMap;
                console.debug('[WorldTab] using window.WorldMap');
            }

            // 2) module.default
            if (!WorldMapCtor && module && module.default) {
                if (typeof module.default === 'function') {
                    WorldMapCtor = module.default;
                    console.debug('[WorldTab] using module.default (function)');
                } else {
                    console.debug('[WorldTab] module.default exists but is not function:', typeof module.default);
                }
            }

            // 3) named export
            if (!WorldMapCtor && module && module.WorldMap && typeof module.WorldMap === 'function') {
                WorldMapCtor = module.WorldMap;
                console.debug('[WorldTab] using module.WorldMap');
            }

            // 4) maybe module itself is a constructor (rare)
            if (!WorldMapCtor && typeof module === 'function') {
                WorldMapCtor = module;
                console.debug('[WorldTab] using module as constructor');
            }

            // 5) try to detect an object with a default property that is the constructor
            if (!WorldMapCtor && module && typeof module === 'object') {
                try {
                    for (const k of Object.keys(module)) {
                        if (typeof module[k] === 'function') {
                            // choose the first function-looking export as fallback
                            WorldMapCtor = module[k];
                            console.debug('[WorldTab] fallback: using module export', k);
                            break;
                        }
                    }
                } catch (e) { /* ignore */ }
            }

            if (!WorldMapCtor || typeof WorldMapCtor !== 'function') {
                console.error('WorldMap constructor not found or not a function:', WorldMapCtor || module);
                return;
            }

            try {
                if (!window._globalGameWorldMap) {
                    window._globalGameWorldMap = new WorldMapCtor(window.game || {});
                    console.debug('[WorldTab] WorldMap instance created');
                }
                if (window._globalGameWorldMap && typeof window._globalGameWorldMap.init === 'function') {
                    window._globalGameWorldMap.init();
                }
            } catch (err) {
                console.error('Errore inizializzazione WorldMap in WorldTab:', err && err.message);
            }
        })
        .catch(err => {
            console.error('Impossibile caricare WorldMap per WorldTab:', err && err.message);
        });
}
