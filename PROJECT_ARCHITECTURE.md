# Architettura Air Tycoon 2

> Mappa della struttura reale del progetto. Coerente con `DEVELOPMENT_GUIDELINES.md` v2.0.
> Ultimo aggiornamento: 13 agosto 2026

## Struttura del Progetto

### Root (config & deploy)
- `package.json` — dipendenze e script npm
- `docker-compose.yml` — container app + db
- `Dockerfile` — immagine app
- `.env` / `.env.example` — variabili ambiente
- `ecosystem.config.json` — PM2 (production)
- `air-tycoon.service` — systemd unit
- `docker-entrypoint.sh` — entrypoint container

### Backend (`server/`)
- `index.js` — Express, routing, middleware
- `database.js` — pool PostgreSQL
- `routes/` — `auth.js`, `game.js`, `airports.js`, `fleet.js`, `routes.js`, `finance.js`, `market-analysis.js`, `admin.js`, `db-viewer.js`
- `openapi/` — specifiche per endpoint (`auth.yaml`, `game.yaml`, `airports.yaml`, `fleet.yaml`, `routes.yaml`, `finance.yaml`, `marketanalysis.yaml`)

### Database (`database/`)
- `schema_base.sql` — schema iniziale
- `migrate.js` / `migration-system.js` — motore migrazioni
- `seed_initial_data.js` — seed
- `check-status.js` — health check
- `initial-database/*.sql` — users, companies, airports, aircraft_types, aircraft_configurations, seat_models, routes, fleet, financial_reports, world_events
- `migrations/` — 21 migrazioni incrementali

### Frontend (`Client/`)
- `pages/` — `hub.html`, `auth/login.html`, `game/select.html`, `templates/`, `modals/`
- `styles/` — `main.css`, `ui.css`, `auth.css`, `game-select.css`
- `assets/` — `aircraft/`, `logo.svg`
- `src/` — **unica sorgente JS servita via `/main-src`** (vedi DEVELOPMENT_GUIDELINES §regola-0)

#### `Client/src/` per moduli
- `core/` — `Game.js`, `GameState.js`
- `entities/` — `Aircraft.js`, `Airport.js`, `Route.js`
- `managers/` — `FleetManager.js`, `RouteManager.js`, `FinanceManager.js`, `HubManager.js`, `DemandEstimationManager.js`, `InfrastructureManager.js`
- `ui/` — `UIManager.js`, `RouteUIManager.js`, tab (`WorldTab.js`, `FleetTab.js`, `RoutesTab.js`, `FinancesTab.js`, `ResearchTab.js`), overlay, eventi
  - `ui/modules/` — 8 moduli rotta (`RouteStateManager`, `RoutePanelManager`, `RouteAircraftManager`, `RouteDemandAnalysisManager`, `RouteMarketAnalysisManager`, `RouteCreationManager`, `RouteCalculationUtils`, `RouteEventManager`)
- `graphics/` — `WorldMap.js` (Leaflet)
- `utils/` — `APIClient.js`, `DataLoader.js`, `AuthManager.js`, `SessionStateManager.js`, `AutoRouter.js`, `SaveLoad.js`, `RouteCalculator.js`, `RouteCostCalculator.js`, `MarketAnalysisAPI.js`, `MapVisibilityManager.js`, `gameUtils.js`, `validation.js`
- `simulation/` — `EconomyEngine.js`, `WeatherEngine.js`
- `main.js` — UNICO orchestratore (init sequenziale, vedi DEVELOPMENT_GUIDELINES §load-order)
- `auth.js`, `game-select.js`, `load-game.js`, `pages/hubPage.js`, `pages/selectPage.js`, `pages/selectGamePage.js`

## File presenti ma VIETATI (da eliminare — v2.0 §rimuovere)

🚫 Esistono nel repo ma violano i paletti v2.0; rimuoverli prima di nuove feature:
- Root `src/` — duplicato di `Client/src`, non più servito
- `Client/src/ui/RouteUIManager_BACKUP.js`, `RouteUIManager_NEW.js` — una sola versione per modulo
- `test_route_ui.html`, `test_safe_route.html`, `debug-game.html`, `debug-init.html` nel tree di produzione — i debug, se servono, vivono SOLO in `Client/pages/debug/` e non sono linkati da `hub.html`

## Flusso Architetturale

1. **Avvio**: `docker-compose.yml` → `Dockerfile` → `docker-entrypoint.sh` → `server/index.js` → `database.js` → PostgreSQL
2. **Init DB**: `migrate.js` → `migrations/*.sql` + `initial-database/*.sql` → `seed_initial_data.js`
3. **Caricamento frontend**: `hub.html` → `<script>` in load-order → `main.js` (init) → `Game.js` → managers → `UIManager.js`
4. **Creazione rotta**: `WorldMap.js` → `RouteUIManager.js` → moduli `Route*Manager` → API call → DB

## Aree da sistemare (collegate a v2.0)

- 🔴 `import`/`export` ES6 residui nel frontend → convertire a `window` (Regola 0)
- 🔴 Dipendenze circolari / "Game non si inizializza" → rispettare Contratto di Load Order
- 🔴 Fallback che mascherano errori API (ritornano `[]`/`{}`) → vietati (§no-fallback)
- 🟡 Consolidare util duplicate, rimuovere `console.log` di debug, file > 500 righe / funzioni > 50 righe
