-- Migrazione 0012: rende la colonna capacity nullable su aircraft_types
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='aircraft_types' AND column_name='capacity'
    ) THEN
        -- Rende la colonna nullable solo se non lo è già
        BEGIN
            ALTER TABLE aircraft_types ALTER COLUMN capacity DROP NOT NULL;
        EXCEPTION WHEN others THEN
            -- Se la colonna è già nullable, ignora l'errore
            NULL;
        END;
    END IF;
END$$;

-- MIGRAZIONE COMPLETATA
SELECT 'Migrazione 0012 - capacity nullable su aircraft_types - COMPLETATA' as status;
