-- Script per verificare e creare la tabella game_saves se mancante
-- Da eseguire nel database PostgreSQL se il salvataggio non funziona

-- Verifica se la tabella esiste
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'game_saves'
);

-- Se la tabella non esiste, crearla con questo comando:
CREATE TABLE IF NOT EXISTS game_saves (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    save_name VARCHAR(255) NOT NULL DEFAULT 'autosave',
    game_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Vincolo di unicità su compagnia + nome salvataggio
    UNIQUE(company_id, save_name)
);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_game_saves_company_id ON game_saves(company_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_updated_at ON game_saves(updated_at DESC);

-- Trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_saves_updated_at 
    BEFORE UPDATE ON game_saves 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verifica finale
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'game_saves' 
ORDER BY ordinal_position;
