// Logica specifica per la pagina di selezione partita (select.html)
// Qui puoi importare moduli, managers, ecc.

import { AuthManager } from '../utils/AuthManager.js';
import { GameSelectManager } from '../managers/RouteManager.js';

// Esempio: inizializzazione
window.addEventListener('DOMContentLoaded', () => {
  // Inizializza la logica della pagina
  GameSelectManager.init();
});
