#!/bin/bash

# Air Tycoon 2 - Script di setup produzione con PM2
# Eseguire come root o con sudo

echo "🚀 Setup Air Tycoon 2 per produzione..."

# 1. Crea directory per i log
echo "📁 Creazione directory log..."
mkdir -p /var/log/air-tycoon
chown www-data:www-data /var/log/air-tycoon

# 2. Installa PM2 se non presente
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installazione PM2..."
    npm install -g pm2
else
    echo "✅ PM2 già installato"
fi

# 3. Setup del servizio
echo "🔧 Configurazione PM2..."

# Vai nella directory del progetto
cd /websites/websites/air-tycoon

# Ferma eventuali processi esistenti
pm2 delete air-tycoon-api 2>/dev/null || true

# Avvia il servizio
npm run start:pm2

# 4. Setup auto-start al boot
echo "🔄 Configurazione auto-start..."
pm2 startup systemd -u www-data --hp /var/www
pm2 save

# 5. Test del servizio
echo "🧪 Test del servizio..."
sleep 3
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Servizio funzionante!"
else
    echo "❌ Errore: servizio non raggiungibile"
    exit 1
fi

echo ""
echo "🎉 Setup completato!"
echo ""
echo "📋 Comandi utili:"
echo "   pm2 status                    # Status dei processi"
echo "   pm2 logs air-tycoon-api      # Vedi i log"
echo "   pm2 monit                    # Monitor in tempo reale"
echo "   pm2 restart air-tycoon-api   # Riavvia il servizio"
echo "   pm2 stop air-tycoon-api      # Ferma il servizio"
echo ""
echo "🌐 Servizio disponibile su: http://localhost:3001"
