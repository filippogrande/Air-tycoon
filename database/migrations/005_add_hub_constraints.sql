-- Migrazione 005: Aggiunta constraint rotte-hub

DO $$
BEGIN
    -- Esci se migrazione già completata
    IF is_migration_completed(5) THEN
        RAISE NOTICE 'Migrazione 005 già completata, skip.';
        RETURN;
    END IF;

    RAISE NOTICE 'Esecuzione migrazione 005: Constraint rotte-hub';
    
    -- Crea funzione per verificare hub se non esiste
    CREATE OR REPLACE FUNCTION check_route_has_hub()
    RETURNS TRIGGER AS $func$
    BEGIN
        -- Verifica che almeno origine o destinazione sia un hub della compagnia
        IF NOT EXISTS (
            SELECT 1 FROM company_hubs 
            WHERE company_id = NEW.company_id 
            AND (airport_id = NEW.origin_airport_id OR airport_id = NEW.destination_airport_id)
        ) THEN
            RAISE EXCEPTION 'Almeno un aeroporto della rotta deve essere un hub della compagnia';
        END IF;
        
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Verifica rotte esistenti che violerebbero il constraint
    DO $check$
    DECLARE
        invalid_routes INTEGER;
    BEGIN
        SELECT COUNT(*) INTO invalid_routes
        FROM routes r
        WHERE NOT EXISTS (
            SELECT 1 FROM company_hubs ch
            WHERE ch.company_id = r.company_id 
            AND (ch.airport_id = r.origin_airport_id OR ch.airport_id = r.destination_airport_id)
        );
        
        IF invalid_routes > 0 THEN
            RAISE WARNING 'Trovate % rotte che non collegano hub. Creazione hub automatici...', invalid_routes;
            
            -- Crea hub secondari per aeroporti di origine delle rotte problematiche
            INSERT INTO company_hubs (company_id, airport_id, hub_type, hub_level, monthly_cost)
            SELECT DISTINCT 
                r.company_id,
                r.origin_airport_id,
                'secondary',
                1,
                100000
            FROM routes r
            WHERE NOT EXISTS (
                SELECT 1 FROM company_hubs ch
                WHERE ch.company_id = r.company_id 
                AND (ch.airport_id = r.origin_airport_id OR ch.airport_id = r.destination_airport_id)
            )
            ON CONFLICT (company_id, airport_id) DO NOTHING;
            
            RAISE NOTICE 'Creati hub automatici per risolvere rotte problematiche';
        END IF;
    END;
    $check$;
    
    -- Aggiungi trigger solo se non esiste già
    DROP TRIGGER IF EXISTS check_route_hub_trigger ON routes;
    CREATE TRIGGER check_route_hub_trigger 
        BEFORE INSERT OR UPDATE ON routes
        FOR EACH ROW EXECUTE FUNCTION check_route_has_hub();
    
    -- Registra migrazione
    PERFORM register_migration(5, 'add_hub_route_constraints', 100, 
        'DROP TRIGGER IF EXISTS check_route_hub_trigger ON routes; DROP FUNCTION IF EXISTS check_route_has_hub();');
    
    RAISE NOTICE 'Migrazione 005 completata con successo';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Errore durante migrazione 005: %', SQLERRM;
END;
$$;
