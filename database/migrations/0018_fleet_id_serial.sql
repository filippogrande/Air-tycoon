-- Migrazione 0018: fleet.id e fleet.aircraft_id da UUID a SERIAL numerico
-- Data: 2025-06-29

-- 1. Rinominare la colonna id attuale (UUID) per backup temporaneo
ALTER TABLE fleet RENAME COLUMN id TO id_old;

-- 2. Rinominare la colonna aircraft_id attuale (UUID) per backup temporaneo
ALTER TABLE fleet RENAME COLUMN aircraft_id TO aircraft_id_old;

-- 3. Rimuovere la primary key su id_old
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_pkey;

-- 4. Aggiungere nuova colonna id SERIAL PRIMARY KEY
ALTER TABLE fleet ADD COLUMN id SERIAL PRIMARY KEY;

-- 5. Aggiungere nuova colonna aircraft_id SERIAL
ALTER TABLE fleet ADD COLUMN aircraft_id SERIAL;

-- 6. (Opzionale) Rimuovere le vecchie colonne di backup
ALTER TABLE fleet DROP COLUMN id_old;
ALTER TABLE fleet DROP COLUMN aircraft_id_old;

-- 7. Aggiungi/ripristina la foreign key verso companies(id)
ALTER TABLE fleet
    ADD CONSTRAINT fleet_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);

-- 8. Aggiorna anche la tabella flights: id da UUID a SERIAL, company_id, fleet_id e aircraft_id a INTEGER e foreign key
ALTER TABLE flights RENAME COLUMN id TO id_old;
ALTER TABLE flights RENAME COLUMN aircraft_id TO aircraft_id_old;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_pkey;
ALTER TABLE flights ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE flights ADD COLUMN aircraft_id INTEGER;

-- Aggiorna aircraft_id nei voli in base al nuovo id della fleet
UPDATE flights SET aircraft_id = (
    SELECT id FROM fleet WHERE fleet.aircraft_id_old = flights.aircraft_id_old
);

ALTER TABLE flights DROP COLUMN id_old;
ALTER TABLE flights DROP COLUMN aircraft_id_old;

-- Assicurati che company_id e fleet_id siano INTEGER
ALTER TABLE flights ALTER COLUMN company_id TYPE INTEGER USING company_id::integer;
ALTER TABLE flights ALTER COLUMN fleet_id TYPE INTEGER USING fleet_id::integer;

-- Ricrea le foreign key
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_company_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_fleet_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_aircraft_id_fkey;
ALTER TABLE flights ADD CONSTRAINT flights_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE flights ADD CONSTRAINT flights_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES fleet(id);
ALTER TABLE flights ADD CONSTRAINT flights_aircraft_id_fkey FOREIGN KEY (aircraft_id) REFERENCES fleet(id);

-- Log
SELECT 'Migrazione 0018 - fleet.id e fleet.aircraft_id SERIAL numerico - COMPLETATA' as status;
