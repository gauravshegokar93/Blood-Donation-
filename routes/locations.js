const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET distinct locations
router.get('/', async (req, res, next) => {
    try {
        const result = await query('SELECT DISTINCT Location FROM BloodBanks ORDER BY Location');
        const locations = result.recordset.map(r => r.Location);
        res.json({ success: true, data: locations });
    } catch (err) {
        next(err);
    }
});

// GET distinct years
router.get('/years', async (req, res, next) => {
    try {
        const result = await query('SELECT DISTINCT Year FROM BloodBanks ORDER BY Year DESC');
        const years = result.recordset.map(r => r.Year);
        res.json({ success: true, data: years });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
