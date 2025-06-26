/**
 * Sistema di migrazioni per Air Tycoon 2
 * Gestisce installazione iniziale e aggiornamenti futuri
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

class MigrationManager {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: 'postgres' // Connessione temporanea
        };
        this.targetDatabase = process.env.DB_NAME || 'air_tycoon';
    }

    async ensureDatabase() {
        const client = new Client(this.config);
        await client.connect();
        
        const dbExists = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [this.targetDatabase]
        );
        
        if (dbExists.rows.length === 0) {
            console.log(`🏗️  Creazione database ${this.targetDatabase}...`);
            await client.query(`CREATE DATABASE ${this.targetDatabase}`);
            console.log(`✅ Database ${this.targetDatabase} creato`);
        }
        
        await client.end();
    }

    async getCurrentVersion() {
        const client = new Client({
            ...this.config,
            database: this.targetDatabase
        });
        
        try {
            await client.connect();
            
            // Controlla se la tabella schema_versions esiste
            const tableExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'schema_versions'
                );
            `);
            
            if (!tableExists.rows[0].exists) {
                return null; // Installazione iniziale
            }
            
            // Ottieni l'ultima versione
            const version = await client.query(`
                SELECT version FROM schema_versions 
                ORDER BY applied_at DESC 
                LIMIT 1
            `);
            
            return version.rows.length > 0 ? version.rows[0].version : null;
            
        } catch (error) {
            return null; // Database non accessibile o danneggiato
        } finally {
            await client.end();
        }
    }

    async runMigration(filePath, description) {
        const client = new Client({
            ...this.config,
            database: this.targetDatabase
        });
        
        try {
            await client.connect();
            console.log(`📄 Eseguendo ${path.basename(filePath)}...`);
            
            const sql = fs.readFileSync(filePath, 'utf8');
            await client.query(sql);
            
            console.log(`✅ ${path.basename(filePath)} completato`);
            
        } finally {
            await client.end();
        }
    }

    async installInitial() {
        console.log('🚀 Installazione iniziale del database...');
        
        // Esegui schema base
        const schemaPath = path.join(__dirname, 'schema_base.sql');
        if (fs.existsSync(schemaPath)) {
            await this.runMigration(schemaPath, 'Schema base 1.0.0');
        }
        
        // Esegui dati iniziali
        const dataPath = path.join(__dirname, 'initial_data.sql');
        if (fs.existsSync(dataPath)) {
            await this.runMigration(dataPath, 'Dati iniziali');
        }
    }

    async runUpdate(fromVersion, toVersion) {
        console.log(`🔄 Aggiornamento da ${fromVersion} a ${toVersion}...`);
        
        // Qui aggiungeremo le migrazioni future
        // Esempio: se fromVersion è '1.0.0' e toVersion è '1.1.0'
        // eseguiremo migration_1.0.0_to_1.1.0.sql
        
        const migrationFile = `migration_${fromVersion}_to_${toVersion}.sql`;
        const migrationPath = path.join(__dirname, 'migrations', migrationFile);
        
        if (fs.existsSync(migrationPath)) {
            await this.runMigration(migrationPath, `Update ${fromVersion} -> ${toVersion}`);
        } else {
            console.log(`⚠️  Nessuna migrazione trovata per ${fromVersion} -> ${toVersion}`);
        }
    }

    async setup(options = {}) {
        try {
            const { reset = false, targetVersion = '1.0.0' } = options;
            
            console.log('🛠️  Avvio setup database Air Tycoon 2...');
            
            // Assicura che il database esista
            await this.ensureDatabase();
            
            // Ottieni versione corrente
            const currentVersion = await this.getCurrentVersion();
            console.log(`📊 Versione corrente: ${currentVersion || 'Nessuna'}`);
            console.log(`📊 Versione target: ${targetVersion}`);
            
            if (reset) {
                console.log('🗑️  Reset richiesto...');
                await this.resetDatabase();
                await this.installInitial();
            } else if (!currentVersion) {
                console.log('📦 Prima installazione...');
                await this.installInitial();
            } else if (currentVersion !== targetVersion) {
                console.log('🔄 Aggiornamento necessario...');
                await this.runUpdate(currentVersion, targetVersion);
            } else {
                console.log('✅ Database già aggiornato');
            }
            
            console.log('\n🎉 Setup completato con successo!');
            
        } catch (error) {
            console.error('\n❌ Errore durante il setup:', error.message);
            throw error;
        }
    }

    async resetDatabase() {
        const client = new Client({
            ...this.config,
            database: this.targetDatabase
        });
        
        try {
            await client.connect();
            console.log('🗑️  Reset completo database...');
            
            await client.query(`
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
                GRANT ALL ON SCHEMA public TO ${this.config.user};
                GRANT ALL ON SCHEMA public TO public;
            `);
            
            console.log('✅ Database resettato');
            
        } finally {
            await client.end();
        }
    }
}

// Esporta la classe
module.exports = MigrationManager;

// Esegui se chiamato direttamente
if (require.main === module) {
    const manager = new MigrationManager();
    const reset = process.argv.includes('--reset');
    
    manager.setup({ reset })
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Setup fallito:', error);
            process.exit(1);
        });
}
