-- Schema base Air Tycoon 2 - Versione corretta con autenticazione email
-- Data: 28 giugno 2025

-- Abilita l'estensione UUID per generare ID univoci
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELLE UTENTI E AUTENTICAZIONE
-- =====================================================

-- Tabella utenti (con email come chiave principale)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50), -- Opzionale, solo per display
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}' -- Preferenze audio/grafica/interfaccia
);

-- Indici per performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username) WHERE username IS NOT NULL;

-- Commenti per chiarire l'uso
COMMENT ON TABLE users IS 'Utenti del sistema con autenticazione via email';
COMMENT ON COLUMN users.email IS 'Email principale usata per autenticazione e identificazione utente';
COMMENT ON COLUMN users.username IS 'Username opzionale per display, non usato per autenticazione';
COMMENT ON COLUMN users.password_hash IS 'Hash SHA256 della password utente';

-- Tabella aeroporti
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4) UNIQUE,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    elevation INTEGER DEFAULT 0,
    timezone VARCHAR(50),
    opened_date DATE,
    closure_date DATE,
    runways_count INTEGER DEFAULT 1 CHECK (runways_count >= 1),
    runway_length_meters INTEGER DEFAULT 1000 CHECK (runway_length_meters >= 500),
    airport_size VARCHAR(20) DEFAULT 'medium' CHECK (airport_size IN ('small', 'medium', 'large', 'campo_aviazione')),
    business_level INTEGER DEFAULT 50 CHECK (business_level >= 0 AND business_level <= 100),
    tourist_level INTEGER DEFAULT 50 CHECK (tourist_level >= 0 AND tourist_level <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella tipi di aeromobili
CREATE TABLE IF NOT EXISTS aircraft_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('regional', 'regional_jet', 'turboprop', 'narrow_body', 'wide_body', 'cargo')),
    -- Per i cargo la capacità è espressa in tonnellate; per i passeggeri può restare NULL
    -- perché la capienza effettiva dipende dalla configurazione sedili.
    capacity DECIMAL(6,2),
    cabin_length_meters DECIMAL(6,2),
    cabin_width_meters DECIMAL(5,2),
    min_runway_length_meters INTEGER,
    range_km INTEGER NOT NULL CHECK (range_km > 0),
    fuel_consumption INTEGER NOT NULL CHECK (fuel_consumption > 0),
    cruise_speed INTEGER NOT NULL CHECK (cruise_speed > 0),
    purchase_price BIGINT NOT NULL CHECK (purchase_price > 0),
    maintenance_cost_per_hour INTEGER NOT NULL CHECK (maintenance_cost_per_hour >= 0),
    max_flight_hours INTEGER NOT NULL DEFAULT 50000 CHECK (max_flight_hours > 0),
    can_operate_campo_aviazione BOOLEAN DEFAULT FALSE,
    campo_aviazione_mod_available BOOLEAN DEFAULT FALSE,
    campo_aviazione_mod_cost INTEGER,
    market_entry_year INTEGER,
    market_exit_year INTEGER,
    image_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT aircraft_types_name_unique UNIQUE (name)
);

COMMENT ON COLUMN aircraft_types.capacity IS 'Capacità utile: tonnellate per i cargo, opzionale per i passeggeri';
COMMENT ON COLUMN aircraft_types.cabin_length_meters IS 'Lunghezza cabina in metri';
COMMENT ON COLUMN aircraft_types.cabin_width_meters IS 'Larghezza cabina in metri';
COMMENT ON COLUMN aircraft_types.min_runway_length_meters IS 'Lunghezza minima pista in metri necessaria per operare';
COMMENT ON COLUMN aircraft_types.can_operate_campo_aviazione IS 'TRUE se il modello può operare da campo di aviazione senza modifiche';
COMMENT ON COLUMN aircraft_types.campo_aviazione_mod_available IS 'TRUE se è disponibile una modifica per operare da campo di aviazione';
COMMENT ON COLUMN aircraft_types.campo_aviazione_mod_cost IS 'Costo della modifica per operare da campo di aviazione (NULL se non disponibile)';
COMMENT ON COLUMN aircraft_types.market_entry_year IS 'Anno di ingresso sul mercato (primo volo commerciale)';
COMMENT ON COLUMN aircraft_types.market_exit_year IS 'Anno di uscita dal mercato (fine produzione o ritiro)';

-- Tabella compagnie aeree
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    money BIGINT DEFAULT 1000000,
    reputation INTEGER DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
    founded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    founded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    game_date TIMESTAMP WITH TIME ZONE,
    headquarters_airport_id INTEGER REFERENCES airports(id),
    base_airport INTEGER REFERENCES airports(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_base_airport ON companies(base_airport);

-- Commento per `base_airport` (migrazione 0004)
COMMENT ON COLUMN companies.base_airport IS 'Aeroporto base della compagnia (FK verso airports)';

-- Tabella hub aziendali
CREATE TABLE IF NOT EXISTS company_hubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    airport_id INTEGER NOT NULL REFERENCES airports(id),
    hub_type VARCHAR(20) DEFAULT 'headquarters',
    hub_level INTEGER DEFAULT 1 CHECK (hub_level >= 1 AND hub_level <= 5),
    maintenance_capacity INTEGER DEFAULT 2,
    staff_capacity INTEGER DEFAULT 50,
    monthly_cost BIGINT DEFAULT 100000,
    facilities JSONB DEFAULT '{}'::jsonb,
    established_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT company_hubs_company_airport_unique UNIQUE (company_id, airport_id)
);

CREATE INDEX IF NOT EXISTS idx_company_hubs_company_id ON company_hubs(company_id);
CREATE INDEX IF NOT EXISTS idx_company_hubs_airport ON company_hubs(airport_id);

-- Tabella stato del gioco
CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    game_speed DECIMAL(3,1) DEFAULT 1.0,
    is_paused BOOLEAN DEFAULT FALSE,
    version VARCHAR(10) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella flotta aeromobili
CREATE TABLE IF NOT EXISTS fleet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    aircraft_type_id INTEGER REFERENCES aircraft_types(id) NOT NULL,
    registration VARCHAR(20) UNIQUE NOT NULL,
    condition INTEGER DEFAULT 100 CHECK (condition >= 0 AND condition <= 100),
    total_flight_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_flight', 'maintenance', 'assigned')),
    location_airport_id INTEGER REFERENCES airports(id),
    total_passengers BIGINT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    total_flights INTEGER DEFAULT 0,
    hub_id UUID REFERENCES company_hubs(id),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella rotte
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    origin_airport_id INTEGER REFERENCES airports(id) NOT NULL,
    destination_airport_id INTEGER REFERENCES airports(id) NOT NULL,
    distance_km INTEGER,
    base_price INTEGER DEFAULT 0,
    frequency_per_week INTEGER DEFAULT 7 CHECK (frequency_per_week >= 1 AND frequency_per_week <= 21),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'planning')),
    total_flights INTEGER DEFAULT 0,
    total_passengers BIGINT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    total_costs BIGINT DEFAULT 0,
    average_load_factor DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT different_airports CHECK (origin_airport_id != destination_airport_id)
);

-- Tabella voli
CREATE TABLE IF NOT EXISTS flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    aircraft_id UUID REFERENCES fleet(id) ON DELETE SET NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    passenger_load DECIMAL(5,2) DEFAULT 0,
    revenue BIGINT DEFAULT 0,
    fuel_cost BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'in_flight', 'completed', 'cancelled', 'delayed')),
    delay_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella record finanziari
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    period DATE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense', 'summary')),
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
    aircraft_id UUID REFERENCES fleet(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_record_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES financial_records(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL
);

-- Tabella eventi di ricerca
CREATE TABLE IF NOT EXISTS research_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost BIGINT NOT NULL,
    duration_days INTEGER NOT NULL,
    requirements JSONB,
    effects JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT research_events_name_unique UNIQUE (name)
);

-- Tabella ricerca compagnie
CREATE TABLE IF NOT EXISTS company_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    research_event_id INTEGER REFERENCES research_events(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    investment_amount BIGINT NOT NULL
);

-- Tabella eventi casuali
CREATE TABLE IF NOT EXISTS random_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    probability DECIMAL(5,4) CHECK (probability >= 0 AND probability <= 1),
    effects JSONB,
    duration_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT random_events_name_unique UNIQUE (name)
);

-- Tabella eventi attivi per le compagnie
CREATE TABLE IF NOT EXISTS active_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES random_events(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabella salvataggi
CREATE TABLE IF NOT EXISTS game_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    save_name VARCHAR(100) NOT NULL,
    save_type VARCHAR(20) DEFAULT 'manual',
    game_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, save_name)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(255) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Migrazione 0002: rendi `username` opzionale e popola valori mancanti
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;


-- Inserimento preferenze di default per utenti esistenti (migrazione 0001)
INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT id, 'ui_theme', 'dark' FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT id, 'map_zoom_level', '3' FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT id, 'auto_save_interval', '300' FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- Fine migrazione 0001

-- Tabella configurazioni aeromobili (configurazioni sedili)
CREATE TABLE IF NOT EXISTS aircraft_configurations (
    id SERIAL PRIMARY KEY,
    aircraft_type_id INTEGER REFERENCES aircraft_types(id) ON DELETE SET NULL,
    aircraft_type_name VARCHAR(255),
    config_name VARCHAR(100) NOT NULL,
    layout JSONB,
    seat_model_ids INTEGER[],
    seat_model_names TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (aircraft_type_id, config_name)
);

-- =====================================================
-- TABELLE AGGIUNTE PER SEED E MIGRAZIONI
-- (route_services, seat_manufacturers, seat_models, world_events)
-- Queste definizioni consolidano le colonne introdotte dalle migrazioni
-- e permettono di eseguire i seed presenti in database/initial-database/
-- =====================================================

-- Tabella route_services
CREATE TABLE IF NOT EXISTS route_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    cost_per_passenger DECIMAL(8,2) NOT NULL,
    description TEXT,
    class_restriction VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella seat_manufacturers
CREATE TABLE IF NOT EXISTS seat_manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    founded_year INTEGER,
    reputation_score INTEGER,
    market_share DECIMAL(5,2),
    specialization VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_seat_manufacturers_name ON seat_manufacturers(name);

-- Tabella seat_models (inclusi campi aggiunti dalle migrazioni successive)
CREATE TABLE IF NOT EXISTS seat_models (
    id SERIAL PRIMARY KEY,
    manufacturer_id INTEGER REFERENCES seat_manufacturers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_code VARCHAR(20),
    seat_class VARCHAR(20) NOT NULL,
    width_cm DECIMAL(4,1),
    depth_cm DECIMAL(4,1),
    height_cm DECIMAL(4,1),
    pitch_min_cm DECIMAL(4,1),
    pitch_max_cm DECIMAL(4,1),
    weight_kg DECIMAL(5,2),
    comfort_rating INTEGER,
    recline_angle DECIMAL(4,1),
    features TEXT,
    has_entertainment_screen BOOLEAN NOT NULL DEFAULT FALSE,
    screen_size_inches DECIMAL(4,1),
    has_power_outlet BOOLEAN NOT NULL DEFAULT FALSE,
    has_usb_port BOOLEAN NOT NULL DEFAULT FALSE,
    market_entry_year INTEGER,
    max_flight_hours INTEGER,
    max_cycles INTEGER,
    base_cost BIGINT,
    maintenance_cost_per_year BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_seat_models_model_name ON seat_models(model_name);

-- Tabella world_events
CREATE TABLE IF NOT EXISTS world_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    global_effects JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT world_events_name_unique UNIQUE (name)
);

-- Tabella geocoding_cache
CREATE TABLE IF NOT EXISTS geocoding_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(latitude, longitude)
);

-- =====================================================
-- INDICI PER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_fleet_company_id ON fleet(company_id);
CREATE INDEX IF NOT EXISTS idx_fleet_aircraft_type ON fleet(aircraft_type_id);
CREATE INDEX IF NOT EXISTS idx_routes_company_id ON routes(company_id);
CREATE INDEX IF NOT EXISTS idx_routes_airports ON routes(origin_airport_id, destination_airport_id);
CREATE INDEX IF NOT EXISTS idx_flights_route_id ON flights(route_id);
CREATE INDEX IF NOT EXISTS idx_flights_aircraft_id ON flights(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_financial_company_id ON financial_records(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_created_at ON financial_records(created_at);
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);
CREATE INDEX IF NOT EXISTS idx_airports_opened_date ON airports(opened_date);
CREATE INDEX IF NOT EXISTS idx_airports_closure_date ON airports(closure_date);
CREATE INDEX IF NOT EXISTS idx_airports_size ON airports(airport_size);

-- Commenti per i nuovi campi aeroportuali (migrazione 0003)
COMMENT ON COLUMN airports.opened_date IS 'Data di apertura dell aeroporto al traffico commerciale';
COMMENT ON COLUMN airports.closure_date IS 'Data di chiusura dell aeroporto (NULL se ancora operativo)';
COMMENT ON COLUMN airports.runways_count IS 'Numero di piste operative';
COMMENT ON COLUMN airports.runway_length_meters IS 'Lunghezza della pista principale in metri';
COMMENT ON COLUMN airports.airport_size IS 'Classificazione dimensionale: small, medium, large, hub';
COMMENT ON COLUMN airports.business_level IS 'Livello di traffico business (0-100)';
COMMENT ON COLUMN airports.tourist_level IS 'Livello di traffico turistico (0-100)';

-- Commento per companies.founded (migrazione 0003/0004)
COMMENT ON COLUMN companies.founded IS 'Data di fondazione della compagnia (formato compatibile con backend)';

-- Migrazione 0006: normalizza valori legacy e aggiorna enum airport_size
-- Sostituisci vecchio valore 'hub' con 'large' (idempotente)
UPDATE airports SET airport_size = 'large' WHERE airport_size = 'hub';

-- =====================================================
-- TRIGGERS PER UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applica trigger alle tabelle che hanno updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at 
                       BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END
$$;

-- Tabella per tracciare le versioni dello schema
CREATE TABLE IF NOT EXISTS schema_versions (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registra questa versione
INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Schema iniziale completo con tutte le tabelle base')
ON CONFLICT (version) DO NOTHING;
