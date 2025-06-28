-- Script per modificare la tabella companies per supportare ID stringa
-- Da eseguire se la tabella companies usa UUID invece di stringhe

-- Opzione 1: Modificare la tabella esistente per accettare stringhe
-- (Attenzione: questo rimuove tutti i dati esistenti)

-- Rimuovi la constraint e cambia il tipo di colonna
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_pkey;
ALTER TABLE companies ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE companies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);

-- Aggiorna anche le foreign key che riferiscono a companies.id
ALTER TABLE game_states DROP CONSTRAINT IF EXISTS game_states_company_id_fkey;
ALTER TABLE game_states ALTER COLUMN company_id TYPE VARCHAR(255);
ALTER TABLE game_states ADD CONSTRAINT game_states_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Se esiste game_saves, aggiornala anche
ALTER TABLE game_saves ALTER COLUMN company_id TYPE VARCHAR(255);

-- Se esistono altre tabelle con foreign key a companies, aggiornale qui...

-- Verifica la struttura finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;
