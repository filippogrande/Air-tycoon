# Migration 001: Business and Tourist Levels for Airports

## Descrizione

Questa migrazione aggiunge due nuovi campi alla tabella `airports`:

- `business_level` (0-100): Livello di traffico business
- `tourist_level` (0-100): Livello di traffico turistico

Questi valori sostituiscono il vecchio `demandLevel` con un sistema più dettagliato che permette di distinguere tra diversi tipi di traffico aeroportuale.

## Come applicare la migrazione

### Database PostgreSQL esistente:

```bash
# Esegui la migrazione
psql -d air_tycoon_2 -f migrations/001_add_traffic_levels_to_airports.sql
```

### Database nuovo:

La migrazione è già inclusa in `schema.sql` e `initial_data.sql` aggiornati.

## Impatto sul codice frontend

- Il sistema di rating degli aeroporti ora usa `businessLevel` e `touristLevel`
- Formula: `rating = (businessLevel * 1.5 + touristLevel * 1.0) * 10000 * typeMultiplier`
- I popup degli aeroporti mostrano entrambi i valori

## Valori di esempio assegnati:

### Hub principali:

- **JFK**: Business 98, Tourist 85 (centro finanziario + turismo)
- **LHR**: Business 95, Tourist 70 (centro finanziario)
- **DXB**: Business 88, Tourist 85 (hub internazionale + turismo)

### Aeroporti turistici:

- **FCO**: Business 80, Tourist 90 (Roma - alta attrazione turistica)
- **VCE**: Business 70, Tourist 95 (Venezia - destinazione turistica)
- **MIA**: Business 80, Tourist 92 (Miami - beach destination)

### Aeroporti business:

- **FRA**: Business 93, Tourist 65 (centro finanziario tedesco)
- **ZUR**: Business 88, Tourist 70 (centro finanziario svizzero)

## Note

- Tutti i valori sono bilanciati per garantire una distribuzione realistica
- Gli aeroporti business hanno peso maggiore nel calcolo del rating
- I valori possono essere facilmente aggiustati per il bilanciamento del gioco
