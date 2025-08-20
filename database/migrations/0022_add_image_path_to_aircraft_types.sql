-- Migration 0022: add image_path to aircraft_types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='aircraft_types' AND column_name='image_path'
    ) THEN
        ALTER TABLE aircraft_types ADD COLUMN image_path TEXT;
        COMMENT ON COLUMN aircraft_types.image_path IS 'Relative URL or path to aircraft image asset (eg /assets/aircraft/a320.png)';
    END IF;

    -- OPTIONAL: populate image_path using a conventional filename derived from name
    -- This is best-effort; adjust filenames or update rows manually for correctness.
    UPDATE aircraft_types
    SET image_path = '/assets/aircraft/' || lower(regexp_replace(name, '[^a-z0-9]+', '_', 'gi')) || '.png'
    WHERE (image_path IS NULL OR trim(image_path) = '')
      AND name IS NOT NULL;
END$$;

SELECT 'Migration 0022 - add image_path to aircraft_types - COMPLETED' as status;
