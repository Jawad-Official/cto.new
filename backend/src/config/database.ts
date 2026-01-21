import { Pool } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  logger.info('Database connected successfully');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  const timeout = setTimeout(() => {
    logger.error('Client checkout timeout');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release();
  };

  return client;
};

export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    logger.info('Database test query successful', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database test query failed', error);
    return false;
  }
};
