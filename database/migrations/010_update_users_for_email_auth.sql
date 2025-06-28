-- Migrazione 010: Aggiorna tabella users per autenticazione con email
-- Data: 28 giugno 2025
-- Scopo: Supporta l'autenticazione via email invece di username

-- Aggiorna la tabella users per supportare autenticazione via email
ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_username_key,
    ALTER COLUMN username DROP NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ADD CONSTRAINT users_email_key UNIQUE (email);

-- Rendi username opzionale e email obbligatorio
UPDATE users SET email = username || '@localhost' WHERE email IS NULL;

-- Aggiungi commenti per chiarire l'uso
COMMENT ON COLUMN users.username IS 'Username opzionale per display, non più usato per autenticazione';
COMMENT ON COLUMN users.email IS 'Email principale usata per autenticazione e identificazione utente';
COMMENT ON COLUMN users.password_hash IS 'Hash SHA256 della password utente';

-- Aggiungi indice per performance sulle query per email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verifica che non ci siano email duplicate
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;
