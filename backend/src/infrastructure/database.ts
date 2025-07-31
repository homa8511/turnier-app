import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

export const initializeDatabase = async () => {
    const connectWithRetry = async (retries = 5) => {
        while (retries > 0) {
            try {
                await pool.connect();
                console.log("Erfolgreich mit der Datenbank verbunden.");
                await pool.query(`
                  CREATE TABLE IF NOT EXISTS tournaments (
                    id VARCHAR(10) PRIMARY KEY,
                    data JSONB NOT NULL
                  );
                `);
                return;
            } catch (err) {
                console.error("Verbindung zur Datenbank fehlgeschlagen, versuche es erneut...", err);
                retries -= 1;
                await new Promise(res => setTimeout(res, 5000));
            }
        }
        throw new Error("Konnte nach mehreren Versuchen keine Verbindung zur Datenbank herstellen.");
    };
    await connectWithRetry();
};
