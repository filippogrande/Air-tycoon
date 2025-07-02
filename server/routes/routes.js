const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/routes/company/:company_id - Ottieni rotte di una compagnia
router.get('/company/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        
        const routes = await db.query(`
            SELECT r.*,
                   origin.name as origin_name,
                   origin.iata_code as origin_iata,
                   origin.city as origin_city,
                   origin.country as origin_country,
                   dest.name as destination_name,
                   dest.iata_code as destination_iata,
                   dest.city as destination_city,
                   dest.country as destination_country,
                   COUNT(f.id) as total_flights,
                   AVG(f.passenger_load) as avg_load_factor,
                   SUM(f.revenue) as total_revenue
            FROM routes r
            JOIN airports origin ON r.origin_airport_id = origin.id
            JOIN airports dest ON r.destination_airport_id = dest.id
            LEFT JOIN flights f ON r.id = f.route_id
            WHERE r.company_id = $1
            GROUP BY r.id, origin.id, dest.id
            ORDER BY r.created_at DESC
        `, [company_id]);
        
        res.json({
            success: true,
            data: routes.rows
        });
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch routes'
        });
    }
});

// GET /api/routes/:id - Ottieni dettagli rotta
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const route = await db.query(`
            SELECT r.*,
                   origin.name as origin_name,
                   origin.iata_code as origin_iata,
                   origin.latitude as origin_lat,
                   origin.longitude as origin_lng,
                   dest.name as destination_name,
                   dest.iata_code as destination_iata,
                   dest.latitude as dest_lat,
                   dest.longitude as dest_lng
            FROM routes r
            JOIN airports origin ON r.origin_airport_id = origin.id
            JOIN airports dest ON r.destination_airport_id = dest.id
            WHERE r.id = $1
        `, [id]);
        
        if (route.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        }
        
        // Ottieni voli per questa rotta
        const flights = await db.query(`
            SELECT f.*, a.registration, at.name as aircraft_name
            FROM flights f
            LEFT JOIN fleet a ON f.aircraft_id = a.id
            LEFT JOIN aircraft_types at ON a.aircraft_type_id = at.id
            WHERE f.route_id = $1
            ORDER BY f.departure_time DESC
            LIMIT 20
        `, [id]);
        
        res.json({
            success: true,
            data: {
                route: route.rows[0],
                recent_flights: flights.rows
            }
        });
    } catch (error) {
        console.error('Error fetching route details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch route details'
        });
    }
});

// POST /api/routes - Crea nuova rotta
router.post('/', async (req, res) => {
    try {
        const {
            company_id,
            origin_airport_id,
            destination_airport_id,
            distance_km,
            base_price,
            frequency_per_week
        } = req.body;
        
        if (!company_id || !origin_airport_id || !destination_airport_id) {
            return res.status(400).json({
                success: false,
                error: 'Company ID, origin and destination airports are required'
            });
        }
        
        if (origin_airport_id === destination_airport_id) {
            return res.status(400).json({
                success: false,
                error: 'Origin and destination must be different'
            });
        }
        
        // Verifica che non esista già la stessa rotta
        const existingRoute = await db.query(`
            SELECT id FROM routes 
            WHERE company_id = $1 
            AND origin_airport_id = $2 
            AND destination_airport_id = $3
        `, [company_id, origin_airport_id, destination_airport_id]);
        
        if (existingRoute.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Route already exists'
            });
        }
        
        // Calcola distanza se non fornita
        let finalDistance = distance_km;
        if (!finalDistance) {
            const airports = await db.query(`
                SELECT 
                    origin.latitude as origin_lat, origin.longitude as origin_lng,
                    dest.latitude as dest_lat, dest.longitude as dest_lng
                FROM airports origin, airports dest
                WHERE origin.id = $1 AND dest.id = $2
            `, [origin_airport_id, destination_airport_id]);
            
            if (airports.rows.length > 0) {
                const { origin_lat, origin_lng, dest_lat, dest_lng } = airports.rows[0];
                finalDistance = calculateDistance(origin_lat, origin_lng, dest_lat, dest_lng);
            }
        }
        
        const result = await db.query(`
            INSERT INTO routes (
                company_id, origin_airport_id, destination_airport_id,
                distance_km, base_price, frequency_per_week, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'active')
            RETURNING *
        `, [company_id, origin_airport_id, destination_airport_id, finalDistance, base_price, frequency_per_week || 7]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create route'
        });
    }
});

// PUT /api/routes/:id - Aggiorna rotta
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { base_price, frequency_per_week, status } = req.body;
        
        const result = await db.query(`
            UPDATE routes 
            SET base_price = COALESCE($1, base_price),
                frequency_per_week = COALESCE($2, frequency_per_week),
                status = COALESCE($3, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `, [base_price, frequency_per_week, status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update route'
        });
    }
});

// DELETE /api/routes/:id - Elimina rotta
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verifica che non ci siano voli programmati
        const scheduledFlights = await db.query(`
            SELECT COUNT(*) as count FROM flights 
            WHERE route_id = $1 AND status IN ('scheduled', 'boarding', 'in_flight')
        `, [id]);
        
        if (parseInt(scheduledFlights.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete route with scheduled flights'
            });
        }
        
        const result = await db.query(`
            DELETE FROM routes WHERE id = $1 RETURNING *
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete route'
        });
    }
});

// POST /api/routes/:id/schedule - Programma volo su rotta
router.post('/:id/schedule', async (req, res) => {
    try {
        const { id } = req.params;
        const { aircraft_id, departure_time, passenger_load } = req.body;
        
        if (!aircraft_id || !departure_time) {
            return res.status(400).json({
                success: false,
                error: 'Aircraft ID and departure time are required'
            });
        }
        
        // Verifica che la rotta esista e sia attiva
        const route = await db.query(`
            SELECT * FROM routes WHERE id = $1 AND status = 'active'
        `, [id]);
        
        if (route.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Active route not found'
            });
        }
        
        // Verifica che l'aeromobile sia disponibile
        const aircraft = await db.query(`
            SELECT f.*, at.capacity, at.fuel_consumption, at.cruise_speed
            FROM fleet f
            JOIN aircraft_types at ON f.aircraft_type_id = at.id
            WHERE f.id = $1 AND f.company_id = $2 AND f.status = 'available'
        `, [aircraft_id, route.rows[0].company_id]);
        
        if (aircraft.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aircraft not available'
            });
        }
        
        // Calcola durata volo (ore)
        const flightDuration = route.rows[0].distance_km / aircraft.rows[0].cruise_speed;
        const arrivalTime = new Date(new Date(departure_time).getTime() + flightDuration * 60 * 60 * 1000);
        
        // Calcola costi e ricavi
        const fuelCost = route.rows[0].distance_km * aircraft.rows[0].fuel_consumption * 0.5; // $0.5 per litro
        const revenue = (passenger_load || 0.8) * aircraft.rows[0].capacity * route.rows[0].base_price;
        
        const result = await db.query(`
            INSERT INTO flights (
                route_id, aircraft_id, departure_time, arrival_time,
                passenger_load, revenue, fuel_cost, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled')
            RETURNING *
        `, [id, aircraft_id, departure_time, arrivalTime, passenger_load || 0.8, revenue, fuelCost]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error scheduling flight:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule flight'
        });
    }
});

// GET /api/routes/analysis/:company_id - Analisi performance rotte
router.get('/analysis/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        
        const analysis = await db.query(`
            SELECT 
                r.id,
                origin.iata_code as origin,
                dest.iata_code as destination,
                r.distance_km,
                r.base_price,
                COUNT(f.id) as total_flights,
                AVG(f.passenger_load) as avg_load_factor,
                SUM(f.revenue) as total_revenue,
                SUM(f.fuel_cost) as total_fuel_cost,
                SUM(f.revenue - f.fuel_cost) as net_profit,
                CASE 
                    WHEN COUNT(f.id) > 0 THEN SUM(f.revenue - f.fuel_cost) / COUNT(f.id)
                    ELSE 0 
                END as profit_per_flight
            FROM routes r
            JOIN airports origin ON r.origin_airport_id = origin.id
            JOIN airports dest ON r.destination_airport_id = dest.id
            LEFT JOIN flights f ON r.id = f.route_id AND f.status = 'completed'
            WHERE r.company_id = $1
            GROUP BY r.id, origin.iata_code, dest.iata_code, r.distance_km, r.base_price
            ORDER BY net_profit DESC
        `, [company_id]);
        
        res.json({
            success: true,
            data: analysis.rows
        });
    } catch (error) {
        console.error('Error generating route analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate route analysis'
        });
    }
});

// Arrotonda lat/lon a 2 decimali per caching
function roundCoord(coord, decimals = 2) {
    return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// GET /api/geocoding_cache?lat=...&lon=...
router.get('/geocoding_cache', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ success: false, error: 'lat and lon required' });
        }
        const roundedLat = roundCoord(Number(lat), 2);
        const roundedLon = roundCoord(Number(lon), 2);
        const result = await db.query(
            'SELECT country_code FROM geocoding_cache WHERE ROUND(latitude,2) = $1 AND ROUND(longitude,2) = $2 LIMIT 1',
            [roundedLat, roundedLon]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, country_code: result.rows[0].country_code });
        } else {
            res.json({ success: false, country_code: null });
        }
    } catch (error) {
        console.error('Error reading geocoding_cache:', error);
        res.status(500).json({ success: false, error: 'Failed to read geocoding_cache' });
    }
});

// POST /api/geocoding_cache
// Body: { lat, lon, country_code }
router.post('/geocoding_cache', async (req, res) => {
    try {
        const { lat, lon, country_code } = req.body;
        if (!lat || !lon || !country_code) {
            return res.status(400).json({ success: false, error: 'lat, lon, country_code required' });
        }
        const roundedLat = roundCoord(Number(lat), 2);
        const roundedLon = roundCoord(Number(lon), 2);
        // Upsert: se già presente, non inserire duplicato
        const result = await db.query(
            `INSERT INTO geocoding_cache (latitude, longitude, country, country_code)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (latitude, longitude) DO NOTHING
             RETURNING *`,
            [roundedLat, roundedLon, country_code, country_code]
        );
        res.json({ success: true, country_code: country_code });
    } catch (error) {
        console.error('Error writing geocoding_cache:', error);
        res.status(500).json({ success: false, error: 'Failed to write geocoding_cache' });
    }
});

// Funzione helper per calcolare distanza tra coordinate
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// POST /api/routes/countries_count
// Body: { origin_iata, destination_iata }
// Risponde con { countries: [country_code, ...], count: N }
router.post('/countries_count', async (req, res) => {
    try {
        let { origin_iata, destination_iata } = req.body;
        if (!origin_iata || !destination_iata) {
            return res.status(400).json({ success: false, error: 'origin_iata e destination_iata richiesti' });
        }
        // Ordina alfabeticamente per simmetria
        if (origin_iata > destination_iata) {
            [origin_iata, destination_iata] = [destination_iata, origin_iata];
        }
        // Prendi lat/lon dei due aeroporti
        const airports = await db.query(
            `SELECT iata_code, latitude, longitude FROM airports WHERE iata_code = $1 OR iata_code = $2`,
            [origin_iata, destination_iata]
        );
        if (airports.rows.length !== 2) {
            return res.status(404).json({ success: false, error: 'Aeroporti non trovati' });
        }
        // Ordina i punti secondo l'ordine alfabetico
        const points = airports.rows.sort((a, b) => a.iata_code.localeCompare(b.iata_code));
        const [start, end] = points;
        // Calcola distanza totale
        const totalDistance = calculateDistance(start.latitude, start.longitude, end.latitude, end.longitude);
        // Distanza tra i punti intermedi (in km)
        const stepKm = 50; // puoi cambiare qui la risoluzione
        const numSteps = Math.max(1, Math.ceil(totalDistance / stepKm));
        const lats = [];
        const lons = [];
        for (let i = 0; i <= numSteps; i++) {
            lats.push(start.latitude + (end.latitude - start.latitude) * i / numSteps);
            lons.push(start.longitude + (end.longitude - start.longitude) * i / numSteps);
        }
        // Per ogni punto, cerca in cache o chiama Nominatim (con delay 1s tra chiamate)
        const countryCodes = new Set();
        for (let i = 0; i <= numSteps; i++) {
            const lat = lats[i];
            const lon = lons[i];
            // Cerca in cache
            const cacheRes = await db.query(
                'SELECT country_code FROM geocoding_cache WHERE ROUND(latitude,1) = $1 AND ROUND(longitude,1) = $2 LIMIT 1',
                [Math.round(lat * 10) / 10, Math.round(lon * 10) / 10]
            );
            if (cacheRes.rows.length > 0 && cacheRes.rows[0].country_code) {
                countryCodes.add(cacheRes.rows[0].country_code);
            } else {
                // Chiamata a Nominatim con rate limit
                const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
                await new Promise(r => setTimeout(r, 1000)); // Delay 1s tra chiamate
                const response = await fetch(url, { headers: { 'User-Agent': 'AirTycoon/1.0' } });
                if (response.ok) {
                    const data = await response.json();
                    const code = data.address && data.address.country_code ? data.address.country_code.toUpperCase() : null;
                    if (code) {
                        countryCodes.add(code);
                        // Salva in cache
                        await db.query(
                            `INSERT INTO geocoding_cache (latitude, longitude, country, country_code)
                             VALUES ($1, $2, $3, $4)
                             ON CONFLICT (latitude, longitude) DO NOTHING`,
                            [Math.round(lat * 10) / 10, Math.round(lon * 10) / 10, code, code]
                        );
                    }
                }
            }
        }
        res.json({ success: true, countries: Array.from(countryCodes), count: countryCodes.size });
    } catch (error) {
        console.error('Error calculating countries count:', error);
        res.status(500).json({ success: false, error: 'Failed to calculate countries count' });
    }
});

module.exports = router;
