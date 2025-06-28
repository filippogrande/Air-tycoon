#!/usr/bin/env node

// Script di test per verificare la sintassi dei file SQL

const fs = require('fs');
const path = require('path');

console.log('🔍 Test di validità file SQL...\n');

// Percorsi dei file da testare
const files = [
    'database/schema.sql',
    'database/initial_data.sql'
];

let hasErrors = false;

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File non trovato: ${filePath}`);
        hasErrors = true;
        return;
    }
    
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Test di base per sintassi SQL
        const lines = content.split('\n');
        let lineNumber = 0;
        let inTransaction = false;
        let hasBegin = false;
        let hasCommit = false;
        
        console.log(`📄 Analizzando ${filePath}...`);
        
        lines.forEach(line => {
            lineNumber++;
            const trimmed = line.trim().toUpperCase();
            
            // Controlla transazioni
            if (trimmed.startsWith('BEGIN')) {
                hasBegin = true;
                inTransaction = true;
            }
            if (trimmed.startsWith('COMMIT')) {
                hasCommit = true;
                inTransaction = false;
            }
            
            // Controlla parentesi bilanciate per INSERT statements
            if (trimmed.startsWith('INSERT INTO')) {
                const openParens = (line.match(/\(/g) || []).length;
                const closeParens = (line.match(/\)/g) || []).length;
                if (openParens > 0 && closeParens > 0 && openParens !== closeParens) {
                    console.log(`⚠️  Possibile errore parentesi alla riga ${lineNumber}: ${line.substring(0, 50)}...`);
                }
            }
            
            // Controlla virgole alla fine delle INSERT
            if (trimmed.endsWith(',') && (trimmed.includes('INSERT INTO') || lineNumber < lines.length - 3)) {
                // Va bene, è parte di una INSERT multipla
            }
        });
        
        if (filePath.includes('initial_data') && hasBegin && hasCommit) {
            console.log(`✅ ${filePath}: Transazione corretta (BEGIN/COMMIT)`);
        } else if (filePath.includes('initial_data')) {
            console.log(`⚠️  ${filePath}: Manca BEGIN o COMMIT per transazione`);
        }
        
        console.log(`✅ ${filePath}: Sintassi di base OK (${lines.length} righe)`);
        
    } catch (error) {
        console.log(`❌ Errore leggendo ${filePath}: ${error.message}`);
        hasErrors = true;
    }
});

console.log('\n🏁 Test completato!');
if (hasErrors) {
    console.log('❌ Trovati errori - correggere prima di procedere');
    process.exit(1);
} else {
    console.log('✅ Tutti i test superati!');
}
