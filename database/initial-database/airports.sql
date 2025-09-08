-- Inserisci qui i dati iniziali per la tabella airports
INSERT INTO airports (name, iata_code, icao_code, city, country, latitude, longitude, elevation, timezone, 
                     opened_date, closure_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level) VALUES
-- Italia - Aeroporti Moderni
('Roma Fiumicino Airport', 'FCO', 'LIRF', 'Rome', 'Italy', 41.8003, 12.2389, 13, 'Europe/Rome', '1961-01-01', NULL, 3, 3902, 'large', 80, 90),
('Milano Malpensa Airport', 'MXP', 'LIMC', 'Milan', 'Italy', 45.6306, 8.7281, 234, 'Europe/Rome', '1998-10-25', NULL, 2, 3920, 'large', 85, 75),
('Venice Marco Polo Airport', 'VCE', 'LIPZ', 'Venice', 'Italy', 45.5053, 12.3519, 2, 'Europe/Rome', '1960-05-05', NULL, 1, 3300, 'medium', 70, 95),
('Naples International Airport', 'NAP', 'LIRN', 'Naples', 'Italy', 40.8860, 14.2908, 90, 'Europe/Rome', '1910-01-01', NULL, 1, 2628, 'medium', 60, 85),

-- Italia - Aeroporti Storici (per scenari epoca)
('Roma Ciampino Airport', 'CIA', 'LIRA', 'Rome', 'Italy', 41.7994, 12.5949, 105, 'Europe/Rome', '1916-01-01', NULL, 1, 2207, 'medium', 45, 75),
('Milano Linate Airport', 'LIN', 'LIML', 'Milan', 'Italy', 45.4454, 9.2767, 103, 'Europe/Rome', '1937-10-21', NULL, 1, 2442, 'medium', 70, 60),
('Torino Caselle Airport', 'TRN', 'LIMF', 'Turin', 'Italy', 45.2008, 7.6492, 301, 'Europe/Rome', '1953-06-30', NULL, 1, 3300, 'medium', 55, 65),
('Bologna Guglielmo Marconi Airport', 'BLQ', 'LIPE', 'Bologna', 'Italy', 44.5354, 11.2887, 37, 'Europe/Rome', '1931-11-15', NULL, 1, 2800, 'medium', 75, 50),
('Palermo Falcone-Borsellino Airport', 'PMO', 'LICJ', 'Palermo', 'Italy', 38.1759, 13.0910, 14, 'Europe/Rome', '1960-01-10', NULL, 1, 3326, 'medium', 40, 90),
('Torino Aeritalia Airport', 'LIA', 'LIMA', 'Turin', 'Italy', 45.0850, 7.6050, 288, 'Europe/Rome', '1916-07-10', '1990-12-31', 1, 1500, 'campo_aviazione', 30, 40),
('Campo di Marte Airport', 'QCM', 'LIRX', 'Florence', 'Italy', 43.7800, 11.2700, 50, 'Europe/Rome', '1910-06-01', '1951-12-31', 1, 1200, 'campo_aviazione', 25, 35),
('Guidonia Air Base', 'QGU', 'LIRG', 'Rome', 'Italy', 41.9931, 12.7406, 73, 'Europe/Rome', '1916-01-01', NULL, 1, 1800, 'campo_aviazione', 20, 20),
('Ghedi Air Base', 'GDI', 'LIPL', 'Brescia', 'Italy', 45.4300, 10.2667, 92, 'Europe/Rome', '1931-01-01', NULL, 1, 2991, 'medium', 15, 10),

-- Italia - Aeroporti Storici Chiusi (per realismo storico)
('Roma Urbe Airport', 'QRU', 'LIRU', 'Rome', 'Italy', 41.9519, 12.4994, 24, 'Europe/Rome', '1928-04-15', '1990-12-31', 1, 1100, 'small', 30, 40),
('Milano Bresso Airfield', 'MXB', 'LIMB', 'Milan', 'Italy', 45.5414, 9.2036, 140, 'Europe/Rome', '1912-05-01', '1985-10-15', 1, 900, 'campo_aviazione', 40, 20),
('Napoli Capodichino (Storico)', 'NAX', 'LIRY', 'Naples', 'Italy', 40.8854, 14.2905, 90, 'Europe/Rome', '1910-01-01', '1995-06-30', 1, 1800, 'campo_aviazione', 35, 60),

-- Italia - Aeroporti Regionali Minori (attivi in epoche diverse)
('Catania Fontanarossa Airport', 'CTA', 'LICC', 'Catania', 'Italy', 37.4668, 15.0664, 11, 'Europe/Rome', '1924-05-15', NULL, 1, 2435, 'medium', 35, 85),
('Bari Karol Wojtyla Airport', 'BRI', 'LIBD', 'Bari', 'Italy', 41.1389, 16.7606, 48, 'Europe/Rome', '1930-09-20', NULL, 1, 2400, 'medium', 50, 70),
('Florence Amerigo Vespucci Airport', 'FLR', 'LIRQ', 'Florence', 'Italy', 43.8100, 11.2051, 50, 'Europe/Rome', '1931-02-16', NULL, 1, 1750, 'small', 60, 95),
('Genoa Cristoforo Colombo Airport', 'GOA', 'LIMJ', 'Genoa', 'Italy', 44.4133, 8.8375, 4, 'Europe/Rome', '1962-07-17', NULL, 1, 3065, 'medium', 65, 55),
('Verona Villafranca Airport', 'VRN', 'LIPX', 'Verona', 'Italy', 45.3957, 10.8885, 68, 'Europe/Rome', '1937-03-10', NULL, 1, 3000, 'small', 45, 80),
('Cagliari Elmas Airport', 'CAG', 'LIEE', 'Cagliari', 'Italy', 39.2515, 9.0543, 4, 'Europe/Rome', '1937-11-28', NULL, 1, 2700, 'medium', 35, 90),

-- Europa
('London Heathrow Airport', 'LHR', 'EGLL', 'London', 'United Kingdom', 51.4706, -0.4619, 25, 'Europe/London', '1946-03-31', NULL, 2, 3902, 'large', 95, 70),
('Charles de Gaulle Airport', 'CDG', 'LFPG', 'Paris', 'France', 49.0097, 2.5479, 119, 'Europe/Paris', '1974-03-08', NULL, 4, 4215, 'large', 90, 80),
('Frankfurt Airport', 'FRA', 'EDDF', 'Frankfurt', 'Germany', 50.0264, 8.5431, 111, 'Europe/Berlin', '1936-07-08', NULL, 4, 4000, 'large', 93, 65),
('Amsterdam Airport Schiphol', 'AMS', 'EHAM', 'Amsterdam', 'Netherlands', 52.3086, 4.7639, -3, 'Europe/Amsterdam', '1967-04-03', NULL, 6, 3800, 'large', 85, 78),
('Madrid-Barajas Airport', 'MAD', 'LEMD', 'Madrid', 'Spain', 40.4719, -3.5626, 610, 'Europe/Madrid', '1928-04-22', NULL, 4, 4349, 'large', 75, 85),
('Barcelona-El Prat Airport', 'BCN', 'LEBL', 'Barcelona', 'Spain', 41.2971, 2.0785, 4, 'Europe/Madrid', '1963-01-01', NULL, 3, 3500, 'large', 70, 90),

-- Nord America
('John F. Kennedy International Airport', 'JFK', 'KJFK', 'New York', 'United States', 40.6413, -73.7781, 4, 'America/New_York', '1948-07-01', NULL, 4, 4423, 'large', 98, 85),
('Los Angeles International Airport', 'LAX', 'KLAX', 'Los Angeles', 'United States', 33.9425, -118.4081, 38, 'America/Los_Angeles', '1930-10-01', NULL, 4, 3685, 'large', 92, 88),
('O''Hare International Airport', 'ORD', 'KORD', 'Chicago', 'United States', 41.9742, -87.9073, 201, 'America/Chicago', '1955-03-23', NULL, 8, 4115, 'large', 90, 75),
('Miami International Airport', 'MIA', 'KMIA', 'Miami', 'United States', 25.7959, -80.2870, 3, 'America/New_York', '1928-09-01', NULL, 4, 3962, 'large', 80, 92),
('Toronto Pearson International Airport', 'YYZ', 'CYYZ', 'Toronto', 'Canada', 43.6777, -79.6248, 173, 'America/Toronto', '1972-02-28', NULL, 5, 3389, 'large', 85, 70),

('Tokyo Haneda Airport', 'HND', 'RJTT', 'Tokyo', 'Japan', 35.5494, 139.7798, 6, 'Asia/Tokyo', '1931-08-25', NULL, 4, 3000, 'large', 87, 70),
('Singapore Changi Airport', 'SIN', 'WSSS', 'Singapore', 'Singapore', 1.3644, 103.9915, 7, 'Asia/Singapore', '1981-07-01', NULL, 4, 4000, 'large', 85, 75),
('Hong Kong International Airport', 'HKG', 'VHHH', 'Hong Kong', 'Hong Kong', 22.3080, 113.9185, 9, 'Asia/Hong_Kong', '1998-07-06', NULL, 2, 3800, 'large', 90, 80),
('Beijing Capital International Airport', 'PEK', 'ZBAA', 'Beijing', 'China', 40.0799, 116.6031, 35, 'Asia/Shanghai', '1958-03-02', NULL, 3, 3800, 'large', 85, 75),
('Dubai International Airport', 'DXB', 'OMDB', 'Dubai', 'UAE', 25.2532, 55.3657, 19, 'Asia/Dubai', '1960-09-30', NULL, 2, 4000, 'large', 88, 85),


-- Oceania
('Sydney Kingsford Smith Airport', 'SYD', 'YSSY', 'Sydney', 'Australia', -33.9399, 151.1753, 6, 'Australia/Sydney', '1919-12-09', NULL, 3, 3962, 'large', 80, 85),
('Melbourne Airport', 'MEL', 'YMML', 'Melbourne', 'Australia', -37.6690, 144.8410, 132, 'Australia/Melbourne', '1970-07-01', NULL, 2, 3657, 'large', 75, 80);



-- Stati europei (attuali e storici)
-- Albania - Aeroporti Moderni
('Tirana International Airport', 'TIA', 'LATI', 'Tirana', 'Albania', 41.4147, 19.7206, 234, 'Europe/Tirane', '1957-04-15', NULL, 1, 3000, 'medium', 70, 60),
('Kukës International Airport', 'KFZ', 'LAKU', 'Kukës', 'Albania', 42.0597, 20.4156, 350, 'Europe/Tirane', '2021-07-09', NULL, 1, 2200, 'small', 30, 20),

-- Albania - Aeroporti Storici/Chiusi
('Vlorë Airfield', 'QVO', 'LAVL', 'Vlorë', 'Albania', 40.4667, 19.4833, 5, 'Europe/Tirane', '1920-01-01', '1997-12-31', 1, 1200, 'campo_aviazione', 10, 10),
('Gjirokastër Airfield', 'QGK', 'LAGJ', 'Gjirokastër', 'Albania', 40.0833, 20.1333, 193, 'Europe/Tirane', '1930-01-01', '1990-12-31', 1, 900, 'campo_aviazione', 5, 5),

-- Albania - Aeroporti Regionali Minori
('Shkodër Airfield', 'QSH', 'LASH', 'Shkodër', 'Albania', 42.0667, 19.5167, 49, 'Europe/Tirane', '1935-01-01', NULL, 1, 1200, 'campo_aviazione', 8, 8),
('Korçë Airfield', 'QKO', 'LAKO', 'Korçë', 'Albania', 40.6167, 20.7667, 880, 'Europe/Tirane', '1935-01-01', NULL, 1, 1000, 'campo_aviazione', 6, 6),
-- Andorra 
-- Andorra - Aeroporti Moderni 
('Andorra La Seu dUrgell Airport', 'LEU', 'LESU', 'La Seu dUrgell', 'Andorra', 42.3394, 1.4094, 802, 'Europe/Andorra', '1982-06-01', NULL, 1, 1267, 'small', 20, 30),

-- Andorra - Campi d'aviazione storici 
('Andorra Airfield', 'QAN', 'LQAN', 'Andorra la Vella', 'Andorra', 42.5075, 1.5218, 1023, 'Europe/Andorra', '1930-01-01', '1960-12-31', 1, 600, 'campo_aviazione', 5, 5),

-- Austria
-- Austria - Aeroporti Moderni 
('Vienna International Airport', 'VIE', 'LOWW', 'Vienna', 'Austria', 48.1103, 16.5697, 183, 'Europe/Vienna', '1954-05-14', NULL, 2, 3600, 'large', 90, 80), 
('Salzburg Airport', 'SZG', 'LOWS', 'Salzburg', 'Austria', 47.7933, 13.0043, 430, 'Europe/Vienna', '1926-08-01', NULL, 2, 2750, 'medium', 60, 70), 
('Innsbruck Airport', 'INN', 'LOWI', 'Innsbruck', 'Austria', 47.2602, 11.3439, 581, 'Europe/Vienna', '1925-06-01', NULL, 1, 2000, 'medium', 50, 80), 
('Graz Airport', 'GRZ', 'LOWG', 'Graz', 'Austria', 46.9911, 15.4397, 340, 'Europe/Vienna', '1937-06-01', NULL, 1, 3000, 'medium', 40, 60), 
('Linz Airport', 'LNZ', 'LOWL', 'Linz', 'Austria', 48.2333, 14.1875, 298, 'Europe/Vienna', '1955-01-01', NULL, 1, 3000, 'medium', 35, 50),

-- Austria - Aeroporti Storici/Chiusi 
('Aspern Airfield', 'QAS', 'LOAA', 'Vienna', 'Austria', 48.2333, 16.4833, 155, 'Europe/Vienna', '1912-01-01', '1977-12-31', 1, 1200, 'campo_aviazione', 10, 10), 
('Wiener Neustadt East', 'QWN', 'LOAN', 'Wiener Neustadt', 'Austria', 47.8367, 16.2600, 280, 'Europe/Vienna', '1915-01-01', NULL, 1, 1067, 'campo_aviazione', 8, 8),

-- Austria - Aeroporti Regionali Minori 
('Klagenfurt Airport', 'KLU', 'LOWK', 'Klagenfurt', 'Austria', 46.6425, 14.3372, 448, 'Europe/Vienna', '1914-07-01', NULL, 1, 2720, 'small', 20, 30), 
('Hohenems-Dornbirn Airport', 'HOH', 'LOIH', 'Hohenems', 'Austria', 47.3842, 9.6981, 412, 'Europe/Vienna', '1967-01-01', NULL, 1, 630, 'campo_aviazione', 5, 10),

-- Bielorussia - Aeroporti Moderni (dal 1991)
('Minsk National Airport', 'MSQ', 'UMMS', 'Minsk', 'Belarus', 53.8825, 27.5375, 204, 'Europe/Minsk', '1991-08-25', NULL, 2, 3640, 'large', 60, 40),
('Brest Airport', 'BQT', 'UMBB', 'Brest', 'Belarus', 52.1083, 23.8981, 137, 'Europe/Minsk', '1991-08-25', NULL, 1, 2600, 'medium', 20, 10),
('Gomel Airport', 'GME', 'UMGG', 'Gomel', 'Belarus', 52.5272, 31.0167, 138, 'Europe/Minsk', '1991-08-25', NULL, 1, 2550, 'medium', 15, 10),
('Hrodna Airport', 'GNA', 'UMMG', 'Hrodna', 'Belarus', 53.6022, 24.0533, 135, 'Europe/Minsk', '1991-08-25', NULL, 1, 2560, 'small', 10, 8),
('Vitebsk Airport', 'VTB', 'UMII', 'Vitebsk', 'Belarus', 55.1265, 30.3496, 205, 'Europe/Minsk', '1991-08-25', NULL, 1, 2600, 'small', 8, 6),
-- Belgio
-- Belgio - Aeroporti Moderni
('Brussels Airport', 'BRU', 'EBBR', 'Brussels', 'Belgium', 50.9014, 4.4844, 58, 'Europe/Brussels', '1940-01-01', NULL, 3, 3638, 'large', 80, 70),
('Brussels South Charleroi Airport', 'CRL', 'EBCI', 'Charleroi', 'Belgium', 50.4592, 4.4538, 191, 'Europe/Brussels', '1919-01-01', NULL, 2, 2550, 'medium', 40, 30),
('Antwerp International Airport', 'ANR', 'EBAW', 'Antwerp', 'Belgium', 51.1894, 4.4632, 14, 'Europe/Brussels', '1930-01-01', NULL, 1, 1510, 'small', 20, 20),
('Liège Airport', 'LGG', 'EBLG', 'Liège', 'Belgium', 50.6374, 5.4432, 201, 'Europe/Brussels', '1930-01-01', NULL, 2, 3680, 'medium', 30, 40),
('Ostend-Bruges International Airport', 'OST', 'EBOS', 'Ostend', 'Belgium', 51.1989, 2.8622, 4, 'Europe/Brussels', '1916-01-01', NULL, 2, 3200, 'medium', 25, 35),

-- Belgio - Aeroporti Storici/Chiusi
('Grimbergen Airfield', 'QGR', 'EBGB', 'Grimbergen', 'Belgium', 50.9467, 4.4147, 14, 'Europe/Brussels', '1939-01-01', '1989-12-31', 1, 800, 'campo_aviazione', 5, 5),
('Sint-Truiden Airfield', 'QST', 'EBST', 'Sint-Truiden', 'Belgium', 50.8050, 5.1917, 73, 'Europe/Brussels', '1936-01-01', '1995-12-31', 1, 1200, 'campo_aviazione', 5, 5),

-- Belgio - Aeroporti Regionali Minori
('Kortrijk-Wevelgem International Airport', 'KJK', 'EBKT', 'Kortrijk', 'Belgium', 50.8172, 3.2047, 19, 'Europe/Brussels', '1916-01-01', NULL, 1, 1950, 'small', 10, 10),
('Genk-Zwartberg Airfield', 'QGK', 'EBZW', 'Genk', 'Belgium', 51.0000, 5.5000, 80, 'Europe/Brussels', '1930-01-01', NULL, 1, 900, 'campo_aviazione', 5, 5),

-- Bosnia ed Erzegovina (ex Jugoslavia)
-- Bosnia ed Erzegovina - Aeroporti Moderni (dal 1992)
('Sarajevo International Airport', 'SJJ', 'LQSA', 'Sarajevo', 'Bosnia and Herzegovina', 43.8246, 18.3315, 521, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2600, 'medium', 40, 30),
('Tuzla International Airport', 'TZL', 'LQTZ', 'Tuzla', 'Bosnia and Herzegovina', 44.4587, 18.7248, 250, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2500, 'small', 15, 10),
('Mostar International Airport', 'OMO', 'LQMO', 'Mostar', 'Bosnia and Herzegovina', 43.2829, 17.8459, 48, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2400, 'small', 10, 10),
('Banja Luka International Airport', 'BNX', 'LQBK', 'Banja Luka', 'Bosnia and Herzegovina', 44.9414, 17.2975, 122, 'Europe/Sarajevo', '1992-03-01', NULL, 1, 2500, 'small', 10, 8),

-- Bulgaria
-- Bulgaria - Aeroporti Moderni 
('Sofia Airport', 'SOF', 'LBSF', 'Sofia', 'Bulgaria', 42.6952, 23.4062, 531, 'Europe/Sofia', '1937-09-01', NULL, 2, 3600, 'large', 60, 50), 
('Varna Airport', 'VAR', 'LBWN', 'Varna', 'Bulgaria', 43.2321, 27.8251, 70, 'Europe/Sofia', '1948-05-01', NULL, 2, 2600, 'medium', 30, 40), 
('Burgas Airport', 'BOJ', 'LBBG', 'Burgas', 'Bulgaria', 42.5696, 27.5152, 28, 'Europe/Sofia', '1947-06-01', NULL, 2, 3200, 'medium', 25, 35), 
('Plovdiv Airport', 'PDV', 'LBPD', 'Plovdiv', 'Bulgaria', 42.0678, 24.8508, 162, 'Europe/Sofia', '1981-05-01', NULL, 1, 2500, 'small', 15, 20),

-- Bulgaria - Aeroporti Storici/Chiusi 
('Gorna Oryahovitsa Airport', 'GOZ', 'LBGO', 'Gorna Oryahovitsa', 'Bulgaria', 43.1514, 25.7136, 86, 'Europe/Sofia', '1925-01-01', NULL, 1, 2450, 'campo_aviazione', 8, 8), 
('Ruse Airfield', 'QRU', 'LBRU', 'Ruse', 'Bulgaria', 43.8447, 25.9561, 45, 'Europe/Sofia', '1930-01-01', '1990-12-31', 1, 1200, 'campo_aviazione', 5, 5),

-- Bulgaria - Aeroporti Regionali Minori 
('Stara Zagora Airfield', 'QSG', 'LBSG', 'Stara Zagora', 'Bulgaria', 42.4258, 25.6522, 185, 'Europe/Sofia', '1935-01-01', NULL, 1, 1000, 'campo_aviazione', 5, 5),

('Zagreb Franjo Tuđman Airport', 'ZAG', 'LDZA', 'Zagreb', 'Croatia', 45.7415, 16.0688, 108, 'Europe/Zagreb', '1991-06-25', NULL, 2, 3250, 'large', 60, 50),
('Split Airport', 'SPU', 'LDSP', 'Split', 'Croatia', 43.5389, 16.2981, 24, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2550, 'medium', 40, 60),
('Dubrovnik Airport', 'DBV', 'LDDU', 'Dubrovnik', 'Croatia', 42.5614, 18.2682, 161, 'Europe/Zagreb', '1991-06-25', NULL, 1, 3300, 'medium', 35, 80),
('Rijeka Airport', 'RJK', 'LDRI', 'Rijeka', 'Croatia', 45.2169, 14.5703, 85, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2500, 'small', 20, 30),
('Pula Airport', 'PUY', 'LDPL', 'Pula', 'Croatia', 44.8935, 13.9222, 84, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2950, 'small', 15, 25),

-- Croazia - Aeroporti Regionali Minori
('Osijek Airport', 'OSI', 'LDOS', 'Osijek', 'Croatia', 45.4627, 18.8102, 89, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2500, 'small', 10, 10),
('Zadar Airport', 'ZAD', 'LDZD', 'Zadar', 'Croatia', 44.1083, 15.3467, 88, 'Europe/Zagreb', '1991-06-25', NULL, 1, 2500, 'small', 10, 15),
('Lošinj Airport', 'LSZ', 'LDLO', 'Mali Lošinj', 'Croatia', 44.5656, 14.3931, 47, 'Europe/Zagreb', '1991-06-25', NULL, 1, 900, 'campo_aviazione', 5, 5),

-- Cipro - Aeroporti Moderni
('Larnaca International Airport', 'LCA', 'LCLK', 'Larnaca', 'Cyprus', 34.8751, 33.6232, 2, 'Asia/Nicosia', '1975-02-08', NULL, 2, 2980, 'large', 60, 80),
('Paphos International Airport', 'PFO', 'LCPH', 'Paphos', 'Cyprus', 34.7181, 32.4857, 12, 'Asia/Nicosia', '1983-11-01', NULL, 1, 2700, 'medium', 30, 60),

-- Cipro - Aeroporti Storici/Chiusi
('Nicosia International Airport', 'NIC', 'LCNC', 'Nicosia', 'Cyprus', 35.1510, 33.2732, 220, 'Asia/Nicosia', '1939-01-01', '1974-07-20', 1, 2200, 'medium', 40, 50),

-- Cipro - Aeroporti Regionali Minori
('Ercan International Airport', 'ECN', 'LCEN', 'Nicosia', 'Cyprus', 35.1547, 33.4961, 122, 'Asia/Nicosia', '1975-02-08', NULL, 1, 2750, 'small', 15, 20),

-- Danimarca - Aeroporti Moderni
('Copenhagen Kastrup Airport', 'CPH', 'EKCH', 'Copenhagen', 'Denmark', 55.6181, 12.6561, 5, 'Europe/Copenhagen', '1925-04-20', NULL, 3, 3600, 'large', 80, 90),
('Billund Airport', 'BLL', 'EKBI', 'Billund', 'Denmark', 55.7403, 9.1518, 75, 'Europe/Copenhagen', '1964-11-01', NULL, 1, 3100, 'medium', 40, 60),
('Aalborg Airport', 'AAL', 'EKYT', 'Aalborg', 'Denmark', 57.0928, 9.8492, 3, 'Europe/Copenhagen', '1938-05-01', NULL, 2, 2549, 'medium', 30, 40),

-- Danimarca - Aeroporti Storici/Chiusi
('Copenhagen Airport (Storico)', 'QCP', 'EKCO', 'Copenhagen', 'Denmark', 55.6800, 12.5833, 5, 'Europe/Copenhagen', '1910-01-01', '1956-12-31', 1, 1200, 'campo_aviazione', 10, 20),
('Roskilde Airfield', 'QRO', 'EKRK', 'Roskilde', 'Denmark', 55.5856, 12.1314, 44, 'Europe/Copenhagen', '1936-01-01', '1980-12-31', 1, 900, 'campo_aviazione', 5, 10),

-- Danimarca - Aeroporti Regionali Minori
('Esbjerg Airport', 'EBJ', 'EKEB', 'Esbjerg', 'Denmark', 55.5259, 8.5534, 30, 'Europe/Copenhagen', '1971-04-04', NULL, 1, 2600, 'small', 10, 15),
('Bornholm Airport', 'RNN', 'EKRN', 'Rønne', 'Denmark', 55.0633, 14.7596, 16, 'Europe/Copenhagen', '1940-11-16', NULL, 1, 2000, 'small', 8, 12),

-- Estonia (ex URSS) - Aeroporti Moderni (dal 1991)
('Tallinn Lennart Meri Airport', 'TLL', 'EETN', 'Tallinn', 'Estonia', 59.4133, 24.8328, 40, 'Europe/Tallinn', '1991-08-20', NULL, 2, 3070, 'medium', 60, 70),
('Tartu Airport', 'TAY', 'EETU', 'Tartu', 'Estonia', 58.3075, 26.6903, 68, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1799, 'small', 15, 20),
('Pärnu Airport', 'EPU', 'EEPU', 'Pärnu', 'Estonia', 58.4181, 24.4728, 14, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1970, 'small', 10, 15),

-- Estonia (ex URSS) - Aeroporti Regionali Minori
('Kuressaare Airport', 'URE', 'EEKE', 'Kuressaare', 'Estonia', 58.2299, 22.5095, 4, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1500, 'campo_aviazione', 5, 8),
('Kärdla Airport', 'KDL', 'EEKA', 'Kärdla', 'Estonia', 58.9908, 22.8307, 6, 'Europe/Tallinn', '1991-08-20', NULL, 1, 1500, 'campo_aviazione', 3, 5),

-- Finlandia - Aeroporti Moderni
('Helsinki-Vantaa Airport', 'HEL', 'EFHK', 'Helsinki', 'Finland', 60.3172, 24.9633, 55, 'Europe/Helsinki', '1952-07-10', NULL, 3, 3500, 'large', 80, 90),
('Tampere-Pirkkala Airport', 'TMP', 'EFTP', 'Tampere', 'Finland', 61.4142, 23.6044, 119, 'Europe/Helsinki', '1979-01-01', NULL, 2, 2700, 'medium', 30, 40),
('Oulu Airport', 'OUL', 'EFOU', 'Oulu', 'Finland', 64.9301, 25.3546, 15, 'Europe/Helsinki', '1953-06-01', NULL, 2, 2500, 'medium', 25, 30),

-- Finlandia - Aeroporti Storici/Chiusi
('Helsinki-Malmi Airport', 'HEM', 'EFHF', 'Helsinki', 'Finland', 60.2546, 25.0450, 16, 'Europe/Helsinki', '1936-12-16', '2021-12-31', 2, 1300, 'campo_aviazione', 10, 20),

-- Finlandia - Aeroporti Regionali Minori
('Rovaniemi Airport', 'RVN', 'EFRO', 'Rovaniemi', 'Finland', 66.5648, 25.8304, 196, 'Europe/Helsinki', '1940-12-15', NULL, 1, 3000, 'small', 10, 15),
('Kuopio Airport', 'KUO', 'EFKU', 'Kuopio', 'Finland', 63.0072, 27.7978, 102, 'Europe/Helsinki', '1939-11-01', NULL, 1, 2800, 'small', 8, 12),
-- Francia - Aeroporti Moderni
('Charles de Gaulle Airport', 'CDG', 'LFPG', 'Paris', 'France', 49.0097, 2.5479, 119, 'Europe/Paris', '1974-03-08', NULL, 4, 4215, 'large', 90, 80),
('Orly Airport', 'ORY', 'LFPO', 'Paris', 'France', 48.7233, 2.3794, 89, 'Europe/Paris', '1932-02-01', NULL, 3, 3650, 'large', 70, 60),
('Nice Côte d Azur Airport', 'NCE', 'LFMN', 'Nice', 'France', 43.6584, 7.2159, 4, 'Europe/Paris', '1946-07-01', NULL, 2, 2960, 'large', 60, 90),
('Lyon Saint Exupéry Airport', 'LYS', 'LFLL', 'Lyon', 'France', 45.7256, 5.0811, 250, 'Europe/Paris', '1975-04-12', NULL, 2, 4000, 'large', 50, 60),

-- Francia - Aeroporti Storici/Chiusi
('Le Bourget Airport', 'LBG', 'LFPB', 'Paris', 'France', 48.9694, 2.4414, 66, 'Europe/Paris', '1919-10-27', '1977-03-08', 2, 3000, 'medium', 20, 30),
('Paris Issy-les-Moulineaux Airfield', 'QIM', 'LFPI', 'Paris', 'France', 48.8250, 2.2700, 30, 'Europe/Paris', '1908-01-01', '1953-12-31', 1, 800, 'campo_aviazione', 10, 10),

-- Francia - Aeroporti Regionali Minori
('Bordeaux Mérignac Airport', 'BOD', 'LFBD', 'Bordeaux', 'France', 44.8283, -0.7156, 49, 'Europe/Paris', '1917-01-01', NULL, 2, 3100, 'medium', 15, 20),
('Marseille Provence Airport', 'MRS', 'LFML', 'Marseille', 'France', 43.4367, 5.2150, 21, 'Europe/Paris', '1922-10-22', NULL, 2, 3500, 'medium', 20, 30),
('Toulouse-Blagnac Airport', 'TLS', 'LFBO', 'Toulouse', 'France', 43.6291, 1.3638, 151, 'Europe/Paris', '1939-01-01', NULL, 2, 3000, 'medium', 18, 25),
('Ajaccio Napoleon Bonaparte Airport', 'AJA', 'LFKJ', 'Ajaccio', 'France', 41.9236, 8.8029, 18, 'Europe/Paris', '1940-01-01', NULL, 1, 2400, 'small', 10, 30),
('Bastia Poretta Airport', 'BIA', 'LFKB', 'Bastia', 'France', 42.5527, 9.4837, 26, 'Europe/Paris', '1940-01-01', NULL, 1, 2500, 'small', 8, 25),
('Calvi Sainte-Catherine Airport', 'CLY', 'LFKC', 'Calvi', 'France', 42.5244, 8.7931, 64, 'Europe/Paris', '1950-01-01', NULL, 1, 2310, 'small', 5, 20),
('Figari Sud-Corse Airport', 'FSC', 'LFKF', 'Figari', 'France', 41.5006, 9.0978, 26, 'Europe/Paris', '1975-01-01', NULL, 1, 2500, 'small', 5, 15),
('Strasbourg Airport', 'SXB', 'LFST', 'Strasbourg', 'France', 48.5383, 7.6282, 154, 'Europe/Paris', '1923-05-01', NULL, 2, 2400, 'medium', 12, 18),
('Lille Airport', 'LIL', 'LFQQ', 'Lille', 'France', 50.5633, 3.0894, 52, 'Europe/Paris', '1947-01-01', NULL, 2, 2825, 'medium', 10, 15),
('Nantes Atlantique Airport', 'NTE', 'LFRS', 'Nantes', 'France', 47.1531, -1.6107, 27, 'Europe/Paris', '1928-01-01', NULL, 1, 2900, 'medium', 10, 15),
('Montpellier Méditerranée Airport', 'MPL', 'LFMT', 'Montpellier', 'France', 43.5762, 3.9630, 5, 'Europe/Paris', '1946-01-01', NULL, 2, 2600, 'medium', 8, 12),

-- Germania - Aeroporti Moderni
('Frankfurt Airport', 'FRA', 'EDDF', 'Frankfurt', 'Germany', 50.0264, 8.5431, 111, 'Europe/Berlin', '1936-07-08', NULL, 4, 4000, 'large', 93, 65),
('Munich Airport', 'MUC', 'EDDM', 'Munich', 'Germany', 48.3538, 11.7861, 448, 'Europe/Berlin', '1992-05-17', NULL, 2, 4000, 'large', 85, 80),
('Berlin Brandenburg Airport', 'BER', 'EDDB', 'Berlin', 'Germany', 52.3667, 13.5033, 48, 'Europe/Berlin', '2020-10-31', NULL, 2, 4000, 'large', 80, 70),
('Düsseldorf Airport', 'DUS', 'EDDL', 'Düsseldorf', 'Germany', 51.2895, 6.7668, 44, 'Europe/Berlin', '1927-04-19', NULL, 2, 3000, 'large', 60, 60),
('Hamburg Airport', 'HAM', 'EDDH', 'Hamburg', 'Germany', 53.6304, 9.9886, 16, 'Europe/Berlin', '1911-01-01', NULL, 2, 3666, 'large', 55, 65),

-- Germania - Aeroporti Storici/Chiusi
('Berlin Tempelhof Airport', 'THF', 'EDDI', 'Berlin', 'Germany', 52.4736, 13.4028, 48, 'Europe/Berlin', '1923-10-08', '2008-10-30', 2, 1840, 'medium', 20, 30),
('Berlin Tegel Airport', 'TXL', 'EDDT', 'Berlin', 'Germany', 52.5597, 13.2877, 37, 'Europe/Berlin', '1948-11-05', '2020-11-08', 2, 3023, 'large', 50, 60),
('Cologne Butzweilerhof Airfield', 'QCG', 'EDKB', 'Cologne', 'Germany', 50.9781, 6.9047, 53, 'Europe/Berlin', '1911-01-01', '1957-12-31', 1, 900, 'campo_aviazione', 10, 10),

-- Germania - Aeroporti Regionali Minori
('Stuttgart Airport', 'STR', 'EDDS', 'Stuttgart', 'Germany', 48.6899, 9.2219, 389, 'Europe/Berlin', '1939-05-01', NULL, 2, 3345, 'medium', 20, 30),
('Hannover Airport', 'HAJ', 'EDDV', 'Hannover', 'Germany', 52.4611, 9.6851, 56, 'Europe/Berlin', '1952-04-12', NULL, 3, 2340, 'medium', 15, 20),
('Leipzig/Halle Airport', 'LEJ', 'EDDP', 'Leipzig', 'Germany', 51.4239, 12.2364, 143, 'Europe/Berlin', '1990-10-03', NULL, 2, 3600, 'medium', 12, 18),
('Nuremberg Airport', 'NUE', 'EDDN', 'Nuremberg', 'Germany', 49.4987, 11.0669, 312, 'Europe/Berlin', '1955-04-06', NULL, 2, 2700, 'medium', 10, 15),
('Bremen Airport', 'BRE', 'EDDW', 'Bremen', 'Germany', 53.0475, 8.7867, 4, 'Europe/Berlin', '1913-05-18', NULL, 2, 2700, 'small', 8, 12),
('Dortmund Airport', 'DTM', 'EDLW', 'Dortmund', 'Germany', 51.5183, 7.6122, 130, 'Europe/Berlin', '1960-04-01', NULL, 1, 2000, 'small', 8, 10),
('Karlsruhe/Baden-Baden Airport', 'FKB', 'EDSB', 'Baden-Baden', 'Germany', 48.7794, 8.0805, 124, 'Europe/Berlin', '1997-04-01', NULL, 1, 3000, 'small', 7, 8),
('Münster Osnabrück Airport', 'FMO', 'EDDG', 'Münster', 'Germany', 52.1346, 7.6848, 48, 'Europe/Berlin', '1972-12-28', NULL, 2, 2170, 'small', 6, 7),

-- Germania Est (storica, chiusi alla riunificazione)
-- Nota: questi aeroporti sono chiusi al 1990-10-03 e riaperti come Germania unificata
('Berlin Schönefeld Airport', 'SXF', 'EDDB', 'Berlin', 'East Germany', 52.3800, 13.5225, 48, 'Europe/Berlin', '1946-10-22', '1990-10-03', 1, 3600, 'medium', 30, 40),
('Leipzig/Halle Airport (DDR)', 'LEJ', 'EDDP', 'Leipzig', 'East Germany', 51.4239, 12.2364, 143, 'Europe/Berlin', '1927-04-18', '1990-10-03', 2, 3600, 'medium', 12, 18),
('Dresden Airport (DDR)', 'DRS', 'EDDC', 'Dresden', 'East Germany', 51.1328, 13.7672, 230, 'Europe/Berlin', '1935-07-11', '1990-10-03', 1, 2850, 'medium', 10, 15),
('Erfurt-Weimar Airport (DDR)', 'ERF', 'EDDE', 'Erfurt', 'East Germany', 50.9798, 10.9581, 316, 'Europe/Berlin', '1937-05-01', '1990-10-03', 1, 2600, 'small', 8, 10),
('Rostock-Laage Airport (DDR)', 'RLG', 'ETNL', 'Rostock', 'East Germany', 53.9181, 12.2783, 39, 'Europe/Berlin', '1979-05-01', '1990-10-03', 1, 2500, 'small', 5, 8),

-- Germania Est - Aeroporti riaperti dopo la riunificazione (dal 1990-10-03)
-- Nota: Berlin Schönefeld Airport (SXF) ha continuato a operare come aeroporto secondario fino al 2020, quando è stato integrato nel nuovo Berlin Brandenburg Airport (BER).
('Berlin Schönefeld Airport', 'SXF', 'EDDB', 'Berlin', 'Germany', 52.3800, 13.5225, 48, 'Europe/Berlin', '1990-10-03', '2020-10-25', 1, 3600, 'medium', 40, 50),
('Dresden Airport', 'DRS', 'EDDC', 'Dresden', 'Germany', 51.1328, 13.7672, 230, 'Europe/Berlin', '1990-10-03', NULL, 1, 2850, 'medium', 35, 40),
('Erfurt-Weimar Airport', 'ERF', 'EDDE', 'Erfurt', 'Germany', 50.9798, 10.9581, 316, 'Europe/Berlin', '1990-10-03', NULL, 1, 2600, 'small', 18, 20),
('Rostock-Laage Airport', 'RLG', 'ETNL', 'Rostock', 'Germany', 53.9181, 12.2783, 39, 'Europe/Berlin', '1990-10-03', NULL, 1, 2500, 'small', 12, 15),

-- Grecia - Aeroporti Moderni
('Athens Eleftherios Venizelos Airport', 'ATH', 'LGAV', 'Athens', 'Greece', 37.9364, 23.9445, 94, 'Europe/Athens', '2001-03-28', NULL, 2, 4000, 'large', 80, 90),
('Thessaloniki Makedonia Airport', 'SKG', 'LGTS', 'Thessaloniki', 'Greece', 40.5197, 22.9709, 7, 'Europe/Athens', '1930-05-01', NULL, 2, 2440, 'medium', 60, 70),
('Heraklion Nikos Kazantzakis Airport', 'HER', 'LGIR', 'Heraklion', 'Greece', 35.3397, 25.1744, 39, 'Europe/Athens', '1939-03-01', NULL, 2, 2715, 'medium', 50, 80),
('Rhodes Diagoras Airport', 'RHO', 'LGRP', 'Rhodes', 'Greece', 36.4054, 28.0862, 19, 'Europe/Athens', '1977-06-28', NULL, 2, 3306, 'medium', 40, 90),
('Corfu Ioannis Kapodistrias Airport', 'CFU', 'LGKR', 'Corfu', 'Greece', 39.6019, 19.9117, 2, 'Europe/Athens', '1949-05-01', NULL, 1, 2373, 'small', 30, 80),
('Chania Ioannis Daskalogiannis Airport', 'CHQ', 'LGSA', 'Chania', 'Greece', 35.5317, 24.1497, 149, 'Europe/Athens', '1959-07-01', NULL, 1, 3300, 'small', 25, 60),
('Kos Island International Airport', 'KGS', 'LGKO', 'Kos', 'Greece', 36.7933, 27.0917, 126, 'Europe/Athens', '1964-06-04', NULL, 1, 2400, 'small', 20, 70),
('Santorini Thira National Airport', 'JTR', 'LGSR', 'Santorini', 'Greece', 36.3992, 25.4793, 39, 'Europe/Athens', '1972-03-01', NULL, 1, 2200, 'small', 15, 80),

-- Grecia - Aeroporti Storici/Chiusi
('Athens Ellinikon Airport', 'HEW', 'LGAT', 'Athens', 'Greece', 37.8922, 23.7261, 7, 'Europe/Athens', '1938-03-01', '2001-03-27', 2, 3500, 'large', 60, 70),
('Thessaloniki Sedes Airfield', 'QTS', 'LGSD', 'Thessaloniki', 'Greece', 40.5197, 22.9709, 7, 'Europe/Athens', '1912-01-01', '1948-12-31', 1, 1200, 'campo_aviazione', 10, 10),
('Heraklion Old Airfield', 'QHO', 'LGHO', 'Heraklion', 'Greece', 35.3397, 25.1744, 39, 'Europe/Athens', '1930-01-01', '1939-02-28', 1, 900, 'campo_aviazione', 5, 5),

-- Grecia - Aeroporti Regionali Minori
('Mykonos Island National Airport', 'JMK', 'LGMK', 'Mykonos', 'Greece', 37.4351, 25.3481, 123, 'Europe/Athens', '1971-05-01', NULL, 1, 1903, 'small', 10, 60),
('Samos Aristarchos Airport', 'SMI', 'LGSM', 'Samos', 'Greece', 37.6897, 26.9103, 6, 'Europe/Athens', '1982-06-01', NULL, 1, 2040, 'small', 8, 30),
('Zakynthos Dionysios Solomos Airport', 'ZTH', 'LGZA', 'Zakynthos', 'Greece', 37.7509, 20.8843, 15, 'Europe/Athens', '1972-08-01', NULL, 1, 2220, 'small', 8, 40),
('Kavala International Airport', 'KVA', 'LGKV', 'Kavala', 'Greece', 40.9133, 24.6192, 5, 'Europe/Athens', '1981-12-12', NULL, 1, 3000, 'small', 7, 20),

-- Irlanda
-- Islanda
-- Italia
-- Kosovo (ex Jugoslavia)
-- Lettonia (ex URSS)
-- Lituania (ex URSS)
-- Lussemburgo
-- Macedonia del Nord (ex Jugoslavia)
-- Malta
-- Moldavia (ex URSS)
-- Monaco
-- Montenegro (ex Jugoslavia)
-- Norvegia
-- Paesi Bassi
-- Polonia
-- Portogallo
-- Regno Unito
-- Repubblica Ceca (ex Cecoslovacchia)
-- Romania
-- Russia (ex URSS)
-- San Marino
-- Serbia (ex Jugoslavia)
-- Slovacchia (ex Cecoslovacchia)
-- Slovenia (ex Jugoslavia)
-- Spagna
-- Svezia
-- Svizzera
-- Ucraina (ex URSS)
-- Ungheria
-- Vaticano

-- Stati storici/falliti:
-- URSS (Unione Sovietica)
-- Jugoslavia
-- Cecoslovacchia


-- Nord America
-- Stati Uniti d'America
-- Canada
-- Messico
-- Guatemala
-- Belize
-- El Salvador
-- Honduras
-- Nicaragua
-- Costa Rica
-- Panama
-- Cuba
-- Repubblica Dominicana
-- Haiti
-- Giamaica
-- Bahamas
-- Barbados
-- Trinidad e Tobago
-- Saint Kitts e Nevis
-- Saint Lucia
-- Saint Vincent e Grenadine
-- Grenada
-- Antigua e Barbuda
-- Dominica
-- Bermuda (territorio britannico)
-- Groenlandia (territorio danese)
-- Porto Rico (territorio USA)
-- Isole Vergini Americane (territorio USA)
-- Isole Vergini Britanniche (territorio UK)
-- Isole Cayman (territorio UK)
-- Isole Turks e Caicos (territorio UK)
-- Montserrat (territorio UK)
-- Saint Pierre e Miquelon (territorio francese)
-- Aruba (territorio olandese)
-- Curaçao (territorio olandese)
-- Sint Maarten (territorio olandese)
-- Saint-Barthélemy (territorio francese)
-- Saint-Martin (territorio francese)
-- Anguilla (territorio UK)

-- Asia
-- Stati e territori asiatici dal 1940 ad oggi
-- Afghanistan
-- Arabia Saudita
-- Armenia
-- Azerbaigian
-- Bahrein
-- Bangladesh
-- Bhutan
-- Birmania/Myanmar
-- Brunei
-- Cambogia
-- Cina
-- Corea del Nord
-- Corea del Sud
-- Emirati Arabi Uniti
-- Filippine
-- Georgia
-- Giappone
-- Giordania
-- India
-- Indonesia
-- Iran
-- Iraq
-- Israele
-- Kazakistan
-- Kirghizistan
-- Kuwait
-- Laos
-- Libano
-- Malesia
-- Maldive
-- Mongolia
-- Nepal
-- Oman
-- Pakistan
-- Qatar
-- Russia (parte asiatica)
-- Singapore
-- Siria
-- Sri Lanka
-- Tagikistan
-- Taiwan
-- Thailandia
-- Timor Est
-- Turchia (parte asiatica)
-- Turkmenistan
-- Uzbekistan
-- Vietnam
-- Yemen
-- Hong Kong (territorio speciale Cina)
-- Macao (territorio speciale Cina)

-- Oceania
-- Stati e territori oceanici dal 1940 ad oggi
-- Australia
-- Nuova Zelanda
-- Papua Nuova Guinea
-- Figi
-- Isole Salomone
-- Vanuatu
-- Samoa
-- Tonga
-- Micronesia
-- Palau
-- Nauru
-- Tuvalu
-- Kiribati
-- Marshall Islands
-- Stati Federati di Micronesia
-- Niue
-- Tokelau
-- Isole Cook
-- Pitcairn
-- Isole Pitcairn
-- Isole Kermadec
-- Isole Chatham
-- Isole Auckland
-- Isole Campbell
-- Isole Snares
-- Isole Bounty
-- Isole Antipodi
-- Isole Macquarie
-- Isole Heard e McDonald
-- Isole di Pasqua
-- Isole Galapagos
-- Isole Falkland
-- Isole Sandwich
-- Isole Georgia del Sud

-- Territori, colonie e possedimenti Oceania
-- Guam (USA)
-- Samoa Americane (USA)
-- Polinesia Francese (Francia)
-- Nuova Caledonia (Francia)
-- Wallis e Futuna (Francia)
-- Isole Norfolk (Australia)
-- Christmas Island (Australia)
-- Cocos (Keeling) Islands (Australia)
-- Tokelau (Nuova Zelanda)
-- Isole Cook (Nuova Zelanda)
-- Niue (Nuova Zelanda)

-- Africa
-- Stati e territori africani dal 1940 ad oggi
-- Algeria
-- Angola
-- Benin
-- Botswana
-- Burkina Faso
-- Burundi
-- Capo Verde
-- Camerun
-- Repubblica Centrafricana
-- Ciad
-- Comore
-- Repubblica del Congo
-- Repubblica Democratica del Congo
-- Costa d'Avorio
-- Djibouti
-- Egitto
-- Guinea
-- Guinea-Bissau
-- Lesotho
-- Liberia
-- Libia
-- Madagascar
-- Malawi
-- Mali
-- Mauritania
-- Mauritius
-- Marocco
-- Mozambico
-- Namibia
-- Niger
-- Nigeria
-- Ruanda
-- Sao Tomé e Principe
-- Senegal
-- Seychelles
-- Sierra Leone
-- Somalia
-- Sudafrica
-- Sud Sudan
-- Tanzania
-- Togo
-- Tunisia
-- Uganda
-- Zambia
-- Zimbabwe

-- Territori, colonie e possedimenti Africa
-- Mayotte (Francia)
-- Réunion (Francia)
-- Saint Helena (UK)
-- Ceuta (Spagna)
-- Melilla (Spagna)
-- Canarie (Spagna)
-- Madeira (Portogallo)

-- Sud America
-- Stati e territori sudamericani dal 1940 ad oggi
-- Argentina
-- Bolivia
-- Brasile
-- Cile
-- Colombia
-- Ecuador
-- Guyana
-- Paraguay
-- Perù
-- Suriname
-- Uruguay
-- Venezuela


-- Territori, colonie e possedimenti Sud America
-- Guyana Francese (Francia)
-- Isole Malvinas/Falkland (UK)
-- Georgia del Sud e Sandwich Australi (UK)

