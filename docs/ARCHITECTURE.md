# ARCHITECTURE — Air Tycoon 2

> **Tipo: explanation.** Come funziona e perché. I fatti puntuali sono in `docs/REFERENCE.md`.

## Livelli

```
Browser (JS classico, globale su window)
   │  fetch /api/*
   ▼
server/index.js  (Express, Node)
   ├── middleware: helmet, compression, morgan, rate-limit, cors, express.json
   ├── app.use('/api/<gruppo>', router)   ← server/routes/*.js
   ├── express.static: /main-src, /game, /Client, /styles, /src, /assets
   └── database/database.js → pool pg → PostgreSQL
```

Il frontend **non** usa build step: `hub.html` carica i moduli con `<script src="/main-src/...">`
in un ordine fisso, e ogni modulo si espone su `window`. Questo è il motivo della "Regola 0"
(vedi `docs/CONVENTIONS.md`): niente `import`/`export` ES6 nei file serviti al browser,
perché non c'è nulla che li transpili.

## Avvio

1. **Sviluppo locale**: `npm run dev` → `nodemon server/index.js` → il server risponde su `:3001`.
2. **Docker**: `docker-compose.yml` avvia `db` (postgres:14, porta host 5433) e `app`.
   `docker-entrypoint.sh` attende che Postgres risponda, applica `schema_base.sql` se manca,
   esegue le migrazioni (`RUN_MIGRATIONS`), il seed (`RUN_SEED`) e infine `npm run dev`/`npm start`.
3. **Produzione**: `ecosystem.config.json` (PM2) oppure `air-tycoon.service` (systemd).
   In entrambi i casi l'entrypoint è `server/index.js`.

Il server **non** esegue le migrazioni all'avvio: il log in `server/index.js` dichiara che lo fa
`docker-entrypoint.sh`. Le migrazioni sono quindi un passaggio del container, non del runtime Node.

## Flusso di una richiesta

1. `server/index.js` monta i router sotto i prefissi `/api/*` (più `/db-viewer`, `/openapi`, `/docs`).
2. `server/routes/<file>.js` valida l'input e chiama `db.query(...)`.
3. `server/database.js` esegue la query sul pool `pg` e risolve le righe.
4. Le risposte sono JSON con la forma `{ success, data | error }`.

Errori: il gestore globale in `server/index.js` mappa i codici PostgreSQL `23xxx` (vincoli)
a `400` e il resto a `500`. Non esiste middleware di autenticazione: le rotte non verificano
la sessione lato server.

## Autenticazione

**Server-first, senza sessione lato server.** `server/routes/auth.js`:

- `POST /api/auth/register`: valida email/password (password ≥ 6 caratteri), rifiuta email duplicate,
  salva `password_hash` come SHA-256 (`crypto.createHash('sha256')`), genera `userId` con `crypto.randomUUID()`.
  Se la richiesta accetta HTML (form del browser), risponde `302` verso `/game/auth/login.html`.
- `POST /api/auth/login`: confronta `password_hash`, aggiorna `last_login`, risponde `302` a
  `/game/game/select.html` per i form oppure JSON.
- `GET /api/auth/verify`: **placeholder**, risponde sempre `success: true`. Nessun JWT è emesso o verificato,
  nonostante `jsonwebtoken` sia una dipendenza in `package.json`.

Lato client, `Client/src/utils/AuthManager.js` conserva solo una **cache** in `localStorage`
(`airTycoon_currentUser`, `airTycoon_users_cache`); non usa `localStorage` per autenticare.

## Client: routing e pagine

Il server serve `Client/pages` sotto `/game` e mappa `/game/index.html` su `hub.html`.
Il flusso utente è documentato in `docs/PAGES.md`.

Le pagine non sono una SPA con router: sono file HTML distinti. La "navigazione" è un
`window.location.href` + `sessionStorage.selectedCompanyId`.

## Database

- `database/schema_base.sql` crea lo schema completo (utenti con email come chiave, compagnie, hub,
  flotta, rotte, voli, record finanziari, eventi, sedili, eventi mondiali, cache geocoding).
- `database/migrations/NNNN_*.sql` evolvono lo schema; `MigrationSystem` le applica in transazione e le
  registra in `migration_history` (solo la parte numerica della versione).
- `database/initial-database/*.sql` contiene i dati di seed; `seed_initial_data.js` li applica solo se
  l'hash del file è cambiato (tabella `seed_history`).
- `server/database.js` espone `pool`, `query`, `transaction` e helper di costruzione SQL.
  `createCompanyWithHub` crea compagnia + hub principale in una transazione.

## Perché certe scelte

- **Nessun autenticazione lato server**: il gioco è un progetto personale/hobby; l'identità vive
  nel client e la sessione non è verificata. Conseguenza: chiunque possa scrivere su `/api/game/*`.
- **Migrazioni nel container, non nel server**: evita che N istanze applicchino migrazioni in parallelo.
- **`window` invece di moduli**: niente build step, i file sono serviti così come sono.
