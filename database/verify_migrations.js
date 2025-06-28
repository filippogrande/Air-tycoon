#!/usr/bin/env node

/**
 * Script di verifica post-migrazione per Air Tycoon
 * 
 * Esegue una serie completa di test per garantire che:
 * 1. Tutte le migrazioni siano state applicate correttamente
 * 2. L'integrità del database sia mantenuta
 * 3. I dati esistenti non siano stati corrotti
 * 4. Le funzionalità critiche funzionino
 * 
 * Usage:
 * node verify_migrations.js --env production
 * node verify_migrations.js --env staging --detailed
 * node verify_migrations.js --env development --fix-issues
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

class MigrationVerifier {
    constructor(config) {
        this.config = config;
        this.client = new Client(config.database);
        this.errors = [];
        this.warnings = [];
        this.passed = [];
    }

    async connect() {
        await this.client.connect();
        console.log('✅ Connesso al database per verifica');
    }

    async disconnect() {
        await this.client.end();
    }

    log(level, message, details = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, details };
        
        switch (level) {
            case 'error':
                this.errors.push(logEntry);
                console.log('❌', message);
                break;
            case 'warning':
                this.warnings.push(logEntry);
                console.log('⚠️ ', message);
                break;
            case 'success':
                this.passed.push(logEntry);
                console.log('✅', message);
                break;
            case 'info':
                console.log('ℹ️ ', message);
                break;
        }
        
        if (details && this.config.detailed) {
            console.log('   ', details);
        }
    }

    async verifyMigrationCompleteness() {
        this.log('info', 'Verifica completezza migrazioni...');
        
        try {
            // Ottieni lista migrazioni dal filesystem
            const migrationsDir = path.join(__dirname, 'migrations');
            const migrationFiles = fs.readdirSync(migrationsDir)
                .filter(f => f.match(/^\d{3}_.*\.sql$/))
                .map(f => parseInt(f.substring(0, 3)))
                .sort((a, b) => a - b);
            
            // Ottieni migrazioni eseguite dal database
            const result = await this.client.query(`
                SELECT migration_number, status, executed_at 
                FROM schema_migrations 
                WHERE migration_number > 0
                ORDER BY migration_number
            `);
            
            const executedMigrations = result.rows.map(r => ({
                number: r.migration_number,
                status: r.status,
                executed_at: r.executed_at
            }));
            
            // Verifica che tutte le migrazioni siano state eseguite
            const executedNumbers = executedMigrations.map(m => m.number);
            const missing = migrationFiles.filter(n => !executedNumbers.includes(n));
            const failed = executedMigrations.filter(m => m.status !== 'completed');
            
            if (missing.length > 0) {
                this.log('error', `Migrazioni mancanti: ${missing.join(', ')}`);
            }
            
            if (failed.length > 0) {
                this.log('error', `Migrazioni fallite: ${failed.map(f => f.number).join(', ')}`);
            }
            
            if (missing.length === 0 && failed.length === 0) {
                this.log('success', `Tutte le ${migrationFiles.length} migrazioni completate`);
            }
            
            return { missing, failed, total: migrationFiles.length, executed: executedNumbers.length };
            
        } catch (error) {
            this.log('error', 'Errore verifica migrazioni', error.message);
            throw error;
        }
    }

    async verifyDatabaseIntegrity() {
        this.log('info', 'Verifica integrità database...');
        
        try {
            const result = await this.client.query('SELECT * FROM verify_database_integrity()');
            
            for (const check of result.rows) {
                if (check.status === 'OK') {
                    this.log('success', `${check.check_name}: ${check.details}`);
                } else if (check.status === 'WARN') {
                    this.log('warning', `${check.check_name}: ${check.details}`);
                } else {
                    this.log('error', `${check.check_name}: ${check.details}`);
                }
            }
            
            return result.rows;
            
        } catch (error) {
            this.log('error', 'Errore verifica integrità', error.message);
            throw error;
        }
    }

    async runFunctionalTests() {
        this.log('info', 'Esecuzione test funzionali...');
        
        try {
            const result = await this.client.query('SELECT * FROM run_migration_tests()');
            
            for (const test of result.rows) {
                if (test.passed) {
                    this.log('success', `${test.test_name}: ${test.message}`);
                } else {
                    this.log('error', `${test.test_name}: ${test.message}`);
                }
            }
            
            return result.rows;
            
        } catch (error) {
            this.log('error', 'Errore test funzionali', error.message);
            throw error;
        }
    }

    async verifyDataConsistency() {
        this.log('info', 'Verifica consistenza dati...');
        
        const checks = [
            {
                name: 'companies_without_users',
                query: 'SELECT COUNT(*) as count FROM companies WHERE user_id IS NULL',
                expectZero: false,
                message: 'Compagnie senza utente'
            },
            {
                name: 'routes_without_aircraft',
                query: 'SELECT COUNT(*) as count FROM routes WHERE assigned_aircraft_id IS NULL AND status = \'active\'',
                expectZero: false,
                message: 'Rotte attive senza aeromobile'
            },
            {
                name: 'flights_without_routes',
                query: 'SELECT COUNT(*) as count FROM flights f LEFT JOIN routes r ON f.route_id = r.id WHERE r.id IS NULL',
                expectZero: true,
                message: 'Voli orfani senza rotta'
            },
            {
                name: 'negative_money',
                query: 'SELECT COUNT(*) as count FROM companies WHERE money < -1000000000',
                expectZero: true,
                message: 'Compagnie con debiti eccessivi'
            }
        ];
        
        for (const check of checks) {
            try {
                const result = await this.client.query(check.query);
                const count = parseInt(result.rows[0].count);
                
                if (check.expectZero && count > 0) {
                    this.log('error', `${check.message}: trovati ${count} record problematici`);
                } else if (!check.expectZero && count > 1000) {
                    this.log('warning', `${check.message}: ${count} record (verificare se normale)`);
                } else {
                    this.log('success', `${check.message}: ${count} record (OK)`);
                }
                
            } catch (error) {
                this.log('error', `Errore controllo ${check.name}`, error.message);
            }
        }
    }

    async checkPerformance() {
        this.log('info', 'Verifica performance database...');
        
        try {
            // Verifica indici mancanti su tabelle grandi
            const slowQueries = [
                {
                    name: 'routes_by_company',
                    query: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM routes WHERE company_id = $1 LIMIT 10',
                    params: ['550e8400-e29b-41d4-a716-446655440000']
                },
                {
                    name: 'flights_by_date',
                    query: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM flights WHERE departure_time > $1 LIMIT 10',
                    params: [new Date(Date.now() - 30*24*60*60*1000).toISOString()]
                }
            ];
            
            for (const query of slowQueries) {
                try {
                    const result = await this.client.query(query.query, query.params);
                    const plan = result.rows.map(r => r['QUERY PLAN']).join('\n');
                    
                    if (plan.includes('Seq Scan') && plan.includes('cost=')) {
                        const cost = plan.match(/cost=(\d+\.\d+)/)?.[1];
                        if (parseFloat(cost) > 1000) {
                            this.log('warning', `Query lenta ${query.name}: cost=${cost}`);
                        } else {
                            this.log('success', `Performance ${query.name}: OK (cost=${cost})`);
                        }
                    } else {
                        this.log('success', `Performance ${query.name}: utilizza indici`);
                    }
                    
                } catch (error) {
                    this.log('warning', `Non possibile testare performance ${query.name}`, error.message);
                }
            }
            
        } catch (error) {
            this.log('error', 'Errore verifica performance', error.message);
        }
    }

    async createVerificationReport() {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            environment: this.config.env,
            summary: {
                total_checks: this.passed.length + this.warnings.length + this.errors.length,
                passed: this.passed.length,
                warnings: this.warnings.length,
                errors: this.errors.length,
                success_rate: ((this.passed.length / (this.passed.length + this.warnings.length + this.errors.length)) * 100).toFixed(2)
            },
            details: {
                passed: this.passed,
                warnings: this.warnings,
                errors: this.errors
            }
        };
        
        // Salva report
        const reportFile = `verification_report_${this.config.env}_${timestamp.replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        
        console.log(`\n📊 Report verifica salvato: ${reportFile}`);
        
        return report;
    }

    async run(options = {}) {
        try {
            await this.connect();
            
            console.log(`🔍 Verifica migrazioni database - Ambiente: ${this.config.env}`);
            console.log('=' .repeat(60));
            
            // 1. Verifica completezza migrazioni
            await this.verifyMigrationCompleteness();
            
            // 2. Verifica integrità struttura
            await this.verifyDatabaseIntegrity();
            
            // 3. Test funzionali
            await this.runFunctionalTests();
            
            // 4. Consistenza dati
            await this.verifyDataConsistency();
            
            // 5. Performance (solo se richiesto)
            if (options.checkPerformance) {
                await this.checkPerformance();
            }
            
            // 6. Genera report
            const report = await this.createVerificationReport();
            
            console.log('\n📋 Riepilogo Verifica:');
            console.log(`✅ Successi: ${report.summary.passed}`);
            console.log(`⚠️  Avvisi: ${report.summary.warnings}`);
            console.log(`❌ Errori: ${report.summary.errors}`);
            console.log(`📊 Tasso successo: ${report.summary.success_rate}%`);
            
            if (this.errors.length > 0) {
                console.log('\n🚨 ATTENZIONE: Trovati errori critici!');
                console.log('Controllare il report per dettagli e azioni correttive.');
                process.exit(1);
            } else if (this.warnings.length > 0) {
                console.log('\n⚠️  Verifica completata con avvisi');
                console.log('Raccomandato controllare gli avvisi prima di procedere.');
                process.exit(2);
            } else {
                console.log('\n🎉 Verifica completata con successo!');
                console.log('Database pronto per uso in produzione.');
                process.exit(0);
            }
            
        } finally {
            await this.disconnect();
        }
    }
}

// Configurazioni (stesse del migration runner)
const configs = {
    development: {
        env: 'development',
        database: {
            host: 'localhost',
            port: 5432,
            database: 'air_tycoon_dev',
            user: 'postgres',
            password: 'postgres'
        },
        detailed: true
    },
    
    staging: {
        env: 'staging',
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'air_tycoon_staging',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD
        },
        detailed: false
    },
    
    production: {
        env: 'production',
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'air_tycoon',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD
        },
        detailed: false
    }
};

// Parser argomenti
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        env: 'development',
        detailed: false,
        checkPerformance: false,
        fixIssues: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--env':
                options.env = args[++i];
                break;
            case '--detailed':
                options.detailed = true;
                break;
            case '--check-performance':
                options.checkPerformance = true;
                break;
            case '--fix-issues':
                options.fixIssues = true;
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
    
    // Override opzioni dal config
    if (options.detailed) {
        config.detailed = true;
    }
    
    const verifier = new MigrationVerifier(config);
    await verifier.run(options);
}

if (require.main === module) {
    main().catch(error => {
        console.error('💥 Errore durante verifica:', error.message);
        process.exit(1);
    });
}

module.exports = MigrationVerifier;
