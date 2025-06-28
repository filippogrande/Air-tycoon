# Migrazione 009: Sistema di Persistenza Azioni a Pagamento

## 📋 Descrizione

Questa migrazione risolve il problema critico della perdita di dati quando l'utente ricarica la pagina. Aggiunge tabelle per salvare in modo persistente tutte le azioni a pagamento del giocatore, incluse analisi di mercato e miglioramenti domanda.

## ⚠️ Problema Risolto

**Prima:**

- Le analisi di mercato erano salvate solo in localStorage
- Ricaricare la pagina cancellava tutto
- I soldi spesi venivano "rimborsati" involontariamente
- Esperienza di gioco frustrante e non realistica

**Dopo:**

- Tutte le azioni a pagamento sono salvate nel database
- Persistenza garantita anche dopo ricaricamento pagina
- I soldi spesi rimangono spesi correttamente
- Esperienza di gioco realistica e coerente

## 🗃️ Tabelle Aggiunte

### 1. `market_analyses`

Salva le analisi di mercato acquistate dai giocatori per le rotte.

**Campi principali:**

- `company_id` - Compagnia che ha acquistato l'analisi
- `origin_airport_id`, `destination_airport_id` - Rotta analizzata
- `analysis_type` - Tipo di analisi ('standard', 'premium', 'detailed')
- `cost_paid` - Costo effettivamente pagato
- `results` - Risultati dell'analisi in formato JSON
- `expires_at` - Data scadenza (NULL = non scade mai)
- `is_active` - Flag per attivazione/disattivazione

**Dati salvati nei risultati:**

```json
{
  "cost_per_flight": 5000,
  "monthly_revenue": 150000,
  "estimated_profit": 75000,
  "analysis_date": "2025-06-28T10:30:00Z",
  "confidence_level": "high",
  "market_factors": {
    "competition": "medium",
    "demand_trend": "growing",
    "seasonal_variation": 15
  }
}
```

### 2. `demand_improvements`

Salva i miglioramenti dell'analisi domanda acquistati.

**Campi principali:**

- `company_id` - Compagnia che ha acquistato il miglioramento
- `origin_airport_id`, `destination_airport_id` - Rotta migliorata
- `improvement_type` - Tipo miglioramento ('detailed_traffic', 'seasonal_analysis', 'competitor_analysis')
- `cost_paid` - Costo pagato
- `results` - Dati dettagliati del miglioramento

**Tipi di miglioramento:**

- `detailed_traffic` - Analisi traffico dettagliata (€5,000)
- `seasonal_analysis` - Analisi stagionale (€7,500)
- `competitor_analysis` - Analisi competitiva (€10,000)

### 3. `paid_actions`

Tabella generica per tutte le azioni a pagamento.

**Usi futuri:**

- Ricerche tecnologiche
- Consulenze specialistiche
- Campagne marketing
- Certificazioni aeroporti
- Upgrade infrastrutture

## 🔧 Funzioni Helper

### `get_active_market_analysis(company_id, origin_airport_id, destination_airport_id, analysis_type)`

Restituisce i risultati dell'analisi di mercato attiva per una rotta.

### `has_active_market_analysis(company_id, origin_airport_id, destination_airport_id, analysis_type)`

Verifica se esiste un'analisi di mercato attiva per una rotta.

### `get_active_demand_improvements(company_id, origin_airport_id, destination_airport_id)`

Restituisce tutti i miglioramenti domanda attivi per una rotta.

## 📊 Indici per Performance

- Indici compositi per lookup veloci per compagnia + rotta
- Indici per filtraggio per stato attivo
- Indici per ricerche per data di acquisto

## 🔄 Integrazione Frontend

### Modifiche necessarie in `RouteUIManager.js`:

1. **Controllare database** invece di localStorage
2. **Salvare nel database** quando si acquista un'analisi
3. **Caricare dal database** i dati esistenti
4. **Aggiornare stato UI** basato sui dati del database

### API Endpoints da creare:

```javascript
// Ottenere analisi esistenti
GET /api/routes/market-analysis/:origin/:destination

// Acquistare nuova analisi
POST /api/routes/market-analysis
{
  "origin_airport_code": "FCO",
  "destination_airport_code": "MXP",
  "analysis_type": "standard",
  "cost": 15000
}

// Ottenere miglioramenti domanda
GET /api/routes/demand-improvements/:origin/:destination

// Acquistare miglioramento domanda
POST /api/routes/demand-improvements
{
  "origin_airport_code": "FCO",
  "destination_airport_code": "MXP",
  "improvement_type": "detailed_traffic",
  "cost": 5000
}
```

## 🚀 Vantaggi

1. **Persistenza Garantita**: Nessuna perdita di dati al refresh
2. **Coerenza Finanziaria**: I soldi spesi rimangono spesi
3. **Esperienza Realistica**: Come in un vero gestionale
4. **Scalabilità**: Sistema estendibile per future funzionalità
5. **Performance**: Indici ottimizzati per query veloci
6. **Auditabilità**: Log completo di tutte le azioni a pagamento

## ⚡ Implementazione Graduale

### Fase 1: Database + API (questa migrazione)

- ✅ Tabelle database create
- ⏳ API endpoints da implementare
- ⏳ Integrazione con sistema di salvataggio

### Fase 2: Frontend Integration

- ⏳ Modificare RouteUIManager per usare API
- ⏳ Rimuovere dipendenza da localStorage
- ⏳ Aggiungere loading states

### Fase 3: Testing & Refinement

- ⏳ Test completi del flusso
- ⏳ Gestione errori di rete
- ⏳ Fallback strategies

## 🔗 Compatibilità

- ✅ Retrocompatibile con dati esistenti
- ✅ Non rompe funzionalità attuali
- ✅ Migrazione incrementale possibile
