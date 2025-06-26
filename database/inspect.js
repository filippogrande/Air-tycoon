#!/usr/bin/env node

/**
 * Script per ispezionare il database Air Tycoon 2
 * Mostra struttura, contenuto e statistiche
 */

const { Client } = require('pg');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'air_tycoon'
};

async function inspectDatabase() {
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('🔍 Ispezione Database Air Tycoon 2\n');
        
        // 1. Versione schema
        console.log('📊 VERSIONI SCHEMA:');
        try {
            const versions = await client.query(`
                SELECT version, description, applied_at 
                FROM schema_versions 
                ORDER BY applied_at DESC
            `);
            
            if (versions.rows.length > 0) {
                versions.rows.forEach(v => {
                    console.log(`   ✅ ${v.version} - ${v.description} (${v.applied_at})`);
                });
            } else {
                console.log('   ⚠️  Nessuna versione registrata');
            }
        } catch (error) {
            console.log('   ❌ Tabella schema_versions non trovata');
        }
        
        console.log('\n📋 TABELLE E CONTENUTO:');
        
        // 2. Lista tabelle con record count
        const tables = await client.query(`
            SELECT 
                t.table_name,
                COALESCE(s.n_tup_ins, 0) as row_count
            FROM information_schema.tables t
            LEFT JOIN pg_stat_user_tables s ON t.table_name = s.relname
            WHERE t.table_schema = 'public' 
            AND t.table_type = 'BASE TABLE'
            ORDER BY t.table_name
        `);
        
        for (const table of tables.rows) {
            console.log(`   📄 ${table.table_name.padEnd(20)} - ${table.row_count} record`);
        }
        
        // 3. Dettagli tabelle principali
        console.log('\n📈 STATISTICHE PRINCIPALI:');
        
        const stats = [
            { name: 'Aeroporti', table: 'airports' },
            { name: 'Tipi Aeromobili', table: 'aircraft_types' },
            { name: 'Compagnie', table: 'companies' },
            { name: 'Flotta', table: 'fleet' },
            { name: 'Rotte', table: 'routes' },
            { name: 'Voli', table: 'flights' },
            { name: 'Record Finanziari', table: 'financial_records' }
        ];
        
        for (const stat of stats) {
            try {
                const count = await client.query(`SELECT COUNT(*) as count FROM ${stat.table}`);
                console.log(`   🔢 ${stat.name.padEnd(20)} - ${count.rows[0].count} record`);
            } catch (error) {
                console.log(`   ❌ ${stat.name.padEnd(20)} - Tabella non trovata`);
            }
        }
        
        // 4. Esempi di dati
        console.log('\n📋 ESEMPI DI DATI:');
        
        // Aeroporti
        try {
            const airports = await client.query(`
                SELECT name, iata_code, city, country 
                FROM airports 
                ORDER BY iata_code 
                LIMIT 5
            `);
            
            if (airports.rows.length > 0) {
                console.log('   ✈️  Aeroporti (primi 5):');
                airports.rows.forEach(a => {
                    console.log(`      ${a.iata_code} - ${a.name}, ${a.city}, ${a.country}`);
                });
            }
        } catch (error) {
            console.log('   ❌ Impossibile leggere aeroporti');
        }
        
        // Tipi aeromobili
        try {
            const aircraft = await client.query(`
                SELECT name, manufacturer, category, capacity 
                FROM aircraft_types 
                ORDER BY name 
                LIMIT 5
            `);
            
            if (aircraft.rows.length > 0) {
                console.log('   🛩️  Aeromobili (primi 5):');
                aircraft.rows.forEach(a => {
                    console.log(`      ${a.name} (${a.manufacturer}) - ${a.capacity} posti, ${a.category}`);
                });
            }
        } catch (error) {
            console.log('   ❌ Impossibile leggere tipi aeromobili');
        }
        
        // Compagnie
        try {
            const companies = await client.query(`
                SELECT name, money, reputation, founded_date 
                FROM companies 
                ORDER BY founded_date DESC
                LIMIT 5
            `);
            
            if (companies.rows.length > 0) {
                console.log('   🏢 Compagnie:');
                companies.rows.forEach(c => {
                    console.log(`      ${c.name} - $${(c.money/100).toLocaleString()} - ⭐${c.reputation}`);
                });
            }
        } catch (error) {
            console.log('   ❌ Impossibile leggere compagnie');
        }
        
        console.log('\n✅ Ispezione completata!');
        
    } catch (error) {
        console.error('❌ Errore connessione database:', error.message);
    } finally {
        await client.end();
    }
}

// Esegui se chiamato direttamente
if (require.main === module) {
    inspectDatabase();
}

module.exports = { inspectDatabase };
