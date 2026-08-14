// RouteCalculationUtils.js - Utilità di calcolo per il sistema delle rotte
// Sistema Unificato - Global Exports per compatibilità

(function() {
    'use strict';

    /**
     * Utilità di calcolo per il sistema delle rotte
     */
    const RouteCalculationUtils = {
        
        /**
         * Ottiene un riferimento sicuro all'oggetto game globale
         */
        getGameRef() {
            if (typeof window !== 'undefined' && window.game) {
                return window.game;
            }
            return null;
        },

        /**
         * Calcola la distanza tra due coordinate
         */
        calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Raggio della Terra in km
            const dLat = this.toRadians(lat2 - lat1);
            const dLon = this.toRadians(lon2 - lon1);
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2)
                ;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        },

        /**
         * Converte gradi in radianti
         */
        toRadians(degrees) {
            return degrees * (Math.PI / 180);
        },

        /**
         * Calcola il prezzo suggerito per una rotta
         */
        calculateSuggestedPrice(distance, aircraftType = 'passenger') {
            const basePrice = aircraftType === 'cargo' ? 0.5 : 0.15;
            const distanceMultiplier = Math.max(1, distance / 1000);
            return Math.round(basePrice * distance * distanceMultiplier);
        },

        /**
         * Calcola il tempo di volo stimato
         */
        calculateFlightTime(distance, aircraftSpeed = 800) {
            return Math.round((distance / aircraftSpeed) * 60); // minuti
        },

        /**
         * Calcola il consumo di carburante stimato
         */
        calculateFuelConsumption(distance, aircraftType = 'medium') {
            const fuelRates = {
                small: 2.5,   // litri per km
                medium: 4.0,
                large: 6.5,
                cargo: 5.0
            };
            const rate = fuelRates[aircraftType] || fuelRates.medium;
            return Math.round(distance * rate);
        },

        /**
         * Valida i dati di una rotta
         */
        validateRouteData(routeData) {
            if (!routeData) {
                return { valid: false, error: 'Dati rotta mancanti' };
            }

            if (!routeData.departure || !routeData.arrival) {
                return { valid: false, error: 'Aeroporti di partenza e arrivo richiesti' };
            }

            if (routeData.departure === routeData.arrival) {
                return { valid: false, error: 'Aeroporto di partenza e arrivo non possono essere uguali' };
            }

            if (!routeData.aircraft) {
                return { valid: false, error: 'Aeromobile richiesto' };
            }

            if (!routeData.price || routeData.price <= 0) {
                return { valid: false, error: 'Prezzo valido richiesto' };
            }

            return { valid: true };
        },

        /**
         * Formatta la valuta
         */
        formatCurrency(amount) {
            return new Intl.NumberFormat('it-IT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        },

        /**
         * Formatta la distanza
         */
        formatDistance(km) {
            return `${Math.round(km).toLocaleString('it-IT')} km`;
        },

        /**
         * Formatta il tempo
         */
        formatTime(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        },

        /**
         * Calcola i costi operativi stimati
         */
        calculateOperatingCosts(distance, aircraftType, fuelPrice = 1.5) {
            const fuelConsumption = this.calculateFuelConsumption(distance, aircraftType);
            const fuelCost = fuelConsumption * fuelPrice;
            
            // Costi aggiuntivi (manutenzione, equipaggio, tasse aeroportuali)
            const maintenanceCost = distance * 0.5;
            const crewCost = distance * 0.3;
            const airportFees = 150; // fisso per atterraggio/decollo
            
            return {
                fuel: Math.round(fuelCost),
                maintenance: Math.round(maintenanceCost),
                crew: Math.round(crewCost),
                airportFees: airportFees,
                total: Math.round(fuelCost + maintenanceCost + crewCost + airportFees)
            };
        },

        /**
         * Calcola il margine di profitto
         */
        calculateProfitMargin(revenue, costs) {
            if (costs === 0) return 100;
            return Math.round(((revenue - costs) / revenue) * 100);
        }
    };

    // Export globale per compatibilità
    if (typeof window !== 'undefined') {
        window.RouteCalculationUtils = RouteCalculationUtils;
    }


})();