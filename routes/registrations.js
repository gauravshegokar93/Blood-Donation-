const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { query } = require('../db');

// GET all registrations for a camp
router.get('/', async (req, res, next) => {
    const { location, year } = req.query;
    try {
        const result = await query(`
            SELECT r.Id, r.Name, r.BloodGroup, r.MobileNo, r.Status, b.Name as AgencyName
            FROM Registrations r
            LEFT JOIN BloodBanks b ON r.BloodBankId = b.Id
            WHERE r.Location = @location AND r.Year = @year
            ORDER BY r.Id DESC
        `, { location, year });
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        next(err);
    }
});

// POST a new registration
router.post('/', async (req, res, next) => {
    const { name, bloodGroup, mobileNo, bloodBankId, location, year } = req.body;
    try {
        const queryString = `
            INSERT INTO Registrations (Name, BloodGroup, MobileNo, BloodBankId, Location, Year)
            VALUES (@name, @bloodGroup, @mobileNo, @bloodBankId, @location, @year);
        `;
        await query(queryString, { name, bloodGroup, mobileNo, bloodBankId, location, year });
        res.status(201).json({ success: true, message: 'Registration successful.' });
    } catch (err) {
        next(err);
    }
});

// POST to accept a registration
router.post('/:id/accept', async (req, res, next) => {
    const { id } = req.params;
    const { location, year } = req.body;
    try {
        const reg = await query('SELECT * FROM Registrations WHERE Id = @id AND Location = @location AND Year = @year', { id, location, year });
        if (reg.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Registration not found for this camp.' });
        }
        if (reg.recordset[0].Status !== 'REGISTERED') {
            return res.status(400).json({ success: false, error: `Cannot accept. Donor is already in '${reg.recordset[0].Status}' status.` });
        }
        await query("UPDATE Registrations SET Status = 'ACCEPTED', UpdatedAt = GETDATE() WHERE Id = @id", { id });
        res.json({ success: true, message: 'Donor accepted.' });
    } catch (err) {
        next(err);
    }
});

// POST to reject a registration
router.post('/:id/reject', async (req, res, next) => {
    const { id } = req.params;
    const { reason, location, year } = req.body;
     try {
        const reg = await query('SELECT * FROM Registrations WHERE Id = @id AND Location = @location AND Year = @year', { id, location, year });
        if (reg.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Registration not found for this camp.' });
        }
        if (reg.recordset[0].Status !== 'REGISTERED') {
            return res.status(400).json({ success: false, error: `Cannot reject. Donor is already in '${reg.recordset[0].Status}' status.` });
        }
        await query("UPDATE Registrations SET Status = 'REJECTED', RejectionReason = @reason, UpdatedAt = GETDATE() WHERE Id = @id", { id, reason });
        res.json({ success: true, message: 'Donor rejected.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
