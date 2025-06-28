// Script di seeding automatico per initial_data.sql
// Esegue il seeding solo se il file è cambiato dall'ultimo avvio

const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const path = require('path');

// Configurazione DB (puoi sostituire con dotenv o config custom)
const DB_CONFIG = {
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'airtycoon',
  password: process.env.PGPASSWORD || '',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
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
  await client.query(sql);
}

async function main() {
  const fileName = path.basename(SQL_FILE);
  const fileHash = await getFileHash(SQL_FILE);

  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    await ensureSeedHistoryTable(client);
    const lastHash = await getLastSeedHash(client, fileName);
    if (lastHash === fileHash) {
      console.log(`[seed] ${fileName} già applicato, nessuna azione necessaria.`);
    } else {
      console.log(`[seed] Applico ${fileName}...`);
      await runSqlFile(client, SQL_FILE);
      await saveSeedHash(client, fileName, fileHash);
      console.log(`[seed] ${fileName} applicato con successo.`);
    }
  } catch (err) {
    console.error('[seed] Errore durante il seeding:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}
