const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/finance/company/:company_id - Ottieni record finanziari
router.get('/company/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        const { start_date, end_date, category, type, limit = 100 } = req.query;
        
        let query = `
            SELECT * FROM financial_records 
            WHERE company_id = $1
        `;
        const params = [company_id];
        
        if (start_date) {
            query += ` AND created_at >= $${params.length + 1}`;
            params.push(start_date);
        }
        
        if (end_date) {
            query += ` AND created_at <= $${params.length + 1}`;
            params.push(end_date);
        }
        
        if (category) {
            query += ` AND category = $${params.length + 1}`;
            params.push(category);
        }
        
        if (type) {
            query += ` AND type = $${params.length + 1}`;
            params.push(type);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));
        
        const records = await db.query(query, params);
        
        res.json({
            success: true,
            data: records.rows
        });
    } catch (error) {
        console.error('Error fetching financial records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch financial records'
        });
    }
});

// GET /api/finance/summary/:company_id - Ottieni riassunto finanziario
router.get('/summary/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        const { period = '30' } = req.query; // giorni
        
        // Riassunto generale
        const summary = await db.query(`
            SELECT 
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END) as net_profit,
                COUNT(*) as total_transactions
            FROM financial_records 
            WHERE company_id = $1 
            AND created_at >= CURRENT_DATE - INTERVAL '$2 days'
        `, [company_id, period]);
        
        // Ripartizione per categoria
        const byCategory = await db.query(`
            SELECT 
                category,
                type,
                SUM(amount) as total_amount,
                COUNT(*) as transaction_count
            FROM financial_records 
            WHERE company_id = $1 
            AND created_at >= CURRENT_DATE - INTERVAL '$2 days'
            GROUP BY category, type
            ORDER BY total_amount DESC
        `, [company_id, period]);
        
        // Trend giornaliero
        const dailyTrend = await db.query(`
            SELECT 
                DATE(created_at) as date,
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as daily_revenue,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as daily_expenses,
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END) as daily_profit
            FROM financial_records 
            WHERE company_id = $1 
            AND created_at >= CURRENT_DATE - INTERVAL '$2 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `, [company_id, period]);
        
        // Informazioni compagnia
        const company = await db.query(`
            SELECT money, reputation FROM companies WHERE id = $1
        `, [company_id]);
        
        res.json({
            success: true,
            data: {
                company: company.rows[0],
                summary: summary.rows[0],
                by_category: byCategory.rows,
                daily_trend: dailyTrend.rows
            }
        });
    } catch (error) {
        console.error('Error fetching financial summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch financial summary'
        });
    }
});

// POST /api/finance/transaction - Aggiungi transazione
router.post('/transaction', async (req, res) => {
    try {
        const { company_id, type, amount, description, category, flight_id, aircraft_id } = req.body;
        
        if (!company_id || !type || !amount || !description) {
            return res.status(400).json({
                success: false,
                error: 'Company ID, type, amount and description are required'
            });
        }
        
        if (!['revenue', 'expense'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Type must be revenue or expense'
            });
        }
        
        // Inizia transazione
        await db.beginTransaction();
        
        try {
            // Aggiungi record finanziario
            const record = await db.query(`
                INSERT INTO financial_records (
                    company_id, type, amount, description, category, flight_id, aircraft_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [company_id, type, amount, description, category, flight_id, aircraft_id]);
            
            // Aggiorna soldi compagnia
            const adjustment = type === 'revenue' ? amount : -amount;
            await db.query(`
                UPDATE companies 
                SET money = money + $1 
                WHERE id = $2
            `, [adjustment, company_id]);
            
            await db.commitTransaction();
            
            res.status(201).json({
                success: true,
                data: record.rows[0]
            });
        } catch (error) {
            await db.rollbackTransaction();
            throw error;
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add transaction'
        });
    }
});

// GET /api/finance/profit-loss/:company_id - Report profitti e perdite
router.get('/profit-loss/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        const { start_date, end_date } = req.query;
        
        let dateFilter = '';
        const params = [company_id];
        
        if (start_date && end_date) {
            dateFilter = ` AND created_at BETWEEN $2 AND $3`;
            params.push(start_date, end_date);
        } else if (start_date) {
            dateFilter = ` AND created_at >= $2`;
            params.push(start_date);
        } else if (end_date) {
            dateFilter = ` AND created_at <= $2`;
            params.push(end_date);
        }
        
        const report = await db.query(`
            SELECT 
                -- Ricavi
                SUM(CASE WHEN type = 'revenue' AND category = 'flight_revenue' THEN amount ELSE 0 END) as flight_revenue,
                SUM(CASE WHEN type = 'revenue' AND category = 'aircraft_sale' THEN amount ELSE 0 END) as aircraft_sales,
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as total_revenue,
                
                -- Costi operativi
                SUM(CASE WHEN type = 'expense' AND category = 'fuel' THEN amount ELSE 0 END) as fuel_costs,
                SUM(CASE WHEN type = 'expense' AND category = 'maintenance' THEN amount ELSE 0 END) as maintenance_costs,
                SUM(CASE WHEN type = 'expense' AND category = 'airport_fees' THEN amount ELSE 0 END) as airport_fees,
                SUM(CASE WHEN type = 'expense' AND category = 'crew_salary' THEN amount ELSE 0 END) as crew_costs,
                
                -- Investimenti
                SUM(CASE WHEN type = 'expense' AND category = 'aircraft_purchase' THEN amount ELSE 0 END) as aircraft_purchases,
                SUM(CASE WHEN type = 'expense' AND category = 'research' THEN amount ELSE 0 END) as research_costs,
                
                -- Altri costi
                SUM(CASE WHEN type = 'expense' AND category NOT IN ('fuel', 'maintenance', 'airport_fees', 'crew_salary', 'aircraft_purchase', 'research') THEN amount ELSE 0 END) as other_expenses,
                
                -- Totali
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END) as net_profit
                
            FROM financial_records 
            WHERE company_id = $1 ${dateFilter}
        `, params);
        
        res.json({
            success: true,
            data: report.rows[0]
        });
    } catch (error) {
        console.error('Error generating P&L report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate P&L report'
        });
    }
});

// GET /api/finance/cash-flow/:company_id - Report flusso di cassa
router.get('/cash-flow/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        const { months = 12 } = req.query;
        
        const cashFlow = await db.query(`
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END) as cash_in,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as cash_out,
                SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END) as net_cash_flow
            FROM financial_records 
            WHERE company_id = $1 
            AND created_at >= CURRENT_DATE - INTERVAL '$2 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month DESC
        `, [company_id, months]);
        
        // Calcola saldo progressivo
        let runningBalance = 0;
        const company = await db.query(`
            SELECT money FROM companies WHERE id = $1
        `, [company_id]);
        
        if (company.rows.length > 0) {
            runningBalance = parseFloat(company.rows[0].money);
        }
        
        const enhancedCashFlow = cashFlow.rows.reverse().map(row => {
            runningBalance += parseFloat(row.net_cash_flow);
            return {
                ...row,
                running_balance: runningBalance
            };
        }).reverse();
        
        res.json({
            success: true,
            data: enhancedCashFlow
        });
    } catch (error) {
        console.error('Error generating cash flow report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate cash flow report'
        });
    }
});

module.exports = router;
