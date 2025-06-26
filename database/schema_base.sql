-- Air Tycoon 2 Clone - Schema Base (Versione 1.0.0)
-- Solo creazione tabelle principali senza dati

-- Abilita l'estensione UUID per generare ID univoci
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELLE PRINCIPALI
-- =====================================================

-- Tabella versioni per tracking migrazioni
CREATE TABLE IF NOT EXISTS schema_versions (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella tipi di aeromobili
CREATE TABLE IF NOT EXISTS aircraft_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('regional', 'narrow_body', 'wide_body', 'cargo')),
    capacity INTEGER NOT NULL CHECK (capacity >= 0),
    range_km INTEGER NOT NULL CHECK (range_km > 0),
    fuel_consumption INTEGER NOT NULL CHECK (fuel_consumption > 0),
    cruise_speed INTEGER NOT NULL CHECK (cruise_speed > 0),
    purchase_price BIGINT NOT NULL CHECK (purchase_price > 0),
    maintenance_cost_per_hour INTEGER NOT NULL CHECK (maintenance_cost_per_hour >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella utenti
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabella compagnie aeree
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    money BIGINT DEFAULT 1000000,
    reputation INTEGER DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
    founded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    headquarters_airport_id INTEGER REFERENCES airports(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella stato del gioco
CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
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
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    aircraft_type_id INTEGER REFERENCES aircraft_types(id) NOT NULL,
    registration VARCHAR(20) UNIQUE NOT NULL,
    condition INTEGER DEFAULT 100 CHECK (condition >= 0 AND condition <= 100),
    total_flight_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_flight', 'maintenance', 'assigned')),
    location_airport_id INTEGER REFERENCES airports(id),
    total_passengers BIGINT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    total_flights INTEGER DEFAULT 0,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella rotte
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
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
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense')),
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
    aircraft_id UUID REFERENCES fleet(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella ricerca compagnie
CREATE TABLE IF NOT EXISTS company_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella eventi attivi per le compagnie
CREATE TABLE IF NOT EXISTS active_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES random_events(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabella salvataggi
CREATE TABLE IF NOT EXISTS game_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    save_name VARCHAR(100) NOT NULL,
    game_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, save_name)
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

-- Registra questa versione
INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Schema iniziale completo con tutte le tabelle base')
ON CONFLICT (version) DO NOTHING;
