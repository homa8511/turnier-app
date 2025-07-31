import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Ein unerwarteter Fehler ist aufgetreten:", err.stack);
    res.status(500).json({ error: 'Ein unerwarteter interner Serverfehler ist aufgetreten.' });
};
