# CONVENTIONS — Air Tycoon 2

> **Tipo: how-to.** Le regole. Non descrivere qui come funziona il sistema (→ `docs/ARCHITECTURE.md`).
> Origine: `DEVELOPMENT_GUIDELINES.md` v2.1 (ora eliminato da questa PR).

## Regola 0 — Sistema moduli (vincolante)

**Il progetto NON usa ES6 `import`/`export` nel frontend.**

- ❌ Mai `import` / `export` in un file `.js` servito al browser.
- ✅ Tutto viene esposto come globale su `window`.
- Motivo: nessun build step, `Client/src` è servito via `/main-src`.
- Eccezione: `server/` (Node.js) può usare `require`.

Pattern obbligatorio:

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

Unica eccezione reale nel repo: `Client/src/pages/hubPage.js` è caricato con
`<script type="module">` in `Client/pages/hub.html`. È una deviazione dalla Regola 0 da segnalare,
non un precedente da seguire.

## Contratto di load order

`Client/pages/hub.html` elenca i `<script>` in ordine. L'ordine è il contratto:

```
entità (Aircraft, Airport, Route)
  → core (GameState, Game)
  → manager (Fleet, Route, Finance, Hub, DemandEstimation, Infrastructure)
  → utils (gameUtils, uiUtils, APIClient, AuthManager, RouteCalculator, MapVisibility, SaveLoad, load-game)
  → ui (SettingsOverlay, gameMenuEvents)
  → moduli rotta (RouteStateManager, RoutePanelManager, RouteAircraftManager,
                  RouteDemandAnalysisManager, RouteMarketAnalysisManager,
                  RouteCreationManager, RouteCalculationUtils, RouteEventManager)
  → RouteUIManager
  → UIManager
  → WorldMap
  → FleetTab
  → hubPage.js
  → engine (EconomyEngine)
  → main.js
```

`main.js` verifica che tutte le classi richieste esistano su `window` prima di istanziare `Game`:
se ne manca una, mostra un errore invece di fallire in modo opaco.

## Single source of truth / anti-duplicazione

- I dati arrivano **sempre** dal database via API; mai da dati hardcoded nel client.
- Un solo doc per concetto. Se due doc dicono la stessa cosa, si consolidano.
- Una sola versione per modulo: niente `*_BACKUP.js` / `*_NEW.js` nel tree di produzione.
- I debug, se servono, vivono solo in `Client/pages/debug/` e non sono linkati da `hub.html`.

## Convenzioni JavaScript

- Stile: `function` declaration + prototype o oggetti letterali su `window`; niente classe ES6 nel frontend.
- Niente `console.log` di debug in produzione.
- Niente fallback che maschera un errore API: se l'endpoint fallisce, l'errore va mostrato,
  non sostituito con `[]` o `{}`.

## Gestione dati (solo database)

- Tutto ciò che deve persistere passa da PostgreSQL. `SaveLoad` è "server-first".
- Le migrazioni devono essere **idempotenti** (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).
- Non modificare una migrazione già eseguita: se ne crea una nuova.
- Ogni manifest di dipendenze deve avere la sua voce in `.github/dependabot.yml`, aggiornata
  **nella stessa PR** in cui si aggiunge o modifica il manifest.

## Struttura del codice

- File `.js` del frontend: max 500 righe.
- Funzioni: max 50 righe.
- Pagine HTML in `Client/pages/`, controller in `Client/src/pages/`, CSS in `Client/styles/`.
- Aggiungendo un endpoint, aggiornare `server/openapi/` **nella stessa PR**.
- Aggiungendo/spostando una pagina, aggiornare `docs/PAGES.md` **nella stessa PR**.
- Spostando/rimuovendo qualcosa, aggiornare `docs/REFERENCE.md` **nella stessa PR**.

## Sicurezza

- Niente segreti nei doc: niente token, password, chat_id, path di credential.
- Password: hashing SHA-256 lato server (vedi `docs/ARCHITECTURE.md`); la validazione client chiede ≥ 6 caratteri.
- Rotte di amministrazione: `server/routes/admin.js` usa una allowlist di tabelle (`allowedTables`).

## Doc: le regole

1. Un doc che mente è peggio di nessun doc: va corretto o cancellato nella stessa PR.
2. Mai numeri di riga nelle mappe.
3. Una riga per richiesta, non per area.
4. I doc stanno in `docs/`, pochi file consolidati per scope.
5. In root solo: README, manifest del linguaggio, `.gitignore`, Dockerfile, compose, deploy.
6. File `.md` a 0 byte: eliminati, non preservati.
7. Non aggiungere `.gitignore` né toccare file già tracciati.
