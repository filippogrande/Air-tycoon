-- Inserisci qui i dati iniziali per la tabella airports
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
