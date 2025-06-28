# 🔧 Guida Sistema Migrazioni Air Tycoon 2

## Panoramica

Il sistema di migrazioni permette di evolvere lo schema del database in modo controllato e versionato. Le migrazioni vengono eseguite automaticamente all'avvio del server.

## Come Funziona

### 1. Esecuzione Automatica

- ✅ Le migrazioni vengono eseguite automaticamente all'avvio del server
- 📊 Viene controllato lo stato e eseguite solo quelle pendenti
- 🔒 Ogni migrazione è tracciata nella tabella `migration_history`
- ⚡ Esecuzione in transazione (rollback automatico in caso di errore)

### 2. Tracciamento

```sql
CREATE TABLE migration_history (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,    -- es: "0001"
    name VARCHAR(255) NOT NULL,              -- es: "0001_add_user_preferences.sql"
    executed_at TIMESTAMP WITH TIME ZONE,   -- quando è stata eseguita
    execution_time_ms INTEGER,              -- tempo di esecuzione
    checksum VARCHAR(64),                   -- checksum del file SQL
    status VARCHAR(20)                      -- 'completed' o 'failed'
);
```

## Comandi Disponibili

### CLI Diretto

```bash
# Stato delle migrazioni
node database/migrate.js status

# Esegui migrazioni pendenti
node database/migrate.js run

# Crea nuova migrazione
node database/migrate.js create "nome_migrazione"

# Inizializza sistema
node database/migrate.js init
```

### NPM Scripts

```bash
# Stato delle migrazioni
npm run migrate:status

# Esegui migrazioni pendenti
npm run migrate:run

# Crea nuova migrazione (richiede parametro aggiuntivo)
npm run migrate:create

# Reset completo database con sistema migrazioni
npm run db:reset-new
```

## Workflow di Sviluppo

### 1. Creare una Nuova Migrazione

```bash
# Esempio: aggiungere tabella preferenze utente
node database/migrate.js create "add_user_preferences"

# Output:
# ✅ Creata migrazione: 0001_add_user_preferences.sql
# 📝 File: database/migrations/0001_add_user_preferences.sql
# 🔧 Modifica il file e aggiungi il tuo codice SQL
```

### 2. Editare la Migrazione

Il file creato contiene un template con esempi. Sostituisci il placeholder con il tuo codice SQL:

```sql
-- ==================================================
-- INIZIO MIGRAZIONE
-- ==================================================

-- Creazione tabella preferenze utente
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(255) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Dati di default
INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT id, 'theme', 'dark' FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- ==================================================
-- FINE MIGRAZIONE
-- ==================================================
```

### 3. Testare la Migrazione

```bash
# Controlla stato prima
npm run migrate:status

# Esegui le migrazioni pendenti
npm run migrate:run

# Controlla stato dopo
npm run migrate:status
```

### 4. Deploy in Produzione

- 🚀 Le migrazioni vengono eseguite automaticamente al restart del server
- ⚠️ **IMPORTANTE**: Testare sempre prima in ambiente di sviluppo
- 📝 Le migrazioni devono essere **idempotenti** (eseguibili più volte senza problemi)

## Best Practices

### ✅ Do's

1. **Usa sempre IF NOT EXISTS**

   ```sql
   CREATE TABLE IF NOT EXISTS new_table (...);
   ALTER TABLE existing_table ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);
   ```

2. **Crea indici in modo sicuro**

   ```sql
   CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);
   ```

3. **Inserisci dati in modo sicuro**

   ```sql
   INSERT INTO table (col1, col2) VALUES ('val1', 'val2') ON CONFLICT DO NOTHING;
   ```

4. **Usa transazioni implicite**

   - Il sistema esegue ogni migrazione in una transazione
   - Rollback automatico in caso di errore

5. **Aggiungi commenti descrittivi**
   ```sql
   -- Aggiungo colonna per tracciare ultimo login utente
   ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
   ```

### ❌ Don'ts

1. **Non modificare migrazioni già eseguite**

   - Crea una nuova migrazione per correzioni

2. **Non usare DROP senza backup**

   ```sql
   -- PERICOLOSO!
   DROP TABLE old_table;

   -- MEGLIO: rinomina prima
   ALTER TABLE old_table RENAME TO old_table_backup_20250628;
   ```

3. **Non dipendere da dati esistenti senza verifiche**
   ```sql
   -- CONTROLLA PRIMA
   UPDATE users SET status = 'active' WHERE status IS NULL;
   ```

## Struttura File

```
database/
├── migrations/                 # Directory migrazioni
│   ├── 0001_add_user_preferences.sql
│   ├── 0002_update_aircraft_types.sql
│   └── 0003_add_company_stats.sql
├── migration-system.js         # Logica sistema migrazioni
├── migrate.js                  # CLI tool
├── schema_base.sql            # Schema base iniziale
├── reset_database.sh          # Reset completo
└── MIGRATIONS_GUIDE.md        # Questa guida
```

## Troubleshooting

### Migrazione Fallita

```bash
# Controlla lo stato
npm run migrate:status

# Verifica i log nel database
psql -d air_tycoon_2 -c "SELECT * FROM migration_history WHERE status = 'failed';"

# Correggi la migrazione e riprova
npm run migrate:run
```

### Reset Completo

```bash
# Se serve ripartire da zero
npm run db:reset-new

# Questo comando:
# 1. Elimina tutto lo schema
# 2. Applica schema_base.sql
# 3. Inserisce dati iniziali
# 4. Inizializza sistema migrazioni
```

### Debug

```javascript
// In server/index.js le migrazioni vengono loggate:
console.log("🔧 Controllo migrazioni pendenti...");
// ... esecuzione migrazioni ...
console.log("✅ Migrazioni completate");
```

## Esempi Comuni

### Aggiungere Colonna

```sql
-- 0001_add_user_last_login.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
```

### Creare Tabella

```sql
-- 0002_create_user_sessions.sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
```

### Migrare Dati

```sql
-- 0003_migrate_user_data.sql
-- Migrazione sicura dei dati esistenti
UPDATE users
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL AND email != LOWER(TRIM(email));

-- Aggiungi constraint dopo la pulizia
ALTER TABLE users ADD CONSTRAINT chk_users_email_format
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

---

🎯 **Il sistema è ora pronto per gestire l'evoluzione del database in modo sicuro e controllato!**
