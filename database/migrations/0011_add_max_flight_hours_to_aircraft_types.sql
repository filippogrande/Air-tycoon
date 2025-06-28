-- Migrazione 0012: aggiunge la colonna max_flight_hours a aircraft_types in modo idempotente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='aircraft_types' AND column_name='max_flight_hours'
    ) THEN
        ALTER TABLE aircraft_types
            ADD COLUMN max_flight_hours INTEGER NOT NULL DEFAULT 50000 CHECK (max_flight_hours > 0);
        COMMENT ON COLUMN aircraft_types.max_flight_hours IS 'Ore di volo massime per il tipo di aeromobile';
    END IF;
END$$;

-- MIGRAZIONE COMPLETATA
SELECT 'Migrazione 0012 - add max_flight_hours to aircraft_types - COMPLETATA' as status;
