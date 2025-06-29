-- Migrazione 0017: companies.id da UUID a SERIAL numerico
-- Data: 2025-06-29

-- 1. Rinominare la colonna id attuale (UUID) per backup temporaneo
ALTER TABLE companies RENAME COLUMN id TO id_old;

-- 2. Rimuovere tutte le foreign key che puntano a companies.id_old
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_company_id_fkey;
ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_company_id_fkey;
ALTER TABLE company_hubs DROP CONSTRAINT IF EXISTS company_hubs_company_id_fkey;
ALTER TABLE financial_records DROP CONSTRAINT IF EXISTS financial_records_company_id_fkey;

-- 3. Ora puoi rimuovere la primary key
ALTER TABLE companies DROP CONSTRAINT companies_pkey;

-- 4. Aggiungere nuova colonna id SERIAL PRIMARY KEY
ALTER TABLE companies ADD COLUMN id SERIAL PRIMARY KEY;

-- Esempio per routes
ALTER TABLE routes ADD COLUMN company_id_new INTEGER;
UPDATE routes SET company_id_new = (SELECT id FROM companies WHERE id_old = routes.company_id);
ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_company_id_fkey;
ALTER TABLE routes DROP COLUMN company_id;
ALTER TABLE routes RENAME COLUMN company_id_new TO company_id;
ALTER TABLE routes ADD CONSTRAINT routes_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);

-- Esempio per company_hubs
ALTER TABLE company_hubs ADD COLUMN company_id_new INTEGER;
UPDATE company_hubs SET company_id_new = (SELECT id FROM companies WHERE id_old = company_hubs.company_id);
ALTER TABLE company_hubs DROP CONSTRAINT IF EXISTS company_hubs_company_id_fkey;
ALTER TABLE company_hubs DROP COLUMN company_id;
ALTER TABLE company_hubs RENAME COLUMN company_id_new TO company_id;
ALTER TABLE company_hubs ADD CONSTRAINT company_hubs_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);

-- Esempio per financial_records
ALTER TABLE financial_records ADD COLUMN company_id_new INTEGER;
UPDATE financial_records SET company_id_new = (SELECT id FROM companies WHERE id_old = financial_records.company_id);
ALTER TABLE financial_records DROP CONSTRAINT IF EXISTS financial_records_company_id_fkey;
ALTER TABLE financial_records DROP COLUMN company_id;
ALTER TABLE financial_records RENAME COLUMN company_id_new TO company_id;
ALTER TABLE financial_records ADD CONSTRAINT financial_records_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);

-- 4. (Opzionale) Rimuovere la vecchia colonna id_old
ALTER TABLE companies DROP COLUMN id_old;

-- Log
SELECT 'Migrazione 0017 - companies.id SERIAL numerico - COMPLETATA' as status;
