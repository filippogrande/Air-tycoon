# 🚨 Debugging Errore 500 Registrazione

## Problema Attuale

- ❌ Errore 500 durante la registrazione utente
- 🔍 Probabile causa: schema database non inizializzato

## Stato Sistema di Migrazioni ✅

Il sistema di migrazioni è ora completamente implementato:

- ✅ **Sistema automatico**: Le migrazioni vengono eseguite all'avvio del server
- ✅ **Gestione errori migliorata**: Diagnostics dettagliati per il debugging
- ✅ **Verifica schema base**: Controlla se le tabelle base esistono
- ✅ **CLI completo**: Comandi per gestire le migrazioni
- ✅ **Documentazione**: Guide complete per l'uso

## Azioni Immediate Richieste

### 1. Verifica Stato Database (sul server)

```bash
npm run db:status
```

### 2. Se Database Non Inizializzato

```bash
bash database/reset_database.sh
```

### 3. Riavvia Server

```bash
pm2 restart air-tycoon-api
```

### 4. Verifica Logs

```bash
pm2 logs air-tycoon-api
```

## Possibili Cause Errore 500

1. **Schema base mancante** (più probabile)

   - Tabelle `users`, `companies` non esistono
   - Reset database mai eseguito

2. **Sistema migrazioni non funziona**

   - Errore durante `createMigrationTable()`
   - Permessi database insufficienti

3. **Errore di connessione database**
   - Credenziali errate
   - PostgreSQL non in esecuzione

## Diagnostics Implementati

### Server Logs Migliorati

```
🔧 Controllo migrazioni pendenti...
🔧 Inizializzazione sistema migrazioni...
✅ Tabella migration_history creata/verificata
⚠️ Schema base non trovato!
📋 Esegui prima: bash database/reset_database.sh
❌ Errore durante migrazioni: Schema base mancante...
```

### Route Auth con Diagnostics

```
❌ Errore registrazione utente: [dettagli]
📋 Dettagli errore: {code: "42P01", message: "relation users does not exist"}
```

## File Creati/Modificati

### Sistema Migrazioni

- ✅ `database/migration-system.js` - Sistema completo
- ✅ `database/migrate.js` - CLI tool
- ✅ `database/migrations/0001_add_user_preferences.sql` - Esempio
- ✅ `database/MIGRATIONS_GUIDE.md` - Documentazione completa

### Utilities

- ✅ `database/check-status.js` - Verifica stato database
- ✅ `database/test-migrations.js` - Test locale sistema

### Scripts

- ✅ `database/reset_database.sh` - Reset con migrazioni
- ✅ Aggiornati npm scripts in `package.json`

### Server Integration

- ✅ `server/index.js` - Migrazioni automatiche all'avvio
- ✅ `server/routes/auth.js` - Diagnostics errori migliorati

# 🚨 Fix Errore Migrazioni - COMPLETATO ✅

## Problema Risolto

- ❌ **Errore**: `value too long for type character varying(20)`
- ✅ **Soluzione**: Campo `version` modificato da VARCHAR(20) a VARCHAR(10)
- ✅ **Logica**: Ora salviamo solo "0001" invece di "0001_add_user_preferences"

## Modifiche Applicate

### 1. Database Schema

- Campo `migration_history.version` ora VARCHAR(10)
- Reset database aggiorna automaticamente la struttura

### 2. Sistema Migrazioni

- `executeMigration()` ora estrae solo la parte numerica
- `runPendingMigrations()` confronta correttamente le versioni
- Gestione errori migliorata

### 3. Script Riavvio

- Nuovo script `restart-server.sh` per riavvio pulito
- Gestisce il problema "address already in use"

## Istruzioni per Fix Immediato

Sul server, esegui in sequenza:

```bash
# 1. Ferma completamente il server
pm2 stop air-tycoon-api
pm2 delete air-tycoon-api

# 2. Reset database con fix
bash database/reset_database.sh

# 3. Riavvia server
pm2 start ecosystem.config.json

# 4. Verifica funzionamento
pm2 logs air-tycoon-api
```

## Test di Verifica

Dopo il riavvio, dovresti vedere nei logs:

```
✅ Sistema migrazioni inizializzato
📋 Trovate 1 migrazioni pendenti:
  - 0001_add_user_preferences
🔄 Eseguendo migrazione: 0001_add_user_preferences
✅ Migrazione 0001_add_user_preferences completata
🎉 Tutte le migrazioni completate
🚀 Server Air Tycoon 2 avviato su porta 3001
```

## Prossimi Passi

1. **Sul server, esegui diagnostics**:

   ```bash
   npm run db:status
   ```

2. **Se schema mancante, reset database**:

   ```bash
   bash database/reset_database.sh
   ```

3. **Riavvia e verifica**:

   ```bash
   pm2 restart air-tycoon-api
   pm2 logs air-tycoon-api
   ```

4. **Test registrazione**:
   - Prova a registrare un nuovo utente
   - Verifica logs per migrazioni automatiche

## Il Sistema è Pronto! 🎯

Una volta risolto l'errore 500 con il reset del database, avrai:

- ✅ **Migrazioni automatiche** - Zero intervento manuale
- ✅ **Versionamento schema** - Evoluzione controllata
- ✅ **Diagnostics completi** - Debug facilitato
- ✅ **CLI potente** - Gestione semplificata
- ✅ **Documentazione completa** - Guide per tutto
