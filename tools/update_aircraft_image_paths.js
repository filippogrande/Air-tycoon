// tools/update_aircraft_image_paths.js
// Scans Client/assets/aircraft and updates aircraft_types.image_path for matching names.
// Usage: node tools/update_aircraft_image_paths.js

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const ASSETS_DIR = path.join(__dirname, '..', 'Client', 'assets', 'aircraft');

function normalizeKey(name) {
    if (!name) return '';
    // remove diacritics, lowercase, replace non-alnum with '-', collapse multiples, trim
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

(async function main(){
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error('Assets folder not found:', ASSETS_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(ASSETS_DIR).filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    if (!files.length) {
        console.error('No image files found in', ASSETS_DIR);
        process.exit(1);
    }

    // Build map normalized -> filename (and some alternate keys)
    const map = {};
    files.forEach(f => {
        const base = path.parse(f).name;
        const key = normalizeKey(base);
        map[key] = f;
        // also store variant without separators for fuzzy matching
        map[key.replace(/[-_]/g, '')] = f;
    });

    // Connect to DB using env vars as server/database.js
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'air_tycoon',
        password: String(process.env.DB_PASSWORD || ''),
        port: parseInt(process.env.DB_PORT) || 5432,
    });

    try {
        const res = await pool.query('SELECT id, name, image_path FROM aircraft_types');
        for (const row of res.rows) {
            const rawName = String(row.name || '');
            const n = normalizeKey(rawName);

            let foundFile = map[n] || map[n.replace(/-/g, '_')] || map[n.replace(/[-_]/g, '')];

            if (foundFile) {
                const filepath = '/assets/aircraft/' + foundFile;
                // only update if different or empty
                if (!row.image_path || String(row.image_path).trim() === '' || row.image_path !== filepath) {
                    console.log('Updating', rawName, '->', filepath);
                    await pool.query('UPDATE aircraft_types SET image_path = $1 WHERE id = $2', [filepath, row.id]);
                } else {
                    console.log('Already set for', rawName, '->', row.image_path);
                }
            } else {
                console.log('No image found for', rawName);
            }
        }
        console.log('Done');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
})();
