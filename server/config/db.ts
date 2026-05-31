import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export type DbClient = pg.PoolClient | pg.Pool;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://root:mysecretpassword@localhost:5432/rental_db',
});

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
