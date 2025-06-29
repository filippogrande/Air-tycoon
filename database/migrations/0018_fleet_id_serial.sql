-- MIGRAZIONE 0018: Correzione ordine vincoli

-- 2. Rimuovere i vincoli di FOREIGN KEY che fanno riferimento a aircraft.id_old (ex fleet.id)
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_fleet_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_aircraft_id_fkey;

-- 3. Ora puoi rimuovere la PRIMARY KEY residua con il vecchio nome (fleet_pkey) dopo la rinomina
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_pkey;
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_pkey;
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_company_id_fkey;

-- 4. E ora puoi rimuovere gli altri vincoli di flights
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_pkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_company_id_fkey;
ALTER TABLE flights DROP CONSTRAINT IF EXISTS flights_route_id_fkey;

SELECT 'CONSTRAINT dropped' AS log;
-- 1. Rinominare le colonne per backup
ALTER TABLE fleet RENAME COLUMN id TO id_old;
ALTER TABLE fleet RENAME COLUMN company_id TO company_id_old;
ALTER TABLE flights RENAME COLUMN id TO id_old;
ALTER TABLE flights RENAME COLUMN route_id TO route_id_old;
ALTER TABLE flights RENAME COLUMN aircraft_id TO aircraft_id_old;
ALTER TABLE routes RENAME COLUMN id TO id_old;


-- 1b. Rinomina la tabella fleet in aircraft
ALTER TABLE fleet RENAME TO aircraft;

SELECT 'renames' AS log;
-- 5. Aggiungere nuove colonne PK/FK e conversione dati
ALTER TABLE aircraft ADD COLUMN id SERIAL PRIMARY KEY;
-- Solo ora aggiungi la colonna company_id e popola con conversione
ALTER TABLE aircraft ADD COLUMN company_id INTEGER;

ALTER TABLE flights ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE flights ADD COLUMN route_id INTEGER;
ALTER TABLE flights ADD COLUMN aircraft_id INTEGER;

-- 5b. Aggiornamento tabella routes: conversione id da UUID a SERIAL
ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_pkey;
ALTER TABLE routes ADD COLUMN id SERIAL PRIMARY KEY;
-- (Opzionale: se serve, mappa i dati da id_old a id nelle tabelle collegate)

SELECT 'add column' AS log;
-- 8. Ricreare i constraint
ALTER TABLE aircraft ADD CONSTRAINT aircraft_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE flights ADD CONSTRAINT flights_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE flights ADD CONSTRAINT flights_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES aircraft(id);
ALTER TABLE flights ADD CONSTRAINT flights_aircraft_id_fkey FOREIGN KEY (aircraft_id) REFERENCES aircraft(id);
ALTER TABLE flights ADD CONSTRAINT flights_route_id_fkey FOREIGN KEY (route_id) REFERENCES routes(id);


SELECT 'Ricreare' AS log;
-- 9. Rimuovere le colonne di backup
ALTER TABLE aircraft DROP COLUMN id_old;
ALTER TABLE aircraft DROP COLUMN company_id_old;
ALTER TABLE flights DROP COLUMN id_old;
ALTER TABLE flights DROP COLUMN route_id_old;
ALTER TABLE flights DROP COLUMN aircraft_id_old;
ALTER TABLE routes DROP COLUMN id_old;

-- 10. Log finale
SELECT 'Migrazione 0018 - COMPLETATA CORRETTAMENTE' as status;
