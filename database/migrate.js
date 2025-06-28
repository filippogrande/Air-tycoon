#!/usr/bin/env node

// CLI Tool per gestire le migrazioni di Air Tycoon 2
const MigrationSystem = require('./migration-system');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const migrations = new MigrationSystem();
    
    try {
        switch (command) {
            case 'status':
                await migrations.status();
                break;
                
            case 'run':
                console.log('🚀 Esecuzione migrazioni pendenti...');
                await migrations.runPendingMigrations();
                break;
                
            case 'create':
                const name = args[1];
                if (!name) {
                    console.error('❌ Errore: Nome migrazione richiesto');
                    console.log('Uso: node migrate.js create "nome_migrazione"');
                    process.exit(1);
                }
                await migrations.createMigration(name);
                break;
                
            case 'init':
                await migrations.initialize();
                console.log('✅ Sistema migrazioni inizializzato');
                break;
                
            default:
                console.log(`
🛠️  CLI Migrazioni Air Tycoon 2

Comandi disponibili:
  status                    Mostra lo stato delle migrazioni
  run                       Esegue tutte le migrazioni pendenti
  create "nome"             Crea una nuova migrazione
  init                      Inizializza il sistema di migrazioni

Esempi:
  node migrate.js status
  node migrate.js run
  node migrate.js create "add_user_preferences"
  node migrate.js create "update_aircraft_types"
  
🔧 Le migrazioni vengono eseguite automaticamente all'avvio del server
📁 Directory migrazioni: database/migrations/
`);
                break;
        }
    } catch (error) {
        console.error('❌ Errore:', error.message);
        process.exit(1);
    }
}

// Gestione graceful degli errori
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

if (require.main === module) {
    main();
}
