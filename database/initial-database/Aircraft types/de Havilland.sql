INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('de Havilland DH.89 Dragon Rapide', 'de Havilland', 'regional', 8.8, 1.9, NULL, 600, 650, 120, 240, 35000000, 100, 12000, TRUE, FALSE, NULL, 1934, 1949)
('de Havilland DH.106 Comet', 'de Havilland', 'narrow_body', 25.0, 3.0, NULL, 2000, 4000, 1800, 800, 1500000000, 1200, 40000, FALSE, FALSE, NULL, 1949, 1964)
('De Havilland Comet 4', 'De Havilland', 'narrow_body', 24.6, 3.0, NULL, 2000, 3700, 1800, 800, 1200000000, 1200, 40000, FALSE, FALSE, NULL, 1958, 1964)
('De Havilland Comet 4 Cargo', 'De Havilland', 'cargo', 24.6, 3.0, 12.0, 2000, 3700, 1850, 800, 1220000000, 1220, 40000, FALSE, FALSE, NULL, 1958, 1964)
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