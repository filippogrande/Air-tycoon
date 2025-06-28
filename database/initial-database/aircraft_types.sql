-- Inserisci qui i dati iniziali per la tabella aircraft_types
INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           max_capacity_passengers, min_runway_length_meters, range_km, fuel_consumption_liters_per_100km, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours) VALUES
-- Aeromobili regionali
('ATR 72-600', 'ATR', 'regional', 20.5, 2.57, 78, 1100, 1665, 450, 510, 2600000000, 1200, 60000),
('Embraer E175', 'Embraer', 'regional', 29.9, 3.28, 88, 1600, 3334, 850, 870, 5100000000, 1800, 80000),
('Bombardier CRJ900', 'Bombardier', 'regional', 32.5, 2.69, 90, 1800, 2956, 950, 828, 4700000000, 1700, 75000),

-- Aeromobili a corto raggio
('Airbus A220-100', 'Airbus', 'narrow_body', 31.8, 3.28, 135, 1600, 5741, 2000, 870, 8950000000, 2500, 120000),
('Airbus A320neo', 'Airbus', 'narrow_body', 33.8, 3.70, 180, 2100, 6500, 2400, 903, 11060000000, 3000, 150000),
('Boeing 737-800', 'Boeing', 'narrow_body', 32.2, 3.76, 189, 2200, 5765, 2500, 852, 10610000000, 3200, 140000),
('Boeing 737 MAX 8', 'Boeing', 'narrow_body', 32.2, 3.76, 189, 2100, 6570, 2300, 852, 12160000000, 3100, 150000),

-- Aeromobili a medio raggio
('Airbus A321neo', 'Airbus', 'narrow_body', 44.5, 3.70, 244, 2300, 7400, 2800, 903, 12950000000, 3500, 150000),
('Boeing 757-200', 'Boeing', 'narrow_body', 47.3, 3.54, 239, 2400, 7222, 3200, 850, 8500000000, 3800, 120000),

-- Aeromobili a lungo raggio
('Airbus A330-300', 'Airbus', 'wide_body', 58.8, 5.28, 440, 2500, 11750, 7500, 871, 26420000000, 8000, 160000),
('Boeing 767-300ER', 'Boeing', 'wide_body', 54.9, 4.72, 350, 2400, 11093, 6800, 851, 20070000000, 7200, 140000),
('Boeing 777-200ER', 'Boeing', 'wide_body', 63.7, 5.86, 440, 3000, 14305, 9500, 892, 30660000000, 9500, 180000),
('Boeing 787-8', 'Boeing', 'wide_body', 56.7, 5.77, 359, 2800, 14140, 6800, 903, 24830000000, 7500, 160000),
('Airbus A350-900', 'Airbus', 'wide_body', 66.8, 5.96, 440, 2600, 15000, 7200, 903, 31740000000, 8200, 160000),

-- Aeromobili wide_body molto grandi
('Airbus A380-800', 'Airbus', 'wide_body', 73.0, 6.58, 853, 3000, 15200, 12000, 903, 44560000000, 15000, 140000),
('Boeing 747-8', 'Boeing', 'wide_body', 76.3, 6.10, 605, 3000, 14815, 11000, 917, 41840000000, 12000, 160000),

-- Cargo
('Boeing 747-8F', 'Boeing', 'cargo', 76.3, 6.10, 0, 3000, 8130, 11500, 917, 41920000000, 13000, 160000),
('Airbus A330-200F', 'Airbus', 'cargo', 58.8, 5.28, 0, 2500, 7400, 8200, 871, 24170000000, 9000, 160000);
