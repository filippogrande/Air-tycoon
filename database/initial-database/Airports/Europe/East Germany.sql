-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Berlin Schönefeld Airport', 'SXF', 'EDDB', 'Berlin', 'East Germany', 52.3800, 13.5225, 48, 'Europe/Berlin', '1946-10-22', '1990-10-03', 1, 3600, 'medium', 30, 40),
('Leipzig/Halle Airport (DDR)', 'LEJ', 'EDDP', 'Leipzig', 'East Germany', 51.4239, 12.2364, 143, 'Europe/Berlin', '1927-04-18', '1990-10-03', 2, 3600, 'medium', 12, 18),
('Dresden Airport (DDR)', 'DRS', 'EDDC', 'Dresden', 'East Germany', 51.1328, 13.7672, 230, 'Europe/Berlin', '1935-07-11', '1990-10-03', 1, 2850, 'medium', 10, 15),
('Erfurt-Weimar Airport (DDR)', 'ERF', 'EDDE', 'Erfurt', 'East Germany', 50.9798, 10.9581, 316, 'Europe/Berlin', '1937-05-01', '1990-10-03', 1, 2600, 'small', 8, 10),
('Rostock-Laage Airport (DDR)', 'RLG', 'ETNL', 'Rostock', 'East Germany', 53.9181, 12.2783, 39, 'Europe/Berlin', '1979-05-01', '1990-10-03', 1, 2500, 'small', 5, 8)
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