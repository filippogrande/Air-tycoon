-- Migrazione 0005: add_cabin_dimensions_to_aircraft_types
-- Data: 2025-06-28
-- 
-- Descrizione: Aggiunge le colonne cabin_length_meters e cabin_width_meters alla tabella aircraft_types
-- ATTENZIONE: Questa migrazione viene eseguita automaticamente all'avvio del server
-- Testare sempre in ambiente di sviluppo prima del deploy in produzione

-- ==================================================
-- INIZIO MIGRAZIONE
-- ==================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='aircraft_types' AND column_name='cabin_length_meters'
    ) THEN
        ALTER TABLE aircraft_types ADD COLUMN cabin_length_meters DECIMAL(6,2);
        COMMENT ON COLUMN aircraft_types.cabin_length_meters IS 'Lunghezza cabina in metri';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='aircraft_types' AND column_name='cabin_width_meters'
    ) THEN
        ALTER TABLE aircraft_types ADD COLUMN cabin_width_meters DECIMAL(5,2);
        COMMENT ON COLUMN aircraft_types.cabin_width_meters IS 'Larghezza cabina in metri';
    END IF;
END $$;

-- ==================================================
-- MIGRAZIONE COMPLETATA
-- ==================================================

SELECT 'Migrazione 0005 - add_cabin_dimensions_to_aircraft_types - COMPLETATA' as status;

-- ==================================================
-- FINE MIGRAZIONE
-- ==================================================
