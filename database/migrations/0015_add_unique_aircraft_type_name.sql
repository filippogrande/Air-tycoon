-- Migrazione 0015: aggiunta unique constraint su aircraft_types.name, research_events.name, random_events.name

-- Rimuovi eventuali duplicati preesistenti (mantieni solo il record con id minore)
DELETE FROM aircraft_types a
USING aircraft_types b
WHERE a.name = b.name AND a.id > b.id;

ALTER TABLE aircraft_types
ADD CONSTRAINT aircraft_types_name_unique UNIQUE (name);

-- Rimuovi duplicati da research_events
DELETE FROM research_events a
USING research_events b
WHERE a.name = b.name AND a.id > b.id;

ALTER TABLE research_events
ADD CONSTRAINT research_events_name_unique UNIQUE (name);

-- Rimuovi duplicati da random_events
DELETE FROM random_events a
USING random_events b
WHERE a.name = b.name AND a.id > b.id;

ALTER TABLE random_events
ADD CONSTRAINT random_events_name_unique UNIQUE (name);

-- Log
SELECT 'Migrazione 0015 - aggiunta unique constraint su aircraft_types.name, research_events.name, random_events.name - COMPLETATA' as status;
