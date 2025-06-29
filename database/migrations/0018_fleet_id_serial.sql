-- Migrazione destructive: rimozione uuid come PK (eccetto users)
-- ATTENZIONE: tutti i dati delle tabelle coinvolte andranno persi!

-- Disabilita temporaneamente le foreign key
SET session_replication_role = replica;

-- active_events: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS active_events CASCADE;

-- fleet: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS fleet CASCADE;

-- flights: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS flights CASCADE;

-- company_hubs: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS company_hubs CASCADE;

-- company_research: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS company_research CASCADE;

-- financial_record_items: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS financial_record_items CASCADE;

-- financial_records: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS financial_records CASCADE;

-- routes: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
DROP TABLE IF EXISTS routes CASCADE;

-- user_preferences: id era uuid, ora SERIAL PRIMARY KEY; FK user_id resta uuid (collega a users)
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Ricreo le tabelle con PK integer serial

-- active_events: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE active_events (
  id SERIAL PRIMARY KEY,
  event_id integer,
  started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  company_id integer,
  FOREIGN KEY (event_id) REFERENCES random_events(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- fleet: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE fleet (
  id SERIAL PRIMARY KEY,
  company_id integer,
  aircraft_type_id integer NOT NULL,
  registration character varying NOT NULL,
  condition integer DEFAULT 100,
  total_flight_hours numeric DEFAULT 0,
  status character varying DEFAULT 'available'::character varying,
  location_airport_id integer,
  total_passengers bigint DEFAULT 0,
  total_revenue bigint DEFAULT 0,
  total_flights integer DEFAULT 0,
  purchased_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  last_maintenance timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  hub_id integer,
  FOREIGN KEY (location_airport_id) REFERENCES airports(id),
  FOREIGN KEY (aircraft_type_id) REFERENCES aircraft_types(id),
  FOREIGN KEY (hub_id) REFERENCES company_hubs(id)
);

-- flights: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  route_id integer,
  aircraft_id integer,
  departure_time timestamp with time zone NOT NULL,
  arrival_time timestamp with time zone NOT NULL,
  passenger_load numeric DEFAULT 0,
  revenue bigint DEFAULT 0,
  fuel_cost bigint DEFAULT 0,
  status character varying DEFAULT 'scheduled'::character varying,
  delay_minutes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES routes(id),
  FOREIGN KEY (aircraft_id) REFERENCES fleet(id)
);

-- company_hubs: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE company_hubs (
  id SERIAL PRIMARY KEY,
  airport_id integer NOT NULL,
  hub_level integer DEFAULT 1,
  maintenance_capacity integer DEFAULT 2,
  staff_capacity integer DEFAULT 50,
  monthly_cost bigint DEFAULT 100000,
  facilities jsonb DEFAULT '{}'::jsonb,
  established_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  company_id integer,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (airport_id) REFERENCES airports(id)
);

-- company_research: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE company_research (
  id SERIAL PRIMARY KEY,
  research_event_id integer,
  started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamp with time zone,
  status character varying DEFAULT 'in_progress'::character varying,
  investment_amount bigint NOT NULL,
  company_id integer,
  FOREIGN KEY (research_event_id) REFERENCES research_events(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- financial_record_items: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE financial_record_items (
  id SERIAL PRIMARY KEY,
  record_id integer,
  category character varying NOT NULL,
  amount bigint NOT NULL,
  FOREIGN KEY (record_id) REFERENCES financial_records(id)
);

-- financial_records: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE financial_records (
  id SERIAL PRIMARY KEY,
  period date NOT NULL,
  type character varying NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  company_id integer,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- routes: id era uuid, ora SERIAL PRIMARY KEY; FKs aggiornate da uuid a integer
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  origin_airport_id integer NOT NULL,
  destination_airport_id integer NOT NULL,
  distance_km integer,
  base_price integer DEFAULT 0,
  frequency_per_week integer DEFAULT 7,
  status character varying DEFAULT 'active'::character varying,
  total_flights integer DEFAULT 0,
  total_passengers bigint DEFAULT 0,
  total_revenue bigint DEFAULT 0,
  total_costs bigint DEFAULT 0,
  average_load_factor numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  company_id integer,
  FOREIGN KEY (origin_airport_id) REFERENCES airports(id),
  FOREIGN KEY (destination_airport_id) REFERENCES airports(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- user_preferences: id era uuid, ora SERIAL PRIMARY KEY; FK user_id resta uuid (collega a users)
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id uuid NOT NULL,
  preference_key character varying NOT NULL,
  preference_value text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Riabilita le foreign key
SET session_replication_role = DEFAULT;
