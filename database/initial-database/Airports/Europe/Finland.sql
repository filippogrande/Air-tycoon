-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Helsinki-Vantaa Airport', 'HEL', 'EFHK', 'Helsinki', 'Finland', 60.3172, 24.9633, 55, 'Europe/Helsinki', '1952-07-10', NULL, 3, 3500, 'large', 80, 90),
('Tampere-Pirkkala Airport', 'TMP', 'EFTP', 'Tampere', 'Finland', 61.4142, 23.6044, 119, 'Europe/Helsinki', '1979-01-01', NULL, 2, 2700, 'medium', 30, 40),
('Oulu Airport', 'OUL', 'EFOU', 'Oulu', 'Finland', 64.9301, 25.3546, 15, 'Europe/Helsinki', '1953-06-01', NULL, 2, 2500, 'medium', 25, 30),
('Helsinki-Malmi Airport', 'HEM', 'EFHF', 'Helsinki', 'Finland', 60.2546, 25.0450, 16, 'Europe/Helsinki', '1936-12-16', '2021-12-31', 2, 1300, 'campo_aviazione', 10, 20),
('Rovaniemi Airport', 'RVN', 'EFRO', 'Rovaniemi', 'Finland', 66.5648, 25.8304, 196, 'Europe/Helsinki', '1940-12-15', NULL, 1, 3000, 'small', 10, 15),
('Kuopio Airport', 'KUO', 'EFKU', 'Kuopio', 'Finland', 63.0072, 27.7978, 102, 'Europe/Helsinki', '1939-11-01', NULL, 1, 2800, 'small', 8, 12)
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