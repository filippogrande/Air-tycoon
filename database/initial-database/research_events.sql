-- Inserisci qui i dati iniziali per la tabella research_events
INSERT INTO research_events (name, description, cost, duration_days, requirements, effects) VALUES
('Fuel Efficiency Program', 'Research program to improve fuel efficiency across the fleet', 5000000, 180, '{"min_aircraft": 5}', '{"fuel_reduction": 0.1}'),
('Advanced Navigation Systems', 'Upgrade navigation systems for better route optimization', 3000000, 120, '{"min_routes": 10}', '{"time_reduction": 0.05}'),
('Customer Service Enhancement', 'Improve customer service to increase satisfaction and reputation', 2000000, 90, '{"min_reputation": 60}', '{"reputation_boost": 10}'),
('Maintenance Optimization', 'Optimize maintenance procedures to reduce costs and downtime', 4000000, 150, '{"min_aircraft": 10}', '{"maintenance_reduction": 0.15}'),
('Route Analysis AI', 'Implement AI for better route profitability analysis', 6000000, 200, '{"min_routes": 20}', '{"revenue_boost": 0.08}');
