// Configurazione e gestione database PostgreSQL
const { Pool } = require('pg');

// Configurazione pool di connessioni
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'air_tycoon_2',
    password: String(process.env.DB_PASSWORD || ''),
    port: parseInt(process.env.DB_PORT) || 5432,
    
    // Pool settings
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Event listeners per il pool
pool.on('connect', () => {
    console.log('🔗 Nuova connessione database stabilita');
});

pool.on('error', (err) => {
    console.error('❌ Errore pool database:', err);
});

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Test connessione
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as now, version() as version');
        client.release();
        
        console.log('📅 Database timestamp:', result.rows[0].now);
        console.log('🐘 PostgreSQL version:', result.rows[0].version.split(' ')[0]);
        
        return true;
    } catch (err) {
        console.error('❌ Test connessione fallito:', err);
        throw err;
    }
}

// Esegui query con gestione errori
async function query(text, params = []) {
    const start = Date.now();
    
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Query eseguita:', { text, duration, rows: result.rowCount });
        }
        
        return result;
    } catch (err) {
        console.error('❌ Errore query:', { text, error: err.message });
        throw err;
    }
}

// Transazione sicura
async function transaction(callback) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        
        console.log('✅ Transazione completata con successo');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Transazione fallita, rollback eseguito:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Chiudi pool
async function closePool() {
    try {
        await pool.end();
        console.log('💾 Pool database chiuso');
    } catch (err) {
        console.error('❌ Errore chiusura pool:', err);
        throw err;
    }
}

// =====================================================
// QUERY BUILDERS
// =====================================================

// Costruttore query SELECT con paginazione
function buildSelectQuery(table, options = {}) {
    let query = `SELECT `;
    
    // Campi
    if (options.select) {
        query += Array.isArray(options.select) ? options.select.join(', ') : options.select;
    } else {
        query += '*';
    }
    
    query += ` FROM ${table}`;
    
    // WHERE
    if (options.where) {
        const conditions = Object.keys(options.where)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        query += ` WHERE ${conditions}`;
    }
    
    // ORDER BY
    if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
        if (options.orderDirection) {
            query += ` ${options.orderDirection}`;
        }
    }
    
    // LIMIT
    if (options.limit) {
        const paramIndex = options.where ? Object.keys(options.where).length + 1 : 1;
        query += ` LIMIT $${paramIndex}`;
    }
    
    // OFFSET
    if (options.offset && options.limit) {
        const paramIndex = options.where ? Object.keys(options.where).length + 2 : 2;
        query += ` OFFSET $${paramIndex}`;
    }
    
    return query;
}

// Costruttore query INSERT
function buildInsertQuery(table, data) {
    const keys = Object.keys(data);
    const values = keys.map((_, index) => `$${index + 1}`);
    
    return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;
}

// Costruttore query UPDATE
function buildUpdateQuery(table, data, whereCondition) {
    const keys = Object.keys(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereKeys = Object.keys(whereCondition);
    const whereClause = whereKeys
        .map((key, index) => `${key} = $${keys.length + index + 1}`)
        .join(' AND ');
    
    return `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
}

// =====================================================
// SPECIALIZED QUERIES
// =====================================================

// Ottieni statistiche database
async function getDatabaseStats() {
    const query = `
        SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            most_common_vals,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes
        FROM pg_stats 
        WHERE schemaname = 'public'
        ORDER BY tablename, attname;
    `;
    
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error('❌ Errore recupero statistiche:', err);
        return [];
    }
}

// Ottieni dimensioni tabelle
async function getTableSizes() {
    const query = `
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size('public.'||tablename) DESC;
    `;
    
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error('❌ Errore recupero dimensioni tabelle:', err);
        return [];
    }
}

// Pulizia automatica dati vecchi
async function cleanupOldData() {
    const queries = [
        // Elimina voli più vecchi di 1 anno
        `DELETE FROM flights WHERE departure_time < NOW() - INTERVAL '1 year'`,
        
        // Elimina salvataggi automatici più vecchi di 30 giorni
        `DELETE FROM game_saves 
         WHERE save_type = 'auto' AND created_at < NOW() - INTERVAL '30 days'`,
        
        // Elimina report finanziari più vecchi di 2 anni
        `DELETE FROM financial_reports 
         WHERE report_date < NOW() - INTERVAL '2 years'`
    ];
    
    try {
        let totalDeleted = 0;
        
        for (const query of queries) {
            const result = await pool.query(query);
            totalDeleted += result.rowCount;
        }
        
        console.log(`🧹 Pulizia completata: ${totalDeleted} record eliminati`);
        return totalDeleted;
    } catch (err) {
        console.error('❌ Errore durante la pulizia:', err);
        throw err;
    }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
    closePool,
    buildSelectQuery,
    buildInsertQuery,
    buildUpdateQuery,
    getDatabaseStats,
    getTableSizes,
    cleanupOldData
};
