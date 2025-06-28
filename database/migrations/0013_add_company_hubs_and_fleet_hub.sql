-- Migrazione 0013: Reintroduzione e normalizzazione sistema hub + assegnazione hub agli aeromobili
-- Data: 2025-06-28
--
-- 1. Crea/garantisce la tabella company_hubs per multi-hub
-- 2. Aggiunge la colonna hub_id alla tabella fleet (aeromobili)
-- 3. Migra eventuali dati esistenti (assegna hub principale agli aerei già presenti)

DO $$
BEGIN
    -- 1. Tabella company_hubs (se non esiste)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'company_hubs'
    ) THEN
        CREATE TABLE company_hubs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            airport_id INTEGER REFERENCES airports(id) NOT NULL,
            hub_level INTEGER DEFAULT 1 CHECK (hub_level >= 1 AND hub_level <= 5),
            maintenance_capacity INTEGER DEFAULT 2,
            staff_capacity INTEGER DEFAULT 50,
            monthly_cost BIGINT DEFAULT 100000,
            facilities JSONB DEFAULT '{}',
            established_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(company_id, airport_id)
        );
        CREATE INDEX idx_company_hubs_company_id ON company_hubs(company_id);
        CREATE INDEX idx_company_hubs_airport ON company_hubs(airport_id);
    END IF;

    -- 2. Colonna hub_id su fleet (aeromobili)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='fleet' AND column_name='hub_id'
    ) THEN
        ALTER TABLE fleet ADD COLUMN hub_id UUID REFERENCES company_hubs(id);
        COMMENT ON COLUMN fleet.hub_id IS 'Hub di assegnazione principale per l aeromobile (FK verso company_hubs)';
    END IF;

    -- 3. Migrazione dati: assegna hub principale agli aerei già presenti (se possibile)
    UPDATE fleet f
    SET hub_id = ch.id
    FROM companies c
    JOIN company_hubs ch ON ch.company_id = c.id AND ch.hub_type = 'headquarters'
    WHERE f.company_id = c.id AND f.hub_id IS NULL;

END $$;

-- Log
SELECT 'Migrazione 0013 - multi-hub e assegnazione hub agli aeromobili - COMPLETATA' as status;
