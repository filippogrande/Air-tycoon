-- Migrazione 0004: Aggiunta campo founded alla tabella companies
-- Il backend si aspetta il campo "founded" invece di "founded_date"

ALTER TABLE companies 
ADD COLUMN founded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Copia i valori esistenti da founded_date a founded
UPDATE companies SET founded = founded_date WHERE founded_date IS NOT NULL;

-- Commenti per documentare il campo
COMMENT ON COLUMN companies.founded IS 'Data di fondazione della compagnia (formato compatibile con backend)';
