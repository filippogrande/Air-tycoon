-- Migrazione 0016: vincoli companies e cleanup schema
-- Data: 2025-06-29

-- 0. Elimina tutte le compagnie senza user_id (per evitare errori sul vincolo NOT NULL)
DELETE FROM companies WHERE user_id IS NULL;

-- 1. Rendi obbligatorio user_id su companies
ALTER TABLE companies
ALTER COLUMN user_id SET NOT NULL;

-- 2. Rimuovi headquarters_airport_id da companies (se non serve più)
ALTER TABLE companies
DROP COLUMN IF EXISTS headquarters_airport_id;

-- 3. Rendi obbligatorio game_date su companies (se la colonna esiste)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='companies' AND column_name='game_date'
    ) THEN
        ALTER TABLE companies ALTER COLUMN game_date SET NOT NULL;
    END IF;
END $$;

-- 4. (Opzionale) Rimuovi la tabella game_states se non più usata
DROP TABLE IF EXISTS game_states;

-- 5. Unique constraint su route_services.name
DELETE FROM route_services a
USING route_services b
WHERE a.name = b.name AND a.id > b.id;

ALTER TABLE route_services
ADD CONSTRAINT route_services_name_unique UNIQUE (name);

-- 6. Elimina la tabella schema_migration se esiste
DROP TABLE IF EXISTS schema_migration;

-- 7. Unique constraint su seat_manufacturers.name
DELETE FROM seat_manufacturers a
USING seat_manufacturers b
WHERE a.name = b.name AND a.id > b.id;

ALTER TABLE seat_manufacturers
ADD CONSTRAINT seat_manufacturers_name_unique UNIQUE (name);

-- 8. Unique constraint su seat_models.model_name
DELETE FROM seat_models a
USING seat_models b
WHERE a.model_name = b.model_name AND a.id > b.id;

ALTER TABLE seat_models
ADD CONSTRAINT seat_models_model_name_unique UNIQUE (model_name);

-- 9. Unique constraint su world_events.name
DELETE FROM world_events a
USING world_events b
WHERE a.name = b.name AND a.id > b.id;

ALTER TABLE world_events
ADD CONSTRAINT world_events_name_unique UNIQUE (name);

-- Log
SELECT 'Migrazione 0016 - companies vincoli e cleanup - COMPLETATA' as status;
