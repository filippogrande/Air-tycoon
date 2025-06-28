-- Migration 008: Sistema avanzato di gestione sedili
-- Implementa un sistema realistico di sedili con produttori, modelli, usura e layout dinamici

-- Tabella produttori di sedili
CREATE TABLE seat_manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(50) NOT NULL,
    founded_year INTEGER,
    reputation_score INTEGER DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    market_share DECIMAL(5,2) DEFAULT 0 CHECK (market_share >= 0 AND market_share <= 100),
    specialization VARCHAR(50) CHECK (specialization IN ('economy', 'premium', 'luxury', 'all')),
    website VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella modelli di sedili
CREATE TABLE seat_models (
    id SERIAL PRIMARY KEY,
    manufacturer_id INTEGER REFERENCES seat_manufacturers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_code VARCHAR(50), -- Codice del modello (es. "3530", "CL3710")
    seat_class VARCHAR(20) NOT NULL CHECK (seat_class IN ('economy', 'premium_economy', 'business', 'first')),
    
    -- Dimensioni fisiche (in cm)
    width_cm DECIMAL(5,2) NOT NULL CHECK (width_cm > 0),
    depth_cm DECIMAL(5,2) NOT NULL CHECK (depth_cm > 0), 
    height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm > 0),
    pitch_min_cm DECIMAL(5,2) NOT NULL CHECK (pitch_min_cm > 0), -- Passo minimo
    pitch_max_cm DECIMAL(5,2) NOT NULL CHECK (pitch_max_cm > 0), -- Passo massimo
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0),
    
    -- Caratteristiche di comfort
    comfort_rating INTEGER DEFAULT 5 CHECK (comfort_rating >= 1 AND comfort_rating <= 10),
    recline_angle INTEGER DEFAULT 0 CHECK (recline_angle >= 0 AND recline_angle <= 180),
    has_bed BOOLEAN DEFAULT FALSE,
    has_massage BOOLEAN DEFAULT FALSE,
    has_entertainment_screen BOOLEAN DEFAULT FALSE,
    screen_size_inches DECIMAL(4,1) DEFAULT 0,
    has_power_outlet BOOLEAN DEFAULT FALSE,
    has_usb_port BOOLEAN DEFAULT FALSE,
    has_wifi BOOLEAN DEFAULT FALSE,
    
    -- Ciclo di vita e costi
    market_entry_year INTEGER NOT NULL,
    market_exit_year INTEGER, -- NULL se ancora in produzione
    max_flight_hours INTEGER DEFAULT 50000 CHECK (max_flight_hours > 0), -- Ore massime prima sostituzione
    max_cycles INTEGER DEFAULT 25000 CHECK (max_cycles > 0), -- Cicli decollo/atterraggio massimi
    
    -- Costi (in centesimi)
    base_cost BIGINT NOT NULL CHECK (base_cost > 0), -- Costo acquisto singolo sedile
    installation_cost BIGINT DEFAULT 0, -- Costo installazione
    maintenance_cost_per_year BIGINT DEFAULT 0, -- Costo manutenzione annuale
    refurbishment_cost BIGINT DEFAULT 0, -- Costo per rinnovare/riparare
    
    -- Metadati
    certification_required BOOLEAN DEFAULT TRUE, -- Richiede certificazione per uso
    weight_class VARCHAR(20) DEFAULT 'standard' CHECK (weight_class IN ('lightweight', 'standard', 'heavy')),
    material_type VARCHAR(50), -- Tipo materiali (leather, fabric, composite)
    color_options TEXT[], -- Array di colori disponibili
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(manufacturer_id, model_name),
    CONSTRAINT valid_market_period CHECK (market_exit_year IS NULL OR market_exit_year > market_entry_year),
    CONSTRAINT valid_pitch_range CHECK (pitch_max_cm >= pitch_min_cm)
);

-- Tabella layout cabina dinamici (sostituisce aircraft_configurations)
CREATE TABLE aircraft_cabin_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aircraft_id UUID REFERENCES fleet(id) ON DELETE CASCADE,
    layout_name VARCHAR(100) NOT NULL,
    layout_version INTEGER DEFAULT 1, -- Versione del layout
    is_active BOOLEAN DEFAULT TRUE, -- Layout attualmente in uso
    
    -- Divisione cabina in sezioni
    first_class_section_length_cm DECIMAL(6,2) DEFAULT 0,
    business_class_section_length_cm DECIMAL(6,2) DEFAULT 0,
    premium_economy_section_length_cm DECIMAL(6,2) DEFAULT 0,
    economy_class_section_length_cm DECIMAL(6,2) DEFAULT 0,
    
    -- Configurazione corridoi e servizi
    aisle_width_cm DECIMAL(5,2) DEFAULT 50,
    galley_space_cm DECIMAL(6,2) DEFAULT 0, -- Spazio cucine
    lavatory_space_cm DECIMAL(6,2) DEFAULT 0, -- Spazio bagni
    storage_space_cm DECIMAL(6,2) DEFAULT 0, -- Spazio bagagli/storage
    
    -- Capacità calcolate automaticamente
    total_seats INTEGER DEFAULT 0,
    first_class_seats INTEGER DEFAULT 0,
    business_class_seats INTEGER DEFAULT 0,
    premium_economy_seats INTEGER DEFAULT 0,
    economy_class_seats INTEGER DEFAULT 0,
    
    -- Metriche performance
    space_efficiency DECIMAL(5,2) DEFAULT 100.0, -- % efficienza uso spazio
    passenger_satisfaction_modifier DECIMAL(4,1) DEFAULT 0, -- Bonus/malus soddisfazione
    weight_total_kg DECIMAL(8,2) DEFAULT 0, -- Peso totale layout
    
    installation_date DATE,
    last_refurbishment_date DATE,
    next_refurbishment_due DATE,
    layout_cost_total BIGINT DEFAULT 0, -- Costo totale layout
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(aircraft_id, layout_name, layout_version)
);

-- Tabella sedili installati (istanze specifiche dei modelli)
CREATE TABLE aircraft_installed_seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID REFERENCES aircraft_cabin_layouts(id) ON DELETE CASCADE,
    seat_model_id INTEGER REFERENCES seat_models(id) NOT NULL,
    
    -- Posizione fisica del sedile
    seat_row INTEGER NOT NULL CHECK (seat_row > 0),
    seat_column VARCHAR(2) NOT NULL, -- A, B, C, D, E, F, etc.
    seat_class VARCHAR(20) NOT NULL CHECK (seat_class IN ('first', 'business', 'premium_economy', 'economy')),
    
    -- Configurazione specifica
    pitch_cm DECIMAL(5,2) NOT NULL,
    is_window_seat BOOLEAN DEFAULT FALSE,
    is_aisle_seat BOOLEAN DEFAULT FALSE,
    is_exit_row BOOLEAN DEFAULT FALSE,
    has_extra_legroom BOOLEAN DEFAULT FALSE,
    
    -- Stato e manutenzione
    installation_date DATE NOT NULL,
    current_flight_hours DECIMAL(10,2) DEFAULT 0,
    current_flight_cycles INTEGER DEFAULT 0,
    condition_rating INTEGER DEFAULT 100 CHECK (condition_rating >= 0 AND condition_rating <= 100),
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    
    -- Stato operativo
    is_operational BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE, -- Temporaneamente non utilizzabile
    blocked_reason TEXT,
    replacement_needed BOOLEAN DEFAULT FALSE,
    replacement_scheduled_date DATE,
    
    -- Costi sostenuti
    purchase_cost BIGINT NOT NULL, -- Costo effettivo pagato
    installation_cost BIGINT DEFAULT 0,
    total_maintenance_cost BIGINT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(layout_id, seat_row, seat_column)
);

-- Tabella storico manutenzioni sedili
CREATE TABLE seat_maintenance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seat_id UUID REFERENCES aircraft_installed_seats(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('routine', 'repair', 'refurbishment', 'replacement')),
    maintenance_date DATE NOT NULL,
    cost BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    performed_by VARCHAR(100), -- Chi ha eseguito la manutenzione
    downtime_hours INTEGER DEFAULT 0, -- Ore di fermo
    parts_replaced TEXT[], -- Array parti sostituite
    condition_before INTEGER CHECK (condition_before >= 0 AND condition_before <= 100),
    condition_after INTEGER CHECK (condition_after >= 0 AND condition_after <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX idx_seat_models_class ON seat_models(seat_class);
CREATE INDEX idx_seat_models_market_period ON seat_models(market_entry_year, market_exit_year);
CREATE INDEX idx_cabin_layouts_aircraft ON aircraft_cabin_layouts(aircraft_id);
CREATE INDEX idx_cabin_layouts_active ON aircraft_cabin_layouts(aircraft_id, is_active);
CREATE INDEX idx_installed_seats_layout ON aircraft_installed_seats(layout_id);
CREATE INDEX idx_installed_seats_position ON aircraft_installed_seats(layout_id, seat_row, seat_column);
CREATE INDEX idx_installed_seats_condition ON aircraft_installed_seats(condition_rating, replacement_needed);
CREATE INDEX idx_seat_maintenance_date ON seat_maintenance_history(maintenance_date);
CREATE INDEX idx_seat_maintenance_seat ON seat_maintenance_history(seat_id);

-- Trigger per aggiornamento automatico timestamp
CREATE OR REPLACE FUNCTION update_seat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_seat_manufacturers_updated_at
    BEFORE UPDATE ON seat_manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_seat_updated_at();

CREATE TRIGGER tr_seat_models_updated_at
    BEFORE UPDATE ON seat_models
    FOR EACH ROW EXECUTE FUNCTION update_seat_updated_at();

CREATE TRIGGER tr_cabin_layouts_updated_at
    BEFORE UPDATE ON aircraft_cabin_layouts
    FOR EACH ROW EXECUTE FUNCTION update_seat_updated_at();

CREATE TRIGGER tr_installed_seats_updated_at
    BEFORE UPDATE ON aircraft_installed_seats
    FOR EACH ROW EXECUTE FUNCTION update_seat_updated_at();

-- Funzione per calcolare capacità automatica basata su dimensioni aeromobile e sedili
CREATE OR REPLACE FUNCTION calculate_seat_capacity(
    p_aircraft_type_id INTEGER,
    p_cabin_length_cm DECIMAL,
    p_cabin_width_cm DECIMAL,
    p_seat_model_id INTEGER,
    p_seat_pitch_cm DECIMAL,
    p_aisle_width_cm DECIMAL DEFAULT 50
) RETURNS TABLE (
    max_rows INTEGER,
    seats_per_row INTEGER,
    total_capacity INTEGER,
    space_efficiency DECIMAL
) AS $$
DECLARE
    seat_width DECIMAL;
    available_length DECIMAL;
    available_width DECIMAL;
BEGIN
    -- Ottieni larghezza sedile
    SELECT width_cm INTO seat_width 
    FROM seat_models 
    WHERE id = p_seat_model_id;
    
    -- Calcola spazio disponibile (rimuovi spazio per corridoi, servizi, ecc.)
    available_length := p_cabin_length_cm - 200; -- 2m per servizi/bagni
    available_width := p_cabin_width_cm - p_aisle_width_cm - 20; -- corridoio + margini
    
    -- Calcola numero massimo righe
    max_rows := FLOOR(available_length / p_seat_pitch_cm);
    
    -- Calcola sedili per riga (configurazione tipica 3-3 per narrow body, 3-4-3 per wide body)
    IF p_cabin_width_cm <= 400 THEN -- narrow body
        seats_per_row := FLOOR(available_width / seat_width);
        IF seats_per_row > 6 THEN seats_per_row := 6; END IF; -- Max 3-3
    ELSE -- wide body
        seats_per_row := FLOOR(available_width / seat_width);
        IF seats_per_row > 10 THEN seats_per_row := 10; END IF; -- Max 3-4-3
    END IF;
    
    -- Calcola capacità totale
    total_capacity := max_rows * seats_per_row;
    
    -- Calcola efficienza spazio
    space_efficiency := (total_capacity * seat_width * p_seat_pitch_cm) / 
                       (p_cabin_length_cm * p_cabin_width_cm) * 100;
    
    RETURN QUERY SELECT max_rows, seats_per_row, total_capacity, space_efficiency;
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare usura sedili dopo ogni volo
CREATE OR REPLACE FUNCTION update_seat_wear_after_flight()
RETURNS TRIGGER AS $$
DECLARE
    flight_hours DECIMAL;
    layout_record RECORD;
    seat_record RECORD;
BEGIN
    -- Calcola ore di volo
    flight_hours := EXTRACT(EPOCH FROM (NEW.arrival_time - NEW.departure_time)) / 3600.0;
    
    -- Trova layout dell'aeromobile
    SELECT id INTO layout_record
    FROM aircraft_cabin_layouts 
    WHERE aircraft_id = NEW.aircraft_id AND is_active = TRUE;
    
    -- Aggiorna usura di tutti i sedili dell'aeromobile
    UPDATE aircraft_installed_seats 
    SET 
        current_flight_hours = current_flight_hours + flight_hours,
        current_flight_cycles = current_flight_cycles + 1,
        condition_rating = GREATEST(0, condition_rating - (flight_hours * 0.1)), -- Usura graduale
        replacement_needed = CASE 
            WHEN current_flight_hours + flight_hours >= (
                SELECT max_flight_hours FROM seat_models WHERE id = seat_model_id
            ) THEN TRUE
            ELSE replacement_needed
        END
    WHERE layout_id = layout_record.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per usura automatica sedili
CREATE TRIGGER tr_update_seat_wear_after_flight
    AFTER UPDATE OF status ON flights
    FOR EACH ROW 
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_seat_wear_after_flight();

-- Commenti sulle tabelle
COMMENT ON TABLE seat_manufacturers IS 'Produttori di sedili aeronautici (Recaro, Zodiac, Collins Aerospace, etc.)';
COMMENT ON TABLE seat_models IS 'Modelli di sedili con caratteristiche fisiche, comfort e ciclo di vita';
COMMENT ON TABLE aircraft_cabin_layouts IS 'Layout cabina dinamici per ogni aeromobile con calcolo automatico capacità';
COMMENT ON TABLE aircraft_installed_seats IS 'Sedili fisicamente installati su ogni aeromobile con tracking usura';
COMMENT ON TABLE seat_maintenance_history IS 'Storico delle manutenzioni eseguite sui sedili';

COMMENT ON COLUMN seat_models.max_flight_hours IS 'Ore massime di volo prima che il sedile debba essere sostituito';
COMMENT ON COLUMN seat_models.max_cycles IS 'Cicli massimi decollo/atterraggio prima della sostituzione';
COMMENT ON COLUMN aircraft_installed_seats.condition_rating IS 'Condizione attuale del sedile (0-100)';
COMMENT ON COLUMN aircraft_installed_seats.replacement_needed IS 'TRUE se il sedile ha raggiunto fine vita utile';
