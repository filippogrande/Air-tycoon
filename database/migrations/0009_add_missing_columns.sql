-- Migrazione 0009: aggiunge le colonne mancanti a aircraft_types e seat_models in modo idempotente
DO $$
BEGIN
    -- Colonna min_runway_length_meters su aircraft_types
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='aircraft_types' AND column_name='min_runway_length_meters'
    ) THEN
        ALTER TABLE aircraft_types
            ADD COLUMN min_runway_length_meters INTEGER;
        COMMENT ON COLUMN aircraft_types.min_runway_length_meters IS 'Lunghezza minima pista (metri) necessaria per operare';
    END IF;
    -- Colonna screen_size_inches su seat_models
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='screen_size_inches'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN screen_size_inches DECIMAL(4,1);
        COMMENT ON COLUMN seat_models.screen_size_inches IS 'Dimensione dello schermo (pollici) se presente';
    END IF;
END$$;

-- MIGRAZIONE COMPLETATA
SELECT 'Migrazione 0009 - add min_runway_length_meters to aircraft_types e screen_size_inches to seat_models - COMPLETATA' as status;
