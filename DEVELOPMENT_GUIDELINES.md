# Air Tycoon 2 - Linee Guida per lo Sviluppo

> Versione 2.1 - Paletti vincolanti. Ogni regola qui sotto è OBBLIGATORIA, non un suggerimento.
> Ultimo aggiornamento: 17 settembre 2026

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
12. [Lista Cose da Fare](#todo)
13. [Lista Cose da Rimuovere (hard bans)](#rimuovere)
14. [Verifica Coerenza & Aggiornamento Doc](#coerenza)
15. [Dipendenze & Dependabot](#dipendenze)

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

---

## 📦 Dipendenze & Dependabot {#dipendenze}

- Ogni manifest di dipendenze — `package.json` + `package-lock.json`, i `Dockerfile`, `docker-compose.yml`, i file in `.github/workflows/` — deve avere la sua voce in `.github/dependabot.yml`, con la directory corretta.
- ✅ **Regola operativa**: quando aggiungi o modifichi un manifest, aggiorni `.github/dependabot.yml` **nella stessa PR**. Mai "lo faccio dopo".
- ✅ Manifest in sottocartelle: usa `directories: ["...", "..."]` per lo stesso ecosystem (es. più Dockerfile in directory diverse).
- ✅ **Le dipendenze Python vanno vincolate a una versione** (se un giorno ne serviranno): un `requirements.txt` con i soli nomi è invisibile a Dependabot — niente aggiornamenti e niente alert di sicurezza, perché il dependency graph non risolve nulla. Usare `==` o un lock.
- ✅ Il pin va preso dalla versione realmente in uso in produzione, non scelta a caso.
- ❌ Mai manifest "finti" per far contento Dependabot, e mai config per repo archiviati (Dependabot non li scansiona).
- Il file è operativo **solo se è sul branch di default**: aggiungerlo in una PR non basta, va mergiata.
- Config attuale: `npm` (root), `docker` (root), `docker-compose` (root), schedule settimanale lunedì 06:00 Europe/Rome, minor+patch raggruppate, major come PR separate.
