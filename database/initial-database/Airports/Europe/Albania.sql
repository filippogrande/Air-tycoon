-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Tirana International Airport', 'TIA', 'LATI', 'Tirana', 'Albania', 41.4147, 19.7206, 234, 'Europe/Tirane', '1957-04-15', NULL, 1, 3000, 'medium', 70, 60),
('Kukës International Airport', 'KFZ', 'LAKU', 'Kukës', 'Albania', 42.0597, 20.4156, 350, 'Europe/Tirane', '2021-07-09', NULL, 1, 2200, 'small', 30, 20),
('Vlorë Airfield', 'QVO', 'LAVL', 'Vlorë', 'Albania', 40.4667, 19.4833, 5, 'Europe/Tirane', '1920-01-01', '1997-12-31', 1, 1200, 'campo_aviazione', 10, 10),
('Gjirokastër Airfield', 'QGK', 'LAGJ', 'Gjirokastër', 'Albania', 40.0833, 20.1333, 193, 'Europe/Tirane', '1930-01-01', '1990-12-31', 1, 900, 'campo_aviazione', 5, 5),
('Shkodër Airfield', 'QSH', 'LASH', 'Shkodër', 'Albania', 42.0667, 19.5167, 49, 'Europe/Tirane', '1935-01-01', NULL, 1, 1200, 'campo_aviazione', 8, 8),
('Korçë Airfield', 'QKO', 'LAKO', 'Korçë', 'Albania', 40.6167, 20.7667, 880, 'Europe/Tirane', '1935-01-01', NULL, 1, 1000, 'campo_aviazione', 6, 6)
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