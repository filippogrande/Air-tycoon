// API Info Route - Restituisce una panoramica dettagliata e "grafica" delle API
const express = require('express');
const router = express.Router();

// Lista dettagliata degli endpoint principali
const endpoints = [
  {
    group: 'Sistema',
    routes: [
      {
        method: 'GET',
        path: '/health',
        description: 'Verifica che il server sia attivo',
        example: '/health'
      },
      {
        method: 'GET',
        path: '/api',
        description: 'Restituisce questa panoramica delle API',
        example: '/api'
      }
    ]
  },
  {
    group: 'Autenticazione',
    routes: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Registra un nuovo utente',
        example: '/api/auth/register'
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Effettua il login',
        example: '/api/auth/login'
      }
    ]
  },
  {
    group: 'Compagnie & Gioco',
    routes: [
      {
        method: 'GET',
        path: '/api/game/companies',
        description: 'Ottieni tutte le compagnie',
        example: '/api/game/companies'
      },
      {
        method: 'POST',
        path: '/api/game/companies',
        description: 'Crea nuova compagnia e hub principale',
        example: '/api/game/companies'
      },
      {
        method: 'GET',
        path: '/api/game/companies/:id',
        description: 'Dettagli di una compagnia',
        example: '/api/game/companies/1'
      },
      {
        method: 'PUT',
        path: '/api/game/companies/:id',
        description: 'Aggiorna una compagnia',
        example: '/api/game/companies/1'
      },
      {
        method: 'POST',
        path: '/api/game/companies/create-or-update',
        description: 'Crea o aggiorna una compagnia (upsert)',
        example: '/api/game/companies/create-or-update'
      },
      {
        method: 'GET',
        path: '/api/game/save/:id',
        description: 'Carica un salvataggio specifico',
        example: '/api/game/save/123'
      },
      {
        method: 'GET',
        path: '/api/game/companies/:id/latest-save',
        description: 'Ottieni l’ultimo salvataggio per una compagnia',
        example: '/api/game/companies/1/latest-save'
      },
      {
        method: 'POST',
        path: '/api/game/save',
        description: 'Salva una partita (crea o aggiorna un salvataggio)',
        example: '/api/game/save'
      },
      {
        method: 'GET',
        path: '/api/game/saves/:company_id',
        description: 'Lista di tutti i salvataggi per una compagnia',
        example: '/api/game/saves/1'
      }
    ]
  },
  {
    group: 'Flotta',
    routes: [
      {
        method: 'GET',
        path: '/api/fleet/aircraft-types',
        description: 'Tutti i tipi di aeromobili',
        example: '/api/fleet/aircraft-types'
      },
      {
        method: 'GET',
        path: '/api/fleet/company/:company_id',
        description: 'Flotta di una compagnia',
        example: '/api/fleet/company/1'
      }
    ]
  },
  {
    group: 'Rotte',
    routes: [
      {
        method: 'GET',
        path: '/api/routes/company/:company_id',
        description: 'Tutte le rotte di una compagnia',
        example: '/api/routes/company/1'
      },
      {
        method: 'GET',
        path: '/api/routes/:id',
        description: 'Dettagli di una rotta',
        example: '/api/routes/1'
      }
    ]
  },
  {
    group: 'Aeroporti',
    routes: [
      {
        method: 'GET',
        path: '/api/airports',
        description: 'Lista aeroporti (filtrabile)',
        example: '/api/airports?country=Italy'
      }
    ]
  },
  {
    group: 'Finanza',
    routes: [
      {
        method: 'GET',
        path: '/api/finance/company/:company_id',
        description: 'Record finanziari di una compagnia',
        example: '/api/finance/company/1'
      },
      {
        method: 'GET',
        path: '/api/finance/summary/:company_id',
        description: 'Riassunto finanziario',
        example: '/api/finance/summary/1'
      }
    ]
  },
  {
    group: 'Analisi di Mercato',
    routes: [
      {
        method: 'GET',
        path: '/api/market-analysis/market-analysis/:origin/:destination',
        description: 'Analisi di mercato tra due aeroporti',
        example: '/api/market-analysis/market-analysis/FCO/JFK?company_id=1'
      }
    ]
  },
  {
    group: 'Admin',
    routes: [
      {
        method: 'GET',
        path: '/api/admin/tables',
        description: 'Lista delle tabelle disponibili',
        example: '/api/admin/tables'
      },
      {
        method: 'GET',
        path: '/api/admin/tables/:tableName',
        description: 'Visualizza il contenuto di una tabella',
        example: '/api/admin/tables/users'
      }
    ]
  }
];

// Endpoint principale
router.get('/', (req, res) => {
  // Se accetta HTML, restituisci una tabella "grafica"
  if (req.accepts('html')) {
    let html = `
      <html><head><title>Air Tycoon 2 API</title>
      <style>
        body { font-family: sans-serif; background: #f8f8f8; }
        h1 { color: #2c3e50; }
        .group { margin-bottom: 2em; }
        table { border-collapse: collapse; width: 100%; background: #fff; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #2c3e50; color: #fff; }
        tr:nth-child(even) { background: #f2f2f2; }
      </style></head><body>
      <h1>Air Tycoon 2 API</h1>
      <p>Versione: 1.0.0 &mdash; Stato: <b>Running</b></p>
    `;
    for (const section of endpoints) {
      html += `<div class="group"><h2>${section.group}</h2><table><tr><th>Metodo</th><th>Path</th><th>Descrizione</th><th>Esempio</th></tr>`;
      for (const route of section.routes) {
        html += `<tr><td>${route.method}</td><td><code>${route.path}</code></td><td>${route.description}</td><td><code>${route.example}</code></td></tr>`;
      }
      html += `</table></div>`;
    }
    html += `</body></html>`;
    res.type('html').send(html);
  } else {
    // Altrimenti restituisci JSON dettagliato
    res.json({
      name: 'Air Tycoon 2 API Server',
      version: '1.0.0',
      status: 'Running',
      endpoints
    });
  }
});

module.exports = router;
