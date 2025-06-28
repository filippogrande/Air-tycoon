-- Dati iniziali per Air Tycoon 2 Clone Database
-- Versione: 1.0.0 
-- Compatibile con schema aggiornato al 26 giugno 2025

-- Inizio transazione per garantire consistenza
BEGIN;

-- Inserimento aeroporti principali con tutti i campi richiesti
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
-- Italia - Aeroporti Moderni
('Roma Fiumicino Airport', 'FCO', 'LIRF', 'Rome', 'Italy', 41.8003, 12.2389, 13, 'Europe/Rome', '1961-01-01', NULL, 3, 3902, 'hub', 80, 90),
('Milano Malpensa Airport', 'MXP', 'LIMC', 'Milan', 'Italy', 45.6306, 8.7281, 234, 'Europe/Rome', '1998-10-25', NULL, 2, 3920, 'large', 85, 75),
('Venice Marco Polo Airport', 'VCE', 'LIPZ', 'Venice', 'Italy', 45.5053, 12.3519, 2, 'Europe/Rome', '1960-05-05', NULL, 1, 3300, 'medium', 70, 95),
('Naples International Airport', 'NAP', 'LIRN', 'Naples', 'Italy', 40.8860, 14.2908, 90, 'Europe/Rome', '1910-01-01', NULL, 1, 2628, 'medium', 60, 85),

-- Italia - Aeroporti Storici (per scenari epoca)
('Roma Ciampino Airport', 'CIA', 'LIRA', 'Rome', 'Italy', 41.7994, 12.5949, 105, 'Europe/Rome', '1916-01-01', NULL, 1, 2207, 'medium', 45, 75),
('Milano Linate Airport', 'LIN', 'LIML', 'Milan', 'Italy', 45.4454, 9.2767, 103, 'Europe/Rome', '1937-10-21', NULL, 1, 2442, 'medium', 70, 60),
('Torino Caselle Airport', 'TRN', 'LIMF', 'Turin', 'Italy', 45.2008, 7.6492, 301, 'Europe/Rome', '1953-06-30', NULL, 1, 3300, 'medium', 55, 65),
('Bologna Guglielmo Marconi Airport', 'BLQ', 'LIPE', 'Bologna', 'Italy', 44.5354, 11.2887, 37, 'Europe/Rome', '1931-11-15', NULL, 1, 2800, 'medium', 75, 50),
('Palermo Falcone-Borsellino Airport', 'PMO', 'LICJ', 'Palermo', 'Italy', 38.1759, 13.0910, 14, 'Europe/Rome', '1960-01-10', NULL, 1, 3326, 'medium', 40, 90),
('Torino Aeritalia Airport', 'LIMA', 'LIMA', 'Turin', 'Italy', 45.0850, 7.6050, 288, 'Europe/Rome', '1916-07-10', NULL, 1, 1500, 'small', 30, 40),
('Campo di Marte Airport', 'QCM', 'LIRQ', 'Florence', 'Italy', 43.7800, 11.2700, 50, 'Europe/Rome', '1910-06-01', '1951-12-31', 1, 1200, 'small', 25, 35),
('Guidonia Air Base', 'QGU', 'LIRG', 'Rome', 'Italy', 41.9931, 12.7406, 73, 'Europe/Rome', '1916-01-01', NULL, 1, 1800, 'small', 20, 20),
('Ghedi Air Base', 'GDI', 'LIPL', 'Brescia', 'Italy', 45.4300, 10.2667, 92, 'Europe/Rome', '1931-01-01', NULL, 1, 2991, 'medium', 15, 10),

-- Italia - Aeroporti Storici Chiusi (per realismo storico)
('Roma Urbe Airport', 'QRU', 'LIRU', 'Rome', 'Italy', 41.9519, 12.4994, 24, 'Europe/Rome', '1928-04-15', '1990-12-31', 1, 1100, 'small', 30, 40),
('Milano Bresso Airfield', 'MXB', 'LIMB', 'Milan', 'Italy', 45.5414, 9.2036, 140, 'Europe/Rome', '1912-05-01', '1985-10-15', 1, 900, 'small', 40, 20),
('Napoli Capodichino (Storico)', 'NAX', 'LIRX', 'Naples', 'Italy', 40.8854, 14.2905, 90, 'Europe/Rome', '1910-01-01', '1995-06-30', 1, 1800, 'small', 35, 60),

-- Italia - Aeroporti Regionali Minori (attivi in epoche diverse)
('Catania Fontanarossa Airport', 'CTA', 'LICC', 'Catania', 'Italy', 37.4668, 15.0664, 11, 'Europe/Rome', '1924-05-15', NULL, 1, 2435, 'medium', 35, 85),
('Bari Karol Wojtyla Airport', 'BRI', 'LIBD', 'Bari', 'Italy', 41.1389, 16.7606, 48, 'Europe/Rome', '1930-09-20', NULL, 1, 2400, 'medium', 50, 70),
('Florence Amerigo Vespucci Airport', 'FLR', 'LIRQ', 'Florence', 'Italy', 43.8100, 11.2051, 50, 'Europe/Rome', '1931-02-16', NULL, 1, 1750, 'small', 60, 95),
('Genoa Cristoforo Colombo Airport', 'GOA', 'LIMJ', 'Genoa', 'Italy', 44.4133, 8.8375, 4, 'Europe/Rome', '1962-07-17', NULL, 1, 3065, 'medium', 65, 55),
('Verona Villafranca Airport', 'VRN', 'LIPX', 'Verona', 'Italy', 45.3957, 10.8885, 68, 'Europe/Rome', '1937-03-10', NULL, 1, 3000, 'small', 45, 80),
('Cagliari Elmas Airport', 'CAG', 'LIEE', 'Cagliari', 'Italy', 39.2515, 9.0543, 4, 'Europe/Rome', '1937-11-28', NULL, 1, 2700, 'medium', 35, 90),

-- Europa
('London Heathrow Airport', 'LHR', 'EGLL', 'London', 'United Kingdom', 51.4706, -0.4619, 25, 'Europe/London', '1946-03-31', NULL, 2, 3902, 'hub', 95, 70),
('Charles de Gaulle Airport', 'CDG', 'LFPG', 'Paris', 'France', 49.0097, 2.5479, 119, 'Europe/Paris', '1974-03-08', NULL, 4, 4215, 'hub', 90, 80),
('Frankfurt Airport', 'FRA', 'EDDF', 'Frankfurt', 'Germany', 50.0264, 8.5431, 111, 'Europe/Berlin', '1936-07-08', NULL, 4, 4000, 'hub', 93, 65),
('Amsterdam Airport Schiphol', 'AMS', 'EHAM', 'Amsterdam', 'Netherlands', 52.3086, 4.7639, -3, 'Europe/Amsterdam', '1967-04-03', NULL, 6, 3800, 'hub', 85, 78),
('Madrid-Barajas Airport', 'MAD', 'LEMD', 'Madrid', 'Spain', 40.4719, -3.5626, 610, 'Europe/Madrid', '1928-04-22', NULL, 4, 4349, 'large', 75, 85),
('Barcelona-El Prat Airport', 'BCN', 'LEBL', 'Barcelona', 'Spain', 41.2971, 2.0785, 4, 'Europe/Madrid', '1963-01-01', NULL, 3, 3500, 'large', 70, 90),

-- Nord America
('John F. Kennedy International Airport', 'JFK', 'KJFK', 'New York', 'United States', 40.6413, -73.7781, 4, 'America/New_York', '1948-07-01', NULL, 4, 4423, 'hub', 98, 85),
('Los Angeles International Airport', 'LAX', 'KLAX', 'Los Angeles', 'United States', 33.9425, -118.4081, 38, 'America/Los_Angeles', '1930-10-01', NULL, 4, 3685, 'hub', 92, 88),
('O''Hare International Airport', 'ORD', 'KORD', 'Chicago', 'United States', 41.9742, -87.9073, 201, 'America/Chicago', '1955-03-23', NULL, 8, 4115, 'hub', 90, 75),
('Miami International Airport', 'MIA', 'KMIA', 'Miami', 'United States', 25.7959, -80.2870, 3, 'America/New_York', '1928-09-01', NULL, 4, 3962, 'large', 80, 92),
('Toronto Pearson International Airport', 'YYZ', 'CYYZ', 'Toronto', 'Canada', 43.6777, -79.6248, 173, 'America/Toronto', '1972-02-28', NULL, 5, 3389, 'large', 85, 70),

-- Asia
('Tokyo Haneda Airport', 'HND', 'RJTT', 'Tokyo', 'Japan', 35.5494, 139.7798, 6, 'Asia/Tokyo', '1931-08-25', NULL, 4, 3000, 'hub', 87, 70),
('Singapore Changi Airport', 'SIN', 'WSSS', 'Singapore', 'Singapore', 1.3644, 103.9915, 7, 'Asia/Singapore', '1981-07-01', NULL, 4, 4000, 'hub', 85, 75),
('Hong Kong International Airport', 'HKG', 'VHHH', 'Hong Kong', 'Hong Kong', 22.3080, 113.9185, 9, 'Asia/Hong_Kong', '1998-07-06', NULL, 2, 3800, 'hub', 90, 80),
('Beijing Capital International Airport', 'PEK', 'ZBAA', 'Beijing', 'China', 40.0799, 116.6031, 35, 'Asia/Shanghai', '1958-03-02', NULL, 3, 3800, 'hub', 85, 75),
('Dubai International Airport', 'DXB', 'OMDB', 'Dubai', 'UAE', 25.2532, 55.3657, 19, 'Asia/Dubai', '1960-09-30', NULL, 2, 4000, 'hub', 88, 85),

-- Oceania
('Sydney Kingsford Smith Airport', 'SYD', 'YSSY', 'Sydney', 'Australia', -33.9399, 151.1753, 6, 'Australia/Sydney', '1919-12-09', NULL, 3, 3962, 'large', 80, 85),
('Melbourne Airport', 'MEL', 'YMML', 'Melbourne', 'Australia', -37.6690, 144.8410, 132, 'Australia/Melbourne', '1970-07-01', NULL, 2, 3657, 'large', 75, 80);

-- Inserimento tipi di aeromobili con tutti i campi richiesti
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

-- Inserimento eventi di ricerca tecnologica
INSERT INTO research_events (name, description, cost, duration_days, requirements, effects) VALUES
('Fuel Efficiency Program', 'Research program to improve fuel efficiency across the fleet', 5000000, 180, '{"min_aircraft": 5}', '{"fuel_reduction": 0.1}'),
('Advanced Navigation Systems', 'Upgrade navigation systems for better route optimization', 3000000, 120, '{"min_routes": 10}', '{"time_reduction": 0.05}'),
('Customer Service Enhancement', 'Improve customer service to increase satisfaction and reputation', 2000000, 90, '{"min_reputation": 60}', '{"reputation_boost": 10}'),
('Maintenance Optimization', 'Optimize maintenance procedures to reduce costs and downtime', 4000000, 150, '{"min_aircraft": 10}', '{"maintenance_reduction": 0.15}'),
('Route Analysis AI', 'Implement AI for better route profitability analysis', 6000000, 200, '{"min_routes": 20}', '{"revenue_boost": 0.08}');

-- Inserimento eventi casuali
INSERT INTO random_events (name, description, probability, effects, duration_days) VALUES
('Fuel Price Spike', 'Global fuel prices increase significantly', 0.15, '{"fuel_cost_multiplier": 1.3}', 30),
('Economic Boom', 'Economic growth increases passenger demand', 0.10, '{"demand_multiplier": 1.2}', 60),
('Airport Strike', 'Strikes at major airports disrupt operations', 0.05, '{"revenue_multiplier": 0.8}', 7),
('New Competitor', 'A new airline enters your main markets', 0.08, '{"competition_increase": 0.15}', 90),
('Tourism Campaign', 'Government tourism campaign boosts travel', 0.12, '{"passenger_boost": 0.1}', 45),
('Maintenance Issue', 'Fleet-wide maintenance issue discovered', 0.06, '{"maintenance_cost_multiplier": 2.0}', 14),
('Fuel Discount Deal', 'Special deal with fuel supplier', 0.08, '{"fuel_cost_multiplier": 0.8}', 90),
('Perfect Weather', 'Excellent weather reduces delays and costs', 0.20, '{"operational_efficiency": 1.1}', 30);

-- Inserimento configurazioni aeromobili con campi corretti
INSERT INTO aircraft_configurations (aircraft_type_id, configuration_name, configuration_type, 
                                    first_class_seats, business_class_seats, economy_class_seats, cargo_volume_cubic_meters,
                                    seat_pitch_economy_cm, seat_pitch_business_cm, seat_pitch_first_cm, configuration_efficiency) VALUES
-- ATR 72-600 (ID 1)
(1, 'ATR 72 Standard', 'all_economy', 0, 0, 78, 0, 79, 0, 0, 95.0),
(1, 'ATR 72 Comfort', 'mixed', 0, 8, 70, 0, 84, 102, 0, 90.0),

-- Embraer E175 (ID 2)
(2, 'E175 Standard', 'all_economy', 0, 0, 88, 0, 79, 0, 0, 92.0),
(2, 'E175 Premium', 'mixed', 0, 12, 76, 0, 81, 102, 0, 88.0),

-- Bombardier CRJ900 (ID 3)
(3, 'CRJ900 Standard', 'all_economy', 0, 0, 90, 0, 79, 0, 0, 90.0),

-- Airbus A220-100 (ID 4)
(4, 'A220 Economy', 'all_economy', 0, 0, 135, 0, 81, 0, 0, 93.0),
(4, 'A220 Mixed', 'mixed', 0, 15, 120, 0, 81, 102, 0, 88.0),

-- Airbus A320neo (ID 5)
(5, 'A320 High Density', 'all_economy', 0, 0, 180, 0, 79, 0, 0, 95.0),
(5, 'A320 Standard', 'all_economy', 0, 0, 174, 0, 81, 0, 0, 92.0),
(5, 'A320 Business', 'mixed', 0, 30, 150, 0, 81, 102, 0, 85.0),

-- Boeing 737-800 (ID 6)
(6, 'B737 High Density', 'all_economy', 0, 0, 189, 0, 79, 0, 0, 95.0),
(6, 'B737 Standard', 'all_economy', 0, 0, 162, 0, 81, 0, 0, 90.0),
(6, 'B737 Mixed', 'mixed', 0, 18, 144, 0, 81, 102, 0, 85.0),

-- Boeing 737 MAX 8 (ID 7)
(7, '737 MAX Economy', 'all_economy', 0, 0, 189, 0, 79, 0, 0, 95.0),
(7, '737 MAX Premium', 'mixed', 0, 27, 162, 0, 81, 102, 0, 88.0),

-- Airbus A321neo (ID 8)
(8, 'A321 High Density', 'all_economy', 0, 0, 244, 0, 79, 0, 0, 96.0),
(8, 'A321 Standard', 'all_economy', 0, 0, 220, 0, 81, 0, 0, 92.0),
(8, 'A321 Business', 'mixed', 0, 60, 184, 0, 81, 102, 0, 85.0),

-- Boeing 757-200 (ID 9)
(9, 'B757 Economy', 'all_economy', 0, 0, 239, 0, 81, 0, 0, 92.0),
(9, 'B757 Mixed', 'mixed', 0, 39, 200, 0, 81, 102, 0, 87.0),

-- Airbus A330-300 (ID 10)
(10, 'A330 High Density', 'all_economy', 0, 0, 440, 0, 79, 0, 0, 95.0),
(10, 'A330 Standard', 'mixed', 0, 42, 277, 0, 81, 152, 0, 85.0),
(10, 'A330 Premium', 'mixed', 6, 28, 250, 0, 81, 152, 203, 80.0),

-- Boeing 767-300ER (ID 11)
(11, 'B767 Economy', 'all_economy', 0, 0, 350, 0, 81, 0, 0, 92.0),
(11, 'B767 Mixed', 'mixed', 0, 35, 269, 0, 81, 152, 0, 87.0),

-- Boeing 777-200ER (ID 12)
(12, 'B777 High Density', 'all_economy', 0, 0, 440, 0, 79, 0, 0, 95.0),
(12, 'B777 Standard', 'mixed', 8, 37, 305, 0, 81, 152, 203, 82.0),
(12, 'B777 Premium', 'mixed', 8, 28, 266, 0, 84, 152, 203, 78.0),

-- Boeing 787-8 (ID 13)
(13, 'B787 Economy', 'all_economy', 0, 0, 359, 0, 81, 0, 0, 92.0),
(13, 'B787 Standard', 'mixed', 0, 28, 242, 0, 81, 152, 0, 85.0),
(13, 'B787 Premium', 'mixed', 8, 28, 211, 0, 84, 152, 203, 80.0),

-- Airbus A350-900 (ID 14)
(14, 'A350 Economy', 'all_economy', 0, 0, 440, 0, 79, 0, 0, 95.0),
(14, 'A350 Standard', 'mixed', 0, 42, 325, 0, 81, 152, 0, 88.0),
(14, 'A350 Premium', 'mixed', 12, 42, 253, 0, 84, 152, 203, 82.0),

-- Airbus A380-800 (ID 15)
(15, 'A380 High Density', 'all_economy', 0, 0, 853, 0, 79, 0, 0, 96.0),
(15, 'A380 Standard', 'mixed', 14, 96, 525, 0, 81, 152, 203, 85.0),
(15, 'A380 Luxury', 'mixed', 14, 76, 399, 0, 84, 152, 203, 78.0),

-- Boeing 747-8 (ID 16)
(16, 'B747 Economy', 'all_economy', 0, 0, 605, 0, 81, 0, 0, 92.0),
(16, 'B747 Mixed', 'mixed', 8, 58, 410, 0, 81, 152, 203, 83.0),

-- Boeing 747-8F (ID 17) - Cargo
(17, 'B747F Cargo', 'cargo', 0, 0, 0, 858.4, 0, 0, 0, 98.0),

-- Airbus A330-200F (ID 18) - Cargo
(18, 'A330F Cargo', 'cargo', 0, 0, 0, 475.0, 0, 0, 0, 95.0);

-- Inserimento servizi di bordo
INSERT INTO route_services (name, category, cost_per_passenger, description, class_restriction) VALUES
-- Servizi Economy
('Basic Meal', 'meal', 8.50, 'Standard economy meal service', 'economy'),
('Snack Service', 'meal', 3.20, 'Light snack and beverage service', 'economy'),
('Premium Economy Meal', 'meal', 15.00, 'Enhanced meal service for premium economy', 'economy'),

-- Servizi Business
('Business Meal', 'meal', 35.00, 'Multi-course business class meal', 'business'),
('Premium Beverages', 'beverage', 12.00, 'Premium alcoholic and non-alcoholic beverages', 'business'),
('Priority Boarding', 'service', 5.00, 'Priority boarding service', 'business'),

-- Servizi First Class
('First Class Dining', 'meal', 85.00, 'Gourmet dining experience', 'first'),
('Champagne Service', 'beverage', 25.00, 'Premium champagne and wine selection', 'first'),
('Personal Concierge', 'service', 50.00, 'Dedicated personal service', 'first'),

-- Servizi Entertainment
('WiFi Basic', 'entertainment', 12.00, 'Basic internet connectivity', 'all'),
('WiFi Premium', 'entertainment', 25.00, 'High-speed internet connectivity', 'all'),
('IFE System', 'entertainment', 8.00, 'In-flight entertainment system', 'all'),
('Live TV', 'entertainment', 15.00, 'Live television streaming', 'all'),

-- Servizi Comfort
('Extra Legroom', 'comfort', 45.00, 'Seats with additional legroom', 'economy'),
('Amenity Kit', 'comfort', 18.00, 'Travel amenity kit', 'business'),
('Blanket & Pillow', 'comfort', 8.00, 'Premium blanket and pillow set', 'all'),

-- Servizi Speciali
('Unaccompanied Minor', 'special', 50.00, 'Special service for children traveling alone', 'all'),
('Pet Transport', 'special', 150.00, 'Pet transportation service', 'all'),
('Medical Assistance', 'special', 100.00, 'Special medical assistance service', 'all');

-- Inserimento utenti di esempio per testing
INSERT INTO users (username, settings) VALUES
('player1', '{"theme": "dark", "sound_enabled": true, "auto_save": true, "language": "en"}'),
('demo_user', '{"theme": "light", "sound_enabled": false, "auto_save": false, "language": "it"}');

-- Inserimento compagnie aeree di esempio con tutti i campi richiesti
INSERT INTO companies (name, company_type, money, reputation, brand_power, maintenance_quality, 
                      staff_satisfaction, safety_rating, service_quality, headquarters_airport_id) VALUES
('AirItalia Express', 'low_cost', 1500000000, 65, 45, 60, 70, 75, 65, 1), -- FCO Rome
('European Sky', 'normal', 8500000000, 78, 70, 75, 75, 80, 78, 7), -- FRA Frankfurt  
('Luxury Wings', 'luxury', 25000000000, 88, 90, 90, 85, 95, 92, 5), -- LHR London
('Global Cargo Solutions', 'cargo', 12000000000, 72, 55, 80, 68, 85, 70, 8), -- AMS Amsterdam
('Mediterranean Air', 'normal', 4500000000, 71, 60, 70, 73, 78, 74, 9); -- MAD Madrid

-- Prima di aggiungere i salvataggi, dobbiamo avere gli ID delle compagnie
-- Prendiamo l'ID della prima compagnia creata per associarla al primo utente
UPDATE companies SET user_id = (SELECT id FROM users WHERE username = 'player1' LIMIT 1) WHERE name = 'AirItalia Express';
UPDATE companies SET user_id = (SELECT id FROM users WHERE username = 'demo_user' LIMIT 1) WHERE name = 'European Sky';

-- Inserimento salvataggi di esempio
INSERT INTO game_saves (user_id, company_id, save_name, current_date, game_speed, playtime_hours) VALUES
((SELECT id FROM users WHERE username = 'player1'), 
 (SELECT id FROM companies WHERE name = 'AirItalia Express'), 
 'New Company Start', '2024-01-01 00:00:00+00', 1.0, 0.5),
((SELECT id FROM users WHERE username = 'demo_user'), 
 (SELECT id FROM companies WHERE name = 'European Sky'), 
 'Demo Game', '2024-06-15 12:30:00+00', 2.0, 25.7);

-- Inserimento stati di gioco
INSERT INTO game_states (company_id, game_date, game_speed) VALUES
((SELECT id FROM companies WHERE name = 'AirItalia Express'), '2024-01-01 00:00:00+00', 1.0),
((SELECT id FROM companies WHERE name = 'European Sky'), '2024-06-15 12:30:00+00', 2.0);

-- Inserimento dati staff totali per le compagnie
INSERT INTO staff_totals (company_id, pilots, cabin_crew, ground_crew, technicians, management, 
                         total_staff_cost, avg_satisfaction) VALUES
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 25, 60, 45, 20, 8, 125000000, 70),
((SELECT id FROM companies WHERE name = 'European Sky'), 150, 380, 220, 95, 35, 850000000, 75),
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 85, 200, 120, 55, 25, 650000000, 85),
((SELECT id FROM companies WHERE name = 'Global Cargo Solutions'), 45, 15, 85, 40, 18, 380000000, 68),
((SELECT id FROM companies WHERE name = 'Mediterranean Air'), 65, 145, 95, 35, 15, 420000000, 73);

-- Inserimento dipartimenti aziendali per le compagnie
INSERT INTO company_departments (company_id, department_name, staff_count, monthly_cost, efficiency_rating) VALUES
-- AirItalia Express
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 'Operations', 45, 3200000, 75),
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 'Maintenance', 35, 2800000, 70),
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 'Customer Service', 25, 1500000, 68),
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 'Marketing', 12, 850000, 72),

-- European Sky
((SELECT id FROM companies WHERE name = 'European Sky'), 'Operations', 280, 22000000, 82),
((SELECT id FROM companies WHERE name = 'European Sky'), 'Maintenance', 185, 16500000, 80),
((SELECT id FROM companies WHERE name = 'European Sky'), 'Customer Service', 150, 9200000, 78),
((SELECT id FROM companies WHERE name = 'European Sky'), 'Marketing', 85, 7500000, 85),
((SELECT id FROM companies WHERE name = 'European Sky'), 'Finance', 45, 5200000, 80),

-- Luxury Wings
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 'Operations', 180, 28000000, 90),
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 'Maintenance', 125, 22000000, 92),
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 'Customer Service', 95, 12500000, 95),
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 'Marketing', 65, 11000000, 88),
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 'VIP Services', 35, 8500000, 90);


-- Inserimento eventi mondiali di esempio
INSERT INTO world_events (name, description, event_type, start_date, end_date, global_effects) VALUES
('Fuel Crisis 2024', 'Global fuel shortage due to geopolitical tensions', 'economic', '2024-03-01', '2024-05-31', '{"fuel_cost_multiplier": 1.4, "demand_reduction": 0.15}'),
('Summer Olympics 2024', 'Paris Olympics increase travel demand to Europe', 'positive', '2024-07-15', '2024-08-15', '{"european_demand_boost": 0.25, "revenue_multiplier": 1.15}'),
('Airline Strike Wave', 'Major strikes across European airports', 'negative', '2024-09-10', '2024-09-17', '{"operational_efficiency": 0.7, "passenger_satisfaction": -20}'),
('Technology Revolution', 'New aviation technology becomes available', 'technological', '2024-01-01', '2025-12-31', '{"maintenance_efficiency": 1.1, "fuel_efficiency": 1.05}');

-- Inserimento flotta di esempio per le compagnie
INSERT INTO fleet (company_id, aircraft_type_id, configuration_id, registration, custom_name, 
                  condition, status, location_airport_id, maintenance_level) VALUES
-- AirItalia Express - flotta low cost
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 5, 9, 'I-AIRE1', 'Roma Spirit', 95, 'available', 1, 90),
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 5, 9, 'I-AIRE2', 'Milano Express', 88, 'available', 2, 85),
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 6, 13, 'I-AIRE3', 'Venezia Wings', 92, 'available', 1, 88),

-- European Sky - flotta normale
((SELECT id FROM companies WHERE name = 'European Sky'), 7, 15, 'D-ESKY1', 'Frankfurt Star', 98, 'available', 7, 95),
((SELECT id FROM companies WHERE name = 'European Sky'), 7, 15, 'D-ESKY2', 'Amsterdam Dream', 96, 'available', 8, 92),
((SELECT id FROM companies WHERE name = 'European Sky'), 10, 21, 'D-ESKY3', 'European Pride', 94, 'maintenance', 7, 80),
((SELECT id FROM companies WHERE name = 'European Sky'), 12, 25, 'D-ESKY4', 'Continental', 90, 'available', 7, 85),

-- Luxury Wings - flotta luxury 
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 14, 30, 'G-LUXW1', 'Royal Ascent', 99, 'available', 5, 98),
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 15, 33, 'G-LUXW2', 'Crown Jewel', 97, 'available', 5, 95),

-- Global Cargo Solutions - flotta cargo
((SELECT id FROM companies WHERE name = 'Global Cargo Solutions'), 17, 35, 'PH-GCSO1', 'Amsterdam Cargo', 85, 'available', 8, 82),
((SELECT id FROM companies WHERE name = 'Global Cargo Solutions'), 18, 36, 'PH-GCSO2', 'Euro Freight', 89, 'available', 7, 87);

-- Inserimento rotte di esempio per le compagnie
INSERT INTO routes (company_id, origin_airport_id, destination_airport_id, route_type, distance_km, 
                   flight_time_minutes, economy_price, business_price, first_price, cargo_price_per_kg) VALUES
-- AirItalia Express - rotte domestiche e short-haul europee
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 1, 2, 'domestic', 596, 75, 8500, 0, 0, 0), -- FCO-MXP
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 1, 3, 'domestic', 393, 50, 6500, 0, 0, 0), -- FCO-VCE
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 1, 5, 'international', 1434, 145, 12500, 0, 0, 0), -- FCO-LHR
((SELECT id FROM companies WHERE name = 'AirItalia Express'), 2, 6, 'international', 688, 85, 9500, 0, 0, 0), -- MXP-CDG

-- European Sky - rotte hub-and-spoke europee e intercontinentali
((SELECT id FROM companies WHERE name = 'European Sky'), 7, 8, 'international', 358, 45, 15000, 45000, 0, 0), -- FRA-AMS
((SELECT id FROM companies WHERE name = 'European Sky'), 7, 5, 'international', 637, 80, 18000, 55000, 0, 0), -- FRA-LHR
((SELECT id FROM companies WHERE name = 'European Sky'), 7, 11, 'intercontinental', 6385, 485, 35000, 120000, 0, 0), -- FRA-JFK
((SELECT id FROM companies WHERE name = 'European Sky'), 8, 12, 'intercontinental', 5537, 420, 32000, 110000, 0, 0), -- AMS-LAX

-- Luxury Wings - rotte premium intercontinentali
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 5, 11, 'intercontinental', 5585, 425, 45000, 180000, 850000, 0), -- LHR-JFK
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 5, 17, 'intercontinental', 9560, 780, 65000, 280000, 1200000, 0), -- LHR-SIN
((SELECT id FROM companies WHERE name = 'Luxury Wings'), 5, 16, 'intercontinental', 6942, 530, 55000, 220000, 950000, 0), -- LHR-HND

-- Global Cargo Solutions - rotte cargo
((SELECT id FROM companies WHERE name = 'Global Cargo Solutions'), 8, 7, 'international', 358, 45, 0, 0, 0, 350), -- AMS-FRA
((SELECT id FROM companies WHERE name = 'Global Cargo Solutions'), 7, 11, 'intercontinental', 6385, 485, 0, 0, 0, 425), -- FRA-JFK
((SELECT id FROM companies WHERE name = 'Global Cargo Solutions'), 8, 17, 'intercontinental', 10331, 840, 0, 0, 0, 450); -- AMS-SIN

-- Inserimento servizi assegnati alle rotte
INSERT INTO route_assigned_services (route_id, service_id, class_type) VALUES
-- AirItalia Express - servizi base
(1, 2, 'economy'), -- Snack Service su FCO-MXP
(2, 2, 'economy'), -- Snack Service su FCO-VCE  
(3, 1, 'economy'), -- Basic Meal su FCO-LHR
(4, 1, 'economy'), -- Basic Meal su MXP-CDG

-- European Sky - servizi standard
(5, 1, 'economy'), (5, 4, 'business'), -- Meal services su FRA-AMS
(6, 1, 'economy'), (6, 4, 'business'), -- Meal services su FRA-LHR
(7, 3, 'economy'), (7, 4, 'business'), (7, 11, 'all'), -- Full service su FRA-JFK
(8, 3, 'economy'), (8, 4, 'business'), (8, 11, 'all'), -- Full service su AMS-LAX

-- Luxury Wings - servizi premium
(9, 3, 'economy'), (9, 4, 'business'), (9, 7, 'first'), (9, 12, 'all'), -- LHR-JFK
(10, 3, 'economy'), (10, 4, 'business'), (10, 7, 'first'), (10, 12, 'all'), (10, 8, 'first'), -- LHR-SIN
(11, 3, 'economy'), (11, 4, 'business'), (11, 7, 'first'), (11, 12, 'all'); -- LHR-HND

-- Inserimento voli schedulati per le prossime settimane
INSERT INTO flights (route_id, aircraft_id, departure_time, arrival_time, status, 
                    passengers_economy, passengers_business, passengers_first) VALUES
-- Voli AirItalia Express
(1, (SELECT id FROM fleet WHERE registration = 'I-AIRE1'), '2024-07-01 06:30:00+00', '2024-07-01 07:45:00+00', 'scheduled', 165, 0, 0),
(2, (SELECT id FROM fleet WHERE registration = 'I-AIRE2'), '2024-07-01 09:15:00+00', '2024-07-01 10:05:00+00', 'scheduled', 158, 0, 0),
(3, (SELECT id FROM fleet WHERE registration = 'I-AIRE3'), '2024-07-01 14:20:00+00', '2024-07-01 16:45:00+00', 'scheduled', 142, 15, 0),

-- Voli European Sky
(5, (SELECT id FROM fleet WHERE registration = 'D-ESKY1'), '2024-07-01 07:45:00+00', '2024-07-01 08:30:00+00', 'scheduled', 150, 25, 0),
(7, (SELECT id FROM fleet WHERE registration = 'D-ESKY4'), '2024-07-01 11:30:00+00', '2024-07-01 19:35:00+00', 'scheduled', 280, 35, 6),

-- Voli Luxury Wings
(9, (SELECT id FROM fleet WHERE registration = 'G-LUXW1'), '2024-07-01 10:15:00+00', '2024-07-01 17:20:00+00', 'scheduled', 220, 40, 10),
(10, (SELECT id FROM fleet WHERE registration = 'G-LUXW2'), '2024-07-01 22:30:00+00', '2024-07-02 15:50:00+00', 'scheduled', 420, 90, 12);

-- Inserimento reports finanziari di esempio 
INSERT INTO financial_reports (company_id, report_date, total_revenue, total_expenses, operating_profit, 
                              net_profit, passenger_revenue, cargo_revenue, fuel_costs, staff_costs, 
                              maintenance_costs, airport_fees, company_money_start, company_money_end) VALUES
-- AirItalia Express
((SELECT id FROM companies WHERE name = 'AirItalia Express'), '2024-06-30', 125000000, 118000000, 7000000, 7000000, 
 125000000, 0, 45000000, 38000000, 18000000, 12000000, 1500000000, 1507000000),

-- European Sky  
((SELECT id FROM companies WHERE name = 'European Sky'), '2024-06-30', 850000000, 780000000, 70000000, 70000000,
 820000000, 30000000, 320000000, 255000000, 125000000, 80000000, 8500000000, 8570000000),

-- Luxury Wings
((SELECT id FROM companies WHERE name = 'Luxury Wings'), '2024-06-30', 1200000000, 950000000, 250000000, 250000000,
 1200000000, 0, 380000000, 285000000, 180000000, 105000000, 25000000000, 25250000000);

-- Inserimento produttori di sedili reali
INSERT INTO seat_manufacturers (name, country, founded_year, reputation_score, market_share, specialization) VALUES
('Recaro Aircraft Seating', 'Germany', 1906, 95, 25.0, 'all'),
('Collins Aerospace', 'United States', 1937, 90, 30.0, 'all'),
('Zodiac Aerospace (Safran)', 'France', 1896, 85, 20.0, 'premium'),
('Geven', 'Italy', 1964, 80, 8.0, 'economy'),
('Acro Aircraft Seating', 'United Kingdom', 2007, 75, 5.0, 'economy'),
('Thompson Aero Seating', 'United Kingdom', 1983, 88, 7.0, 'luxury'),
('Jamco Corporation', 'Japan', 1955, 82, 3.0, 'premium'),
('Haeco Cabin Solutions', 'Hong Kong', 1950, 78, 2.0, 'all');

-- Inserimento modelli di sedili realistici

-- Sedili Economy Class
INSERT INTO seat_models (manufacturer_id, model_name, model_code, seat_class, width_cm, depth_cm, height_cm, 
                        pitch_min_cm, pitch_max_cm, weight_kg, comfort_rating, recline_angle, 
                        has_entertainment_screen, screen_size_inches, has_power_outlet, has_usb_port,
                        market_entry_year, max_flight_hours, max_cycles, base_cost, maintenance_cost_per_year) VALUES

-- Recaro Economy
(1, 'BL3510', 'BL3510', 'economy', 43.2, 76.0, 81.0, 76, 86, 12.5, 6, 8, TRUE, 9.0, FALSE, TRUE, 2015, 45000, 22500, 180000000, 25000000),
(1, 'CL3710', 'CL3710', 'economy', 45.0, 78.0, 83.0, 79, 89, 13.2, 7, 10, TRUE, 10.1, TRUE, TRUE, 2018, 50000, 25000, 220000000, 28000000),

-- Collins Aerospace Economy  
(2, 'Meridian', 'MER-100', 'economy', 44.0, 77.0, 82.0, 76, 87, 12.8, 6, 9, TRUE, 9.0, FALSE, TRUE, 2016, 47000, 23000, 195000000, 26000000),
(2, 'Aire', 'AIR-200', 'economy', 46.0, 79.0, 84.0, 81, 91, 14.0, 8, 12, TRUE, 11.0, TRUE, TRUE, 2020, 55000, 27500, 250000000, 30000000),

-- Geven Economy (low-cost specialist)
(4, 'Piuma', 'PMA-150', 'economy', 43.0, 75.0, 80.0, 76, 84, 11.8, 5, 6, FALSE, 0, FALSE, FALSE, 2014, 40000, 20000, 150000000, 20000000),
(4, 'Essenza', 'ESS-250', 'economy', 44.5, 76.5, 81.5, 78, 86, 12.2, 6, 8, TRUE, 8.9, FALSE, TRUE, 2019, 48000, 24000, 185000000, 23000000),

-- Acro Economy (ultra-lightweight)
(5, 'Series 3', 'S3-100', 'economy', 43.5, 76.0, 80.5, 76, 85, 10.5, 5, 7, FALSE, 0, FALSE, FALSE, 2017, 42000, 21000, 145000000, 18000000),
(5, 'Series 6', 'S6-200', 'economy', 45.0, 77.5, 82.0, 79, 88, 11.8, 7, 9, TRUE, 9.0, TRUE, TRUE, 2021, 50000, 25000, 195000000, 25000000),

-- Sedili Premium Economy
INSERT INTO seat_models (manufacturer_id, model_name, model_code, seat_class, width_cm, depth_cm, height_cm, 
                        pitch_min_cm, pitch_max_cm, weight_kg, comfort_rating, recline_angle, 
                        has_entertainment_screen, screen_size_inches, has_power_outlet, has_usb_port,
                        market_entry_year, max_flight_hours, max_cycles, base_cost, maintenance_cost_per_year) VALUES

-- Recaro Premium Economy
(1, 'CL3620', 'CL3620', 'premium_economy', 48.0, 91.0, 88.0, 97, 107, 18.5, 8, 15, TRUE, 12.1, TRUE, TRUE, 2017, 50000, 25000, 420000000, 45000000),

-- Collins Premium Economy
(2, 'Elements', 'ELM-300', 'premium_economy', 49.5, 93.0, 90.0, 99, 109, 19.2, 8, 18, TRUE, 13.3, TRUE, TRUE, 2019, 52000, 26000, 450000000, 48000000),

-- Zodiac Premium Economy
(3, 'Z300', 'Z300-PE', 'premium_economy', 47.5, 89.0, 87.0, 94, 104, 17.8, 7, 12, TRUE, 11.6, TRUE, TRUE, 2016, 48000, 24000, 395000000, 42000000),

-- Sedili Business Class
INSERT INTO seat_models (manufacturer_id, model_name, model_code, seat_class, width_cm, depth_cm, height_cm, 
                        pitch_min_cm, pitch_max_cm, weight_kg, comfort_rating, recline_angle, 
                        has_entertainment_screen, screen_size_inches, has_power_outlet, has_usb_port, has_bed,
                        market_entry_year, max_flight_hours, max_cycles, base_cost, maintenance_cost_per_year) VALUES

-- Recaro Business
(1, 'CL6720', 'CL6720', 'business', 53.0, 152.0, 110.0, 152, 165, 35.0, 9, 180, TRUE, 15.6, TRUE, TRUE, TRUE, 2018, 60000, 30000, 1250000000, 85000000),

-- Collins Business
(2, 'Super Diamond', 'SD-400', 'business', 55.0, 156.0, 115.0, 156, 170, 38.5, 9, 180, TRUE, 17.0, TRUE, TRUE, TRUE, 2019, 62000, 31000, 1380000000, 92000000),

-- Zodiac Business (Luxury specialist)
(3, 'Cirrus', 'CIR-500', 'business', 56.0, 160.0, 118.0, 160, 175, 42.0, 10, 180, TRUE, 18.5, TRUE, TRUE, TRUE, 2020, 58000, 29000, 1500000000, 98000000),

-- Thompson Business
(6, 'Vantage XL', 'VXL-600', 'business', 54.0, 155.0, 112.0, 155, 168, 36.8, 9, 180, TRUE, 16.0, TRUE, TRUE, TRUE, 2017, 55000, 27500, 1320000000, 88000000),

-- Sedili First Class
INSERT INTO seat_models (manufacturer_id, model_name, model_code, seat_class, width_cm, depth_cm, height_cm, 
                        pitch_min_cm, pitch_max_cm, weight_kg, comfort_rating, recline_angle, 
                        has_entertainment_screen, screen_size_inches, has_power_outlet, has_usb_port, has_bed, has_massage,
                        market_entry_year, max_flight_hours, max_cycles, base_cost, maintenance_cost_per_year) VALUES

-- Zodiac First Class (specialist luxury)
(3, 'Optima', 'OPT-800', 'first', 68.0, 203.0, 140.0, 203, 220, 65.0, 10, 180, TRUE, 24.0, TRUE, TRUE, TRUE, TRUE, 2019, 55000, 27500, 2800000000, 180000000),

-- Collins First Class
(2, 'Pinnacle', 'PIN-900', 'first', 71.0, 208.0, 145.0, 208, 225, 68.5, 10, 180, TRUE, 26.0, TRUE, TRUE, TRUE, TRUE, 2020, 58000, 29000, 3200000000, 195000000),

-- Thompson First Class
(6, 'Elite', 'ELI-1000', 'first', 75.0, 215.0, 150.0, 215, 235, 75.0, 10, 180, TRUE, 27.0, TRUE, TRUE, TRUE, TRUE, 2018, 52000, 26000, 3500000000, 210000000);

-- Commit finale delle modifiche
COMMIT;
