-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Larnaca International Airport', 'LCA', 'LCLK', 'Larnaca', 'Cyprus', 34.8751, 33.6232, 2, 'Asia/Nicosia', '1975-02-08', NULL, 2, 2980, 'large', 60, 80),
('Paphos International Airport', 'PFO', 'LCPH', 'Paphos', 'Cyprus', 34.7181, 32.4857, 12, 'Asia/Nicosia', '1983-11-01', NULL, 1, 2700, 'medium', 30, 60),
('Nicosia International Airport', 'NIC', 'LCNC', 'Nicosia', 'Cyprus', 35.1510, 33.2732, 220, 'Asia/Nicosia', '1939-01-01', '1974-07-20', 1, 2200, 'medium', 40, 50),
('Ercan International Airport', 'ECN', 'LCEN', 'Nicosia', 'Cyprus', 35.1547, 33.4961, 122, 'Asia/Nicosia', '1975-02-08', NULL, 1, 2750, 'small', 15, 20)
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