# Air Tycoon 2 - Linee Guida per lo Sviluppo

## 📋 Indice

1. [Struttura del Codice](#struttura-del-codice)
2. [Architettura Unificata](#architettura-unificata)
3. [Convenzioni JavaScript](#convenzioni-javascript)
4. [Gestione Dati](#gestione-dati)
5. [UI/UX Guidelines](#uiux-guidelines)
6. [Performance e Ottimizzazione](#performance-e-ottimizzazione)
7. [Sicurezza](#sicurezza)
8. [Lista delle Cose da Fare](#lista-delle-cose-da-fare)
9. [Lista delle Cose da Rimuovere](#lista-delle-cose-da-rimuovere)

---

## 🏗️ Struttura del Codice

### Architettura Generale

Il progetto segue un'architettura **modulare unificata** con le seguenti caratteristiche:

```
Air-tycoon/
├── Client/                    # Frontend unificato (sorgente principale)
│   ├── src/                   # Codice JavaScript principale
│   │   ├── auth.js           # Autenticazione
│   │   ├── game-select.js    # Selezione partita
│   │   ├── load-game.js      # Caricamento gioco
│   │   ├── main.js           # Entry point principale
│   │   ├── core/             # Logica di base
│   │   ├── entities/         # Entità di gioco (Company, Fleet, ecc.)
│   │   ├── managers/         # Manager di sistema
│   │   ├── simulation/       # Logica di simulazione
│   │   ├── ui/               # Componenti UI
│   │   │   ├── modules/      # Moduli UI specializzati
│   │   │   └── FleetTab.js   # Sistema acquisto aeromobili
│   │   ├── utils/            # Utilità condivise
│   │   └── graphics/         # Grafici e visualizzazioni
│   ├── pages/                # Pagine HTML
│   ├── styles/               # CSS
│   └── assets/               # Risorse statiche (immagini, ecc.)
├── server/                   # Backend Node.js
└── database/                 # Schema e migrazioni DB
```

### Principi Architetturali

#### 1. **Modularità**

- Ogni modulo deve avere una responsabilità specifica e minimale, in maniera da poterli facilmente riutilizzare o modificare in caso di errori
- Evitare file monolitici > 500 righe
- Separare logica, UI e dati

#### 2. **Sistema Unificato (/main-src)**

- Tutti i file JS vengono serviti tramite `/main-src` che punta a `Client/src`
- **NON** duplicare codice tra `/src` e `/Client/src`
- Un solo punto di verità per ogni funzionalità

#### 3. **Compatibilità Browser**

- **NO** ES6 modules (import/export)
- **SÌ** Global window attachments
- Supportare script loading tradizionale

---

## 🔄 Architettura Unificata

### Serving dei File

```javascript
// server/index.js
app.use("/main-src", express.static(path.join(__dirname, "../Client/src")));
```

### Caricamento Script

```html
<!-- Esempio in hub.html -->
<script src="/main-src/utils/core-utils.js"></script>
<script src="/main-src/managers/GameState.js"></script>
<script src="/main-src/main.js"></script>
```

### Export Pattern

```javascript
// ❌ NON FARE (ES6 modules)
export class MyClass {}
export function myFunction() {}

// ✅ FARE (Global attachments)
window.MyClass = class MyClass {};
window.myFunction = function () {};

// Per moduli complessi
window.MyModule = {
  init: function () {},
  doSomething: function () {},
};
```

---

## 📝 Convenzioni JavaScript

### 1. **Naming Conventions**

```javascript
// Classi: PascalCase
class CompanyManager {}

// Funzioni: camelCase
function loadGameData() {}

// Costanti: UPPER_CASE
const MAX_AIRCRAFT_COUNT = 100;

// Variabili: camelCase
let currentCompany = null;
```

### 2. **Gestione Errori**

```javascript
// Sempre controllare esistenza elementi DOM
const element = document.getElementById("my-id");
if (element) {
  element.addEventListener("click", handleClick);
} else {
  console.warn("Elemento my-id non trovato");
}

// Usare try-catch per operazioni rischiose
try {
  const data = JSON.parse(response);
  return data;
} catch (error) {
  console.error("Errore parsing JSON:", error);
  return null;
}
```

### 3. **Accesso Sicuro alle Variabili Globali**

```javascript
// ✅ BUONO - Controllo esistenza
function updateUI() {
  if (window.game && window.game.currentCompany) {
    // Procedi con l'aggiornamento
  }
}

// ✅ BUONO - Utility per accesso sicuro
function getGameRef() {
  if (!window.game) {
    console.warn("Game object non inizializzato");
    return null;
  }
  return window.game;
}
```

---

## 🗄️ Gestione Dati

### Principio Fondamentale: **Database Only**

- **TUTTI** i dati devono venire dal database via API
- **NO** dati hardcoded nel JavaScript
- **NO** SimpleData.js o simili

### API Endpoints

```javascript
// ✅ CORRETTO - Dati dal database
const airports = await fetch("/api/airports").then((r) => r.json());
const aircraftData = await fetch("/api/game/aircraft-data").then((r) =>
  r.json()
);
const companies = await fetch(`/api/game/companies/${companyId}`).then((r) =>
  r.json()
);

// ❌ SBAGLIATO - Dati hardcoded
const airports = SimpleData.airports; // NON FARE MAI
```

### Caching Intelligente

```javascript
// Cache con invalidazione
const DataCache = {
  airports: null,
  aircraftData: null,

  async getAirports() {
    if (!this.airports) {
      this.airports = await fetch("/api/airports").then((r) => r.json());
    }
    return this.airports;
  },

  invalidate(key) {
    this[key] = null;
  },
};
```

---

## 🎨 UI/UX Guidelines

### 1. **Componenti Modulari**

```javascript
// Esempio: FleetTab.js
window.FleetTab = {
  init: function () {},
  showAircraftPurchase: function () {},
  updateFleetDisplay: function () {},
};
```

### 2. **Responsive Design**

- Mobile-first approach
- Test su diverse risoluzioni
- UI adattiva per schermi piccoli

### 3. **Feedback Utente**

```javascript
// Sempre fornire feedback per azioni asincrone
showLoading("Caricamento aeromobili...");
try {
  const data = await fetch("/api/aircraft");
  showSuccess("Aeromobili caricati con successo");
} catch (error) {
  showError("Errore nel caricamento aeromobili");
} finally {
  hideLoading();
}
```

---

## ⚡ Performance e Ottimizzazione

### 1. **Lazy Loading**

- Caricare dati solo quando necessari
- Evitare fetch inutili

### 2. **DOM Manipulation**

```javascript
// ✅ BUONO - Batch updates
const fragment = document.createDocumentFragment();
items.forEach((item) => {
  const element = createElement(item);
  fragment.appendChild(element);
});
container.appendChild(fragment);

// ❌ CATTIVO - Multiple reflows
items.forEach((item) => {
  container.appendChild(createElement(item));
});
```

### 3. **Memory Management**

- Rimuovere event listener non necessari
- Pulire timers e intervals
- Evitare closure che mantengono riferimenti

---

## 🔒 Sicurezza

### 1. **Validazione Input**

```javascript
function validateCompanyId(id) {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new Error("Company ID non valido");
  }
  return id.trim();
}
```

### 2. **Sanitizzazione Output**

```javascript
function safeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
```

---

## ✅ Lista delle Cose da Fare (dopo la completazione del sito basilare, non ancora ottenuta)

### Priorità Alta

- [ ] **Migliorare sistema aircraft purchase**

  - [ ] Aggiungere filtri avanzati (prezzo, capacità, range)
  - [ ] Implementare comparazione aeromobili

- [ ] **Ottimizzare performance**
  - [ ] Implementare virtual scrolling per liste lunghe
  - [ ] Caching intelligente dei dati
  - [ ] Compressione delle immagini aircraft

### Priorità Media

- [ ] **UI/UX Improvements**

  - [ ] Dark mode toggle
  - [ ] Animazioni per transizioni
  - [ ] Tooltips informativi

- [ ] **Sistema di routing**

  - [ ] Completare RouteUIManager modularization
  - [ ] Aggiungere calcolo fuel costs
  - [ ] Sistema di slot aeroportuali

- [ ] **Reporting e Analytics**
  - [ ] Dashboard finanziario
  - [ ] Grafici performance

### Priorità Bassa

- [ ] **Funzionalità avanzate**
  - [ ] Sistema eventi random
  - [ ] AI competitors

---

## ❌ Lista delle Cose da Rimuovere (e anche da non aggiungere)

### Immediatamente

- [x] ~~**SimpleData.js** - Completamente rimosso~~
- [x] ~~**Sistema Guest Access** - Rimosso (non necessario per gioco persistente)~~
- [ ] **Codice duplicato** (da fare man mano che esaminiamo le varie funzioni e pagine del sito)
- [ ] **Qualsiasi tipologia di fallback** dato la tipologia dell'app e lo stato di sviluppo non ha senso avere metodi di fallback che fanno sembrare che hai ottenuto dei dati che invece non sei riuscito ad ottenere

  - [ ] Rimuovere tutti i file in `/src` (se ancora presenti)
  - [ ] Consolidare utilities duplicate
  - [ ] Eliminare funzioni non utilizzate

- [ ] **Riferimenti /src/ legacy**

  - [ ] Convertire tutti i riferimenti `/src/` in `/main-src/` nelle pagine HTML
  - [ ] Aggiornare Client/pages/game/select.html per usare sistema unificato
  - [ ] Aggiornare Client/pages/auth/login.html per usare sistema unificato
  - [ ] Rimuovere file HTML di test obsoleti (test_route_ui.html, test_safe_route.html)

- [ ] **Import/Export ES6 residui**
  - [ ] Cercare e rimuovere tutti gli `import`/`export`
  - [ ] Convertire a window attachments
  - [ ] Testare compatibilità browser

### Gradualmente

- [ ] **Codice legacy**

  - [ ] Vecchi commenti TODO risolti
  - [ ] Console.log di debug in produzione
  - [ ] Variabili non utilizzate

- [ ] **Dependencies non necessarie**
  - [ ] Librerie JS non utilizzate
  - [ ] CSS rules obsolete
  - [ ] Immagini non referenziate

### Da Refactoring

- [ ] **Codice monolitico**
  - [ ] File > 500 righe da spezzare
  - [ ] Funzioni > 50 righe da semplificare
  - [ ] Classi con troppe responsabilità

---

## � Bug Fix Completati

### Sistema Aeroporti e Modali

- [x] ~~**Warning AirportData non disponibile** - Convertito game-select.js per usare API /api/airports invece di SimpleData~~
- [x] ~~**TypeError populateStartingAirports** - Spostato caricamento aeroporti nel momento corretto (apertura modal hub)~~
- [x] ~~**Errore select.innerHTML null** - Aggiunto controllo esistenza elementi DOM prima dell'uso~~

### Sistema Autenticazione

- [x] ~~**TypeError guestBtn.addEventListener** - Rimosso sistema guest access e aggiunto controlli di sicurezza~~
- [x] ~~**Errore elementi DOM mancanti** - Aggiunta validazione esistenza elementi prima di aggiungere event listener~~

---

## 📖 Come usare PAGES_GUIDE.md

Il file `PAGES_GUIDE.md` contiene la mappa funzionale e lo stato di implementazione di tutte le pagine, modali e sottosistemi dell'applicazione.

**Utilizzo consigliato:**

- Consulta la sezione relativa alla pagina/modulo su cui stai lavorando per vedere cosa è già implementato, cosa manca e lo stato attuale.
- Aggiorna il file ogni volta che completi una funzionalità, risolvi un bug o modifichi la struttura di una pagina.
- Usa le checklist e gli status (✅, 🟡, ❌) per tenere traccia dell'avanzamento.
- Segnala in PAGES_GUIDE.md anche le dipendenze tra moduli e le note di refactoring.

**Best practice:**

- Non cancellare lo storico: aggiungi sempre le nuove implementazioni come checklist.
- Mantieni la documentazione aggiornata e coerente con lo stato reale del codice.

## 📚 Obbligo di aggiornare la documentazione API

- Ogni volta che viene modificato, aggiunto o rimosso un endpoint API, è obbligatorio aggiornare la documentazione in `/server/openapi/`.
- Ricontrollare che la documentazione API sia coerente con il comportamento effettivo del backend.

## 🔎 Verifica coerenza tra codice e documentazione

- Dopo ogni modifica importante, ricontrollare che la documentazione (sia tecnica che funzionale) corrisponda allo stato reale del codice.
- In caso di refactoring, bugfix o nuove feature, aggiornare sia `DEVELOPMENT_GUIDELINES.md` che `PAGES_GUIDE.md`.

---

## �📚 Risorse e Riferimenti

- **API Documentation**: `/server/openapi/`
- **Database Schema**: `/database/schema_base.sql`
- **Project Architecture**: `/PROJECT_ARCHITECTURE.md`
- **Migration Guide**: `/database/MIGRATIONS_GUIDE.md`

---

## 📝 Note per Sviluppatori

### Prima di ogni commit:

1. ✅ Testare tutte le funzionalità modificate
2. ✅ Verificare zero errori in console browser
3. ✅ Controllare responsive design
4. ✅ Validare integrazione API
5. ✅ Seguire naming conventions

### Testing e Debug

#### **NO Test Modal o File di Test**

- **NON** creare file di test temporanei (es. test-delete-modal.html)
- **NON** creare script di test separati per singole funzionalità
- **SÌ** testare direttamente sulla versione reale del sito

#### **Processo di Testing**

1. **Implementa** le modifiche al codice
2. **Chiedi all'utente** di testare la funzionalità specifica
3. **Raccogli feedback** sui risultati dei test
4. **Itera** in base ai risultati reali

#### **Vantaggi Testing Reale**

- Test più accurati e puntuali
- Nessun overhead di file temporanei
- Feedback immediato su problemi reali
- Ambiente di test identico a quello di produzione

### Code Review Checklist:

- [ ] Codice modulare e ben organizzato
- [ ] Gestione errori appropriata
- [ ] Performance ottimali
- [ ] Sicurezza validata
- [ ] Documentazione aggiornata
- [ ] **Test reali completati dall'utente**

_Ultimo aggiornamento: 21 agosto 2025_
_Versione: 1.0_
