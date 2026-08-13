-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Minsk National Airport', 'MSQ', 'UMMS', 'Minsk', 'Belarus', 53.8825, 27.5375, 204, 'Europe/Minsk', '1991-08-25', NULL, 2, 3640, 'large', 60, 40),
('Brest Airport', 'BQT', 'UMBB', 'Brest', 'Belarus', 52.1083, 23.8981, 137, 'Europe/Minsk', '1991-08-25', NULL, 1, 2600, 'medium', 20, 10),
('Gomel Airport', 'GME', 'UMGG', 'Gomel', 'Belarus', 52.5272, 31.0167, 138, 'Europe/Minsk', '1991-08-25', NULL, 1, 2550, 'medium', 15, 10),
('Hrodna Airport', 'GNA', 'UMMG', 'Hrodna', 'Belarus', 53.6022, 24.0533, 135, 'Europe/Minsk', '1991-08-25', NULL, 1, 2560, 'small', 10, 8),
('Vitebsk Airport', 'VTB', 'UMII', 'Vitebsk', 'Belarus', 55.1265, 30.3496, 205, 'Europe/Minsk', '1991-08-25', NULL, 1, 2600, 'small', 8, 6)
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