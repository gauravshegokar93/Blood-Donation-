const sql = require('mssql');
require('dotenv').config();

// Database configuration is loaded from environment variables.
// See .env file for details.
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // Use true for Azure SQL Database, or if you have SSL configured
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
};

let pool;

const connectDB = async () => {
    try {
        if (pool) {
            return pool;
        }
        pool = await sql.connect(dbConfig);
        console.log("Connected to MS SQL Server.");
        return pool;
    } catch (err) {
        console.error("Database connection failed:", err);
        // Exit process with failure
        process.exit(1);
    }
};

/**
 * Executes a parameterized SQL query.
 * @param {string} queryString The SQL query string with @param placeholders.
 * @param {object} params An object with parameter names as keys and their values.
 * @returns {Promise<sql.IResult<any>>} The result from the database query.
 */
const query = async (queryString, params = {}) => {
    const pool = await connectDB();
    const request = pool.request();
    for (const key in params) {
        // Here you might add type inference if needed, but mssql is good at inferring
        request.input(key, params[key]);
    }
    return await request.query(queryString);
};

module.exports = {
    query,
    connectDB
};
