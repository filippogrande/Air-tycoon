// Sistema di migrazioni semplice e affidabile per Air Tycoon 2
const fs = require('fs');
const path = require('path');
const db = require('../server/database');

class MigrationSystem {
    constructor() {
        this.migrationsDir = path.join(__dirname, 'migrations');
        this.tableName = 'migration_history';
    }

    // Inizializza il sistema di migrazioni
    async initialize() {
        console.log('🔧 Inizializzazione sistema migrazioni...');
        
        // Crea la tabella di tracking se non esiste
        await this.createMigrationTable();
        
        // Crea la directory migrations se non esiste
        if (!fs.existsSync(this.migrationsDir)) {
            fs.mkdirSync(this.migrationsDir, { recursive: true });
            console.log('📁 Creata directory migrations');
        }
        
        console.log('✅ Sistema migrazioni inizializzato');
    }

    // Crea la tabella per tracciare le migrazioni
    async createMigrationTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id SERIAL PRIMARY KEY,
                version VARCHAR(20) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                execution_time_ms INTEGER,
                checksum VARCHAR(64),
                status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed'))
            );
            
            CREATE INDEX IF NOT EXISTS idx_migration_history_version ON ${this.tableName}(version);
            CREATE INDEX IF NOT EXISTS idx_migration_history_executed_at ON ${this.tableName}(executed_at);
        `;
        
        await db.query(sql);
    }

    // Ottiene lista delle migrazioni eseguite
    async getExecutedMigrations() {
        const result = await db.query(
            `SELECT version FROM ${this.tableName} WHERE status = 'completed' ORDER BY version`
        );
        return result.rows.map(row => row.version);
    }

    // Ottiene lista delle migrazioni disponibili
    getAvailableMigrations() {
        if (!fs.existsSync(this.migrationsDir)) {
            return [];
        }

        return fs.readdirSync(this.migrationsDir)
            .filter(file => file.match(/^\d{4}_.*\.sql$/))
            .sort()
            .map(file => ({
                version: file.replace('.sql', ''),
                filename: file,
                path: path.join(this.migrationsDir, file)
            }));
    }

    // Calcola checksum di un file
    calculateChecksum(content) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    // Esegue tutte le migrazioni pendenti
    async runPendingMigrations() {
        await this.initialize();
        
        const executed = await this.getExecutedMigrations();
        const available = this.getAvailableMigrations();
        
        const pending = available.filter(migration => !executed.includes(migration.version));
        
        if (pending.length === 0) {
            console.log('✅ Nessuna migrazione pendente');
            return;
        }
        
        console.log(`📋 Trovate ${pending.length} migrazioni pendenti:`);
        pending.forEach(m => console.log(`  - ${m.version}`));
        
        for (const migration of pending) {
            await this.executeMigration(migration);
        }
        
        console.log('🎉 Tutte le migrazioni completate');
    }

    // Esegue una singola migrazione
    async executeMigration(migration) {
        const startTime = Date.now();
        
        try {
            console.log(`🔄 Eseguendo migrazione: ${migration.version}`);
            
            const sql = fs.readFileSync(migration.path, 'utf8');
            const checksum = this.calculateChecksum(sql);
            
            // Esegui in transazione
            await db.query('BEGIN');
            
            // Esegui la migrazione
            await db.query(sql);
            
            // Registra l'esecuzione
            const executionTime = Date.now() - startTime;
            await db.query(`
                INSERT INTO ${this.tableName} (version, name, execution_time_ms, checksum, status)
                VALUES ($1, $2, $3, $4, 'completed')
            `, [migration.version, migration.filename, executionTime, checksum]);
            
            await db.query('COMMIT');
            
            console.log(`✅ Migrazione ${migration.version} completata in ${executionTime}ms`);
            
        } catch (error) {
            await db.query('ROLLBACK');
            
            // Registra l'errore
            const executionTime = Date.now() - startTime;
            await db.query(`
                INSERT INTO ${this.tableName} (version, name, execution_time_ms, status)
                VALUES ($1, $2, $3, 'failed')
            `, [migration.version, migration.filename, executionTime]);
            
            console.error(`❌ Migrazione ${migration.version} fallita:`, error.message);
            throw error;
        }
    }

    // Crea una nuova migrazione
    async createMigration(name) {
        if (!name) {
            throw new Error('Nome migrazione richiesto');
        }
        
        // Genera numero progressivo
        const existing = this.getAvailableMigrations();
        const nextNumber = existing.length > 0 
            ? Math.max(...existing.map(m => parseInt(m.version.split('_')[0]))) + 1
            : 1;
        
        const version = nextNumber.toString().padStart(4, '0');
        const filename = `${version}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sql`;
        const filePath = path.join(this.migrationsDir, filename);
        
        // Template base per la migrazione
        const template = `-- Migrazione ${version}: ${name}
-- Data: ${new Date().toISOString().split('T')[0]}
-- 
-- Descrizione: ${name}
-- 
-- ATTENZIONE: Questa migrazione viene eseguita automaticamente all'avvio del server
-- Testare sempre in ambiente di sviluppo prima del deploy in produzione

-- ==================================================
-- INIZIO MIGRAZIONE
-- ==================================================

-- Esempio: Aggiunta di una nuova colonna
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Esempio: Creazione di una nuova tabella
-- CREATE TABLE IF NOT EXISTS user_preferences (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     preference_key VARCHAR(255) NOT NULL,
--     preference_value TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, preference_key)
-- );

-- Esempio: Creazione di indici
-- CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
-- CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Esempio: Inserimento di dati di default
-- INSERT INTO system_settings (key, value, description) 
-- VALUES ('maintenance_mode', 'false', 'Modalità manutenzione sistema') 
-- ON CONFLICT (key) DO NOTHING;

-- ==================================================
-- TODO: SOSTITUIRE CON IL CODICE DELLA MIGRAZIONE
-- ==================================================

-- Placeholder per confermare che la migrazione è stata eseguita
SELECT 'Migrazione ${version} - ${name} - COMPLETATA' as status;

-- ==================================================
-- FINE MIGRAZIONE
-- ==================================================
`;
        
        fs.writeFileSync(filePath, template);
        
        console.log(`✅ Creata migrazione: ${filename}`);
        console.log(`📝 File: ${filePath}`);
        console.log(`🔧 Modifica il file e aggiungi il tuo codice SQL`);
        
        return {
            version,
            filename,
            path: filePath
        };
    }

    // Stato delle migrazioni
    async status() {
        await this.initialize();
        
        const executed = await this.getExecutedMigrations();
        const available = this.getAvailableMigrations();
        const pending = available.filter(m => !executed.includes(m.version));
        
        console.log('\n📊 Stato Migrazioni:');
        console.log(`  📁 Directory: ${this.migrationsDir}`);
        console.log(`  ✅ Eseguite: ${executed.length}`);
        console.log(`  ⏳ Pendenti: ${pending.length}`);
        console.log(`  📄 Totali: ${available.length}`);
        
        if (pending.length > 0) {
            console.log('\n⏳ Migrazioni pendenti:');
            pending.forEach(m => console.log(`  - ${m.version}`));
        }
        
        if (executed.length > 0) {
            console.log('\n✅ Migrazioni eseguite:');
            executed.forEach(v => console.log(`  - ${v}`));
        }
        
        return { executed: executed.length, pending: pending.length, total: available.length };
    }
}

module.exports = MigrationSystem;
