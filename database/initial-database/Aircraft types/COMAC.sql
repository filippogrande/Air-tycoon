INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('COMAC C919', 'COMAC', 'narrow_body', 38.9, 3.96, NULL, 1600, 5555, 2200, 870, 2500000000, 2600, 120000, FALSE, FALSE, NULL, 2022, NULL)
('COMAC ARJ21-700', 'COMAC', 'regional', 33.5, 3.14, NULL, 1500, 3700, 1200, 830, 1200000000, 1200, 60000, FALSE, FALSE, NULL, 2025, NULL)
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