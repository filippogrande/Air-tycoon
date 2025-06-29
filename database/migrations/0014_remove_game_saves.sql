-- Migrazione 0014: Rimozione tabella game_saves, game_states, refactoring financial_records/items e aggiunta game_date a companies
-- Data: 2025-06-29

DO $$
BEGIN
    -- 1. Drop della tabella game_saves se esiste
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'game_saves'
    ) THEN
        DROP TABLE game_saves CASCADE;
    END IF;

    -- 2. Drop della tabella game_states se esiste
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'game_states'
    ) THEN
        DROP TABLE game_states CASCADE;
    END IF;

    -- 3. Drop della tabella financial_record_items se esiste (per clean upgrade)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_record_items'
    ) THEN
        DROP TABLE financial_record_items CASCADE;
    END IF;

    -- 4. Drop della tabella financial_records se esiste
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_records'
    ) THEN
        DROP TABLE financial_records CASCADE;
    END IF;

    -- 5. Crea nuova financial_records (solo info generali)
    CREATE TABLE financial_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        period DATE NOT NULL, -- fine mese di riferimento
        type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense', 'summary')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Crea financial_record_items (amount/category per voce)
    CREATE TABLE financial_record_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        record_id UUID REFERENCES financial_records(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        amount BIGINT NOT NULL
    );

    -- 7. Aggiungi colonna game_date a companies se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='game_date'
    ) THEN
        ALTER TABLE companies ADD COLUMN game_date TIMESTAMP WITH TIME ZONE;
        COMMENT ON COLUMN companies.game_date IS 'Data corrente del gioco per la compagnia (salvataggio rapido)';
    END IF;
END $$;

-- Log
SELECT 'Migrazione 0014 - refactoring tabelle salvataggi, game_states, financial_records/items e aggiunta game_date a companies - COMPLETATA' as status;
