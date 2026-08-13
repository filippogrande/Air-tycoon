-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Vienna International Airport', 'VIE', 'LOWW', 'Vienna', 'Austria', 48.1103, 16.5697, 183, 'Europe/Vienna', '1954-05-14', NULL, 2, 3600, 'large', 90, 80),
('Salzburg Airport', 'SZG', 'LOWS', 'Salzburg', 'Austria', 47.7933, 13.0043, 430, 'Europe/Vienna', '1926-08-01', NULL, 2, 2750, 'medium', 60, 70),
('Innsbruck Airport', 'INN', 'LOWI', 'Innsbruck', 'Austria', 47.2602, 11.3439, 581, 'Europe/Vienna', '1925-06-01', NULL, 1, 2000, 'medium', 50, 80),
('Graz Airport', 'GRZ', 'LOWG', 'Graz', 'Austria', 46.9911, 15.4397, 340, 'Europe/Vienna', '1937-06-01', NULL, 1, 3000, 'medium', 40, 60),
('Linz Airport', 'LNZ', 'LOWL', 'Linz', 'Austria', 48.2333, 14.1875, 298, 'Europe/Vienna', '1955-01-01', NULL, 1, 3000, 'medium', 35, 50),
('Aspern Airfield', 'QAS', 'LOAA', 'Vienna', 'Austria', 48.2333, 16.4833, 155, 'Europe/Vienna', '1912-01-01', '1977-12-31', 1, 1200, 'campo_aviazione', 10, 10),
('Wiener Neustadt East', 'QWN', 'LOAN', 'Wiener Neustadt', 'Austria', 47.8367, 16.2600, 280, 'Europe/Vienna', '1915-01-01', NULL, 1, 1067, 'campo_aviazione', 8, 8),
('Klagenfurt Airport', 'KLU', 'LOWK', 'Klagenfurt', 'Austria', 46.6425, 14.3372, 448, 'Europe/Vienna', '1914-07-01', NULL, 1, 2720, 'small', 20, 30),
('Hohenems-Dornbirn Airport', 'HOH', 'LOIH', 'Hohenems', 'Austria', 47.3842, 9.6981, 412, 'Europe/Vienna', '1967-01-01', NULL, 1, 630, 'campo_aviazione', 5, 10)
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