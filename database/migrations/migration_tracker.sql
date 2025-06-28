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

-- Funzione per verificare integrità database post-migrazione
CREATE OR REPLACE FUNCTION verify_database_integrity()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verifica esistenza tabelle critiche
    RETURN QUERY
    SELECT 
        'critical_tables'::TEXT,
        CASE WHEN COUNT(*) = 8 THEN 'OK' ELSE 'FAIL' END::TEXT,
        format('Found %s/8 critical tables', COUNT(*))::TEXT
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('companies', 'airports', 'routes', 'flights', 'fleet', 'company_hubs', 'staff_totals', 'schema_migrations');
    
    -- Verifica constraint chiave
    RETURN QUERY
    SELECT 
        'foreign_key_constraints'::TEXT,
        CASE WHEN COUNT(*) >= 10 THEN 'OK' ELSE 'WARN' END::TEXT,
        format('Found %s foreign key constraints', COUNT(*))::TEXT
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY';
    
    -- Verifica trigger attivi
    RETURN QUERY
    SELECT 
        'active_triggers'::TEXT,
        CASE WHEN COUNT(*) >= 5 THEN 'OK' ELSE 'WARN' END::TEXT,
        format('Found %s active triggers', COUNT(*))::TEXT
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    -- Verifica funzioni critiche
    RETURN QUERY
    SELECT 
        'critical_functions'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'OK' ELSE 'FAIL' END::TEXT,
        format('Found %s/3+ critical functions', COUNT(*))::TEXT
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('update_updated_at_column', 'check_route_has_hub', 'register_migration');
    
    -- Verifica indici per performance
    RETURN QUERY
    SELECT 
        'performance_indexes'::TEXT,
        CASE WHEN COUNT(*) >= 15 THEN 'OK' ELSE 'WARN' END::TEXT,
        format('Found %s performance indexes', COUNT(*))::TEXT
    FROM pg_indexes 
    WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- Funzione per eseguire test di integrità specifici
CREATE OR REPLACE FUNCTION run_migration_tests()
RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    message TEXT
) AS $$
BEGIN
    -- Test 1: Verifica che ogni compagnia possa avere almeno un hub
    RETURN QUERY
    WITH test_result AS (
        SELECT 
            CASE WHEN EXISTS(
                SELECT 1 FROM companies c 
                LEFT JOIN company_hubs ch ON c.id = ch.company_id 
                WHERE ch.id IS NULL
            ) THEN false ELSE true END as passed
    )
    SELECT 
        'companies_can_have_hubs'::TEXT,
        tr.passed,
        CASE WHEN tr.passed THEN 'All companies can have hubs' 
             ELSE 'Some companies cannot have hubs' END::TEXT
    FROM test_result tr;
    
    -- Test 2: Verifica constraint rotte-hub (se applicabile)
    RETURN QUERY
    WITH test_result AS (
        SELECT 
            CASE WHEN EXISTS(
                SELECT 1 FROM information_schema.triggers 
                WHERE trigger_name = 'check_route_hub_trigger'
            ) THEN true ELSE false END as passed
    )
    SELECT 
        'route_hub_constraint'::TEXT,
        tr.passed,
        CASE WHEN tr.passed THEN 'Route-hub constraint active' 
             ELSE 'Route-hub constraint missing' END::TEXT
    FROM test_result tr;
    
    -- Test 3: Verifica che non ci siano dati orfani
    RETURN QUERY
    WITH test_result AS (
        SELECT 
            CASE WHEN NOT EXISTS(
                SELECT 1 FROM fleet f 
                LEFT JOIN companies c ON f.company_id = c.id 
                WHERE c.id IS NULL
            ) THEN true ELSE false END as passed
    )
    SELECT 
        'no_orphaned_fleet'::TEXT,
        tr.passed,
        CASE WHEN tr.passed THEN 'No orphaned fleet records' 
             ELSE 'Found orphaned fleet records' END::TEXT
    FROM test_result tr;
    
    -- Test 4: Verifica aggiornamento timestamp automatico
    RETURN QUERY
    WITH test_result AS (
        SELECT 
            CASE WHEN EXISTS(
                SELECT 1 FROM information_schema.triggers 
                WHERE trigger_name LIKE '%updated_at%'
            ) THEN true ELSE false END as passed
    )
    SELECT 
        'timestamp_triggers'::TEXT,
        tr.passed,
        CASE WHEN tr.passed THEN 'Timestamp triggers active' 
             ELSE 'Timestamp triggers missing' END::TEXT
    FROM test_result tr;
END;
$$ LANGUAGE plpgsql;

-- Funzione per creare checkpoint di sicurezza
CREATE OR REPLACE FUNCTION create_safety_checkpoint(checkpoint_name TEXT)
RETURNS TEXT AS $$
DECLARE
    checkpoint_id TEXT;
    table_count INTEGER;
    total_rows BIGINT;
BEGIN
    checkpoint_id := format('checkpoint_%s_%s', checkpoint_name, extract(epoch from now())::bigint);
    
    -- Conta tabelle e righe per verifica integrità
    SELECT COUNT(*), COALESCE(SUM(n_tup_ins + n_tup_upd), 0)
    INTO table_count, total_rows
    FROM pg_stat_user_tables;
    
    -- Registra checkpoint
    INSERT INTO schema_migrations (
        migration_number, 
        migration_name, 
        status, 
        rollback_sql
    ) VALUES (
        -1, -- Numero speciale per checkpoint
        checkpoint_id,
        'completed',
        format('-- Checkpoint: %s tables, %s total rows', table_count, total_rows)
    );
    
    RETURN checkpoint_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE schema_migrations IS 'Traccia le migrazioni del database eseguite';
COMMENT ON VIEW migration_status IS 'Vista del stato delle migrazioni';
COMMENT ON FUNCTION verify_database_integrity() IS 'Verifica integrità struttura database';
COMMENT ON FUNCTION run_migration_tests() IS 'Esegue test funzionali post-migrazione';
COMMENT ON FUNCTION create_safety_checkpoint(TEXT) IS 'Crea checkpoint di sicurezza per rollback';

-- Inserisci migrazione 000 (setup sistema)
SELECT register_migration(0, 'migration_tracker_setup', 0, NULL);
