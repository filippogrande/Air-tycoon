-- Migrazione 0004: add_base_airport_to_companies
-- Data: 2025-06-28
-- 
-- Descrizione: Aggiunge la colonna base_airport alla tabella companies (FK verso airports)
-- 
-- ATTENZIONE: Questa migrazione viene eseguita automaticamente all'avvio del server
-- Testare sempre in ambiente di sviluppo prima del deploy in produzione

-- ==================================================
-- INIZIO MIGRAZIONE
-- ==================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='companies' AND column_name='base_airport'
    ) THEN
        ALTER TABLE companies ADD COLUMN base_airport INTEGER REFERENCES airports(id);
        COMMENT ON COLUMN companies.base_airport IS 'Aeroporto base della compagnia (FK verso airports)';
    END IF;
END $$;

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_companies_base_airport ON companies(base_airport);

-- ==================================================
-- MIGRAZIONE COMPLETATA
-- ==================================================

SELECT 'Migrazione 0004 - add_base_airport_to_companies - COMPLETATA' as status;

-- ==================================================
-- FINE MIGRAZIONE
-- ==================================================
