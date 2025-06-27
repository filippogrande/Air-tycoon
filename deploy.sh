#!/bin/bash

# Script di deploy per Air Tycoon - Gestione Database
# Usage: ./deploy.sh [staging|production] [--dry-run] [--backup] [--rollback=003]

set -euo pipefail

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzioni di utility
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parsing argomenti
ENVIRONMENT=""
DRY_RUN=false
BACKUP=false
ROLLBACK=""
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --backup)
            BACKUP=true
            shift
            ;;
        --rollback=*)
            ROLLBACK="${1#*=}"
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            log_error "Argomento sconosciuto: $1"
            echo "Usage: $0 [staging|production] [--dry-run] [--backup] [--rollback=003] [--force]"
            exit 1
            ;;
    esac
done

if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Specificare ambiente: staging o production"
    exit 1
fi

# Carica configurazione ambiente
ENV_FILE=".env.${ENVIRONMENT}"
if [[ ! -f "$ENV_FILE" ]]; then
    log_error "File di configurazione $ENV_FILE non trovato"
    exit 1
fi

log_info "Caricamento configurazione da $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

# Verifica dipendenze
check_dependencies() {
    log_info "Verifica dipendenze..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js non installato"
        exit 1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        log_error "PostgreSQL client tools non installati"
        exit 1
    fi
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json non trovato. Eseguire da directory root del progetto"
        exit 1
    fi
    
    log_success "Dipendenze verificate"
}

# Test connessione database
test_connection() {
    log_info "Test connessione database $ENVIRONMENT..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        log_success "Connessione database OK"
    else
        log_error "Impossibile connettersi al database"
        exit 1
    fi
}

# Conferma operazione in produzione
confirm_production() {
    if [[ "$ENVIRONMENT" == "production" && "$FORCE" != "true" ]]; then
        echo ""
        log_warning "⚠️  ATTENZIONE: Stai per eseguire operazioni sul database di PRODUZIONE"
        echo ""
        echo "Ambiente: $ENVIRONMENT"
        echo "Host: $DB_HOST"
        echo "Database: $DB_NAME"
        echo ""
        
        if [[ -n "$ROLLBACK" ]]; then
            echo "OPERAZIONE: Rollback migrazione $ROLLBACK"
        else
            echo "OPERAZIONE: Applicazione nuove migrazioni"
        fi
        
        if [[ "$DRY_RUN" == "true" ]]; then
            echo "Modalità: DRY RUN (nessuna modifica effettiva)"
        else
            echo "Modalità: ESECUZIONE REALE"
        fi
        
        echo ""
        read -p "Sei sicuro di voler continuare? (scrivi 'CONFERMA' per procedere): " confirm
        
        if [[ "$confirm" != "CONFERMA" ]]; then
            log_info "Operazione annullata dall'utente"
            exit 0
        fi
    fi
}

# Installazione dipendenze Node.js
install_dependencies() {
    log_info "Installazione/aggiornamento dipendenze Node.js..."
    npm ci --only=production
    log_success "Dipendenze installate"
}

# Backup pre-migrazione
create_backup() {
    if [[ "$BACKUP" == "true" || "$ENVIRONMENT" == "production" ]]; then
        log_info "Creazione backup pre-migrazione..."
        
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        BACKUP_FILE="backup_${ENVIRONMENT}_${TIMESTAMP}.sql"
        
        PGPASSWORD="$DB_PASSWORD" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --verbose \
            --format=plain \
            --file="$BACKUP_FILE"
        
        log_success "Backup creato: $BACKUP_FILE"
        
        # Comprimi backup se grande
        if [[ $(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE") -gt 10485760 ]]; then
            gzip "$BACKUP_FILE"
            log_info "Backup compresso: ${BACKUP_FILE}.gz"
        fi
    fi
}

# Esecuzione migrazioni
run_migrations() {
    log_info "Esecuzione migrazioni database..."
    
    # Costruisci argomenti per lo script
    MIGRATION_ARGS="--env $ENVIRONMENT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        MIGRATION_ARGS="$MIGRATION_ARGS --dry-run"
    fi
    
    if [[ "$BACKUP" == "true" ]]; then
        MIGRATION_ARGS="$MIGRATION_ARGS --backup"
    fi
    
    if [[ -n "$ROLLBACK" ]]; then
        MIGRATION_ARGS="$MIGRATION_ARGS --rollback $ROLLBACK"
    fi
    
    # Esegui script migrazioni
    cd database
    node run_migrations.js $MIGRATION_ARGS
    cd ..
    
    log_success "Migrazioni completate"
}

# Verifica post-migrazione
verify_deployment() {
    log_info "Verifica post-migrazione..."
    
    # Test connessione
    test_connection
    
    # Verifica integrità schema base
    EXPECTED_TABLES=("companies" "airports" "routes" "flights" "aircraft" "company_hubs")
    
    for table in "${EXPECTED_TABLES[@]}"; do
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM $table LIMIT 1;" &> /dev/null; then
            log_success "Tabella $table OK"
        else
            log_error "Problema con tabella $table"
            exit 1
        fi
    done
    
    log_success "Verifica completata con successo"
}

# Notifica completamento (se configurato)
send_notification() {
    if [[ -n "${SLACK_WEBHOOK_URL:-}" && "$DRY_RUN" != "true" ]]; then
        local status="SUCCESS"
        local message="Deploy database completato su $ENVIRONMENT"
        
        if [[ -n "$ROLLBACK" ]]; then
            message="Rollback migrazione $ROLLBACK completato su $ENVIRONMENT"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 $message\"}" \
            "$SLACK_WEBHOOK_URL" &> /dev/null || true
    fi
}

# Funzione principale
main() {
    log_info "🚀 Deploy Air Tycoon - Database"
    log_info "Ambiente: $ENVIRONMENT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "Modalità DRY RUN - Nessuna modifica effettiva"
    fi
    
    check_dependencies
    test_connection
    confirm_production
    
    if [[ "$DRY_RUN" != "true" ]]; then
        install_dependencies
        create_backup
    fi
    
    run_migrations
    
    if [[ "$DRY_RUN" != "true" ]]; then
        verify_deployment
        send_notification
        log_success "🎉 Deploy completato con successo!"
    else
        log_info "📝 DRY RUN completato"
    fi
}

# Gestione errori
trap 'log_error "❌ Deploy fallito in modo inaspettato"; exit 1' ERR

# Esecuzione
main "$@"
