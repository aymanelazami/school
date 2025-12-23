import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ========================================
// ENV VALIDATION (fail-fast on startup)
// ========================================
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// ========================================
// CONNECTION POOL CONFIG (production-grade)
// ========================================
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 20, // max connections in pool
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 10000, // fail fast if can't connect in 10s
  // SSL config for production (Render, Railway, Supabase, etc)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined,
});

// ========================================
// ERROR HANDLERS (observability + graceful shutdown)
// ========================================
pool.on('error', (err, client) => {
  console.error('Unexpected database error on idle client:', err);
  process.exit(-1); // force restart in production (let PM2/Docker handle it)
});

pool.on('connect', () => {
  console.log('New database connection established');
});

// ========================================
// DRIZZLE INSTANCE (singleton - reuse everywhere)
// ========================================
export const db = drizzle(pool);

// ========================================
// GRACEFUL SHUTDOWN (clean up on exit)
// ========================================
export const closeDatabaseConnection = async () => {
  await pool.end();
  console.log('Database pool closed');
};

// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database pool...');
  await closeDatabaseConnection();
  process.exit(0);
});
