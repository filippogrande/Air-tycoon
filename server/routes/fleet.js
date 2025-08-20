const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/fleet/aircraft-types - Ottieni tutti i tipi di aeromobili disponibili
router.get('/aircraft-types', async (req, res) => {
    try {
        const aircraftTypes = await db.query(`
            SELECT * FROM aircraft_types 
            ORDER BY category, name
        `);
        
        res.json({
            success: true,
            data: aircraftTypes.rows
        });
    } catch (error) {
        console.error('Error fetching aircraft types:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch aircraft types'
        });
    }
});

// GET /api/fleet/company/:company_id - Ottieni flotta di una compagnia
router.get('/company/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        
        const fleet = await db.query(`
            SELECT f.*, 
                   at.name as aircraft_type_name,
                   at.manufacturer,
                   at.capacity,
                   at.range_km,
                   at.fuel_consumption,
                   at.purchase_price,
                   at.maintenance_cost_per_hour
            FROM fleet f
            JOIN aircraft_types at ON f.aircraft_type_id = at.id
            WHERE f.company_id = $1
            ORDER BY f.purchased_at DESC
        `, [company_id]);
        
        // Calcola statistiche flotta
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_aircraft,
                SUM(at.capacity) as total_capacity,
                AVG(f.condition) as avg_condition,
                SUM(f.total_flight_hours) as total_flight_hours
            FROM fleet f
            JOIN aircraft_types at ON f.aircraft_type_id = at.id
            WHERE f.company_id = $1
        `, [company_id]);
        
        res.json({
            success: true,
            data: {
                aircraft: fleet.rows,
                stats: stats.rows[0]
            }
        });
    } catch (error) {
        console.error('Error fetching fleet:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch fleet'
        });
    }
});

// POST /api/fleet/purchase - Acquista nuovo aeromobile
router.post('/purchase', async (req, res) => {
    try {
        const { company_id, aircraft_type_id, registration, purchase_price } = req.body;
        
        if (!company_id || !aircraft_type_id || !registration) {
            return res.status(400).json({
                success: false,
                error: 'Company ID, aircraft type ID and registration are required'
            });
        }
        
        // Verifica che la compagnia abbia abbastanza soldi
        const company = await db.query(`
            SELECT money FROM companies WHERE id = $1
        `, [company_id]);
        
        if (company.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }
        
        const aircraftType = await db.query(`
            SELECT * FROM aircraft_types WHERE id = $1
        `, [aircraft_type_id]);
        
        if (aircraftType.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aircraft type not found'
            });
        }
        
        const finalPrice = purchase_price || aircraftType.rows[0].purchase_price;
        
        if (company.rows[0].money < finalPrice) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient funds'
            });
        }
        
        // Inizia transazione
        await db.beginTransaction();
        
        try {
            // Aggiungi aeromobile alla flotta
            const aircraft = await db.query(`
                INSERT INTO fleet (
                    company_id, aircraft_type_id, registration, 
                    condition, total_flight_hours, location_airport_id
                )
                VALUES ($1, $2, $3, 100, 0, 
                    (SELECT headquarters_airport_id FROM companies WHERE id = $1)
                )
                RETURNING *
            `, [company_id, aircraft_type_id, registration]);
            
            // Aggiorna soldi compagnia
            await db.query(`
                UPDATE companies 
                SET money = money - $1 
                WHERE id = $2
            `, [finalPrice, company_id]);
            
            // Aggiungi record finanziario
            await db.query(`
                INSERT INTO financial_records (
                    company_id, type, amount, description, category
                )
                VALUES ($1, 'expense', $2, $3, 'aircraft_purchase')
            `, [company_id, finalPrice, `Purchased ${aircraftType.rows[0].name} - ${registration}`]);
            
            await db.commitTransaction();
            
            res.status(201).json({
                success: true,
                data: aircraft.rows[0]
            });
        } catch (error) {
            await db.rollbackTransaction();
            throw error;
        }
    } catch (error) {
        console.error('Error purchasing aircraft:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to purchase aircraft'
        });
    }
});

// PUT /api/fleet/:id - Aggiorna aeromobile
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { condition, total_flight_hours, location_airport_id, status } = req.body;
        
        const result = await db.query(`
            UPDATE fleet 
            SET condition = COALESCE($1, condition),
                total_flight_hours = COALESCE($2, total_flight_hours),
                location_airport_id = COALESCE($3, location_airport_id),
                status = COALESCE($4, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `, [condition, total_flight_hours, location_airport_id, status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aircraft not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating aircraft:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update aircraft'
        });
    }
});

// DELETE /api/fleet/:id - Vendi aeromobile
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sale_price } = req.body;
        
        // Ottieni dettagli aeromobile
        const aircraft = await db.query(`
            SELECT f.*, at.name as aircraft_name, at.purchase_price
            FROM fleet f
            JOIN aircraft_types at ON f.aircraft_type_id = at.id
            WHERE f.id = $1
        `, [id]);
        
        if (aircraft.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aircraft not found'
            });
        }
        
        const aircraftData = aircraft.rows[0];
        const finalSalePrice = sale_price || Math.floor(aircraftData.purchase_price * (aircraftData.condition / 100) * 0.7);
        
        // Inizia transazione
        await db.beginTransaction();
        
        try {
            // Rimuovi aeromobile dalla flotta
            await db.query(`
                DELETE FROM fleet WHERE id = $1
            `, [id]);
            
            // Aggiungi soldi alla compagnia
            await db.query(`
                UPDATE companies 
                SET money = money + $1 
                WHERE id = $2
            `, [finalSalePrice, aircraftData.company_id]);
            
            // Aggiungi record finanziario
            await db.query(`
                INSERT INTO financial_records (
                    company_id, type, amount, description, category
                )
                VALUES ($1, 'revenue', $2, $3, 'aircraft_sale')
            `, [aircraftData.company_id, finalSalePrice, `Sold ${aircraftData.aircraft_name} - ${aircraftData.registration}`]);
            
            await db.commitTransaction();
            
            res.json({
                success: true,
                data: {
                    sale_price: finalSalePrice,
                    aircraft: aircraftData
                }
            });
        } catch (error) {
            await db.rollbackTransaction();
            throw error;
        }
    } catch (error) {
        console.error('Error selling aircraft:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sell aircraft'
        });
    }
});

// POST /api/fleet/:id/maintenance - Esegui manutenzione
router.post('/:id/maintenance', async (req, res) => {
    try {
        const { id } = req.params;
        const { maintenance_type = 'routine' } = req.body;
        
        // Ottieni dettagli aeromobile
        const aircraft = await db.query(`
            SELECT f.*, at.maintenance_cost_per_hour
            FROM fleet f
            JOIN aircraft_types at ON f.aircraft_type_id = at.id
            WHERE f.id = $1
        `, [id]);
        
        if (aircraft.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aircraft not found'
            });
        }
        
        const aircraftData = aircraft.rows[0];
        const maintenanceCost = aircraftData.maintenance_cost_per_hour * 10; // 10 ore di manutenzione
        const conditionImprovement = Math.min(20, 100 - aircraftData.condition);
        
        // Verifica fondi compagnia
        const company = await db.query(`
            SELECT money FROM companies WHERE id = $1
        `, [aircraftData.company_id]);
        
        if (company.rows[0].money < maintenanceCost) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient funds for maintenance'
            });
        }
        
        // Inizia transazione
        await db.beginTransaction();
        
        try {
            // Aggiorna condizione aeromobile
            const updatedAircraft = await db.query(`
                UPDATE fleet 
                SET condition = LEAST(100, condition + $1),
                    status = 'maintenance',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `, [conditionImprovement, id]);
            
            // Addebita costo manutenzione
            await db.query(`
                UPDATE companies 
                SET money = money - $1 
                WHERE id = $2
            `, [maintenanceCost, aircraftData.company_id]);
            
            // Aggiungi record finanziario
            await db.query(`
                INSERT INTO financial_records (
                    company_id, type, amount, description, category
                )
                VALUES ($1, 'expense', $2, $3, 'maintenance')
            `, [aircraftData.company_id, maintenanceCost, `Maintenance for ${aircraftData.registration}`]);
            
            await db.commitTransaction();
            
            res.json({
                success: true,
                data: {
                    aircraft: updatedAircraft.rows[0],
                    maintenance_cost: maintenanceCost,
                    condition_improvement: conditionImprovement
                }
            });
        } catch (error) {
            await db.rollbackTransaction();
            throw error;
        }
    } catch (error) {
        console.error('Error performing maintenance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform maintenance'
        });
    }
});

// GET /api/fleet/available?year=YYYY - Restituisce tutti i tipi di aerei disponibili in un certo anno
router.get('/available', async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) {
            return res.status(400).json({ success: false, error: 'year richiesto' });
        }
            // Prendi tutti i tipi di aerei prodotti fino a quell'anno e non ritirati prima di quell'anno
            // Nota: lo schema utilizza 'market_entry_year' e 'market_exit_year'
            const aircraftTypes = await db.query(`
                            SELECT * FROM aircraft_types 
                            WHERE (market_entry_year IS NULL OR market_entry_year <= $1)
                                AND (market_exit_year IS NULL OR market_exit_year > $1)
                            ORDER BY cruise_speed DESC
                    `, [year]);
        res.json({ success: true, data: aircraftTypes.rows });
    } catch (error) {
        console.error('Error fetching available aircraft types:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch available aircraft types' });
    }
});

module.exports = router;
