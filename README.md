# Air Tycoon 2

> Ricreazione browser-based del gioco di gestione compagnie aeree *Air Tycoon 2*.
> Progetto personale/hobby: giocabile subito in locale, con salvataggio persistente su database.

Gestisci una compagnia aerea: compra aeromobili da un catalogo realistico, pianifica rotte
tra aeroporti di tutto il mondo su una mappa interattiva, e tieni in equilibrio i conti.

## ✨ Cosa puoi fare

- **Compagnia aerea**: crea partite, scegli scenario (dall'era pionieristica al 2024) e hub di partenza
- **Flotta**: acquisto aeromobili con drill-down produttore → categoria → modello, manutenzione e statistiche
- **Rotte**: creazione/modifica su mappa interattiva, analisi domanda e profittabilità
- **Economia**: bilancio, cash flow, prestiti, report finanziari
- **Salvataggio**: locale (localStorage) e persistente (PostgreSQL) con sincronizzazione

## 🛠️ Stack tecnologico

| Livello | Tecnologie |
|---------|------------|
| Frontend | JavaScript (pattern global `window`, nessun build step), HTML5, CSS3, Leaflet (mappa) |
| Backend | Node.js + Express, API REST |
| Dati | PostgreSQL, sistema migrazioni, pool connessioni |

> Il frontend **non** usa ES6 `import`/`export` (tutto esposto su `window`) e i dati
> provengono **sempre** dal database via API. Vedi `DEVELOPMENT_GUIDELINES.md` per i paletti.

## 🚀 Quick Start

### Prerequisiti
- Node.js ≥ 16, npm, PostgreSQL ≥ 12

### Installazione
```bash
npm install
cp .env.example .env      # inserisci le tue credenziali PostgreSQL
npm run setup             # crea DB, schema e dati iniziali
```

### Avvio
```bash
npm run dev               # sviluppo (auto-restart)  → http://localhost:3001
npm start                 # produzione
```
Apri `index.html` in un browser. Funziona anche offline (solo localStorage) e si sincronizza
col database quando disponibile.

### Comandi utili
```bash
npm run db:reset                     # reset DB (ATTENZIONE: elimina tutti i dati)
curl http://localhost:3001/health    # test connessione server
```

## 📚 Documentazione

| File | Contenuto |
|------|-----------|
| `PROJECT_ARCHITECTURE.md` | Struttura completa del progetto e flusso architetturale |
| `PAGES_GUIDE.md` | Mappa funzionale delle pagine e stato di implementazione |
| `DEVELOPMENT_GUIDELINES.md` | **Paletti vincolanti** di sviluppo (Regola 0, load order, no-fallback) |

Il backlog di feature e i task di refactor vivono su **TickTick** (lista "Air tycoon").

## 🤝 Sviluppare

Prima di contribuire, leggi `DEVELOPMENT_GUIDELINES.md`: definisce regole obbligatorie
(es. niente `import`/`export` ES6 nel frontend, niente fallback che mascherano errori,
max 500 righe/file). Aggiungendo un endpoint, aggiorna `/server/openapi/`.

## 📄 Licenza

Progetto a scopo personale/didattico. Vedi file `LICENSE` (se presente) per i dettagli.

---

_Ultimo aggiornamento: 13 agosto 2026_
