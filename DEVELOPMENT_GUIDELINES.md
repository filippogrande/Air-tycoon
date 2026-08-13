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
12. [Lista Cose da Fare](#todo)
13. [Lista Cose da Rimuovere (hard bans)](#rimuovere)
14. [Verifica Coerenza & Aggiornamento Doc](#coerenza)

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
