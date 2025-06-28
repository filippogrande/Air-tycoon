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
    opened_date DATE, -- Data apertura aeroporto
    closed_date DATE, -- Data chiusura aeroporto (NULL se attivo)
    runways_count INTEGER DEFAULT 1 CHECK (runways_count >= 1 AND runways_count <= 10), -- Numero piste
    runway_length_meters INTEGER DEFAULT 2500 CHECK (runway_length_meters >= 800 AND runway_length_meters <= 6000), -- Lunghezza piste in metri
    airport_size VARCHAR(20) DEFAULT 'medium' CHECK (airport_size IN ('small', 'medium', 'large', 'hub')), -- Dimensione aeroporto
    slots_per_hour INTEGER DEFAULT 20 CHECK (slots_per_hour >= 5 AND slots_per_hour <= 200), -- Slot traffico orari
    runway_length_meters INTEGER DEFAULT 2500 CHECK (runway_length_meters >= 800 AND runway_length_meters <= 6000), -- Lunghezza piste in metri
    opened_date DATE, -- Data apertura aeroporto
    closed_date DATE, -- Data eventuale chiusura aeroporto
    business_level INTEGER DEFAULT 50 CHECK (business_level >= 0 AND business_level <= 100), -- Traffico business 0-100
    tourist_level INTEGER DEFAULT 50 CHECK (tourist_level >= 0 AND tourist_level <= 100), -- Traffico turistico 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint per date apertura/chiusura
    CONSTRAINT valid_airport_dates CHECK (closed_date IS NULL OR closed_date > opened_date),
    
    CONSTRAINT valid_airport_dates CHECK (closed_date IS NULL OR closed_date > opened_date)
);

-- Tabella tipi di aeromobili
CREATE TABLE aircraft_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('regional', 'narrow_body', 'wide_body', 'cargo')),
    cabin_length_meters DECIMAL(5,2) NOT NULL CHECK (cabin_length_meters > 0), -- Lunghezza cabina in metri
    cabin_width_meters DECIMAL(4,2) NOT NULL CHECK (cabin_width_meters > 0), -- Larghezza cabina in metri
    max_capacity_passengers INTEGER NOT NULL CHECK (max_capacity_passengers > 0), -- Capacità massima teorica passeggeri
    min_runway_length_meters INTEGER NOT NULL CHECK (min_runway_length_meters >= 800 AND min_runway_length_meters <= 6000), -- Pista minima richiesta
    range_km INTEGER NOT NULL CHECK (range_km > 0),
    fuel_consumption_liters_per_100km INTEGER NOT NULL CHECK (fuel_consumption_liters_per_100km > 0), -- litri per 100km
    cruise_speed INTEGER NOT NULL CHECK (cruise_speed > 0), -- km/h
    purchase_price BIGINT NOT NULL CHECK (purchase_price > 0),
    maintenance_cost_per_hour INTEGER NOT NULL CHECK (maintenance_cost_per_hour >= 0),
    max_flight_hours INTEGER NOT NULL DEFAULT 50000 CHECK (max_flight_hours > 0), -- Ore massime di volo prima del pensionamento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella configurazioni cabina (layout aeromobili)
CREATE TABLE aircraft_configurations (
    id SERIAL PRIMARY KEY,
    aircraft_type_id INTEGER REFERENCES aircraft_types(id) ON DELETE CASCADE,
    configuration_name VARCHAR(100) NOT NULL, -- es: "All Economy", "Business + Economy", "First + Business + Economy"
    configuration_type VARCHAR(20) DEFAULT 'mixed' CHECK (configuration_type IN ('all_economy', 'mixed', 'all_business', 'all_first', 'cargo')),
    first_class_seats INTEGER DEFAULT 0 CHECK (first_class_seats >= 0),
    business_class_seats INTEGER DEFAULT 0 CHECK (business_class_seats >= 0),
    economy_class_seats INTEGER DEFAULT 0 CHECK (economy_class_seats >= 0),
    cargo_volume_cubic_meters DECIMAL(8,2) DEFAULT 0 CHECK (cargo_volume_cubic_meters >= 0), -- Volume cargo in m³
    seat_pitch_economy_cm INTEGER DEFAULT 76 CHECK (seat_pitch_economy_cm >= 60 AND seat_pitch_economy_cm <= 120), -- Passo sedili economy
    seat_pitch_business_cm INTEGER DEFAULT 120 CHECK (seat_pitch_business_cm >= 100 AND seat_pitch_business_cm <= 200), -- Passo sedili business
    seat_pitch_first_cm INTEGER DEFAULT 180 CHECK (seat_pitch_first_cm >= 150 AND seat_pitch_first_cm <= 250), -- Passo sedili first
    total_capacity INTEGER NOT NULL DEFAULT 0, -- Calcolato automaticamente
    configuration_efficiency DECIMAL(3,1) DEFAULT 100.0 CHECK (configuration_efficiency >= 50.0 AND configuration_efficiency <= 120.0), -- Efficienza configurazione %
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(aircraft_type_id, configuration_name)
);

-- Tabella utenti (per gestione multi-save single player)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE, -- Opzionale per future funzionalità online
    password_hash VARCHAR(255), -- Per future implementazioni di autenticazione
    settings JSONB DEFAULT '{}', -- Preferenze audio/grafica/interfaccia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabella compagnie aeree (supporta succursali/subsidiary)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- Per succursali/subsidiary
    name VARCHAR(100) NOT NULL,
    company_type VARCHAR(20) DEFAULT 'normal' CHECK (company_type IN ('low_cost', 'normal', 'luxury', 'cargo')),
    subsidiary_type VARCHAR(20) DEFAULT 'independent' CHECK (subsidiary_type IN ('independent', 'subsidiary', 'division')), -- Tipo relazione con parent
    money BIGINT DEFAULT 1000000, -- Denaro in centesimi per evitare problemi di precisione
    reputation INTEGER DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
    brand_power INTEGER DEFAULT 30 CHECK (brand_power >= 0 AND brand_power <= 100), -- Potenza del marchio
    maintenance_quality INTEGER DEFAULT 50 CHECK (maintenance_quality >= 0 AND maintenance_quality <= 100), -- Qualità manutenzione
    staff_satisfaction INTEGER DEFAULT 50 CHECK (staff_satisfaction >= 0 AND staff_satisfaction <= 100), -- Contentezza personale globale
    safety_rating INTEGER DEFAULT 50 CHECK (safety_rating >= 0 AND safety_rating <= 100), -- Rating di sicurezza
    service_quality INTEGER DEFAULT 50 CHECK (service_quality >= 0 AND service_quality <= 100), -- Qualità del servizio
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
    configuration_id INTEGER REFERENCES aircraft_configurations(id), -- Configurazione cabina specifica
    registration VARCHAR(20) UNIQUE NOT NULL, -- Codice registrazione aeromobile
    custom_name VARCHAR(100), -- Nome personalizzato dell'aeromobile
    condition INTEGER DEFAULT 100 CHECK (condition >= 0 AND condition <= 100),
    total_flight_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('in_delivery', 'available', 'maintenance')),
    location_airport_id INTEGER REFERENCES airports(id),
    maintenance_level INTEGER DEFAULT 100 CHECK (maintenance_level >= 0 AND maintenance_level <= 100),
    next_maintenance_hours DECIMAL(10,2) DEFAULT 500, -- Ore al prossimo controllo
    total_passengers BIGINT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0, -- In centesimi
    total_flights INTEGER DEFAULT 0,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella componenti aeromobili (motori, struttura, sistemi)
CREATE TABLE aircraft_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aircraft_id UUID REFERENCES fleet(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL CHECK (component_type IN ('engines', 'structure', 'avionics', 'hydraulics', 'landing_gear')),
    component_name VARCHAR(100) NOT NULL, -- Nome del componente (es. "Engine 1", "Left Wing", "Navigation System")
    max_flight_hours INTEGER NOT NULL CHECK (max_flight_hours > 0), -- Ore massime del componente
    current_flight_hours DECIMAL(10,2) DEFAULT 0 CHECK (current_flight_hours >= 0),
    condition INTEGER DEFAULT 100 CHECK (condition >= 0 AND condition <= 100),
    last_maintenance TIMESTAMP WITH TIME ZONE,
    maintenance_cost DECIMAL(12,2) DEFAULT 0, -- Costo totale manutenzioni
    replacement_cost DECIMAL(12,2) NOT NULL CHECK (replacement_cost > 0), -- Costo sostituzione
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella timetable settimanali aeromobili
CREATE TABLE aircraft_timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aircraft_id UUID REFERENCES fleet(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL, -- Lunedì della settimana
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Lunedì, 6=Domenica
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('flight', 'maintenance', 'standby')),
    route_id UUID REFERENCES routes(id), -- NULL per maintenance/standby
    departure_time TIME NOT NULL,
    arrival_time TIME,
    estimated_flight_hours DECIMAL(4,2) DEFAULT 0, -- Ore di volo stimate per questa attività
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aircraft_id, week_start_date, day_of_week, departure_time)
);

-- Tabella rotte
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    origin_airport_id INTEGER REFERENCES airports(id) NOT NULL,
    destination_airport_id INTEGER REFERENCES airports(id) NOT NULL,
    distance_km INTEGER,
    economy_price INTEGER DEFAULT 0, -- Prezzo economy class in centesimi
    business_price INTEGER DEFAULT 0, -- Prezzo business class in centesimi
    first_class_price INTEGER DEFAULT 0, -- Prezzo first class in centesimi
    flight_duration_minutes INTEGER, -- Durata volo in minuti (calcolata da distanza + velocità aeromobile)
    marketing_investment BIGINT DEFAULT 0, -- Investimento marketing per questa rotta
    on_time_performance DECIMAL(5,2) DEFAULT 95.0, -- Percentuale puntualità
    customer_satisfaction INTEGER DEFAULT 50 CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 100),
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

-- Tabella servizi disponibili per le rotte
CREATE TABLE route_services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL UNIQUE,
    service_category VARCHAR(30) NOT NULL CHECK (service_category IN ('catering', 'entertainment', 'comfort', 'business', 'premium')),
    description TEXT,
    cost_per_passenger_economy INTEGER DEFAULT 0, -- Costo aggiuntivo per passeggero economy in centesimi
    cost_per_passenger_business INTEGER DEFAULT 0, -- Costo aggiuntivo per passeggero business in centesimi
    cost_per_passenger_first INTEGER DEFAULT 0, -- Costo aggiuntivo per passeggero first in centesimi
    satisfaction_bonus_economy INTEGER DEFAULT 0, -- Bonus soddisfazione economy 0-20
    satisfaction_bonus_business INTEGER DEFAULT 0, -- Bonus soddisfazione business 0-20
    satisfaction_bonus_first INTEGER DEFAULT 0, -- Bonus soddisfazione first 0-20
    price_premium_percent DECIMAL(4,1) DEFAULT 0, -- Aumento prezzo giustificato 0-50%
    required_aircraft_category VARCHAR(20), -- Categoria aeromobile richiesta (NULL = tutti)
    min_flight_duration_minutes INTEGER DEFAULT 0, -- Durata minima volo richiesta
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella servizi assegnati alle rotte
CREATE TABLE route_assigned_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES route_services(id) ON DELETE CASCADE,
    service_class VARCHAR(20) NOT NULL CHECK (service_class IN ('economy', 'business', 'first', 'all')),
    is_enabled BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(route_id, service_id, service_class)
);

-- Tabella voli eseguiti (storico)
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    aircraft_id UUID REFERENCES fleet(id) ON DELETE SET NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_departure_time TIMESTAMP WITH TIME ZONE,
    scheduled_arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    passengers_economy INTEGER DEFAULT 0,
    passengers_business INTEGER DEFAULT 0,
    total_passengers INTEGER DEFAULT 0,
    load_factor DECIMAL(5,2) DEFAULT 0,
    revenue_economy BIGINT DEFAULT 0, -- In centesimi
    revenue_business BIGINT DEFAULT 0, -- In centesimi
    total_revenue BIGINT DEFAULT 0, -- In centesimi
    fuel_costs BIGINT DEFAULT 0,
    airport_fees BIGINT DEFAULT 0,
    crew_costs BIGINT DEFAULT 0,
    total_costs BIGINT DEFAULT 0, -- In centesimi
    fuel_consumed DECIMAL(10,2) DEFAULT 0, -- Litri
    delay_minutes INTEGER DEFAULT 0,
    delay_reason VARCHAR(100),
    weather_conditions VARCHAR(50),
    customer_satisfaction INTEGER DEFAULT 50 CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 100),
    incidents JSONB DEFAULT '[]', -- Eventuali incidenti o problemi
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'in-progress', 'completed', 'cancelled', 'diverted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella finanze (report mensili)
CREATE TABLE financial_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    report_date DATE NOT NULL, -- Primo giorno del mese del report
    company_money_start BIGINT DEFAULT 0, -- Denaro all'inizio del mese in centesimi
    company_money_end BIGINT DEFAULT 0, -- Denaro alla fine del mese in centesimi
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
    -- Gestione aeromobili
    aircraft_purchases_cost BIGINT DEFAULT 0, -- Costo acquisto aeromobili
    aircraft_sales_revenue BIGINT DEFAULT 0, -- Ricavi vendita aeromobili
    aircraft_sales_gain_loss BIGINT DEFAULT 0, -- Guadagno/perdita da vendita (ricavi - valore contabile)
    aircraft_depreciation BIGINT DEFAULT 0, -- Ammortamento aeromobili del mese
    net_profit BIGINT DEFAULT 0, -- total_revenue - total_expenses + aircraft_sales_gain_loss
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, report_date)
);

-- Tabella transazioni aeromobili (acquisti e vendite)
CREATE TABLE aircraft_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    aircraft_id UUID REFERENCES fleet(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    aircraft_registration VARCHAR(20) NOT NULL, -- Manteniamo registrazione anche se aeromobile venduto
    aircraft_type_name VARCHAR(100) NOT NULL, -- Nome tipo aeromobile per storico
    purchase_price BIGINT NOT NULL, -- Prezzo acquisto originale in centesimi
    transaction_price BIGINT NOT NULL, -- Prezzo della transazione in centesimi
    book_value BIGINT NOT NULL, -- Valore contabile al momento transazione
    gain_loss BIGINT DEFAULT 0, -- Guadagno/perdita = transaction_price - book_value (solo per vendite)
    flight_hours_at_transaction DECIMAL(10,2) DEFAULT 0, -- Ore di volo al momento della transazione
    condition_at_transaction INTEGER DEFAULT 100, -- Condizione aeromobile al momento transazione
    transaction_reason TEXT, -- Motivazione vendita/acquisto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Tabella salvataggi completi (multi-save per single player)
CREATE TABLE game_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    save_name VARCHAR(100) NOT NULL,
    save_type VARCHAR(20) DEFAULT 'manual' CHECK (save_type IN ('auto', 'manual', 'backup')),
    current_date DATE NOT NULL, -- Data corrente nel gioco
    game_speed INTEGER DEFAULT 1 CHECK (game_speed IN (1, 2, 5, 10)), -- Velocità simulazione
    game_state JSONB, -- Stato completo opzionale del gioco in JSON
    screenshot_data TEXT, -- Base64 screenshot opzionale per anteprima
    playtime_hours DECIMAL(10,2) DEFAULT 0, -- Ore di gioco totali
    version VARCHAR(10) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, save_name) -- Nome salvataggio unico per utente
);

-- Tabella personale aziendale (numeri aggregati)
CREATE TABLE staff_totals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    pilots_count INTEGER DEFAULT 0,
    cabin_crew_count INTEGER DEFAULT 0,
    maintenance_count INTEGER DEFAULT 0,
    marketing_count INTEGER DEFAULT 0,
    management_count INTEGER DEFAULT 0,
    ground_count INTEGER DEFAULT 0,
    total_monthly_salaries BIGINT DEFAULT 0, -- Totale salari mensili in centesimi
    average_satisfaction INTEGER DEFAULT 50 CHECK (average_satisfaction >= 0 AND average_satisfaction <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id)
);


-- Tabella dipartimenti aziendali
CREATE TABLE company_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    department_type VARCHAR(30) NOT NULL CHECK (department_type IN ('marketing', 'maintenance', 'training', 'safety', 'customer_service', 'operations')),
    investment_level INTEGER DEFAULT 1 CHECK (investment_level >= 1 AND investment_level <= 10), -- Livello investimento
    efficiency_rating INTEGER DEFAULT 50 CHECK (efficiency_rating >= 0 AND efficiency_rating <= 100),
    monthly_budget BIGINT DEFAULT 100000, -- Budget mensile in centesimi
    staff_count INTEGER DEFAULT 5,
    equipment_level INTEGER DEFAULT 1 CHECK (equipment_level >= 1 AND equipment_level <= 10),
    research_points INTEGER DEFAULT 0, -- Punti ricerca accumulati
    active_projects JSONB DEFAULT '[]', -- Progetti attivi del dipartimento
    achievements JSONB DEFAULT '[]', -- Risultati raggiunti
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, department_type)
);



-- Tabella eventi mondo (crisi petrolifere, boom economici, pandemie, etc.)
CREATE TABLE world_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('economic', 'political', 'natural_disaster', 'pandemic', 'oil_crisis', 'technology', 'regulation')),
    severity INTEGER DEFAULT 3 CHECK (severity >= 1 AND severity <= 5), -- 1=minimo, 5=catastrofico
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    affected_regions JSONB DEFAULT '[]', -- Regioni/paesi colpiti
    impact_data JSONB DEFAULT '{}', -- Impatti su domanda, costi, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella eventi specifici della compagnia
CREATE TABLE company_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    impact_data JSONB DEFAULT '{}', -- Dati dell'impatto specifico
    event_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged BOOLEAN DEFAULT FALSE, -- Se il giocatore ha visto l'evento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabella hub aziendali (basi operative)
CREATE TABLE company_hubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    airport_id INTEGER REFERENCES airports(id) NOT NULL,
    hub_type VARCHAR(20) DEFAULT 'secondary' CHECK (hub_type IN ('headquarters', 'primary', 'secondary', 'maintenance')),
    hub_level INTEGER DEFAULT 1 CHECK (hub_level >= 1 AND hub_level <= 5), -- Livello di sviluppo dell'hub
    maintenance_capacity INTEGER DEFAULT 2, -- Numero aeromobili manutenibili simultaneamente
    staff_capacity INTEGER DEFAULT 50, -- Numero massimo staff locale
    monthly_cost BIGINT DEFAULT 100000, -- Costo mensile in centesimi
    facilities JSONB DEFAULT '{}', -- Strutture disponibili (hangar, uffici, training center, etc.)
    established_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, airport_id)
);


-- =====================================================
-- INDICI PER PERFORMANCE
-- =====================================================

-- Indici per ricerche frequenti
CREATE INDEX idx_airports_size_slots ON airports(airport_size, slots_per_hour);
CREATE INDEX idx_airports_runways ON airports(runways_count);
CREATE INDEX idx_airports_runway_length ON airports(runway_length_meters);
CREATE INDEX idx_airports_dates ON airports(opened_date, closed_date);
CREATE INDEX idx_airports_active ON airports(closed_date) WHERE closed_date IS NULL; -- Solo aeroporti attivi
CREATE INDEX idx_aircraft_types_runway_req ON aircraft_types(min_runway_length_meters);
CREATE INDEX idx_aircraft_types_category ON aircraft_types(category);
CREATE INDEX idx_aircraft_configs_type ON aircraft_configurations(aircraft_type_id, configuration_type);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_parent ON companies(parent_company_id);
CREATE INDEX idx_companies_type ON companies(company_type);
CREATE INDEX idx_companies_subsidiary_type ON companies(subsidiary_type);
CREATE INDEX idx_fleet_company_id ON fleet(company_id);
CREATE INDEX idx_fleet_configuration ON fleet(configuration_id);
CREATE INDEX idx_fleet_status ON fleet(status);
CREATE INDEX idx_fleet_location ON fleet(location_airport_id);
CREATE INDEX idx_staff_totals_company_id ON staff_totals(company_id);
CREATE INDEX idx_company_hubs_company_id ON company_hubs(company_id);
CREATE INDEX idx_company_hubs_airport ON company_hubs(airport_id);
CREATE INDEX idx_company_departments_company_id ON company_departments(company_id);
CREATE INDEX idx_routes_company_id ON routes(company_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_flights_route_id ON flights(route_id);
CREATE INDEX idx_flights_aircraft_id ON flights(aircraft_id);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_financial_reports_company_date ON financial_reports(company_id, report_date);

-- Indici per transazioni aeromobili
CREATE INDEX idx_aircraft_transactions_company ON aircraft_transactions(company_id);
CREATE INDEX idx_aircraft_transactions_aircraft ON aircraft_transactions(aircraft_id);
CREATE INDEX idx_aircraft_transactions_type ON aircraft_transactions(transaction_type);
CREATE INDEX idx_aircraft_transactions_date ON aircraft_transactions(transaction_date);
CREATE INDEX idx_aircraft_transactions_company_date ON aircraft_transactions(company_id, transaction_date);

-- Indici per componenti aeromobili
CREATE INDEX idx_aircraft_components_aircraft ON aircraft_components(aircraft_id);
CREATE INDEX idx_aircraft_components_type ON aircraft_components(component_type);
CREATE INDEX idx_aircraft_components_condition ON aircraft_components(condition);
CREATE INDEX idx_aircraft_components_hours ON aircraft_components(current_flight_hours, max_flight_hours);
CREATE INDEX idx_aircraft_components_active ON aircraft_components(aircraft_id, is_active);

-- Indici per timetable aeromobili
CREATE INDEX idx_aircraft_timetables_aircraft ON aircraft_timetables(aircraft_id);
CREATE INDEX idx_aircraft_timetables_week ON aircraft_timetables(week_start_date);
CREATE INDEX idx_aircraft_timetables_activity ON aircraft_timetables(activity_type);
CREATE INDEX idx_aircraft_timetables_route ON aircraft_timetables(route_id);
CREATE INDEX idx_aircraft_timetables_schedule ON aircraft_timetables(aircraft_id, week_start_date, day_of_week);

-- Indici per servizi rotte
CREATE INDEX idx_route_services_category ON route_services(service_category);
CREATE INDEX idx_route_services_active ON route_services(is_active);
CREATE INDEX idx_route_assigned_services_route ON route_assigned_services(route_id);
CREATE INDEX idx_route_assigned_services_service ON route_assigned_services(service_id);
CREATE INDEX idx_route_assigned_services_class ON route_assigned_services(service_class);

CREATE INDEX idx_world_events_active ON world_events(is_active, start_date);
CREATE INDEX idx_company_events_company ON company_events(company_id, is_active);
CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_game_saves_company_id ON game_saves(company_id);
CREATE INDEX idx_game_saves_type ON game_saves(save_type);
CREATE INDEX idx_game_saves_user_name ON game_saves(user_id, save_name);

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
CREATE TRIGGER update_airports_updated_at BEFORE UPDATE ON airports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_types_updated_at BEFORE UPDATE ON aircraft_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_configurations_updated_at BEFORE UPDATE ON aircraft_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fleet_updated_at BEFORE UPDATE ON fleet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_totals_updated_at BEFORE UPDATE ON staff_totals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_hubs_updated_at BEFORE UPDATE ON company_hubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_departments_updated_at BEFORE UPDATE ON company_departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_components_updated_at BEFORE UPDATE ON aircraft_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_timetables_updated_at BEFORE UPDATE ON aircraft_timetables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON game_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_saves_updated_at BEFORE UPDATE ON game_saves
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per calcolare automaticamente il profitto nei report finanziari
CREATE OR REPLACE FUNCTION calculate_net_profit()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcola profitto netto: ricavi operativi - costi operativi + guadagni/perdite da vendita aeromobili
    NEW.net_profit = NEW.total_revenue - NEW.total_expenses + COALESCE(NEW.aircraft_sales_gain_loss, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_financial_profit BEFORE INSERT OR UPDATE ON financial_reports
    FOR EACH ROW EXECUTE FUNCTION calculate_net_profit();

-- Funzione per calcolare automaticamente i totali nei voli
CREATE OR REPLACE FUNCTION calculate_flight_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcola passeggeri totali
    NEW.total_passengers = COALESCE(NEW.passengers_economy, 0) + COALESCE(NEW.passengers_business, 0);
    
    -- Calcola ricavi totali
    NEW.total_revenue = COALESCE(NEW.revenue_economy, 0) + COALESCE(NEW.revenue_business, 0);
    
    -- Calcola costi totali
    NEW.total_costs = COALESCE(NEW.fuel_costs, 0) + COALESCE(NEW.airport_fees, 0) + COALESCE(NEW.crew_costs, 0);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_flight_totals_trigger BEFORE INSERT OR UPDATE ON flights
    FOR EACH ROW EXECUTE FUNCTION calculate_flight_totals();

-- Funzione per verificare che almeno un aeroporto della rotta sia un hub
CREATE OR REPLACE FUNCTION check_route_has_hub()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica che almeno origine o destinazione sia un hub della compagnia
    IF NOT EXISTS (
        SELECT 1 FROM company_hubs 
        WHERE company_id = NEW.company_id 
        AND (airport_id = NEW.origin_airport_id OR airport_id = NEW.destination_airport_id)
    ) THEN
        RAISE EXCEPTION 'Almeno un aeroporto della rotta deve essere un hub della compagnia';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_route_hub_trigger BEFORE INSERT OR UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION check_route_has_hub();

-- Funzione per calcolare automaticamente slots aeroporto
CREATE OR REPLACE FUNCTION calculate_airport_slots()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcola slots_per_hour in base a runways_count e airport_size
    NEW.slots_per_hour = CASE NEW.airport_size
        WHEN 'small' THEN NEW.runways_count * 8
        WHEN 'medium' THEN NEW.runways_count * 12  
        WHEN 'large' THEN NEW.runways_count * 18
        WHEN 'hub' THEN NEW.runways_count * 25
        ELSE NEW.runways_count * 10
    END;
    
    -- Limiti di sicurezza
    IF NEW.slots_per_hour < 5 THEN
        NEW.slots_per_hour = 5;
    ELSIF NEW.slots_per_hour > 200 THEN
        NEW.slots_per_hour = 200;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_airport_slots_trigger BEFORE INSERT OR UPDATE ON airports
    FOR EACH ROW EXECUTE FUNCTION calculate_airport_slots();

-- Funzione per calcolare automaticamente capacità totale configurazione
CREATE OR REPLACE FUNCTION calculate_configuration_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcola capacità totale come somma di tutte le classi
    NEW.total_capacity = COALESCE(NEW.first_class_seats, 0) + 
                         COALESCE(NEW.business_class_seats, 0) + 
                         COALESCE(NEW.economy_class_seats, 0);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_configuration_capacity_trigger BEFORE INSERT OR UPDATE ON aircraft_configurations
    FOR EACH ROW EXECUTE FUNCTION calculate_configuration_capacity();

-- Funzione per verificare compatibilità aeromobile-aeroporto
CREATE OR REPLACE FUNCTION check_aircraft_airport_compatibility(
    aircraft_type_id INTEGER,
    airport_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    min_runway_required INTEGER;
    airport_runway_length INTEGER;
BEGIN
    -- Ottieni lunghezza pista richiesta dall'aeromobile
    SELECT min_runway_length_meters INTO min_runway_required
    FROM aircraft_types 
    WHERE id = aircraft_type_id;
    
    -- Ottieni lunghezza pista dell'aeroporto
    SELECT runway_length_meters INTO airport_runway_length
    FROM airports 
    WHERE id = airport_id;
    
    -- Verifica compatibilità
    RETURN airport_runway_length >= min_runway_required;
END;
$$ language 'plpgsql';

-- Funzione per verificare che aeromobile possa operare dalla location
CREATE OR REPLACE FUNCTION check_fleet_airport_compatibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica solo se viene impostata una location
    IF NEW.location_airport_id IS NOT NULL THEN
        IF NOT check_aircraft_airport_compatibility(NEW.aircraft_type_id, NEW.location_airport_id) THEN
            RAISE EXCEPTION 'Aeromobile % non può operare dall''aeroporto % - pista troppo corta', 
                NEW.registration, NEW.location_airport_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_fleet_compatibility_trigger BEFORE INSERT OR UPDATE ON fleet
    FOR EACH ROW EXECUTE FUNCTION check_fleet_airport_compatibility();

-- Funzione per verificare che almeno un aeroporto della rotta sia un hub
CREATE OR REPLACE FUNCTION check_route_has_hub()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica che almeno origine o destinazione sia un hub della compagnia
    IF NOT EXISTS (
        SELECT 1 FROM company_hubs 
        WHERE company_id = NEW.company_id 
        AND (airport_id = NEW.origin_airport_id OR airport_id = NEW.destination_airport_id)
    ) THEN
        RAISE EXCEPTION 'Almeno un aeroporto della rotta deve essere un hub della compagnia';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_route_hub_trigger BEFORE INSERT OR UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION check_route_has_hub();

-- Funzione per aggiornare le ore di volo dei componenti quando cambiano quelle dell'aeromobile
CREATE OR REPLACE FUNCTION update_component_flight_hours()
RETURNS TRIGGER AS $$
DECLARE
    hours_difference DECIMAL(10,2);
BEGIN
    -- Calcola la differenza nelle ore di volo
    hours_difference := NEW.total_flight_hours - OLD.total_flight_hours;
    
    -- Aggiorna solo se c'è un incremento nelle ore di volo
    IF hours_difference > 0 THEN
        -- Aggiorna tutte le ore dei componenti attivi di questo aeromobile
        UPDATE aircraft_components 
        SET 
            current_flight_hours = current_flight_hours + hours_difference,
            condition = GREATEST(0, condition - (hours_difference * 0.1)::INTEGER), -- Degradamento condizione
            updated_at = CURRENT_TIMESTAMP
        WHERE aircraft_id = NEW.id AND is_active = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_component_hours_trigger AFTER UPDATE OF total_flight_hours ON fleet
    FOR EACH ROW EXECUTE FUNCTION update_component_flight_hours();

-- Funzione per creare componenti standard quando si aggiunge un aeromobile alla flotta
CREATE OR REPLACE FUNCTION create_default_aircraft_components()
RETURNS TRIGGER AS $$
BEGIN
    -- Crea componenti standard per il nuovo aeromobile
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

CREATE TRIGGER create_components_trigger AFTER INSERT ON fleet
    FOR EACH ROW EXECUTE FUNCTION create_default_aircraft_components();

-- Funzione per registrare transazione acquisto aeromobile
CREATE OR REPLACE FUNCTION register_aircraft_purchase()
RETURNS TRIGGER AS $$
DECLARE
    aircraft_type_name VARCHAR(100);
    aircraft_purchase_price BIGINT;
BEGIN
    -- Ottieni nome e prezzo del tipo aeromobile
    SELECT at.name, at.purchase_price 
    INTO aircraft_type_name, aircraft_purchase_price
    FROM aircraft_types at 
    WHERE at.id = NEW.aircraft_type_id;
    
    -- Registra transazione di acquisto
    INSERT INTO aircraft_transactions (
        company_id,
        aircraft_id,
        transaction_type,
        aircraft_registration,
        aircraft_type_name,
        purchase_price,
        transaction_price,
        book_value,
        flight_hours_at_transaction,
        condition_at_transaction,
        transaction_reason
    ) VALUES (
        NEW.company_id,
        NEW.id,
        'purchase',
        NEW.registration,
        aircraft_type_name,
        aircraft_purchase_price,
        aircraft_purchase_price,
        aircraft_purchase_price, -- Valore contabile iniziale = prezzo acquisto
        0, -- Ore di volo iniziali
        NEW.condition,
        'Aircraft purchase'
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER register_purchase_trigger AFTER INSERT ON fleet
    FOR EACH ROW EXECUTE FUNCTION register_aircraft_purchase();

-- Funzione per calcolare durata volo basata su distanza e velocità aeromobile medio
CREATE OR REPLACE FUNCTION calculate_flight_duration(
    route_distance_km INTEGER
) RETURNS INTEGER AS $$
DECLARE
    average_cruise_speed INTEGER;
    duration_hours DECIMAL(4,2);
    duration_minutes INTEGER;
BEGIN
    -- Usa velocità media se non specificato un aeromobile (circa 800 km/h per jet commerciali)
    average_cruise_speed := 800;
    
    -- Calcola durata in ore (distanza / velocità) + 30 minuti per decollo/atterraggio
    duration_hours := (route_distance_km::DECIMAL / average_cruise_speed) + 0.5;
    
    -- Converti in minuti e arrotonda
    duration_minutes := ROUND(duration_hours * 60);
    
    -- Minimo 45 minuti per voli molto corti
    IF duration_minutes < 45 THEN
        duration_minutes := 45;
    END IF;
    
    RETURN duration_minutes;
END;
$$ language 'plpgsql';

-- Trigger per calcolare automaticamente durata volo quando si inserisce/modifica una rotta
CREATE OR REPLACE FUNCTION update_route_flight_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcola durata solo se non è già impostata o se cambia la distanza
    IF NEW.flight_duration_minutes IS NULL OR 
       (OLD.distance_km IS DISTINCT FROM NEW.distance_km) THEN
        NEW.flight_duration_minutes := calculate_flight_duration(NEW.distance_km);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flight_duration_trigger BEFORE INSERT OR UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_route_flight_duration();

-- Funzione per calcolare valore contabile aeromobile con ammortamento
CREATE OR REPLACE FUNCTION calculate_aircraft_book_value(
    aircraft_id_param UUID
) RETURNS BIGINT AS $$
DECLARE
    purchase_price BIGINT;
    current_hours DECIMAL(10,2);
    max_hours INTEGER;
    book_value BIGINT;
    depreciation_rate DECIMAL(5,4);
BEGIN
    -- Ottieni dati aeromobile
    SELECT 
        at_trans.purchase_price,
        f.total_flight_hours,
        at_type.max_flight_hours
    INTO purchase_price, current_hours, max_hours
    FROM fleet f
    JOIN aircraft_types at_type ON f.aircraft_type_id = at_type.id
    JOIN aircraft_transactions at_trans ON f.id = at_trans.aircraft_id 
    WHERE f.id = aircraft_id_param 
    AND at_trans.transaction_type = 'purchase'
    ORDER BY at_trans.transaction_date DESC
    LIMIT 1;
    
    IF purchase_price IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calcola tasso di ammortamento (lineare basato su ore di volo)
    depreciation_rate := current_hours / max_hours;
    
    -- Valore minimo 10% del prezzo originale
    book_value := purchase_price * (1 - depreciation_rate * 0.9);
    
    -- Assicura che non scenda sotto il 10%
    IF book_value < purchase_price * 0.1 THEN
        book_value := purchase_price * 0.1;
    END IF;
    
    RETURN book_value;
END;
$$ language 'plpgsql';

-- Funzione per registrare vendita aeromobile
CREATE OR REPLACE FUNCTION register_aircraft_sale(
    aircraft_id_param UUID,
    sale_price BIGINT,
    sale_reason TEXT DEFAULT 'Aircraft sale'
) RETURNS VOID AS $$
DECLARE
    aircraft_rec RECORD;
    current_book_value BIGINT;
    gain_loss_amount BIGINT;
BEGIN
    -- Ottieni dati aeromobile
    SELECT 
        f.company_id,
        f.registration,
        f.total_flight_hours,
        f.condition,
        at.name as aircraft_type_name,
        at_trans.purchase_price
    INTO aircraft_rec
    FROM fleet f
    JOIN aircraft_types at ON f.aircraft_type_id = at.id
    JOIN aircraft_transactions at_trans ON f.id = at_trans.aircraft_id
    WHERE f.id = aircraft_id_param 
    AND at_trans.transaction_type = 'purchase'
    ORDER BY at_trans.transaction_date DESC
    LIMIT 1;
    
    -- Calcola valore contabile corrente
    current_book_value := calculate_aircraft_book_value(aircraft_id_param);
    
    -- Calcola guadagno/perdita
    gain_loss_amount := sale_price - current_book_value;
    
    -- Registra transazione vendita
    INSERT INTO aircraft_transactions (
        company_id,
        aircraft_id,
        transaction_type,
        aircraft_registration,
        aircraft_type_name,
        purchase_price,
        transaction_price,
        book_value,
        gain_loss,
        flight_hours_at_transaction,
        condition_at_transaction,
        transaction_reason
    ) VALUES (
        aircraft_rec.company_id,
        aircraft_id_param,
        'sale',
        aircraft_rec.registration,
        aircraft_rec.aircraft_type_name,
        aircraft_rec.purchase_price,
        sale_price,
        current_book_value,
        gain_loss_amount,
        aircraft_rec.total_flight_hours,
        aircraft_rec.condition,
        sale_reason
    );
END;
$$ language 'plpgsql';



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

-- Inserisci servizi di rotta predefiniti
INSERT INTO route_services (service_name, service_category, description, 
    cost_per_passenger_economy, cost_per_passenger_business, cost_per_passenger_first,
    satisfaction_bonus_economy, satisfaction_bonus_business, satisfaction_bonus_first,
    price_premium_percent, min_flight_duration_minutes) VALUES 

-- Servizi Catering
('Snack Gratuiti', 'catering', 'Snack e bevande gratuite', 200, 0, 0, 5, 0, 0, 2.0, 60),
('Pasto Completo', 'catering', 'Pasto caldo completo', 800, 1500, 2500, 8, 5, 3, 5.0, 120),
('Menu Gourmet', 'catering', 'Menu preparato da chef stellati', 0, 3000, 5000, 0, 12, 15, 8.0, 180),

-- Servizi Entertainment
('Riviste Gratuite', 'entertainment', 'Selezione di riviste e giornali', 50, 0, 0, 2, 0, 0, 1.0, 45),
('Sistema IFE Base', 'entertainment', 'Intrattenimento audio/video di base', 300, 500, 800, 6, 4, 2, 3.0, 90),
('IFE Premium', 'entertainment', 'Sistema intrattenimento avanzato con Wi-Fi', 800, 1200, 1500, 10, 8, 5, 6.0, 120),

-- Servizi Comfort
('Cuscino e Coperta', 'comfort', 'Set comfort per il riposo', 150, 0, 0, 3, 0, 0, 1.5, 180),
('Kit Amenities', 'comfort', 'Kit con prodotti per l''igiene personale', 400, 800, 1200, 5, 6, 4, 2.5, 240),
('Lounge Access', 'comfort', 'Accesso alle lounge aeroportuali', 0, 2000, 0, 0, 15, 0, 12.0, 0),

-- Servizi Business
('Priority Check-in', 'business', 'Check-in prioritario e fast track', 0, 500, 300, 0, 8, 5, 4.0, 0),
('Bagaglio Extra', 'business', '23kg bagaglio aggiuntivo gratuito', 0, 800, 600, 0, 6, 4, 3.0, 0),
('Seat Selection', 'business', 'Selezione posto gratuita', 300, 0, 0, 4, 0, 0, 2.0, 0),

-- Servizi Premium
('Servizio Maggiordomo', 'premium', 'Assistenza personalizzata dedicata', 0, 0, 8000, 0, 0, 20, 15.0, 300),
('Transfer Limousine', 'premium', 'Transfer privato da/per aeroporto', 0, 0, 12000, 0, 0, 18, 20.0, 0),
('Champagne Welcome', 'premium', 'Champagne di benvenuto', 0, 1500, 3000, 0, 8, 12, 5.0, 120);

-- =====================================================
-- VISTE UTILI
-- =====================================================

-- Vista per statistiche compagnia (incluse succursali)
CREATE VIEW company_statistics AS
SELECT 
    c.id,
    c.name,
    c.company_type,
    c.subsidiary_type,
    pc.name as parent_company_name,
    c.money,
    c.reputation,
    COUNT(DISTINCT f.id) as total_aircraft,
    COUNT(DISTINCT r.id) as total_routes,
    COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as active_routes,
    COALESCE(SUM(f.total_passengers), 0) as total_passengers_carried,
    COALESCE(SUM(f.total_revenue), 0) as total_revenue_earned,
    COUNT(DISTINCT ch.id) as total_hubs
FROM companies c
LEFT JOIN companies pc ON c.parent_company_id = pc.id
LEFT JOIN fleet f ON c.id = f.company_id
LEFT JOIN routes r ON c.id = r.company_id
LEFT JOIN company_hubs ch ON c.id = ch.company_id
GROUP BY c.id, c.name, c.company_type, c.subsidiary_type, pc.name, c.money, c.reputation;

-- Vista per performance rotte con info aeroporti e servizi
CREATE VIEW route_performance AS
SELECT 
    r.id,
    ao.iata_code || ' → ' || ad.iata_code as route_name,
    ao.name as origin_name,
    ad.name as destination_name,
    ao.runway_length_meters as origin_runway_length,
    ad.runway_length_meters as destination_runway_length,
    r.economy_price,
    r.business_price,
    r.first_class_price,
    r.average_load_factor,
    r.on_time_performance,
    r.total_revenue - r.total_costs as net_profit,
    r.distance_km,
    r.flight_duration_minutes,
    -- Frequenza settimanale derivata dal timetable
    COUNT(DISTINCT CASE WHEN at_week.activity_type = 'flight' THEN 
        CONCAT(at_week.day_of_week, '-', at_week.departure_time) END) as weekly_frequency,
    -- Info aeromobili programmati questa settimana
    COUNT(DISTINCT at_week.aircraft_id) as aircraft_scheduled_this_week,
    COALESCE(SUM(at_week.estimated_flight_hours), 0) as total_scheduled_hours,
    -- Servizi attivi sulla rotta
    COUNT(DISTINCT ras.service_id) as active_services_count
FROM routes r
JOIN airports ao ON r.origin_airport_id = ao.id
JOIN airports ad ON r.destination_airport_id = ad.id
LEFT JOIN aircraft_timetables at_week ON r.id = at_week.route_id 
    AND at_week.week_start_date >= CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN route_assigned_services ras ON r.id = ras.route_id AND ras.is_enabled = TRUE
WHERE r.status = 'active'
GROUP BY r.id, ao.iata_code, ao.name, ad.iata_code, ad.name, 
         ao.runway_length_meters, ad.runway_length_meters,
         r.economy_price, r.business_price, r.first_class_price,
         r.average_load_factor, r.on_time_performance, r.total_revenue, 
         r.total_costs, r.distance_km, r.flight_duration_minutes;

-- Vista per gestione slot aeroporti con info piste
CREATE VIEW airport_slot_usage AS
SELECT 
    a.id,
    a.iata_code,
    a.name,
    a.airport_size,
    a.runways_count,
    a.runway_length_meters,
    a.slots_per_hour,
    a.opened_date,
    a.closed_date,
    CASE WHEN a.closed_date IS NULL THEN 'ACTIVE' ELSE 'CLOSED' END as airport_status,
    COUNT(DISTINCT r1.id) + COUNT(DISTINCT r2.id) as total_routes,
    COALESCE(SUM(r1.frequency_per_week), 0) + COALESCE(SUM(r2.frequency_per_week), 0) as weekly_flights,
    ROUND((COALESCE(SUM(r1.frequency_per_week), 0) + COALESCE(SUM(r2.frequency_per_week), 0)) * 1.0 / 7 / a.slots_per_hour * 100, 2) as slot_utilization_percent
FROM airports a
LEFT JOIN routes r1 ON a.id = r1.origin_airport_id AND r1.status = 'active'
LEFT JOIN routes r2 ON a.id = r2.destination_airport_id AND r2.status = 'active'
GROUP BY a.id, a.iata_code, a.name, a.airport_size, a.runways_count, a.runway_length_meters, a.slots_per_hour, a.opened_date, a.closed_date;

-- Vista per flotta con configurazioni dettagliate
CREATE VIEW fleet_detailed AS
SELECT 
    f.id,
    f.registration,
    f.custom_name,
    c.name as company_name,
    at.name as aircraft_type,
    at.manufacturer,
    at.category,
    at.min_runway_length_meters,
    ac.configuration_name,
    ac.configuration_type,
    ac.first_class_seats,
    ac.business_class_seats,
    ac.economy_class_seats,
    ac.total_capacity,
    f.condition,
    f.total_flight_hours,
    f.status,
    ap.name as current_location,
    ap.runway_length_meters as location_runway_length,
    CASE WHEN ap.runway_length_meters >= at.min_runway_length_meters 
         THEN 'COMPATIBLE' 
         ELSE 'INCOMPATIBLE' END as location_compatibility
FROM fleet f
JOIN companies c ON f.company_id = c.id
JOIN aircraft_types at ON f.aircraft_type_id = at.id
LEFT JOIN aircraft_configurations ac ON f.configuration_id = ac.id
LEFT JOIN airports ap ON f.location_airport_id = ap.id;

-- Vista per aeroporti compatibili per tipo aeromobile
CREATE VIEW aircraft_airport_compatibility AS
SELECT 
    at.id as aircraft_type_id,
    at.name as aircraft_name,
    at.min_runway_length_meters,
    a.id as airport_id,
    a.name as airport_name,
    a.iata_code,
    a.runway_length_meters,
    (a.runway_length_meters - at.min_runway_length_meters) as runway_margin_meters,
    CASE WHEN a.closed_date IS NULL THEN 'ACTIVE' ELSE 'CLOSED' END as airport_status
FROM aircraft_types at
CROSS JOIN airports a
WHERE a.runway_length_meters >= at.min_runway_length_meters
ORDER BY at.name, runway_margin_meters DESC;

-- Vista per salvataggi utente
CREATE VIEW user_saves_summary AS
SELECT 
    u.id as user_id,
    u.username,
    gs.id as save_id,
    gs.save_name,
    gs.save_type,
    c.name as company_name,
    c.company_type,
    c.money,
    gs.current_date,
    gs.game_speed,
    gs.playtime_hours,
    gs.created_at,
    gs.updated_at
FROM users u
JOIN game_saves gs ON u.id = gs.user_id
JOIN companies c ON gs.company_id = c.id
ORDER BY gs.updated_at DESC;

-- Vista per manutenzione flotta
CREATE VIEW fleet_maintenance_status AS
SELECT 
    f.id as aircraft_id,
    f.registration,
    f.custom_name,
    at.name as aircraft_type,
    f.status,
    f.total_flight_hours,
    at.max_flight_hours,
    (at.max_flight_hours - f.total_flight_hours) as remaining_hours,
    ROUND((f.total_flight_hours::DECIMAL / at.max_flight_hours) * 100, 2) as utilization_percent,
    f.condition,
    f.maintenance_level,
    f.next_maintenance_hours,
    f.last_maintenance,
    CASE 
        WHEN f.total_flight_hours >= at.max_flight_hours * 0.9 THEN 'CRITICAL'
        WHEN f.total_flight_hours >= at.max_flight_hours * 0.7 THEN 'HIGH'
        WHEN f.condition < 50 OR f.maintenance_level < 30 THEN 'MEDIUM'
        ELSE 'LOW'
    END as maintenance_priority
FROM fleet f
JOIN aircraft_types at ON f.aircraft_type_id = at.id
WHERE f.status != 'in_delivery'
ORDER BY maintenance_priority DESC, f.total_flight_hours DESC;

-- Vista per componenti aeromobili critici
CREATE VIEW aircraft_components_status AS
SELECT 
    ac.id as component_id,
    f.registration,
    f.custom_name,
    ac.component_type,
    ac.component_name,
    ac.current_flight_hours,
    ac.max_flight_hours,
    (ac.max_flight_hours - ac.current_flight_hours) as hours_remaining,
    ROUND((ac.current_flight_hours::DECIMAL / ac.max_flight_hours) * 100, 2) as wear_percent,
    ac.condition,
    ac.replacement_cost,
    ac.maintenance_cost,
    ac.last_maintenance,
    CASE 
        WHEN ac.current_flight_hours >= ac.max_flight_hours * 0.95 THEN 'REPLACE_SOON'
        WHEN ac.current_flight_hours >= ac.max_flight_hours * 0.8 THEN 'MONITOR'
        WHEN ac.condition < 40 THEN 'SERVICE_NEEDED'
        ELSE 'GOOD'
    END as status
FROM aircraft_components ac
JOIN fleet f ON ac.aircraft_id = f.id
WHERE ac.is_active = TRUE
ORDER BY wear_percent DESC, ac.current_flight_hours DESC;

-- Vista per programmazione settimanale aeromobili
CREATE VIEW aircraft_weekly_schedule AS
SELECT 
    at.aircraft_id,
    f.registration,
    f.custom_name,
    at.week_start_date,
    at.day_of_week,
    CASE at.day_of_week 
        WHEN 0 THEN 'Lunedì'
        WHEN 1 THEN 'Martedì'
        WHEN 2 THEN 'Mercoledì'
        WHEN 3 THEN 'Giovedì'
        WHEN 4 THEN 'Venerdì'
        WHEN 5 THEN 'Sabato'
        WHEN 6 THEN 'Domenica'
    END as day_name,
    at.activity_type,
    at.departure_time,
    at.arrival_time,
    at.estimated_flight_hours,
    r.origin_airport_id,
    r.destination_airport_id,
    ao.name as origin_airport,
    ad.name as destination_airport,
    at.notes
FROM aircraft_timetables at
JOIN fleet f ON at.aircraft_id = f.id
LEFT JOIN routes r ON at.route_id = r.id
LEFT JOIN airports ao ON r.origin_airport_id = ao.id
LEFT JOIN airports ad ON r.destination_airport_id = ad.id
ORDER BY at.aircraft_id, at.week_start_date, at.day_of_week, at.departure_time;

-- Vista per servizi rotte dettagliati
CREATE VIEW route_services_detailed AS
SELECT 
    r.id as route_id,
    ao.iata_code || ' → ' || ad.iata_code as route_name,
    rs.service_name,
    rs.service_category,
    rs.description,
    ras.service_class,
    ras.is_enabled,
    CASE ras.service_class
        WHEN 'economy' THEN rs.cost_per_passenger_economy
        WHEN 'business' THEN rs.cost_per_passenger_business
        WHEN 'first' THEN rs.cost_per_passenger_first
        ELSE GREATEST(rs.cost_per_passenger_economy, rs.cost_per_passenger_business, rs.cost_per_passenger_first)
    END as cost_per_passenger,
    CASE ras.service_class
        WHEN 'economy' THEN rs.satisfaction_bonus_economy
        WHEN 'business' THEN rs.satisfaction_bonus_business
        WHEN 'first' THEN rs.satisfaction_bonus_first
        ELSE GREATEST(rs.satisfaction_bonus_economy, rs.satisfaction_bonus_business, rs.satisfaction_bonus_first)
    END as satisfaction_bonus,
    rs.price_premium_percent,
    ras.assigned_at
FROM routes r
JOIN airports ao ON r.origin_airport_id = ao.id
JOIN airports ad ON r.destination_airport_id = ad.id
JOIN route_assigned_services ras ON r.id = ras.route_id
JOIN route_services rs ON ras.service_id = rs.id
WHERE ras.is_enabled = TRUE AND rs.is_active = TRUE
ORDER BY r.id, rs.service_category, ras.service_class;

-- Vista per valore contabile flotta
CREATE VIEW fleet_book_values AS
SELECT 
    f.id as aircraft_id,
    f.registration,
    f.custom_name,
    c.name as company_name,
    at.name as aircraft_type,
    f.total_flight_hours,
    at.max_flight_hours,
    at_trans.purchase_price,
    at_trans.transaction_date as purchase_date,
    ROUND((f.total_flight_hours::DECIMAL / at.max_flight_hours) * 100, 2) as utilization_percent,
    -- Calcolo valore contabile
    GREATEST(
        at_trans.purchase_price * (1 - (f.total_flight_hours / at.max_flight_hours) * 0.9),
        at_trans.purchase_price * 0.1
    )::BIGINT as current_book_value,
    (at_trans.purchase_price - GREATEST(
        at_trans.purchase_price * (1 - (f.total_flight_hours / at.max_flight_hours) * 0.9),
        at_trans.purchase_price * 0.1
    ))::BIGINT as total_depreciation,
    f.condition
FROM fleet f
JOIN companies c ON f.company_id = c.id
JOIN aircraft_types at ON f.aircraft_type_id = at.id
JOIN aircraft_transactions at_trans ON f.id = at_trans.aircraft_id
WHERE at_trans.transaction_type = 'purchase'
ORDER BY c.name, f.registration;

-- Vista per report finanziari dettagliati
CREATE VIEW financial_reports_detailed AS
SELECT 
    fr.*,
    (fr.company_money_end - fr.company_money_start) as money_change,
    CASE 
        WHEN fr.company_money_start > 0 THEN 
            ROUND((fr.net_profit::DECIMAL / fr.company_money_start) * 100, 2)
        ELSE 0
    END as roe_percent, -- Return on Equity
    ROUND((fr.total_revenue::DECIMAL / NULLIF(fr.total_expenses, 0)) * 100, 2) as profit_margin_percent,
    -- Transazioni aeromobili del mese
    COALESCE(at_summary.purchases_count, 0) as aircraft_purchased,
    COALESCE(at_summary.sales_count, 0) as aircraft_sold,
    COALESCE(at_summary.total_purchase_cost, 0) as total_aircraft_purchases,
    COALESCE(at_summary.total_sale_revenue, 0) as total_aircraft_sales
FROM financial_reports fr
LEFT JOIN (
    SELECT 
        company_id,
        DATE_TRUNC('month', transaction_date)::DATE as month_start,
        COUNT(CASE WHEN transaction_type = 'purchase' THEN 1 END) as purchases_count,
        COUNT(CASE WHEN transaction_type = 'sale' THEN 1 END) as sales_count,
        SUM(CASE WHEN transaction_type = 'purchase' THEN transaction_price ELSE 0 END) as total_purchase_cost,
        SUM(CASE WHEN transaction_type = 'sale' THEN transaction_price ELSE 0 END) as total_sale_revenue
    FROM aircraft_transactions
    GROUP BY company_id, DATE_TRUNC('month', transaction_date)::DATE
) at_summary ON fr.company_id = at_summary.company_id 
              AND fr.report_date = at_summary.month_start
ORDER BY fr.company_id, fr.report_date DESC;

-- =====================================================
-- COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON DATABASE air_tycoon_2 IS 'Database per il gioco Air Tycoon 2 Clone - Sistema completo di gestione compagnia aerea con multi-save';

COMMENT ON TABLE airports IS 'Aeroporti con sistema slot orari, date apertura/chiusura e lunghezza piste';
COMMENT ON TABLE aircraft_types IS 'Tipi di aeromobili con dimensioni cabina e requisiti pista';
COMMENT ON TABLE aircraft_configurations IS 'Configurazioni cabina per ogni tipo di aeromobile';
COMMENT ON TABLE users IS 'Utenti del gioco per gestione multi-save in single player';
COMMENT ON TABLE companies IS 'Compagnie aeree dei giocatori con tipologia e supporto succursali';
COMMENT ON TABLE fleet IS 'Flotta di aeromobili con configurazione specifica';
COMMENT ON TABLE staff_totals IS 'Totali del personale per tipologia (numeri aggregati)';
COMMENT ON TABLE company_hubs IS 'Hub operativi della compagnia - ogni volo deve partire/arrivare da un hub';
COMMENT ON TABLE company_departments IS 'Dipartimenti aziendali e relativi investimenti';
COMMENT ON TABLE routes IS 'Rotte aeree operative con pricing per classe e performance dettagliate';
COMMENT ON TABLE route_services IS 'Servizi disponibili da assegnare alle rotte (catering, entertainment, comfort, etc.)';
COMMENT ON TABLE route_assigned_services IS 'Servizi attivamente assegnati alle rotte per classe di servizio';
COMMENT ON TABLE flights IS 'Storico dettagliato dei voli eseguiti';
COMMENT ON TABLE world_events IS 'Eventi del mondo di gioco (crisi, boom economici, etc.)';
COMMENT ON TABLE company_events IS 'Eventi specifici delle compagnie';
COMMENT ON TABLE financial_reports IS 'Report finanziari mensili dettagliati con gestione acquisto/vendita aeromobili';
COMMENT ON TABLE aircraft_transactions IS 'Storico transazioni aeromobili: acquisti e vendite con calcolo guadagni/perdite';
COMMENT ON TABLE game_saves IS 'Salvataggi multipli per utente con info partita';
COMMENT ON TABLE aircraft_components IS 'Componenti critici degli aeromobili con limiti ore di volo e stato manutenzione';
COMMENT ON TABLE aircraft_timetables IS 'Programmazione settimanale aeromobili: voli, manutenzione, standby';

COMMENT ON COLUMN airports.opened_date IS 'Data apertura aeroporto - NULL se sempre esistito';
COMMENT ON COLUMN airports.closed_date IS 'Data chiusura aeroporto - NULL se attivo';
COMMENT ON COLUMN airports.runway_length_meters IS 'Lunghezza piste in metri (tutte uguali)';
COMMENT ON COLUMN airports.slots_per_hour IS 'Slot orari calcolati automaticamente da runways_count * moltiplicatore_dimensione';
COMMENT ON COLUMN airports.airport_size IS 'Dimensione: small(x8), medium(x12), large(x18), hub(x25) slot per pista';
COMMENT ON COLUMN aircraft_types.cabin_length_meters IS 'Lunghezza cabina utilizzabile per passeggeri/cargo';
COMMENT ON COLUMN aircraft_types.cabin_width_meters IS 'Larghezza cabina utilizzabile';
COMMENT ON COLUMN aircraft_types.min_runway_length_meters IS 'Lunghezza minima pista richiesta per operazioni';
COMMENT ON COLUMN aircraft_types.max_capacity_passengers IS 'Capacità massima teorica in configurazione all-economy';
COMMENT ON COLUMN aircraft_configurations.seat_pitch_economy_cm IS 'Passo sedili economy in cm (distanza tra file)';
COMMENT ON COLUMN aircraft_configurations.seat_pitch_business_cm IS 'Passo sedili business in cm';
COMMENT ON COLUMN aircraft_configurations.seat_pitch_first_cm IS 'Passo sedili first class in cm';
COMMENT ON COLUMN aircraft_configurations.total_capacity IS 'Capacità totale calcolata automaticamente';
COMMENT ON COLUMN aircraft_configurations.configuration_efficiency IS 'Efficienza configurazione 50-120% (comfort vs capacità)';
COMMENT ON COLUMN fleet.configuration_id IS 'Configurazione cabina specifica di questo aeromobile';
COMMENT ON COLUMN users.settings IS 'Preferenze utente: audio, grafica, controlli (JSONB)';
COMMENT ON COLUMN companies.parent_company_id IS 'ID compagnia madre per succursali/divisioni';
COMMENT ON COLUMN companies.subsidiary_type IS 'Tipo relazione: independent, subsidiary, division';
COMMENT ON COLUMN companies.company_type IS 'Tipologia compagnia: low_cost, normal, luxury, cargo - influenza prezzi e servizi';
COMMENT ON COLUMN companies.money IS 'Denaro in centesimi (per evitare problemi di precisione con decimali)';
COMMENT ON COLUMN companies.brand_power IS 'Potenza del marchio 0-100, influenza domanda e prezzi';
COMMENT ON COLUMN companies.maintenance_quality IS 'Qualità manutenzione 0-100, influenza affidabilità e sicurezza';
COMMENT ON COLUMN companies.staff_satisfaction IS 'Contentezza generale del personale 0-100';
COMMENT ON COLUMN staff_totals.pilots_count IS 'Numero totale piloti - calcolato automaticamente in base al fabbisogno flotta';
COMMENT ON COLUMN staff_totals.average_satisfaction IS 'Soddisfazione media del personale 0-100';
COMMENT ON COLUMN game_saves.save_name IS 'Nome salvataggio univoco per utente';
COMMENT ON COLUMN game_saves.current_date IS 'Data corrente nel mondo di gioco';
COMMENT ON COLUMN game_saves.game_speed IS 'Velocità simulazione: 1x, 2x, 5x, 10x';
COMMENT ON COLUMN game_saves.playtime_hours IS 'Ore totali di gioco per questo salvataggio';

COMMENT ON COLUMN aircraft_types.max_flight_hours IS 'Ore massime di volo dell''aeromobile prima del pensionamento forzato';
COMMENT ON COLUMN fleet.status IS 'Status realistico: in_delivery (consegna), available (disponibile), maintenance (manutenzione)';
COMMENT ON COLUMN aircraft_components.component_type IS 'Tipo componente: engines, structure, avionics, hydraulics, landing_gear';
COMMENT ON COLUMN aircraft_components.max_flight_hours IS 'Ore massime di funzionamento del componente prima sostituzione obbligatoria';
COMMENT ON COLUMN aircraft_components.current_flight_hours IS 'Ore di volo correnti del componente - aggiornate automaticamente';
COMMENT ON COLUMN aircraft_timetables.week_start_date IS 'Lunedì della settimana di programmazione';
COMMENT ON COLUMN aircraft_timetables.day_of_week IS 'Giorno settimana: 0=Lunedì, 1=Martedì, ..., 6=Domenica';
COMMENT ON COLUMN aircraft_timetables.activity_type IS 'Tipo attività: flight (volo), maintenance (manutenzione), standby (fermo)';
COMMENT ON COLUMN aircraft_timetables.estimated_flight_hours IS 'Ore di volo stimate per questa attività - usate per calcolare usura';

COMMENT ON COLUMN routes.economy_price IS 'Prezzo biglietto economy class in centesimi';
COMMENT ON COLUMN routes.business_price IS 'Prezzo biglietto business class in centesimi';
COMMENT ON COLUMN routes.first_class_price IS 'Prezzo biglietto first class in centesimi';
COMMENT ON COLUMN routes.flight_duration_minutes IS 'Durata volo calcolata automaticamente da distanza e velocità media (800km/h + 30min)';
COMMENT ON COLUMN route_services.cost_per_passenger_economy IS 'Costo aggiuntivo per passeggero economy per questo servizio in centesimi';
COMMENT ON COLUMN route_services.satisfaction_bonus_economy IS 'Bonus soddisfazione passeggeri economy 0-20 punti';
COMMENT ON COLUMN route_services.price_premium_percent IS 'Percentuale di aumento prezzo giustificata dal servizio 0-50%';
COMMENT ON COLUMN route_assigned_services.service_class IS 'Classe di servizio: economy, business, first, all';

COMMENT ON COLUMN financial_reports.company_money_start IS 'Denaro all''inizio del mese in centesimi';
COMMENT ON COLUMN financial_reports.company_money_end IS 'Denaro alla fine del mese in centesimi';
COMMENT ON COLUMN financial_reports.aircraft_purchases_cost IS 'Costo totale acquisti aeromobili del mese';
COMMENT ON COLUMN financial_reports.aircraft_sales_revenue IS 'Ricavi totali vendite aeromobili del mese';
COMMENT ON COLUMN financial_reports.aircraft_sales_gain_loss IS 'Guadagno/perdita da vendite: ricavi - valore contabile';
COMMENT ON COLUMN financial_reports.aircraft_depreciation IS 'Ammortamento aeromobili del mese';
COMMENT ON COLUMN financial_reports.net_profit IS 'Profitto netto: ricavi operativi - costi + guadagni/perdite vendite';
COMMENT ON COLUMN aircraft_transactions.transaction_type IS 'Tipo transazione: purchase (acquisto), sale (vendita)';
COMMENT ON COLUMN aircraft_transactions.book_value IS 'Valore contabile aeromobile al momento della transazione';
COMMENT ON COLUMN aircraft_transactions.gain_loss IS 'Guadagno/perdita = prezzo vendita - valore contabile (solo per vendite)';

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
