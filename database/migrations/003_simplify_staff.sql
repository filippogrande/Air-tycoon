-- Migrazione 003: Semplificazione gestione personale
-- Converte tabella staff individuale in staff_totals aggregata

DO $$
BEGIN
    -- Esci se migrazione già completata
    IF is_migration_completed(3) THEN
        RAISE NOTICE 'Migrazione 003 già completata, skip.';
        RETURN;
    END IF;

    RAISE NOTICE 'Esecuzione migrazione 003: Semplificazione gestione personale';
    
    -- Crea tabella staff_totals se non esiste
    CREATE TABLE IF NOT EXISTS staff_totals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        pilots_count INTEGER DEFAULT 0,
        cabin_crew_count INTEGER DEFAULT 0,
        maintenance_count INTEGER DEFAULT 0,
        marketing_count INTEGER DEFAULT 0,
        management_count INTEGER DEFAULT 0,
        ground_count INTEGER DEFAULT 0,
        total_monthly_salaries BIGINT DEFAULT 0,
        average_satisfaction INTEGER DEFAULT 50 CHECK (average_satisfaction >= 0 AND average_satisfaction <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id)
    );
    
    -- Se esiste la vecchia tabella staff, migra i dati
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        RAISE NOTICE 'Migrazione dati da tabella staff a staff_totals';
        
        -- Aggrega dati dalla vecchia tabella
        INSERT INTO staff_totals (
            company_id, pilots_count, cabin_crew_count, maintenance_count,
            marketing_count, management_count, ground_count, 
            total_monthly_salaries, average_satisfaction
        )
        SELECT 
            company_id,
            COUNT(CASE WHEN staff_type = 'pilot' THEN 1 END) as pilots_count,
            COUNT(CASE WHEN staff_type = 'cabin_crew' THEN 1 END) as cabin_crew_count,
            COUNT(CASE WHEN staff_type = 'maintenance' THEN 1 END) as maintenance_count,
            COUNT(CASE WHEN staff_type = 'marketing' THEN 1 END) as marketing_count,
            COUNT(CASE WHEN staff_type = 'management' THEN 1 END) as management_count,
            COUNT(CASE WHEN staff_type = 'ground' THEN 1 END) as ground_count,
            COALESCE(SUM(salary_monthly), 0) as total_monthly_salaries,
            COALESCE(AVG(satisfaction), 50)::INTEGER as average_satisfaction
        FROM staff
        WHERE status = 'active'
        GROUP BY company_id
        ON CONFLICT (company_id) DO UPDATE SET
            pilots_count = EXCLUDED.pilots_count,
            cabin_crew_count = EXCLUDED.cabin_crew_count,
            maintenance_count = EXCLUDED.maintenance_count,
            marketing_count = EXCLUDED.marketing_count,
            management_count = EXCLUDED.management_count,
            ground_count = EXCLUDED.ground_count,
            total_monthly_salaries = EXCLUDED.total_monthly_salaries,
            average_satisfaction = EXCLUDED.average_satisfaction;
            
        -- Rinomina vecchia tabella per backup
        ALTER TABLE staff RENAME TO staff_backup_migration_003;
        RAISE NOTICE 'Tabella staff rinominata in staff_backup_migration_003';
    END IF;
    
    -- Aggiungi indici
    CREATE INDEX IF NOT EXISTS idx_staff_totals_company_id ON staff_totals(company_id);
    
    -- Aggiungi trigger updated_at
    CREATE TRIGGER update_staff_totals_updated_at BEFORE UPDATE ON staff_totals
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    -- Registra migrazione
    PERFORM register_migration(3, 'simplify_staff_management', 300, 
        'DROP TABLE IF EXISTS staff_totals; ALTER TABLE staff_backup_migration_003 RENAME TO staff;');
    
    RAISE NOTICE 'Migrazione 003 completata con successo';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Errore durante migrazione 003: %', SQLERRM;
END;
$$;
