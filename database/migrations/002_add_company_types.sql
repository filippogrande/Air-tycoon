-- Migrazione 002: Aggiunta tipologie compagnia
-- Eseguire solo se il server ha lo schema base senza company_type

-- Controlla se la migrazione è necessaria
DO $$
BEGIN
    -- Esci se migrazione già completata
    IF is_migration_completed(2) THEN
        RAISE NOTICE 'Migrazione 002 già completata, skip.';
        RETURN;
    END IF;

    -- Esci se colonna già esiste
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'company_type'
    ) THEN
        RAISE NOTICE 'Colonna company_type già esiste, registrando migrazione come completata.';
        PERFORM register_migration(2, 'add_company_types', 0, 
            'ALTER TABLE companies DROP COLUMN company_type;');
        RETURN;
    END IF;

    RAISE NOTICE 'Esecuzione migrazione 002: Aggiunta tipologie compagnia';
    
    -- Backup delle companies esistenti (opzionale, in tabella temporanea)
    CREATE TEMP TABLE companies_backup_002 AS SELECT * FROM companies;
    
    -- Aggiungi colonna company_type
    ALTER TABLE companies 
    ADD COLUMN company_type VARCHAR(20) DEFAULT 'normal' 
    CHECK (company_type IN ('low_cost', 'normal', 'luxury', 'cargo'));
    
    -- Imposta tipo normal per compagnie esistenti
    UPDATE companies SET company_type = 'normal' WHERE company_type IS NULL;
    
    -- Aggiorna indici
    CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
    
    -- Registra migrazione completata
    PERFORM register_migration(2, 'add_company_types', 150, 
        'ALTER TABLE companies DROP COLUMN company_type; DROP INDEX IF EXISTS idx_companies_type;');
    
    RAISE NOTICE 'Migrazione 002 completata con successo';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Errore durante migrazione 002: %', SQLERRM;
END;
$$;
