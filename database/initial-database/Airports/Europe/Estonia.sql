-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Tallinn Lennart Meri Airport', 'TLL', 'EETN', 'Tallinn', 'Estonia', 59.4133, 24.8328, 40, 'Europe/Tallinn', '1991-08-20', NULL, 2, 3070, 'medium', 60, 70),
('Tartu Airport', 'TAY', 'EETU', 'Tartu', 'Estonia', 58.3075, 26.6903, 68, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1799, 'small', 15, 20),
('Pärnu Airport', 'EPU', 'EEPU', 'Pärnu', 'Estonia', 58.4181, 24.4728, 14, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1970, 'small', 10, 15),
('Kuressaare Airport', 'URE', 'EEKE', 'Kuressaare', 'Estonia', 58.2299, 22.5095, 4, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1500, 'campo_aviazione', 5, 8),
('Kärdla Airport', 'KDL', 'EEKA', 'Kärdla', 'Estonia', 58.9908, 22.8307, 6, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1500, 'campo_aviazione', 3, 5)
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