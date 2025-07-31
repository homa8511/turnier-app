import { Router, Request, Response, NextFunction } from 'express';
import { TournamentService } from '../application/tournamentService';
import { PostgresTournamentRepository } from '../infrastructure/postgresTournamentRepository';

export const tournamentRouter = Router();

const repository = new PostgresTournamentRepository();
const service = new TournamentService(repository);

tournamentRouter.route('/')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body.config) {
                return res.status(400).json({ error: 'Konfigurationsdaten fehlen.' });
            }
            const tournament = await service.createNewTournament(req.body.config);
            res.status(201).json(tournament);
        } catch (err) {
            next(err);
        }
    });

tournamentRouter.route('/:id')
    .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tournament = await service.getTournament(req.params.id);
            if (!tournament) {
                return res.status(404).json({ error: 'Turnier nicht gefunden.' });
            }
            res.status(200).json(tournament);
        } catch (err) {
            next(err);
        }
    });

tournamentRouter.route('/:id/config')
    .put(async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body.config) {
                return res.status(400).json({ error: 'Konfigurationsdaten fehlen.' });
            }
            const tournament = await service.updateTournamentConfig(req.params.id, req.body.config);
            res.status(200).json(tournament);
        } catch (err: any) {
            if (err.message.includes("not found")) {
                return res.status(404).json({ error: err.message });
            }
            if (err.message.includes("before the tournament has started")) {
                return res.status(403).json({ error: err.message });
            }
            next(err);
        }
    });

tournamentRouter.route('/:id/start')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body.teams) {
                return res.status(400).json({ error: 'Teamdaten fehlen.' });
            }
            const tournament = await service.startTournament(req.params.id, req.body.teams);
            res.status(200).json(tournament);
        } catch (err: any) {
            if (err.message.includes("not found")) {
                return res.status(404).json({ error: err.message });
            }
            next(err);
        }
    });

tournamentRouter.route('/:id/matches')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { roundNumber, team1Id, team2Id, score1, score2 } = req.body;
            if (roundNumber == null || team1Id == null || team2Id == null || score1 == null || score2 == null) {
                return res.status(400).json({ error: 'Unvollständige Ergebnisdaten.' });
            }
            const tournament = await service.recordMatchResult(req.params.id, roundNumber, team1Id, team2Id, score1, score2);
            res.status(200).json(tournament);
        } catch (err: any) {
            if (err.message.includes("not found")) {
                return res.status(404).json({ error: err.message });
            }
            if (err.message.includes("cannot be negative")) {
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    });

tournamentRouter.route('/:id/next-round')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tournament = await service.advanceToNextRound(req.params.id);
            res.status(200).json(tournament);
        } catch (err: any) {
            if (err.message.includes("not found")) {
                return res.status(404).json({ error: err.message });
            }
            if (err.message.includes("all matches in the current round are complete")) {
                return res.status(400).json({ error: err.message });
            }
            next(err);
        }
    });