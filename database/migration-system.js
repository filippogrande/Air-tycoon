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
        try {
            const sql = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id SERIAL PRIMARY KEY,
                    version VARCHAR(10) NOT NULL UNIQUE,
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
            console.log('✅ Tabella migration_history creata/verificata');
        } catch (error) {
            console.error('❌ Errore creazione tabella migration_history:', error.message);
            throw error;
        }
    }

    // Ottiene lista delle migrazioni eseguite
    async getExecutedMigrations() {
        try {
            const result = await db.query(
                `SELECT version FROM ${this.tableName} WHERE status = 'completed' ORDER BY version`
            );
            return result.rows.map(row => row.version);
        } catch (error) {
            console.error('❌ Errore recupero migrazioni eseguite:', error.message);
            // Se la tabella non esiste, ritorna array vuoto
            if (error.code === '42P01') {
                console.log('📋 Tabella migration_history non esiste, inizializzazione necessaria');
                return [];
            }
            throw error;
        }
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

    // Rimuove l'ultima riga failed dalla migration_history (se presente)
    async cleanupFailedMigration() {
        try {
            const res = await db.query(`
                SELECT id FROM ${this.tableName} WHERE status = 'failed' ORDER BY executed_at DESC, id DESC LIMIT 1
            `);
            if (res.rows.length > 0) {
                const failedId = res.rows[0].id;
                await db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [failedId]);
                console.log('🧹 Rimossa riga failed da migration_history (id=' + failedId + ')');
            }
        } catch (error) {
            console.error('⚠️ Errore pulizia migration_history:', error.message);
        }
    }

    // Esegue tutte le migrazioni pendenti
    async runPendingMigrations() {
        await this.initialize();
        // Pulizia automatica di eventuali migration failed
        await this.cleanupFailedMigration();
        
        // Verifica schema base prima delle migrazioni
        const hasBaseSchema = await this.checkBaseSchema();
        if (!hasBaseSchema) {
            throw new Error('Schema base mancante. Esegui prima il reset del database.');
        }
        
        const executed = await this.getExecutedMigrations();
        const available = this.getAvailableMigrations();
        
        // Confronta solo le versioni numeriche
        const pending = available.filter(migration => {
            const versionNumber = migration.version.split('_')[0];
            return !executed.includes(versionNumber);
        });
        
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
            
            // Estrai solo la versione numerica (es: "0001" da "0001_add_user_preferences")
            const versionNumber = migration.version.split('_')[0];
            
            // Esegui in transazione
            await db.query('BEGIN');
            
            // Esegui la migrazione
            await db.query(sql);
            
            // Registra l'esecuzione
            const executionTime = Date.now() - startTime;
            await db.query(`
                INSERT INTO ${this.tableName} (version, name, execution_time_ms, checksum, status)
                VALUES ($1, $2, $3, $4, 'completed')
                ON CONFLICT (version) DO UPDATE SET
                    name = EXCLUDED.name,
                    execution_time_ms = EXCLUDED.execution_time_ms,
                    checksum = EXCLUDED.checksum,
                    status = 'completed',
                    executed_at = CURRENT_TIMESTAMP
            `, [versionNumber, migration.filename, executionTime, checksum]);
            
            await db.query('COMMIT');
            
            console.log(`✅ Migrazione ${migration.version} completata in ${executionTime}ms`);
            
        } catch (error) {
            await db.query('ROLLBACK');
            
            // Registra l'errore solo se non esiste già un record per questa versione
            const executionTime = Date.now() - startTime;
            const versionNumber = migration.version.split('_')[0];
            
            try {
                await db.query(`
                    INSERT INTO ${this.tableName} (version, name, execution_time_ms, status)
                    VALUES ($1, $2, $3, 'failed')
                    ON CONFLICT (version) DO UPDATE SET
                        name = EXCLUDED.name,
                        execution_time_ms = EXCLUDED.execution_time_ms,
                        status = 'failed',
                        executed_at = CURRENT_TIMESTAMP
                `, [versionNumber, migration.filename, executionTime]);
            } catch (insertError) {
                console.error(`⚠️ Errore registrazione fallimento migrazione: ${insertError.message}`);
            }
            
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

    // Verifica se lo schema base esiste
    async checkBaseSchema() {
        try {
            const result = await db.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'companies')
            `);
            
            const existingTables = result.rows.map(row => row.table_name);
            
            if (existingTables.length === 0) {
                console.log('⚠️ Schema base non trovato!');
                console.log('📋 Esegui prima: bash database/reset_database.sh');
                return false;
            } else {
                console.log(`✅ Schema base verificato: ${existingTables.join(', ')}`);
                return true;
            }
        } catch (error) {
            console.error('❌ Errore verifica schema base:', error.message);
            return false;
        }
    }
}

module.exports = MigrationSystem;
