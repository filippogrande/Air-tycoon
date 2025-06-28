const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// POST /api/auth/register - Registra nuovo utente
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validazione input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e password sono obbligatori'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La password deve essere di almeno 6 caratteri'
            });
        }
        
        // Verifica che l'email non esista già
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Un utente con questa email esiste già'
            });
        }
        
        // Hash password
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        
        // Genera ID utente
        const userId = crypto.randomUUID();
        
        // Crea solo l'utente (la compagnia verrà creata quando inizia una partita)
        await db.query(`
            INSERT INTO users (id, email, password_hash, created_at)
            VALUES ($1, $2, $3, NOW())
        `, [userId, email, passwordHash]);
        
        console.log('✅ Utente registrato nel database:', email);
        
        res.json({
            success: true,
            message: 'Registrazione completata con successo!',
            data: {
                userId: userId,
                email: email
            }
        });
        
    } catch (error) {
        console.error('❌ Errore registrazione utente:', error);
        console.error('📋 Dettagli errore:', {
            code: error.code,
            message: error.message,
            detail: error.detail
        });
        
        // Errori specifici del database
        if (error.code === '42P01') {
            return res.status(500).json({
                success: false,
                error: 'Database non inizializzato. Contattare l\'amministratore.'
            });
        }
        
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                error: 'Un utente con questa email esiste già'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Errore interno del server durante la registrazione'
        });
    }
});

// POST /api/auth/login - Login utente
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e password sono obbligatori'
            });
        }
        
        // Hash password per confronto
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        
        // Cerca utente nel database (senza compagnia per ora)
        const userResult = await db.query(`
            SELECT u.id, u.email, u.created_at, u.last_login
            FROM users u
            WHERE u.email = $1 AND u.password_hash = $2
        `, [email, passwordHash]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Email o password non corretti'
            });
        }
        
        const user = userResult.rows[0];
        
        // Aggiorna ultimo login
        await db.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );
        
        console.log('✅ Login database effettuato:', email);
        
        res.json({
            success: true,
            message: 'Login effettuato con successo!',
            data: {
                userId: user.id,
                email: user.email,
                createdAt: user.created_at,
                lastLogin: new Date().toISOString() // Appena aggiornato
            }
        });
        
    } catch (error) {
        console.error('Errore login utente:', error);
        res.status(500).json({
            success: false,
            error: 'Errore interno del server durante il login'
        });
    }
});

// GET /api/auth/verify - Verifica token/sessione (placeholder per future implementazioni)
router.get('/verify', async (req, res) => {
    // Per ora ritorna sempre successo - in futuro implementeremo JWT
    res.json({
        success: true,
        message: 'Token verificato (placeholder)'
    });
});

module.exports = router;
