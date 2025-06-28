#!/bin/bash

# Script per pulire la tabella migration_history dai record falliti
echo "🧹 Pulizia migration_history..."

# Variabili database
DB_HOST="localhost"
DB_NAME="air_tycoon_2"
DB_USER="air_tycoon_user"

echo "🔍 Stato attuale migration_history:"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version, name, status, executed_at FROM migration_history ORDER BY executed_at;"

echo ""
echo "🗑️ Eliminazione record falliti..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DELETE FROM migration_history WHERE status = 'failed';"

echo ""
echo "🔍 Stato dopo pulizia:"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version, name, status, executed_at FROM migration_history ORDER BY executed_at;"

echo ""
echo "✅ Pulizia completata!"
echo "🚀 Ora puoi riavviare il server: pm2 restart air-tycoon-api"
