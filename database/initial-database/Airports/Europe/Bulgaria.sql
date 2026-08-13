-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Sofia Airport', 'SOF', 'LBSF', 'Sofia', 'Bulgaria', 42.6952, 23.4062, 531, 'Europe/Sofia', '1937-09-01', NULL, 2, 3600, 'large', 60, 50),
('Varna Airport', 'VAR', 'LBWN', 'Varna', 'Bulgaria', 43.2321, 27.8251, 70, 'Europe/Sofia', '1948-05-01', NULL, 2, 2600, 'medium', 30, 40),
('Burgas Airport', 'BOJ', 'LBBG', 'Burgas', 'Bulgaria', 42.5696, 27.5152, 28, 'Europe/Sofia', '1947-06-01', NULL, 2, 3200, 'medium', 25, 35),
('Plovdiv Airport', 'PDV', 'LBPD', 'Plovdiv', 'Bulgaria', 42.0678, 24.8508, 162, 'Europe/Sofia', '1981-05-01', NULL, 1, 2500, 'small', 15, 20),
('Gorna Oryahovitsa Airport', 'GOZ', 'LBGO', 'Gorna Oryahovitsa', 'Bulgaria', 43.1514, 25.7136, 86, 'Europe/Sofia', '1925-01-01', NULL, 1, 2450, 'campo_aviazione', 8, 8),
('Ruse Airfield', 'QRU', 'LBRU', 'Ruse', 'Bulgaria', 43.8447, 25.9561, 45, 'Europe/Sofia', '1930-01-01', '1990-12-31', 1, 1200, 'campo_aviazione', 5, 5),
('Stara Zagora Airfield', 'QSG', 'LBSG', 'Stara Zagora', 'Bulgaria', 42.4258, 25.6522, 185, 'Europe/Sofia', '1935-01-01', NULL, 1, 1000, 'campo_aviazione', 5, 5)
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