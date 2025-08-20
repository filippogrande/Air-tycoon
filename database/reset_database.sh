#!/bin/bash

# Script per reset completo del database Air Tycoon 2
# Versione semplificata senza migrazioni

echo "🗑️ Reset database Air Tycoon 2..."

# Variabili database (possono essere sovrascritte da env)
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-air_tycoon}"
DB_USER="${DB_USER:-air_tycoon_user}"
DB_PORT="${DB_PORT:-5432}"

# Modalita' non interattiva: impostare YES=1 per saltare la richiesta di conferma
NON_INTERACTIVE=${YES:-0}

echo "⚠️ ATTENZIONE: Questo script eliminerà TUTTI i dati del database!"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo ""

if [ "$NON_INTERACTIVE" -ne 1 ]; then
    read -p "Sei sicuro di voler continuare? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Operazione annullata"
            exit 1
    fi
else
    echo "Modalità non interattiva: procedo con il reset"
fi

echo "🔄 Eliminazione schema esistente..."
PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

if [ $? -eq 0 ]; then
    echo "✅ Schema eliminato e ricreato"
else
    echo "❌ Errore durante reset schema"
    exit 1
fi

echo "🔄 Applicazione schema base..."
PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/schema_base.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema base applicato con successo"
else
    echo "❌ Errore durante applicazione schema"
    exit 1
fi

echo "🔄 Inserimento dati iniziali..."
if [ -f "database/initial_data.sql" ]; then
    PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/initial_data.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Dati iniziali inseriti"
    else
        echo "❌ Errore durante inserimento dati"
        exit 1
    fi
else
    echo "⚠️ File initial_data.sql non trovato, salto..."
fi

echo "🔄 Inizializzazione sistema migrazioni..."
PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        version VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        checksum VARCHAR(64),
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed'))
    );
    
    -- Modifica il campo version se esiste già
    DO \$\$
    BEGIN
        ALTER TABLE migration_history ALTER COLUMN version TYPE VARCHAR(10);
    EXCEPTION
        WHEN others THEN NULL;
    END
    \$\$;
    
    CREATE INDEX IF NOT EXISTS idx_migration_history_version ON migration_history(version);
    CREATE INDEX IF NOT EXISTS idx_migration_history_executed_at ON migration_history(executed_at);
"

if [ $? -eq 0 ]; then
    echo "✅ Sistema migrazioni inizializzato"
else
    echo "❌ Errore durante inizializzazione migrazioni"
    exit 1
fi

echo ""
echo "🎉 Reset database completato con successo!"
echo "📋 Schema con autenticazione email applicato"
echo "🔧 Sistema migrazioni inizializzato e pronto"
echo "🚀 Ora puoi riavviare il servizio: pm2 restart air-tycoon-api"
echo "📝 Per creare nuove migrazioni: node database/migrate.js create \"nome_migrazione\""
