INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Tupolev Tu-104', 'Tupolev', 'narrow_body', 36.9, 3.6, NULL, 2000, 2700, 1800, 900, 1100000000, 1200, 40000, FALSE, FALSE, NULL, 1956, 1979)
('Tupolev Tu-104 Cargo', 'Tupolev', 'cargo', 36.9, 3.6, 12.0, 2000, 2700, 1850, 900, 1120000000, 1220, 40000, FALSE, FALSE, NULL, 1956, 1979)
('Tupolev Tu-124', 'Tupolev', 'regional', 30.6, 2.9, NULL, 1800, 2100, 1200, 800, 900000000, 1200, 40000, FALSE, FALSE, NULL, 1962, 1979)
('Tupolev Tu-134', 'Tupolev', 'regional', 27.5, 2.9, NULL, 1600, 2000, 1200, 800, 900000000, 1200, 40000, FALSE, FALSE, NULL, 1966, 1984)
('Tupolev Tu-134 Cargo', 'Tupolev', 'cargo', 27.5, 2.9, 3500, 1600, 2000, 1250, 800, 920000000, 1220, 40000, FALSE, FALSE, NULL, 1966, 1984)
('Tupolev Tu-154', 'Tupolev', 'narrow_body', 47.9, 3.8, NULL, 2200, 5200, 3500, 900, 1800000000, 2500, 90000, FALSE, FALSE, NULL, 1969, 2013)
('Tupolev Tu-154 Cargo', 'Tupolev', 'cargo', 47.9, 3.8, 20000, 2200, 5200, 3600, 900, 1820000000, 2520, 90000, FALSE, FALSE, NULL, 1969, 2013)
('Tupolev Tu-204', 'Tupolev', 'narrow_body', 46.1, 3.57, NULL, 2200, 4300, 2100, 850, 1800000000, 1200, 40000, FALSE, FALSE, NULL, 1985, NULL)
('Tupolev Tu-204 Cargo', 'Tupolev', 'cargo', 46.1, 3.57, 15000, 2200, 4300, 2200, 850, 1820000000, 1220, 40000, FALSE, FALSE, NULL, 1985, NULL)
('Tupolev Tu-154M', 'Tupolev', 'narrow_body', 47.9, 3.8, NULL, 2200, 5200, 3500, 900, 1900000000, 2500, 90000, FALSE, FALSE, NULL, 1986, 2013)
('Tupolev Tu-154M Cargo', 'Tupolev', 'cargo', 47.9, 3.8, 20000, 2200, 5200, 3600, 900, 1920000000, 2520, 90000, FALSE, FALSE, NULL, 1986, 2013)
('Tupolev Tu-204-100', 'Tupolev', 'narrow_body', 46.1, 3.57, NULL, 2200, 4300, 2100, 850, 1900000000, 1200, 40000, FALSE, FALSE, NULL, 1987, NULL)
('Tupolev Tu-204-100 Cargo', 'Tupolev', 'cargo', 46.1, 3.57, 15000, 2200, 4300, 2200, 850, 1920000000, 1220, 40000, FALSE, FALSE, NULL, 1987, NULL)
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