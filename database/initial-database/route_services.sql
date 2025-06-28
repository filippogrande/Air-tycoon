-- Inserisci qui i dati iniziali per la tabella route_services
INSERT INTO route_services (name, category, cost_per_passenger, description, class_restriction) VALUES
-- Servizi Economy
('Basic Meal', 'meal', 8.50, 'Standard economy meal service', 'economy'),
('Snack Service', 'meal', 3.20, 'Light snack and beverage service', 'economy'),
('Premium Economy Meal', 'meal', 15.00, 'Enhanced meal service for premium economy', 'economy'),

-- Servizi Business
('Business Meal', 'meal', 35.00, 'Multi-course business class meal', 'business'),
('Premium Beverages', 'beverage', 12.00, 'Premium alcoholic and non-alcoholic beverages', 'business'),
('Priority Boarding', 'service', 5.00, 'Priority boarding service', 'business'),

-- Servizi First Class
('First Class Dining', 'meal', 85.00, 'Gourmet dining experience', 'first'),
('Champagne Service', 'beverage', 25.00, 'Premium champagne and wine selection', 'first'),
('Personal Concierge', 'service', 50.00, 'Dedicated personal service', 'first'),

-- Servizi Entertainment
('WiFi Basic', 'entertainment', 12.00, 'Basic internet connectivity', 'all'),
('WiFi Premium', 'entertainment', 25.00, 'High-speed internet connectivity', 'all'),
('IFE System', 'entertainment', 8.00, 'In-flight entertainment system', 'all'),
('Live TV', 'entertainment', 15.00, 'Live television streaming', 'all'),

-- Servizi Comfort
('Extra Legroom', 'comfort', 45.00, 'Seats with additional legroom', 'economy'),
('Amenity Kit', 'comfort', 18.00, 'Travel amenity kit', 'business'),
('Blanket & Pillow', 'comfort', 8.00, 'Premium blanket and pillow set', 'all'),

-- Servizi Speciali
('Unaccompanied Minor', 'special', 50.00, 'Special service for children traveling alone', 'all'),
('Pet Transport', 'special', 150.00, 'Pet transportation service', 'all'),
('Medical Assistance', 'special', 100.00, 'Special medical assistance service', 'all');
