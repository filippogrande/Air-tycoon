INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Fokker F27 Friendship', 'Fokker', 'regional', 14.6, 2.7, NULL, 1200, 1700, 600, 460, 400000000, 600, 30000, FALSE, FALSE, NULL, 1954, 1987)
('Fokker F27 Friendship Cargo', 'Fokker', 'cargo', 14.6, 2.7, 3.5, 1200, 1700, 650, 460, 410000000, 620, 30000, FALSE, FALSE, NULL, 1954, 1987)
('Fokker F27 Friendship Mk200', 'Fokker', 'regional', 14.6, 2.7, NULL, 1200, 1700, 600, 460, 420000000, 600, 30000, FALSE, FALSE, NULL, 1959, 1987)
('Fokker F27 Friendship Mk200 Cargo', 'Fokker', 'cargo', 14.6, 2.7, 3500, 1200, 1700, 650, 460, 430000000, 620, 30000, FALSE, FALSE, NULL, 1959, 1987)
('Fokker F28 Fellowship 1000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 950000000, 1200, 40000, FALSE, FALSE, NULL, 1968, 1987)
('Fokker F28 Fellowship 1000C', 'Fokker', 'cargo', 27.4, 3.0, 3500, 1500, 1800, 1250, 800, 970000000, 1220, 40000, FALSE, FALSE, NULL, 1968, 1987)
('Fokker F28 Fellowship 2000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 980000000, 1200, 40000, FALSE, FALSE, NULL, 1971, 1987)
('Fokker F28 Fellowship 3000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 1000000000, 1200, 40000, FALSE, FALSE, NULL, 1973, 1987)
('Fokker F28 Fellowship 3000C', 'Fokker', 'cargo', 27.4, 3.0, 3500, 1500, 1800, 1250, 800, 1010000000, 1220, 40000, FALSE, FALSE, NULL, 1973, 1987)
('Fokker F28 Fellowship 4000', 'Fokker', 'regional', 27.4, 3.0, NULL, 1500, 1800, 1200, 800, 1020000000, 1200, 40000, FALSE, FALSE, NULL, 1974, 1987)
('Fokker 100', 'Fokker', 'narrow_body', 35.53, 3.3, NULL, 2100, 4200, 2100, 845, 1200000000, 1100, 35000, FALSE, FALSE, NULL, 1988, 1997)
('Fokker 50', 'Fokker', 'regional', 15.3, 2.7, NULL, 1200, 1700, 400, 500, 700000000, 300, 20000, TRUE, FALSE, NULL, 1987, 1997)
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