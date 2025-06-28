# Migration 007: Realistic Fleet Management

**Data**: 27 giugno 2025  
**Versione**: 1.0.0  
**Tipo**: Schema Enhancement

## Descrizione

Questa migrazione introduce un sistema realistico di gestione della flotta aeromobili, rendendo il gioco più simile alla realtà operativa delle compagnie aeree.

## Modifiche Principali

### 1. Status Aeromobili Realistici

- **PRIMA**: `'available', 'in_flight', 'maintenance', 'assigned', 'grounded'`
- **DOPO**: `'in_delivery', 'available', 'maintenance'`
- **Motivazione**: Status più realistici che riflettono la vera situazione operativa

### 2. Sistema Timetable Settimanale

- **Rimozione**: `assigned_route_id` dalla tabella `fleet`
- **Aggiunta**: Tabella `aircraft_timetables` per programmazione settimanale
- **Benefici**: Ogni aeromobile ha una programmazione dettagliata della settimana con voli e manutenzione

### 3. Limiti Ore di Volo

- **Aeromobili**: Aggiunto `max_flight_hours` (default 50,000 ore)
- **Componenti**: Ogni componente ha limiti specifici di ore di volo
- **Componenti Standard**: Motori (15,000h), struttura (35,000-40,000h), sistemi (18,000-30,000h)

### 4. Sistema Componenti Aeromobili

- **Tabella**: `aircraft_components` con tracking individuale
- **Tipi**: engines, structure, avionics, hydraulics, landing_gear
- **Auto-tracking**: Le ore vengono aggiornate automaticamente con trigger

## Nuove Tabelle

### aircraft_components

```sql
- id: UUID primario
- aircraft_id: Riferimento a fleet
- component_type: engines|structure|avionics|hydraulics|landing_gear
- component_name: Nome descrittivo del componente
- max_flight_hours: Ore massime prima sostituzione
- current_flight_hours: Ore correnti (auto-aggiornate)
- condition: Condizione 0-100
- replacement_cost: Costo sostituzione
```

### aircraft_timetables

```sql
- id: UUID primario
- aircraft_id: Riferimento a fleet
- week_start_date: Lunedì della settimana
- day_of_week: 0-6 (Lunedì-Domenica)
- activity_type: flight|maintenance|standby
- route_id: Rotta per i voli
- departure_time/arrival_time: Orari
- estimated_flight_hours: Ore stimate per l'attività
```

## Automazioni e Trigger

### 1. Sincronizzazione Ore Componenti

```sql
CREATE TRIGGER update_component_hours_trigger
```

- Aggiorna automaticamente le ore dei componenti quando cambiano quelle dell'aeromobile
- Applica degradamento condizione componenti

### 2. Creazione Componenti Standard

```sql
CREATE TRIGGER create_components_trigger
```

- Crea automaticamente componenti standard per nuovi aeromobili
- 8 componenti essenziali con valori realistici

## Nuove Viste

### fleet_maintenance_status

Mostra priorità manutenzione basata su:

- Ore di volo vs massime
- Condizione generale
- Stato componenti critici

### aircraft_components_status

Dettagli usura componenti con:

- Percentuale usura
- Ore rimanenti
- Raccomandazioni azione

### aircraft_weekly_schedule

Programmazione settimanale leggibile con:

- Nomi giorni settimana
- Dettagli voli o manutenzione
- Info aeroporti origine/destinazione

## Impatto sui Dati Esistenti

### Aeromobili Esistenti

- Status aggiornato automaticamente se necessario
- Componenti creati con ore attuali dell'aeromobile
- Nessuna perdita di dati operativi

### Rotte Esistenti

- `assigned_aircraft_id` rimosso (non più necessario)
- Le assegnazioni dovranno essere ricreate tramite timetable
- Performance tracking mantenuto

## Vantaggi del Nuovo Sistema

### 1. Realismo Operativo

- Programmazione settimanale come nelle vere compagnie
- Gestione componenti critici separata
- Limiti di vita operativa realistici

### 2. Gameplay Migliorato

- Decisioni strategiche su manutenzione vs profitto
- Pianificazione a lungo termine necessaria
- Gestione più granulare della flotta

### 3. Scalabilità

- Sistema facilmente estendibile
- Supporto per future meccaniche (equipaggi, fuel planning, etc.)
- Tracking dettagliato per analytics

## Possibili Estensioni Future

1. **Equipaggi**: Assegnazione piloti/cabin crew ai voli
2. **Fuel Planning**: Calcolo carburante per ogni volo
3. **Weather Impact**: Influenza meteo su programmazione
4. **Slot Management**: Gestione slot aeroportuali
5. **Predictive Maintenance**: AI per previsione guasti

## Rollback

Per rollback completo:

```sql
-- Rimuovi nuove tabelle
DROP TABLE IF EXISTS aircraft_timetables;
DROP TABLE IF EXISTS aircraft_components;

-- Ripristina assigned_aircraft_id in routes
ALTER TABLE routes ADD COLUMN assigned_aircraft_id UUID REFERENCES fleet(id);

-- Ripristina status originali fleet
ALTER TABLE fleet DROP CONSTRAINT fleet_status_check;
ALTER TABLE fleet ADD CONSTRAINT fleet_status_check
    CHECK (status IN ('available', 'in_flight', 'maintenance', 'assigned', 'grounded'));
```

## Note di Sicurezza

- **Backup obbligatorio** prima dell'esecuzione
- **Test su ambiente staging** consigliato
- **Downtime breve** previsto per aggiornamento constraints
- **Verificare integrità dati** post-migrazione

## Testing Consigliato

1. Creazione nuovo aeromobile → Verifica componenti auto-creati
2. Aggiornamento ore volo → Verifica sincronizzazione componenti
3. Programmazione timetable settimanale → Verifica constraints
4. Viste maintenance → Verifica calcoli priorità
5. Performance queries → Verifica velocità con nuovi indici
