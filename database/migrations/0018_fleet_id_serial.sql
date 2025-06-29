-- Migrazione 0018: fleet.id e fleet.aircraft_id da UUID a SERIAL numerico
-- Data: 2025-06-29

 -- 1. Rinominare le colonne id e aircraft_id in entrambe le tabelle per backup temporaneo
ALTER TABLE fleet RENAME COLUMN id TO id_old;
ALTER TABLE fleet RENAME COLUMN aircraft_id TO aircraft_id_old;
ALTER TABLE flights RENAME COLUMN id TO id_old;
ALTER TABLE flights RENAME COLUMN aircraft_id TO aircraft_id_old;

-- 2. Rimuovere tutti i constraint che fanno riferimento alle colonne coinvolte
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_pkey;
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_company_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_pkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_company_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_fleet_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_aircraft_id_fkey;

-- 3. Aggiungere le nuove colonne
ALTER TABLE fleet ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE fleet ADD COLUMN aircraft_id SERIAL;
ALTER TABLE flights ADD COLUMN id SERIAL PRIMARY KEY;
-- Se la colonna aircraft_id esiste già (da una migrazione fallita), eliminala prima
ALTER TABLE flights DROP COLUMN IF EXISTS aircraft_id;
ALTER TABLE flights ADD COLUMN aircraft_id INTEGER;

-- 4. Aggiornare i dati nelle tabelle dipendenti
UPDATE flights SET aircraft_id = (
    SELECT id FROM fleet WHERE fleet.aircraft_id_old = flights.aircraft_id_old
);

-- 5. Modificare i tipi delle colonne collegate
ALTER TABLE flights ALTER COLUMN company_id TYPE INTEGER USING company_id::integer;
ALTER TABLE flights ALTER COLUMN fleet_id TYPE INTEGER USING fleet_id::integer;

-- 6. Ricreare i constraint
ALTER TABLE fleet ADD CONSTRAINT fleet_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE flights ADD CONSTRAINT flights_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE flights ADD CONSTRAINT flights_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES fleet(id);
ALTER TABLE flights ADD CONSTRAINT flights_aircraft_id_fkey FOREIGN KEY (aircraft_id) REFERENCES fleet(id);

-- 7. Eliminare le colonne di backup solo alla fine
ALTER TABLE fleet DROP COLUMN id_old;
ALTER TABLE fleet DROP COLUMN aircraft_id_old;
ALTER TABLE flights DROP COLUMN id_old;
ALTER TABLE flights DROP COLUMN aircraft_id_old;

-- Log
SELECT 'Migrazione 0018 - fleet.id e fleet.aircraft_id SERIAL numerico - COMPLETATA' as status;
