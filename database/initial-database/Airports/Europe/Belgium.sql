-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Brussels Airport', 'BRU', 'EBBR', 'Brussels', 'Belgium', 50.9014, 4.4844, 58, 'Europe/Brussels', '1940-01-01', NULL, 3, 3638, 'large', 80, 70),
('Brussels South Charleroi Airport', 'CRL', 'EBCI', 'Charleroi', 'Belgium', 50.4592, 4.4538, 191, 'Europe/Brussels', '1919-01-01', NULL, 2, 2550, 'medium', 40, 30),
('Antwerp International Airport', 'ANR', 'EBAW', 'Antwerp', 'Belgium', 51.1894, 4.4632, 14, 'Europe/Brussels', '1930-01-01', NULL, 1, 1510, 'small', 20, 20),
('Liège Airport', 'LGG', 'EBLG', 'Liège', 'Belgium', 50.6374, 5.4432, 201, 'Europe/Brussels', '1930-01-01', NULL, 2, 3680, 'medium', 30, 40),
('Ostend-Bruges International Airport', 'OST', 'EBOS', 'Ostend', 'Belgium', 51.1989, 2.8622, 4, 'Europe/Brussels', '1916-01-01', NULL, 2, 3200, 'medium', 25, 35),
('Grimbergen Airfield', 'QGR', 'EBGB', 'Grimbergen', 'Belgium', 50.9467, 4.4147, 14, 'Europe/Brussels', '1939-01-01', '1989-12-31', 1, 800, 'campo_aviazione', 5, 5),
('Sint-Truiden Airfield', 'QST', 'EBST', 'Sint-Truiden', 'Belgium', 50.8050, 5.1917, 73, 'Europe/Brussels', '1936-01-01', '1995-12-31', 1, 1200, 'campo_aviazione', 5, 5),
('Kortrijk-Wevelgem International Airport', 'KJK', 'EBKT', 'Kortrijk', 'Belgium', 50.8172, 3.2047, 19, 'Europe/Brussels', '1916-01-01', NULL, 1, 1950, 'small', 10, 10),
('Genk-Zwartberg Airfield', 'QGK', 'EBZW', 'Genk', 'Belgium', 51.0000, 5.5000, 80, 'Europe/Brussels', '1930-01-01', NULL, 1, 900, 'campo_aviazione', 5, 5)
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