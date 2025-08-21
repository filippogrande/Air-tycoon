# Documentazione Architettura Air Tycoon 2 Clone

## 📁 Struttura del Progetto

### 🏗️ File di Configurazione Root

- **`package.json`** - Dipendenze Node.js e script npm
- **`docker-compose.yml`** - Configurazione container Docker (app + database)
- **`Dockerfile`** - Immagine Docker per l'applicazione
- **`.env`** - Variabili d'ambiente (database, configurazioni)
- **`ecosystem.config.json`** - Configurazione PM2 per production
- **`air-tycoon.service`** - Service file per systemd
- **`docker-entrypoint.sh`** - Script di avvio container

---

## 🗄️ Database (`database/`)

### File Principali

- **`schema_base.sql`** - Schema base del database
- **`migrate.js`** - Sistema di migrazione automatica
- **`migration-system.js`** - Core del sistema migrazioni
- **`seed_initial_data.js`** - Caricamento dati iniziali
- **`check-status.js`** - Controllo stato database

### Dati Iniziali (`initial-database/`)

- **`users.sql`** - Utenti di test e admin
- **`companies.sql`** - Compagnie aeree disponibili
- **`airports.sql`** - Aeroporti mondiali con coordinate
- **`aircraft_types.sql`** - Tipi di aeromobili (Boeing, Airbus, etc.)
- **`aircraft_configurations.sql`** - Configurazioni cabina
- **`seat_models.sql`** - Modelli di sedili disponibili
- **`routes.sql`** - Rotte predefinite
- **`fleet.sql`** - Flotte delle compagnie
- **`financial_reports.sql`** - Report finanziari
- **`world_events.sql`** - Eventi globali del gioco

### Migrazioni (`migrations/`)

Sistema incrementale di aggiornamento schema:

- **`0001-0021`** - 21 migrazioni per evoluzione schema
- Gestisce: user preferences, constraints, cascading deletes, geocoding cache

---

## 🖥️ Server (`server/`)

### Core Backend

- **`index.js`** - Server Express principale, routing, middleware
- **`database.js`** - Connessione PostgreSQL, query helper

### API Routes (`routes/`)

- **`auth.js`** - Autenticazione utenti (login, register, sessioni)
- **`game.js`** - Dati di gioco (aircraft data, stato partite)
- **`airports.js`** - CRUD aeroporti, ricerca, geocoding
- **`fleet.js`** - Gestione flotte compagnie
- **`routes.js`** - Gestione rotte aeree
- **`finance.js`** - Gestione economica e report
- **`market-analysis.js`** - Analisi domanda mercato
- **`admin.js`** - Funzioni amministrative
- **`db-viewer.js`** - Viewer database per debug

### Documentazione API (`openapi/`)

Specifiche OpenAPI 3.0 per ogni endpoint:

- **`auth.yaml`** - Endpoints autenticazione
- **`game.yaml`** - Endpoints dati gioco
- **`airports.yaml`** - Endpoints aeroporti
- **`fleet.yaml`** - Endpoints flotte
- **`routes.yaml`** - Endpoints rotte
- **`finance.yaml`** - Endpoints finanza
- **`marketanalysis.yaml`** - Endpoints analisi mercato

---

## 🎮 Client Frontend (`Client/`)

### 📄 Pagine HTML (`pages/`)

#### Pagine Principali

- **`hub.html`** - Interfaccia principale di gioco (mappa, gestione)
- **`auth/login.html`** - Pagina di login
- **`game/select.html`** - Selezione compagnia/nuova partita

#### Template (`templates/`)

- **`finances-tab.html`** - Tab gestione finanze
- **`research-tab.html`** - Tab ricerca e sviluppo
- **`route-panels.html`** - Pannelli creazione rotte

#### Modali (`modals/`)

- **`aircraft-modal.html`** - Acquisto aeromobili
- **`route-modal.html`** - Creazione/modifica rotte
- **`game-menu-modal.html`** - Menu di gioco (salva/carica)
- **`settings-overlay.html`** - Impostazioni gioco
- **`new-game-modal.html`** - Creazione nuova partita
- **`select-hub-modal.html`** - Selezione hub principale

### 🎨 Stili CSS (`styles/`)

- **`main.css`** - Stili principali gioco
- **`ui.css`** - Componenti UI (modali, form, bottoni)
- **`auth.css`** - Stili pagine autenticazione
- **`game-select.css`** - Stili selezione gioco

### 🖼️ Assets (`assets/`)

- **`aircraft/`** - Immagini aeromobili (Boeing, Airbus, Embraer, etc.)
- **`logo.svg`** - Logo dell'applicazione

---

## 💻 JavaScript Frontend (`Client/src/`)

### 🎯 Core Sistema (`core/`)

- **`Game.js`** - Classe principale gioco, orchestrazione
- **`GameState.js`** - Stato globale partita (data, tempo, economia)

### 🏢 Entità di Business (`entities/`)

- **`Aircraft.js`** - Classe aeromobile (tipo, configurazione, stato)
- **`Airport.js`** - Classe aeroporto (dati, servizi, connessioni)
- **`Route.js`** - Classe rotta aerea (origine, destinazione, servizi)

### 👔 Manager di Sistema (`managers/`)

- **`FleetManager.js`** - Gestione flotta aziendale
- **`RouteManager.js`** - Gestione rotte operative
- **`FinanceManager.js`** - Gestione economica e cash flow
- **`HubManager.js`** - Gestione hub principali compagnia
- **`DemandEstimationManager.js`** - Stima domanda passeggeri
- **`InfrastructureManager.js`** - Gestione infrastrutture

### 🎨 Interfaccia Utente (`ui/`)

#### Manager UI Principali

- **`UIManager.js`** - Coordinatore interfaccia generale
- **`RouteUIManager.js`** - Sistema modulare gestione rotte (principale)
- **`RouteUIManager_BACKUP.js`** - Backup versione originale
- **`RouteUIManager_NEW.js`** - Nuova versione refactor

#### Moduli Specializzati (Sistema Modulare Rotte)

- **`modules/RouteStateManager.js`** - Gestione stato creazione rotta
- **`modules/RoutePanelManager.js`** - Gestione pannelli UI
- **`modules/RouteAircraftManager.js`** - Selezione aeromobili per rotta
- **`modules/RouteDemandAnalysisManager.js`** - Analisi domanda rotta
- **`modules/RouteMarketAnalysisManager.js`** - Analisi mercato rotta
- **`modules/RouteCreationManager.js`** - Creazione finale rotta
- **`modules/RouteCalculationUtils.js`** - Utility calcoli rotta
- **`modules/RouteEventManager.js`** - Gestione eventi UI rotta

#### Tab e Componenti

- **`WorldTab.js`** - Tab mappa mondiale
- **`FleetTab.js`** - Tab gestione flotta
- **`RoutesTab.js`** - Tab visualizzazione rotte
- **`FinancesTab.js`** - Tab gestione finanziaria
- **`ResearchTab.js`** - Tab ricerca e sviluppo
- **`SettingsOverlay.js`** - Overlay impostazioni
- **`gameMenuEvents.js`** - Eventi menu di gioco

#### Eventi e Interazioni

- **`uiEvents.js`** - Eventi generali UI
- **`globalEvents.js`** - Eventi globali applicazione

### 🌍 Grafica e Visualizzazione (`graphics/`)

- **`WorldMap.js`** - Mappa mondiale interattiva (Leaflet)

### 🔧 Utility (`utils/`)

#### Gestione Dati

- **`APIClient.js`** - Client per chiamate API
- **`DataLoader.js`** - Caricamento dati da server
- **`AuthManager.js`** - Gestione autenticazione client
- **`SessionStateManager.js`** - Persistenza stato sessione
- **`AutoRouter.js`** - Routing automatico pagine
- **`SaveLoad.js`** - Salvataggio/caricamento partite

#### Logica Business

- **`RouteCalculator.js`** - Calcoli rotte (distanza, tempo, costi)
- **`RouteCostCalculator.js`** - Calcoli costi specifici rotte
- **`MarketAnalysisAPI.js`** - API analisi mercato
- **`MapVisibilityManager.js`** - Gestione visibilità mappa
- **`gameUtils.js`** - Utility generiche gioco
- **`validation.js`** - Validazione dati input

### 🔄 Simulazione (`simulation/`)

- **`EconomyEngine.js`** - Motore economico (prezzi, inflazione)
- **`WeatherEngine.js`** - Sistema metereologico

### 📄 Pagine e Script

- **`main.js`** - Inizializzazione principale applicazione
- **`auth.js`** - Logica pagine autenticazione
- **`game-select.js`** - Logica selezione gioco
- **`load-game.js`** - Utility caricamento partita
- **`pages/hubPage.js`** - Logica pagina hub
- **`pages/selectPage.js`** - Logica selezione compagnia
- **`pages/selectGamePage.js`** - Logica selezione tipo partita

---

## 🔀 File Legacy/Backup (Root `src/`)

**Nota**: Duplicati delle versioni Client per compatibilità:

- Contiene le stesse classi e manager ma versioni precedenti
- Mantiene compatibilità con server durante transizione
- Da rimuovere una volta completata migrazione

---

## 🛠️ File di Debug e Test

### Debug Tools

- **`debug-game.html`** - Debug stato oggetti gioco
- **`debug-init.html`** - Debug inizializzazione sistema
- **`test_route_ui.html`** - Test interfaccia rotte
- **`test_safe_route.html`** - Test sicurezza rotte
- **`db-viewer.html`** - Viewer database web

### Documentazione

- **`README.md`** - Documentazione principale progetto
- **`MODULARIZATION_SUMMARY.md`** - Riepilogo modularizzazione
- **`MODULARIZATION_TEST_STATUS.md`** - Stato test modularizzazione
- **`database/CONFIG.md`** - Configurazione database
- **`database/DEBUG_STATUS.md`** - Stato debug database
- **`database/MIGRATIONS_GUIDE.md`** - Guida migrazioni
- **`database/RESET_INSTRUCTIONS.md`** - Istruzioni reset database

---

## 🔄 Flusso Architetturale

### 1. **Avvio Sistema**

```
docker-compose.yml → Dockerfile → docker-entrypoint.sh
→ server/index.js → database.js → PostgreSQL
```

### 2. **Inizializzazione Database**

```
migrate.js → migrations/*.sql → initial-database/*.sql
→ seed_initial_data.js → Database pronto
```

### 3. **Caricamento Frontend**

```
Client/pages/hub.html → main.js → core/Game.js
→ managers/*.js → ui/UIManager.js → Sistema pronto
```

### 4. **Creazione Rotta (Sistema Modulare)**

```
WorldMap.js → RouteUIManager.js → modules/RouteStateManager.js
→ modules/RoutePanelManager.js → modules/RouteAircraftManager.js
→ modules/RouteCreationManager.js → API call → Database
```

---

## 🎯 Punti di Forza Architettura

### ✅ **Modularità**

- Sistema modulare per gestione rotte (8 moduli specializzati)
- Separazione chiara responsabilità (Manager pattern)
- API RESTful ben documentata

### ✅ **Scalabilità**

- Database PostgreSQL con sistema migrazioni
- Container Docker per deployment
- Sistema di gestione stato centralizzato

### ✅ **Manutenibilità**

- Codice separato per dominio (entities, managers, ui)
- Sistema di debug integrato
- Documentazione OpenAPI completa

---

## ⚠️ Aree di Miglioramento Identificate

### 🔴 **Problemi Attivi**

- Conflitti export/import tra moduli ES6 e script globali
- Duplicazione codice tra Client/ e src/ root
- Game object non si inizializza correttamente
- Dipendenze circolari in alcuni moduli UI

### 🟡 **Refactor Necessari**

- Eliminare duplicazione Client/src e consolidare su Client/
- Convertire tutti moduli a standard consistente (ES6 o globale)
- Semplificare catena inizializzazione main.js
- Unificare sistema gestione errori

### 🟢 **Ottimizzazioni Future**

- Implementare lazy loading per moduli UI non critici
- Aggiungere system test automatici
- Implementare caching intelligente dati API
- Migliorare UX con loading states e feedback utente

---

## 📊 Statistiche Codebase

- **File totali**: ~438
- **Linee di codice stimate**: ~50.000+
- **Moduli JavaScript**: ~80
- **Endpoint API**: ~30
- **Tabelle database**: ~15
- **Migrazioni**: 21
- **Componenti UI**: ~12 tab/modali principali
