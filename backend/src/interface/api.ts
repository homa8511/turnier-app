import { Router } from 'express';
import { tournamentRouter } from './tournamentController';
import { healthRouter } from './healthController';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/tournaments', tournamentRouter);