-- Migrazione 0020: ON DELETE CASCADE su tutte le tabelle collegate a companies

-- company_hubs
ALTER TABLE company_hubs DROP CONSTRAINT IF EXISTS company_hubs_company_id_fkey;
ALTER TABLE company_hubs ADD CONSTRAINT company_hubs_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- fleet
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_company_id_fkey;
ALTER TABLE fleet ADD CONSTRAINT fleet_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- routes
ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_company_id_fkey;
ALTER TABLE routes ADD CONSTRAINT routes_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- company_research
ALTER TABLE company_research DROP CONSTRAINT IF EXISTS company_research_company_id_fkey;
ALTER TABLE company_research ADD CONSTRAINT company_research_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- financial_records
ALTER TABLE financial_records DROP CONSTRAINT IF EXISTS financial_records_company_id_fkey;
ALTER TABLE financial_records ADD CONSTRAINT financial_records_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- active_events
ALTER TABLE active_events DROP CONSTRAINT IF EXISTS active_events_company_id_fkey;
ALTER TABLE active_events ADD CONSTRAINT active_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
