# Database Migrations

Questa directory contiene le migrazioni per aggiornamenti futuri del database.

## Formato file migrazioni

I file devono seguire il formato: `migration_VERSIONE_FROM_to_VERSIONE_TO.sql`

Esempi:

- `migration_1.0.0_to_1.1.0.sql` - Aggiornamento dalla 1.0.0 alla 1.1.0
- `migration_1.1.0_to_1.2.0.sql` - Aggiornamento dalla 1.1.0 alla 1.2.0

## Esempio migrazione futura

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
