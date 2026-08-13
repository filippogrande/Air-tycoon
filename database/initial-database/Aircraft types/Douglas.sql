INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Douglas DC-3', 'Douglas', 'regional', 15.7, 2.2, NULL, 950, 2400, 350, 333, 120000000, 400, 30000, TRUE, FALSE, NULL, 1936, 1950)
('Douglas DC-3 Cargo', 'Douglas', 'cargo', 15.7, 2.2, 3.5, 950, 2400, 370, 333, 130000000, 420, 30000, TRUE, FALSE, NULL, 1936, 1950)
('Douglas DC-4', 'Douglas', 'wide_body', 27.6, 3.5, NULL, 1800, 6700, 1200, 450, 220000000, 900, 25000, FALSE, TRUE, 90000000, 1940, 1958)
('Douglas C-54 Skymaster Cargo', 'Douglas', 'cargo', 28.6, 3.5, 10.0, 1600, 6400, 1200, 450, 180000000, 900, 40000, FALSE, FALSE, NULL, 1942, 1950)
('Douglas C-47 Skytrain Cargo', 'Douglas', 'cargo', 15.7, 2.2, 3.5, 950, 2400, 370, 333, 130000000, 420, 30000, TRUE, FALSE, NULL, 1943, 1950)
('Douglas C-54E Skymaster Cargo', 'Douglas', 'cargo', 28.6, 3.5, 11.0, 1600, 6500, 1250, 450, 185000000, 950, 40000, FALSE, FALSE, NULL, 1944, 1950)
('Douglas DC-4 Cargo', 'Douglas', 'cargo', 21.3, 3.0, 8.0, 1600, 4200, 950, 370, 410000000, 820, 40000, FALSE, FALSE, NULL, 1946, 1955)
('Douglas DC-6', 'Douglas', 'narrow_body', 24.6, 3.0, NULL, 1600, 4000, 900, 507, 600000000, 900, 40000, FALSE, FALSE, NULL, 1947, 1958)
('Douglas DC-6 Cargo', 'Douglas', 'cargo', 24.6, 3.0, 12.0, 1600, 4000, 950, 507, 610000000, 920, 40000, FALSE, FALSE, NULL, 1947, 1958)
('Douglas DC-7', 'Douglas', 'narrow_body', 27.8, 3.5, NULL, 1700, 8000, 1200, 610, 800000000, 900, 40000, FALSE, FALSE, NULL, 1950, 1958)
('Douglas DC-7 Cargo', 'Douglas', 'cargo', 27.8, 3.5, 12.0, 1700, 8000, 1250, 610, 820000000, 920, 40000, FALSE, FALSE, NULL, 1950, 1958)
('Douglas DC-7C Seven Seas', 'Douglas', 'narrow_body', 32.2, 3.5, NULL, 1800, 9000, 1300, 610, 900000000, 950, 40000, FALSE, FALSE, NULL, 1955, 1960)
('Douglas DC-7C Seven Seas Cargo', 'Douglas', 'cargo', 32.2, 3.5, 13.0, 1800, 9000, 1350, 610, 920000000, 970, 40000, FALSE, FALSE, NULL, 1955, 1960)
('Douglas DC-9-10', 'Douglas', 'narrow_body', 28.0, 3.05, NULL, 1800, 2600, 1700, 870, 1100000000, 1200, 40000, FALSE, FALSE, NULL, 1965, 1982)
('Douglas DC-9-10 Cargo', 'Douglas', 'cargo', 28.0, 3.05, 9000, 1800, 2600, 1750, 870, 1120000000, 1220, 40000, FALSE, FALSE, NULL, 1965, 1982)
('Douglas DC-2', 'Douglas', 'regional', 14.9, 2.2, NULL, 800, 1200, 200, 250, 40000000, 100, 12000, TRUE, FALSE, NULL, 1934, 1945)
('Douglas DC-5', 'Douglas', 'regional', 15.2, 2.2, NULL, 900, 1500, 250, 300, 50000000, 120, 13000, TRUE, FALSE, NULL, 1939, 1943)
('Douglas DC-8-63', 'Douglas', 'wide_body', 57.1, 3.5, NULL, 2500, 12000, 3500, 900, 2100000000, 2500, 90000, FALSE, FALSE, NULL, 1967, 1983)
ON CONFLICT (name) DO UPDATE SET
    manufacturer = EXCLUDED.manufacturer,
    category = EXCLUDED.category,
    cabin_length_meters = EXCLUDED.cabin_length_meters,
    cabin_width_meters = EXCLUDED.cabin_width_meters,
    capacity = EXCLUDED.capacity,
    min_runway_length_meters = EXCLUDED.min_runway_length_meters,
    range_km = EXCLUDED.range_km,
    fuel_consumption = EXCLUDED.fuel_consumption,
    cruise_speed = EXCLUDED.cruise_speed,
    purchase_price = EXCLUDED.purchase_price,
    maintenance_cost_per_hour = EXCLUDED.maintenance_cost_per_hour,
    max_flight_hours = EXCLUDED.max_flight_hours,
    can_operate_campo_aviazione = EXCLUDED.can_operate_campo_aviazione,
    campo_aviazione_mod_available = EXCLUDED.campo_aviazione_mod_available,
    campo_aviazione_mod_cost = EXCLUDED.campo_aviazione_mod_cost,
    market_entry_year = EXCLUDED.market_entry_year,
    market_exit_year = EXCLUDED.market_exit_year,
    updated_at = CURRENT_TIMESTAMP;