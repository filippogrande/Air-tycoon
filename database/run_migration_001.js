/**
 * Script per eseguire la migrazione 001 - Business e Tourist Levels
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function runMigration001() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'air_tycoon'
    };

    const client = new Client(config);
    
    try {
        console.log('🔗 Connessione al database...');
        await client.connect();
        
        // Controlla se i campi esistono già
        const columnsCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'airports' 
            AND column_name IN ('business_level', 'tourist_level')
        `);
        
        if (columnsCheck.rows.length > 0) {
            console.log('✅ I campi business_level e tourist_level esistono già');
            console.log('🔍 Campi trovati:', columnsCheck.rows.map(r => r.column_name));
            return;
        }
        
        console.log('📄 Esecuzione migrazione 001...');
        
        // Leggi e esegui il file di migrazione
        const migrationPath = path.join(__dirname, 'migrations', '001_add_traffic_levels_to_airports.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        await client.query(migrationSQL);
        
        console.log('✅ Migrazione 001 completata con successo!');
        
        // Verifica che i campi siano stati creati
        const verify = await client.query(`
            SELECT business_level, tourist_level, iata_code 
            FROM airports 
            WHERE iata_code IN ('MXP', 'FCO', 'JFK') 
            LIMIT 3
        `);
        
        console.log('🔍 Verifica risultati:');
        verify.rows.forEach(row => {
            console.log(`   ${row.iata_code}: Business ${row.business_level}, Tourist ${row.tourist_level}`);
        });
        
    } catch (error) {
        console.error('❌ Errore durante la migrazione:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

// Esegui se chiamato direttamente
if (require.main === module) {
    runMigration001()
        .then(() => {
            console.log('\n🎉 Migrazione completata!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Migrazione fallita:', error);
            process.exit(1);
        });
}

module.exports = runMigration001;
