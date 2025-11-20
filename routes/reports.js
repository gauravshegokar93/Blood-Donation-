const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Report: BDC Status - All
router.get('/status-all', async (req, res, next) => {
    try {
        const queryString = `
            SELECT 
                Location, 
                Year,
                COUNT(Id) AS Registered,
                SUM(CASE WHEN Status = 'ACCEPTED' THEN 1 ELSE 0 END) AS Accepted,
                SUM(CASE WHEN Status = 'REJECTED' THEN 1 ELSE 0 END) AS Rejected,
                SUM(CASE WHEN Status = 'DONATED' THEN 1 ELSE 0 END) AS Donated
            FROM Registrations
            GROUP BY Location, Year
            ORDER BY Year DESC, Location ASC;
        `;
        const result = await query(queryString);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        next(err);
    }
});

// Report: BDC Status - Location-wise
router.get('/status-location', async (req, res, next) => {
    const { location, year } = req.query;
    if (!location || !year) {
        return res.status(400).json({ success: false, error: 'Location and year are required.' });
    }

    try {
        const statsQuery = `
            SELECT
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year) AS Registered,
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year AND Status = 'ACCEPTED') AS Accepted,
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year AND Status = 'REJECTED') AS Rejected,
                (SELECT COUNT(*) FROM Registrations WHERE Location = @location AND Year = @year AND Status = 'DONATED') AS Donated;
        `;
        const banksQuery = `
            SELECT 
                b.Id,
                b.Name,
                b.QuotaLimit,
                (SELECT COUNT(r.Id) FROM Registrations r WHERE r.BloodBankId = b.Id AND r.Location = @location AND r.Year = @year) AS Registered,
                (SELECT COUNT(r.Id) FROM Registrations r WHERE r.BloodBankId = b.Id AND r.Location = @location AND r.Year = @year AND r.Status = 'ACCEPTED') AS Accepted
            FROM BloodBanks b
            WHERE b.Location = @location AND b.Year = @year;
        `;

        const [statsResult, banksResult] = await Promise.all([
            query(statsQuery, { location, year }),
            query(banksQuery, { location, year })
        ]);

        res.json({
            success: true,
            data: {
                stats: statsResult.recordset[0],
                banks: banksResult.recordset
            }
        });
    } catch (err) {
        next(err);
    }
});

// Report: BDC History
router.get('/history', async (req, res, next) => {
    try {
        const queryString = `
            SELECT
                Year,
                Location,
                COUNT(DISTINCT Location) OVER (PARTITION BY Year) as TotalCamps, -- This is a simplification, assumes one camp per location per year
                COUNT(Id) AS TotalRegistered,
                SUM(CASE WHEN Status = 'DONATED' OR Status = 'ACCEPTED' THEN 1 ELSE 0 END) AS TotalDonated -- Counting Accepted as potential donations
            FROM Registrations
            GROUP BY Year, Location
            ORDER BY Year DESC, Location;
        `;
        const result = await query(queryString);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
