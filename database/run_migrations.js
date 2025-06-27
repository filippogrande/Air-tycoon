#!/usr/bin/env node

/**
 * Script per eseguire migrazioni database in produzione
 * 
 * Usage:
 * node run_migrations.js --env production --backup
 * node run_migrations.js --env development --dry-run
 * node run_migrations.js --rollback 005
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

class MigrationRunner {
    constructor(config) {
        this.config = config;
        this.client = new Client(config.database);
        this.migrationsDir = path.join(__dirname, 'migrations');
    }

    async connect() {
        await this.client.connect();
        console.log('✅ Connesso al database');
    }

    async disconnect() {
        await this.client.end();
        console.log('✅ Disconnesso dal database');
    }

    async ensureMigrationTracker() {
        try {
            const trackerSQL = fs.readFileSync(
                path.join(this.migrationsDir, 'migration_tracker.sql'), 
                'utf8'
            );
            await this.client.query(trackerSQL);
            console.log('✅ Sistema di tracking migrazioni pronto');
        } catch (error) {
            console.error('❌ Errore inizializzazione tracker:', error.message);
            throw error;
        }
    }

    async createBackup() {
        if (!this.config.backup) return;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `backup_${timestamp}.sql`;
        
        console.log(`📦 Creazione backup: ${backupFile}`);
        
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        try {
            const cmd = `pg_dump ${this.config.database.connectionString} > ${backupFile}`;
            await execAsync(cmd);
            console.log(`✅ Backup creato: ${backupFile}`);
            return backupFile;
        } catch (error) {
            console.error('❌ Errore creazione backup:', error.message);
            throw error;
        }
    }

    async getPendingMigrations() {
        // Leggi tutti i file di migrazione
        const files = fs.readdirSync(this.migrationsDir)
            .filter(f => f.match(/^\d{3}_.*\.sql$/))
            .sort();

        const pending = [];

        for (const file of files) {
            const number = parseInt(file.substring(0, 3));
            
            const result = await this.client.query(
                'SELECT is_migration_completed($1) as completed',
                [number]
            );
            
            if (!result.rows[0].completed) {
                pending.push({
                    number,
                    file,
                    path: path.join(this.migrationsDir, file)
                });
            }
        }

        return pending;
    }

    async runMigration(migration, dryRun = false) {
        const startTime = Date.now();
        
        console.log(`🔄 ${dryRun ? '[DRY RUN] ' : ''}Esecuzione migrazione ${migration.number}: ${migration.file}`);
        
        try {
            const sql = fs.readFileSync(migration.path, 'utf8');
            
            if (dryRun) {
                console.log('📝 SQL da eseguire:');
                console.log(sql.substring(0, 500) + '...');
                return;
            }

            // Esegui in transazione
            await this.client.query('BEGIN');
            
            try {
                await this.client.query(sql);
                
                const executionTime = Date.now() - startTime;
                
                // Registra migrazione completata
                await this.client.query(
                    'SELECT register_migration($1, $2, $3)',
                    [migration.number, migration.file, executionTime]
                );
                
                await this.client.query('COMMIT');
                
                console.log(`✅ Migrazione ${migration.number} completata in ${executionTime}ms`);
                
            } catch (error) {
                await this.client.query('ROLLBACK');
                throw error;
            }
            
        } catch (error) {
            console.error(`❌ Errore migrazione ${migration.number}:`, error.message);
            
            // Segna come fallita
            await this.client.query(
                'INSERT INTO schema_migrations (migration_number, migration_name, status) VALUES ($1, $2, $3) ON CONFLICT (migration_number) DO UPDATE SET status = $3',
                [migration.number, migration.file, 'failed']
            );
            
            throw error;
        }
    }

    async rollbackMigration(migrationNumber) {
        console.log(`🔄 Rollback migrazione ${migrationNumber}`);
        
        try {
            const result = await this.client.query(
                'SELECT rollback_sql FROM schema_migrations WHERE migration_number = $1 AND status = $2',
                [migrationNumber, 'completed']
            );
            
            if (result.rows.length === 0) {
                throw new Error(`Migrazione ${migrationNumber} non trovata o non completata`);
            }
            
            const rollbackSQL = result.rows[0].rollback_sql;
            if (!rollbackSQL) {
                throw new Error(`Nessun SQL di rollback disponibile per migrazione ${migrationNumber}`);
            }
            
            await this.client.query('BEGIN');
            
            try {
                await this.client.query(rollbackSQL);
                
                // Segna come rollback
                await this.client.query(
                    'UPDATE schema_migrations SET status = $1 WHERE migration_number = $2',
                    ['rolled_back', migrationNumber]
                );
                
                await this.client.query('COMMIT');
                
                console.log(`✅ Rollback migrazione ${migrationNumber} completato`);
                
            } catch (error) {
                await this.client.query('ROLLBACK');
                throw error;
            }
            
        } catch (error) {
            console.error(`❌ Errore rollback migrazione ${migrationNumber}:`, error.message);
            throw error;
        }
    }

    async showStatus() {
        const result = await this.client.query(`
            SELECT 
                migration_number,
                migration_name,
                status,
                executed_at,
                execution_time_ms
            FROM schema_migrations 
            ORDER BY migration_number
        `);
        
        console.log('\n📊 Status Migrazioni:');
        console.log('┌─────┬──────────────────────────────┬────────────┬─────────────────────┬──────────┐');
        console.log('│ #   │ Nome                         │ Status     │ Eseguita il         │ Tempo    │');
        console.log('├─────┼──────────────────────────────┼────────────┼─────────────────────┼──────────┤');
        
        for (const row of result.rows) {
            const num = row.migration_number.toString().padStart(3, '0');
            const name = row.migration_name.substring(0, 28).padEnd(28);
            const status = row.status.padEnd(10);
            const date = row.executed_at ? new Date(row.executed_at).toLocaleString('it-IT').substring(0, 19) : '-'.padEnd(19);
            const time = row.execution_time_ms ? `${row.execution_time_ms}ms`.padEnd(8) : '-'.padEnd(8);
            
            console.log(`│ ${num} │ ${name} │ ${status} │ ${date} │ ${time} │`);
        }
        
        console.log('└─────┴──────────────────────────────┴────────────┴─────────────────────┴──────────┘\n');
    }

    async run(options = {}) {
        try {
            await this.connect();
            await this.ensureMigrationTracker();
            
            if (options.status) {
                await this.showStatus();
                return;
            }
            
            if (options.rollback) {
                await this.rollbackMigration(options.rollback);
                return;
            }
            
            const pending = await this.getPendingMigrations();
            
            if (pending.length === 0) {
                console.log('✅ Nessuna migrazione in sospeso');
                await this.showStatus();
                return;
            }
            
            console.log(`📋 Trovate ${pending.length} migrazioni in sospeso:`);
            pending.forEach(m => console.log(`  - ${m.number}: ${m.file}`));
            
            if (options.backup) {
                await this.createBackup();
            }
            
            for (const migration of pending) {
                await this.runMigration(migration, options.dryRun);
            }
            
            if (!options.dryRun) {
                console.log('🎉 Tutte le migrazioni completate con successo!');
                await this.showStatus();
            }
            
        } finally {
            await this.disconnect();
        }
    }
}

// Configurazioni per diversi ambienti
const configs = {
    development: {
        database: {
            host: 'localhost',
            port: 5432,
            database: 'air_tycoon_dev',
            user: 'postgres',
            password: 'postgres'
        },
        backup: false
    },
    
    production: {
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'air_tycoon',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD
        },
        backup: true
    }
};

// Parser argomenti command line
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        env: 'development',
        dryRun: false,
        backup: false,
        status: false,
        rollback: null
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--env':
                options.env = args[++i];
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--backup':
                options.backup = true;
                break;
            case '--status':
                options.status = true;
                break;
            case '--rollback':
                options.rollback = parseInt(args[++i]);
                break;
        }
    }
    
    return options;
}

// Main execution
async function main() {
    const options = parseArgs();
    const config = configs[options.env];
    
    if (!config) {
        console.error(`❌ Ambiente sconosciuto: ${options.env}`);
        process.exit(1);
    }
    
    // Override backup se specificato negli argomenti
    if (options.backup) {
        config.backup = true;
    }
    
    console.log(`🚀 Avvio migrazioni - Ambiente: ${options.env}`);
    
    const runner = new MigrationRunner(config);
    
    try {
        await runner.run(options);
    } catch (error) {
        console.error('💥 Errore durante le migrazioni:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = MigrationRunner;
