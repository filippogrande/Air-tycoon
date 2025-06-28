const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/admin/tables/:tableName - Visualizza contenuto di una tabella
router.get('/tables/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;
        
        // Lista delle tabelle permesse per sicurezza
        const allowedTables = [
            'companies',
            'game_saves', 
            'fleet',
            'routes',
            'financial_records',
            'airport_infrastructure',
            'demand_data',
            'airports'
        ];
        
        if (!allowedTables.includes(tableName)) {
            return res.status(400).json({
                success: false,
                error: 'Tabella non permessa: ' + tableName
            });
        }
        
        // Query per ottenere tutti i dati della tabella
        const result = await db.query(`SELECT * FROM ${tableName} ORDER BY id LIMIT 500`);
        
        res.json({
            success: true,
            data: result.rows,
            table: tableName,
            count: result.rows.length
        });
        
    } catch (error) {
        console.error('Error fetching table data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch table data: ' + error.message
        });
    }
});

// GET /api/admin/tables - Lista tutte le tabelle disponibili
router.get('/tables', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT table_name, table_schema 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        res.json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching tables list:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tables list: ' + error.message
        });
    }
});

// GET /api/admin/schema/:tableName - Mostra schema di una tabella
router.get('/schema/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;
        
        const result = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = $1 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `, [tableName]);
        
        res.json({
            success: true,
            data: result.rows,
            table: tableName
        });
        
    } catch (error) {
        console.error('Error fetching table schema:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch table schema: ' + error.message
        });
    }
});

// GET /api/admin/stats - Statistiche generali del database
router.get('/stats', async (req, res) => {
    try {
        const tables = [
            'companies',
            'game_saves',
            'fleet', 
            'routes',
            'financial_records',
            'airports'
        ];
        
        const stats = {};
        
        for (const table of tables) {
            try {
                const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
                stats[table] = parseInt(result.rows[0].count);
            } catch (tableError) {
                stats[table] = 'Errore: ' + tableError.message;
            }
        }
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error fetching database stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch database stats: ' + error.message
        });
    }
});

module.exports = router;
