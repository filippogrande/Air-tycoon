# Sistema di Sicurezza Migrazioni - Air Tycoon

## Panoramica

Il sistema di migrazioni di Air Tycoon implementa molteplici livelli di sicurezza per garantire che gli aggiornamenti del database in produzione avvengano senza perdita di dati o interruzioni del servizio.

## 🛡️ Livelli di Sicurezza

### 1. **Verifica Pre-Migrazione**

- Test connessione database
- Backup automatico (obbligatorio in produzione)
- Verifica dipendenze e prerequisiti
- Controllo spazio disponibile

### 2. **Migrazione Sicura**

- Ogni migrazione è **idempotente** (può essere eseguita più volte)
- **Transazioni atomiche** - tutto o niente
- **Checkpoint automatici** prima di operazioni critiche
- **Verifica interna** ad ogni step

### 3. **Verifica Post-Migrazione**

- **Test di integrità** struttura database
- **Test funzionali** per verificare che tutto funzioni
- **Controlli di consistenza** dati
- **Test di performance** per verificare che non ci siano regressioni

### 4. **Sistema di Rollback**

- **SQL di rollback** generato automaticamente
- **Verifica sicurezza** rollback prima dell'esecuzione
- **Backup di emergenza** pre-rollback
- **Rollback a checkpoint** specifici

## 📋 Come Verificare il Successo

### Metodo 1: Automatico (Raccomandato)

```bash
# Deploy con verifica automatica
./deploy.sh production --backup

# Lo script eseguirà automaticamente:
# 1. Backup pre-migrazione
# 2. Applicazione migrazioni
# 3. Verifica completa post-migrazione
# 4. Report finale
```

### Metodo 2: Verifica Manuale

```bash
# Solo verifica (senza migrazioni)
cd database
node verify_migrations.js --env production --check-performance

# Controlla il codice di uscita:
# 0 = Tutto OK
# 1 = Errori critici trovati
# 2 = Avvisi (da controllare)
```

### Metodo 3: Verifica Dettagliata

```bash
# Verifica con report dettagliato
node verify_migrations.js --env production --detailed

# Genera file: verification_report_production_TIMESTAMP.json
```

## 🚨 Indicatori di Successo

### ✅ Migrazione Completata con Successo

```
📊 Riepilogo Verifica:
✅ Successi: 15
⚠️ Avvisi: 0
❌ Errori: 0
📊 Tasso successo: 100.00%

🎉 Verifica completata con successo!
Database pronto per uso in produzione.
```

### ⚠️ Migrazione con Avvisi

```
📊 Riepilogo Verifica:
✅ Successi: 13
⚠️ Avvisi: 2
❌ Errori: 0
📊 Tasso successo: 86.67%

⚠️ Verifica completata con avvisi
Raccomandato controllare gli avvisi prima di procedere.
```

### ❌ Migrazione Fallita

```
📊 Riepilogo Verifica:
✅ Successi: 8
⚠️ Avvisi: 1
❌ Errori: 3
📊 Tasso successo: 66.67%

🚨 ATTENZIONE: Trovati errori critici!
Controllare il report per dettagli e azioni correttive.
```

## 🔍 Controlli Eseguiti

### Test di Integrità Struttura

- ✅ Tabelle critiche esistenti
- ✅ Constraint di chiave esterna
- ✅ Trigger attivi
- ✅ Funzioni critiche
- ✅ Indici per performance

### Test Funzionali

- ✅ Compagnie possono avere hub
- ✅ Constraint rotte-hub attivo
- ✅ Nessun dato orfano
- ✅ Trigger timestamp funzionanti

### Test Consistenza Dati

- ✅ Relazioni integre
- ✅ Valori in range corretto
- ✅ Nessun dato corrotto
- ✅ Performance accettabili

## 🚀 Workflow di Deploy Sicuro

### Sviluppo

```bash
# Test locale
node run_migrations.js --env development --dry-run
node verify_migrations.js --env development

# Apply
node run_migrations.js --env development
```

### Staging

```bash
# Test su staging
./deploy.sh staging --dry-run

# Deploy staging
./deploy.sh staging --backup
```

### Produzione

```bash
# SEMPRE backup + verifica
./deploy.sh production --backup

# In caso di problemi - rollback sicuro
node rollback.js --env production --migration 006 --confirm
```

## 🆘 Procedure di Emergenza

### Rollback Sicuro

```bash
# Rollback ultima migrazione
node rollback.js --env production --migration 006 --confirm

# Rollback a checkpoint specifico
node rollback.js --env production --to-checkpoint checkpoint_pre_migration_006_1640995200 --confirm

# Dry run per vedere cosa farà
node rollback.js --env production --migration 006 --dry-run
```

### Ripristino da Backup

```bash
# Se il rollback non basta, ripristina da backup
pg_restore -h host -U user -d database backup_production_TIMESTAMP.sql

# Verifica dopo ripristino
node verify_migrations.js --env production
```

## 📊 Monitoraggio Continuo

### Status Migrazioni

```sql
-- Query per controllare status
SELECT
    migration_number,
    migration_name,
    status,
    executed_at
FROM schema_migrations
ORDER BY migration_number;
```

### Integrità Database

```sql
-- Esegui verifiche automatiche
SELECT * FROM verify_database_integrity();
SELECT * FROM run_migration_tests();
```

## ⚙️ Configurazione Notifiche

Aggiungi al file `.env.production`:

```bash
# Notifiche Slack per deploy
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
MIGRATION_NOTIFICATIONS=true

# Email per errori critici (opzionale)
SMTP_HOST=smtp.company.com
SMTP_USER=alerts@company.com
SMTP_PASS=password
ALERT_EMAIL=dev-team@company.com
```

## 🔒 Best Practices di Sicurezza

1. **Mai** eseguire migrazioni direttamente in produzione senza test
2. **Sempre** creare backup prima di migrazioni importanti
3. **Testare** rollback su staging prima di deploy produzione
4. **Monitorare** performance post-migrazione
5. **Documentare** ogni migrazione e i suoi effetti
6. **Mantenere** backup multipli con retention policy
7. **Verificare** che il team sia allertato dei deploy

## 📞 Supporto

In caso di problemi critici:

1. Controllare i log di verifica: `verification_report_*.json`
2. Eseguire diagnosi: `node verify_migrations.js --env production --detailed`
3. Se necessario, rollback: `node rollback.js --env production --migration X --confirm`
4. Ripristino da backup come ultima risorsa

Il sistema è progettato per essere **fail-safe**: in caso di dubbio, si ferma e richiede intervento manuale.
