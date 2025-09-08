-- Inserisci qui i dati iniziali per la tabella aircraft_types
INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES
-- 1932
('Junkers Ju 52', 'Junkers', 'regional', 10.7, 2.3, NULL, 800, 1300, 220, 265, 50000000, 110, 13000, TRUE, FALSE, NULL, 1932, 1955),
('Junkers Ju 52 Cargo', 'Junkers', 'cargo', 10.7, 2.3, 2.5, 800, 1300, 250, 265, 52000000, 120, 13000, TRUE, FALSE, NULL, 1932, 1955),

-- 1934
('de Havilland DH.89 Dragon Rapide', 'de Havilland', 'regional', 8.8, 1.9, NULL, 600, 650, 120, 240, 35000000, 100, 12000, TRUE, FALSE, NULL, 1934, 1949),

-- 1935
('Lockheed Model 10 Electra', 'Lockheed', 'regional', 11.0, 2.0, NULL, 800, 1200, 200, 300, 45000000, 130, 14000, TRUE, FALSE, NULL, 1935, 1945),
('Lockheed Model 10 Electra Cargo', 'Lockheed', 'cargo', 9.8, 2.0, 1.0, 750, 1300, 220, 325, 47000000, 110, 12000, TRUE, FALSE, NULL, 1935, 1950),

-- 1936
('Douglas DC-3', 'Douglas', 'regional', 15.7, 2.2, NULL, 950, 2400, 350, 333, 120000000, 400, 30000, TRUE, FALSE, NULL, 1936, 1950),
('Douglas DC-3 Cargo', 'Douglas', 'cargo', 15.7, 2.2, 3.5, 950, 2400, 370, 333, 130000000, 420, 30000, TRUE, FALSE, NULL, 1936, 1950),

-- 1937
('Beechcraft Model 18', 'Beechcraft', 'regional', 10.4, 1.8, NULL, 700, 1600, 180, 320, 40000000, 120, 15000, TRUE, FALSE, NULL, 1937, 1960),
('Beechcraft Model 18 Cargo', 'Beechcraft', 'cargo', 10.4, 1.8, 1.2, 700, 1600, 200, 320, 42000000, 130, 15000, TRUE, FALSE, NULL, 1937, 1960),

-- 1940
('Douglas DC-4', 'Douglas', 'wide_body', 27.6, 3.5, NULL, 1800, 6700, 1200, 450, 220000000, 900, 25000, FALSE, TRUE, 90000000, 1940, 1958),

-- 1941
('Curtiss C-46 Commando Cargo', 'Curtiss', 'cargo', 15.6, 2.3, 5.9, 1200, 1900, 400, 350, 110000000, 400, 25000, TRUE, FALSE, NULL, 1941, 1955),
('Lockheed Lodestar', 'Lockheed', 'regional', 12.5, 2.2, NULL, 850, 2100, 250, 330, 60000000, 150, 15000, TRUE, FALSE, NULL, 1941, 1950),
('Lockheed Lodestar Cargo', 'Lockheed', 'cargo', 12.5, 2.2, 1.8, 850, 2100, 270, 330, 65000000, 160, 15000, TRUE, FALSE, NULL, 1941, 1950),

-- 1942
('Douglas C-54 Skymaster Cargo', 'Douglas', 'cargo', 28.6, 3.5, 10.0, 1600, 6400, 1200, 450, 180000000, 900, 40000, FALSE, FALSE, NULL, 1942, 1950),
('Consolidated C-87 Liberator Express Cargo', 'Consolidated', 'cargo', 20.5, 2.7, 8.0, 1500, 4800, 1100, 480, 150000000, 800, 35000, FALSE, FALSE, NULL, 1942, 1945),
('Avro York', 'Avro', 'wide_body', 21.3, 3.3, NULL, 1500, 4800, 1050, 430, 160000000, 850, 30000, FALSE, FALSE, NULL, 1942, 1957),
('Short Stirling Transport', 'Short Brothers', 'cargo', 17.0, 2.9, 7.0, 1400, 3700, 950, 380, 140000000, 780, 25000, FALSE, FALSE, NULL, 1942, 1946),

-- 1943
('Douglas C-47 Skytrain Cargo', 'Douglas', 'cargo', 15.7, 2.2, 3.5, 950, 2400, 370, 333, 130000000, 420, 30000, TRUE, FALSE, NULL, 1943, 1950),
('Avro York Cargo', 'Avro', 'cargo', 21.3, 3.2, 10.0, 1600, 4800, 1200, 400, 140000000, 800, 30000, FALSE, FALSE, NULL, 1943, 1957),
('Handley Page Halton Cargo', 'Handley Page', 'cargo', 18.5, 3.0, 8.0, 1500, 3700, 950, 390, 135000000, 750, 25000, FALSE, FALSE, NULL, 1943, 1948),
('Boeing 307 Stratoliner', 'Boeing', 'wide_body', 14.7, 2.4, 33, 1200, 3900, 600, 340, 125000000, 500, 20000, FALSE, FALSE, NULL, 1943, 1951),

-- 1944 
('Douglas C-54E Skymaster Cargo', 'Douglas', 'cargo', 28.6, 3.5, 11.0, 1600, 6500, 1250, 450, 185000000, 950, 40000, FALSE, FALSE, NULL, 1944, 1950),
('Handley Page Halifax C Mk VIII Cargo', 'Handley Page', 'cargo', 21.9, 3.2, 9.0, 1500, 3200, 1100, 420, 120000000, 700, 25000, FALSE, FALSE, NULL, 1944, 1947),

-- 1945 
('Lockheed L-049 Constellation', 'Lockheed', 'narrow_body', 21.3, 2.8, 44, 1600, 4000, 800, 480, 350000000, 700, 35000, FALSE, FALSE, NULL, 1945, 1951),
('Lockheed L-049 Constellation Cargo', 'Lockheed', 'cargo', 21.3, 2.8, 6.0, 1600, 4000, 850, 480, 360000000, 720, 35000, FALSE, FALSE, NULL, 1945, 1951),
('Avro Lancaster Transport', 'Avro', 'cargo', 17.2, 2.9, 8.5, 1400, 3900, 1000, 400, 140000000, 750, 30000, FALSE, FALSE, NULL, 1945, 1950),

-- 1946
('Douglas DC-4 Cargo', 'Douglas', 'cargo', 21.3, 3.0, 8.0, 1600, 4200, 950, 370, 410000000, 820, 40000, FALSE, FALSE, NULL, 1946, 1955),
('Bristol Freighter', 'Bristol', 'regional', 16.6, 3.2, NULL, 1100, 1500, 800, 270, 90000000, 300, 20000, TRUE, FALSE, NULL, 1946, 1968),
('Fairchild C-82 Packet Cargo', 'Fairchild', 'cargo', 16.8, 3.4, 4.0, 1100, 2100, 900, 300, 95000000, 350, 18000, TRUE, FALSE, NULL, 1946, 1954),
('Martin 2-0-2', 'Martin', 'regional', 17.4, 2.8, NULL, 1200, 2100, 900, 430, 120000000, 400, 22000, FALSE, FALSE, NULL, 1946, 1959),

-- 1947
('Douglas DC-6', 'Douglas', 'narrow_body', 24.6, 3.0, NULL, 1600, 4000, 900, 507, 600000000, 900, 40000, FALSE, FALSE, NULL, 1947, 1958),
('Douglas DC-6 Cargo', 'Douglas', 'cargo', 24.6, 3.0, 12.0, 1600, 4000, 950, 507, 610000000, 920, 40000, FALSE, FALSE, NULL, 1947, 1958),
('Antonov An-2', 'Antonov', 'regional', 12.4, 2.0, NULL, 500, 845, 120, 258, 35000000, 80, 12000, TRUE, FALSE, NULL, 1947, 2001),
('Convair 240 Cargo', 'Convair', 'cargo', 16.7, 2.7, 3.5, 1200, 2600, 750, 480, 360000000, 520, 25000, FALSE, FALSE, NULL, 1947, 1954),
('Vickers Viking', 'Vickers', 'regional', 15.2, 2.8, NULL, 900, 2100, 600, 370, 80000000, 200, 15000, TRUE, FALSE, NULL, 1947, 1954),
('Vickers Viking Cargo', 'Vickers', 'cargo', 15.2, 2.8, 2.0, 900, 2100, 650, 370, 82000000, 210, 15000, TRUE, FALSE, NULL, 1947, 1954),

-- 1948 
('Convair 240', 'Convair', 'regional', 16.7, 2.7, NULL, 1200, 2600, 700, 480, 350000000, 500, 25000, FALSE, FALSE, NULL, 1948, 1954),
('Handley Page Hermes', 'Handley Page', 'narrow_body', 23.2, 3.2, NULL, 1600, 4800, 1100, 400, 140000000, 800, 30000, FALSE, FALSE, NULL, 1948, 1954),
('Airspeed Ambassador', 'Airspeed', 'regional', 18.6, 2.8, NULL, 1200, 3200, 900, 370, 90000000, 300, 20000, FALSE, FALSE, NULL, 1948, 1958),
('Bristol 170 Freighter Mk 21 Cargo', 'Bristol', 'cargo', 17.0, 3.2, 4.0, 1100, 1600, 850, 270, 95000000, 320, 20000, TRUE, FALSE, NULL, 1948, 1968),

-- 1949
('de Havilland DH.106 Comet', 'de Havilland', 'narrow_body', 25.0, 3.0, NULL, 2000, 4000, 1800, 800, 1500000000, 1200, 40000, FALSE, FALSE, NULL, 1949, 1964),
('Handley Page Hermes IV', 'Handley Page', 'narrow_body', 23.2, 3.2, NULL, 1600, 4800, 1100, 400, 145000000, 820, 30000, FALSE, FALSE, NULL, 1949, 1954),
('Bristol 170 Freighter Mk 31 Cargo', 'Bristol', 'cargo', 17.0, 3.2, 4.2, 1100, 1600, 870, 270, 97000000, 340, 20000, TRUE, FALSE, NULL, 1949, 1968),
('Convair 340', 'Convair', 'regional', 18.6, 2.7, NULL, 1200, 2600, 900, 480, 370000000, 540, 25000, FALSE, FALSE, NULL, 1949, 1956),
('Convair 340 Cargo', 'Convair', 'cargo', 18.6, 2.7, 3.7, 1200, 2600, 950, 480, 380000000, 560, 25000, FALSE, FALSE, NULL, 1949, 1956),

-- 1950
('Douglas DC-7', 'Douglas', 'narrow_body', 27.8, 3.5, NULL, 1700, 8000, 1200, 610, 800000000, 900, 40000, FALSE, FALSE, NULL, 1950, 1958),
('Douglas DC-7 Cargo', 'Douglas', 'cargo', 27.8, 3.5, 12.0, 1700, 8000, 1250, 610, 820000000, 920, 40000, FALSE, FALSE, NULL, 1950, 1958),
('Canadair C-4 North Star', 'Canadair', 'narrow_body', 21.3, 3.0, NULL, 1600, 6400, 950, 370, 420000000, 820, 40000, FALSE, FALSE, NULL, 1950, 1958),
('Handley Page Hermes V', 'Handley Page', 'narrow_body', 23.2, 3.2, NULL, 1600, 4800, 1100, 400, 148000000, 820, 30000, FALSE, FALSE, NULL, 1950, 1954),

-- 1952
('Convair CV-440 Metropolitan', 'Convair', 'regional', 18.6, 2.7, NULL, 1200, 3400, 950, 480, 400000000, 560, 25000, FALSE, FALSE, NULL, 1952, 1958),
('Convair CV-440 Metropolitan Cargo', 'Convair', 'cargo', 18.6, 2.7, 3.7, 1200, 3400, 1000, 480, 410000000, 580, 25000, FALSE, FALSE, NULL, 1952, 1958),

--1953

-- Vickers Viscount (passeggeri)
('Vickers Viscount', 'Vickers', 'regional', 18.6, 2.8, NULL, 1400, 2600, 600, 440, 500000000, 600, 35000, FALSE, FALSE, NULL, 1953, 1968),


-- 1954

-- Fokker F27 Friendship (passeggeri)
('Fokker F27 Friendship', 'Fokker', 'regional', 14.6, 2.7, NULL, 1200, 1700, 600, 460, 400000000, 600, 30000, FALSE, FALSE, NULL, 1954, 1987),

-- Fokker F27 Friendship Cargo
('Fokker F27 Friendship Cargo', 'Fokker', 'cargo', 14.6, 2.7, 3.5, 1200, 1700, 650, 460, 410000000, 620, 30000, FALSE, FALSE, NULL, 1954, 1987),

-- 1955

('Douglas DC-7C Seven Seas', 'Douglas', 'narrow_body', 32.2, 3.5, NULL, 1800, 9000, 1300, 610, 900000000, 950, 40000, FALSE, FALSE, NULL, 1955, 1960),
('Douglas DC-7C Seven Seas Cargo', 'Douglas', 'cargo', 32.2, 3.5, 13.0, 1800, 9000, 1350, 610, 920000000, 970, 40000, FALSE, FALSE, NULL, 1955, 1960),
('Vickers Viscount 800', 'Vickers', 'regional', 21.4, 2.8, NULL, 1400, 2600, 650, 440, 520000000, 650, 35000, FALSE, FALSE, NULL, 1955, 1968),
('Vickers Viscount 800 Cargo', 'Vickers', 'cargo', 21.4, 2.8, 4.0, 1400, 2600, 700, 440, 530000000, 670, 35000, FALSE, FALSE, NULL, 1955, 1968),

--1956

('Tupolev Tu-104', 'Tupolev', 'narrow_body', 36.9, 3.6, NULL, 2000, 2700, 1800, 900, 1100000000, 1200, 40000, FALSE, FALSE, NULL, 1956, 1979),
('Tupolev Tu-104 Cargo', 'Tupolev', 'cargo', 36.9, 3.6, 12.0, 2000, 2700, 1850, 900, 1120000000, 1220, 40000, FALSE, FALSE, NULL, 1956, 1979),
('Vickers Viscount 810', 'Vickers', 'regional', 21.4, 2.8, NULL, 1400, 2600, 650, 440, 540000000, 650, 35000, FALSE, FALSE, NULL, 1956, 1968),
('Vickers Viscount 810 Cargo', 'Vickers', 'cargo', 21.4, 2.8, 4.0, 1400, 2600, 700, 440, 550000000, 670, 35000, FALSE, FALSE, NULL, 1956, 1968),

-- 1957
('Antonov An-10', 'Antonov', 'narrow_body', 30.0, 3.2, NULL, 1500, 2500, 1200, 600, 600000000, 800, 30000, FALSE, FALSE, NULL, 1957, 1973),
('Antonov An-10 Cargo', 'Antonov', 'cargo', 30.0, 3.2, 10.0, 1500, 2500, 1250, 600, 620000000, 820, 30000, FALSE, FALSE, NULL, 1957, 1973),
('Vickers Viscount 812', 'Vickers', 'regional', 21.4, 2.8, NULL, 1400, 2600, 650, 440, 560000000, 650, 35000, FALSE, FALSE, NULL, 1957, 1968),
('Vickers Viscount 812 Cargo', 'Vickers', 'cargo', 21.4, 2.8, 4.0, 1400, 2600, 700, 440, 570000000, 670, 35000, FALSE, FALSE, NULL, 1957, 1968),

-- 1958
('Boeing 707', 'Boeing', 'narrow_body', 33.4, 3.5, NULL, 2500, 8000, 3500, 977, 2500000000, 2500, 90000, FALSE, FALSE, NULL, 1958, 1979),
('Boeing 707 Cargo', 'Boeing', 'cargo', 33.4, 3.5, 40.0, 2500, 8000, 3600, 977, 2520000000, 2520, 90000, FALSE, FALSE, NULL, 1958, 1979),
('De Havilland Comet 4', 'De Havilland', 'narrow_body', 24.6, 3.0, NULL, 2000, 3700, 1800, 800, 1200000000, 1200, 40000, FALSE, FALSE, NULL, 1958, 1964),
('De Havilland Comet 4 Cargo', 'De Havilland', 'cargo', 24.6, 3.0, 12.0, 2000, 3700, 1850, 800, 1220000000, 1220, 40000, FALSE, FALSE, NULL, 1958, 1964),

-- 1959
('Sud Caravelle', 'Sud Aviation', 'narrow_body', 20.0, 3.2, NULL, 1800, 2100, 1200, 800, 900000000, 1200, 50000, FALSE, FALSE, NULL, 1959, 1973),
('Fokker F27 Friendship Mk200', 'Fokker', 'regional', 14.6, 2.7, NULL, 1200, 1700, 600, 460, 420000000, 600, 30000, FALSE, FALSE, NULL, 1959, 1987),
('Fokker F27 Friendship Mk200 Cargo', 'Fokker', 'cargo', 14.6, 2.7, 3500, 1200, 1700, 650, 460, 430000000, 620, 30000, FALSE, FALSE, NULL, 1959, 1987),

-- 1960
('Convair 880', 'Convair', 'narrow_body', 28.6, 3.0, NULL, 2200, 4800, 2500, 970, 1800000000, 1800, 60000, FALSE, FALSE, NULL, 1960, 1962),
('Ilyushin Il-18', 'Ilyushin', 'narrow_body', 24.0, 3.2, NULL, 1800, 6500, 1200, 650, 800000000, 1200, 40000, FALSE, FALSE, NULL, 1960, 1985),
('Ilyushin Il-18 Cargo', 'Ilyushin', 'cargo', 24.0, 3.2, 12000, 1800, 6500, 1250, 650, 820000000, 1220, 40000, FALSE, FALSE, NULL, 1960, 1985),

-- 1961
('Vickers VC10', 'Vickers', 'narrow_body', 32.6, 3.54, NULL, 2500, 9000, 2200, 870, 2100000000, 1800, 70000, FALSE, FALSE, NULL, 1961, 1979),
('NAMC YS-11', 'NAMC', 'regional', 19.0, 2.8, NULL, 1200, 2200, 700, 450, 600000000, 600, 30000, FALSE, FALSE, NULL, 1961, 1982),
('NAMC YS-11 Cargo', 'NAMC', 'cargo', 19.0, 2.8, 3500, 1200, 2200, 750, 450, 620000000, 620, 30000, FALSE, FALSE, NULL, 1961, 1982),

-- 1962
('Boeing 727-100', 'Boeing', 'narrow_body', 32.9, 3.54, NULL, 2200, 4000, 2200, 870, 1800000000, 1800, 70000, FALSE, FALSE, NULL, 1962, 1984),
('Boeing 727-100 Cargo', 'Boeing', 'cargo', 32.9, 3.54, 15000, 2200, 4000, 2300, 870, 1820000000, 1820, 70000, FALSE, FALSE, NULL, 1962, 1984),
('Tupolev Tu-124', 'Tupolev', 'regional', 30.6, 2.9, NULL, 1800, 2100, 1200, 800, 900000000, 1200, 40000, FALSE, FALSE, NULL, 1962, 1979),

-- 1963
('BAC One-Eleven', 'BAC', 'narrow_body', 28.5, 3.06, NULL, 1800, 3400, 1800, 800, 1200000000, 1200, 40000, FALSE, FALSE, NULL, 1963, 1982),
('BAC One-Eleven Cargo', 'BAC', 'cargo', 28.5, 3.06, 9000, 1800, 3400, 1850, 800, 1220000000, 1220, 40000, FALSE, FALSE, NULL, 1963, 1982),

-- 1964
('Hawker Siddeley Trident', 'Hawker Siddeley', 'narrow_body', 30.0, 3.05, NULL, 2000, 3000, 1800, 870, 1300000000, 1200, 40000, FALSE, FALSE, NULL, 1964, 1975),
('Hawker Siddeley Trident Cargo', 'Hawker Siddeley', 'cargo', 30.0, 3.05, 9000, 2000, 3000, 1850, 870, 1320000000, 1220, 40000, FALSE, FALSE, NULL, 1964, 1975),
('Ilyushin Il-62', 'Ilyushin', 'wide_body', 35.3, 3.6, NULL, 2500, 10000, 3500, 900, 2000000000, 2500, 90000, FALSE, FALSE, NULL, 1964, 1995),
('Ilyushin Il-62 Cargo', 'Ilyushin', 'cargo', 35.3, 3.6, 20000, 2500, 10000, 3600, 900, 2020000000, 2520, 90000, FALSE, FALSE, NULL, 1964, 1995),

-- 1965
('Douglas DC-9-10', 'Douglas', 'narrow_body', 28.0, 3.05, NULL, 1800, 2600, 1700, 870, 1100000000, 1200, 40000, FALSE, FALSE, NULL, 1965, 1982),
('Douglas DC-9-10 Cargo', 'Douglas', 'cargo', 28.0, 3.05, 9000, 1800, 2600, 1750, 870, 1120000000, 1220, 40000, FALSE, FALSE, NULL, 1965, 1982),
('Antonov An-22', 'Antonov', 'cargo', 28.5, 3.8, 60000, 2000, 5000, 4000, 650, 1500000000, 2000, 60000, FALSE, FALSE, NULL, 1965, 2001),

-- 1966
('Tupolev Tu-134', 'Tupolev', 'regional', 27.5, 2.9, NULL, 1600, 2000, 1200, 800, 900000000, 1200, 40000, FALSE, FALSE, NULL, 1966, 1984),
('Tupolev Tu-134 Cargo', 'Tupolev', 'cargo', 27.5, 2.9, 3500, 1600, 2000, 1250, 800, 920000000, 1220, 40000, FALSE, FALSE, NULL, 1966, 1984),
('Dassault Mercure', 'Dassault', 'narrow_body', 34.0, 3.2, NULL, 2000, 1700, 1800, 870, 1200000000, 1200, 40000, FALSE, FALSE, NULL, 1966, 1979),
('Dassault Mercure Cargo', 'Dassault', 'cargo', 34.0, 3.2, 9000, 2000, 1700, 1850, 870, 1220000000, 1220, 40000, FALSE, FALSE, NULL, 1966, 1979),

-- 1967
('Boeing 737-100', 'Boeing', 'narrow_body', 28.9, 3.45, NULL, 1800, 2500, 1700, 870, 1200000000, 1200, 40000, FALSE, FALSE, NULL, 1967, 1983),
('Boeing 737-100 Cargo', 'Boeing', 'cargo', 28.9, 3.45, 9000, 1800, 2500, 1750, 870, 1220000000, 1220, 40000, FALSE, FALSE, NULL, 1967, 1983),
('McDonnell Douglas DC-8-62', 'McDonnell Douglas', 'wide_body', 45.9, 3.5, NULL, 2500, 9000, 3500, 900, 2000000000, 2500, 90000, FALSE, FALSE, NULL, 1967, 1989),
('McDonnell Douglas DC-8-62 Cargo', 'McDonnell Douglas', 'cargo', 45.9, 3.5, 20000, 2500, 9000, 3600, 900, 2020000000, 2520, 90000, FALSE, FALSE, NULL, 1967, 1989),

-- 1968
('Boeing 737-200', 'Boeing', 'narrow_body', 28.9, 3.45, NULL, 1800, 2500, 1700, 870, 1300000000, 1200, 40000, FALSE, FALSE, NULL, 1968, 2008),
('Boeing 737-200 Cargo', 'Boeing', 'cargo', 28.9, 3.45, 9000, 1800, 2500, 1750, 870, 1320000000, 1220, 40000, FALSE, FALSE, NULL, 1968, 2008),
('Fokker F28 Fellowship 1000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 950000000, 1200, 40000, FALSE, FALSE, NULL, 1968, 1987),
('Fokker F28 Fellowship 1000C', 'Fokker', 'cargo', 27.4, 3.0, 3500, 1500, 1800, 1250, 800, 970000000, 1220, 40000, FALSE, FALSE, NULL, 1968, 1987),


-- Aerei commerciali entrati in servizio nel 1969
('Boeing 747-100', 'Boeing', 'wide_body', 70.6, 6.1, NULL, 3000, 9800, 12000, 917, 35000000000, 15000, 140000, FALSE, FALSE, NULL, 1969, 1986),
('Boeing 747-100 Cargo', 'Boeing', 'cargo', 70.6, 6.1, 100000, 3000, 9800, 12500, 917, 35200000000, 15200, 140000, FALSE, FALSE, NULL, 1969, 1986),
('Tupolev Tu-154', 'Tupolev', 'narrow_body', 47.9, 3.8, NULL, 2200, 5200, 3500, 900, 1800000000, 2500, 90000, FALSE, FALSE, NULL, 1969, 2013),
('Tupolev Tu-154 Cargo', 'Tupolev', 'cargo', 47.9, 3.8, 20000, 2200, 5200, 3600, 900, 1820000000, 2520, 90000, FALSE, FALSE, NULL, 1969, 2013),
-- Aerei commerciali entrati in servizio nel 1970
('Lockheed L-1011 TriStar', 'Lockheed', 'wide_body', 50.1, 5.8, NULL, 3000, 9700, 11000, 900, 32000000000, 14000, 140000, FALSE, FALSE, NULL, 1970, 1984),
('Lockheed L-1011 TriStar Cargo', 'Lockheed', 'cargo', 50.1, 5.8, 90000, 3000, 9700, 11500, 900, 32200000000, 14200, 140000, FALSE, FALSE, NULL, 1970, 1984),
('McDonnell Douglas DC-10', 'McDonnell Douglas', 'wide_body', 55.5, 6.0, NULL, 3000, 9700, 12000, 900, 34000000000, 15000, 140000, FALSE, FALSE, NULL, 1970, 1989),
('McDonnell Douglas DC-10 Cargo', 'McDonnell Douglas', 'cargo', 55.5, 6.0, 100000, 3000, 9700, 12500, 900, 34200000000, 15200, 140000, FALSE, FALSE, NULL, 1970, 1989),
-- Aerei commerciali entrati in servizio nel 1971
('Airbus A300B1', 'Airbus', 'wide_body', 54.1, 5.6, NULL, 2500, 7500, 9000, 900, 28000000000, 12000, 120000, FALSE, FALSE, NULL, 1971, 1974),
('Airbus A300B1 Cargo', 'Airbus', 'cargo', 54.1, 5.6, 70000, 2500, 7500, 9500, 900, 28200000000, 12200, 120000, FALSE, FALSE, NULL, 1971, 1974),
('Fokker F28 Fellowship 2000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 980000000, 1200, 40000, FALSE, FALSE, NULL, 1971, 1987),
-- Aerei commerciali entrati in servizio nel 1972
('Airbus A300B2', 'Airbus', 'wide_body', 54.1, 5.6, NULL, 2500, 7500, 9000, 900, 29000000000, 12000, 120000, FALSE, FALSE, NULL, 1972, 1984),
('Airbus A300B2 Cargo', 'Airbus', 'cargo', 54.1, 5.6, 70000, 2500, 7500, 9500, 900, 29200000000, 12200, 120000, FALSE, FALSE, NULL, 1972, 1984),
('Boeing 727-200', 'Boeing', 'narrow_body', 46.7, 3.54, NULL, 2200, 4000, 2200, 870, 1900000000, 1800, 70000, FALSE, FALSE, NULL, 1972, 1984),
('Boeing 727-200 Cargo', 'Boeing', 'cargo', 46.7, 3.54, 15000, 2200, 4000, 2300, 870, 1920000000, 1820, 70000, FALSE, FALSE, NULL, 1972, 1984),
-- Aerei commerciali entrati in servizio nel 1973
('Airbus A300B4', 'Airbus', 'wide_body', 54.1, 5.6, NULL, 2500, 7500, 9000, 900, 30000000000, 12000, 120000, FALSE, FALSE, NULL, 1973, 1984),
('Airbus A300B4 Cargo', 'Airbus', 'cargo', 54.1, 5.6, 70000, 2500, 7500, 9500, 900, 30200000000, 12200, 120000, FALSE, FALSE, NULL, 1973, 1984),
('Fokker F28 Fellowship 3000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 1000000000, 1200, 40000, FALSE, FALSE, NULL, 1973, 1987),
('Fokker F28 Fellowship 3000C', 'Fokker', 'cargo', 27.4, 3.0, 3500, 1500, 1800, 1250, 800, 1010000000, 1220, 40000, FALSE, FALSE, NULL, 1973, 1987),
-- Aerei commerciali entrati in servizio nel 1974
('Airbus A300B4-200', 'Airbus', 'wide_body', 54.1, 5.6, NULL, 2500, 7500, 9000, 900, 31000000000, 12000, 120000, FALSE, FALSE, NULL, 1974, 1984),
('Airbus A300B4-200 Cargo', 'Airbus', 'cargo', 54.1, 5.6, 70000, 2500, 7500, 9500, 900, 31200000000, 12200, 120000, FALSE, FALSE, NULL, 1974, 1984),
('Fokker F28 Fellowship 4000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 1020000000, 1200, 40000, FALSE, FALSE, NULL, 1974, 1987),
-- Aerei commerciali entrati in servizio nel 1975
('Boeing 747SP', 'Boeing', 'wide_body', 56.3, 6.1, NULL, 3000, 12000, 11000, 917, 37000000000, 15000, 140000, FALSE, FALSE, NULL, 1975, 1989),
('Boeing 747SP Cargo', 'Boeing', 'cargo', 56.3, 6.1, 90000, 3000, 12000, 11500, 917, 37200000000, 15200, 140000, FALSE, FALSE, NULL, 1975, 1989),-- Aerei commerciali entrati in servizio nel 1976
('Boeing 747-200', 'Boeing', 'wide_body', 70.6, 6.1, NULL, 3000, 12800, 12000, 917, 38000000000, 15000, 140000, FALSE, FALSE, NULL, 1976, 1991),
('Boeing 747-200 Cargo', 'Boeing', 'cargo', 70.6, 6.1, 110000, 3000, 12800, 12500, 917, 38200000000, 15200, 140000, FALSE, FALSE, NULL, 1976, 1991),-- Aerei commerciali entrati in servizio nel 1977
('Boeing 737-300', 'Boeing', 'narrow_body', 33.4, 3.54, NULL, 1800, 4200, 2000, 870, 1400000000, 1200, 40000, FALSE, FALSE, NULL, 1977, 1999),
('Boeing 737-300 Cargo', 'Boeing', 'cargo', 33.4, 3.54, 12000, 1800, 4200, 2100, 870, 1420000000, 1220, 40000, FALSE, FALSE, NULL, 1977, 1999),
-- Aerei commerciali entrati in servizio nel 1978
('Boeing 737-400', 'Boeing', 'narrow_body', 36.4, 3.54, NULL, 1800, 4200, 2000, 870, 1500000000, 1200, 40000, FALSE, FALSE, NULL, 1978, 2000),
-- Aerei commerciali entrati in servizio nel 1979
('McDonnell Douglas MD-80', 'McDonnell Douglas', 'narrow_body', 45.1, 3.4, NULL, 1800, 4100, 2000, 870, 1600000000, 1200, 40000, FALSE, FALSE, NULL, 1979, 1999),
('McDonnell Douglas MD-80F', 'McDonnell Douglas', 'cargo', 45.1, 3.4, 12000, 1800, 4100, 2100, 870, 1620000000, 1220, 40000, FALSE, FALSE, NULL, 1979, 1999),
('Boeing 757-200', 'Boeing', 'narrow_body', 47.3, 3.54, NULL, 2400, 7222, 3200, 850, 8500000000, 3800, 120000, FALSE, FALSE, NULL, 1979, 2004),
('Boeing 757-200F', 'Boeing', 'cargo', 47.3, 3.54, 20000, 2400, 7222, 3300, 850, 8520000000, 3820, 120000, FALSE, FALSE, NULL, 1979, 2004),
-- Aerei commerciali entrati in servizio nel 1980
('Airbus A310', 'Airbus', 'wide_body', 46.7, 5.4, NULL, 2500, 8000, 9000, 900, 22000000000, 12000, 120000, FALSE, FALSE, NULL, 1980, 1998),
('Airbus A310 Cargo', 'Airbus', 'cargo', 46.7, 5.4, 70000, 2500, 8000, 9500, 900, 22200000000, 12200, 120000, FALSE, FALSE, NULL, 1980, 1998),
('Boeing 767-200', 'Boeing', 'wide_body', 48.5, 4.7, NULL, 2500, 9700, 11000, 900, 24000000000, 14000, 140000, FALSE, FALSE, NULL, 1980, 2008),
('Boeing 767-200 Cargo', 'Boeing', 'cargo', 48.5, 4.7, 90000, 2500, 9700, 11500, 900, 24200000000, 14200, 140000, FALSE, FALSE, NULL, 1980, 2008),
-- Aerei commerciali entrati in servizio nel 1981
('Boeing 767-300', 'Boeing', 'wide_body', 54.9, 4.72, NULL, 2400, 11093, 6800, 851, 20070000000, 7200, 140000, FALSE, FALSE, NULL, 1981, NULL),
('Boeing 767-300 Cargo', 'Boeing', 'cargo', 54.9, 4.72, 90000, 2400, 11093, 7000, 851, 20270000000, 7400, 140000, FALSE, FALSE, NULL, 1981, NULL),
-- Aerei commerciali entrati in servizio nel 1982
('Airbus A310-300', 'Airbus', 'wide_body', 46.7, 5.4, NULL, 2500, 8000, 9000, 900, 23000000000, 12000, 120000, FALSE, FALSE, NULL, 1982, 1998),
('Airbus A310-300 Cargo', 'Airbus', 'cargo', 46.7, 5.4, 70000, 2500, 8000, 9500, 900, 23200000000, 12200, 120000, FALSE, FALSE, NULL, 1982, 1998),
('Boeing 757-300', 'Boeing', 'narrow_body', 54.5, 3.54, NULL, 2400, 7222, 3200, 850, 9500000000, 3800, 120000, FALSE, FALSE, NULL, 1982, 2004),
('Boeing 757-300 Cargo', 'Boeing', 'cargo', 54.5, 3.54, 22000, 2400, 7222, 3300, 850, 9520000000, 3820, 120000, FALSE, FALSE, NULL, 1982, 2004),
-- Aerei commerciali entrati in servizio nel 1983
('Airbus A310-200', 'Airbus', 'wide_body', 46.7, 5.4, NULL, 2500, 8000, 9000, 900, 24000000000, 12000, 120000, FALSE, FALSE, NULL, 1983, 1998),
('Airbus A310-200 Cargo', 'Airbus', 'cargo', 46.7, 5.4, 70000, 2500, 8000, 9500, 900, 24200000000, 12200, 120000, FALSE, FALSE, NULL, 1983, 1998),
('Boeing 757-100', 'Boeing', 'narrow_body', 47.3, 3.54, NULL, 2400, 7222, 3200, 850, 8500000000, 3800, 120000, FALSE, FALSE, NULL, 1983, 2004),
('Boeing 757-100 Cargo', 'Boeing', 'cargo', 47.3, 3.54, 20000, 2400, 7222, 3300, 850, 8520000000, 3820, 120000, FALSE, FALSE, NULL, 1983, 2004),
-- Aerei commerciali entrati in servizio nel 1984
('Airbus A310-200C', 'Airbus', 'wide_body', 46.7, 5.4, NULL, 2500, 8000, 9000, 900, 25000000000, 12000, 120000, FALSE, FALSE, NULL, 1984, 1998),
('Airbus A310-200C Cargo', 'Airbus', 'cargo', 46.7, 5.4, 70000, 2500, 8000, 9500, 900, 25200000000, 12200, 120000, FALSE, FALSE, NULL, 1984, 1998),
('Boeing 737-500', 'Boeing', 'narrow_body', 31.0, 3.54, NULL, 1800, 4200, 2000, 870, 1600000000, 1200, 40000, FALSE, FALSE, NULL, 1984, 2006),
-- Aerei commerciali entrati in servizio nel 1985
('Airbus A310-200F', 'Airbus', 'cargo', 46.7, 5.4, 70000, 2500, 8000, 9500, 900, 26000000000, 12200, 120000, FALSE, FALSE, NULL, 1985, 1998),
('Tupolev Tu-204', 'Tupolev', 'narrow_body', 46.1, 3.57, NULL, 2200, 4300, 2100, 850, 1800000000, 1200, 40000, FALSE, FALSE, NULL, 1985, NULL),
('Tupolev Tu-204 Cargo', 'Tupolev', 'cargo', 46.1, 3.57, 15000, 2200, 4300, 2200, 850, 1820000000, 1220, 40000, FALSE, FALSE, NULL, 1985, NULL),
-- Aerei commerciali entrati in servizio nel 1986
('Airbus A320-100', 'Airbus', 'narrow_body', 36.0, 3.7, NULL, 2100, 6100, 2400, 903, 12000000000, 3000, 150000, FALSE, FALSE, NULL, 1986, 1994),
('Tupolev Tu-154M', 'Tupolev', 'narrow_body', 47.9, 3.8, NULL, 2200, 5200, 3500, 900, 1900000000, 2500, 90000, FALSE, FALSE, NULL, 1986, 2013),
('Tupolev Tu-154M Cargo', 'Tupolev', 'cargo', 47.9, 3.8, 20000, 2200, 5200, 3600, 900, 1920000000, 2520, 90000, FALSE, FALSE, NULL, 1986, 2013),
-- Aerei commerciali entrati in servizio nel 1987
('Airbus A320-200', 'Airbus', 'narrow_body', 37.6, 3.7, NULL, 2100, 6100, 2400, 903, 13000000000, 3000, 150000, FALSE, FALSE, NULL, 1987, NULL),
('Boeing 737-400SF', 'Boeing', 'cargo', 36.4, 3.54, 12000, 1800, 4200, 2100, 870, 1820000000, 1220, 40000, FALSE, FALSE, NULL, 1987, 2000),
('Tupolev Tu-204-100', 'Tupolev', 'narrow_body', 46.1, 3.57, NULL, 2200, 4300, 2100, 850, 1900000000, 1200, 40000, FALSE, FALSE, NULL, 1987, NULL),
('Tupolev Tu-204-100 Cargo', 'Tupolev', 'cargo', 46.1, 3.57, 15000, 2200, 4300, 2200, 850, 1920000000, 1220, 40000, FALSE, FALSE, NULL, 1987, NULL),

-- Aerei commerciali entrati in servizio nel 1988
('Boeing 767-300ER', 'Boeing', 'wide_body', 54.9, 4.72, NULL, 2400, 11093, 6800, 851, 20070000000, 7200, 140000, FALSE, FALSE, NULL, 1988, NULL),
('Fokker 100', 'Fokker', 'narrow_body', 35.53, 3.3, NULL, 2100, 4200, 2100, 845, 1200000000, 1100, 35000, FALSE, FALSE, NULL, 1988, 1997),
('Antonov An-225', 'Antonov', 'cargo', 84.0, 6.4, 250000, 6400, 15400, 8000, 850, 3200000000, 8000, 100000, FALSE, TRUE, NULL, 1988, 2020),
-- Aerei commerciali entrati in servizio nel 1989
('Bombardier CRJ100', 'Bombardier', 'regional', 26.77, 2.5, NULL, 1200, 2800, 1200, 785, 900000000, 800, 20000, FALSE, FALSE, NULL, 1989, 1999),
('Boeing 747-400', 'Boeing', 'wide_body', 70.7, 6.1, NULL, 4200, 13400, 6000, 920, 22000000000, 6000, 180000, FALSE, FALSE, NULL, 1989, 2009),
('Boeing 747-400F', 'Boeing', 'cargo', 70.7, 6.1, 120000, 4200, 13400, 6100, 920, 22200000000, 6020, 180000, FALSE, FALSE, NULL, 1989, 2009),
-- Aerei commerciali entrati in servizio nel 1990
('Embraer EMB 120 Brasilia', 'Embraer', 'regional', 20.0, 2.7, NULL, 800, 1600, 800, 580, 600000000, 400, 10000, FALSE, FALSE, NULL, 1990, 2001),
('Embraer EMB 120 Cargo', 'Embraer', 'cargo', 20.0, 2.7, 2500, 800, 1600, 900, 580, 620000000, 420, 10000, FALSE, FALSE, NULL, 1990, 2001),
('Airbus A321-100', 'Airbus', 'narrow_body', 44.5, 3.7, NULL, 2100, 5900, 2400, 903, 15000000000, 3200, 150000, FALSE, FALSE, NULL, 1990, 1995),
-- Aerei commerciali entrati in servizio nel 1991
('Bombardier Dash 8 Q400', 'Bombardier', 'regional', 32.8, 2.7, NULL, 1200, 2500, 1200, 667, 1200000000, 900, 25000, FALSE, FALSE, NULL, 1991, NULL),
('McDonnell Douglas MD-11', 'McDonnell Douglas', 'wide_body', 61.2, 6.6, NULL, 3500, 12000, 5000, 913, 18000000000, 5000, 160000, FALSE, FALSE, NULL, 1991, 2001),
('MD-11F', 'McDonnell Douglas', 'cargo', 61.2, 6.6, 95000, 3500, 12000, 5100, 913, 18200000000, 5020, 160000, FALSE, FALSE, NULL, 1991, 2001),
-- Aerei commerciali entrati in servizio nel 1992
('Airbus A330-300', 'Airbus', 'wide_body', 63.7, 5.64, NULL, 3500, 10800, 5000, 871, 18000000000, 5000, 160000, FALSE, FALSE, NULL, 1992, NULL),
('Boeing 737-500', 'Boeing', 'narrow_body', 31.0, 3.54, NULL, 1500, 4200, 2100, 870, 1200000000, 1220, 40000, FALSE, FALSE, NULL, 1992, 1999),
-- Aerei commerciali entrati in servizio nel 1993
('Bombardier CRJ200', 'Bombardier', 'regional', 26.77, 2.5, NULL, 1200, 2800, 1200, 785, 950000000, 800, 20000, FALSE, FALSE, NULL, 1993, 2006),
('Boeing 777-200', 'Boeing', 'wide_body', 63.7, 6.2, NULL, 3700, 9700, 5000, 905, 20000000000, 5000, 160000, FALSE, FALSE, NULL, 1993, NULL),
('Boeing 777-200F', 'Boeing', 'cargo', 63.7, 6.2, 100000, 3700, 9700, 5100, 905, 20200000000, 5020, 160000, FALSE, FALSE, NULL, 1993, NULL),
-- Aerei commerciali entrati in servizio nel 1994
('Embraer ERJ 145', 'Embraer', 'regional', 29.87, 2.1, NULL, 1200, 2800, 1200, 833, 1000000000, 800, 20000, FALSE, FALSE, NULL, 1994, NULL),
('Airbus A340-300', 'Airbus', 'wide_body', 63.6, 5.64, NULL, 3500, 10800, 5000, 871, 20000000000, 5000, 160000, FALSE, FALSE, NULL, 1994, NULL),
-- Aerei commerciali entrati in servizio nel 1995
('Boeing 737-700', 'Boeing', 'narrow_body', 33.6, 3.54, NULL, 1500, 4200, 2100, 870, 1300000000, 1220, 40000, FALSE, FALSE, NULL, 1995, NULL),
('Boeing 737-700 Cargo', 'Boeing', 'cargo', 33.6, 3.54, 9000, 1500, 4200, 2200, 870, 1320000000, 1240, 40000, FALSE, FALSE, NULL, 1995, NULL),
('Airbus A321-200', 'Airbus', 'narrow_body', 44.5, 3.7, NULL, 2100, 5900, 2400, 903, 16000000000, 3200, 150000, FALSE, FALSE, NULL, 1995, NULL),
-- Aerei commerciali entrati in servizio nel 1996
('Boeing 737-800', 'Boeing', 'narrow_body', 39.5, 3.54, NULL, 1500, 4200, 2100, 870, 1400000000, 1220, 40000, FALSE, FALSE, NULL, 1996, NULL),
('Boeing 737-800 Cargo', 'Boeing', 'cargo', 39.5, 3.54, 12000, 1500, 4200, 2200, 870, 1420000000, 1240, 40000, FALSE, FALSE, NULL, 1996, NULL),
('Bombardier CRJ700', 'Bombardier', 'regional', 32.51, 2.5, NULL, 1200, 2800, 1200, 828, 1100000000, 800, 20000, FALSE, FALSE, NULL, 1996, NULL),
-- Aerei commerciali entrati in servizio nel 1997
('Boeing 777-200ER', 'Boeing', 'wide_body', 63.7, 5.86, NULL, 3000, 14305, 9500, 892, 30660000000, 9500, 180000, FALSE, FALSE, NULL, 1997, NULL),
('Boeing 737-900', 'Boeing', 'narrow_body', 42.1, 3.54, NULL, 1500, 4200, 2100, 870, 1500000000, 1220, 40000, FALSE, FALSE, NULL, 1997, NULL),
('Boeing 737-900 Cargo', 'Boeing', 'cargo', 42.1, 3.54, 12000, 1500, 4200, 2200, 870, 1520000000, 1240, 40000, FALSE, FALSE, NULL, 1997, NULL),
('Embraer ERJ 135', 'Embraer', 'regional', 26.33, 2.1, NULL, 1200, 2800, 1200, 833, 900000000, 800, 20000, FALSE, FALSE, NULL, 1997, NULL),
-- Aerei commerciali entrati in servizio nel 1998
('Bombardier CRJ900', 'Bombardier', 'regional', 36.2, 2.5, NULL, 1200, 2800, 1200, 828, 1200000000, 800, 20000, FALSE, FALSE, NULL, 1998, NULL),
('Airbus A340-600', 'Airbus', 'wide_body', 75.3, 5.64, NULL, 3500, 10800, 5000, 913, 22000000000, 5000, 160000, FALSE, FALSE, NULL, 1998, NULL),
-- Aerei commerciali entrati in servizio nel 1999 
('Bombardier CRJ1000', 'Bombardier', 'regional', 39.1, 2.5, NULL, 1200, 2800, 1200, 828, 1300000000, 800, 20000, FALSE, FALSE, NULL, 1999, NULL), 
('Boeing 717', 'Boeing', 'narrow_body', 37.8, 3.34, NULL, 1500, 4200, 2100, 811, 1200000000, 1220, 40000, FALSE, FALSE, NULL, 1999, 2006),
-- Aerei commerciali entrati in servizio nel 2000 
('Embraer ERJ 140', 'Embraer', 'regional', 28.45, 2.1, NULL, 1200, 2800, 1200, 833, 950000000, 800, 20000, FALSE, FALSE, NULL, 2000, NULL), 
('Boeing 767-400ER', 'Boeing', 'wide_body', 61.4, 5.03, NULL, 2400, 10400, 7000, 851, 22000000000, 7200, 140000, FALSE, FALSE, NULL, 2000, 2014), 
('Boeing 767-400ER Cargo', 'Boeing', 'cargo', 61.4, 5.03, 70000, 2400, 10400, 7100, 851, 22200000000, 7220, 140000, FALSE, FALSE, NULL, 2000, 2014), 
-- Aerei commerciali entrati in servizio nel 2001 
('Embraer E170', 'Embraer', 'regional', 29.9, 2.74, NULL, 1600, 3334, 850, 870, 1500000000, 1800, 80000, FALSE, FALSE, NULL, 2001, NULL), 
-- Aerei commerciali entrati in servizio nel 2002 
('Embraer E175', 'Embraer', 'regional', 29.9, 3.28, NULL, 1600, 3334, 850, 870, 5100000000, 1800, 80000, FALSE, TRUE, 500000000, 2002, NULL),
  ('Bombardier Q400', 'Bombardier', 'regional', 32.8, 2.7, NULL, 1200, 2500, 1200, 667, 1300000000, 900, 25000, FALSE, FALSE, NULL, 2002, NULL), 
  -- Aerei commerciali entrati in servizio nel 2003 
  ('Embraer E190', 'Embraer', 'regional', 36.2, 2.74, NULL, 1600, 4260, 950, 870, 1700000000, 1800, 80000, FALSE, FALSE, NULL, 2003, NULL), 
  -- Aerei commerciali entrati in servizio nel 2004 
  ('Embraer E195', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 1800000000, 1800, 80000, FALSE, FALSE, NULL, 2004, NULL), 
  -- Aerei commerciali entrati in servizio nel 2005
   ('Embraer E195LR', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 1850000000, 1800, 80000, FALSE, FALSE, NULL, 2005, NULL), 
   -- Aerei commerciali entrati in servizio nel 2006
    ('Embraer E190LR', 'Embraer', 'regional', 36.2, 2.74, NULL, 1600, 4260, 950, 870, 1750000000, 1800, 80000, FALSE, FALSE, NULL, 2006, NULL),
     ('Bombardier CRJ1000', 'Bombardier', 'regional', 39.1, 2.5, NULL, 1200, 2800, 1200, 828, 1400000000, 800, 20000, FALSE, FALSE, NULL, 2006, NULL), 
      -- Aerei commerciali entrati in servizio nel 2007
      ('Airbus A380-800', 'Airbus', 'wide_body', 73.0, 6.58, NULL, 3000, 15200, 12000, 903, 44560000000, 15000, 140000, FALSE, FALSE, NULL, 2007, 2021), 
      ('Embraer E195', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 1900000000, 1800, 80000, FALSE, FALSE, NULL, 2007, NULL), 
       
-- Aerei commerciali entrati in servizio nel 2009
-- Aerei commerciali entrati in servizio nel 2010
('ATR 72-600', 'ATR', 'regional', 20.5, 2.57, NULL, 1100, 1665, 450, 510, 2600000000, 1200, 60000, TRUE, FALSE, NULL, 2010, NULL),
('Airbus A330-200F', 'Airbus', 'cargo', 58.8, 5.28, 70000, 2500, 7400, 8200, 871, 24170000000, 9000, 160000, FALSE, FALSE, NULL, 2010, NULL);
('Boeing 787-8', 'Boeing', 'wide_body', 56.7, 5.77, NULL, 2800, 14140, 6800, 903, 24830000000, 7500, 160000, FALSE, FALSE, NULL, 2011, NULL),
-- Aerei commerciali entrati in servizio nel 2012
('Boeing 747-8', 'Boeing', 'wide_body', 76.3, 6.10, NULL, 3000, 14815, 11000, 917, 41840000000, 12000, 160000, FALSE, FALSE, NULL, 2012, 2022),
('Boeing 747-8F', 'Boeing', 'cargo', 76.3, 6.10, 137000, 3000, 8130, 11500, 917, 41920000000, 13000, 160000, FALSE, FALSE, NULL, 2012, 2022),
('Embraer E175E2', 'Embraer', 'regional', 31.7, 2.74, NULL, 1600, 3334, 850, 870, 1700000000, 1800, 80000, FALSE, FALSE, NULL, 2012, NULL),
      ('Boeing 787-9', 'Boeing', 'wide_body', 62.8, 5.77, NULL, 2800, 14140, 7000, 913, 27000000000, 7600, 160000, FALSE, FALSE, NULL, 2014, NULL),
      ('Boeing 787-10', 'Boeing', 'wide_body', 68.3, 5.77, NULL, 3000, 11910, 7200, 913, 29000000000, 7800, 160000, FALSE, FALSE, NULL, 2017, NULL),
      ('Boeing 777-300ER', 'Boeing', 'wide_body', 73.9, 6.2, NULL, 3200, 13650, 7500, 905, 32000000000, 8000, 180000, FALSE, FALSE, NULL, 2004, NULL),
      ('Airbus A319', 'Airbus', 'narrow_body', 33.8, 3.7, NULL, 1800, 6900, 2100, 828, 9000000000, 2500, 120000, FALSE, FALSE, NULL, 1996, NULL),
      ('Airbus A318', 'Airbus', 'narrow_body', 31.4, 3.7, NULL, 1800, 5750, 2000, 828, 8000000000, 2400, 120000, FALSE, FALSE, NULL, 2003, NULL),
      ('ATR 42-500', 'ATR', 'regional', 18.6, 2.57, NULL, 1000, 1500, 400, 556, 1800000000, 900, 60000, TRUE, FALSE, NULL, 1995, NULL),
      ('Antonov An-124 Ruslan', 'Antonov', 'cargo', 68.96, 6.4, 120000, 3000, 4800, 5000, 850, 1500000000, 2000, 100000, FALSE, TRUE, NULL, 1986, NULL),
('Boeing 767-300F', 'Boeing', 'cargo', 54.9, 4.72, 58000, 2400, 11093, 7000, 851, 21000000000, 7400, 140000, FALSE, FALSE, NULL, 1995, NULL),
('Saab 340B', 'Saab', 'regional', 19.7, 2.3, NULL, 1200, 1700, 400, 467, 700000000, 300, 20000, TRUE, FALSE, NULL, 1989, 2005),
('Embraer E190-E2 Cargo', 'Embraer', 'cargo', 36.2, 2.74, 12000, 1600, 4260, 1000, 870, 2200000000, 1900, 80000, FALSE, FALSE, NULL, 2018, NULL),
('Airbus Beluga XL', 'Airbus', 'cargo', 63.1, 7.1, 53000, 2200, 4300, 1200, 780, 25000000000, 1200, 80000, FALSE, FALSE, NULL, 2019, NULL),
      -- Ulteriori modelli rilevanti aggiunti
      ('Boeing 747-8 Intercontinental', 'Boeing', 'wide_body', 76.3, 6.10, NULL, 3000, 14815, 11000, 917, 41840000000, 12000, 160000, FALSE, FALSE, NULL, 2012, 2022),
      ('Airbus A340-200', 'Airbus', 'wide_body', 59.4, 5.64, NULL, 3000, 12500, 5000, 871, 18000000000, 5000, 160000, FALSE, FALSE, NULL, 1993, 2008),
      ('Airbus A340-500', 'Airbus', 'wide_body', 67.9, 5.64, NULL, 3000, 16020, 5200, 913, 22000000000, 5200, 160000, FALSE, FALSE, NULL, 2002, 2011),
      ('Boeing 767-400ER', 'Boeing', 'wide_body', 61.4, 5.03, NULL, 2400, 10400, 7100, 851, 22000000000, 7200, 140000, FALSE, FALSE, NULL, 2000, 2014),
      ('McDonnell Douglas DC-10-30', 'McDonnell Douglas', 'wide_body', 55.5, 6.0, NULL, 3000, 10200, 12000, 900, 34000000000, 15000, 140000, FALSE, FALSE, NULL, 1972, 1988),
      ('McDonnell Douglas DC-10-40', 'McDonnell Douglas', 'wide_body', 55.5, 6.0, NULL, 3000, 10400, 12000, 900, 35000000000, 15000, 140000, FALSE, FALSE, NULL, 1979, 1989),
      ('Boeing 737-600', 'Boeing', 'narrow_body', 31.2, 3.54, NULL, 1800, 5600, 2000, 828, 9000000000, 2500, 120000, FALSE, FALSE, NULL, 1998, 2006),
      ('Dash 8-100', 'De Havilland Canada', 'regional', 22.3, 2.5, NULL, 1000, 1500, 400, 500, 800000000, 300, 20000, TRUE, FALSE, NULL, 1984, 2005),
      ('Dash 8-300', 'De Havilland Canada', 'regional', 25.7, 2.5, NULL, 1100, 1800, 500, 530, 1000000000, 400, 25000, TRUE, FALSE, NULL, 1989, 2009),
      ('Dornier 328', 'Dornier', 'regional', 21.1, 2.2, NULL, 1100, 1800, 400, 620, 900000000, 300, 20000, TRUE, FALSE, NULL, 1993, 2002),
      ('Fokker 50', 'Fokker', 'regional', 15.3, 2.7, NULL, 1200, 1700, 400, 500, 700000000, 300, 20000, TRUE, FALSE, NULL, 1987, 1997),
      ('EMB 110 Bandeirante', 'Embraer', 'regional', 12.7, 2.1, NULL, 800, 1500, 300, 350, 300000000, 100, 10000, TRUE, FALSE, NULL, 1973, 1990),
      ('Lockheed L-100 Hercules', 'Lockheed', 'cargo', 29.8, 3.1, 21000, 1200, 3800, 800, 600, 1200000000, 800, 20000, TRUE, FALSE, NULL, 1965, 1992),
      ('Boeing 747 Dreamlifter', 'Boeing', 'cargo', 71.7, 6.1, 113000, 3000, 7800, 12000, 917, 42000000000, 12000, 160000, FALSE, FALSE, NULL, 2007, NULL),
      ('Airbus Beluga', 'Airbus', 'cargo', 56.2, 7.1, 47000, 2200, 2500, 1200, 780, 20000000000, 1200, 80000, FALSE, FALSE, NULL, 1995, 2020),
      ('Douglas DC-2', 'Douglas', 'regional', 14.9, 2.2, NULL, 800, 1200, 200, 250, 40000000, 100, 12000, TRUE, FALSE, NULL, 1934, 1945),
      ('Douglas DC-5', 'Douglas', 'regional', 15.2, 2.2, NULL, 900, 1500, 250, 300, 50000000, 120, 13000, TRUE, FALSE, NULL, 1939, 1943),
      ('Douglas DC-8-63', 'Douglas', 'wide_body', 57.1, 3.5, NULL, 2500, 12000, 3500, 900, 2100000000, 2500, 90000, FALSE, FALSE, NULL, 1967, 1983),
      ('Lockheed L-188 Electra', 'Lockheed', 'regional', 29.2, 3.1, NULL, 1500, 3500, 800, 600, 900000000, 400, 20000, FALSE, FALSE, NULL, 1959, 1970),
      ('Convair 580', 'Convair', 'regional', 20.4, 2.7, NULL, 1200, 2100, 600, 480, 500000000, 200, 15000, TRUE, FALSE, NULL, 1960, 1992),
      ('Vickers Vanguard', 'Vickers', 'regional', 30.6, 3.2, NULL, 1600, 3200, 900, 370, 90000000, 300, 20000, FALSE, FALSE, NULL, 1959, 1978),
      ('Mitsubishi SpaceJet M90', 'Mitsubishi', 'regional', 35.8, 2.8, NULL, 1500, 3400, 900, 830, 1200000000, 1200, 60000, FALSE, FALSE, NULL, 2020, NULL),
-- Aerei commerciali entrati in servizio nel 2013
-- Aerei commerciali entrati in servizio nel 2015
('Airbus A350-900', 'Airbus', 'wide_body', 66.8, 5.96, NULL, 2600, 15000, 7200, 903, 31740000000, 8200, 160000, FALSE, FALSE, NULL, 2015, NULL),
('Embraer E190-E2', 'Embraer', 'regional', 36.2, 2.74, NULL, 1600, 4260, 950, 870, 2100000000, 1800, 80000, FALSE, FALSE, NULL, 2015, NULL),
-- 2016
('Airbus A220-100', 'Airbus', 'narrow_body', 31.8, 3.28, NULL, 1600, 5741, 2000, 870, 8950000000, 2500, 120000, FALSE, FALSE, NULL, 2016, NULL),
('Airbus A320neo', 'Airbus', 'narrow_body', 33.8, 3.70, NULL, 2100, 6500, 2400, 903, 11060000000, 3000, 150000, FALSE, FALSE, NULL, 2016, NULL),
-- Aerei commerciali entrati in servizio nel 2017
('Airbus A321neo', 'Airbus', 'narrow_body', 44.5, 3.70, NULL, 2300, 7400, 2800, 903, 12950000000, 3500, 150000, FALSE, FALSE, NULL, 2017, NULL),
('Airbus A320neo', 'Airbus', 'narrow_body', 37.6, 3.7, NULL, 2100, 6500, 2400, 903, 12000000000, 3000, 150000, FALSE, FALSE, NULL, 2017, NULL),
-- Aerei commerciali entrati in servizio nel 2018
('Embraer E195-E2', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 2300000000, 1800, 80000, FALSE, FALSE, NULL, 2018, NULL),
('Airbus A321neo', 'Airbus', 'narrow_body', 44.5, 3.7, NULL, 2300, 7400, 2800, 903, 13000000000, 3500, 150000, FALSE, FALSE, NULL, 2018, NULL),
-- Aerei commerciali entrati in servizio nel 2019
('Airbus A350-1000', 'Airbus', 'wide_body', 73.8, 6.5, NULL, 3000, 16000, 9000, 903, 32000000000, 9000, 160000, FALSE, FALSE, NULL, 2019, NULL),
-- Aerei commerciali entrati in servizio nel 2020
('Airbus A321XLR', 'Airbus', 'narrow_body', 44.5, 3.7, NULL, 2300, 8700, 2900, 903, 14000000000, 3500, 150000, FALSE, FALSE, NULL, 2020, NULL),
-- Aerei commerciali entrati in servizio nel 2021
('Airbus A220-300', 'Airbus', 'narrow_body', 38.7, 3.28, NULL, 1600, 6112, 2100, 870, 2400000000, 2500, 120000, FALSE, FALSE, NULL, 2021, NULL),

-- Aerei commerciali entrati in servizio nel 2022
('COMAC C919', 'COMAC', 'narrow_body', 38.9, 3.96, NULL, 1600, 5555, 2200, 870, 2500000000, 2600, 120000, FALSE, FALSE, NULL, 2022, NULL),
('Boeing 777-8F', 'Boeing', 'cargo', 70.9, 6.2, 118000, 3200, 14600, 4700, 890, 4200000000, 4800, 200000, FALSE, FALSE, NULL, 2030, NULL),

-- Aerei commerciali entrati in servizio nel 2023
('Irkut MC-21-310', 'Irkut', 'narrow_body', 42.2, 3.81, NULL, 1800, 6400, 2200, 870, 2600000000, 2700, 120000, FALSE, FALSE, NULL, 2023, NULL),

-- Aerei commerciali entrati in servizio nel 2025
('COMAC ARJ21-700', 'COMAC', 'regional', 33.5, 3.14, NULL, 1500, 3700, 1200, 830, 1200000000, 1200, 60000, FALSE, FALSE, NULL, 2025, NULL),

('Irkut MC-21-400', 'Irkut', 'narrow_body', 45.0, 3.81, NULL, 1800, 7000, 2300, 870, 2800000000, 2800, 120000, FALSE, FALSE, NULL, 2026, NULL),

-- Boeing 737 MAX family
('Boeing 737 MAX 7', 'Boeing', 'narrow_body', 35.6, 3.76, NULL, 1800, 6110, 2200, 852, 11000000000, 3100, 150000, FALSE, FALSE, NULL, 2026, NULL),
('Boeing 737 MAX 8', 'Boeing', 'narrow_body', 39.5, 3.76, NULL, 2100, 6570, 2300, 852, 12160000000, 3100, 150000, FALSE, FALSE, NULL, 2017, NULL),
('Boeing 737 MAX 9', 'Boeing', 'narrow_body', 42.2, 3.76, NULL, 2100, 6570, 2350, 852, 12500000000, 3150, 150000, FALSE, FALSE, NULL, 2018, NULL),
('Boeing 737 MAX 10', 'Boeing', 'narrow_body', 43.8, 3.76, NULL, 2200, 6110, 2400, 852, 13000000000, 3200, 150000, FALSE, FALSE, NULL, 2027, NULL),


-- Aerei commerciali entrati in servizio nel 2023
('COMAC C919', 'COMAC', 'narrow_body', 42.5, 3.81, NULL, 1800, 5555, 1800, 870, 1600000000, 2500, 100000, FALSE, FALSE, NULL, 2023, NULL),

-- Aerei commerciali entrati in servizio nel 2024
('Airbus A321XLR', 'Airbus', 'narrow_body', 44.5, 3.70, NULL, 244, 4700, 2200, 870, 1400000000, 2200, 100000, FALSE, FALSE, NULL, 2024, NULL),

-- Aerei commerciali entrati in servizio nel 2025
('Boeing 777-9', 'Boeing', 'wide_body', 77.0, 5.60, NULL, 426, 12800, 3500, 900, 4000000000, 3500, 150000, FALSE, FALSE, NULL, 2025, NULL),

-- Aerei commerciali entrati in servizio nel 2026 (plausibili, annunciati o in sviluppo avanzato)
('Boeing 777-8F', 'Boeing', 'wide_body', 77.0, 5.60, NULL, 0, 8000, 0, 900, 3500000000, 3500, 150000, FALSE, FALSE, NULL, 2026, NULL),
('Boeing 777-8', 'Boeing', 'wide_body', 77.0, 5.60, NULL, 395, 12800, 3500, 900, 4000000000, 3500, 150000, FALSE, FALSE, NULL, 2026, NULL);
