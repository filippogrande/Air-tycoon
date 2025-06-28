-- Migration 007: Realistic Fleet Management
-- Data: 27 giugno 2025
-- Descrizione: Aggiunge sistema realistico di gestione flotta con:
-- - Status fleet più realistici (in_delivery, available, maintenance)
-- - Rimozione assigned_route_id (sostituito da timetable settimanale)
-- - Max flight hours per aircraft types e componenti
-- - Sistema componenti aeromobili con ore di volo individuali
-- - Timetable settimanali per programmazione aeromobili
-- - Trigger automatici per sincronizzazione ore componenti

BEGIN;

-- 1. Aggiorna constraints status tabella fleet
ALTER TABLE fleet DROP CONSTRAINT IF EXISTS fleet_status_check;
ALTER TABLE fleet ADD CONSTRAINT fleet_status_check 
    CHECK (status IN ('in_delivery', 'available', 'maintenance'));

-- 2. Rimuovi assigned_route_id dalla tabella fleet
ALTER TABLE fleet DROP COLUMN IF EXISTS assigned_route_id;

-- 3. Aggiungi max_flight_hours a aircraft_types
ALTER TABLE aircraft_types ADD COLUMN IF NOT EXISTS max_flight_hours INTEGER NOT NULL DEFAULT 50000 
    CHECK (max_flight_hours > 0);

-- 4. Rimuovi assigned_aircraft_id dalle routes
ALTER TABLE routes DROP COLUMN IF EXISTS assigned_aircraft_id;

-- 5. Crea tabella aircraft_components
CREATE TABLE IF NOT EXISTS aircraft_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aircraft_id UUID REFERENCES fleet(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL CHECK (component_type IN ('engines', 'structure', 'avionics', 'hydraulics', 'landing_gear')),
    component_name VARCHAR(100) NOT NULL,
    max_flight_hours INTEGER NOT NULL CHECK (max_flight_hours > 0),
    current_flight_hours DECIMAL(10,2) DEFAULT 0 CHECK (current_flight_hours >= 0),
    condition INTEGER DEFAULT 100 CHECK (condition >= 0 AND condition <= 100),
    last_maintenance TIMESTAMP WITH TIME ZONE,
    maintenance_cost DECIMAL(12,2) DEFAULT 0,
    replacement_cost DECIMAL(12,2) NOT NULL CHECK (replacement_cost > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Crea tabella aircraft_timetables
CREATE TABLE IF NOT EXISTS aircraft_timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aircraft_id UUID REFERENCES fleet(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('flight', 'maintenance', 'standby')),
    route_id UUID REFERENCES routes(id),
    departure_time TIME NOT NULL,
    arrival_time TIME,
    estimated_flight_hours DECIMAL(4,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aircraft_id, week_start_date, day_of_week, departure_time)
);

-- 7. Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_aircraft_components_aircraft ON aircraft_components(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_components_type ON aircraft_components(component_type);
CREATE INDEX IF NOT EXISTS idx_aircraft_components_condition ON aircraft_components(condition);
CREATE INDEX IF NOT EXISTS idx_aircraft_components_hours ON aircraft_components(current_flight_hours, max_flight_hours);
CREATE INDEX IF NOT EXISTS idx_aircraft_components_active ON aircraft_components(aircraft_id, is_active);

CREATE INDEX IF NOT EXISTS idx_aircraft_timetables_aircraft ON aircraft_timetables(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_timetables_week ON aircraft_timetables(week_start_date);
CREATE INDEX IF NOT EXISTS idx_aircraft_timetables_activity ON aircraft_timetables(activity_type);
CREATE INDEX IF NOT EXISTS idx_aircraft_timetables_route ON aircraft_timetables(route_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_timetables_schedule ON aircraft_timetables(aircraft_id, week_start_date, day_of_week);

-- 8. Rimuovi indici obsoleti
DROP INDEX IF EXISTS idx_routes_aircraft;

-- 9. Aggiungi trigger per aggiornamento timestamp
CREATE TRIGGER update_aircraft_components_updated_at BEFORE UPDATE ON aircraft_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_timetables_updated_at BEFORE UPDATE ON aircraft_timetables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Crea funzione per aggiornare ore componenti
CREATE OR REPLACE FUNCTION update_component_flight_hours()
RETURNS TRIGGER AS $$
DECLARE
    hours_difference DECIMAL(10,2);
BEGIN
    hours_difference := NEW.total_flight_hours - OLD.total_flight_hours;
    
    IF hours_difference > 0 THEN
        UPDATE aircraft_components 
        SET 
            current_flight_hours = current_flight_hours + hours_difference,
            condition = GREATEST(0, condition - (hours_difference * 0.1)::INTEGER),
            updated_at = CURRENT_TIMESTAMP
        WHERE aircraft_id = NEW.id AND is_active = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Crea funzione per componenti standard nuovi aeromobili
CREATE OR REPLACE FUNCTION create_default_aircraft_components()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO aircraft_components (aircraft_id, component_type, component_name, max_flight_hours, replacement_cost) VALUES
    (NEW.id, 'engines', 'Motore Sinistro', 15000, 2500000),
    (NEW.id, 'engines', 'Motore Destro', 15000, 2500000),
    (NEW.id, 'structure', 'Struttura Fusoliera', 40000, 8000000),
    (NEW.id, 'structure', 'Ali e Superfici', 35000, 5000000),
    (NEW.id, 'avionics', 'Sistema Navigazione', 20000, 500000),
    (NEW.id, 'avionics', 'Sistema Comunicazione', 18000, 300000),
    (NEW.id, 'hydraulics', 'Sistema Idraulico', 25000, 800000),
    (NEW.id, 'landing_gear', 'Carrello Atterraggio', 30000, 1200000);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Crea trigger
CREATE TRIGGER update_component_hours_trigger AFTER UPDATE OF total_flight_hours ON fleet
    FOR EACH ROW EXECUTE FUNCTION update_component_flight_hours();

CREATE TRIGGER create_components_trigger AFTER INSERT ON fleet
    FOR EACH ROW EXECUTE FUNCTION create_default_aircraft_components();

-- 13. Rimuovi trigger obsoleti
DROP TRIGGER IF EXISTS check_route_compatibility_trigger ON routes;

-- 14. Crea componenti per aeromobili esistenti
INSERT INTO aircraft_components (aircraft_id, component_type, component_name, max_flight_hours, replacement_cost, current_flight_hours)
SELECT 
    f.id,
    component_data.component_type,
    component_data.component_name,
    component_data.max_flight_hours,
    component_data.replacement_cost,
    f.total_flight_hours -- Inizializza con le ore attuali dell'aeromobile
FROM fleet f
CROSS JOIN (
    VALUES 
    ('engines', 'Motore Sinistro', 15000, 2500000),
    ('engines', 'Motore Destro', 15000, 2500000),
    ('structure', 'Struttura Fusoliera', 40000, 8000000),
    ('structure', 'Ali e Superfici', 35000, 5000000),
    ('avionics', 'Sistema Navigazione', 20000, 500000),
    ('avionics', 'Sistema Comunicazione', 18000, 300000),
    ('hydraulics', 'Sistema Idraulico', 25000, 800000),
    ('landing_gear', 'Carrello Atterraggio', 30000, 1200000)
) AS component_data(component_type, component_name, max_flight_hours, replacement_cost)
WHERE NOT EXISTS (
    SELECT 1 FROM aircraft_components ac 
    WHERE ac.aircraft_id = f.id
);

COMMIT;

-- Aggiungi commenti alla documentazione
COMMENT ON TABLE aircraft_components IS 'Componenti critici degli aeromobili con limiti ore di volo e stato manutenzione';
COMMENT ON TABLE aircraft_timetables IS 'Programmazione settimanale aeromobili: voli, manutenzione, standby';

COMMENT ON COLUMN aircraft_types.max_flight_hours IS 'Ore massime di volo dell''aeromobile prima del pensionamento forzato';
COMMENT ON COLUMN fleet.status IS 'Status realistico: in_delivery (consegna), available (disponibile), maintenance (manutenzione)';
COMMENT ON COLUMN aircraft_components.component_type IS 'Tipo componente: engines, structure, avionics, hydraulics, landing_gear';
COMMENT ON COLUMN aircraft_components.max_flight_hours IS 'Ore massime di funzionamento del componente prima sostituzione obbligatoria';
COMMENT ON COLUMN aircraft_components.current_flight_hours IS 'Ore di volo correnti del componente - aggiornate automaticamente';
COMMENT ON COLUMN aircraft_timetables.week_start_date IS 'Lunedì della settimana di programmazione';
COMMENT ON COLUMN aircraft_timetables.day_of_week IS 'Giorno settimana: 0=Lunedì, 1=Martedì, ..., 6=Domenica';
COMMENT ON COLUMN aircraft_timetables.activity_type IS 'Tipo attività: flight (volo), maintenance (manutenzione), standby (fermo)';
COMMENT ON COLUMN aircraft_timetables.estimated_flight_hours IS 'Ore di volo stimate per questa attività - usate per calcolare usura';
