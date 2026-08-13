INSERT INTO aircraft_types (name, manufacturer, category, cabin_length_meters, cabin_width_meters, 
                           capacity, min_runway_length_meters, range_km, fuel_consumption, 
                           cruise_speed, purchase_price, maintenance_cost_per_hour, max_flight_hours, 
                           can_operate_campo_aviazione, campo_aviazione_mod_available, campo_aviazione_mod_cost, 
                           market_entry_year, market_exit_year) VALUES



('Lockheed Model 10 Electra', 'Lockheed', 'regional', 11.0, 2.0, NULL, 800, 1200, 200, 300, 45000000, 130, 14000, TRUE, FALSE, NULL, 1935, 1945)
('Lockheed Model 10 Electra Cargo', 'Lockheed', 'cargo', 9.8, 2.0, 1.0, 750, 1300, 220, 325, 47000000, 110, 12000, TRUE, FALSE, NULL, 1935, 1950)
('Lockheed Lodestar', 'Lockheed', 'regional', 12.5, 2.2, NULL, 850, 2100, 250, 330, 60000000, 150, 15000, TRUE, FALSE, NULL, 1941, 1950)
('Lockheed Lodestar Cargo', 'Lockheed', 'cargo', 12.5, 2.2, 1.8, 850, 2100, 270, 330, 65000000, 160, 15000, TRUE, FALSE, NULL, 1941, 1950)
('Lockheed L-049 Constellation', 'Lockheed', 'narrow_body', 21.3, 2.8, 44, 1600, 4000, 800, 480, 350000000, 700, 35000, FALSE, FALSE, NULL, 1945, 1951)
('Lockheed L-049 Constellation Cargo', 'Lockheed', 'cargo', 21.3, 2.8, 6.0, 1600, 4000, 850, 480, 360000000, 720, 35000, FALSE, FALSE, NULL, 1945, 1951)
('Lockheed L-1011 TriStar', 'Lockheed', 'wide_body', 50.1, 5.8, NULL, 3000, 9700, 11000, 900, 32000000000, 14000, 140000, FALSE, FALSE, NULL, 1970, 1984)
('Lockheed L-1011 TriStar Cargo', 'Lockheed', 'cargo', 50.1, 5.8, 90000, 3000, 9700, 11500, 900, 32200000000, 14200, 140000, FALSE, FALSE, NULL, 1970, 1984)
('Lockheed L-100 Hercules', 'Lockheed', 'cargo', 29.8, 3.1, 21000, 1200, 3800, 800, 600, 1200000000, 800, 20000, TRUE, FALSE, NULL, 1965, 1992)
('Lockheed L-188 Electra', 'Lockheed', 'regional', 29.2, 3.1, NULL, 1500, 3500, 800, 600, 900000000, 400, 20000, FALSE, FALSE, NULL, 1959, 1970)
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