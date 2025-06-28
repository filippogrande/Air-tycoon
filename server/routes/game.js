const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/game/companies - Ottieni tutte le compagnie
router.get('/companies', async (req, res) => {
    try {
        const companies = await db.query(`
            SELECT c.*, 
                   COUNT(DISTINCT a.id) as aircraft_count,
                   COUNT(DISTINCT r.id) as routes_count,
                   COALESCE(SUM(f.amount), 0) as total_balance
            FROM companies c
            LEFT JOIN fleet a ON c.id = a.company_id
            LEFT JOIN routes r ON c.id = r.company_id
            LEFT JOIN financial_records f ON c.id = f.company_id 
                AND f.type = 'revenue'
                AND f.created_at >= CURRENT_DATE - INTERVAL '30 days'
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

// POST /api/game/companies - Crea nuova compagnia e hub principale
router.post('/companies', async (req, res) => {
    try {
        let { name, headquarters_airport_id, headquarters_airport_code, initial_money, user_id } = req.body;
        if (!name || (!headquarters_airport_id && !headquarters_airport_code)) {
            return res.status(400).json({
                success: false,
                error: 'Name and headquarters airport (id or code) are required'
            });
        }
        // Se arriva solo il codice IATA, cerca l'id numerico
        if (!headquarters_airport_id && headquarters_airport_code) {
            const airportRes = await db.query('SELECT id FROM airports WHERE iata_code = $1', [headquarters_airport_code]);
            if (!airportRes.rows.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid headquarters airport code'
                });
            }
            headquarters_airport_id = airportRes.rows[0].id;
        }
        // Recupera user_id da JWT/sessione o dal body
        if (!user_id && req.user && req.user.id) {
            user_id = req.user.id;
        }
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }
        // Usa la funzione atomica
        const { company, hub } = await db.createCompanyWithHub({ name, headquarters_airport_id, initial_money, user_id });
        res.status(201).json({
            success: true,
            data: { company, hub }
        });
    } catch (error) {
        console.error('Error creating company and hub:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create company and hub'
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
        let { id, name, money, reputation, founded, base_airport, base_airport_code } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
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
                INSERT INTO companies (name, money, reputation, founded, base_airport, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `, [name, money || 1000000, reputation || 50, founded || new Date().toISOString(), base_airport]);
        } else {
            // Aggiorna compagnia esistente
            result = await db.query(`
                INSERT INTO companies (id, name, money, reputation, founded, base_airport, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (id) 
                DO UPDATE SET 
                    name = EXCLUDED.name,
                    money = EXCLUDED.money,
                    reputation = EXCLUDED.reputation,
                    base_airport = EXCLUDED.base_airport,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [id, name, money || 1000000, reputation || 50, founded || new Date().toISOString(), base_airport]);
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

// GET /api/game/save/:id - Carica salvataggio
router.get('/save/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const save = await db.query(`
            SELECT * FROM game_saves WHERE id = $1
        `, [id]);
        
        if (save.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Save not found'
            });
        }
        
        res.json({
            success: true,
            data: save.rows[0]
        });
    } catch (error) {
        console.error('Error loading save:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load save'
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

// POST /api/game/save - Salva partita
router.post('/save', async (req, res) => {
    try {
        const { company_id, save_name, game_data } = req.body;
        
        if (!company_id || !save_name || !game_data) {
            return res.status(400).json({
                success: false,
                error: 'Company ID, save name and game data are required'
            });
        }
        
        const result = await db.query(`
            INSERT INTO game_saves (company_id, save_name, game_data)
            VALUES ($1, $2, $3)
            ON CONFLICT (company_id, save_name) 
            DO UPDATE SET 
                game_data = EXCLUDED.game_data,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [company_id, save_name, JSON.stringify(game_data)]);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error saving game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save game'
        });
    }
});

// GET /api/game/saves/:company_id - Lista salvataggi per compagnia
router.get('/saves/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        
        const saves = await db.query(`
            SELECT id, company_id, save_name, created_at, updated_at
            FROM game_saves 
            WHERE company_id = $1
            ORDER BY updated_at DESC
        `, [company_id]);
        
        res.json({
            success: true,
            data: saves.rows
        });
    } catch (error) {
        console.error('Error fetching saves:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch saves'
        });
    }
});

module.exports = router;
