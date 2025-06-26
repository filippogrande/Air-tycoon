-- Air Tycoon 2 Clone - Database Schema PostgreSQL
-- Versione: 1.0.0
-- Data creazione: 26 giugno 2025

-- Elimina il database se esiste già (opzionale per reset completo)
-- DROP DATABASE IF EXISTS air_tycoon_2;

-- Crea il database
-- CREATE DATABASE air_tycoon_2 WITH ENCODING 'UTF8';

-- Usa il database (da eseguire dopo la connessione)
-- \c air_tycoon_2;

-- Abilita l'estensione UUID per generare ID univoci
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELLE PRINCIPALI
-- =====================================================

-- Tabella aeroporti
CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4) UNIQUE,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    elevation INTEGER DEFAULT 0, -- metri sul livello del mare
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella tipi di aeromobili
CREATE TABLE aircraft_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('regional', 'narrow_body', 'wide_body', 'cargo')),
    capacity INTEGER NOT NULL CHECK (capacity >= 0),
    range_km INTEGER NOT NULL CHECK (range_km > 0),
    fuel_consumption INTEGER NOT NULL CHECK (fuel_consumption > 0), -- litri per 100km
    cruise_speed INTEGER NOT NULL CHECK (cruise_speed > 0), -- km/h
    purchase_price BIGINT NOT NULL CHECK (purchase_price > 0),
    maintenance_cost_per_hour INTEGER NOT NULL CHECK (maintenance_cost_per_hour >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella utenti (per future funzionalità multi-utente)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255), -- Per future implementazioni di autenticazione
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabella compagnie aeree
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    money BIGINT DEFAULT 1000000, -- Denaro in centesimi per evitare problemi di precisione
    reputation INTEGER DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
    founded_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    headquarters_airport_id INTEGER REFERENCES airports(id), -- Foreign key alla tabella airports
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella stato del gioco
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    game_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Data nel gioco
    game_speed DECIMAL(3,1) DEFAULT 1.0,
    is_paused BOOLEAN DEFAULT FALSE,
    version VARCHAR(10) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella aeromobili della flotta
CREATE TABLE fleet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    aircraft_type_id INTEGER REFERENCES aircraft_types(id) NOT NULL,
    registration VARCHAR(20) UNIQUE NOT NULL, -- Codice registrazione aeromobile
    condition INTEGER DEFAULT 100 CHECK (condition >= 0 AND condition <= 100),
    total_flight_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_flight', 'maintenance', 'assigned')),
    location_airport_id INTEGER REFERENCES airports(id),
    total_passengers BIGINT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0, -- In centesimi
    total_flights INTEGER DEFAULT 0,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella rotte
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    origin_airport_id INTEGER REFERENCES airports(id) NOT NULL,
    destination_airport_id INTEGER REFERENCES airports(id) NOT NULL,
    distance_km INTEGER,
    base_price INTEGER DEFAULT 0, -- Prezzo base biglietto in centesimi
    frequency_per_week INTEGER DEFAULT 7 CHECK (frequency_per_week >= 1 AND frequency_per_week <= 21),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'planning')),
    total_flights INTEGER DEFAULT 0,
    total_passengers BIGINT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0, -- In centesimi
    total_costs BIGINT DEFAULT 0, -- In centesimi
    average_load_factor DECIMAL(5,2) DEFAULT 0, -- Percentuale 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT different_airports CHECK (origin_airport_id != destination_airport_id)
);

-- Tabella voli eseguiti (storico)
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    aircraft_id UUID REFERENCES aircraft(id) ON DELETE SET NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE,
    passengers INTEGER DEFAULT 0,
    load_factor DECIMAL(5,2) DEFAULT 0,
    revenue BIGINT DEFAULT 0, -- In centesimi
    costs BIGINT DEFAULT 0, -- In centesimi
    fuel_consumed DECIMAL(10,2) DEFAULT 0, -- Litri
    delay_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella finanze (report mensili)
CREATE TABLE financial_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    report_date DATE NOT NULL, -- Primo giorno del mese del report
    total_revenue BIGINT DEFAULT 0, -- In centesimi
    passenger_revenue BIGINT DEFAULT 0,
    cargo_revenue BIGINT DEFAULT 0,
    other_revenue BIGINT DEFAULT 0,
    total_expenses BIGINT DEFAULT 0,
    fuel_expenses BIGINT DEFAULT 0,
    maintenance_expenses BIGINT DEFAULT 0,
    salary_expenses BIGINT DEFAULT 0,
    airport_fees BIGINT DEFAULT 0,
    marketing_expenses BIGINT DEFAULT 0,
    insurance_expenses BIGINT DEFAULT 0,
    loan_payments BIGINT DEFAULT 0,
    other_expenses BIGINT DEFAULT 0,
    net_profit BIGINT DEFAULT 0, -- total_revenue - total_expenses
    company_money_end BIGINT DEFAULT 0, -- Denaro alla fine del mese
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, report_date)
);

-- Tabella ricerca e sviluppo (per future funzionalità)
CREATE TABLE research_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cost BIGINT NOT NULL, -- In centesimi
    duration_days INTEGER NOT NULL,
    research_points_required INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in-progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella eventi del gioco (crisi, boom economici, etc.)
CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    impact_data JSONB, -- Dati dell'impatto in formato JSON
    event_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella salvataggi completi (backup JSON)
CREATE TABLE game_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    save_name VARCHAR(100),
    save_data JSONB NOT NULL, -- Stato completo del gioco in JSON
    save_type VARCHAR(20) DEFAULT 'auto' CHECK (save_type IN ('auto', 'manual', 'backup')),
    version VARCHAR(10) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDICI PER PERFORMANCE
-- =====================================================

-- Indici per ricerche frequenti
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_aircraft_company_id ON aircraft(company_id);
CREATE INDEX idx_aircraft_status ON aircraft(status);
CREATE INDEX idx_routes_company_id ON routes(company_id);
CREATE INDEX idx_routes_active ON routes(is_active);
CREATE INDEX idx_routes_aircraft ON routes(aircraft_id);
CREATE INDEX idx_flights_route_id ON flights(route_id);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_financial_reports_company_date ON financial_reports(company_id, report_date);
CREATE INDEX idx_game_saves_company_type ON game_saves(company_id, save_type);

-- Indici per join frequenti
CREATE INDEX idx_aircraft_assigned_route ON aircraft(assigned_route_id);

-- =====================================================
-- TRIGGER E FUNZIONI
-- =====================================================

-- Funzione per aggiornare il timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornamento automatico timestamp
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_updated_at BEFORE UPDATE ON aircraft
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON game_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per calcolare automaticamente il profitto nei report finanziari
CREATE OR REPLACE FUNCTION calculate_net_profit()
RETURNS TRIGGER AS $$
BEGIN
    NEW.net_profit = NEW.total_revenue - NEW.total_expenses;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_financial_profit BEFORE INSERT OR UPDATE ON financial_reports
    FOR EACH ROW EXECUTE FUNCTION calculate_net_profit();

-- =====================================================
-- DATI INIZIALI (OPZIONALE)
-- =====================================================

-- Inserisci un utente di esempio (per test)
INSERT INTO users (username, email) VALUES 
('demo_user', 'demo@airtycoon.com');

-- Inserisci progetti di ricerca predefiniti
INSERT INTO research_projects (company_id, project_type, name, description, cost, duration_days, research_points_required) VALUES 
(NULL, 'efficiency', 'Efficienza Carburante', 'Migliora l''efficienza del carburante del 5%', 50000000, 90, 100),
(NULL, 'service', 'Servizi Premium', 'Aumenta la soddisfazione passeggeri e i prezzi', 30000000, 60, 75),
(NULL, 'maintenance', 'Manutenzione Predittiva', 'Riduce i costi di manutenzione del 15%', 75000000, 120, 150),
(NULL, 'navigation', 'Sistemi di Navigazione Avanzati', 'Migliora la puntualità e riduce i costi operativi', 40000000, 75, 90);

-- =====================================================
-- VISTE UTILI
-- =====================================================

-- Vista per statistiche compagnia
CREATE VIEW company_statistics AS
SELECT 
    c.id,
    c.name,
    c.money,
    c.reputation,
    COUNT(DISTINCT a.id) as total_aircraft,
    COUNT(DISTINCT r.id) as total_routes,
    COUNT(DISTINCT CASE WHEN r.is_active THEN r.id END) as active_routes,
    COALESCE(SUM(a.total_passengers), 0) as total_passengers_carried,
    COALESCE(SUM(a.total_revenue), 0) as total_revenue_earned
FROM companies c
LEFT JOIN aircraft a ON c.id = a.company_id
LEFT JOIN routes r ON c.id = r.company_id
GROUP BY c.id, c.name, c.money, c.reputation;

-- Vista per performance rotte
CREATE VIEW route_performance AS
SELECT 
    r.id,
    r.origin_airport || ' → ' || r.destination_airport as route_name,
    r.frequency_per_week,
    r.ticket_price,
    r.average_load_factor,
    r.on_time_performance,
    r.total_revenue - r.total_costs as net_profit,
    a.custom_name as aircraft_name,
    a.aircraft_type
FROM routes r
LEFT JOIN aircraft a ON r.aircraft_id = a.id
WHERE r.is_active = true;

-- =====================================================
-- COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON DATABASE air_tycoon_2 IS 'Database per il gioco Air Tycoon 2 Clone';

COMMENT ON TABLE companies IS 'Compagnie aeree dei giocatori';
COMMENT ON TABLE aircraft IS 'Flotta di aeromobili di ogni compagnia';
COMMENT ON TABLE routes IS 'Rotte aeree operative';
COMMENT ON TABLE flights IS 'Storico dei voli eseguiti';
COMMENT ON TABLE financial_reports IS 'Report finanziari mensili';
COMMENT ON TABLE game_saves IS 'Salvataggi completi del gioco in formato JSON';

COMMENT ON COLUMN companies.money IS 'Denaro in centesimi (per evitare problemi di precisione con decimali)';
COMMENT ON COLUMN aircraft.condition IS 'Condizione dell''aeromobile da 0 (pessima) a 100 (perfetta)';
COMMENT ON COLUMN routes.average_load_factor IS 'Percentuale media di riempimento dei voli';

-- =====================================================
-- GRANT PERMISSIONS (Opzionale - per utente specifico)
-- =====================================================

-- Crea utente per l'applicazione (sostituisci con password sicura)
-- CREATE USER air_tycoon_app WITH PASSWORD 'your_secure_password_here';
-- GRANT CONNECT ON DATABASE air_tycoon_2 TO air_tycoon_app;
-- GRANT USAGE ON SCHEMA public TO air_tycoon_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO air_tycoon_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO air_tycoon_app;

-- =====================================================
-- FINE SETUP DATABASE
-- =====================================================

SELECT 'Database Air Tycoon 2 Clone creato con successo!' as status;
