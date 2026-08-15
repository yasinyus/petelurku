import mysql from 'mysql2/promise';

export interface MySQLConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

// Default pool configuration using environment variables or localhost defaults
const getPoolConfig = (): mysql.PoolOptions => ({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'kandang_baru',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
  multipleStatements: true,
  // A SQL DATE is a calendar day, not a moment in UTC.
  dateStrings: ['DATE'],
});

let poolInstance: mysql.Pool | null = null;
let isConnected = false;
let lastError: string | null = null;

export const getMySQLPool = (): mysql.Pool => {
  if (!poolInstance) {
    const config = getPoolConfig();
    poolInstance = mysql.createPool(config);
  }
  return poolInstance;
};

// Check if MySQL is reachable
export const checkMySQLConnection = async (): Promise<{ connected: boolean; message: string; host: string; db: string }> => {
  const host = process.env.MYSQL_HOST || 'localhost';
  const db = process.env.MYSQL_DATABASE || 'kandang_baru';

  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    isConnected = true;
    lastError = null;
    return {
      connected: true,
      message: 'Koneksi database MySQL aktif & terhubung!',
      host,
      db
    };
  } catch (err: any) {
    isConnected = false;
    lastError = err?.message || 'Gagal terhubung ke MySQL server';
    return {
      connected: false,
      message: `Database MySQL Offline/Not Configured (${lastError}). Menggunakan simulated memory store API.`,
      host,
      db
    };
  }
};

export const queryMySQL = async <T = any>(sql: string, params: any[] = []): Promise<T> => {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error: any) {
    console.warn('[MySQL Query Warning]', error.message);
    throw error;
  }
};

// Only use this for trusted, local SQL files such as the schema migration.
export const runMySQLScript = async (sql: string): Promise<void> => {
  const pool = getMySQLPool();
  await pool.query(sql);
};

export const getMySQLStatus = () => ({
  isConnected,
  lastError,
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  database: process.env.MYSQL_DATABASE || 'kandang_baru',
  port: Number(process.env.MYSQL_PORT) || 3306,
});
