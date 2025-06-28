-- Inserisci qui i dati iniziali per la tabella aircraft_types
INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption_liters_per_100km, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES
-- Aeromobili regionali
('ATR 72-600', 'ATR', 'regional', 20.5, 2.57, NULL, 1100, 1665, 450, 510, 2600000000, 1200, 60000, TRUE, FALSE, NULL, 2010, NULL),
('Embraer E175', 'Embraer', 'regional', 29.9, 3.28, NULL, 1600, 3334, 850, 870, 5100000000, 1800, 80000, FALSE, TRUE, 500000000, 2002, NULL),
('Bombardier CRJ900', 'Bombardier', 'regional', 32.5, 2.69, NULL, 1800, 2956, 950, 828, 4700000000, 1700, 75000, FALSE, TRUE, 400000000, 2001, 2023),
-- Aeromobili a corto raggio
('Airbus A220-100', 'Airbus', 'narrow_body', 31.8, 3.28, NULL, 1600, 5741, 2000, 870, 8950000000, 2500, 120000, FALSE, FALSE, NULL, 2016, NULL),
('Airbus A320neo', 'Airbus', 'narrow_body', 33.8, 3.70, NULL, 2100, 6500, 2400, 903, 11060000000, 3000, 150000, FALSE, FALSE, NULL, 2016, NULL),
('Boeing 737-800', 'Boeing', 'narrow_body', 32.2, 3.76, NULL, 2200, 5765, 2500, 852, 10610000000, 3200, 140000, FALSE, FALSE, NULL, 1998, 2020),
('Boeing 737 MAX 8', 'Boeing', 'narrow_body', 32.2, 3.76, NULL, 2100, 6570, 2300, 852, 12160000000, 3100, 150000, FALSE, FALSE, NULL, 2017, NULL),
-- Aeromobili a medio raggio
('Airbus A321neo', 'Airbus', 'narrow_body', 44.5, 3.70, NULL, 2300, 7400, 2800, 903, 12950000000, 3500, 150000, FALSE, FALSE, NULL, 2017, NULL),
('Boeing 757-200', 'Boeing', 'narrow_body', 47.3, 3.54, NULL, 2400, 7222, 3200, 850, 8500000000, 3800, 120000, FALSE, FALSE, NULL, 1983, 2004),
-- Aeromobili a lungo raggio
('Airbus A330-300', 'Airbus', 'wide_body', 58.8, 5.28, NULL, 2500, 11750, 7500, 871, 26420000000, 8000, 160000, FALSE, FALSE, NULL, 1994, NULL),
('Boeing 767-300ER', 'Boeing', 'wide_body', 54.9, 4.72, NULL, 2400, 11093, 6800, 851, 20070000000, 7200, 140000, FALSE, FALSE, NULL, 1988, NULL),
('Boeing 777-200ER', 'Boeing', 'wide_body', 63.7, 5.86, NULL, 3000, 14305, 9500, 892, 30660000000, 9500, 180000, FALSE, FALSE, NULL, 1997, NULL),
('Boeing 787-8', 'Boeing', 'wide_body', 56.7, 5.77, NULL, 2800, 14140, 6800, 903, 24830000000, 7500, 160000, FALSE, FALSE, NULL, 2011, NULL),
('Airbus A350-900', 'Airbus', 'wide_body', 66.8, 5.96, NULL, 2600, 15000, 7200, 903, 31740000000, 8200, 160000, FALSE, FALSE, NULL, 2015, NULL),
-- Aeromobili wide_body molto grandi
('Airbus A380-800', 'Airbus', 'wide_body', 73.0, 6.58, NULL, 3000, 15200, 12000, 903, 44560000000, 15000, 140000, FALSE, FALSE, NULL, 2007, 2021),
('Boeing 747-8', 'Boeing', 'wide_body', 76.3, 6.10, NULL, 3000, 14815, 11000, 917, 41840000000, 12000, 160000, FALSE, FALSE, NULL, 2012, 2022),
-- Cargo
('Boeing 747-8F', 'Boeing', 'cargo', 76.3, 6.10, 137000, 3000, 8130, 11500, 917, 41920000000, 13000, 160000, FALSE, FALSE, NULL, 2012, 2022),
('Airbus A330-200F', 'Airbus', 'cargo', 58.8, 5.28, 70000, 2500, 7400, 8200, 871, 24170000000, 9000, 160000, FALSE, FALSE, NULL, 2010, NULL);
