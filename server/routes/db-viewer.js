const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /db-viewer - Pagina HTML con tutte le tabelle e dati
router.get('/', async (req, res) => {
    try {
        // Recupera tutte le tabelle utente (esclude system)
        const tablesResult = await db.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        const tables = tablesResult.rows.map(r => r.table_name);
        let selectedTable = req.query.table || tables[0];
        let tableData = [];
        let columns = [];
        let error = null;
        if (selectedTable) {
            try {
                const dataResult = await db.query(`SELECT * FROM ${selectedTable} LIMIT 500`);
                tableData = dataResult.rows;
                columns = dataResult.fields.map(f => f.name);
            } catch (err) {
                error = 'Errore caricamento dati: ' + err.message;
            }
        }
        res.send(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>DB Viewer</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6fa; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px; }
        h1 { color: #4a90e2; }
        .table-selector { margin-bottom: 24px; }
        select { padding: 8px 16px; font-size: 16px; border-radius: 6px; border: 1px solid #ccc; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; }
        th { background: #f8f9fa; color: #2c3e50; position: sticky; top: 0; z-index: 1; }
        tr:hover { background: #f4f8fb; }
        .error { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .record-count { font-size: 13px; color: #6c757d; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Visualizzatore Database</h1>
        <form class="table-selector" method="get" action="/db-viewer">
            <label for="table">Tabella:</label>
            <select name="table" id="table" onchange="this.form.submit()">
                ${tables.map(t => `<option value="${t}"${t === selectedTable ? ' selected' : ''}>${t}</option>`).join('')}
            </select>
            <span class="record-count">(${tableData.length} record)</span>
        </form>
        ${error ? `<div class="error">${error}</div>` : ''}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableData.length === 0 ? `<tr><td colspan="${columns.length}">Nessun dato</td></tr>` :
                        tableData.map(row => `<tr>${columns.map(col => `<td>${formatCell(row[col])}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>
    <script>
        function formatCell(val) {
            if (val === null || val === undefined) return '<em style="color:#aaa">null</em>';
            if (typeof val === 'object') return '<code>'+JSON.stringify(val).substring(0,100)+'...</code>';
            if (typeof val === 'string' && val.length > 100) return val.substring(0,100)+'...';
            return val;
        }
    </script>
</body>
</html>`);
    } catch (err) {
        res.status(500).send('<div class="error">Errore caricamento tabelle: '+err.message+'</div>');
    }
});

module.exports = router;
