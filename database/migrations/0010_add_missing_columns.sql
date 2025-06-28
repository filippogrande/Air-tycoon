-- Migrazione 0011: aggiunge le colonne mancanti a seat_models in modo idempotente
DO $$
BEGIN
    -- Colonna has_power_outlet su seat_models
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='has_power_outlet'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN has_power_outlet BOOLEAN NOT NULL DEFAULT FALSE;
        COMMENT ON COLUMN seat_models.has_power_outlet IS 'Indica se il sedile ha presa di corrente';
    END IF;
    -- Colonna has_usb_port
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='has_usb_port'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN has_usb_port BOOLEAN NOT NULL DEFAULT FALSE;
        COMMENT ON COLUMN seat_models.has_usb_port IS 'Indica se il sedile ha porta USB';
    END IF;
    -- Colonna market_entry_year
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='market_entry_year'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN market_entry_year INTEGER;
        COMMENT ON COLUMN seat_models.market_entry_year IS 'Anno di ingresso sul mercato';
    END IF;
    -- Colonna max_flight_hours
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='max_flight_hours'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN max_flight_hours INTEGER;
        COMMENT ON COLUMN seat_models.max_flight_hours IS 'Ore di volo massime del sedile';
    END IF;
    -- Colonna max_cycles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='max_cycles'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN max_cycles INTEGER;
        COMMENT ON COLUMN seat_models.max_cycles IS 'Numero massimo di cicli (voli) del sedile';
    END IF;
    -- Colonna base_cost
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='base_cost'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN base_cost BIGINT;
        COMMENT ON COLUMN seat_models.base_cost IS 'Costo base del sedile';
    END IF;
    -- Colonna maintenance_cost_per_year
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='seat_models' AND column_name='maintenance_cost_per_year'
    ) THEN
        ALTER TABLE seat_models
            ADD COLUMN maintenance_cost_per_year BIGINT;
        COMMENT ON COLUMN seat_models.maintenance_cost_per_year IS 'Costo di manutenzione annuale del sedile';
    END IF;
END$$;

-- MIGRAZIONE COMPLETATA
SELECT 'Migrazione 0011 - add colonne mancanti a seat_models - COMPLETATA' as status;
