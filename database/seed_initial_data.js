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

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // Divide in statement (grezzo, ma funziona per la maggior parte dei casi)
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  let totalChanged = 0;
  for (const stmt of statements) {
    try {
      const res = await client.query(stmt);
      // res.rowCount è definito solo per INSERT/UPDATE/DELETE
      if (typeof res.rowCount === 'number') {
        totalChanged += res.rowCount;
        console.log(`[seed] Query: ${stmt.substring(0, 60).replace(/\n/g, ' ')}... => ${res.rowCount} righe modificate`);
      } else {
        console.log(`[seed] Query: ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
      }
    } catch (err) {
      console.error(`[seed] Errore statement: ${stmt.substring(0, 60)}...`, err.message);
      throw err;
    }
  }
  return totalChanged;
}

async function main() {
  const fileName = path.basename(SQL_FILE);
  const fileHash = await getFileHash(SQL_FILE);

  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    await ensureSeedHistoryTable(client);
    // Esegui SEMPRE il seeding, anche se l'hash non cambia
    console.log(`[seed] Applico sempre ${fileName} (forzato)...`);
    const changed = await runSqlFile(client, SQL_FILE);
    await saveSeedHash(client, fileName, fileHash);
    if (changed > 0) {
      console.log(`[seed] ${fileName} applicato con successo. Righe modificate: ${changed}`);
    } else {
      console.log(`[seed] ${fileName} applicato. Nessuna modifica necessaria.`);
    }
  } catch (err) {
    console.error('[seed] Errore durante il seeding:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Esegui sempre il seeding anche se importato come modulo
main();
