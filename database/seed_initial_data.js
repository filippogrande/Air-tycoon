// Script di seeding automatico per initial_data.sql
// Esegue il seeding solo se il file è cambiato dall'ultimo avvio

const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config(); // Carica variabili da .env

// Configurazione DB (puoi sostituire con dotenv o config custom)
const DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'air_tycoon',
  password: String(process.env.DB_PASSWORD || ''),
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
};

const SQL_FILE = path.join(__dirname, 'initial_data.sql');
const INITIAL_DB_DIR = path.join(__dirname, 'initial-database');

async function getFileHash(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(data).digest('hex');
}

async function ensureSeedHistoryTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS seed_history (
      id SERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_hash TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getLastSeedHash(client, fileName) {
  const res = await client.query(
    'SELECT file_hash FROM seed_history WHERE file_name = $1 ORDER BY applied_at DESC LIMIT 1',
    [fileName]
  );
  return res.rows[0]?.file_hash || null;
}

async function saveSeedHash(client, fileName, fileHash) {
  await client.query(
    'INSERT INTO seed_history (file_name, file_hash) VALUES ($1, $2)',
    [fileName, fileHash]
  );
}

async function runSqlFile(client, filePath, fileLabel) {
  let beforeAirports = 0;
  if (fileLabel === 'airports.sql') {
    try {
      const res = await client.query('SELECT COUNT(*) FROM airports');
      beforeAirports = parseInt(res.rows[0].count, 10);
    } catch (e) {
      console.log('[DEBUG] Impossibile contare aeroporti prima del seeding:', e.message);
    }
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const sqlNoComments = sql.split('\n').filter(line => !line.trim().startsWith('--')).join('\n');
  const statements = sqlNoComments
    .split(/;/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const upsertConfig = {
    airports: 'iata_code',
    companies: 'id',
    research_events: 'name',
    random_events: 'name',
    // Estendi qui per altre tabelle
  };

  function transformInsertToUpsert(stmt) {
    const insertRegex = /^INSERT INTO ([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i;
    const match = stmt.match(insertRegex);
    if (!match) return stmt;
    const [_, table, fields, values] = match;
    const key = upsertConfig[table];
    if (!key) return stmt;
    const fieldList = fields.split(',').map(f => f.trim());
    if (!fieldList.includes(key)) return stmt;
    const updateFields = fieldList.filter(f => f !== key)
      .map(f => `${f} = EXCLUDED.${f}`)
      .join(', ');
    return `${stmt} ON CONFLICT (${key}) DO UPDATE SET ${updateFields}`;
  }

  let totalChanged = 0;
  for (let stmt of statements) {
    if (stmt.startsWith('INSERT INTO')) {
      stmt = transformInsertToUpsert(stmt);
    }
    try {
      const res = await client.query(stmt);
      if (typeof res.rowCount === 'number') {
        totalChanged += res.rowCount;
      }
    } catch (err) {
      console.error(`[DEBUG][${fileLabel}] Errore statement: ${stmt.substring(0, 200).replace(/\n/g, ' ')}`, err.message);
    }
  }

  if (fileLabel === 'airports.sql') {
    let afterAirports = 0;
    try {
      const res = await client.query('SELECT COUNT(*) FROM airports');
      afterAirports = parseInt(res.rows[0].count, 10);
    } catch (e) {
      console.log('[DEBUG] Impossibile contare aeroporti dopo del seeding:', e.message);
    }
  }
}

async function main() {
  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    await ensureSeedHistoryTable(client);
    // Leggi tutti i file .sql in initial-database/ in ordine alfabetico
    const files = fs.readdirSync(INITIAL_DB_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const filePath = path.join(INITIAL_DB_DIR, file);
      await runSqlFile(client, filePath, file);
      // Salva hash per ogni file
      const fileHash = await getFileHash(filePath);
      await saveSeedHash(client, file, fileHash);
    }
    console.log('[INFO] Seeding COMPLETATO per tutti i file.');
  } catch (err) {
    console.error('[ERROR] Errore durante il seeding:', err.message);
  } finally {
    await client.end();
  }
}

main().catch(err => console.error('[ERROR] Errore non gestito:', err.message));
