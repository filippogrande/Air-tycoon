INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Vickers Viking', 'Vickers', 'regional', 15.2, 2.8, NULL, 900, 2100, 600, 370, 80000000, 200, 15000, TRUE, FALSE, NULL, 1947, 1954)
('Vickers Viking Cargo', 'Vickers', 'cargo', 15.2, 2.8, 2.0, 900, 2100, 650, 370, 82000000, 210, 15000, TRUE, FALSE, NULL, 1947, 1954)
('Vickers Viscount', 'Vickers', 'regional', 18.6, 2.8, NULL, 1400, 2600, 600, 440, 500000000, 600, 35000, FALSE, FALSE, NULL, 1953, 1968)
('Vickers Viscount 800', 'Vickers', 'regional', 21.4, 2.8, NULL, 1400, 2600, 650, 440, 520000000, 650, 35000, FALSE, FALSE, NULL, 1955, 1968)
('Vickers Viscount 800 Cargo', 'Vickers', 'cargo', 21.4, 2.8, 4.0, 1400, 2600, 700, 440, 530000000, 670, 35000, FALSE, FALSE, NULL, 1955, 1968)
('Vickers Viscount 810', 'Vickers', 'regional', 21.4, 2.8, NULL, 1400, 2600, 650, 440, 540000000, 650, 35000, FALSE, FALSE, NULL, 1956, 1968)
('Vickers Viscount 810 Cargo', 'Vickers', 'cargo', 21.4, 2.8, 4.0, 1400, 2600, 700, 440, 550000000, 670, 35000, FALSE, FALSE, NULL, 1956, 1968)
('Vickers Viscount 812', 'Vickers', 'regional', 21.4, 2.8, NULL, 1400, 2600, 650, 440, 560000000, 650, 35000, FALSE, FALSE, NULL, 1957, 1968)
('Vickers Viscount 812 Cargo', 'Vickers', 'cargo', 21.4, 2.8, 4.0, 1400, 2600, 700, 440, 570000000, 670, 35000, FALSE, FALSE, NULL, 1957, 1968)
('Vickers VC10', 'Vickers', 'narrow_body', 32.6, 3.54, NULL, 2500, 9000, 2200, 870, 2100000000, 1800, 70000, FALSE, FALSE, NULL, 1961, 1979)
('Vickers Vanguard', 'Vickers', 'regional', 30.6, 3.2, NULL, 1600, 3200, 900, 370, 90000000, 300, 20000, FALSE, FALSE, NULL, 1959, 1978)
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