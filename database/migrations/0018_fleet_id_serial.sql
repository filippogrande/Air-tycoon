-- MIGRAZIONE 0018: Correzione ordine vincoli

-- 1. Rinominare le colonne per backup
ALTER TABLE fleet RENAME COLUMN id TO id_old;
ALTER TABLE fleet RENAME COLUMN company_id TO company_id_old;
ALTER TABLE flights RENAME COLUMN id TO id_old;
ALTER TABLE flights RENAME COLUMN route_id TO route_id_old;
ALTER TABLE flights RENAME COLUMN aircraft_id TO aircraft_id_old;

-- 2. Rimuovere i vincoli di FOREIGN KEY che fanno riferimento a fleet.id
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_fleet_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_aircraft_id_fkey;

-- 3. Ora puoi rimuovere la PRIMARY KEY su fleet
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_pkey;
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_company_id_fkey;

-- 4. E ora puoi rimuovere gli altri vincoli di flights
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_pkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_company_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_route_id_fkey;

-- 5. Aggiungere nuove colonne
ALTER TABLE fleet ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE fleet ADD COLUMN company_id INTEGER;
ALTER TABLE fleet ADD COLUMN aircraft_id SERIAL;

ALTER TABLE flights ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE flights ADD COLUMN route_id INTEGER;
ALTER TABLE flights ADD COLUMN aircraft_id INTEGER;

-- 6. (Opzionale) se serve mappare route_id o aircraft_id da tabella esterna, farlo qui

-- 7. Modificare tipo colonne se serve
ALTER TABLE flights ALTER COLUMN company_id TYPE INTEGER USING company_id::integer;
ALTER TABLE flights ALTER COLUMN fleet_id TYPE INTEGER USING fleet_id::integer;

-- 8. Ricreare i constraint
ALTER TABLE fleet ADD CONSTRAINT fleet_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE flights ADD CONSTRAINT flights_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE flights ADD CONSTRAINT flights_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES fleet(id);
ALTER TABLE flights ADD CONSTRAINT flights_aircraft_id_fkey FOREIGN KEY (aircraft_id) REFERENCES fleet(id);
ALTER TABLE flights ADD CONSTRAINT flights_route_id_fkey FOREIGN KEY (route_id) REFERENCES routes(id);

-- 9. Rimuovere le colonne di backup
ALTER TABLE fleet DROP COLUMN id_old;
ALTER TABLE fleet DROP COLUMN company_id_old;
ALTER TABLE fleet DROP COLUMN aircraft_id_old;
ALTER TABLE flights DROP COLUMN id_old;
ALTER TABLE flights DROP COLUMN route_id_old;
ALTER TABLE flights DROP COLUMN aircraft_id_old;

-- 10. Log finale
SELECT 'Migrazione 0018 - COMPLETATA CORRETTAMENTE' as status;
