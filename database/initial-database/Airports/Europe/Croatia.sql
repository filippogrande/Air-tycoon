-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Zagreb Franjo Tuđman Airport', 'ZAG', 'LDZA', 'Zagreb', 'Croatia', 45.7415, 16.0688, 108, 'Europe/Zagreb', '1991-06-25', NULL, 2, 3250, 'large', 60, 50),
('Split Airport', 'SPU', 'LDSP', 'Split', 'Croatia', 43.5389, 16.2981, 24, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2550, 'medium', 40, 60),
('Dubrovnik Airport', 'DBV', 'LDDU', 'Dubrovnik', 'Croatia', 42.5614, 18.2682, 161, 'Europe/Zagreb', '1991-06-25', NULL, 1, 3300, 'medium', 35, 80),
('Rijeka Airport', 'RJK', 'LDRI', 'Rijeka', 'Croatia', 45.2169, 14.5703, 85, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2500, 'small', 20, 30),
('Pula Airport', 'PUY', 'LDPL', 'Pula', 'Croatia', 44.8935, 13.9222, 84, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2950, 'small', 15, 25),
('Osijek Airport', 'OSI', 'LDOS', 'Osijek', 'Croatia', 45.4627, 18.8102, 89, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2500, 'small', 10, 10),
('Zadar Airport', 'ZAD', 'LDZD', 'Zadar', 'Croatia', 44.1083, 15.3467, 88, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2500, 'small', 10, 15),
('Lošinj Airport', 'LSZ', 'LDLO', 'Mali Lošinj', 'Croatia', 44.5656, 14.3931, 47, 'Europe/Zagreb', '1991-06-25', NULL, 1, 900, 'campo_aviazione', 5, 5)
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