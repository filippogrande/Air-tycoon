-- Sistema di tracking migrazioni per Air Tycoon 2
-- Deve essere eseguito PRIMA di qualsiasi migrazione

-- Tabella per tracciare migrazioni eseguite
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_number INTEGER UNIQUE NOT NULL,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER DEFAULT 0,
    rollback_sql TEXT, -- SQL per annullare la migrazione se possibile
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'rolled_back'))
);

-- Funzione per registrare esecuzione migrazione
CREATE OR REPLACE FUNCTION register_migration(
    p_migration_number INTEGER,
    p_migration_name VARCHAR(255),
    p_execution_time_ms INTEGER DEFAULT 0,
    p_rollback_sql TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO schema_migrations (migration_number, migration_name, execution_time_ms, rollback_sql)
    VALUES (p_migration_number, p_migration_name, p_execution_time_ms, p_rollback_sql)
    ON CONFLICT (migration_number) DO UPDATE SET
        executed_at = CURRENT_TIMESTAMP,
        execution_time_ms = p_execution_time_ms,
        status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Funzione per verificare se migrazione è già stata eseguita
CREATE OR REPLACE FUNCTION is_migration_completed(p_migration_number INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM schema_migrations 
        WHERE migration_number = p_migration_number 
        AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql;

-- Vista per stato migrazioni
CREATE VIEW migration_status AS
SELECT 
    migration_number,
    migration_name,
    executed_at,
    execution_time_ms,
    status,
    CASE 
        WHEN rollback_sql IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END as can_rollback
FROM schema_migrations
ORDER BY migration_number;

COMMENT ON TABLE schema_migrations IS 'Traccia le migrazioni del database eseguite';
COMMENT ON VIEW migration_status IS 'Vista del stato delle migrazioni';

-- Inserisci migrazione 000 (setup sistema)
SELECT register_migration(0, 'migration_tracker_setup', 0, NULL);
