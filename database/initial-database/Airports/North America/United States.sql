-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('John F. Kennedy International Airport', 'JFK', 'KJFK', 'New York', 'United States', 40.6413, -73.7781, 4, 'America/New_York', '1948-07-01', NULL, 4, 4423, 'large', 98, 85),
('Los Angeles International Airport', 'LAX', 'KLAX', 'Los Angeles', 'United States', 33.9425, -118.4081, 38, 'America/Los_Angeles', '1930-10-01', NULL, 4, 3685, 'large', 92, 88),
('O''Hare International Airport', 'ORD', 'KORD', 'Chicago', 'United States', 41.9742, -87.9073, 201, 'America/Chicago', '1955-03-23', NULL, 8, 4115, 'large', 90, 75),
('Miami International Airport', 'MIA', 'KMIA', 'Miami', 'United States', 25.7959, -80.2870, 3, 'America/New_York', '1928-09-01', NULL, 4, 3962, 'large', 80, 92)
ON CONFLICT (iata_code) DO UPDATE SET
    name = EXCLUDED.name,
    icao_code = EXCLUDED.icao_code,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    elevation = EXCLUDED.elevation,
    timezone = EXCLUDED.timezone,
    opened_date = EXCLUDED.opened_date,
    closure_date = EXCLUDED.closure_date,
    runways_count = EXCLUDED.runways_count,
    runway_length_meters = EXCLUDED.runway_length_meters,
    airport_size = EXCLUDED.airport_size,
    business_level = EXCLUDED.business_level,
    tourist_level = EXCLUDED.tourist_level,
    updated_at = CURRENT_TIMESTAMP;