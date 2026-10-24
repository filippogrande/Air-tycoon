# PAGES — Air Tycoon 2

> **Tipo: reference di dettaglio.** Le pagine del gioco, cosa mostra ciascuna e quali file le implementano.
> Come funziona il routing → `docs/ARCHITECTURE.md`.

## Come si navigano

Il server serve `Client/pages` sotto `/game` (`server/index.js`: `app.use('/game', express.static(...))`)
e mappa `/game/index.html` → `Client/pages/hub.html`. Le pagine sono file HTML separati,
non una SPA: la navigazione è `window.location.href` più `sessionStorage.selectedCompanyId`.

```
/game/index.html      -> hub.html          (hub di gioco)
/game/game/select.html                        (selezione / nuovo gioco)
/game/auth/login.html                         (login / registrazione)
```

## Pagine

### Hub di gioco — `Client/pages/hub.html`

Entry point del gioco. Contiene header (nome compagnia, soldi, reputazione, data, bottone
impostazioni), la barra dei tab e i contenitori tab.

| Tab | Contenuto | Moduli che lo riempiono |
|---|---|---|
| `world` | Mappa Leaflet + bottone "Crea Rotta" | `WorldTab.js`, `graphics/WorldMap.js` |
| `fleet` | Lista flotta + "Acquista Aeromobile" | `ui/FleetTab.js`, `ui/aircraft-purchase.js` |
| `routes` | Lista rotte attive + "Aggiungi Rotta" | `ui/RouteUIManager.js`, `ui/modules/Route*.js` |
| `finances` | Bilancio, cash flow, transazioni | `ui/FinancesTab.js` (**stub**) |
| `infrastructure` | Ferrovie / autostrade / alta velocità per regione | `managers/InfrastructureManager.js`, `ui/UIManager.js` (`updateInfrastructureUI`) |
| `research` | — | `ui/ResearchTab.js` (**stub**) |

I tab sono inizializzati **lazy** al primo click: `Client/src/pages/hubPage.js` mappa ogni `data-tab`
alla funzione `window.init*Tab` e la chiama una sola volta.

Modali caricati dinamicamente in `hub.html` (`modalTemplates`): `aircraft-modal`,
`route-modal`, `game-menu-modal`, `settings-overlay`.

### Selezione gioco — `Client/pages/game/select.html`

Lista dei salvataggi dell'utente (`#saves-container`), bottone "Nuovo Gioco" e "Inizia Prima
Partita". Modali: `#new-game-modal` (nuovo gioco), `#delete-modal` (elimina salvataggio),
`#select-hub-modal` (drill-down continente → nazione → aeroporto).

Controller: `Client/src/game-select.js`. CSS: `Client/styles/game-select.css`.
Endpoint usati: `GET /api/game/companies` (lista), `DELETE /api/game/companies/:id` (elimina),
`GET /api/airports` con filtri `size`/`before`/`continent`/`country` (hub).

### Login / registrazione — `Client/pages/auth/login.html`

Due form nella stessa pagina (`#login-form`, `#register-form`), più "Gioca come Ospite".
Controller: `Client/src/auth.js`. CSS: `Client/styles/auth.css`.
Endpoint: `POST /api/auth/login`, `POST /api/auth/register`.

### Acquisto aeromobile — `Client/pages/game/aircraft-purchase.html`

Pagina di configurazione dell'acquisto, raggiunta da `ui/aircraft-purchase.js` (`attemptPurchase`)
con `?aircraft_id=...&company_id=...`.

### File HTML di root (non serviti dal routing del gioco)

| File | Cosa è |
|---|---|
| `auth.html` | Copia standalone della pagina di login (carica `styles/auth.css` relativo) |
| `game-select.html` | Copia standalone della selezione gioco |
| `db-viewer.html` | Visualizzatore database lato browser (26 KB) |

> `db-viewer.html` non è linkato da `hub.html`. Il visualizzatore **servito dal server** è la
> rotta `/db-viewer` in `server/routes/db-viewer.js`; il file root è una versione client-side
> che confronta `localStorage` e `/api/admin/*`.

## Pagine e modali in `Client/pages/`

| File | Ruolo |
|---|---|
| `Client/pages/hub.html` | Hub di gioco |
| `Client/pages/auth/login.html` | Login / registrazione |
| `Client/pages/game/select.html` | Selezione / nuovo gioco |
| `Client/pages/game/aircraft-purchase.html` | Configurazione acquisto |
| `Client/pages/game/map.html` | 114 byte — stub non linkato |
| `Client/pages/game/route-panels.html` | 137 byte — stub non linkato |
| `Client/pages/templates/finances-tab.html` | Template tab Finanze |
| `Client/pages/templates/research-tab.html` | Template tab Ricerca (153 byte, stub) |
| `Client/pages/templates/route-panels.html` | Template pannelli rotta |
| `Client/pages/modals/aircraft-modal.html` | Modale aeromobile (323 byte, stub) |
| `Client/pages/modals/delete-modal.html` | Modale conferma eliminazione |
| `Client/pages/modals/game-menu-modal.html` | Menu di gioco |
| `Client/pages/modals/new-game-modal.html` | Nuovo gioco + elimina salvataggio |
| `Client/pages/modals/route-modal.html` | Modale rotta (778 byte) |
| `Client/pages/modals/select-hub-modal.html` | Selezione hub step-by-step |
| `Client/pages/modals/settings-overlay.html` | Overlay impostazioni |

## Flusso utente

```
/game/index.html
  ├─ non autenticato      -> /game/auth/login.html
  ├─ autenticato, no company -> /game/game/select.html
  └─ autenticato + company  -> hub (index.html)

/game/game/select.html
  ├─ carica un salvataggio -> /game/index.html
  └─ nuovo gioco -> modale nuovo gioco -> modale hub -> /game/index.html
```

## Stati di implementazione

| Elemento | Stato |
|---|---|
| Tab Mappa + mappa Leaflet | ✅ funzionante |
| Tab Flotta + acquisto drill-down 4 colonne | ✅ funzionante |
| Tab Rotte + creazione rotta | ✅ funzionante |
| Tab Infrastrutture | ✅ funzionante |
| Tab Finanze | ⚠️ stub (`initFinancesTab` logga e basta) |
| Tab Ricerca | ⚠️ stub (`initResearchTab` logga e basta) |
| Login / registrazione | ✅ funzionante |
| Selezione gioco + hub step-by-step | ✅ funzionante |
| Sessione server-side (JWT) | ❌ `GET /api/auth/verify` è un placeholder |

## Limiti noti

- `Client/pages/game/map.html` e `Client/pages/game/route-panels.html` sono stub da 114 e 137 byte,
  non linkati da `hub.html`.
- `Client/src/ui/modules/RouteEventManager.js` è a 0 byte: la lista dei "8 moduli rotta" in
  `docs/REFERENCE.md` include un file vuoto. Non corretto in questa PR.
- Il backbone di routing è unico (`hub.html`); le pagine non condividono un layout comune.
