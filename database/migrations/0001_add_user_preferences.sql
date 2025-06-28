-- Migrazione 0001: add_user_preferences
-- Data: 2025-06-28
-- 
-- Descrizione: add_user_preferences
-- 
-- ATTENZIONE: Questa migrazione viene eseguita automaticamente all'avvio del server
-- Testare sempre in ambiente di sviluppo prima del deploy in produzione

-- ==================================================
-- INIZIO MIGRAZIONE
-- ==================================================

-- Creazione tabella preferenze utente per salvare impostazioni UI e gioco
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(255) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Aggiunta colonna per tracciare ultimo accesso utente
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Indice per ultimo accesso
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Inserimento preferenze di default per utenti esistenti
INSERT INTO user_preferences (user_id, preference_key, preference_value) 
SELECT id, 'ui_theme', 'dark' FROM users 
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (user_id, preference_key, preference_value) 
SELECT id, 'map_zoom_level', '3' FROM users 
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (user_id, preference_key, preference_value) 
SELECT id, 'auto_save_interval', '300' FROM users 
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- ==================================================
-- MIGRAZIONE COMPLETATA
-- ==================================================

SELECT 'Migrazione 0001 - add_user_preferences - COMPLETATA' as status;

-- ==================================================
-- FINE MIGRAZIONE
-- ==================================================
