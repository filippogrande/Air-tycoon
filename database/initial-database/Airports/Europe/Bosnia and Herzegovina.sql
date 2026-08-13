-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Sarajevo International Airport', 'SJJ', 'LQSA', 'Sarajevo', 'Bosnia and Herzegovina', 43.8246, 18.3315, 521, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2600, 'medium', 40, 30),
('Tuzla International Airport', 'TZL', 'LQTZ', 'Tuzla', 'Bosnia and Herzegovina', 44.4587, 18.7248, 250, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2500, 'small', 15, 10),
('Mostar International Airport', 'OMO', 'LQMO', 'Mostar', 'Bosnia and Herzegovina', 43.2829, 17.8459, 48, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2400, 'small', 10, 10),
('Banja Luka International Airport', 'BNX', 'LQBK', 'Banja Luka', 'Bosnia and Herzegovina', 44.9414, 17.2975, 122, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2500, 'small', 10, 8)
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