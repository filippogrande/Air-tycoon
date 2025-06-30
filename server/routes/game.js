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
            // Crea nuova compagnia con id SERIAL generato dal DB
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
            // Aggiorna compagnia esistente (id numerico)
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

// GET /api/game/companies/:id/hubs - Ottieni tutti gli aeroporti hub della compagnia
router.get('/companies/:id/hubs', async (req, res) => {
    try {
        const { id } = req.params;
        const hubs = await db.query(`
            SELECT a.*
            FROM company_hubs ch
            JOIN airports a ON ch.airport_id = a.id
            WHERE ch.company_id = $1
            ORDER BY a.name ASC
        `, [id]);
        res.json({
            success: true,
            data: hubs.rows
        });
    } catch (error) {
        console.error('Error fetching company hubs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company hubs'
        });
    }
});


module.exports = router;
