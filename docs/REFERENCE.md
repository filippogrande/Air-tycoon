# REFERENCE — Air Tycoon 2

> **Tipo: reference.** Fatti, neutro, completo. Questa è LA MAPPA del repo:
> una riga per richiesta → file reale → simbolo reale (verificato contro il codice).
> Non mettere qui come-funziona (→ `ARCHITECTURE.md`), né regole (→ `CONVENTIONS.md`),
> né passi operativi (→ `OPERATIONS.md`).
> MAI numeri di riga: le righe si muovono, i simboli no.
> Aggiornare questo file NELLA STESSA PR che sposta qualcosa.

---

## 1. Rotte API

La mappa endpoint → file è **già esistente** in `server/openapi/index.yaml`, che fa `$ref`
verso un file YAML per gruppo. Non duplicarla qui: usarla come fonte e rinviare ad essa.

| Richiesta | File | Entry point / simbolo |
|---|---|---|
| Quali endpoint esistono, e a quale gruppo appartiene ciascuno | `server/openapi/index.yaml` | `paths` + `$ref` |
| Dettaglio di un gruppo di endpoint | `server/openapi/<gruppo>.yaml` | `paths` (stesso nome della voce in `index.yaml`) |
| Implementazione reale di un endpoint | `server/routes/<file>.js` | `router.get/post/put/delete` |
| Come il server espone i gruppi | `server/index.js` | `app.use('/api/<gruppo>', <file>Routes)` |
| Documentazione interattiva (Swagger UI) | `server/index.js` | `swaggerUi.setup(null, { swaggerUrl: '/openapi/index.yaml' })` |
| Specifiche servite staticamente | `server/index.js` | `app.use('/openapi', express.static(...))` |
| Health check del server | `server/index.js` | `app.get('/health', ...)` |
| Rotte di amministrazione database | `server/routes/admin.js` | `allowedTables` |
| Visualizzatore DB da browser | `server/routes/db-viewer.js` | `router.get('/', ...)` |

### 1.1 Tabella endpoint → file di implementazione

Estensione della mappa OpenAPI: per ogni gruppo, il file delle rotte e gli entry point reali.

| Endpoint (da `index.yaml`) | File | Simbolo |
|---|---|---|
| `/api/game/*` | `server/routes/game.js` | `router.get('/companies')`, `router.post('/companies/create-or-update')`, `router.delete('/companies/:id')`, `router.get('/aircraft-data')` |
| `/api/auth/*` | `server/routes/auth.js` | `router.post('/register')`, `router.post('/login')`, `router.get('/verify')` |
| `/api/airports/*` | `server/routes/airports.js` | `router.get('/')`, `router.get('/countries')`, `router.get('/near/:lat/:lng')` |
| `/api/admin/*` | `server/routes/admin.js` | `router.get('/tables')`, `router.get('/stats')`, `router.get('/schema/:tableName')` |
| `/api/finance/*` | `server/routes/finance.js` | `router.get('/summary/:company_id')`, `router.post('/transaction')`, `router.get('/cash-flow/:company_id')` |
| `/api/fleet/*` | `server/routes/fleet.js` | `router.get('/available')`, `router.post('/purchase')`, `router.get('/generate-registration/:company_id')` |
| `/api/routes/*` | `server/routes/routes.js` | `router.post('/')`, `router.post('/:id/schedule')`, `router.post('/countries_count')`, `router.post('/flight_time_range')` |
| `/api/routes/market-analysis/*`, `/api/routes/demand-improvements/*` | `server/routes/market-analysis.js` | `router.get('/market-analysis/:origin/:destination')`, `router.post('/demand-improvements')` |

> ⚠️ **Limiti noti (solo documentazione, non correggere in questa PR):**
> - `index.yaml` non dichiara `/api/fleet/available`, `/api/fleet/generate-registration/:company_id`,
>   `/api/routes/geocoding_cache` e `/api/routes/flight_time_range`, che esistono in codice.
> - `index.yaml` dichiara `/api/market-analysis` come prefisso, ma `server/index.js` monta il router su `/api/routes`.
> - `market-analysis.js` è un file solo-`require` senza controlli di autenticazione.

---

## 2. Moduli del server

| Richiesta | File | Entry point / simbolo |
|---|---|---|
| Dove il server si avvia e monta tutto | `server/index.js` | `app.listen`, `db.testConnection()` |
| Pool connessioni e helper SQL | `server/database.js` | `pool`, `query`, `transaction`, `buildSelectQuery` |
| Creare compagnia + hub principale in una transazione | `server/database.js` | `createCompanyWithHub` |
| Motore delle migrazioni | `database/migration-system.js` | `class MigrationSystem`, `runPendingMigrations`, `executeMigration` |
| CLI delle migrazioni | `database/migrate.js` | `case 'status'`, `case 'run'`, `case 'create'` |
| Reset completo DB (schema + seed + migrazioni) | `database/reset_database.sh` | `DROP SCHEMA public CASCADE` |
| Seed dei dati iniziali | `database/seed_initial_data.js` | `main()`, `runSqlFile` |
| Stato del DB e delle migrazioni | `database/check-status.js` | `checkDatabaseStatus` |
| Variabili d'ambiente attese | `.env.example` | `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_POOL_MIN/MAX`, `PORT`, `JWT_SECRET`, `CORS_ORIGIN` |
| Dipendenze e script npm | `package.json` | `scripts` |

