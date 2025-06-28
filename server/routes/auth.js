const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// POST /api/auth/register - Registra nuovo utente
router.post('/register', async (req, res) => {
    try {
        const { email, password, companyName } = req.body;
        
        // Validazione input
        if (!email || !password || !companyName) {
            return res.status(400).json({
                success: false,
                error: 'Email, password e nome compagnia sono obbligatori'
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
        
        // Inizia transazione
        await db.query('BEGIN');
        
        try {
            // Crea utente
            await db.query(`
                INSERT INTO users (id, email, password_hash, created_at)
                VALUES ($1, $2, $3, NOW())
            `, [userId, email, passwordHash]);
            
            // Crea compagnia associata
            const companyId = crypto.randomUUID();
            await db.query(`
                INSERT INTO companies (id, name, money, reputation, founded, base_airport, user_id)
                VALUES ($1, $2, $3, $4, NOW(), $5, $6)
            `, [companyId, companyName, 1000000, 50, null, userId]);
            
            // Commit transazione
            await db.query('COMMIT');
            
            console.log('✅ Utente registrato nel database:', email, 'con compagnia:', companyName);
            
            res.json({
                success: true,
                message: 'Registrazione completata con successo!',
                data: {
                    userId: userId,
                    companyId: companyId,
                    email: email,
                    companyName: companyName
                }
            });
            
        } catch (innerError) {
            await db.query('ROLLBACK');
            throw innerError;
        }
        
    } catch (error) {
        console.error('Errore registrazione utente:', error);
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
        
        // Cerca utente nel database
        const userResult = await db.query(`
            SELECT u.*, c.id as company_id, c.name as company_name, c.money, c.reputation
            FROM users u
            LEFT JOIN companies c ON u.id = c.user_id
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
                companyId: user.company_id,
                companyName: user.company_name,
                money: user.money,
                reputation: user.reputation,
                lastLogin: user.last_login
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
