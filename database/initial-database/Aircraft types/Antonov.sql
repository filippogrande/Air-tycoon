INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Antonov An-2', 'Antonov', 'regional', 12.4, 2.0, NULL, 500, 845, 120, 258, 35000000, 80, 12000, TRUE, FALSE, NULL, 1947, 2001)
('Antonov An-10', 'Antonov', 'narrow_body', 30.0, 3.2, NULL, 1500, 2500, 1200, 600, 600000000, 800, 30000, FALSE, FALSE, NULL, 1957, 1973)
('Antonov An-10 Cargo', 'Antonov', 'cargo', 30.0, 3.2, 10.0, 1500, 2500, 1250, 600, 620000000, 820, 30000, FALSE, FALSE, NULL, 1957, 1973)
('Antonov An-22', 'Antonov', 'cargo', 28.5, 3.8, 60000, 2000, 5000, 4000, 650, 1500000000, 2000, 60000, FALSE, FALSE, NULL, 1965, 2001)
('Antonov An-225', 'Antonov', 'cargo', 84.0, 6.4, 250000, 6400, 15400, 8000, 850, 3200000000, 8000, 100000, FALSE, TRUE, NULL, 1988, 2020)
('Antonov An-124 Ruslan', 'Antonov', 'cargo', 68.96, 6.4, 120000, 3000, 4800, 5000, 850, 1500000000, 2000, 100000, FALSE, TRUE, NULL, 1986, NULL)
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