import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'db', // Nutzt localhost im Test, sonst 'db'
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

export const initializeDatabase = async () => {
    const connectWithRetry = async (retries = 5) => {
        while (retries > 0) {
            const client = await pool.connect();
            try {
                console.log("Erfolgreich mit der Datenbank verbunden.");
                await client.query(`
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
            } finally {
                client.release();
            }
        }
        throw new Error("Konnte nach mehreren Versuchen keine Verbindung zur Datenbank herstellen.");
    };
    await connectWithRetry();
};
