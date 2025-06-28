-- Migrazione 0007: Crea tabelle mancanti per il seeding
-- Data: 2025-06-28

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

-- Tabella seat_models
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella world_events
CREATE TABLE IF NOT EXISTS world_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    global_effects JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MIGRAZIONE COMPLETATA
SELECT 'Migrazione 0007 - create missing tables - COMPLETATA' as status;
