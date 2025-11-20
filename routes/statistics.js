const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET statistics for a specific camp
router.get('/', async (req, res, next) => {
    const { location, year } = req.query;
    if (!location || !year) {
        return res.status(400).json({ success: false, error: 'Location and year are required.' });
    }

    try {
        const queryString = `
            SELECT
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year) AS Registered,
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year AND Status = 'ACCEPTED') AS Accepted,
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year AND Status = 'REJECTED') AS Rejected,
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year AND Status = 'DONATED') AS Donated;
        `;
        const result = await query(queryString, { location, year });
        res.json({ success: true, data: result.recordset[0] });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
