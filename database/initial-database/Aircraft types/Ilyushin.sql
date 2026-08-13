INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Ilyushin Il-18', 'Ilyushin', 'narrow_body', 24.0, 3.2, NULL, 1800, 6500, 1200, 650, 800000000, 1200, 40000, FALSE, FALSE, NULL, 1960, 1985)
('Ilyushin Il-18 Cargo', 'Ilyushin', 'cargo', 24.0, 3.2, 12000, 1800, 6500, 1250, 650, 820000000, 1220, 40000, FALSE, FALSE, NULL, 1960, 1985)
('Ilyushin Il-62', 'Ilyushin', 'wide_body', 35.3, 3.6, NULL, 2500, 10000, 3500, 900, 2000000000, 2500, 90000, FALSE, FALSE, NULL, 1964, 1995)
('Ilyushin Il-62 Cargo', 'Ilyushin', 'cargo', 35.3, 3.6, 20000, 2500, 10000, 3600, 900, 2020000000, 2520, 90000, FALSE, FALSE, NULL, 1964, 1995)
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