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
                // Recupera anche i tipi delle colonne
const typesResult = await db.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
`, [selectedTable]);
var columnTypes = {};
typesResult.rows.forEach(r => columnTypes[r.column_name] = r.data_type);
            } catch (err) {
                error = 'Errore caricamento dati: ' + err.message;
            }
        }
        // Funzione di formattazione lato server
        function formatCell(val) {
            if (val === null || val === undefined) return '<em style="color:#aaa">null</em>';
            if (typeof val === 'object') return '<code>'+JSON.stringify(val).substring(0,100)+'...</code>';
            if (typeof val === 'string' && val.length > 100) return val.substring(0,100)+'...';
            return val;
        }
        // Funzione per generare il pulsante elimina
        function deleteButton(row) {
            if (!columns.includes('id')) return '';
            return `<form method='post' action='/db-viewer/delete' style='display:inline'>
                <input type='hidden' name='table' value='${selectedTable}' />
                <input type='hidden' name='id' value='${row.id}' />
                <button type='submit' style='color:#fff;background:#dc3545;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;'>Elimina</button>
            </form>`;
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
        .table-container { overflow-x: auto; }
        table { width: max-content; min-width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 10px; border-bottom: 1px solid #eaeaea; font-size: 14px; white-space: pre; }
        th { background: #f8f9fa; color: #2c3e50; position: sticky; top: 0; z-index: 1; }
        tr:hover { background: #f4f8fb; }
        .error { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .record-count { font-size: 13px; color: #6c757d; margin-top: 8px; }
        .delete-btn { color:#fff;background:#dc3545;border:none;border-radius:4px;padding:4px 10px;cursor:pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Visualizzatore Database</h1>
        <form class="table-selector" method="get" action="/db-viewer">
            <label for="table">Tabella:</label>
            <select name="table" id="table" onchange="this.form.submit()">
    ${tables.map(tbl => `<option value="${tbl}"${tbl === selectedTable ? ' selected' : ''}>${tbl}</option>`).join('')}
</select>
            <span class="record-count">(${tableData.length} record)</span>
        </form>
        ${error ? `<div class="error">${error}</div>` : ''}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                   ${columns.map(col => `<th>${col}<br><span style="font-size:11px;color:#888">${columnTypes ? columnTypes[col] : ''}</span></th>`).join('')}${columns.includes('id') ? '<th>Azioni</th>' : ''} </tr>
                </thead>
                <tbody>
                    ${tableData.length === 0 ? `<tr><td colspan="${columns.length}">Nessun dato</td></tr>` :
                        tableData.map(row => `<tr>${columns.map(col => `<td>${formatCell(row[col])}</td>`).join('')}${columns.includes('id') ? `<td>${deleteButton(row)}</td>` : ''}</tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`);
    } catch (err) {
        res.status(500).send('<div class="error">Errore caricamento tabelle: '+err.message+'</div>');
    }
});

// Route per eliminare una entry da una tabella tramite id
router.post('/delete', async (req, res) => {
    const { table, id } = req.body;
    if (!table || !id) {
        return res.status(400).send('Tabella e id obbligatori');
    }
    try {
        await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        res.redirect(`/db-viewer?table=${encodeURIComponent(table)}`);
    } catch (err) {
        res.status(500).send(`<div class='error'>Errore eliminazione: ${err.message}</div>`);
    }
});

// Rotta per vedere le dipendenze (foreign key) di una tabella
router.get('/dependencies/:table', async (req, res) => {
    const table = req.params.table;
    try {
        const depsResult = await db.query(`
            SELECT
                tc.constraint_name,
                tc.table_name,
                kcu.column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE
                tc.constraint_type = 'FOREIGN KEY'
                AND ccu.table_name = $1
                AND ccu.column_name = 'id';
        `, [table]);
        res.json(depsResult.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rotta per esportare lo schema SQL del database
router.get('/schema', async (req, res) => {
    try {
        // Recupera tutte le tabelle utente
        const tablesResult = await db.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        const tables = tablesResult.rows.map(r => r.table_name);
        let schemaSql = '';
        for (const table of tables) {
            // Recupera la definizione delle colonne
            const columnsResult = await db.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1 AND table_schema = 'public'
                ORDER BY ordinal_position
            `, [table]);
            // Recupera le chiavi primarie
            const pkResult = await db.query(`
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
            `, [table]);
            const pkCols = pkResult.rows.map(r => r.column_name);
            // Recupera le foreign key
            const fkResult = await db.query(`
                SELECT kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1 AND tc.table_schema = 'public'
            `, [table]);
            // Costruisci la definizione della tabella
            schemaSql += `CREATE TABLE ${table} (\n`;
            schemaSql += columnsResult.rows.map(col => {
                let line = `  ${col.column_name} ${col.data_type}`;
                if (col.is_nullable === 'NO') line += ' NOT NULL';
                if (col.column_default) line += ` DEFAULT ${col.column_default}`;
                return line;
            }).join(',\n');
            if (pkCols.length > 0) {
                schemaSql += `,\n  PRIMARY KEY (${pkCols.join(', ')})`;
            }
            fkResult.rows.forEach(fk => {
                schemaSql += `,\n  FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table}(${fk.foreign_column})`;
            });
            schemaSql += '\n);\n\n';
        }
        res.setHeader('Content-Type', 'text/plain');
        res.send(schemaSql);
    } catch (err) {
        res.status(500).send('Errore generazione schema: ' + err.message);
    }
});

module.exports = router;
