require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
const locationsRouter = require('./routes/locations');
const bloodBanksRouter = require('./routes/bloodBanks');
const registrationsRouter = require('./routes/registrations');
const statisticsRouter = require('./routes/statistics');
const reportsRouter = require('./routes/reports');

app.use('/api/locations', locationsRouter);
app.use('/api/blood-banks', bloodBanksRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/reports', reportsRouter);

// Root route redirects to the main login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong on the server.' });
});

// Start the server after connecting to the database
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
});
