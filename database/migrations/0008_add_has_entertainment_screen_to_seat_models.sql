-- Migrazione 0008: aggiunge la colonna has_entertainment_screen alla tabella seat_models in modo idempotente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='has_entertainment_screen'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN has_entertainment_screen BOOLEAN NOT NULL DEFAULT FALSE;
        
        COMMENT ON COLUMN seat_models.has_entertainment_screen IS 'Indica se il modello di sedile è dotato di schermo di intrattenimento';
    END IF;
END$$;

-- MIGRAZIONE COMPLETATA
SELECT 'Migrazione 0008 - add has_entertainment_screen to seat_models - COMPLETATA' as status;
