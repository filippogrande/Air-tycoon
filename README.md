# Air Tycoon 2

> Ricreazione browser-based del gioco di gestione compagnie aeree *Air Tycoon 2*.
> Progetto personale/hobby: giocabile in locale, con salvataggio persistente su PostgreSQL.

Gestisci una compagnia aerea: compra aeromobili da un catalogo realistico, pianifica rotte
tra aeroporti di tutto il mondo su una mappa interattiva, e tieni in equilibrio i conti.

## Cosa puoi fare

- **Compagnia aerea**: crea partite, scegli scenario (dall'era pionieristica al 2024) e hub di partenza
- **Flotta**: acquisto aeromobili con drill-down produttore → categoria → modello, manutenzione e statistiche
- **Rotte**: creazione/modifica su mappa interattiva, analisi domanda e profittabilità
- **Economia**: bilancio, cash flow, report finanziari
- **Salvataggio**: persistente su PostgreSQL, con cache locale

## Stack

| Livello | Tecnologie |
|---------|------------|
| Frontend | JavaScript (globale su `window`, nessun build step), HTML5, CSS3, Leaflet |
| Backend | Node.js + Express, API REST |
| Dati | PostgreSQL, schema iniziale + migrazioni + seed |

Il frontend **non** usa ES6 `import`/`export` e i dati arrivano **sempre** dal database via API.
Le regole sono in `docs/CONVENTIONS.md`.

## Avvio rapido

```bash
npm install
cp .env.example .env      # credenziali PostgreSQL
bash database/reset_database.sh   # crea DB, schema e dati iniziali
npm run dev                        # -> http://localhost:3001
```

Oppure con Docker: `docker compose up --build` (DB su `5433`, app su `3001`).

Dettagli, comandi e produzione: `docs/OPERATIONS.md`.

## Documentazione

| File | Tipo | Contenuto |
|------|------|-----------|
| `AGENTS.md` | — | Radice: convenzione dei doc, mappa rapida |
| `docs/REFERENCE.md` | reference | **La mappa**: richiesta → file → entry point |
| `docs/ARCHITECTURE.md` | explanation | Come funziona (client/server, auth, DB, deploy) |
| `docs/CONVENTIONS.md` | how-to | Le regole di sviluppo |
| `docs/PAGES.md` | reference | Le pagine del gioco e cosa mostra ciascuna |
| `docs/OPERATIONS.md` | how-to | Avvio, deploy, comandi, troubleshooting |

Per una richiesta ("dove vive X?") si legge `docs/REFERENCE.md` e basta.

## Sviluppare

Leggi `AGENTS.md` e `docs/CONVENTIONS.md`. In breve: niente `import`/`export` nel frontend,
niente fallback che maschera errori API, max 500 righe/file.
Aggiungendo un endpoint aggiorna `server/openapi/`; spostando qualcosa aggiorna `docs/REFERENCE.md`
— **nella stessa PR**.

Il backlog di feature e i task di refactor vivono su **TickTick** (lista "Air tycoon").

## Licenza

Progetto a scopo personale/didattico. Vedi file `LICENSE` (se presente) per i dettagli.
