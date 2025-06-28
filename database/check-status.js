#!/usr/bin/env node

// Utility per verificare lo stato del database e schema Air Tycoon 2
const db = require('../server/database');

async function checkDatabaseStatus() {
    console.log('🔍 Verifica stato database Air Tycoon 2...\n');
    
    try {
        // Test connessione
        console.log('🔌 Test connessione database...');
        await db.testConnection();
        console.log('✅ Connessione database OK\n');
        
        // Verifica tabelle principali
        console.log('📋 Verifica tabelle principali...');
        const tablesResult = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        const tables = tablesResult.rows.map(row => row.table_name);
        const requiredTables = ['users', 'companies', 'migration_history'];
        
        console.log(`📄 Tabelle trovate (${tables.length}):`);
        tables.forEach(table => {
            const isRequired = requiredTables.includes(table);
            const status = isRequired ? '✅' : '📄';
            console.log(`  ${status} ${table}`);
        });
        
        // Verifica tabelle mancanti
        const missingTables = requiredTables.filter(table => !tables.includes(table));
        if (missingTables.length > 0) {
            console.log(`\n❌ Tabelle mancanti: ${missingTables.join(', ')}`);
            console.log('💡 Esegui: bash database/reset_database.sh');
        } else {
            console.log('\n✅ Tutte le tabelle principali presenti');
        }
        
        // Verifica struttura tabella users
        if (tables.includes('users')) {
            console.log('\n🔍 Verifica struttura tabella users...');
            const columnsResult = await db.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
                ORDER BY ordinal_position
            `);
            
            console.log('📋 Colonne tabella users:');
            columnsResult.rows.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}${col.is_nullable === 'NO' ? ', NOT NULL' : ''})`);
            });
            
            // Conta utenti
            const userCountResult = await db.query('SELECT COUNT(*) as count FROM users');
            const userCount = userCountResult.rows[0].count;
            console.log(`👥 Utenti registrati: ${userCount}`);
        }
        
        // Verifica sistema migrazioni
        if (tables.includes('migration_history')) {
            console.log('\n🔧 Verifica sistema migrazioni...');
            const migrationsResult = await db.query(`
                SELECT version, name, executed_at, status 
                FROM migration_history 
                ORDER BY version
            `);
            
            if (migrationsResult.rows.length === 0) {
                console.log('📝 Nessuna migrazione eseguita');
            } else {
                console.log(`📋 Migrazioni eseguite (${migrationsResult.rows.length}):`);
                migrationsResult.rows.forEach(mig => {
                    const statusIcon = mig.status === 'completed' ? '✅' : '❌';
                    console.log(`  ${statusIcon} ${mig.version} - ${mig.name} (${mig.executed_at})`);
                });
            }
        }
        
        console.log('\n🎯 Stato generale:');
        if (missingTables.length === 0) {
            console.log('✅ Database correttamente configurato');
            console.log('🚀 Il server dovrebbe funzionare correttamente');
        } else {
            console.log('❌ Database non configurato correttamente');
            console.log('📋 Azioni richieste:');
            console.log('  1. bash database/reset_database.sh');
            console.log('  2. pm2 restart air-tycoon-api');
        }
        
    } catch (error) {
        console.error('❌ Errore durante verifica:', error.message);
        console.error('📋 Dettagli:', error);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Suggerimenti:');
            console.log('  - Verifica che PostgreSQL sia in esecuzione');
            console.log('  - Controlla le credenziali database');
            console.log('  - Verifica la configurazione nel file .env');
        }
    } finally {
        await db.closePool();
        console.log('\n💾 Connessione database chiusa');
    }
}

// Esegui se chiamato direttamente
if (require.main === module) {
    checkDatabaseStatus();
}

module.exports = { checkDatabaseStatus };
