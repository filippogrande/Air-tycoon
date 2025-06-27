# Configurazione Database per Ambienti

## Variabili Ambiente per Produzione

Crea un file `.env.production` con:

```bash
# Database Production
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_NAME=air_tycoon_production
DB_USER=air_tycoon_user
DB_PASSWORD=your-secure-password

# SSL per produzione
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
BACKUP_STORAGE_PATH=/opt/backups/air_tycoon

# Monitoring
MIGRATION_NOTIFICATIONS=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Ambiente di Staging

File `.env.staging`:

```bash
DB_HOST=staging-db.internal
DB_PORT=5432
DB_NAME=air_tycoon_staging
DB_USER=air_tycoon_staging
DB_PASSWORD=staging-password
DB_SSL=true

BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=7
```

## Ambiente di Sviluppo

File `.env.development`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=air_tycoon_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

BACKUP_ENABLED=false
```

## Sicurezza

⚠️ **IMPORTANTE**:

- Non committare mai i file `.env.*` nel repository
- Aggiungi `.env.*` al `.gitignore`
- Usa password sicure in produzione
- Configura SSL per connessioni database in produzione
- Limita permessi utente database (solo quello necessario)
