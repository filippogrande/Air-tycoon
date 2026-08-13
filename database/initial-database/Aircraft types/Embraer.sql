INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Embraer EMB 120 Brasilia', 'Embraer', 'regional', 20.0, 2.7, NULL, 800, 1600, 800, 580, 600000000, 400, 10000, FALSE, FALSE, NULL, 1990, 2001)
('Embraer EMB 120 Cargo', 'Embraer', 'cargo', 20.0, 2.7, 2500, 800, 1600, 900, 580, 620000000, 420, 10000, FALSE, FALSE, NULL, 1990, 2001)
('Embraer ERJ 145', 'Embraer', 'regional', 29.87, 2.1, NULL, 1200, 2800, 1200, 833, 1000000000, 800, 20000, FALSE, FALSE, NULL, 1994, NULL)
('Embraer ERJ 135', 'Embraer', 'regional', 26.33, 2.1, NULL, 1200, 2800, 1200, 833, 900000000, 800, 20000, FALSE, FALSE, NULL, 1997, NULL)
('Embraer ERJ 140', 'Embraer', 'regional', 28.45, 2.1, NULL, 1200, 2800, 1200, 833, 950000000, 800, 20000, FALSE, FALSE, NULL, 2000, NULL)
('Embraer E170', 'Embraer', 'regional', 29.9, 2.74, NULL, 1600, 3334, 850, 870, 1500000000, 1800, 80000, FALSE, FALSE, NULL, 2001, NULL)
('Embraer E175', 'Embraer', 'regional', 29.9, 3.28, NULL, 1600, 3334, 850, 870, 5100000000, 1800, 80000, FALSE, TRUE, 500000000, 2002, NULL)
('Embraer E190', 'Embraer', 'regional', 36.2, 2.74, NULL, 1600, 4260, 950, 870, 1700000000, 1800, 80000, FALSE, FALSE, NULL, 2003, NULL)
('Embraer E195', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 1800000000, 1800, 80000, FALSE, FALSE, NULL, 2004, NULL)
('Embraer E195LR', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 1850000000, 1800, 80000, FALSE, FALSE, NULL, 2005, NULL)
('Embraer E190LR', 'Embraer', 'regional', 36.2, 2.74, NULL, 1600, 4260, 950, 870, 1750000000, 1800, 80000, FALSE, FALSE, NULL, 2006, NULL)
('', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 1900000000, 1800, 80000, FALSE, FALSE, NULL, 2007, NULL)
('Embraer E175E2', 'Embraer', 'regional', 31.7, 2.74, NULL, 1600, 3334, 850, 870, 1700000000, 1800, 80000, FALSE, FALSE, NULL, 2012, NULL)
('Embraer E190-E2 Cargo', 'Embraer', 'cargo', 36.2, 2.74, 12000, 1600, 4260, 1000, 870, 2200000000, 1900, 80000, FALSE, FALSE, NULL, 2018, NULL)
('EMB 110 Bandeirante', 'Embraer', 'regional', 12.7, 2.1, NULL, 800, 1500, 300, 350, 300000000, 100, 10000, TRUE, FALSE, NULL, 1973, 1990)
('Embraer E190-E2', 'Embraer', 'regional', 36.2, 2.74, NULL, 1600, 4260, 950, 870, 2100000000, 1800, 80000, FALSE, FALSE, NULL, 2015, NULL)
('Embraer E195-E2', 'Embraer', 'regional', 38.7, 2.74, NULL, 1600, 4260, 950, 870, 2300000000, 1800, 80000, FALSE, FALSE, NULL, 2018, NULL)
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