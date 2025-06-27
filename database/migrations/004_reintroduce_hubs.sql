-- Migrazione 004: Reintroduzione sistema hub (senza storage aeromobili)

DO $$
BEGIN
    -- Esci se migrazione già completata
    IF is_migration_completed(4) THEN
        RAISE NOTICE 'Migrazione 004 già completata, skip.';
        RETURN;
    END IF;

    RAISE NOTICE 'Esecuzione migrazione 004: Reintroduzione sistema hub';
    
    -- Crea tabella company_hubs se non esiste
    CREATE TABLE IF NOT EXISTS company_hubs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        airport_id INTEGER REFERENCES airports(id) NOT NULL,
        hub_type VARCHAR(20) DEFAULT 'secondary' CHECK (hub_type IN ('headquarters', 'primary', 'secondary', 'maintenance')),
        hub_level INTEGER DEFAULT 1 CHECK (hub_level >= 1 AND hub_level <= 5),
        maintenance_capacity INTEGER DEFAULT 2,
        staff_capacity INTEGER DEFAULT 50,
        monthly_cost BIGINT DEFAULT 100000,
        facilities JSONB DEFAULT '{}',
        established_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, airport_id)
    );
    
    -- Crea hub headquarters automatici per compagnie esistenti
    INSERT INTO company_hubs (company_id, airport_id, hub_type, hub_level, monthly_cost)
    SELECT 
        c.id as company_id,
        c.headquarters_airport_id as airport_id,
        'headquarters' as hub_type,
        1 as hub_level,
        200000 as monthly_cost  -- Costo maggiore per headquarters
    FROM companies c
    WHERE c.headquarters_airport_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM company_hubs ch 
        WHERE ch.company_id = c.id AND ch.airport_id = c.headquarters_airport_id
    );
    
    -- Aggiungi indici
    CREATE INDEX IF NOT EXISTS idx_company_hubs_company_id ON company_hubs(company_id);
    CREATE INDEX IF NOT EXISTS idx_company_hubs_airport ON company_hubs(airport_id);
    
    -- Aggiungi trigger updated_at
    CREATE TRIGGER update_company_hubs_updated_at BEFORE UPDATE ON company_hubs
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    -- Registra migrazione
    PERFORM register_migration(4, 'reintroduce_hub_system', 200, 
        'DROP TABLE IF EXISTS company_hubs;');
    
    RAISE NOTICE 'Migrazione 004 completata - Creati % hub headquarters', 
        (SELECT COUNT(*) FROM company_hubs WHERE hub_type = 'headquarters');
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Errore durante migrazione 004: %', SQLERRM;
END;
$$;
