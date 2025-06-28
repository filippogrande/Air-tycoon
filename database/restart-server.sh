#!/bin/bash

# Script per riavvio pulito del server Air Tycoon 2
echo "🔄 Riavvio pulito server Air Tycoon 2..."

# Ferma il server se è in esecuzione
echo "🛑 Fermando il server..."
pm2 stop air-tycoon-api 2>/dev/null || echo "⚠️ Server non era in esecuzione"

# Aspetta un momento per essere sicuri
sleep 2

# Riavvia il server
echo "🚀 Riavviando il server..."
pm2 start air-tycoon-api

# Mostra i logs
echo "📋 Logs del server:"
sleep 1
pm2 logs air-tycoon-api --lines 20
