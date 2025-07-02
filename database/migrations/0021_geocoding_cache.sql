-- Migrazione 0021: geocoding_cache per caching reverse geocoding Nominatim
-- Data: 2025-07-02

CREATE TABLE IF NOT EXISTS geocoding_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(latitude, longitude)
);

SELECT 'Migrazione 0021 - geocoding_cache creata - COMPLETATA' as status;
