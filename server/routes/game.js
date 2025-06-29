const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/game/companies - Ottieni tutte le compagnie
router.get('/companies', async (req, res) => {
    try {
        const companies = await db.query(`
            SELECT c.*, 
                   COUNT(DISTINCT a.id) as aircraft_count,
                   COUNT(DISTINCT r.id) as routes_count
            FROM companies c
            LEFT JOIN fleet a ON c.id = a.company_id
            LEFT JOIN routes r ON c.id = r.company_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);
        
        res.json({
            success: true,
            data: companies.rows
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch companies'
        });
    }
});

// GET /api/game/companies/:id - Ottieni dettagli compagnia
router.get('/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const company = await db.query(`
            SELECT * FROM companies WHERE id = $1
        `, [id]);
        
        if (company.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }
        
        // Ottieni flotta
        const fleet = await db.query(`
            SELECT f.*, at.name as aircraft_type_name, at.capacity, at.range_km, at.fuel_consumption
            FROM fleet f
            JOIN aircraft_types at ON f.aircraft_type_id = at.id
            WHERE f.company_id = $1
            ORDER BY f.purchased_at DESC
        `, [id]);
        
        // Ottieni rotte
        const routes = await db.query(`
            SELECT r.*, 
                   origin.name as origin_name, origin.iata_code as origin_iata,
                   dest.name as destination_name, dest.iata_code as destination_iata
            FROM routes r
            JOIN airports origin ON r.origin_airport_id = origin.id
            JOIN airports dest ON r.destination_airport_id = dest.id
            WHERE r.company_id = $1
            ORDER BY r.created_at DESC
        `, [id]);
        
        // Ottieni record finanziari recenti
        const financials = await db.query(`
            SELECT * FROM financial_records 
            WHERE company_id = $1 
            ORDER BY created_at DESC 
            LIMIT 50
        `, [id]);
        
        res.json({
            success: true,
            data: {
                company: company.rows[0],
                fleet: fleet.rows,
                routes: routes.rows,
                financials: financials.rows
            }
        });
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company details'
        });
    }
});

// POST /api/game/companies - Crea nuova compagnia
router.post('/companies', async (req, res) => {
    try {
        let { user_id, name, money, headquarters_airport, founded } = req.body;
        if (!user_id || !name || !headquarters_airport || !founded) {
            return res.status(400).json({
                success: false,
                error: 'user_id, name, headquarters_airport e founded sono obbligatori'
            });
        }
        let headquarters_airport_id = null;
        // Se è un numero, usalo come id
        if (typeof headquarters_airport === 'number' || (typeof headquarters_airport === 'string' && !isNaN(Number(headquarters_airport)))) {
            headquarters_airport_id = Number(headquarters_airport);
        } else if (typeof headquarters_airport === 'string') {
            if (headquarters_airport.length === 3) {
                // Cerca per IATA
                const airportRes = await db.query('SELECT id FROM airports WHERE iata_code = $1', [headquarters_airport.toUpperCase()]);
                if (!airportRes.rows.length) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid headquarters airport IATA code'
                    });
                }
                headquarters_airport_id = airportRes.rows[0].id;
            } else if (headquarters_airport.length === 4) {
                // Cerca per ICAO
                const airportRes = await db.query('SELECT id FROM airports WHERE icao_code = $1', [headquarters_airport.toUpperCase()]);
                if (!airportRes.rows.length) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid headquarters airport ICAO code'
                    });
                }
                headquarters_airport_id = airportRes.rows[0].id;
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'headquarters_airport deve essere id numerico, IATA (3 lettere) o ICAO (4 lettere)'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                error: 'headquarters_airport deve essere id numerico, IATA (3 lettere) o ICAO (4 lettere)'
            });
        }
        // Default money
        if (!money) money = 1000000;
        // Crea compagnia
        const result = await db.query(`
            INSERT INTO companies (name, money, reputation, founded, base_airport, user_id, game_date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `, [name, money || 1000000, reputation || 50, founded || new Date().toISOString(), headquarters_airport_id, user_id]);
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create company: ' + error.message
        });
    }
});

// PUT /api/game/companies/:id - Aggiorna compagnia
router.put('/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, money, reputation } = req.body;
        
        const result = await db.query(`
            UPDATE companies 
            SET name = COALESCE($1, name),
                money = COALESCE($2, money),
                reputation = COALESCE($3, reputation),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `, [name, money, reputation, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update company'
        });
    }
});

// POST /api/game/companies/create-or-update - Crea o aggiorna una compagnia
router.post('/companies/create-or-update', async (req, res) => {
    try {
        let { id, name, money, reputation, founded, base_airport, base_airport_code, user_id } = req.body;
        if (!user_id || !name || (!base_airport && !base_airport_code) || !founded) {
            return res.status(400).json({
                success: false,
                error: 'user_id, name, founded e base_airport (o base_airport_code) sono obbligatori'
            });
        }
        // Se base_airport è una stringa (IATA code), usala come base_airport_code
        if (base_airport && typeof base_airport === 'string' && isNaN(Number(base_airport))) {
            base_airport_code = base_airport;
            base_airport = undefined;
        }
        // Se arriva solo il codice IATA, cerca l'id numerico
        if (!base_airport && base_airport_code) {
            const airportRes = await db.query('SELECT id FROM airports WHERE iata_code = $1', [base_airport_code]);
            if (!airportRes.rows.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid base airport code'
                });
            }
            base_airport = airportRes.rows[0].id;
        }
        let result;
        if (!id) {
            // Crea nuova compagnia con id generato dal DB
            result = await db.query(`
                INSERT INTO companies (name, money, reputation, founded, base_airport, user_id, game_date, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `, [name, money || 1000000, reputation || 50, founded || new Date().toISOString(), base_airport, user_id]);
            // Inserisci anche l'hub principale in company_hubs
            const companyId = result.rows[0].id;
            await db.query(`
                INSERT INTO company_hubs (company_id, airport_id, hub_level, maintenance_capacity, staff_capacity, monthly_cost, facilities, established_date, created_at, updated_at)
                VALUES ($1, $2, 1, 2, 50, 100000, '{}', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (company_id, airport_id) DO NOTHING
            `, [companyId, base_airport, founded]);
        } else {
            // Aggiorna compagnia esistente
            result = await db.query(`
                INSERT INTO companies (id, name, money, reputation, founded, base_airport, user_id, game_date, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (id) 
                DO UPDATE SET 
                    name = EXCLUDED.name,
                    money = EXCLUDED.money,
                    reputation = EXCLUDED.reputation,
                    base_airport = EXCLUDED.base_airport,
                    user_id = EXCLUDED.user_id,
                    game_date = EXCLUDED.founded,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [id, name, money || 1000000, reputation || 50, founded || new Date().toISOString(), base_airport, user_id]);
        }
        res.json({
            success: true,
            data: result.rows[0],
            action: !id ? 'created' : (result.rows[0].created_at === result.rows[0].updated_at ? 'created' : 'updated')
        });
        
    } catch (error) {
        console.error('Error creating/updating company:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create/update company: ' + error.message
        });
    }
});


// GET /api/game/companies/:id/latest-save - Ottieni ultimo salvataggio compagnia
router.get('/companies/:id/latest-save', async (req, res) => {
    try {
        const { id } = req.params;
        
        const latestSave = await db.query(`
            SELECT * FROM game_saves 
            WHERE company_id = $1 
            ORDER BY updated_at DESC 
            LIMIT 1
        `, [id]);
        
        if (latestSave.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Nessun salvataggio trovato per questa compagnia'
            });
        }
        
        res.json({
            success: true,
            data: latestSave.rows[0]
        });
    } catch (error) {
        console.error('Error fetching latest save:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch latest save'
        });
    }
});

// --- API DATI FONDAMENTALI PER IL GIOCO ---
// GET /api/game/aircraft-data - Restituisce tutti i tipi di aeromobile
router.get('/aircraft-data', async (req, res) => {
    try {
        const aircraftTypes = await db.query('SELECT * FROM aircraft_types ORDER BY name ASC');
        res.json({
            success: true,
            data: aircraftTypes.rows
        });
    } catch (error) {
        console.error('Error fetching aircraft data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch aircraft data'
        });
    }
});

// GET /api/game/airport-data - Restituisce tutti gli aeroporti
router.get('/airport-data', async (req, res) => {
    try {
        const airports = await db.query('SELECT * FROM airports ORDER BY iata_code ASC');
        res.json({
            success: true,
            data: airports.rows
        });
    } catch (error) {
        console.error('Error fetching airport data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch airport data'
        });
    }
});

module.exports = router;
