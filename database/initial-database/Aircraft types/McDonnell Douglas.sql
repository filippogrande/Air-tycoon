INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('McDonnell Douglas DC-8-62', 'McDonnell Douglas', 'wide_body', 45.9, 3.5, NULL, 2500, 9000, 3500, 900, 2000000000, 2500, 90000, FALSE, FALSE, NULL, 1967, 1989)
('McDonnell Douglas DC-8-62 Cargo', 'McDonnell Douglas', 'cargo', 45.9, 3.5, 20000, 2500, 9000, 3600, 900, 2020000000, 2520, 90000, FALSE, FALSE, NULL, 1967, 1989)
('McDonnell Douglas DC-10', 'McDonnell Douglas', 'wide_body', 55.5, 6.0, NULL, 3000, 9700, 12000, 900, 34000000000, 15000, 140000, FALSE, FALSE, NULL, 1970, 1989)
('McDonnell Douglas DC-10 Cargo', 'McDonnell Douglas', 'cargo', 55.5, 6.0, 100000, 3000, 9700, 12500, 900, 34200000000, 15200, 140000, FALSE, FALSE, NULL, 1970, 1989)
('McDonnell Douglas MD-80', 'McDonnell Douglas', 'narrow_body', 45.1, 3.4, NULL, 1800, 4100, 2000, 870, 1600000000, 1200, 40000, FALSE, FALSE, NULL, 1979, 1999)
('McDonnell Douglas MD-80F', 'McDonnell Douglas', 'cargo', 45.1, 3.4, 12000, 1800, 4100, 2100, 870, 1620000000, 1220, 40000, FALSE, FALSE, NULL, 1979, 1999)
('McDonnell Douglas MD-11', 'McDonnell Douglas', 'wide_body', 61.2, 6.6, NULL, 3500, 12000, 5000, 913, 18000000000, 5000, 160000, FALSE, FALSE, NULL, 1991, 2001)
('MD-11F', 'McDonnell Douglas', 'cargo', 61.2, 6.6, 95000, 3500, 12000, 5100, 913, 18200000000, 5020, 160000, FALSE, FALSE, NULL, 1991, 2001)
('McDonnell Douglas DC-10-30', 'McDonnell Douglas', 'wide_body', 55.5, 6.0, NULL, 3000, 10200, 12000, 900, 34000000000, 15000, 140000, FALSE, FALSE, NULL, 1972, 1988)
('McDonnell Douglas DC-10-40', 'McDonnell Douglas', 'wide_body', 55.5, 6.0, NULL, 3000, 10400, 12000, 900, 35000000000, 15000, 140000, FALSE, FALSE, NULL, 1979, 1989)
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