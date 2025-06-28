// Auto-migration runner per avvio server
const fs = require('fs');
const path = require('path');
const db = require('./database');

/**
 * Esegue automaticamente le migrazioni pendenti all'avvio del server
 */
async function runPendingMigrations() {
    try {
        console.log('🔄 Controllo migrazioni pendenti...');
        
        // Assicurati che il tracker delle migrazioni esista
        await ensureMigrationTracker();
        
        // Ottieni migrazioni eseguite
        const executedMigrations = await getExecutedMigrations();
        
        // Ottieni migrazioni disponibili
        const availableMigrations = await getAvailableMigrations();
        
        // Trova migrazioni pendenti
        const pendingMigrations = availableMigrations.filter(
            migration => !executedMigrations.includes(migration.id)
        );
        
        if (pendingMigrations.length === 0) {
            console.log('✅ Nessuna migrazione pendente');
            return;
        }
        
        console.log(`📋 Trovate ${pendingMigrations.length} migrazioni pendenti:`, 
                   pendingMigrations.map(m => m.id).join(', '));
        
        // Esegui migrazioni pendenti
        for (const migration of pendingMigrations) {
            await executeMigration(migration);
        }
        
        console.log('✅ Tutte le migrazioni eseguite con successo');
        
    } catch (error) {
        console.error('❌ Errore durante l\'esecuzione delle migrazioni:', error);
        throw error;
    }
}

async function ensureMigrationTracker() {
    const trackerPath = path.join(__dirname, '../database/migrations/migration_tracker.sql');
    
    if (!fs.existsSync(trackerPath)) {
        console.warn('⚠️ File migration_tracker.sql non trovato, lo creo...');
        
        const trackerSQL = `
CREATE TABLE IF NOT EXISTS migration_tracker (
    id SERIAL PRIMARY KEY,
    migration_id VARCHAR(50) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_migration_tracker_id ON migration_tracker(migration_id);
`;
        
        fs.writeFileSync(trackerPath, trackerSQL);
    }
    
    const trackerSQL = fs.readFileSync(trackerPath, 'utf8');
    await db.query(trackerSQL);
}

async function getExecutedMigrations() {
    // Prova prima con schema_migrations (formato esistente)
    try {
        const result = await db.query(
            'SELECT migration_name FROM schema_migrations WHERE status = $1 ORDER BY executed_at',
            ['completed']
        );
        return result.rows.map(row => row.migration_name);
    } catch (error) {
        // Se non esiste, prova con migration_tracker (nuovo formato)
        try {
            const result = await db.query(
                'SELECT migration_id FROM migration_tracker WHERE status = $1 ORDER BY executed_at',
                ['success']
            );
            return result.rows.map(row => row.migration_id);
        } catch (error2) {
            // Se nessuna tabella esiste, ritorna array vuoto
            console.log('📋 Nessuna tabella di tracking migrazioni trovata, sarà creata automaticamente');
            return [];
        }
    }
}

async function getAvailableMigrations() {
    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
        console.warn('⚠️ Directory migrations non trovata');
        return [];
    }
    
    const files = fs.readdirSync(migrationsDir)
        .filter(file => file.match(/^\d{3}_.*\.sql$/))
        .sort();
    
    return files.map(file => ({
        id: file.replace('.sql', ''),
        filename: file,
        path: path.join(migrationsDir, file)
    }));
}

async function executeMigration(migration) {
    const startTime = Date.now();
    
    try {
        console.log(`🔄 Eseguendo migrazione: ${migration.id}`);
        
        const sql = fs.readFileSync(migration.path, 'utf8');
        
        // Inizia transazione
        await db.query('BEGIN');
        
        // Esegui la migrazione
        await db.query(sql);
        
        // Registra nell'tracker (usa il sistema esistente se disponibile)
        const executionTime = Date.now() - startTime;
        
        try {
            // Prova prima con schema_migrations (sistema esistente)
            const migrationNumber = parseInt(migration.id.split('_')[0]);
            await db.query(`
                INSERT INTO schema_migrations (migration_number, migration_name, execution_time_ms, status)
                VALUES ($1, $2, $3, $4)
            `, [migrationNumber, migration.id, executionTime, 'completed']);
        } catch (error) {
            // Se fallisce, usa migration_tracker (nuovo sistema)
            await db.query(`
                INSERT INTO migration_tracker (migration_id, execution_time_ms, status)
                VALUES ($1, $2, $3)
            `, [migration.id, executionTime, 'success']);
        }
        
        // Commit
        await db.query('COMMIT');
        
        console.log(`✅ Migrazione ${migration.id} completata in ${executionTime}ms`);
        
    } catch (error) {
        // Rollback in caso di errore
        await db.query('ROLLBACK');
        
        // Registra l'errore (compatibile con entrambi i sistemi)
        const executionTime = Date.now() - startTime;
        
        try {
            // Prova prima con schema_migrations
            const migrationNumber = parseInt(migration.id.split('_')[0]);
            await db.query(`
                INSERT INTO schema_migrations (migration_number, migration_name, execution_time_ms, status)
                VALUES ($1, $2, $3, $4)
            `, [migrationNumber, migration.id, executionTime, 'failed']);
        } catch (errorLog) {
            // Se fallisce, usa migration_tracker
            await db.query(`
                INSERT INTO migration_tracker (migration_id, execution_time_ms, status, error_message)
                VALUES ($1, $2, $3, $4)
            `, [migration.id, executionTime, 'failed', error.message]);
        }
        
        console.error(`❌ Migrazione ${migration.id} fallita:`, error.message);
        throw error;
    }
}

module.exports = {
    runPendingMigrations
};
