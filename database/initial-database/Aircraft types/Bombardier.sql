-- Inserisci qui i dati iniziali per la tabella aircraft_types
INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES
('Bombardier CRJ100', 'Bombardier', 'regional', 26.77, 2.5, NULL, 1200, 2800, 1200, 785, 900000000, 800, 20000, FALSE, FALSE, NULL, 1989, 1999)
('Bombardier Dash 8 Q400', 'Bombardier', 'regional', 32.8, 2.7, NULL, 1200, 2500, 1200, 667, 1200000000, 900, 25000, FALSE, FALSE, NULL, 1991, NULL)
('Bombardier CRJ200', 'Bombardier', 'regional', 26.77, 2.5, NULL, 1200, 2800, 1200, 785, 950000000, 800, 20000, FALSE, FALSE, NULL, 1993, 2006)
('Bombardier CRJ700', 'Bombardier', 'regional', 32.51, 2.5, NULL, 1200, 2800, 1200, 828, 1100000000, 800, 20000, FALSE, FALSE, NULL, 1996, NULL)
('Bombardier CRJ900', 'Bombardier', 'regional', 36.2, 2.5, NULL, 1200, 2800, 1200, 828, 1200000000, 800, 20000, FALSE, FALSE, NULL, 1998, NULL)
('Bombardier Q400', 'Bombardier', 'regional', 32.8, 2.7, NULL, 1200, 2500, 1200, 667, 1300000000, 900, 25000, FALSE, FALSE, NULL, 2002, NULL)
('Bombardier CRJ1000', 'Bombardier', 'regional', 39.1, 2.5, NULL, 1200, 2800, 1200, 828, 1300000000, 800, 20000, FALSE, FALSE, NULL, 2011, NULL)
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
