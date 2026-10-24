
---

## 3. Frontend: moduli e ordine di caricamento

| Richiesta | File | Entry point / simbolo |
|---|---|---|
| Orchestratore del gioco (init sequenziale) | `Client/src/main.js` | `initializeGame`, `waitForLeaflet`, `loadCoreDataAndStartGame` |
| Mappa tab → funzione di init | `Client/src/pages/hubPage.js` | `tabModules` |
| Navigazione tra tab | `Client/src/main.js` | `setupTabNavigation`, `switchToTab` |
| Stato del gioco | `Client/src/core/GameState.js` | `class GameState` / `window.GameState` |
| Entità del gioco | `Client/src/entities/Aircraft.js`, `Client/src/entities/Airport.js`, `Client/src/entities/Route.js` | `window.Aircraft`, `window.Airport`, `window.Route` |
| Mappa del mondo (Leaflet) | `Client/src/graphics/WorldMap.js` | `window.WorldMap` |
| Gestione flotta | `Client/src/managers/FleetManager.js` | `window.FleetManager` |
| Gestione rotte | `Client/src/managers/RouteManager.js` | `window.RouteManager` |
| Gestione hub | `Client/src/managers/HubManager.js` | `window.HubManager` |
| Stima della domanda | `Client/src/managers/DemandEstimationManager.js` | `window.DemandEstimationManager` |
| Infrastrutture (ferrovie/autostrade/AV) | `Client/src/managers/InfrastructureManager.js` | `getInfrastructureStatus` |
| Acquisto aeromobili (UI) | `Client/src/ui/aircraft-purchase.js` | `attemptPurchase`, `groupAircraft` |
| UI della tab Flotta | `Client/src/ui/FleetTab.js` | `initFleetTab`, `openFleetPurchaseUI` |
| UI della tab Mappa | `Client/src/ui/WorldTab.js` | `initWorldTab` |
| UI delle tab Rotte / Finanze / Ricerca | `Client/src/ui/RoutesTab.js`, `Client/src/ui/FinancesTab.js`, `Client/src/ui/ResearchTab.js` | `initRoutesTab`, `initFinancesTab`, `initResearchTab` |
| Sistema rotte (8 moduli) | `Client/src/ui/modules/Route*.js` | `RouteStateManager`, `RoutePanelManager`, `RouteAircraftManager`, `RouteDemandAnalysisManager`, `RouteMarketAnalysisManager`, `RouteCreationManager`, `RouteCalculationUtils`, `RouteEventManager` |
| Orchestratore del sistema rotte | `Client/src/ui/RouteUIManager.js` | `window.RouteUIManager` |
| Acquisti / catalogo aereo | `Client/src/ui/aircraft-purchase.js` | `attemptPurchase` |
| Autenticazione client | `Client/src/utils/AuthManager.js` | `AuthManager.prototype.login`, `_loginOnServer`, `logout` |
| Chiamate API dal client | `Client/src/utils/APIClient.js` | `window.APIClient` |
| Salvataggio (server-first) | `Client/src/utils/SaveLoad.js` | `window.SaveLoad`, `initialize` |
| Sessione e utente corrente | `Client/src/utils/SessionStateManager.js` | `window.SessionStateManager` |
| Persistenza dell'utente corrente | `Client/src/utils/AuthManager.js` | `loadCurrentUser`, `saveCurrentUser` |
| Validazione input client | `Client/src/utils/validation.js` | **file a 0 byte** — non contiene simboli (vedi Limiti noti) |
| Calcolo distanze e costi rotta | `Client/src/utils/RouteCalculator.js`, `Client/src/utils/RouteCostCalculator.js` | `window.RouteCalculator`, `window.RouteCostCalculator` |
| Motore economico | `Client/src/simulation/EconomyEngine.js` | `window.EconomyEngine` |
| Motore meteo | `Client/src/simulation/WeatherEngine.js` | `window.WeatherEngine` |
| Stile dell'hub | `Client/styles/ui.css`, `Client/styles/main.css` | — |

### 3.1 Load order reale di `hub.html`

L'ordine dei `<script>` in `Client/pages/hub.html` è il contratto di load order.
In breve: entità → core → manager → utils → moduli rotta → `RouteUIManager` → `UIManager`
→ `WorldMap` → `FleetTab` → `hubPage.js` → engine → `main.js`.

---

## 4. Database

| Richiesta | File | Entry point / simbolo |
|---|---|---|
| Schema iniziale completo | `database/schema_base.sql` | `CREATE TABLE users`, `CREATE TABLE companies` |
| Elenco delle migrazioni applicate/applicabili | `database/migrations/` | file `NNNN_*.sql` |
| Dati iniziali (seed) per tabella | `database/initial-database/*.sql` | — |
| Catalogo aeromobili per produttore | `database/initial-database/Aircraft types/*.sql` | un file per produttore |
| Stato del database | `database/check-status.js` | `checkDatabaseStatus` |
| Storia dei seed | `database/seed_initial_data.js` | `seed_history` |
| Storia delle migrazioni | `database/migration-system.js` | `migration_history` |
| Doc di configurazione degli ambienti | `database/CONFIG.md` | — |
| Guida alle migrazioni | `database/MIGRATIONS_GUIDE.md` | — |
| Istruzioni di reset | `database/RESET_INSTRUCTIONS.md` | — |
| Stato dei fix di debug | `database/DEBUG_STATUS.md` | — |

---

## 5. Configurazione, deploy e operazioni

| Richiesta | File | Entry point / simbolo |
|---|---|---|
| Avvio in sviluppo | `package.json` | `scripts.dev` |
| Avvio in produzione | `package.json` | `scripts.start` |
| Setup iniziale del DB | `package.json` | `scripts.setup` |
| Reset del DB | `package.json` | `scripts.db:reset` |
| Stato/reset migrazioni | `package.json` | `scripts.migrate:status`, `scripts.migrate:run` |
| Container app + DB | `docker-compose.yml` | `services.db`, `services.app` |
| Immagine app | `Dockerfile` | `ENTRYPOINT` |
| Avvio del container (schema → migrazioni → seed → server) | `docker-entrypoint.sh` | `RUN_MIGRATIONS`, `RUN_SEED` |
| Process manager PM2 | `ecosystem.config.json` | `apps[0]` |
| Unit systemd | `air-tycoon.service` | `ExecStart` |
| Aggiornamenti dipendenze | `.github/dependabot.yml` | `updates` |

---

## 6. Limiti noti

Solo documentazione: **nessun file di codice è stato modificato in questa PR**.

### File `.md` a 0 byte nel repo (da eliminare, non preservare)

- `Client/src/data/AircraftData-temp.js`
- `Client/src/pages/hubPage-simple.js`
- `Client/src/ui/globalEvents.js`
- `Client/src/ui/modules/RouteEventManager.js`
- `Client/src/utils/validation.js`
- `database/migrations/0023_add_regional_jet_category.sql`
- `database/migrations/0024_add_turboprop_category.sql`
- `mock-server.js` (root)

### File di codice a 0 byte (segnalati, non toccati)

I file `.js` a 0 byte sopra sono file di codice, quindi **non** li elimino in una PR di sola
documentazione: li segnalo qui e li lascio per una PR di pulizia.

### Doc duplicati / ridondanti in `database/`

`database/CONFIG.md`, `database/MIGRATIONS_GUIDE.md`, `database/RESET_INSTRUCTIONS.md` e
`database/DEBUG_STATUS.md` sono 4 doc nello stesso scope che si sovrappongono
(le istruzioni di reset sono in 3 di questi file). Non li duplico in `docs/`: il rimando è
nella sezione 4. La consolidazione in un solo `database/README.md` è un lavoro per una PR
separata, perché in questa PR vale il vincolo "solo documentazione a livello root/docs".

### Incoerenze documentate (non corrette)

1. `database/RESET_INSTRUCTIONS.md` dice che `reset_database.sh` inserisce i dati da
   `initial_data.sql`; lo script cerca quel file ma il repo contiene solo
   `database/initial-database/*.sql`, caricati da `seed_initial_data.js`.
2. `database/MIGRATIONS_GUIDE.md` cita `database/migrations/0001_add_user_preferences.sql`
   come esempio; il primo file in `database/migrations/` è `0006_update_airport_size_enum.sql`.
3. `package.json` dichiara gli script `setup`, `db:setup`, `db:reset`, `db:migrate` e `db:inspect`
   verso `database/migrations.js` e `database/inspect.js`, che **non esistono** in repo.
4. `README.md` (vecchio) invita ad aprire `index.html`; il server serve `hub.html` su `/game/index.html`.
5. `PROJECT_ARCHITECTURE.md` dichiarava `Client/src/utils/MarketAnalysisAPI.js`, `AutoRouter.js`,
   `RouteCostCalculator.js` e altri file oggi assenti o con nomi diversi.
