-- Migrazione 006: Esempio di migrazione sicura con verifica completa
-- Aggiunge tabella per tracking KPI performance

DO $$
DECLARE
    start_time TIMESTAMP;
    checkpoint_id TEXT;
    verification_passed BOOLEAN := false;
BEGIN
    -- Registra tempo inizio
    start_time := CURRENT_TIMESTAMP;
    
    -- Esci se migrazione già completata
    IF is_migration_completed(6) THEN
        RAISE NOTICE 'Migrazione 006 già completata, skip.';
        RETURN;
    END IF;

    RAISE NOTICE 'Inizio migrazione 006: Tabella KPI Performance';
    
    -- Crea checkpoint di sicurezza
    checkpoint_id := create_safety_checkpoint('pre_migration_006');
    RAISE NOTICE 'Checkpoint creato: %', checkpoint_id;
    
    -- =====================================
    -- MIGRAZIONE VERA E PROPRIA
    -- =====================================
    
    -- Crea tabella KPI se non esiste
    CREATE TABLE IF NOT EXISTS company_kpis (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_flights INTEGER DEFAULT 0,
        total_passengers BIGINT DEFAULT 0,
        total_revenue BIGINT DEFAULT 0, -- In centesimi
        total_costs BIGINT DEFAULT 0,
        average_load_factor DECIMAL(5,2) DEFAULT 0,
        on_time_performance DECIMAL(5,2) DEFAULT 0,
        customer_satisfaction INTEGER DEFAULT 50,
        market_share DECIMAL(5,2) DEFAULT 0,
        profit_margin DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(company_id, period_start, period_end)
    );
    
    -- Aggiungi indici per performance
    CREATE INDEX IF NOT EXISTS idx_company_kpis_company_period 
        ON company_kpis(company_id, period_start, period_end);
    CREATE INDEX IF NOT EXISTS idx_company_kpis_period 
        ON company_kpis(period_start, period_end);
        
    -- Aggiungi trigger per updated_at
    CREATE TRIGGER update_company_kpis_updated_at 
        BEFORE UPDATE ON company_kpis
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    -- Funzione per calcolare KPI automaticamente
    CREATE OR REPLACE FUNCTION calculate_company_kpis(
        p_company_id UUID,
        p_start_date DATE,
        p_end_date DATE
    )
    RETURNS VOID AS $func$
    DECLARE
        kpi_data RECORD;
    BEGIN
        -- Calcola KPI dal database
        SELECT 
            COUNT(f.id) as flights,
            COALESCE(SUM(f.total_passengers), 0) as passengers,
            COALESCE(SUM(f.total_revenue), 0) as revenue,
            COALESCE(SUM(f.total_costs), 0) as costs,
            COALESCE(AVG(f.load_factor), 0) as load_factor,
            COALESCE(AVG(CASE WHEN f.delay_minutes <= 15 THEN 100 ELSE 0 END), 0) as on_time,
            COALESCE(AVG(f.customer_satisfaction), 50) as satisfaction
        INTO kpi_data
        FROM flights f
        JOIN routes r ON f.route_id = r.id
        WHERE r.company_id = p_company_id
        AND f.departure_time::date BETWEEN p_start_date AND p_end_date
        AND f.status = 'completed';
        
        -- Inserisci o aggiorna KPI
        INSERT INTO company_kpis (
            company_id, period_start, period_end,
            total_flights, total_passengers, total_revenue, total_costs,
            average_load_factor, on_time_performance, customer_satisfaction,
            profit_margin
        ) VALUES (
            p_company_id, p_start_date, p_end_date,
            kpi_data.flights, kpi_data.passengers, kpi_data.revenue, kpi_data.costs,
            kpi_data.load_factor, kpi_data.on_time, kpi_data.satisfaction,
            CASE WHEN kpi_data.revenue > 0 
                THEN ((kpi_data.revenue - kpi_data.costs)::DECIMAL / kpi_data.revenue) * 100 
                ELSE 0 END
        )
        ON CONFLICT (company_id, period_start, period_end) DO UPDATE SET
            total_flights = EXCLUDED.total_flights,
            total_passengers = EXCLUDED.total_passengers,
            total_revenue = EXCLUDED.total_revenue,
            total_costs = EXCLUDED.total_costs,
            average_load_factor = EXCLUDED.average_load_factor,
            on_time_performance = EXCLUDED.on_time_performance,
            customer_satisfaction = EXCLUDED.customer_satisfaction,
            profit_margin = EXCLUDED.profit_margin,
            updated_at = CURRENT_TIMESTAMP;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- =====================================
    -- VERIFICA POST-MIGRAZIONE
    -- =====================================
    
    -- Test 1: Verifica che la tabella sia stata creata
    IF NOT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'company_kpis') THEN
        RAISE EXCEPTION 'VERIFICA FALLITA: Tabella company_kpis non creata';
    END IF;
    
    -- Test 2: Verifica indici
    IF (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'company_kpis') < 2 THEN
        RAISE EXCEPTION 'VERIFICA FALLITA: Indici company_kpis mancanti';
    END IF;
    
    -- Test 3: Verifica funzione
    IF NOT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'calculate_company_kpis') THEN
        RAISE EXCEPTION 'VERIFICA FALLITA: Funzione calculate_company_kpis non creata';
    END IF;
    
    -- Test 4: Test funzionalità base
    BEGIN
        -- Prova inserimento test (poi rimosso)
        INSERT INTO company_kpis (company_id, period_start, period_end, total_flights)
        VALUES ('00000000-0000-0000-0000-000000000000', '2024-01-01', '2024-01-31', 1);
        
        DELETE FROM company_kpis 
        WHERE company_id = '00000000-0000-0000-0000-000000000000';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'VERIFICA FALLITA: Test inserimento company_kpis fallito: %', SQLERRM;
    END;
    
    -- Se arrivi qui, tutto OK
    verification_passed := true;
    RAISE NOTICE 'Tutte le verifiche post-migrazione sono passate';
    
    -- =====================================
    -- REGISTRAZIONE MIGRAZIONE
    -- =====================================
    
    -- Registra migrazione come completata
    PERFORM register_migration(
        6, 
        '006_add_company_kpis.sql',
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) * 1000,
        format('-- Rollback migration 006
DROP TRIGGER IF EXISTS update_company_kpis_updated_at ON company_kpis;
DROP FUNCTION IF EXISTS calculate_company_kpis(UUID, DATE, DATE);
DROP TABLE IF EXISTS company_kpis;
-- Checkpoint: %s', checkpoint_id)
    );
    
    RAISE NOTICE 'Migrazione 006 completata con successo in % ms', 
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) * 1000;

EXCEPTION 
    WHEN OTHERS THEN
        -- Log errore e rollback se possibile
        RAISE EXCEPTION 'MIGRAZIONE 006 FALLITA: % - Checkpoint disponibile: %', SQLERRM, checkpoint_id;
END $$;
