INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Convair 240 Cargo', 'Convair', 'cargo', 16.7, 2.7, 3.5, 1200, 2600, 750, 480, 360000000, 520, 25000, FALSE, FALSE, NULL, 1947, 1954)
('Convair 240', 'Convair', 'regional', 16.7, 2.7, NULL, 1200, 2600, 700, 480, 350000000, 500, 25000, FALSE, FALSE, NULL, 1948, 1954)
('Convair 340', 'Convair', 'regional', 18.6, 2.7, NULL, 1200, 2600, 900, 480, 370000000, 540, 25000, FALSE, FALSE, NULL, 1949, 1956)
('Convair 340 Cargo', 'Convair', 'cargo', 18.6, 2.7, 3.7, 1200, 2600, 950, 480, 380000000, 560, 25000, FALSE, FALSE, NULL, 1949, 1956)
('Convair CV-440 Metropolitan', 'Convair', 'regional', 18.6, 2.7, NULL, 1200, 3400, 950, 480, 400000000, 560, 25000, FALSE, FALSE, NULL, 1952, 1958)
('Convair CV-440 Metropolitan Cargo', 'Convair', 'cargo', 18.6, 2.7, 3.7, 1200, 3400, 1000, 480, 410000000, 580, 25000, FALSE, FALSE, NULL, 1952, 1958)
('Convair 880', 'Convair', 'narrow_body', 28.6, 3.0, NULL, 2200, 4800, 2500, 970, 1800000000, 1800, 60000, FALSE, FALSE, NULL, 1960, 1962)
('Convair 580', 'Convair', 'regional', 20.4, 2.7, NULL, 1200, 2100, 600, 480, 500000000, 200, 15000, TRUE, FALSE, NULL, 1960, 1992)
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