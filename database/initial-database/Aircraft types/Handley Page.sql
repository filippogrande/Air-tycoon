INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Handley Page Halton Cargo', 'Handley Page', 'cargo', 18.5, 3.0, 8.0, 1500, 3700, 950, 390, 135000000, 750, 25000, FALSE, FALSE, NULL, 1943, 1948)
('Handley Page Halifax C Mk VIII Cargo', 'Handley Page', 'cargo', 21.9, 3.2, 9.0, 1500, 3200, 1100, 420, 120000000, 700, 25000, FALSE, FALSE, NULL, 1944, 1947)
('Handley Page Hermes', 'Handley Page', 'narrow_body', 23.2, 3.2, NULL, 1600, 4800, 1100, 400, 140000000, 800, 30000, FALSE, FALSE, NULL, 1948, 1954)
('Handley Page Hermes IV', 'Handley Page', 'narrow_body', 23.2, 3.2, NULL, 1600, 4800, 1100, 400, 145000000, 820, 30000, FALSE, FALSE, NULL, 1949, 1954)
('Handley Page Hermes V', 'Handley Page', 'narrow_body', 23.2, 3.2, NULL, 1600, 4800, 1100, 400, 148000000, 820, 30000, FALSE, FALSE, NULL, 1950, 1954)
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