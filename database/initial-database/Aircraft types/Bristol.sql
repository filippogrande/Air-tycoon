INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Bristol Freighter', 'Bristol', 'regional', 16.6, 3.2, NULL, 1100, 1500, 800, 270, 90000000, 300, 20000, TRUE, FALSE, NULL, 1946, 1968)
('Bristol 170 Freighter Mk 21 Cargo', 'Bristol', 'cargo', 17.0, 3.2, 4.0, 1100, 1600, 850, 270, 95000000, 320, 20000, TRUE, FALSE, NULL, 1948, 1968)
('Bristol 170 Freighter Mk 31 Cargo', 'Bristol', 'cargo', 17.0, 3.2, 4.2, 1100, 1600, 870, 270, 97000000, 340, 20000, TRUE, FALSE, NULL, 1949, 1968)
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