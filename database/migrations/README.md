# Database Migrations - Air Tycoon 2

## Sistema di Migrazione per Server in Produzione

Le migrazioni permettono di aggiornare il database in produzione senza perdere dati esistenti.

## Struttura File

```
migrations/
├── README.md
├── migration_tracker.sql        # Sistema di tracking migrazioni
├── 001_initial_schema.sql       # Schema base originale
├── 002_add_company_types.sql    # Aggiunge tipologie compagnia (low_cost, luxury, etc.)
├── 003_simplify_staff.sql       # Semplifica gestione personale a numeri aggregati
├── 004_reintroduce_hubs.sql     # Reintroduce sistema hub senza storage
├── 005_add_hub_constraints.sql  # Aggiunge constraint rotte-hub
└── run_migrations.js           # Script automatico per migrazioni
```

## Tracking System

Il sistema traccia automaticamente quali migrazioni sono state eseguite:

```sql
-- Migration from 1.0.0 to 1.1.0
-- Aggiunge tabella statistiche avanzate

CREATE TABLE IF NOT EXISTS route_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    passenger_count INTEGER DEFAULT 0,
    revenue BIGINT DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Aggiorna versione
INSERT INTO schema_versions (version, description)
VALUES ('1.1.0', 'Aggiunta tabella statistiche rotte mensili');
```

## Come aggiungere una nuova migrazione

1. Crea il file SQL nella directory migrations/
2. Il sistema detecta automaticamente e esegue la migrazione
3. La versione viene tracciata in schema_versions
