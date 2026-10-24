# AGENTS.md — Air Tycoon 2

> Radice del repo. Questo file è l'unico che si legge **sempre**.
> La mappa richiesta → file → entry point è in `docs/REFERENCE.md`.

## Cosa è

Ricreazione browser del gioco di gestione compagnia aerea *Air Tycoon 2*.
Frontend statico (JS su `window`, nessun build step) + server Express/Node + PostgreSQL.
Giocabile in locale con dati persistenti sul database.

## Convenzione dei doc

Un solo file letto per richiesta, al massimo **2 salti** dalla radice:

```
AGENTS.md  ->  docs/REFERENCE.md  ->  <file reale>
   (radice)      (la mappa)          (la foglia)
```

I doc sono in `docs/`, pochi file consolidati per scope. Tipi:

| Tipo | Dove |
|------|-------|
| reference | `docs/REFERENCE.md` (fatti, neutro, completo) |
| explanation | `docs/ARCHITECTURE.md` (come funziona / perché) |
| how-to | `docs/CONVENTIONS.md`, `docs/OPERATIONS.md` |
| reference di dettaglio | `docs/PAGES.md` (pagine del gioco) |

Regole: una riga per richiesta nella mappa (non per area), **mai** numeri di riga,
ogni riga punta a un file e a un simbolo **verificati**. Un doc che mente va corretto
nella stessa PR che ha spostato qualcosa.

## Mappa rapida (sintesi)

- Dove vive la validazione? → `docs/REFERENCE.md` → `Client/src/utils/validation.js` (0 byte, **limitato**)
- Come si avvia? → `docs/OPERATIONS.md` → `package.json` (`scripts.dev`)
- Come si aggiunge un endpoint? → `docs/REFERENCE.md` → `server/openapi/index.yaml`
- Dove sta una pagina? → `docs/PAGES.md` → `Client/pages/<cartella>/<pagina>.html`

## Root: cosa c'è dove

In root restano solo README, manifest del linguaggio, `.gitignore`, Dockerfile, `docker-compose.yml`
e i file di deploy (`ecosystem.config.json`, `air-tycoon.service`, `docker-entrypoint.sh`).
I doc stanno in `docs/`.

## Regole non negoziabili

1. **Solo documentazione**: mai toccare file di codice in una PR di doc.
2. **Branch + PR**, mai push su `main`.
3. Riorganizzare i doc esistenti **nella stessa PR**.
4. **Niente segreti**: niente token, password, chat_id.
5. File `.md` a 0 byte: eliminati, non preservati.
6. Non aggiungere `.gitignore` né toccare file già tracciati.
7. I doc di `database/` sono nel loro scope: non duplicarli in `docs/`.

## Prima di aprire una PR

- Aggiorna `docs/REFERENCE.md` se la PR sposta/rimuove qualcosa.
- Aggiorna `docs/ARCHITECTURE.md` se la PR cambia come funziona il sistema.
- Aggiorna `docs/CONVENTIONS.md` se la PR cambia una regola.
- Aggiorna `docs/PAGES.md` se la PR sposta/aggiunge/rimuove una pagina o un modale.
