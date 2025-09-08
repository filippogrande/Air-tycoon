-- Dati iniziali per la tabella aircraft_types
INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES

-- 1932
('Junkers Ju 52', 'Junkers', 'regional', 10.7, 2.3, 17, 800, 1300, 220, 265, 50000000, 110, 13000, TRUE, FALSE, NULL, 1932, 1955),
('Junkers Ju 52 Cargo', 'Junkers', 'cargo', 10.7, 2.3, 2.5, 800, 1300, 250, 265, 52000000, 120, 13000, TRUE, FALSE, NULL, 1932, 1955),

-- 1934
('de Havilland DH.89 Dragon Rapide', 'de Havilland', 'regional', 8.8, 1.9, 6, 600, 650, 120, 240, 35000000, 100, 12000, TRUE, FALSE, NULL, 1934, 1949),

-- 1935
('Lockheed Model 10 Electra', 'Lockheed', 'regional', 11.0, 2.0, 10, 800, 1200, 200, 300, 45000000, 130, 14000, TRUE, FALSE, NULL, 1935, 1945),
('Lockheed Model 10 Electra Cargo', 'Lockheed', 'cargo', 9.8, 2.0, 1.0, 750, 1300, 220, 325, 47000000, 110, 12000, TRUE, FALSE, NULL, 1935, 1950),

-- 1936
('Douglas DC-3', 'Douglas', 'regional', 15.7, 2.2, 28, 950, 2400, 350, 333, 120000000, 400, 30000, TRUE, FALSE, NULL, 1936, 1950),
('Douglas DC-3 Cargo', 'Douglas', 'cargo', 15.7, 2.2, 3.5, 950, 2400, 370, 333, 130000000, 420, 30000, TRUE, FALSE, NULL, 1936, 1950),

-- 1940
('Douglas DC-4', 'Douglas', 'wide_body', 27.6, 3.5, 44, 1800, 6700, 1200, 450, 220000000, 900, 25000, FALSE, TRUE, 90000000, 1940, 1958),

-- 1942
('Avro York', 'Avro', 'wide_body', 21.3, 3.3, 24, 1500, 4800, 1050, 430, 160000000, 850, 30000, FALSE, FALSE, NULL, 1942, 1957),

-- 1943
('Boeing 307 Stratoliner', 'Boeing', 'wide_body', 14.7, 2.4, 33, 1200, 3900, 600, 340, 125000000, 500, 20000, FALSE, FALSE, NULL, 1943, 1951);
