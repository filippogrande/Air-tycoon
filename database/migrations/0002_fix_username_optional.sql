-- Migrazione 0002: fix_username_optional
-- Data: 2025-06-28
-- 
-- Descrizione: fix_username_optional
-- 
-- ATTENZIONE: Questa migrazione viene eseguita automaticamente all'avvio del server
-- Testare sempre in ambiente di sviluppo prima del deploy in produzione

-- ==================================================
-- INIZIO MIGRAZIONE
-- ==================================================

-- Rimuovi il constraint UNIQUE su username prima di modificarlo
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Rimuovi il constraint NOT NULL dal campo username per renderlo opzionale
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Aggiungi un valore di default per username se è NULL
UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;

-- Ricrea un indice UNIQUE parziale che permette NULL ma richiede unicità per valori non-NULL
CREATE UNIQUE INDEX users_username_unique ON users(username) WHERE username IS NOT NULL;

-- ==================================================
-- MIGRAZIONE COMPLETATA
-- ==================================================

SELECT 'Migrazione 0002 - fix_username_optional - COMPLETATA' as status;

-- ==================================================
-- FINE MIGRAZIONE
-- ==================================================
