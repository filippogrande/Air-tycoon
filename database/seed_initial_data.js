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
  // Log: conta aeroporti prima
  let beforeAirports = 0;
  try {
    const res = await client.query('SELECT COUNT(*) FROM airports');
    beforeAirports = parseInt(res.rows[0].count, 10);
    console.log(`[DEBUG] Aeroporti PRIMA del seeding: ${beforeAirports}`);
  } catch (e) {
    console.log('[DEBUG] Impossibile contare aeroporti prima del seeding:', e.message);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  // Divide in statement (più robusto: split su ogni punto e virgola)
  const statements = sql
    .split(/;/)
    .map(s => s.trim())
    .filter(s => s.length > 0); // Non scartare statement che iniziano con commenti

  // Mappa tabella => chiave unica (puoi estendere qui)
  const upsertConfig = {
    airports: 'iata_code',
    companies: 'id', // Sostituisci con la chiave unica reale se diversa
    // Aggiungi altre tabelle e chiavi se necessario
  };

  function transformInsertToUpsert(stmt) {
    // Match base: INSERT INTO <table> (<fields>) VALUES (<values>)
    const insertRegex = /^INSERT INTO ([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i;
    const match = stmt.match(insertRegex);
    if (!match) return stmt;
    const [_, table, fields, values] = match;
    const key = upsertConfig[table];
    if (!key) return stmt; // Tabella non supportata
    const fieldList = fields.split(',').map(f => f.trim());
    // Se la chiave non è tra i campi, non trasformare
    if (!fieldList.includes(key)) return stmt;
    // Costruisci la parte DO UPDATE per tutti i campi tranne la chiave
    const updateFields = fieldList.filter(f => f !== key)
      .map(f => `${f} = EXCLUDED.${f}`)
      .join(', ');
    return `${stmt} ON CONFLICT (${key}) DO UPDATE SET ${updateFields}`;
  }

  let totalChanged = 0;
  for (let stmt of statements) {
    // Logga sempre ogni statement, anche se non è INSERT/UPDATE/DELETE
    const preview = stmt.substring(0, 200).replace(/\n/g, ' ');
    console.log(`[DEBUG] Statement: ${preview}`);
    // Trasforma INSERT in upsert se necessario
    if (stmt.startsWith('INSERT INTO')) {
      stmt = transformInsertToUpsert(stmt);
    }
    try {
      const res = await client.query(stmt);
      if (typeof res.rowCount === 'number') {
        totalChanged += res.rowCount;
        console.log(`[DEBUG] Risultato: ${res.rowCount} righe modificate`);
      } else {
        console.log(`[DEBUG] Risultato: nessun rowCount`);
      }
    } catch (err) {
      console.error(`[DEBUG] Errore statement: ${preview}`, err.message);
    }
  }

  // Log: conta aeroporti dopo
  let afterAirports = 0;
  try {
    const res = await client.query('SELECT COUNT(*) FROM airports');
    afterAirports = parseInt(res.rows[0].count, 10);
    console.log(`[DEBUG] Aeroporti DOPO il seeding: ${afterAirports}`);
  } catch (e) {
    console.log('[DEBUG] Impossibile contare aeroporti dopo del seeding:', e.message);
  }

  console.log(`[INFO] Seeding completato: ${totalChanged} righe modificate`);
}

async function main() {
  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    await ensureSeedHistoryTable(client);
    // Esegui SEMPRE il seeding, anche se il file è invariato
    console.log('[INFO] Eseguo sempre il seeding, anche se il file non cambia...');
    await runSqlFile(client, SQL_FILE);
    // Salva comunque l'hash per tracciare la storia
    const fileHash = await getFileHash(SQL_FILE);
    await saveSeedHash(client, 'initial_data.sql', fileHash);
    console.log('[INFO] Seeding completato e hash salvato');
  } catch (err) {
    console.error('[ERROR] Errore durante il seeding:', err.message);
  } finally {
    await client.end();
  }
}

main().catch(err => console.error('[ERROR] Errore non gestito:', err.message));
