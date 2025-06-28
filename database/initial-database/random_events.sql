-- Inserisci qui i dati iniziali per la tabella random_events
INSERT INTO random_events (name, description, probability, effects, duration_days) VALUES
('Fuel Price Spike', 'Global fuel prices increase significantly', 0.15, '{"fuel_cost_multiplier": 1.3}', 30),
('Economic Boom', 'Economic growth increases passenger demand', 0.10, '{"demand_multiplier": 1.2}', 60),
('Airport Strike', 'Strikes at major airports disrupt operations', 0.05, '{"revenue_multiplier": 0.8}', 7),
('New Competitor', 'A new airline enters your main markets', 0.08, '{"competition_increase": 0.15}', 90),
('Tourism Campaign', 'Government tourism campaign boosts travel', 0.12, '{"passenger_boost": 0.1}', 45),
('Maintenance Issue', 'Fleet-wide maintenance issue discovered', 0.06, '{"maintenance_cost_multiplier": 2.0}', 14),
('Fuel Discount Deal', 'Special deal with fuel supplier', 0.08, '{"fuel_cost_multiplier": 0.8}', 90),
('Perfect Weather', 'Excellent weather reduces delays and costs', 0.20, '{"operational_efficiency": 1.1}', 30);
