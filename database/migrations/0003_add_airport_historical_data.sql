-- Migrazione 0003+0004: Aggiunta campi storici aeroporti e campo founded su companies
-- Idempotente: aggiunge solo se la colonna non esiste

DO $$
BEGIN
    -- Aeroporti
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='airports' AND column_name='opened_date') THEN
        ALTER TABLE airports ADD COLUMN opened_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='airports' AND column_name='closure_date') THEN
        ALTER TABLE airports ADD COLUMN closure_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='airports' AND column_name='runways_count') THEN
        ALTER TABLE airports ADD COLUMN runways_count INTEGER DEFAULT 1 CHECK (runways_count >= 1);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='airports' AND column_name='runway_length_meters') THEN
        ALTER TABLE airports ADD COLUMN runway_length_meters INTEGER DEFAULT 1000 CHECK (runway_length_meters >= 500);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='airports' AND column_name='airport_size') THEN
        ALTER TABLE airports ADD COLUMN airport_size VARCHAR(20) DEFAULT 'medium' CHECK (airport_size IN ('small', 'medium', 'large', 'hub'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='airports' AND column_name='business_level') THEN
        ALTER TABLE airports ADD COLUMN business_level INTEGER DEFAULT 50 CHECK (business_level >= 0 AND business_level <= 100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='airports' AND column_name='tourist_level') THEN
        ALTER TABLE airports ADD COLUMN tourist_level INTEGER DEFAULT 50 CHECK (tourist_level >= 0 AND tourist_level <= 100);
    END IF;
    -- Companies
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='founded') THEN
        ALTER TABLE companies ADD COLUMN founded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        UPDATE companies SET founded = founded_date WHERE founded_date IS NOT NULL;
        COMMENT ON COLUMN companies.founded IS 'Data di fondazione della compagnia (formato compatibile con backend)';
    END IF;
END $$;

-- Indici per migliorare le performance delle query sui nuovi campi
CREATE INDEX IF NOT EXISTS idx_airports_opened_date ON airports(opened_date);
CREATE INDEX IF NOT EXISTS idx_airports_closure_date ON airports(closure_date);
CREATE INDEX IF NOT EXISTS idx_airports_size ON airports(airport_size);

-- Commenti per documentare i nuovi campi
COMMENT ON COLUMN airports.opened_date IS 'Data di apertura dell aeroporto al traffico commerciale';
COMMENT ON COLUMN airports.closure_date IS 'Data di chiusura dell aeroporto (NULL se ancora operativo)';
COMMENT ON COLUMN airports.runways_count IS 'Numero di piste operative';
COMMENT ON COLUMN airports.runway_length_meters IS 'Lunghezza della pista principale in metri';
COMMENT ON COLUMN airports.airport_size IS 'Classificazione dimensionale: small, medium, large, hub';
COMMENT ON COLUMN airports.business_level IS 'Livello di traffico business (0-100)';
COMMENT ON COLUMN airports.tourist_level IS 'Livello di traffico turistico (0-100)';
