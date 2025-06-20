const express = require('express');
const router = express.Router();
const db = require('../config/db');
const requireLogin = require('../middleware/auth');

// vvvvvvvvvvvvvvvvvv Routes Begin Here vvvvvvvvvvvvvvvvvv 
router.get('/', (req, res) => {
    res.render('index', { title: 'ClientTell Home', message: 'Welcome to ClientTell' });
});
  
router.get('/status', requireLogin, (req, res) => {
    res.status(200).json({'status': { title: 'ClientTell Status', message: 'ClientTell Is Up and Running' }});
});

router.get('/sql/status', requireLogin, async (req, res) => {
    try {
        // Simple query to verify database connectivity
        const result = await pool.query('SELECT NOW()');
        
        // If query succeeds, return success response
        res.status(200).json({
            status: 'healthy',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        // If query fails, return error response
        console.error('Database health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            error: 'Database connection failed'
        });
    }
});

module.exports = router;