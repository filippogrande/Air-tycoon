-- Inserisci qui i dati iniziali per la tabella world_events
INSERT INTO world_events (name, description, event_type, start_date, end_date, global_effects) VALUES
('Fuel Crisis 2024', 'Global fuel shortage due to geopolitical tensions', 'economic', '2024-03-01', '2024-05-31', '{"fuel_cost_multiplier": 1.4, "demand_reduction": 0.15}'),
('Summer Olympics 2024', 'Paris Olympics increase travel demand to Europe', 'positive', '2024-07-15', '2024-08-15', '{"european_demand_boost": 0.25, "revenue_multiplier": 1.15}'),
('Airline Strike Wave', 'Major strikes across European airports', 'negative', '2024-09-10', '2024-09-17', '{"operational_efficiency": 0.7, "passenger_satisfaction": -20}'),
('Technology Revolution', 'New aviation technology becomes available', 'technological', '2024-01-01', '2025-12-31', '{"maintenance_efficiency": 1.1, "fuel_efficiency": 1.05}');
