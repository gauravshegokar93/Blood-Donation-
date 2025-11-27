
import sql, { NVarChar, Int } from 'mssql';

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

let pool: sql.ConnectionPool | null = null;

async function getDbPool(): Promise<sql.ConnectionPool> {
  if (!pool || !pool.connected) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to SQL Server');
      pool.on('error', err => {
        console.error('SQL Pool Error', err);
        pool = null; // Reset pool on error
      });
    } catch (err) {
      console.error('Database Connection Failed! Bad Config:', err);
      // Ensure pool is reset so next call will try to reconnect
      pool = null;
      throw err;
    }
  }
  return pool;
}

export async function executeQuery(query: string, params: { [key: string]: any } = {}): Promise<any[]> {
  let requestPool: sql.ConnectionPool | null = null;
  try {
    requestPool = await getDbPool();
    const request = requestPool.request();
    
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = params[key];
            // Basic type inference, can be expanded
            if (typeof value === 'number' && Number.isInteger(value)) {
                request.input(key, Int, value);
            } else if (typeof value === 'number') { // float, decimal etc.
                 request.input(key, sql.Decimal(10, 2), value); // Example, adjust as needed
            }
            else { // Default to string
                request.input(key, NVarChar, value);
            }
        }
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('SQL error', err);
    throw new Error('Error executing query');
  }
}
