-- Inserisci qui i dati iniziali per la tabella seat_models
INSERT INTO seat_models (manufacturer_id, model_name, model_code, seat_class, width_cm, depth_cm, height_cm, 
                        pitch_min_cm, pitch_max_cm, weight_kg, comfort_rating, recline_angle, 
                        has_entertainment_screen, screen_size_inches, has_power_outlet, has_usb_port,
                        market_entry_year, max_flight_hours, max_cycles, base_cost, maintenance_cost_per_year) VALUES

-- Recaro Economy
(1, 'BL3510', 'BL3510', 'economy', 43.2, 76.0, 81.0, 76, 86, 12.5, 6, 8, TRUE, 9.0, FALSE, TRUE, 2015, 45000, 22500, 1200, 150),
(1, 'CL3710', 'CL3710', 'economy', 45.0, 78.0, 83.0, 79, 89, 13.2, 7, 10, TRUE, 10.1, TRUE, TRUE, 2018, 50000, 25000, 1600, 180),

-- Collins Aerospace Economy  
(2, 'Meridian', 'MER-100', 'economy', 44.0, 77.0, 82.0, 76, 87, 12.8, 6, 9, TRUE, 9.0, FALSE, TRUE, 2016, 47000, 23000, 1400, 170),
(2, 'Aire', 'AIR-200', 'economy', 46.0, 79.0, 84.0, 81, 91, 14.0, 8, 12, TRUE, 11.0, TRUE, TRUE, 2020, 55000, 27500, 2000, 210),

-- Geven Economy (low-cost specialist)
(4, 'Piuma', 'PMA-150', 'economy', 43.0, 75.0, 80.0, 76, 84, 11.8, 5, 6, FALSE, 0, FALSE, FALSE, 2014, 40000, 20000, 1000, 120),
(4, 'Essenza', 'ESS-250', 'economy', 44.5, 76.5, 81.5, 78, 86, 12.2, 6, 8, TRUE, 8.9, FALSE, TRUE, 2019, 48000, 24000, 1300, 140),

-- Acro Economy (ultra-lightweight)
(5, 'Series 3', 'S3-100', 'economy', 43.5, 76.0, 80.5, 76, 85, 10.5, 5, 7, FALSE, 0, FALSE, FALSE, 2017, 42000, 21000, 1100, 110),
(5, 'Series 6', 'S6-200', 'economy', 45.0, 77.5, 82.0, 79, 88, 11.8, 7, 9, TRUE, 9.0, TRUE, TRUE, 2021, 50000, 25000, 1700, 160),


-- Recaro Premium Economy
(1, 'CL3620', 'CL3620', 'premium_economy', 48.0, 91.0, 88.0, 97, 107, 18.5, 8, 15, TRUE, 12.1, TRUE, TRUE, 2017, 50000, 25000, 3200, 350),

-- Collins Premium Economy
(2, 'Elements', 'ELM-300', 'premium_economy', 49.5, 93.0, 90.0, 99, 109, 19.2, 8, 18, TRUE, 13.3, TRUE, TRUE, 2019, 52000, 26000, 4100, 390),

-- Zodiac Premium Economy
(3, 'Z300', 'Z300-PE', 'premium_economy', 47.5, 89.0, 87.0, 94, 104, 17.8, 7, 12, TRUE, 11.6, TRUE, TRUE, 2016, 48000, 24000, 2800, 320),


-- Recaro Business
(1, 'CL6720', 'CL6720', 'business', 53.0, 152.0, 110.0, 152, 165, 35.0, 9, 180, TRUE, 15.6, TRUE, TRUE, 2018, 60000, 30000, 9000, 900),

-- Collins Business
(2, 'Super Diamond', 'SD-400', 'business', 55.0, 156.0, 115.0, 156, 170, 38.5, 9, 180, TRUE, 17.0, TRUE, TRUE, 2019, 62000, 31000, 12000, 1100),

-- Zodiac Business (Luxury specialist)
(3, 'Cirrus', 'CIR-500', 'business', 56.0, 160.0, 118.0, 160, 175, 42.0, 10, 180, TRUE, 18.5, TRUE, TRUE, 2020, 58000, 29000, 15000, 1300),

-- Thompson Business
(6, 'Vantage XL', 'VXL-600', 'business', 54.0, 155.0, 112.0, 155, 168, 36.8, 9, 180, TRUE, 16.0, TRUE, TRUE, 2017, 55000, 27500, 10000, 1000),



-- Zodiac First Class (specialist luxury)
(3, 'Optima', 'OPT-800', 'first', 68.0, 203.0, 140.0, 203, 220, 65.0, 10, 180, TRUE, 24.0, TRUE, TRUE, TRUE, 2019, 55000, 27500, 25000, 2000),

-- Collins First Class
(2, 'Pinnacle', 'PIN-900', 'first', 71.0, 208.0, 145.0, 208, 225, 68.5, 10, 180, TRUE, 26.0, TRUE, TRUE, TRUE, 2020, 58000, 29000, 32000, 2200),

-- Thompson First Class
(6, 'Elite', 'ELI-1000', 'first', 75.0, 215.0, 150.0, 215, 235, 75.0, 10, 180, TRUE, 27.0, TRUE, TRUE, TRUE, 2018, 52000, 26000, 37000, 2500);
