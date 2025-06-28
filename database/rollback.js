#!/usr/bin/env node

/**
 * Sistema di Rollback Sicuro per Air Tycoon
 * 
 * Permette di annullare migrazioni con verifica di sicurezza
 * 
 * Usage:
 * node rollback.js --env production --migration 006 --confirm
 * node rollback.js --env staging --migration 005 --dry-run
 * node rollback.js --env production --to-checkpoint checkpoint_pre_migration_006_1640995200
 */

const { Client } = require('pg');
const fs = require('fs');

class SafeRollback {
    constructor(config) {
        this.config = config;
        this.client = new Client(config.database);
    }

    async connect() {
        await this.client.connect();
        console.log('✅ Connesso al database per rollback');
    }

    async disconnect() {
        await this.client.end();
    }

    async createEmergencyBackup() {
        console.log('📦 Creazione backup di emergenza pre-rollback...');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `emergency_backup_${this.config.env}_${timestamp}.sql`;
        
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        try {
            const connectionString = `postgresql://${this.config.database.user}:${this.config.database.password}@${this.config.database.host}:${this.config.database.port}/${this.config.database.database}`;
            const cmd = `pg_dump "${connectionString}" > ${backupFile}`;
            await execAsync(cmd);
            
            console.log(`✅ Backup di emergenza creato: ${backupFile}`);
            return backupFile;
        } catch (error) {
            console.error('❌ Errore creazione backup di emergenza:', error.message);
            throw error;
        }
    }

    async verifyRollbackSafety(migrationNumber) {
        console.log(`🔍 Verifica sicurezza rollback migrazione ${migrationNumber}...`);
        
        try {
            // Verifica che la migrazione esista e sia completata
            const result = await this.client.query(
                'SELECT migration_name, rollback_sql, status FROM schema_migrations WHERE migration_number = $1',
                [migrationNumber]
            );
            
            if (result.rows.length === 0) {
                throw new Error(`Migrazione ${migrationNumber} non trovata`);
            }
            
            const migration = result.rows[0];
            
            if (migration.status !== 'completed') {
                throw new Error(`Migrazione ${migrationNumber} non è completata (status: ${migration.status})`);
            }
            
            if (!migration.rollback_sql || migration.rollback_sql.trim() === '') {
                throw new Error(`Migrazione ${migrationNumber} non ha SQL di rollback disponibile`);
            }
            
            // Verifica che non ci siano migrazioni successive che dipendono da questa
            const laterMigrations = await this.client.query(
                'SELECT migration_number, migration_name FROM schema_migrations WHERE migration_number > $1 AND status = $2',
                [migrationNumber, 'completed']
            );
            
            if (laterMigrations.rows.length > 0) {
                console.log('⚠️  ATTENZIONE: Migrazioni successive trovate:');
                laterMigrations.rows.forEach(m => {
                    console.log(`   - ${m.migration_number}: ${m.migration_name}`);
                });
                console.log('   Queste potrebbero essere influenzate dal rollback.');
            }
            
            // Stima dell'impatto del rollback
            const impact = await this.estimateRollbackImpact(migration.rollback_sql);
            
            console.log(`📊 Stima impatto rollback:`);
            console.log(`   - Tabelle da modificare/eliminare: ${impact.tables.length}`);
            console.log(`   - Colonne da eliminare: ${impact.columns.length}`);
            console.log(`   - Funzioni da eliminare: ${impact.functions.length}`);
            console.log(`   - Possibile perdita dati: ${impact.dataLoss ? 'SÌ' : 'NO'}`);
            
            return {
                migration,
                laterMigrations: laterMigrations.rows,
                impact,
                safe: impact.dataLoss === false && laterMigrations.rows.length === 0
            };
            
        } catch (error) {
            console.error('❌ Errore verifica sicurezza:', error.message);
            throw error;
        }
    }

    async estimateRollbackImpact(rollbackSQL) {
        const sql = rollbackSQL.toLowerCase();
        
        // Analizza il SQL per determinare l'impatto
        const impact = {
            tables: [],
            columns: [],
            functions: [],
            dataLoss: false
        };
        
        // Cerca DROP TABLE
        const dropTableMatches = sql.match(/drop\s+table\s+(?:if\s+exists\s+)?(\w+)/g);
        if (dropTableMatches) {
            impact.tables = dropTableMatches.map(match => match.match(/(\w+)$/)[1]);
            impact.dataLoss = true; // DROP TABLE = perdita dati
        }
        
        // Cerca DROP COLUMN
        const dropColumnMatches = sql.match(/drop\s+column\s+(?:if\s+exists\s+)?(\w+)/g);
        if (dropColumnMatches) {
            impact.columns = dropColumnMatches.map(match => match.match(/(\w+)$/)[1]);
            impact.dataLoss = true; // DROP COLUMN = perdita dati
        }
        
        // Cerca DROP FUNCTION
        const dropFunctionMatches = sql.match(/drop\s+function\s+(?:if\s+exists\s+)?(\w+)/g);
        if (dropFunctionMatches) {
            impact.functions = dropFunctionMatches.map(match => match.match(/(\w+)$/)[1]);
        }
        
        // Altri pattern che indicano perdita dati
        if (sql.includes('delete from') || sql.includes('truncate')) {
            impact.dataLoss = true;
        }
        
        return impact;
    }

    async executeRollback(migrationNumber, rollbackSQL, dryRun = false) {
        console.log(`${dryRun ? '🔍 [DRY RUN] ' : '🔄 '}Esecuzione rollback migrazione ${migrationNumber}...`);
        
        if (dryRun) {
            console.log('📝 SQL di rollback:');
            console.log('---');
            console.log(rollbackSQL);
            console.log('---');
            return;
        }
        
        const startTime = Date.now();
        
        try {
            // Esegui rollback in transazione
            await this.client.query('BEGIN');
            
            try {
                // Esegui SQL di rollback
                await this.client.query(rollbackSQL);
                
                // Aggiorna status migrazione
                await this.client.query(
                    'UPDATE schema_migrations SET status = $1, executed_at = CURRENT_TIMESTAMP WHERE migration_number = $2',
                    ['rolled_back', migrationNumber]
                );
                
                await this.client.query('COMMIT');
                
                const executionTime = Date.now() - startTime;
                console.log(`✅ Rollback migrazione ${migrationNumber} completato in ${executionTime}ms`);
                
            } catch (error) {
                await this.client.query('ROLLBACK');
                throw error;
            }
            
        } catch (error) {
            console.error(`❌ Errore durante rollback migrazione ${migrationNumber}:`, error.message);
            
            // Segna come fallito
            await this.client.query(
                'UPDATE schema_migrations SET status = $1 WHERE migration_number = $2',
                ['failed', migrationNumber]
            );
            
            throw error;
        }
    }

    async rollbackToCheckpoint(checkpointName) {
        console.log(`🔄 Rollback a checkpoint: ${checkpointName}`);
        
        try {
            // Trova il checkpoint
            const result = await this.client.query(
                'SELECT * FROM schema_migrations WHERE migration_name = $1 AND migration_number = -1',
                [checkpointName]
            );
            
            if (result.rows.length === 0) {
                throw new Error(`Checkpoint ${checkpointName} non trovato`);
            }
            
            const checkpoint = result.rows[0];
            const checkpointTime = checkpoint.executed_at;
            
            // Trova tutte le migrazioni eseguite dopo il checkpoint
            const migrationsToRollback = await this.client.query(
                'SELECT migration_number, migration_name, rollback_sql FROM schema_migrations WHERE executed_at > $1 AND migration_number > 0 AND status = $2 ORDER BY migration_number DESC',
                [checkpointTime, 'completed']
            );
            
            if (migrationsToRollback.rows.length === 0) {
                console.log('✅ Nessuna migrazione da rollback dopo il checkpoint');
                return;
            }
            
            console.log(`📋 Migrazioni da rollback (${migrationsToRollback.rows.length}):`);
            migrationsToRollback.rows.forEach(m => {
                console.log(`   - ${m.migration_number}: ${m.migration_name}`);
            });
            
            // Esegui rollback in ordine inverso
            for (const migration of migrationsToRollback.rows) {
                if (!migration.rollback_sql) {
                    throw new Error(`Migrazione ${migration.migration_number} non ha SQL di rollback`);
                }
                
                await this.executeRollback(migration.migration_number, migration.rollback_sql);
            }
            
            console.log(`✅ Rollback a checkpoint ${checkpointName} completato`);
            
        } catch (error) {
            console.error('❌ Errore rollback a checkpoint:', error.message);
            throw error;
        }
    }

    async run(options) {
        try {
            await this.connect();
            
            if (this.config.env === 'production') {
                console.log('🚨 ATTENZIONE: ROLLBACK SU PRODUZIONE');
                console.log('Creazione backup di emergenza obbligatorio...');
                await this.createEmergencyBackup();
            }
            
            if (options.toCheckpoint) {
                await this.rollbackToCheckpoint(options.toCheckpoint);
            } else if (options.migration) {
                const safetyCheck = await this.verifyRollbackSafety(options.migration);
                
                if (!safetyCheck.safe && !options.force) {
                    console.log('⚠️  ROLLBACK NON SICURO');
                    
                    if (safetyCheck.impact.dataLoss) {
                        console.log('❌ Il rollback causerà PERDITA DI DATI');
                    }
                    
                    if (safetyCheck.laterMigrations.length > 0) {
                        console.log('❌ Migrazioni successive potrebbero essere influenzate');
                    }
                    
                    if (this.config.env === 'production') {
                        throw new Error('Rollback non sicuro bloccato in produzione. Usa --force se necessario.');
                    }
                }
                
                await this.executeRollback(
                    options.migration, 
                    safetyCheck.migration.rollback_sql, 
                    options.dryRun
                );
            }
            
            if (!options.dryRun) {
                // Verifica integrità post-rollback
                console.log('🔍 Verifica integrità post-rollback...');
                const MigrationVerifier = require('./verify_migrations');
                const verifier = new MigrationVerifier(this.config);
                await verifier.verifyDatabaseIntegrity();
                console.log('✅ Integrità database verificata');
            }
            
        } finally {
            await this.disconnect();
        }
    }
}

// Parser argomenti
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        env: 'development',
        migration: null,
        toCheckpoint: null,
        dryRun: false,
        force: false,
        confirm: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--env':
                options.env = args[++i];
                break;
            case '--migration':
                options.migration = parseInt(args[++i]);
                break;
            case '--to-checkpoint':
                options.toCheckpoint = args[++i];
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--force':
                options.force = true;
                break;
            case '--confirm':
                options.confirm = true;
                break;
        }
    }
    
    return options;
}

// Main execution
async function main() {
    const options = parseArgs();
    
    if (!options.migration && !options.toCheckpoint) {
        console.error('❌ Specificare --migration N o --to-checkpoint nome');
        process.exit(1);
    }
    
    // Configurazioni (stesse degli altri script)
    const configs = {
        development: {
            env: 'development',
            database: {
                host: 'localhost',
                port: 5432,
                database: 'air_tycoon_dev',
                user: 'postgres',
                password: 'postgres'
            }
        },
        production: {
            env: 'production',
            database: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            }
        }
    };
    
    const config = configs[options.env];
    if (!config) {
        console.error(`❌ Ambiente sconosciuto: ${options.env}`);
        process.exit(1);
    }
    
    // Conferma per produzione
    if (options.env === 'production' && !options.confirm && !options.dryRun) {
        console.error('❌ Rollback in produzione richiede --confirm');
        process.exit(1);
    }
    
    const rollback = new SafeRollback(config);
    await rollback.run(options);
    
    console.log('🎉 Rollback completato');
}

if (require.main === module) {
    main().catch(error => {
        console.error('💥 Errore durante rollback:', error.message);
        process.exit(1);
    });
}

module.exports = SafeRollback;
