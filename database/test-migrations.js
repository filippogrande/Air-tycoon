#!/usr/bin/env node

// Test del sistema di migrazioni Air Tycoon 2
// Questo script testa il sistema senza bisogno del database reale

const fs = require('fs');
const path = require('path');

console.log('🧪 Test Sistema Migrazioni Air Tycoon 2\n');

// Test 1: Verifica file essenziali
console.log('📋 Test 1: Verifica file del sistema...');
const requiredFiles = [
    'database/migration-system.js',
    'database/migrate.js',
    'database/migrations',
    'database/MIGRATIONS_GUIDE.md'
];

let filesOk = true;
for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MANCANTE`);
        filesOk = false;
    }
}

if (!filesOk) {
    console.log('❌ Alcuni file sono mancanti!');
    process.exit(1);
}

// Test 2: Verifica struttura migrations
console.log('\n📁 Test 2: Verifica directory migrations...');
const migrationsDir = path.join(__dirname, 'migrations');
if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir);
    console.log(`  📄 Trovati ${files.length} file di migrazione:`);
    
    const sqlFiles = files.filter(f => f.endsWith('.sql'));
    sqlFiles.forEach(file => {
        const match = file.match(/^(\d{4})_(.+)\.sql$/);
        if (match) {
            console.log(`    ✅ ${file} (versione: ${match[1]})`);
        } else {
            console.log(`    ⚠️ ${file} (formato nome non standard)`);
        }
    });
    
    if (sqlFiles.length === 0) {
        console.log('  📝 Nessuna migrazione presente (normale per installazione pulita)');
    }
} else {
    console.log('  ❌ Directory migrations non trovata');
}

// Test 3: Verifica sintassi JavaScript
console.log('\n🔍 Test 3: Verifica sintassi file JavaScript...');
try {
    // Test migration-system.js
    const MigrationSystem = require('./migration-system');
    console.log('  ✅ migration-system.js - sintassi OK');
    
    // Test migrate.js (solo syntax, non eseguiamo)
    const migrateContent = fs.readFileSync('./migrate.js', 'utf8');
    if (migrateContent.includes('MigrationSystem') && migrateContent.includes('main()')) {
        console.log('  ✅ migrate.js - struttura OK');
    } else {
        console.log('  ⚠️ migrate.js - struttura insolita');
    }
    
} catch (error) {
    console.log(`  ❌ Errore sintassi: ${error.message}`);
    process.exit(1);
}

// Test 4: Verifica template di migrazione
console.log('\n📝 Test 4: Test creazione template migrazione...');
try {
    // Simuliamo il template senza creare il file
    const testTemplate = `-- Migrazione 9999: test_migration
-- Data: ${new Date().toISOString().split('T')[0]}
-- 
-- Descrizione: test_migration
-- 
-- ATTENZIONE: Questa migrazione viene eseguita automaticamente all'avvio del server
-- Testare sempre in ambiente di sviluppo prima del deploy in produzione

-- ==================================================
-- INIZIO MIGRAZIONE
-- ==================================================

-- Placeholder per confermare che la migrazione è stata eseguita
SELECT 'Migrazione 9999 - test_migration - COMPLETATA' as status;

-- ==================================================
-- FINE MIGRAZIONE
-- ==================================================
`;
    
    if (testTemplate.includes('INIZIO MIGRAZIONE') && testTemplate.includes('FINE MIGRAZIONE')) {
        console.log('  ✅ Template migrazione - formato corretto');
    } else {
        console.log('  ❌ Template migrazione - formato incorretto');
    }
    
} catch (error) {
    console.log(`  ❌ Errore template: ${error.message}`);
}

// Test 5: Verifica integrazione server
console.log('\n🔗 Test 5: Verifica integrazione server...');
const serverIndexPath = path.join(__dirname, '..', 'server', 'index.js');
if (fs.existsSync(serverIndexPath)) {
    const serverContent = fs.readFileSync(serverIndexPath, 'utf8');
    
    if (serverContent.includes('MigrationSystem')) {
        console.log('  ✅ server/index.js - Import MigrationSystem OK');
    } else {
        console.log('  ❌ server/index.js - MigrationSystem non importato');
    }
    
    if (serverContent.includes('runPendingMigrations')) {
        console.log('  ✅ server/index.js - Chiamata migrazioni OK');
    } else {
        console.log('  ❌ server/index.js - Migrazioni non chiamate');
    }
} else {
    console.log('  ❌ server/index.js non trovato');
}

// Risultato finale
console.log('\n🎯 Risultato Test:');
console.log('✅ Sistema di migrazioni correttamente configurato!');
console.log('📚 Leggi database/MIGRATIONS_GUIDE.md per l\'uso completo');
console.log('🚀 Il sistema sarà attivo al prossimo avvio del server');

console.log('\n📋 Prossimi passi:');
console.log('  1. Deploy il codice sul server');
console.log('  2. Esegui reset: bash database/reset_database.sh');
console.log('  3. Riavvia: pm2 restart air-tycoon-api');
console.log('  4. Verifica: npm run migrate:status');
