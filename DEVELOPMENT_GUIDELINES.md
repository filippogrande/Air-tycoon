# Air Tycoon 2 - Linee Guida per lo Sviluppo

> Versione 2.0 - Paletti vincolanti. Ogni regola qui sotto è OBBLIGATORIA, non un suggerimento.
> Ultimo aggiornamento: 13 agosto 2026

## 📋 Indice
1. [Regola 0 - Sistema Moduli (vincolante)](#regola-0)
2. [Struttura del Codice](#struttura-del-codice)
3. [Contratto di Load Order](#contratto-di-load-order)
4. [Single Source of Truth / Anti-duplicazione](#single-source-of-truth)
5. [Convenzioni JavaScript](#convenzioni-javascript)
6. [Gestione Dati (Database Only)](#gestione-dati)
7. [No Fallback / No Dati Finti](#no-fallback)
8. [UI/UX Guidelines](#uiux-guidelines)
9. [Performance](#performance)
10. [Sicurezza](#sicurezza)
11. [Testing](#testing)
12. [Lista Cose da Rimuovere (hard bans)](#rimuovere)
13. [Verifica Coerenza & Aggiornamento Doc](#coerenza)

---

## 🔒 Regola 0 - Sistema Moduli (DECISIONE VINCOLANTE) {#regola-0}

**Niente dibattito: il progetto NON usa ES6 `import`/`export`.**

- ❌ MAI `import` / `export` in alcun file `.js` del frontend.
- ✅ TUTTO viene esposto come global su `window`.
- Motivo: niente build step, serving diretto di `Client/src` via `/main-src`.
- Eccezione: solo `server/` (Node.js) può usare `require`/`import` CommonJS/ESM lato backend.

Pattern obbligatorio per esporre un modulo:
```javascript
// ✅ SEMPRE COSÌ
window.FleetTab = {
  init: function () {},
  showAircraftPurchase: function () {},
};

// ❌ MAI COSÌ
export class FleetTab {}
export function showAircraftPurchase() {}
```

I file che contengono ancora `import`/`export` frontend sono considerati BUG, non feature.

---

## 🏗️ Struttura del Codice {#struttura-del-codice}

```
Air-tycoon/
├── Client/                    # Frontend unificato (UNICA sorgente JS)
│   ├── src/                   # Codice JS servito via /main-src
│   │   ├── auth.js
│   │   ├── game-select.js
│   │   ├── load-game.js
│   │   ├── main.js            # UNICO orchestratore dell'avvio
│   │   ├── core/              # Game.js, GameState.js
│   │   ├── entities/
│   │   ├── managers/
│   │   ├── simulation/
│   │   ├── ui/
│   │   ├── utils/
│   │   └── graphics/
│   ├── pages/                 # HTML
│   ├── styles/                # CSS
│   └── assets/
├── server/                    # Backend Node.js (può usare require/import)
└── database/                  # Schema + migrazioni
```

Principi:
- Modularità: ogni file = una responsabilità. **Max 500 righe per file, max 50 righe per funzione.**
- Separare logica / UI / dati.
- Nessun file monolitico.

---

## 🔄 Contratto di Load Order {#contratto-di-load-order}

Con i global, l'ORDINE dei `<script>` determina se il `Game` si inizializza. Regola fissa:

1. `main.js` è l'UNICO punto che chiama le `init()`. Nessun altro modulo si auto-esegue al caricamento.
2. Ordine di caricamento obbligatorio in ogni HTML:
   ```html
   <!-- 1. utility e dipendenze base -->
   <script src="/main-src/utils/core-utils.js"></script>
   <!-- 2. core (Game, GameState) -->
   <script src="/main-src/core/GameState.js"></script>
   <script src="/main-src/core/Game.js"></script>
   <!-- 3. managers -->
   <script src="/main-src/managers/*.js"></script>
   <!-- 4. ui -->
   <script src="/main-src/ui/*.js"></script>
   <!-- 5. SOLO ALLA FINE l'orchestratore -->
   <script src="/main-src/main.js"></script>
   ```
3. Ogni modulo espone `window.X.init()`. `main.js` invoca gli `init()` in sequenza definita, NON prima che il DOM sia pronto (`DOMContentLoaded`).
4. Se un modulo dipende da un altro, NON leggere il global all'avvio: leggilo dentro `init()` (così si evitano dipendenze circolari e "Game non inizializzato").

Questo contratto risolve i bug ricorrenti: "Game object non si inizializza", "dipendenze circolari UI", "TypeError su global non pronto".

---

## 🎯 Single Source of Truth {#single-source-of-truth}

- `/main-src` → `Client/src` è l'UNICA cartella JS servita. Nessun altro path JS.
- **NON** esiste più `src/` alla root. Se presente, è da eliminare (vedi §rimuovere).
- Ogni funzionalità ha UN solo punto di verità. Niente copie.

---

## 📝 Convenzioni JavaScript {#convenzioni-javascript}

- Classi: `PascalCase` · Funzioni/variabili: `camelCase` · Costanti: `UPPER_CASE`.
- Sempre controllare l'esistenza degli elementi DOM prima di usarli.
- Usare `try-catch` solo per operazioni realmente rischiose; NON per silenziare errori.
- Accesso globale protetto:
  ```javascript
  function getGameRef() {
    if (!window.game) { console.warn("Game non inizializzato"); return null; }
    return window.game;
  }
  ```

---

## 🗄️ Gestione Dati (Database Only) {#gestione-dati}

- TUTTI i dati via API dal DB. **NO** dati hardcoded, **NO** `SimpleData.js`.
- Caching consentito SOLO con invalidazione esplicita (vedi `DataCache` nel vecchio esempio, da mantenere).

---

## 🚫 No Fallback / No Dati Finti {#no-fallback}

REGOLA FORTE (decisa dall'utente): data la natura dell'app e lo stato di sviluppo, **NON esistono metodi di fallback che simulano un successo non ottenuto**.

- ❌ Un `catch` che restituisce `[]`, `{}` o dati di comodo per "far sembrare" che tutto è andato bene.
- ❌ Funzioni che ritornano mock quando la fetch fallisce.
- ✅ In caso di errore API: mostrare `showError(...)`, loggare, e propagare l'errore. Meglio un fallimento VISIBILE che un successo FALSO.
- ✅ Se serve un valore di default per non rompere la UI, deve essere esplicito, documentato, e NON presentato come dato reale.

---

## 🎨 UI/UX Guidelines {#uiux-guidelines}

- Componenti modulari (pattern `window.Modulo = { init, ... }`).
- Mobile-first, responsive.
- Sempre feedback per azioni async: `showLoading()` → `showSuccess()` / `showError()` → `hideLoading()` nel `finally`.

---

## ⚡ Performance {#performance}

- Lazy loading dei dati non critici.
- Batch DOM updates (DocumentFragment), no reflow multipli.
- Pulire event listener, timer e interval non più necessari.

---

## 🔒 Sicurezza {#sicurezza}

- Validare SEMPRE input lato client (e comunque mai fidarsi: il server re-valida).
- Sanitizzare output con `textContent` / `safeHTML()` prima dell'inserimento nel DOM.

---

## 🧪 Testing {#testing}

- **NO** file di test temporanei (`test-*.html`, `*-test.js`) nel tree di produzione.
- **NO** HTML di debug linkati dalle pagine reali.
- Strumenti di debug (es. `debug-game.html`) SE mantenuti vivono SOLO in `Client/pages/debug/` e NON sono referenziati da `hub.html` o altre pagine di gioco.
- Testare sulla versione reale del sito; raccogliere feedback reale; iterare.

---

## ❌ Lista Cose da Rimuovere (HARD BANS) {#rimuovere}

Questi NON sono "graduali": se presenti, sono BUG da eliminare prima di qualsiasi nuova feature.

- [ ] **Root `src/`** - cartella duplicata di `Client/src`, da eliminare. Nessun riferimento `/src/` deve esistere.
- [ ] **`*_BACKUP.js` / `*_NEW.js`** (es. `RouteUIManager_BACKUP.js`, `RouteUIManager_NEW.js`) - vietati. Una sola versione per modulo.
- [ ] **`test_*.html`** (es. `test_route_ui.html`, `test_safe_route.html`) - vietati nel tree di produzione.
- [ ] **`import`/`export` ES6 residui** nel frontend - convertire a `window` attachments.
- [ ] Utilities duplicate - consolidare in un solo modulo.
- [ ] Funzioni/variabili non utilizzate e `console.log` di debug in produzione.

---

## 🔎 Verifica Coerenza & Aggiornamento Doc {#coerenza}

- Ogni modifica a un endpoint API → aggiornare `/server/openapi/`.
- Ogni feature/bugfix/refactor → aggiornare `DEVELOPMENT_GUIDELINES.md` e `PAGES_GUIDE.md`.
- Dopo modifiche importanti: ricontrollare che la doc corrisponda al codice REALE.

### Prima di ogni commit
1. Funzionalità modificate testate sulla versione reale
2. Zero errori in console
3. Responsive verificato
4. Integrazione API validata
5. Naming conventions rispettate
6. Nessun file vietato da §rimuovere introdotto

---

> 📌 **Backlog di sviluppo**: le feature da aggiungere e i refactor da fare sono tracciati su **TickTick** (lista "Air tycoon"), con priorità e sotto-task. Questo file definisce i *paletti* di sviluppo; il *cosa costruire dopo* vive su TickTick, non qui.
