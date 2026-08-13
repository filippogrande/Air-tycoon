-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Madrid-Barajas Airport', 'MAD', 'LEMD', 'Madrid', 'Spain', 40.4719, -3.5626, 610, 'Europe/Madrid', '1928-04-22', NULL, 4, 4349, 'large', 75, 85),
('Barcelona-El Prat Airport', 'BCN', 'LEBL', 'Barcelona', 'Spain', 41.2971, 2.0785, 4, 'Europe/Madrid', '1963-01-01', NULL, 3, 3500, 'large', 70, 90)
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