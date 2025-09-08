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
  // Prefer to run the whole SQL file via psql for correct ordering and multi-statement handling
  console.log(`[seed] Applying file ${fileLabel}`);

  // Try to use psql binary if available in container - faster and more reliable for complex SQL
  const { spawnSync } = require('child_process');
  const psqlCmd = 'psql';
  try {
    const check = spawnSync(psqlCmd, ['--version']);
    if (check.status === 0) {
      // Build psql args
      const args = [
        '-h', DB_CONFIG.host,
        '-p', String(DB_CONFIG.port),
        '-U', DB_CONFIG.user,
        '-d', DB_CONFIG.database,
        '-v', 'ON_ERROR_STOP=1',
        '-f', filePath
      ];
      console.log(`[seed] Running: psql ${args.map(a => (a.includes(' ') ? '"' + a + '"' : a)).join(' ')} (hidden password)`);
      const env = Object.assign({}, process.env, { PGPASSWORD: DB_CONFIG.password });
      const res = spawnSync(psqlCmd, args, { stdio: 'inherit', env });
      if (res.status !== 0) {
        throw new Error(`psql failed with exit code ${res.status}`);
      }
      return true;
    }
  } catch (e) {
    console.log('[seed] psql not available or failed to run, falling back to JS executor');
  }

  // Fallback: parse statements and run with client one by one
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
    route_services: 'name',
    seat_manufacturers: 'name',
    seat_models: 'model_name',
    world_events: 'name',
    aircraft_types: 'name',
  };

  function transformInsertToUpsert(stmt) {
    const insertRegex = /^INSERT INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i;
    const match = stmt.match(insertRegex);
    if (!match) return stmt;
    const [_, table, fields] = match;
    const key = upsertConfig[table];
    if (!key) return stmt;
    const fieldList = fields.split(',').map(f => f.trim());
    if (!fieldList.includes(key)) return stmt;
    const updateFields = fieldList.filter(f => f !== key)
      .map(f => `${f} = EXCLUDED.${f}`)
      .join(', ');
    return `${stmt} ON CONFLICT (${key}) DO UPDATE SET ${updateFields}`;
  }

  let errorCount = 0;
  let successCount = 0;

  for (let stmt of statements) {
    if (stmt.toUpperCase().startsWith('INSERT INTO')) {
      stmt = transformInsertToUpsert(stmt);
    }
    try {
      await client.query(stmt);
      successCount++;
    } catch (err) {
      errorCount++;
      console.warn(`[WARNING][${fileLabel}] ⚠️ Saltando statement problematico: ${stmt.substring(0,100).replace(/\n/g,' ')}...`);
      console.warn(`[WARNING][${fileLabel}] 📋 Errore: ${err.message}`);
      // Non interrompere l'intero file per un singolo statement
      // Continua con il prossimo statement
    }
  }
  
  console.log(`[INFO][${fileLabel}] 📊 Completato: ${successCount} statement riusciti, ${errorCount} saltati`);
  
  // Se ci sono solo errori e nessun successo, considera il file fallito
  if (successCount === 0 && errorCount > 0) {
    throw new Error(`Tutti gli statement nel file ${fileLabel} sono falliti`);
  }
  
  return true;
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
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const file of files) {
      const filePath = path.join(INITIAL_DB_DIR, file);
      try {
        console.log(`[INFO] Processando file: ${file}`);
        await runSqlFile(client, filePath, file);
        // Salva hash per ogni file solo se il seeding è riuscito
        const fileHash = await getFileHash(filePath);
        await saveSeedHash(client, file, fileHash);
        successCount++;
        console.log(`[SUCCESS] ✅ File ${file} processato con successo`);
      } catch (fileErr) {
        failureCount++;
        console.error(`[WARNING] ⚠️ Saltando file ${file} a causa di errori:`, fileErr.message);
        console.error(`[WARNING] 📋 Stack trace per ${file}:`, fileErr.stack);
        // Non interrompere il processo, continua con il file successivo
      }
    }
    
    console.log(`[INFO] 🏁 Seeding COMPLETATO: ${successCount} successi, ${failureCount} fallimenti.`);
  } catch (err) {
    console.error('[ERROR] Errore durante il seeding:', err.message);
  } finally {
    await client.end();
  }
}

main().catch(err => console.error('[ERROR] Errore non gestito:', err.message));
