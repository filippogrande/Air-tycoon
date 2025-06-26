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
const gameRoutes = require('./routes/game');
const fleetRoutes = require('./routes/fleet');
const routeRoutes = require('./routes/routes');
const airportRoutes = require('./routes/airports');
const financeRoutes = require('./routes/finance');

const app = express();
const PORT = process.env.PORT || 3001;

// =====================================================
// MIDDLEWARE
// =====================================================

// Sicurezza
app.use(helmet({
    contentSecurityPolicy: false, // Disabilita per permettere inline scripts del gioco
    crossOriginEmbedderPolicy: false
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

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Air Tycoon 2 API Server',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            health: '/health',
            game: '/api/game/*',
            fleet: '/api/fleet/*',
            routes: '/api/routes/*',
            airports: '/api/airports/*',
            finance: '/api/finance/*'
        },
        database: 'PostgreSQL Connected',
        docs: 'See README.md for full API documentation'
    });
});

// API Routes
app.use('/api/game', gameRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/finance', financeRoutes);

// Servire file statici del gioco dalla root del progetto
app.use('/game', express.static(path.join(__dirname, '..')));

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
    .then(() => {
        console.log('✅ Connessione database stabilita');
        
        // Avvia server
        app.listen(PORT, () => {
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
