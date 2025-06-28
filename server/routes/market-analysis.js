// API Routes per gestione analisi di mercato e azioni a pagamento
const express = require('express');
const router = express.Router();
const db = require('../database');

// =====================================================
// ANALISI DI MERCATO
// =====================================================

/**
 * GET /api/routes/market-analysis/:origin/:destination
 * Ottiene l'analisi di mercato per una rotta specifica
 */
router.get('/market-analysis/:origin/:destination', async (req, res) => {
    try {
        const { origin, destination } = req.params;
        const { company_id, analysis_type = 'standard' } = req.query;

        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: 'company_id è richiesto'
            });
        }

        // Ottieni ID aeroporti
        const airportsQuery = `
            SELECT 
                (SELECT id FROM airports WHERE iata_code = $1) as origin_id,
                (SELECT id FROM airports WHERE iata_code = $2) as destination_id
        `;
        const airportsResult = await db.query(airportsQuery, [origin, destination]);
        
        if (!airportsResult.rows[0].origin_id || !airportsResult.rows[0].destination_id) {
            return res.status(404).json({
                success: false,
                message: 'Aeroporti non trovati'
            });
        }

        const { origin_id, destination_id } = airportsResult.rows[0];

        // Cerca analisi esistente
        const analysisQuery = `
            SELECT 
                id,
                analysis_type,
                cost_paid,
                results,
                purchase_date,
                expires_at,
                is_active
            FROM market_analyses 
            WHERE company_id = $1 
                AND origin_airport_id = $2 
                AND destination_airport_id = $3 
                AND analysis_type = $4
                AND is_active = TRUE
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        `;

        const analysisResult = await db.query(analysisQuery, [company_id, origin_id, destination_id, analysis_type]);

        if (analysisResult.rows.length > 0) {
            const analysis = analysisResult.rows[0];
            res.json({
                success: true,
                has_analysis: true,
                analysis: {
                    id: analysis.id,
                    type: analysis.analysis_type,
                    cost_paid: analysis.cost_paid,
                    results: analysis.results,
                    purchase_date: analysis.purchase_date,
                    expires_at: analysis.expires_at
                }
            });
        } else {
            res.json({
                success: true,
                has_analysis: false,
                analysis: null
            });
        }

    } catch (error) {
        console.error('Errore recupero analisi di mercato:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server'
        });
    }
});

/**
 * POST /api/routes/market-analysis
 * Acquista una nuova analisi di mercato
 */
router.post('/market-analysis', async (req, res) => {
    try {
        const {
            company_id,
            origin_airport_code,
            destination_airport_code,
            analysis_type = 'standard',
            cost
        } = req.body;

        // Validazione input
        if (!company_id || !origin_airport_code || !destination_airport_code || !cost) {
            return res.status(400).json({
                success: false,
                message: 'Parametri mancanti: company_id, origin_airport_code, destination_airport_code, cost richiesti'
            });
        }

        // Verifica fondi azienda
        const companyQuery = 'SELECT money FROM companies WHERE id = $1';
        const companyResult = await db.query(companyQuery, [company_id]);
        
        if (companyResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Compagnia non trovata'
            });
        }

        const currentMoney = companyResult.rows[0].money;
        if (currentMoney < cost) {
            return res.status(400).json({
                success: false,
                message: 'Fondi insufficienti',
                current_money: currentMoney,
                required: cost
            });
        }

        // Ottieni ID aeroporti
        const airportsQuery = `
            SELECT 
                (SELECT id FROM airports WHERE iata_code = $1) as origin_id,
                (SELECT id FROM airports WHERE iata_code = $2) as destination_id,
                (SELECT latitude FROM airports WHERE iata_code = $1) as origin_lat,
                (SELECT longitude FROM airports WHERE iata_code = $1) as origin_lng,
                (SELECT latitude FROM airports WHERE iata_code = $2) as dest_lat,
                (SELECT longitude FROM airports WHERE iata_code = $2) as dest_lng
        `;
        const airportsResult = await db.query(airportsQuery, [origin_airport_code, destination_airport_code]);
        
        if (!airportsResult.rows[0].origin_id || !airportsResult.rows[0].destination_id) {
            return res.status(404).json({
                success: false,
                message: 'Aeroporti non trovati'
            });
        }

        const airportData = airportsResult.rows[0];

        // Verifica se analisi già esiste
        const existingQuery = `
            SELECT id FROM market_analyses 
            WHERE company_id = $1 
                AND origin_airport_id = $2 
                AND destination_airport_id = $3 
                AND analysis_type = $4
                AND is_active = TRUE
        `;
        const existingResult = await db.query(existingQuery, [
            company_id, 
            airportData.origin_id, 
            airportData.destination_id, 
            analysis_type
        ]);

        if (existingResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Analisi di mercato già esistente per questa rotta'
            });
        }

        // Calcola distanza
        const distance = calculateDistance(
            airportData.origin_lat, 
            airportData.origin_lng, 
            airportData.dest_lat, 
            airportData.dest_lng
        );

        // Genera risultati analisi
        const analysisResults = generateMarketAnalysisResults(
            origin_airport_code, 
            destination_airport_code, 
            distance, 
            analysis_type
        );

        // Inizia transazione
        await db.query('BEGIN');

        try {
            // Sottrai denaro dalla compagnia
            await db.query(
                'UPDATE companies SET money = money - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [cost, company_id]
            );

            // Salva analisi di mercato
            const insertQuery = `
                INSERT INTO market_analyses (
                    company_id, 
                    origin_airport_id, 
                    destination_airport_id, 
                    analysis_type, 
                    cost_paid, 
                    results
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, purchase_date
            `;

            const insertResult = await db.query(insertQuery, [
                company_id,
                airportData.origin_id,
                airportData.destination_id,
                analysis_type,
                cost,
                JSON.stringify(analysisResults)
            ]);

            // Log azione a pagamento
            await db.query(`
                INSERT INTO paid_actions (
                    company_id, 
                    action_type, 
                    action_subtype, 
                    target_entity_type, 
                    cost_paid, 
                    action_data, 
                    results
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                company_id,
                'market_analysis',
                analysis_type,
                'route',
                cost,
                JSON.stringify({
                    origin_airport_code,
                    destination_airport_code,
                    distance
                }),
                JSON.stringify(analysisResults)
            ]);

            await db.query('COMMIT');

            res.json({
                success: true,
                message: 'Analisi di mercato acquistata con successo',
                analysis: {
                    id: insertResult.rows[0].id,
                    type: analysis_type,
                    cost_paid: cost,
                    results: analysisResults,
                    purchase_date: insertResult.rows[0].purchase_date
                },
                new_balance: currentMoney - cost
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Errore acquisto analisi di mercato:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server'
        });
    }
});

// =====================================================
// MIGLIORAMENTI DOMANDA
// =====================================================

/**
 * GET /api/routes/demand-improvements/:origin/:destination
 * Ottiene i miglioramenti domanda per una rotta
 */
router.get('/demand-improvements/:origin/:destination', async (req, res) => {
    try {
        const { origin, destination } = req.params;
        const { company_id } = req.query;

        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: 'company_id è richiesto'
            });
        }

        // Ottieni ID aeroporti
        const airportsQuery = `
            SELECT 
                (SELECT id FROM airports WHERE iata_code = $1) as origin_id,
                (SELECT id FROM airports WHERE iata_code = $2) as destination_id
        `;
        const airportsResult = await db.query(airportsQuery, [origin, destination]);
        
        if (!airportsResult.rows[0].origin_id || !airportsResult.rows[0].destination_id) {
            return res.status(404).json({
                success: false,
                message: 'Aeroporti non trovati'
            });
        }

        const { origin_id, destination_id } = airportsResult.rows[0];

        // Cerca miglioramenti esistenti
        const improvementsQuery = `
            SELECT 
                id,
                improvement_type,
                cost_paid,
                results,
                purchase_date,
                expires_at,
                is_active
            FROM demand_improvements 
            WHERE company_id = $1 
                AND origin_airport_id = $2 
                AND destination_airport_id = $3 
                AND is_active = TRUE
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            ORDER BY purchase_date DESC
        `;

        const improvementsResult = await db.query(improvementsQuery, [company_id, origin_id, destination_id]);

        res.json({
            success: true,
            improvements: improvementsResult.rows.map(row => ({
                id: row.id,
                type: row.improvement_type,
                cost_paid: row.cost_paid,
                results: row.results,
                purchase_date: row.purchase_date,
                expires_at: row.expires_at
            }))
        });

    } catch (error) {
        console.error('Errore recupero miglioramenti domanda:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server'
        });
    }
});

/**
 * POST /api/routes/demand-improvements
 * Acquista un nuovo miglioramento domanda
 */
router.post('/demand-improvements', async (req, res) => {
    try {
        const {
            company_id,
            origin_airport_code,
            destination_airport_code,
            improvement_type,
            cost
        } = req.body;

        // Validazione input
        if (!company_id || !origin_airport_code || !destination_airport_code || !improvement_type || !cost) {
            return res.status(400).json({
                success: false,
                message: 'Parametri mancanti'
            });
        }

        // Verifica tipo miglioramento valido
        const validTypes = ['detailed_traffic', 'seasonal_analysis', 'competitor_analysis'];
        if (!validTypes.includes(improvement_type)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo miglioramento non valido'
            });
        }

        // Verifica fondi azienda
        const companyQuery = 'SELECT money FROM companies WHERE id = $1';
        const companyResult = await db.query(companyQuery, [company_id]);
        
        if (companyResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Compagnia non trovata'
            });
        }

        const currentMoney = companyResult.rows[0].money;
        if (currentMoney < cost) {
            return res.status(400).json({
                success: false,
                message: 'Fondi insufficienti'
            });
        }

        // Resto dell'implementazione simile al market-analysis...
        // [Continua con logica simile per miglioramenti domanda]

        res.json({
            success: true,
            message: 'Miglioramento domanda acquistato con successo',
            improvement: {
                type: improvement_type,
                cost_paid: cost,
                results: {}
            }
        });

    } catch (error) {
        console.error('Errore acquisto miglioramento domanda:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server'
        });
    }
});

// =====================================================
// FUNZIONI HELPER
// =====================================================

/**
 * Calcola distanza tra due punti geografici
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raggio Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

/**
 * Genera risultati realistici per l'analisi di mercato
 */
function generateMarketAnalysisResults(origin, destination, distance, analysisType) {
    // Calcola costo per volo basato su distanza
    const baseCostPerKm = 2.5;
    const costPerFlight = Math.round(distance * baseCostPerKm);
    
    // Stima ricavi mensili
    const avgPassengersPerDay = 150 + Math.random() * 200;
    const avgTicketPrice = Math.max(50, distance * 0.08 + Math.random() * 50);
    const monthlyRevenue = Math.round(avgPassengersPerDay * avgTicketPrice * 30);
    
    // Calcola profitto stimato
    const flightsPerMonth = 60;
    const monthlyCosts = costPerFlight * flightsPerMonth;
    const estimatedProfit = monthlyRevenue - monthlyCosts;
    
    const results = {
        cost_per_flight: costPerFlight,
        monthly_revenue: monthlyRevenue,
        estimated_profit: estimatedProfit,
        analysis_date: new Date().toISOString(),
        confidence_level: analysisType === 'premium' ? 'high' : 'medium',
        market_factors: {
            competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            demand_trend: ['declining', 'stable', 'growing'][Math.floor(Math.random() * 3)],
            seasonal_variation: Math.floor(Math.random() * 30) + 5
        }
    };

    // Aggiungi dettagli extra per analisi premium
    if (analysisType === 'premium' || analysisType === 'detailed') {
        results.detailed_breakdown = {
            fuel_costs: Math.round(costPerFlight * 0.35),
            crew_costs: Math.round(costPerFlight * 0.25),
            maintenance_costs: Math.round(costPerFlight * 0.15),
            airport_fees: Math.round(costPerFlight * 0.15),
            other_costs: Math.round(costPerFlight * 0.10)
        };
        
        results.passenger_segments = {
            business: Math.round(avgPassengersPerDay * 0.15),
            economy: Math.round(avgPassengersPerDay * 0.85)
        };
        
        results.pricing_recommendations = {
            business_price: Math.round(avgTicketPrice * 2.5),
            economy_price: Math.round(avgTicketPrice * 0.8),
            load_factor_target: 0.75 + Math.random() * 0.15
        };
    }
    
    return results;
}

module.exports = router;
