import sql from 'mssql';

const config = {
  server: process.env.DB_SERVER!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  options: {
    encrypt: true, // Use this if you're on Azure
    trustServerCertificate: process.env.DB_OPTIONS_TRUSTSERVERCERTIFICATE === 'true',
  },
};

let pool: sql.ConnectionPool;

async function getDbPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to SQL Server');
    } catch (err) {
      console.error('Database Connection Failed! Bad Config: ', err);
      throw err; // Rethrow error to be handled by caller
    }
  }
  return pool;
}

export async function executeQuery(query: string, params: { [key: string]: any } = {}) {
  try {
    const pool = await getDbPool();
    const request = pool.request();
    
    for (const key in params) {
      // Assuming types for simplicity, you might need more robust type handling
      if (typeof params[key] === 'number') {
        request.input(key, sql.Int, params[key]);
      } else {
        request.input(key, sql.NVarChar, params[key]);
      }
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('SQL error', err);
    throw new Error('Error executing query');
  }
}

// Example usage:
/*
-- Create your BloodBank table in SQL Server
CREATE TABLE BloodBanks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    location NVARCHAR(100) NOT NULL,
    year NVARCHAR(10) NOT NULL,
    counter INT,
    quota INT
);
*/
