import { Router, Request, Response } from 'express';
import { pool } from '../infrastructure/database';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'error', database: 'disconnected' });
    }
});