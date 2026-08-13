-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Andorra La Seu dUrgell Airport', 'LEU', 'LESU', 'La Seu dUrgell', 'Andorra', 42.3394, 1.4094, 802, 'Europe/Andorra', '1982-06-01', NULL, 1, 1267, 'small', 20, 30),
('Andorra Airfield', 'QAN', 'LQAN', 'Andorra la Vella', 'Andorra', 42.5075, 1.5218, 1023, 'Europe/Andorra', '1930-01-01', '1960-12-31', 1, 600, 'campo_aviazione', 5, 5)
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