# Air Tycoon 2 Clone

Un clone browser-based del gioco Air Tycoon 2 per uso personale.

## Caratteristiche

- Gestione compagnia aerea
- Acquisto e gestione aeromobili
- Pianificazione rotte
- Sistema economico
- Salvataggio locale dei progressi (localStorage)
- Salvataggio persistente con database PostgreSQL
- API REST per gestione dati
- Sistema ibrido: funziona offline (localStorage) e online (database)

## Tecnologie

### Frontend

- HTML5 Canvas per la grafica
- JavaScript ES6+ per la logica di gioco
- CSS3 per l'interfaccia utente
- LocalStorage per backup locale

### Backend

- Node.js con Express.js
- PostgreSQL per persistenza dati
- API REST per comunicazione frontend-backend
- Sistema di pool per connessioni database

## Setup e Installazione

### Prerequisiti

1. **Node.js** (versione 16 o superiore)
2. **PostgreSQL** (versione 12 o superiore)
3. **npm** (incluso con Node.js)

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Setup Database PostgreSQL

#### Opzione A: Setup Automatico (Raccomandato)

1. Copia il file di configurazione:

```bash
cp .env.example .env
```

2. Modifica il file `.env` con le tue credenziali PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=air_tycoon
NODE_ENV=development
PORT=3001
```

3. Esegui lo script di setup automatico:

```bash
npm run setup
```

Questo script:

- Crea automaticamente il database `air_tycoon`
- Esegue lo schema SQL (tabelle, indici, trigger)
- Inserisce i dati iniziali (aeroporti, tipi di aeromobili, eventi)

#### Opzione B: Setup Manuale

1. Accedi a PostgreSQL:

```bash
psql -U postgres
```

2. Crea il database:

```sql
CREATE DATABASE air_tycoon;
\q
```

3. Esegui lo schema:

```bash
psql -U postgres -d air_tycoon -f database/schema.sql
```

4. Inserisci i dati iniziali:

```bash
psql -U postgres -d air_tycoon -f database/initial_data.sql
```

### 3. Avvio del Server

#### Modalità Sviluppo (con auto-restart)

```bash
npm run dev
```

#### Modalità Produzione

```bash
npm start
```

Il server sarà disponibile su `http://localhost:3001`

### 4. Avvio del Gioco

Apri `index.html` in un browser moderno. Il gioco:

- Funziona immediatamente con localStorage (modalità offline)
- Si connette automaticamente al database se disponibile
- Sincronizza i salvataggi tra localStorage e database

## Struttura del Progetto

```
air-tycoon/
├── index.html                 # Pagina principale del gioco
├── package.json              # Dipendenze backend
├── .env.example              # Template configurazione
├── README.md                 # Questo file
│
├── src/                      # Frontend JavaScript
│   ├── core/                 # Logica principale del gioco
│   ├── entities/             # Entità di gioco (Aircraft, Airport, Route)
│   ├── managers/             # Gestori di sistema (Fleet, Route, Finance)
│   ├── ui/                   # Interfaccia utente
│   ├── graphics/             # Rendering grafico
│   ├── data/                 # Dati statici del gioco
│   └── utils/                # Utilities (SaveLoad, APIClient)
│
├── styles/                   # CSS del gioco
│   ├── main.css              # Stili principali
│   └── ui.css                # Stili interfaccia
│
├── server/                   # Backend Node.js
│   ├── index.js              # Server principale
│   ├── database.js           # Gestione pool PostgreSQL
│   └── routes/               # API REST endpoints
│       ├── game.js           # Gestione compagnie e salvataggi
│       ├── fleet.js          # Gestione flotta aeromobili
│       ├── routes.js         # Gestione rotte volo
│       ├── airports.js       # Dati aeroporti
│       └── finance.js        # Sistema finanziario
│
└── database/                 # File database
    ├── schema.sql            # Schema completo database
    ├── initial_data.sql      # Dati iniziali
    └── setup.js              # Script setup automatico
```

## API Endpoints

### Compagnie e Salvataggi

- `GET /api/game/companies` - Lista compagnie
- `POST /api/game/companies` - Crea nuova compagnia
- `GET /api/game/companies/:id` - Dettagli compagnia
- `POST /api/game/save` - Salva partita
- `GET /api/game/save/:id` - Carica salvataggio

### Flotta

- `GET /api/fleet/aircraft-types` - Tipi aeromobili disponibili
- `GET /api/fleet/company/:id` - Flotta compagnia
- `POST /api/fleet/purchase` - Acquista aeromobile
- `PUT /api/fleet/:id` - Aggiorna aeromobile
- `DELETE /api/fleet/:id` - Vendi aeromobile

### Rotte

- `GET /api/routes/company/:id` - Rotte compagnia
- `POST /api/routes` - Crea nuova rotta
- `PUT /api/routes/:id` - Aggiorna rotta
- `DELETE /api/routes/:id` - Elimina rotta

### Aeroporti

- `GET /api/airports` - Lista aeroporti (con filtri)
- `GET /api/airports/:id` - Dettagli aeroporto
- `GET /api/airports/near/:lat/:lng` - Aeroporti vicini

### Finanze

- `GET /api/finance/company/:id` - Record finanziari
- `GET /api/finance/summary/:id` - Riassunto finanziario
- `POST /api/finance/transaction` - Aggiungi transazione

## Funzionalità

### Sistema di Salvataggio Ibrido

- **LocalStorage**: Backup automatico locale, funziona offline
- **Database**: Salvataggio persistente e sincronizzazione
- **Compatibilità**: Il gioco funziona anche senza database
- **Sincronizzazione**: I salvataggi si sincronizzano automaticamente

### Gestione Flotta

- Acquisto aeromobili da catalogo realistico
- Manutenzione e gestione condizione
- Statistiche performance e costi operativi

### Sistema Rotte

- Creazione rotte tra aeroporti mondiali
- Programmazione voli automatica
- Analisi profittabilità rotte

### Sistema Finanziario

- Tracking entrate/uscite dettagliato
- Report profitti e perdite
- Analisi flusso di cassa
- Categorizzazione spese automatica

## Comandi Utili

```bash
# Setup iniziale completo
npm run setup

# Avvio sviluppo
npm run dev

# Avvio produzione
npm start

# Reset database (elimina tutti i dati!)
npm run db:reset

# Test connessione database
curl http://localhost:3001/health
```

## Troubleshooting

### Errore Connessione Database

1. Verifica che PostgreSQL sia in esecuzione
2. Controlla credenziali nel file `.env`
3. Assicurati che il database `air_tycoon` esista

### Il gioco non si connette al server

1. Verifica che il server sia avviato (`npm start`)
2. Controlla la porta nel file `.env` (default: 3001)
3. Il gioco funziona anche senza server (modalità localStorage)

### Errori CORS

- Il server è configurato per accettare richieste da `localhost`
- Se necessario, modifica `CORS_ORIGIN` nel file `.env`

## Sviluppo

Il progetto è strutturato per essere facilmente estendibile:

- **Nuovo tipo di aeromobile**: Aggiungi a `database/initial_data.sql`
- **Nuova API**: Crea file in `server/routes/`
- **Nuova funzionalità frontend**: Aggiungi in `src/`
- **Nuova tabella database**: Modifica `database/schema.sql`

## Note

- Il gioco mantiene compatibilità completa con la versione localStorage
- Il database migliora l'esperienza ma non è obbligatorio
- Tutti i salvataggi localStorage vengono automaticamente sincronizzati al database
- Il sistema è progettato per funzionare in modo resiliente (fallback automatico)
