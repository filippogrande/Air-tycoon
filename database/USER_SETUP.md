# Setup Utente PostgreSQL per Air Tycoon 2

## Creazione Utente Dedicato

### 1. Accedi a PostgreSQL come superuser

```bash
sudo -u postgres psql
```

### 2. Crea l'utente airtycoon

```sql
-- Crea utente con password
CREATE USER airtycoon WITH PASSWORD 'airtycoon2024!';

-- Assegna permessi
ALTER USER airtycoon CREATEDB;
ALTER USER airtycoon LOGIN;

-- Crea database
CREATE DATABASE air_tycoon OWNER airtycoon;

-- Assegna tutti i privilegi sul database
GRANT ALL PRIVILEGES ON DATABASE air_tycoon TO airtycoon;

-- Esci
\q
```

### 3. Test connessione con nuovo utente

```bash
psql -U airtycoon -d air_tycoon -h localhost
```

### 4. Configurazione .env

Crea il file `.env` copiando `.env.example`:

```bash
cp .env.example .env
```

Il file dovrebbe contenere:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=air_tycoon
DB_USER=airtycoon
DB_PASSWORD=airtycoon2024!
NODE_ENV=development
PORT=3001
```

### 5. Avvia setup automatico

```bash
npm run setup
```

## Troubleshooting

### Se l'utente esiste già:

```sql
DROP USER IF EXISTS airtycoon;
```

### Se il database esiste già:

```sql
DROP DATABASE IF EXISTS air_tycoon;
```

### Verifica permessi:

```sql
\du airtycoon
\l air_tycoon
```

### Reset completo:

```sql
DROP DATABASE IF EXISTS air_tycoon;
DROP USER IF EXISTS airtycoon;
```

Poi ricrea tutto da capo seguendo i passi sopra.

## Note di Sicurezza

- In produzione, usa una password più complessa
- Considera l'uso di certificati SSL per la connessione
- Limita l'accesso di rete se necessario
- Fai backup regolari del database
