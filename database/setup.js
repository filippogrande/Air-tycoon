#!/usr/bin/env node

/**
 * Script per setup automatico database Air Tycoon 2
 * Crea il database, le tabelle e inserisce i dati iniziali
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

// Debug: mostra le variabili caricate
console.log('🔧 Debug configurazione:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres' // Connessione temporanea per creare il database
};

console.log('🔧 Config utilizzato:', {
    ...config,
    password: config.password ? '***' : 'NOT SET'
});

const targetDatabase = process.env.DB_NAME || 'air_tycoon';

async function runSQLFile(client, filePath) {
    try {
        console.log(`📄 Eseguendo ${path.basename(filePath)}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`✅ ${path.basename(filePath)} eseguito con successo`);
    } catch (error) {
        console.error(`❌ Errore eseguendo ${path.basename(filePath)}:`, error.message);
        throw error;
    }
}

async function setupDatabase() {
    let client;
    
    try {
        // Connessione iniziale a postgres per creare il database
        console.log('🔌 Connessione al server PostgreSQL...');
        client = new Client(config);
        await client.connect();
        console.log('✅ Connesso al server PostgreSQL');
        
        // Verifica se il database esiste già
        const dbExists = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [targetDatabase]
        );
        
        if (dbExists.rows.length === 0) {
            console.log(`🏗️  Creazione database ${targetDatabase}...`);
            await client.query(`CREATE DATABASE ${targetDatabase}`);
            console.log(`✅ Database ${targetDatabase} creato con successo`);
        } else {
            console.log(`ℹ️  Database ${targetDatabase} già esistente`);
            
            // Controlla se dobbiamo fare un reset
            const resetFlag = process.argv.includes('--reset') || process.env.RESET_DB === 'true';
            if (resetFlag) {
                await client.end();
                await resetDatabase();
                client = new Client(config);
                await client.connect();
            }
        }
        
        await client.end();
        
        // Connessione al database target
        console.log(`🔌 Connessione al database ${targetDatabase}...`);
        const targetClient = new Client({
            ...config,
            database: targetDatabase
        });
        await targetClient.connect();
        console.log(`✅ Connesso al database ${targetDatabase}`);
        
        // Esegui schema SQL
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            await runSQLFile(targetClient, schemaPath);
        } else {
            console.log('⚠️  File schema.sql non trovato, saltando...');
        }
        
        // Esegui dati iniziali
        const dataPath = path.join(__dirname, 'initial_data.sql');
        if (fs.existsSync(dataPath)) {
            await runSQLFile(targetClient, dataPath);
        } else {
            console.log('⚠️  File initial_data.sql non trovato, saltando...');
        }
        
        await targetClient.end();
        
        console.log('\n🎉 Setup database completato con successo!');
        console.log('\n📋 Riepilogo:');
        console.log(`   • Database: ${targetDatabase}`);
        console.log(`   • Host: ${config.host}:${config.port}`);
        console.log(`   • User: ${config.user}`);
        console.log('\n🚀 Ora puoi avviare il server con: npm start');
        
    } catch (error) {
        console.error('\n❌ Errore durante il setup del database:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Suggerimenti:');
            console.log('   • Assicurati che PostgreSQL sia in esecuzione');
            console.log('   • Verifica host e porta nel file .env');
            console.log('   • Controlla username e password');
        }
        
        process.exit(1);
    }
}

async function resetDatabase() {
    let client;
    
    try {
        console.log('🗑️  Reset completo database...');
        
        // Connessione al database target
        const targetClient = new Client({
            ...config,
            database: targetDatabase
        });
        await targetClient.connect();
        
        // Elimina tutte le tabelle esistenti
        console.log('🗑️  Eliminazione tabelle esistenti...');
        await targetClient.query(`
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO ${config.user};
            GRANT ALL ON SCHEMA public TO public;
        `);
        
        await targetClient.end();
        console.log('✅ Database resettato con successo');
        
    } catch (error) {
        console.error('❌ Errore durante il reset:', error.message);
        throw error;
    }
}

// Esegui setup se chiamato direttamente
if (require.main === module) {
    console.log('🛠️  Avvio setup database Air Tycoon 2...\n');
    setupDatabase();
}

module.exports = { setupDatabase, resetDatabase };
