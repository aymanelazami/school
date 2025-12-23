import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import dotenv from 'dotenv';

// Load env vars FIRST in this module
dotenv.config();

// Create the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create and export the db instance
export const db = drizzle(pool);


export * from './city.ts';
export * from './role.ts';
export * from './user.ts';
export * from './permissions.ts';
export * from './niveau.ts';
export * from './groupe.ts';
export * from './filiere.ts';
export * from './module.ts';
export * from './room.ts';
export * from './event.ts';
export * from './attendanceList.ts';
export * from './grade.ts';
export * from './opportunite.ts';
export * from './document.ts';
export * from './resource.ts';
export * from './absence.ts';
export * from './session.ts';