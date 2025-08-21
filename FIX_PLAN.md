# Piano di Unificazione e Fix Air Tycoon

## 🎯 OBIETTIVO

Eliminare la duplicazione Client/src vs src/ root e creare un sistema unificato funzionante

## ❌ PROBLEMI IDENTIFICATI

### 1. Duplicazione Codice

- **`/src/`** (root) - Versione legacy servita dal server via `/main-src`
- **`/Client/src/`** - Versione modularizzata attiva
- **Conflitto**: hub.html carica moduli da entrambe le location

### 2. Problemi Import/Export

- Mix di moduli ES6 e script globali
- Import non risolti (gameMenuEvents.js, SettingsOverlay.js)
- Export in file caricati come script normali

### 3. Game Object Non Inizializzato

- Funzioni di supporto mancanti (showError, checkBrowserCompatibility)
- AircraftData non caricato
- Catena di dipendenze rotta

## ✅ PIANO DI FIX

### FASE 1: Unificazione Codebase

1. **Eliminare** cartella `/src/` root (legacy)
2. **Configurare server** per servire da `/Client/src/`
3. **Aggiornare** tutti i path di riferimento

### FASE 2: Standardizzazione Moduli

1. **Convertire tutti** i file a script globali (no ES6 modules per semplicità)
2. **Eliminare** tutti gli import/export problematici
3. **Caricare** tutto via tag `<script>` in ordine corretto

### FASE 3: Fix Inizializzazione

1. **Consolidare** tutte le utility in un singolo file
2. **Semplificare** main.js rimuovendo complessità
3. **Testare** inizializzazione step by step

## 🚀 IMPLEMENTAZIONE

### Step 1: Server Configuration

```javascript
// In server/index.js - sostituire /main-src con /client-src
app.use(
  "/client-src",
  express.static(path.join(__dirname, "..", "Client", "src"))
);
```

### Step 2: Hub.html Cleanup

```html
<!-- Ordine caricamento pulito -->
<script src="/client-src/utils/core-utils.js"></script>
<!-- Tutto in un file -->
<script src="/client-src/entities/Aircraft.js"></script>
<script src="/client-src/core/Game.js"></script>
<script src="/client-src/main-simple.js"></script>
<!-- Versione semplificata -->
```

### Step 3: File Consolidati

- **`core-utils.js`** - Tutte le utility in un posto
- **`main-simple.js`** - Inizializzazione pulita senza import
- **Rimuovere** tutti i file duplicati

## 📋 CHECKLIST

- [ ] Backup attuale stato
- [ ] Rimuovi duplicazione /src root
- [ ] Configura server per Client/src
- [ ] Converti moduli a script globali
- [ ] Consolida utility
- [ ] Test inizializzazione
- [ ] Test creazione rotta
- [ ] Documentazione finale

## ⏱️ TEMPO STIMATO

**2-3 ore** per implementazione completa e test

---

_Questo approccio razionale eliminerà tutti i conflitti e creerà un sistema pulito e manutenibile._
