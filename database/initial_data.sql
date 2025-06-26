-- Dati iniziali per Air Tycoon 2 Clone Database

-- Inserimento aeroporti principali
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone) VALUES
-- Italia
('Leonardo da Vinci International Airport', 'FCO', 'LIRF', 'Rome', 'Italy', 41.8003, 12.2389, 13, 'Europe/Rome'),
('Milano Malpensa Airport', 'MXP', 'LIMC', 'Milan', 'Italy', 45.6306, 8.7281, 234, 'Europe/Rome'),
('Venice Marco Polo Airport', 'VCE', 'LIPZ', 'Venice', 'Italy', 45.5053, 12.3519, 2, 'Europe/Rome'),
('Naples International Airport', 'NAP', 'LIRN', 'Naples', 'Italy', 40.8860, 14.2908, 90, 'Europe/Rome'),

-- Europa
('London Heathrow Airport', 'LHR', 'EGLL', 'London', 'United Kingdom', 51.4706, -0.4619, 25, 'Europe/London'),
('Charles de Gaulle Airport', 'CDG', 'LFPG', 'Paris', 'France', 49.0097, 2.5479, 119, 'Europe/Paris'),
('Frankfurt Airport', 'FRA', 'EDDF', 'Frankfurt', 'Germany', 50.0264, 8.5431, 111, 'Europe/Berlin'),
('Amsterdam Airport Schiphol', 'AMS', 'EHAM', 'Amsterdam', 'Netherlands', 52.3086, 4.7639, -3, 'Europe/Amsterdam'),
('Madrid-Barajas Airport', 'MAD', 'LEMD', 'Madrid', 'Spain', 40.4719, -3.5626, 610, 'Europe/Madrid'),
('Barcelona-El Prat Airport', 'BCN', 'LEBL', 'Barcelona', 'Spain', 41.2971, 2.0785, 4, 'Europe/Madrid'),

-- Nord America
('John F. Kennedy International Airport', 'JFK', 'KJFK', 'New York', 'United States', 40.6413, -73.7781, 4, 'America/New_York'),
('Los Angeles International Airport', 'LAX', 'KLAX', 'Los Angeles', 'United States', 33.9425, -118.4081, 38, 'America/Los_Angeles'),
('O''Hare International Airport', 'ORD', 'KORD', 'Chicago', 'United States', 41.9742, -87.9073, 201, 'America/Chicago'),
('Miami International Airport', 'MIA', 'KMIA', 'Miami', 'United States', 25.7959, -80.2870, 3, 'America/New_York'),
('Toronto Pearson International Airport', 'YYZ', 'CYYZ', 'Toronto', 'Canada', 43.6777, -79.6248, 173, 'America/Toronto'),

-- Asia
('Tokyo Haneda Airport', 'HND', 'RJTT', 'Tokyo', 'Japan', 35.5494, 139.7798, 6, 'Asia/Tokyo'),
('Singapore Changi Airport', 'SIN', 'WSSS', 'Singapore', 'Singapore', 1.3644, 103.9915, 7, 'Asia/Singapore'),
('Hong Kong International Airport', 'HKG', 'VHHH', 'Hong Kong', 'Hong Kong', 22.3080, 113.9185, 9, 'Asia/Hong_Kong'),
('Beijing Capital International Airport', 'PEK', 'ZBAA', 'Beijing', 'China', 40.0799, 116.6031, 35, 'Asia/Shanghai'),
('Dubai International Airport', 'DXB', 'OMDB', 'Dubai', 'UAE', 25.2532, 55.3657, 19, 'Asia/Dubai'),

-- Oceania
('Sydney Kingsford Smith Airport', 'SYD', 'YSSY', 'Sydney', 'Australia', -33.9399, 151.1753, 6, 'Australia/Sydney'),
('Melbourne Airport', 'MEL', 'YMML', 'Melbourne', 'Australia', -37.6690, 144.8410, 132, 'Australia/Melbourne');

-- Inserimento tipi di aeromobili
INSERT INTO aircraft_types (name, manufacturer, category, capacity, range_km, fuel_consumption, cruise_speed, purchase_price, maintenance_cost_per_hour) VALUES
-- Aeromobili regionali
('ATR 72-600', 'ATR', 'regional', 78, 1665, 450, 510, 26000000, 1200),
('Embraer E175', 'Embraer', 'regional', 88, 3334, 850, 870, 51000000, 1800),
('Bombardier CRJ900', 'Bombardier', 'regional', 90, 2956, 950, 828, 47000000, 1700),

-- Aeromobili a corto raggio
('Airbus A220-100', 'Airbus', 'narrow_body', 135, 5741, 2000, 870, 89500000, 2500),
('Airbus A320neo', 'Airbus', 'narrow_body', 180, 6500, 2400, 903, 110600000, 3000),
('Boeing 737-800', 'Boeing', 'narrow_body', 189, 5765, 2500, 852, 106100000, 3200),
('Boeing 737 MAX 8', 'Boeing', 'narrow_body', 189, 6570, 2300, 852, 121600000, 3100),

-- Aeromobili a medio raggio
('Airbus A321neo', 'Airbus', 'narrow_body', 244, 7400, 2800, 903, 129500000, 3500),
('Boeing 757-200', 'Boeing', 'narrow_body', 239, 7222, 3200, 850, 85000000, 3800),

-- Aeromobili a lungo raggio
('Airbus A330-300', 'Airbus', 'wide_body', 440, 11750, 7500, 871, 264200000, 8000),
('Boeing 767-300ER', 'Boeing', 'wide_body', 350, 11093, 6800, 851, 200700000, 7200),
('Boeing 777-200ER', 'Boeing', 'wide_body', 440, 14305, 9500, 892, 306600000, 9500),
('Boeing 787-8', 'Boeing', 'wide_body', 359, 14140, 6800, 903, 248300000, 7500),
('Airbus A350-900', 'Airbus', 'wide_body', 440, 15000, 7200, 903, 317400000, 8200),

-- Aeromobili premium
('Airbus A380-800', 'Airbus', 'wide_body', 853, 15200, 12000, 903, 445600000, 15000),
('Boeing 747-8', 'Boeing', 'wide_body', 605, 14815, 11000, 917, 418400000, 12000),

-- Cargo
('Boeing 747-8F', 'Boeing', 'cargo', 0, 8130, 11500, 917, 419200000, 13000),
('Airbus A330-200F', 'Airbus', 'cargo', 0, 7400, 8200, 871, 241700000, 9000);

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

-- Commit delle modifiche
COMMIT;
