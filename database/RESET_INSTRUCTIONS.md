# Reset Database Air Tycoon 2 - Con Sistema Migrazioni

Questo documento spiega come fare un reset completo del database con il nuovo sistema di migrazioni integrato.

## 🔧 Sistema Migrazioni Integrato

Il nuovo sistema include:

- ✅ Migrazioni automatiche all'avvio del server
- 📊 Tracciamento versioni in tabella `migration_history`
- 🔒 Esecuzione sicura in transazioni
- 📁 Migrazioni organizzate in `database/migrations/`

## Procedura di Reset e Pulizia

### 1. Sul server, vai nella directory del progetto:

```bash
cd /websites/websites/air-tycoon
```

### 2. Ferma il servizio:

```bash
pm2 stop air-tycoon-api
```

### 3. Esegui il reset del database (ora con sistema migrazioni):

```bash
bash database/reset_database.sh
```

Questo script ora:

- 🗑️ Elimina tutto lo schema esistente
- 📋 Applica lo schema base (`schema_base.sql`)
- 📊 Inserisce i dati iniziali (`initial_data.sql`)
- 🔧 **Inizializza il sistema migrazioni**

### 4. Riavvia il servizio:

```bash
pm2 restart air-tycoon-api
```

Il server ora eseguirà automaticamente tutte le migrazioni pendenti all'avvio!

## 🚀 Gestione Migrazioni in Produzione

### Controllare stato migrazioni:

```bash
npm run migrate:status
```

### Eseguire migrazioni manualmente (se necessario):

```bash
npm run migrate:run
```

### Creare nuove migrazioni:

```bash
npm run migrate:create "nome_migrazione"
# Poi editare il file creato in database/migrations/
```

### Esempio di logs all'avvio:

```
🔧 Controllo migrazioni pendenti...
📋 Trovate 1 migrazioni pendenti:
  - 0001_add_user_preferences
🔄 Eseguendo migrazione: 0001_add_user_preferences
✅ Migrazione 0001_add_user_preferences completata in 45ms
🎉 Tutte le migrazioni completate
🚀 Server Air Tycoon 2 avviato su porta 3001
```

## Cosa fa il reset

1. **Elimina** tutto lo schema pubblico del database
2. **Ricrea** lo schema vuoto
3. **Applica** lo schema base con autenticazione email corretta
4. **Inserisce** i dati iniziali (aeroporti, ecc.)

## Schema aggiornato

Il nuovo schema include:

- ✅ **Tabella `users`** con email come chiave principale
- ✅ **Tabella `companies`** collegata agli utenti
- ✅ **🆕 Tabella `migration_history`** per tracciare le migrazioni
- ✅ **Sistema di migrazioni automatiche** integrato nel server
- ✅ **Autenticazione email-based** senza username obbligatorio

## Verifica

Dopo il reset:

1. Controlla i logs: `pm2 logs air-tycoon-api`
2. Verifica endpoint: `curl http://localhost:3001/api`
3. Testa registrazione utente con solo email+password
4. **🆕 Verifica migrazioni**: `npm run migrate:status`

## Vantaggi del nuovo sistema

- ✅ **Migrazioni automatiche** - Nessun intervento manuale
- ✅ **Versionamento schema** - Tracciamento di ogni modifica
- ✅ **Rollback sicuro** - Transazioni per ogni migrazione
- ✅ **Deploy semplificato** - Solo restart del server
- ✅ **Sviluppo facilitato** - Creazione guidata migrazioni

## File aggiornati nella cartella database

```
database/
├── CONFIG.md                    # Configurazione database
├── RESET_INSTRUCTIONS.md        # Queste istruzioni
├── MIGRATIONS_GUIDE.md          # 🆕 Guida completa migrazioni
├── initial_data.sql             # Dati iniziali (aeroporti, ecc.)
├── reset_database.sh            # Script di reset (ora con migrazioni)
├── schema_base.sql              # Schema completo con autenticazione email
├── migration-system.js          # 🆕 Sistema di migrazioni
├── migrate.js                   # 🆕 CLI per migrazioni
└── migrations/                  # 🆕 Directory migrazioni
    └── 0001_add_user_preferences.sql   # Esempio migrazione
```
