# OPERATIONS — Air Tycoon 2

> **Tipo: how-to.** Passi per un obiettivo: avvio, DB, deploy, comandi.
> Lo stato dei fatti → `docs/REFERENCE.md`; le regole → `docs/CONVENTIONS.md`.

## Prerequisiti

- Node.js ≥ 16 e npm
- PostgreSQL ≥ 12
- (in container) `postgresql-client`, installato dal `Dockerfile`

## Configurazione iniziale

```bash
npm install
cp .env.example .env      # inserire le credenziali PostgreSQL
```

Variabili attese (da `.env.example`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
`DB_POOL_MIN`, `DB_POOL_MAX`, `NODE_ENV`, `PORT` (default `3001`), `CORS_ORIGIN`,
`JWT_SECRET`, `SESSION_SECRET`, `LOG_LEVEL`.

> ⚠️ `package.json` dichiara `npm run setup` / `db:setup` / `db:reset` / `db:migrate` verso
> `database/migrations.js`, che **non esiste**. Il setup reale è descritto sotto.

## Creare il database da zero

```bash
# 1. Reset completo: drop schema -> schema_base.sql -> seed -> migration_history
bash database/reset_database.sh

# 2. Avvio (in container il flusso è automatico; in locale:)
npm run dev
```

Il reset è interattivo: chiede conferma. Per non interattivo, `YES=1 bash database/reset_database.sh`.

## Avvio

```bash
npm run dev        # sviluppo con auto-restart (nodemon) -> http://localhost:3001
npm start          # produzione
```

Aprire `http://localhost:3001/` (redirect a `/game/index.html`) oppure `/game/index.html` direttamente.

Health check: `curl http://localhost:3001/health` → `{ status, timestamp, version }`.
Documentazione API: `http://localhost:3001/docs`.

## Docker

```bash
docker compose up --build
```

- `db`: `postgres:14`, porta host `5433` → container `5432`.
- `app`: build da `Dockerfile`, porta host `3001` (e `3002`) → `3001`.
- `docker-entrypoint.sh`: attende Postgres, applica `schema_base.sql` se manca, esegue
  migrazioni (`RUN_MIGRATIONS`, default `1`), seed (`RUN_SEED`, default `1`), poi avvia il server.
- Il volume `./:/usr/src/app` monta il codice in modo che le modifiche si vedano senza rebuild.

## Migrazioni

```bash
npm run migrate:status   # stato (eseguite / pendenti)
npm run migrate:run      # esegue le pendenti
node database/migrate.js create "nome_migrazione"   # genera NNNN_nome_migrazione.sql
```

Le migrazioni sono applicate dal container all'avvio (non da `server/index.js`).
Regole: idempotenti, mai modificate dopo l'esecuzione (vedi `docs/CONVENTIONS.md`).
Guida completa: `database/MIGRATIONS_GUIDE.md`.

## Stato e diagnostica del DB

```bash
npm run db:status       # tabelle, utenti, migrazioni eseguite
```

`database/check-status.js` verifica connessione, presenza di `users`/`companies`/`migration_history`,
colonne di `users` e stato delle migrazioni. In caso di errore suggerisce
`bash database/reset_database.sh`.

## Produzione

**PM2** (vedi `ecosystem.config.json`, `apps[0]` → `server/index.js`, cwd `/websites/websites/air-tycoon`):

```bash
npm run start:pm2
npm run logs:pm2
npm run restart:pm2
```

**systemd** (vedi `air-tycoon.service`, `ExecStart=/usr/bin/node server/index.js`,
`WorkingDirectory=/websites/websites/air-tycoon`):

```bash
sudo systemctl restart air-tycoon
sudo journalctl -u air-tycoon -f
```

> I path in `ecosystem.config.json` e `air-tycoon.service` sono hardcoded su
> `/websites/websites/air-tycoon`: in un altro ambiente vanno adattati.

## Comandi npm (da `package.json`)

| Script | Cosa fa |
|---|---|
| `dev` | `nodemon server/index.js` |
| `start` | `node server/index.js` |
| `start:bg` | avvio in background con log su file |
| `start:pm2` / `stop:pm2` / `restart:pm2` / `reload:pm2` / `delete:pm2` | gestione PM2 |
| `logs` / `logs:pm2` / `monit:pm2` | log |
| `migrate:status` / `migrate:run` / `migrate:create` / `migrate:init` | migrazioni |
| `db:status` | stato DB |
| `db:reset-new` | `bash database/reset_database.sh` |
| `test` | `jest` |
| `lint` | `eslint server/` |
| `setup` / `db:setup` / `db:reset` / `db:migrate` / `db:inspect` | **rotti**: puntano a file assenti |

## Dipendenze

`.github/dependabot.yml` copre `npm`, `docker` e `docker-compose` in `/`, con schedule settimanale
(lunedì 06:00 Europe/Rome) e raggruppamento di minor+patch. Il file è operativo solo sul branch
di default: va mergiato per attivarsi.

## Risoluzione problemi

| Sintomo | Causa probabile | Azione |
|---|---|---|
| `500` alla registrazione, errore `relation users does not exist` | schema base non applicato | `bash database/reset_database.sh` e riavvio |
| `❌ Errore connessione database` all'avvio | Postgres non raggiungibile / credenziali errate | verificare `.env` e che Postgres sia up |
| Migrazione fallita con `value too long for type character varying(20)` | versione salvata con nome completo invece del numero | già risolto in `MigrationSystem` (usa solo `NNNN`) |
| `address already in use` | istanza precedente non terminata | `pm2 stop` / `pm2 delete` e riavvio |
| Richieste `/stc/...` nei log | typo nei path client | il server logga il referer per diagnostica |
