-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
('Copenhagen Kastrup Airport', 'CPH', 'EKCH', 'Copenhagen', 'Denmark', 55.6181, 12.6561, 5, 'Europe/Copenhagen', '1925-04-20', NULL, 3, 3600, 'large', 80, 90),
('Billund Airport', 'BLL', 'EKBI', 'Billund', 'Denmark', 55.7403, 9.1518, 75, 'Europe/Copenhagen', '1964-11-01', NULL, 1, 3100, 'medium', 40, 60),
('Aalborg Airport', 'AAL', 'EKYT', 'Aalborg', 'Denmark', 57.0928, 9.8492, 3, 'Europe/Copenhagen', '1938-05-01', NULL, 2, 2549, 'medium', 30, 40),
('Copenhagen Airport (Storico)', 'QCP', 'EKCO', 'Copenhagen', 'Denmark', 55.6800, 12.5833, 5, 'Europe/Copenhagen', '1910-01-01', '1956-12-31', 1, 1200, 'campo_aviazione', 10, 20),
('Roskilde Airfield', 'QRO', 'EKRK', 'Roskilde', 'Denmark', 55.5856, 12.1314, 44, 'Europe/Copenhagen', '1936-01-01', '1980-12-31', 1, 900, 'campo_aviazione', 5, 10),
('Esbjerg Airport', 'EBJ', 'EKEB', 'Esbjerg', 'Denmark', 55.5259, 8.5534, 30, 'Europe/Copenhagen', '1971-04-04', NULL, 1, 2600, 'small', 10, 15),
('Bornholm Airport', 'RNN', 'EKRN', 'Rønne', 'Denmark', 55.0633, 14.7596, 16, 'Europe/Copenhagen', '1940-11-16', NULL, 1, 2000, 'small', 8, 12)
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