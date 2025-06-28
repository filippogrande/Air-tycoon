-- Migrazione 0006: Aggiorna valori accettati per airport_size
-- Data: 2025-06-28
-- Rimuove 'hub' e aggiunge 'campo_aviazione' e 'molto_piccola' tra i valori accettati

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Trova il nome del vincolo CHECK esistente su airport_size
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'airports'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%airport_size%';

    -- Rimuovi il vincolo CHECK esistente se trovato
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE airports DROP CONSTRAINT %I', constraint_name);
    END IF;

    -- Aggiungi nuovo vincolo CHECK con i nuovi valori
    ALTER TABLE airports
        ADD CONSTRAINT chk_airport_size_enum
        CHECK (airport_size IN ('small', 'medium', 'large', 'campo_aviazione'));
END $$;

-- Aggiorna i dati esistenti: sostituisci 'hub' con 'large' (o altro valore se preferito)
UPDATE airports SET airport_size = 'large' WHERE airport_size = 'hub';
-- Se vuoi distinguere, puoi usare 'campo_aviazione' o 'molto_piccola' per aeroporti specifici.

-- Aggiunta colonne per gestione operatività su campi di aviazione agli aircraft_types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aircraft_types' AND column_name='can_operate_campo_aviazione') THEN
        ALTER TABLE aircraft_types ADD COLUMN can_operate_campo_aviazione BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN aircraft_types.can_operate_campo_aviazione IS 'TRUE se il modello può operare da campo di aviazione senza modifiche';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aircraft_types' AND column_name='campo_aviazione_mod_available') THEN
        ALTER TABLE aircraft_types ADD COLUMN campo_aviazione_mod_available BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN aircraft_types.campo_aviazione_mod_available IS 'TRUE se è disponibile una modifica per operare da campo di aviazione';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aircraft_types' AND column_name='campo_aviazione_mod_cost') THEN
        ALTER TABLE aircraft_types ADD COLUMN campo_aviazione_mod_cost INTEGER;
        COMMENT ON COLUMN aircraft_types.campo_aviazione_mod_cost IS 'Costo della modifica per operare da campo di aviazione (NULL se non disponibile)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aircraft_types' AND column_name='market_entry_year') THEN
        ALTER TABLE aircraft_types ADD COLUMN market_entry_year INTEGER;
        COMMENT ON COLUMN aircraft_types.market_entry_year IS 'Anno di ingresso sul mercato (primo volo commerciale)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='aircraft_types' AND column_name='market_exit_year') THEN
        ALTER TABLE aircraft_types ADD COLUMN market_exit_year INTEGER;
        COMMENT ON COLUMN aircraft_types.market_exit_year IS 'Anno di uscita dal mercato (fine produzione o ritiro)';
    END IF;
END $$;

-- MIGRAZIONE COMPLETATA
SELECT 'Migrazione 0006 - airport_size enum aggiornata' as status;
