// Server principale per Air Tycoon 2 Clone
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./database');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const fleetRoutes = require('./routes/fleet');
const routeRoutes = require('./routes/routes');
const airportRoutes = require('./routes/airports');
const financeRoutes = require('./routes/finance');
const marketAnalysisRoutes = require('./routes/market-analysis');
const adminRoutes = require('./routes/admin');
const dbViewerRoutes = require('./routes/db-viewer');

// Sistema migrazioni
const MigrationSystem = require('../database/migration-system');

// Swagger/OpenAPI
const swaggerUi = require('swagger-ui-express');

// INIZIALIZZA EXPRESS PRIMA DI USARE app
const app = express();
const PORT = process.env.PORT || 3001;

// Servi la cartella openapi come statica
app.use('/openapi', express.static(path.join(__dirname, 'openapi')));
// Configura Swagger UI per caricare index.yaml direttamente dal browser
app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/openapi/index.yaml' }));

// =====================================================
// MIDDLEWARE
// =====================================================

// Sicurezza
app.use(helmet({
    contentSecurityPolicy: false, // Disabilita per permettere inline scripts del gioco
    crossOriginEmbedderPolicy: false,
    hsts: false, // Disabilita HSTS per sviluppo locale
    noSniff: false // Permette il caricamento di file JS
}));

// Compressione
app.use(compression());

// Logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 1000, // Limite di 1000 richieste per IP ogni 15 minuti
    message: 'Troppe richieste da questo IP, riprova più tardi.'
});
app.use(limiter);

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ROUTES
// =====================================================

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint - Redirect al gioco
app.get('/', (req, res) => {
    res.redirect(302, '/game/index.html');
});

// API Routes
console.log('📂 Caricamento route API...');
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/market-analysis', marketAnalysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/db-viewer', dbViewerRoutes);
console.log('✅ Route API caricate');

// Documentazione Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/openapi/index.yaml' }));

// Middleware compat: molte pagine vengono servite sotto /game/<folder>/... e referenziano asset con percorsi relativi
// Es: /game/auth/styles/auth.css  -> servire Client/styles/auth.css
//      /game/auth/src/utils/AuthManager.js -> servire Client/src/utils/AuthManager.js
app.get('/game/:folder/:assetType/*', (req, res, next) => {
    const assetType = req.params.assetType; // styles | src | assets
    const rest = req.path.split('/').slice(4).join('/');
    let baseDir;
    if (assetType === 'styles') baseDir = path.join(__dirname, '../Client/styles');
    else if (assetType === 'src') baseDir = path.join(__dirname, '../Client/src');
    else if (assetType === 'assets') baseDir = path.join(__dirname, '../Client/assets');
    else return next();

    const filePath = path.join(baseDir, rest);
    res.sendFile(filePath, err => {
        if (err) {
            // If not found, continue to next middleware/404
            next();
        }
    });
});

// Servire le pagine del gioco dalla cartella Client/pages
// NOTE: /game/index.html viene mappato esplicitamente a hub.html
app.use('/game', express.static(path.join(__dirname, '../Client/pages')));

// Redirect specifico per il percorso vecchio
app.get('/game/select.html', (req, res) => {
    console.log('🔄 Redirect /game/select.html -> /game/game/select.html');
    res.redirect(302, '/game/game/select.html');
});

// Backwards-compatible mapping: some client code uses /game/pages/... (double 'pages')
// Provide a permissive static route so /game/pages/auth/login.html -> Client/pages/auth/login.html
app.use('/game/pages', express.static(path.join(__dirname, '../Client/pages')));
// Redirect any /game/pages/* requests to /game/* to normalize URLs in the browser
app.get('/game/pages/*', (req, res) => {
    const newPath = req.originalUrl.replace('/game/pages/', '/game/');
    res.redirect(302, newPath);
});

// Normalize nested occurrences like /game/:segment/pages/* -> /game/*
// Example: /game/auth/pages/game/select.html -> /game/game/select.html
app.get('/game/:segment/pages/*', (req, res) => {
    try {
        const seg = req.params.segment;
        const prefix = `/game/${seg}/pages/`;
        const newPath = req.originalUrl.replace(prefix, '/game/');
        return res.redirect(302, newPath);
    } catch (err) {
        return res.status(400).json({ error: 'Bad request' });
    }
});
// Backwards-compat: redirect accidental double /game/game/index.html to canonical hub
app.get('/game/game/index.html', (req, res) => {
    return res.redirect(302, '/game/index.html');
});

app.get('/game/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Client/pages/hub.html'));
});

// Compatibility: some pages reference assets under /game/src, /game/styles or /game/assets
// Map those directly to the canonical Client folders so requests like /game/src/auth.js succeed.
app.use('/game/src', express.static(path.join(__dirname, '../Client/src')));
app.use('/game/styles', express.static(path.join(__dirname, '../Client/styles')));
app.use('/game/assets', express.static(path.join(__dirname, '../Client/assets')));

// Sistema unificato - serve tutti i file JS dal percorso Client/src
app.use('/main-src', express.static(path.join(__dirname, '../Client/src')));

// Serve static assets referenced by hub.html
app.use('/styles', express.static(path.join(__dirname, '../Client/styles')));
app.use('/src', express.static(path.join(__dirname, '../Client/src')));
app.use('/assets', express.static(path.join(__dirname, '../Client/assets')));
// also expose entire Client under /Client for backwards compatibility
app.use('/Client', express.static(path.join(__dirname, '../Client')));

// Servi la cartella Client come statica per il frontend
app.use('/Client', express.static(path.join(__dirname, '../Client')));
// Diagnostic middleware: log any requests that contain '/stc/' which appears to be a common typo
// This helps capture browser requests like '/game/stc/auth.js' and the Referer/Initiator.
app.use((req, res, next) => {
    try {
        if (req.originalUrl && req.originalUrl.includes('/stc/')) {
            console.log('⚠️ Detected /stc/ request ->', {
                time: new Date().toISOString(),
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                referer: req.get('referer'),
                ua: req.get('user-agent')
            });
        }
    } catch (err) {
        // ignore
    }
    next();
});
// (Opzionale) Servi direttamente le pagine come root
// app.use('/', express.static(path.join(__dirname, '../Client/pages')));

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint non trovato',
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Database errors
    if (err.code && err.code.startsWith('23')) {
        return res.status(400).json({
            error: 'Errore di validazione database',
            details: err.detail || err.message
        });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Dati non validi',
            details: err.message
        });
    }
    
    // Generic error
    res.status(500).json({
        error: 'Errore interno del server',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Errore generico'
    });
});

// =====================================================
// SERVER STARTUP
// =====================================================

// Test connessione database
db.testConnection()
    .then(async () => {
        console.log('✅ Connessione database stabilita');
        
        // Le migrazioni sono ora gestite dal docker-entrypoint.sh PRIMA del seeding
        // per garantire che tutte le colonne esistano quando i dati vengono inseriti
        console.log('ℹ️ Migrazioni già eseguite dal docker-entrypoint.sh');
        
        // Nota: anche il seeding è gestito dal docker-entrypoint.sh se RUN_SEED=true
        console.log('ℹ️ Seeding gestito dal docker-entrypoint.sh');
        
        // Avvia server, bind esplicito a 0.0.0.0 per assicurare che sia raggiungibile fuori dal container
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server Air Tycoon 2 avviato su porta ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
            console.log(`📊 API base URL: http://localhost:${PORT}/api`);
        });
    })
    .catch(err => {
        console.error('❌ Errore connessione database:', err);
        process.exit(1);
    });

// Gestione graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
    console.log(`\n🛑 Ricevuto ${signal}. Chiusura graceful del server...`);
    
    // Chiudi pool database
    db.closePool()
        .then(() => {
            console.log('💾 Pool database chiuso');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Errore chiusura database:', err);
            process.exit(1);
        });
}

module.exports = app;
