-- Script per creare utente Air Tycoon
-- Esegui con: psql -U postgres -h localhost -f database/create_user.sql

-- Crea utente (se non esiste)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'airtycoon') THEN
        CREATE USER airtycoon WITH PASSWORD 'airtycoon2024!';
    END IF;
END
$$;

-- Assegna permessi
ALTER USER airtycoon CREATEDB;
ALTER USER airtycoon LOGIN;

-- Crea database (se non esiste)
SELECT 'CREATE DATABASE air_tycoon OWNER airtycoon'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'air_tycoon')\gexec

-- Assegna privilegi
GRANT ALL PRIVILEGES ON DATABASE air_tycoon TO airtycoon;

-- Conferma creazione
\echo 'Utente airtycoon creato con successo!'
\echo 'Database air_tycoon creato con successo!'

-- Mostra utenti e database
\du airtycoon
\l air_tycoon
