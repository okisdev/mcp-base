// import { upstashCache } from 'drizzle-orm/cache/upstash';
import { drizzle } from 'drizzle-orm/node-postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const db = drizzle(DATABASE_URL, {});
