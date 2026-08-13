INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Beechcraft Model 18', 'Beechcraft', 'regional', 10.4, 1.8, NULL, 700, 1600, 180, 320, 40000000, 120, 15000, TRUE, FALSE, NULL, 1937, 1960)
('Beechcraft Model 18 Cargo', 'Beechcraft', 'cargo', 10.4, 1.8, 1.2, 700, 1600, 200, 320, 42000000, 130, 15000, TRUE, FALSE, NULL, 1937, 1960)
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