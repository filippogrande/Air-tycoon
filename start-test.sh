#!/bin/bash

# Script di avvio per test delle nuove funzionalità Air Tycoon
# Versione: 1.0.0
# Data: 28 giugno 2025

echo "🚀 Avvio sistema test Air Tycoon..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Air Tycoon Test Environment  ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non trovato! Installare Node.js per continuare.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js trovato: $(node --version)${NC}"

# Verifica PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️ PostgreSQL non trovato. Alcune funzionalità potrebbero non funzionare.${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL trovato: $(psql --version | head -n1)${NC}"
fi

echo ""

# Controlla se siamo nella directory corretta
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json non trovato. Eseguire lo script dalla directory root del progetto.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Cosa vuoi fare?${NC}"
echo "1) 🏃 Avvia solo server (background)"
echo "2) 🧪 Avvia server + apri test page"
echo "3) 📊 Applica migrazioni database"
echo "4) 🔍 Verifica status sistema"
echo "5) 🛑 Ferma server in background"
echo ""

read -p "Scegli opzione (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}🏃 Avvio server in background...${NC}"
        
        # Controlla se .env esiste
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}⚠️ File .env non trovato, creazione automatica...${NC}"
            cat > .env << EOF
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=air_tycoon_2
DB_USER=postgres
DB_PASSWORD=password
CORS_ORIGIN=http://localhost:3001,http://localhost:3000,http://127.0.0.1:3001
EOF
            echo -e "${GREEN}✅ File .env creato con configurazione di default${NC}"
        fi
        
        # Installa dipendenze se necessario
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 Installazione dipendenze...${NC}"
            npm install
        fi
        
        # Avvia server in background
        nohup npm start > server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > server.pid
        
        echo -e "${GREEN}✅ Server avviato in background (PID: $SERVER_PID)${NC}"
        echo -e "${BLUE}📖 Log disponibili in: server.log${NC}"
        echo -e "${BLUE}🌐 Server disponibile su: http://localhost:3001${NC}"
        echo ""
        echo -e "${YELLOW}💡 Per fermare il server: ./start-test.sh (opzione 5)${NC}"
        ;;
        
    2)
        echo -e "${YELLOW}🧪 Avvio server + test page...${NC}"
        
        # Esegui l'opzione 1 prima
        $0 1
        
        # Aspetta che il server sia pronto
        echo -e "${YELLOW}⏳ Attendo che il server sia pronto...${NC}"
        sleep 3
        
        # Controlla se il server risponde
        if curl -s http://localhost:3001/health > /dev/null; then
            echo -e "${GREEN}✅ Server pronto!${NC}"
            
            # Apri test page nel browser default
            if command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:3001/test-route-config.html
            elif command -v open &> /dev/null; then
                open http://localhost:3001/test-route-config.html
            else
                echo -e "${BLUE}🌐 Apri manualmente: http://localhost:3001/test-route-config.html${NC}"
            fi
        else
            echo -e "${RED}❌ Server non risponde. Controlla i log.${NC}"
        fi
        ;;
        
    3)
        echo -e "${YELLOW}📊 Applicazione migrazioni database...${NC}"
        
        # Verifica PostgreSQL
        if ! command -v psql &> /dev/null; then
            echo -e "${RED}❌ PostgreSQL richiesto per le migrazioni${NC}"
            exit 1
        fi
        
        # Esegui migrazioni
        echo -e "${BLUE}🔄 Esecuzione migrazione 009...${NC}"
        
        if psql -h localhost -U postgres -d air_tycoon_2 -f database/migrations/009_paid_actions_persistence.sql; then
            echo -e "${GREEN}✅ Migrazione 009 completata${NC}"
        else
            echo -e "${RED}❌ Errore durante migrazione. Controlla configurazione database.${NC}"
        fi
        ;;
        
    4)
        echo -e "${YELLOW}🔍 Verifica status sistema...${NC}"
        echo ""
        
        # Controlla server
        if [ -f "server.pid" ]; then
            SERVER_PID=$(cat server.pid)
            if ps -p $SERVER_PID > /dev/null; then
                echo -e "${GREEN}✅ Server attivo (PID: $SERVER_PID)${NC}"
                
                # Test health endpoint
                if curl -s http://localhost:3001/health > /dev/null; then
                    echo -e "${GREEN}✅ Server risponde correttamente${NC}"
                else
                    echo -e "${YELLOW}⚠️ Server attivo ma non risponde${NC}"
                fi
            else
                echo -e "${RED}❌ Server non attivo (PID obsoleto)${NC}"
                rm -f server.pid
            fi
        else
            echo -e "${RED}❌ Server non avviato${NC}"
        fi
        
        # Controlla database
        if command -v psql &> /dev/null; then
            if psql -h localhost -U postgres -d air_tycoon_2 -c "SELECT 1;" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Database connesso${NC}"
                
                # Controlla tabelle migrazioni
                if psql -h localhost -U postgres -d air_tycoon_2 -c "SELECT COUNT(*) FROM market_analyses;" > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ Migrazione 009 applicata${NC}"
                else
                    echo -e "${YELLOW}⚠️ Migrazione 009 non applicata${NC}"
                fi
            else
                echo -e "${RED}❌ Database non raggiungibile${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️ PostgreSQL non disponibile${NC}"
        fi
        
        # Controlla file
        echo ""
        echo -e "${BLUE}📁 File sistema:${NC}"
        echo -e "   $([ -f "test-route-config.html" ] && echo "✅" || echo "❌") test-route-config.html"
        echo -e "   $([ -f "src/utils/MarketAnalysisAPI.js" ] && echo "✅" || echo "❌") MarketAnalysisAPI.js"
        echo -e "   $([ -f "server/routes/market-analysis.js" ] && echo "✅" || echo "❌") market-analysis.js routes"
        echo -e "   $([ -f "database/migrations/009_paid_actions_persistence.sql" ] && echo "✅" || echo "❌") migrazione 009"
        ;;
        
    5)
        echo -e "${YELLOW}🛑 Arresto server...${NC}"
        
        if [ -f "server.pid" ]; then
            SERVER_PID=$(cat server.pid)
            if ps -p $SERVER_PID > /dev/null; then
                kill $SERVER_PID
                echo -e "${GREEN}✅ Server fermato (PID: $SERVER_PID)${NC}"
            else
                echo -e "${YELLOW}⚠️ Server già fermato${NC}"
            fi
            rm -f server.pid
        else
            echo -e "${YELLOW}⚠️ Nessun server da fermare${NC}"
        fi
        
        # Pulisci anche eventuali processi node rimasti
        pkill -f "node.*server" 2>/dev/null || true
        echo -e "${GREEN}✅ Pulizia completata${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Opzione non valida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}✨ Operazione completata!${NC}"
