# Sistema Avanzato di Gestione Sedili - Migrazione 008

## Panoramica

Questo sistema implementa una gestione realistica e dettagliata dei sedili aeronautici, sostituendo il sistema semplificato di configurazioni fisse con un approccio dinamico basato su produttori reali, modelli specifici e cicli di vita dei sedili.

## Caratteristiche Principali

### 1. Produttori di Sedili Reali

- **Recaro Aircraft Seating** (Germania) - Leader mondiale
- **Collins Aerospace** (USA) - Maggiore quota di mercato
- **Zodiac Aerospace/Safran** (Francia) - Specialista premium
- **Geven** (Italia) - Focus su economy class
- **Acro Aircraft Seating** (UK) - Sedili ultra-leggeri
- **Thompson Aero Seating** (UK) - Luxury specialist
- **Jamco Corporation** (Giappone)
- **Haeco Cabin Solutions** (Hong Kong)

### 2. Modelli di Sedili Dettagliati

#### Economy Class

- **Recaro BL3510/CL3710**: Sedili affidabili con buon comfort
- **Collins Meridian/Aire**: Tecnologia avanzata e connettività
- **Geven Piuma/Essenza**: Soluzioni economiche per low-cost
- **Acro Series 3/6**: Ultra-leggeri per massima efficienza

#### Premium Economy

- **Recaro CL3620**: Ampio spazio e comfort migliorato
- **Collins Elements**: Design modulare e flessibile
- **Zodiac Z300**: Eleganza francese

#### Business Class

- **Recaro CL6720**: Letti piatti di alta qualità
- **Collins Super Diamond**: Configurazione herringbone
- **Zodiac Cirrus**: Lusso e privacy massimi
- **Thompson Vantage XL**: Design britannico premium

#### First Class

- **Zodiac Optima**: Suite private ultra-lusso
- **Collins Pinnacle**: Tecnologia all'avanguardia
- **Thompson Elite**: Esperienza boutique

### 3. Ciclo di Vita e Usura

#### Parametri di Durata

- **Ore di volo massime**: 40,000-62,000 ore (dipende dal modello)
- **Cicli massimi**: 20,000-31,000 decolli/atterraggi
- **Degrado graduale**: Condizione diminuisce del 0.1% per ora di volo
- **Sostituzione automatica**: Quando raggiunto limite ore/cicli

#### Manutenzione

- **Routine**: Pulizia e controlli regolari
- **Riparazione**: Fix per danni specifici
- **Refurbishment**: Rinnovamento completo
- **Sostituzione**: Installazione nuovo sedile

### 4. Layout Dinamici

#### Calcolo Automatico Capacità

```sql
-- Funzione per calcolare automaticamente quanti sedili ci stanno
SELECT * FROM calculate_seat_capacity(
    aircraft_type_id := 5,    -- A320neo
    cabin_length_cm := 3380,  -- Lunghezza cabina
    cabin_width_cm := 370,    -- Larghezza cabina
    seat_model_id := 3,       -- Recaro CL3710
    seat_pitch_cm := 81,      -- Passo sedili
    aisle_width_cm := 50      -- Larghezza corridoio
);
```

#### Configurazione Flessibile

- Sezioni separate per ogni classe
- Spazio personalizzabile per cucine, bagni, storage
- Calcolo automatico efficienza spazio
- Tracking peso totale layout

### 5. Costi Realistici

#### Prezzi per Sedile (in centesimi)

- **Economy**: €1,450 - €2,500
- **Premium Economy**: €3,950 - €4,500
- **Business**: €12,500 - €15,000
- **First**: €28,000 - €35,000

#### Costi Aggiuntivi

- Installazione: €500-2,000 per sedile
- Manutenzione annuale: €180-2,100 per sedile
- Refurbishment: 30-50% del costo iniziale

### 6. Impatto sul Gameplay

#### Decisioni Strategiche

1. **Scelta Produttore**: Bilanciare costo vs. qualità vs. affidabilità
2. **Timing Acquisti**: Modelli più recenti costano di più ma durano di più
3. **Manutenzione Preventiva**: Investire in manutenzione vs. sostituzioni frequenti
4. **Layout Optimization**: Massimizzare ricavi vs. comfort passeggeri

#### Effetti sulla Soddisfazione

- Sedili più comodi = passeggeri più felici
- Sedili usurati = reclami e perdita reputazione
- Tecnologie moderne (WiFi, entertainment) = premium pricing
- Spazio extra = willingness to pay di più

### 7. Evoluzione Tecnologica

#### Timeline Realistica

- **2014-2016**: Prima generazione sedili leggeri
- **2017-2019**: Introduzione connectivity (USB, power)
- **2020-2022**: Entertainment integrato e design modulare
- **2023+**: Tecnologie smart e sostenibilità

#### Discontinuazione Modelli

- Vecchi modelli escono dal mercato
- Parti di ricambio diventano costose
- Pressione per upgrade a tecnologie moderne

## Implementazione Tecnica

### Tabelle Principali

1. `seat_manufacturers` - Produttori di sedili
2. `seat_models` - Catalogo modelli con caratteristiche complete
3. `aircraft_cabin_layouts` - Layout specifici per ogni aeromobile
4. `aircraft_installed_seats` - Sedili fisicamente installati
5. `seat_maintenance_history` - Storico manutenzioni

### Trigger Automatici

- **Usura dopo volo**: Aggiorna automaticamente ore e cicli
- **Sostituzione necessaria**: Flag quando raggiunto limite vita
- **Timestamp updates**: Mantiene tracciabilità modifiche

### Funzioni Utility

- **calculate_seat_capacity()**: Calcolo automatico capacità
- **update_seat_wear_after_flight()**: Gestione usura post-volo

## Vantaggi del Sistema

### Realismo

- Basato su produttori e modelli reali
- Cicli di vita autentici
- Costi di mercato accurati
- Evoluzione tecnologica storica

### Profondità Strategica

- Decisioni a lungo termine su investimenti
- Bilanciamento costo/qualità/durata
- Ottimizzazione layout per diversi mercati
- Gestione portfolio sedili su flotta

### Scalabilità

- Facile aggiungere nuovi produttori/modelli
- Sistema flessibile per future espansioni
- Supporto per innovazioni tecnologiche

## Migrazione e Compatibilità

### Transizione dal Vecchio Sistema

- Mapping automatico configurazioni esistenti
- Preservazione dati storici
- Graduale rollout su nuovi aeromobili

### Retrocompatibilità

- API esistenti continuano a funzionare
- Views di compatibilità per report legacy
- Migrazione graduale senza interruzioni

Questo sistema trasforma la gestione sedili da una semplice configurazione a una vera e propria business unit con decisioni strategiche a lungo termine, costi significativi e impatti diretti sulla soddisfazione del cliente e la profittabilità delle rotte.
