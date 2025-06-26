-- Migrazione 001: Aggiunta business_level e tourist_level alla tabella airports
-- Data: 26 giugno 2025
-- Descrizione: Sostituisce demandLevel con due valori separati per traffico business e turistico

-- Aggiunge le nuove colonne
ALTER TABLE airports 
ADD COLUMN business_level INTEGER DEFAULT 50 CHECK (business_level >= 0 AND business_level <= 100),
ADD COLUMN tourist_level INTEGER DEFAULT 50 CHECK (tourist_level >= 0 AND tourist_level <= 100);

-- Commenti per documentare i campi
COMMENT ON COLUMN airports.business_level IS 'Livello di traffico business da 0 a 100 - influenza passeggeri e merci di categoria business';
COMMENT ON COLUMN airports.tourist_level IS 'Livello di traffico turistico da 0 a 100 - influenza passeggeri leisure e cargo generale';

-- Aggiorna gli aeroporti esistenti con valori realistici
UPDATE airports SET 
    business_level = CASE 
        WHEN iata_code = 'MXP' THEN 85  -- Milano Malpensa
        WHEN iata_code = 'FCO' THEN 80  -- Roma Fiumicino
        WHEN iata_code = 'LHR' THEN 95  -- London Heathrow
        WHEN iata_code = 'CDG' THEN 90  -- Paris CDG
        WHEN iata_code = 'JFK' THEN 98  -- New York JFK
        WHEN iata_code = 'LAX' THEN 92  -- Los Angeles
        WHEN iata_code = 'DXB' THEN 88  -- Dubai
        WHEN iata_code = 'SIN' THEN 85  -- Singapore
        WHEN iata_code = 'HKG' THEN 90  -- Hong Kong
        WHEN iata_code = 'NRT' THEN 87  -- Tokyo Narita
        WHEN iata_code = 'FRA' THEN 93  -- Frankfurt
        WHEN iata_code = 'AMS' THEN 85  -- Amsterdam
        WHEN iata_code = 'ZUR' THEN 88  -- Zurich
        WHEN iata_code = 'VIE' THEN 75  -- Vienna
        WHEN iata_code = 'MUC' THEN 82  -- Munich
        ELSE 60  -- Default per altri aeroporti
    END,
    tourist_level = CASE 
        WHEN iata_code = 'MXP' THEN 75  -- Milano Malpensa
        WHEN iata_code = 'FCO' THEN 90  -- Roma Fiumicino (turismo alto)
        WHEN iata_code = 'LHR' THEN 70  -- London Heathrow 
        WHEN iata_code = 'CDG' THEN 80  -- Paris CDG (turismo)
        WHEN iata_code = 'JFK' THEN 85  -- New York JFK
        WHEN iata_code = 'LAX' THEN 88  -- Los Angeles (Hollywood)
        WHEN iata_code = 'DXB' THEN 85  -- Dubai (turismo luxury)
        WHEN iata_code = 'SIN' THEN 75  -- Singapore
        WHEN iata_code = 'HKG' THEN 80  -- Hong Kong
        WHEN iata_code = 'NRT' THEN 70  -- Tokyo Narita
        WHEN iata_code = 'FRA' THEN 65  -- Frankfurt (più business)
        WHEN iata_code = 'AMS' THEN 78  -- Amsterdam
        WHEN iata_code = 'ZUR' THEN 70  -- Zurich
        WHEN iata_code = 'VIE' THEN 82  -- Vienna (turismo culturale)
        WHEN iata_code = 'MUC' THEN 85  -- Munich (Oktoberfest, etc.)
        ELSE 55  -- Default per altri aeroporti
    END
WHERE iata_code IN ('MXP', 'FCO', 'LHR', 'CDG', 'JFK', 'LAX', 'DXB', 'SIN', 'HKG', 'NRT', 'FRA', 'AMS', 'ZUR', 'VIE', 'MUC');

-- Aggiorna il timestamp per indicare che la tabella è stata modificata
UPDATE airports SET updated_at = CURRENT_TIMESTAMP 
WHERE business_level IS NOT NULL AND tourist_level IS NOT NULL;
