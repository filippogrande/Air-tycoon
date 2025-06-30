-- Migrazione 0019: aggiunta UNIQUE constraint su company_hubs (company_id, airport_id)

-- Elimina eventuali duplicati prima di aggiungere la constraint
DELETE FROM company_hubs
WHERE id NOT IN (
  SELECT MIN(id)
  FROM company_hubs
  GROUP BY company_id, airport_id
);

-- Aggiungi la UNIQUE constraint
ALTER TABLE company_hubs
ADD CONSTRAINT company_hubs_company_airport_unique UNIQUE (company_id, airport_id);
