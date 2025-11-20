const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { query } = require('../db');

// GET all blood banks for a specific location and year
router.get('/', async (req, res, next) => {
    const { location, year } = req.query;
    if (!location || !year) {
        return res.status(400).json({ success: false, error: 'Location and year are required.' });
    }
    try {
        const result = await query(
            'SELECT * FROM BloodBanks WHERE Location = @location AND Year = @year',
            { location, year }
        );
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        next(err);
    }
});

// POST a new blood bank
router.post('/', async (req, res, next) => {
    const { name, location, year, counterNo, quotaLimit } = req.body;
    try {
        const queryString = `
            INSERT INTO BloodBanks (Name, Location, Year, CounterNo, QuotaLimit)
            VALUES (@name, @location, @year, @counterNo, @quotaLimit);
            SELECT SCOPE_IDENTITY() AS Id;
        `;
        const result = await query(queryString, { name, location, year, counterNo, quotaLimit });
        res.status(201).json({ success: true, data: { Id: result.recordset[0].Id, ...req.body } });
    } catch (err) {
        next(err);
    }
});

// PUT (update) a blood bank by ID
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { name, counterNo, quotaLimit } = req.body;
    try {
        const queryString = `
            UPDATE BloodBanks
            SET Name = @name, CounterNo = @counterNo, QuotaLimit = @quotaLimit
            WHERE Id = @id;
        `;
        await query(queryString, { id: parseInt(id), name, counterNo, quotaLimit });
        res.json({ success: true, message: 'Blood bank updated successfully.' });
    } catch (err) {
        next(err);
    }
});

// DELETE a blood bank by ID
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        // Check if there are registrations associated with this bank first
        const checkResult = await query('SELECT COUNT(*) as count FROM Registrations WHERE BloodBankId = @id', { id });
        if (checkResult.recordset[0].count > 0) {
            return res.status(400).json({ success: false, error: 'Cannot delete. Blood bank is associated with existing registrations.' });
        }

        await query('DELETE FROM BloodBanks WHERE Id = @id', { id });
        res.json({ success: true, message: 'Blood bank deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
