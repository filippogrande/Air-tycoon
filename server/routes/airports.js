const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/airports - Ottieni lista aeroporti
router.get('/', async (req, res) => {
    try {
        const { search, country, limit = 100, size, before } = req.query;
        
        let query = `
            SELECT id, name, iata_code, icao_code, city, country, 
                   latitude, longitude, elevation, timezone,
                   opened_date, closed_date, runways_count, runway_length_meters, airport_size, business_level, tourist_level
            FROM airports 
            WHERE 1=1
        `;
        const params = [];
        
        if (search) {
            query += ` AND (
                name ILIKE $${params.length + 1} OR 
                iata_code ILIKE $${params.length + 1} OR 
                city ILIKE $${params.length + 1}
            )`;
            params.push(`%${search}%`);
        }
        
        if (country) {
            query += ` AND country ILIKE $${params.length + 1}`;
            params.push(`%${country}%`);
        }

        if (size) {
            query += ` AND airport_size = $${params.length + 1}`;
            params.push(size);
        }

        if (before) {
            query += ` AND (opened_date IS NULL OR opened_date <= $${params.length + 1})`;
            params.push(before);
            query += ` AND (closed_date IS NULL OR closed_date > $${params.length})`;
            // closed_date usa lo stesso indice di before
        }
        
        query += ` ORDER BY name LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));
        
        const airports = await db.query(query, params);
        
        res.json(airports.rows);
    } catch (error) {
        console.error('Error fetching airports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch airports'
        });
    }
});

// GET /api/airports/:id - Ottieni dettagli aeroporto
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const airport = await db.query(`
            SELECT * FROM airports WHERE id = $1
        `, [id]);
        
        if (airport.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Airport not found'
            });
        }
        
        // Ottieni statistiche traffico per l'aeroporto
        const stats = await db.query(`
            SELECT 
                COUNT(DISTINCT r.id) as total_routes,
                COUNT(DISTINCT r.company_id) as airlines_count,
                COUNT(f.id) as total_flights,
                AVG(f.passenger_load) as avg_load_factor
            FROM airports a
            LEFT JOIN routes r ON (a.id = r.origin_airport_id OR a.id = r.destination_airport_id)
            LEFT JOIN flights f ON r.id = f.route_id AND f.status = 'completed'
            WHERE a.id = $1
        `, [id]);
        
        // Ottieni rotte dall'aeroporto
        const routes = await db.query(`
            SELECT 
                r.id,
                r.company_id,
                c.name as company_name,
                CASE 
                    WHEN r.origin_airport_id = $1 THEN dest.name
                    ELSE origin.name
                END as destination_name,
                CASE 
                    WHEN r.origin_airport_id = $1 THEN dest.iata_code
                    ELSE origin.iata_code
                END as destination_iata,
                r.distance_km,
                r.frequency_per_week
            FROM routes r
            JOIN companies c ON r.company_id = c.id
            JOIN airports origin ON r.origin_airport_id = origin.id
            JOIN airports dest ON r.destination_airport_id = dest.id
            WHERE r.origin_airport_id = $1 OR r.destination_airport_id = $1
            ORDER BY c.name, destination_name
        `, [id]);
        
        res.json({
            success: true,
            data: {
                airport: airport.rows[0],
                stats: stats.rows[0],
                routes: routes.rows
            }
        });
    } catch (error) {
        console.error('Error fetching airport details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch airport details'
        });
    }
});

// GET /api/airports/near/:lat/:lng - Trova aeroporti vicini
router.get('/near/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const { radius = 100, limit = 20 } = req.query;
        
        const airports = await db.query(`
            SELECT *,
                   (6371 * acos(
                       cos(radians($1)) * cos(radians(latitude)) *
                       cos(radians(longitude) - radians($2)) +
                       sin(radians($1)) * sin(radians(latitude))
                   )) AS distance_km
            FROM airports
            WHERE (6371 * acos(
                       cos(radians($1)) * cos(radians(latitude)) *
                       cos(radians(longitude) - radians($2)) +
                       sin(radians($1)) * sin(radians(latitude))
                   )) <= $3
            ORDER BY distance_km
            LIMIT $4
        `, [parseFloat(lat), parseFloat(lng), parseInt(radius), parseInt(limit)]);
        
        res.json({
            success: true,
            data: airports.rows
        });
    } catch (error) {
        console.error('Error finding nearby airports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to find nearby airports'
        });
    }
});

// GET /api/airports/countries - Ottieni lista paesi
router.get('/countries', async (req, res) => {
    try {
        const countries = await db.query(`
            SELECT country, COUNT(*) as airport_count
            FROM airports 
            GROUP BY country 
            ORDER BY country
        `);
        
        res.json({
            success: true,
            data: countries.rows
        });
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch countries'
        });
    }
});

module.exports = router;
