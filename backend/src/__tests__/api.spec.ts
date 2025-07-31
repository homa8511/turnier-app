import request from 'supertest';
import express from 'express';
import { apiRouter } from '../interfaces/api';
import { pool, initializeDatabase } from '../infrastructure/database';
import { TournamentConfig } from '../domain/tournament';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

beforeAll(async () => {
    await initializeDatabase();
});

afterEach(async () => {
    await pool.query('DELETE FROM tournaments');
});

afterAll(async () => {
    await pool.end();
});

describe('Tournament API End-to-End Tests', () => {

    const baseConfig: Omit<TournamentConfig, 'id'> = {
        tournamentName: 'API Test Cup',
        location: { name: 'Teststadion', address: 'Teststr. 1' },
        description: 'Ein Test',
        numGroups: 1, teamsPerGroup: 4, numFields: 1,
        matchDuration: 10, pauseDuration: 5,
        startDate: '2025-01-01', startTime: '12:00',
    };

    it('sollte einen kompletten Turnier-Lebenszyklus durchlaufen', async () => {
        const createResponse = await request(app)
            .post('/api/tournaments')
            .send({ config: baseConfig });
        
        expect(createResponse.status).toBe(201);
        expect(createResponse.body.config.id).toBeDefined();
        const tournamentId = createResponse.body.config.id;

        const startResponse = await request(app)
            .post(`/api/tournaments/${tournamentId}/start`)
            .send({
                teams: [
                    { name: 'Team A', group: 'Gruppe A', logo: '' },
                    { name: 'Team B', group: 'Gruppe A', logo: '' },
                    { name: 'Team C', group: 'Gruppe A', logo: '' },
                    { name: 'Team D', group: 'Gruppe A', logo: '' },
                ]
            });
        
        expect(startResponse.status).toBe(200);
        expect(startResponse.body.status).toBe('playing');
        const round1 = startResponse.body.rounds[0];

        for (const match of round1.matches) {
            await request(app)
                .post(`/api/tournaments/${tournamentId}/matches`)
                .send({
                    roundNumber: 1,
                    team1Id: match.team1Id,
                    team2Id: match.team2Id,
                    score1: 2,
                    score2: 1
                });
        }

        const nextRoundResponse = await request(app)
            .post(`/api/tournaments/${tournamentId}/next-round`);

        expect(nextRoundResponse.status).toBe(200);
        expect(nextRoundResponse.body.currentRound).toBe(2);

        const getResponse = await request(app)
            .get(`/api/tournaments/${tournamentId}`);
        
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.currentRound).toBe(2);
    });

    it('sollte mit 404 antworten, wenn ein nicht existierendes Turnier geladen wird', async () => {
        const response = await request(app).get('/api/tournaments/T-NONEXISTENT');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Turnier nicht gefunden.');
    });

    it('sollte mit 400 antworten, wenn versucht wird, die nächste Runde zu früh zu generieren', async () => {
        const createResponse = await request(app)
            .post('/api/tournaments')
            .send({ config: baseConfig });
        const tournamentId = createResponse.body.config.id;

        await request(app)
            .post(`/api/tournaments/${tournamentId}/start`)
            .send({ teams: [
                { name: 'A', group: 'A', logo: '' }, { name: 'B', group: 'A', logo: '' },
                { name: 'C', group: 'A', logo: '' }, { name: 'D', group: 'A', logo: '' }
            ] });

        const nextRoundResponse = await request(app)
            .post(`/api/tournaments/${tournamentId}/next-round`);
        
        expect(nextRoundResponse.status).toBe(400);
        expect(nextRoundResponse.body.error).toContain('all matches in the current round are complete');
    });

    it('sollte mit 403 antworten, wenn versucht wird, die Konfiguration eines gestarteten Turniers zu ändern', async () => {
        const createResponse = await request(app)
            .post('/api/tournaments')
            .send({ config: baseConfig });
        const tournamentId = createResponse.body.config.id;
        await request(app)
            .post(`/api/tournaments/${tournamentId}/start`)
            .send({ teams: [
                { name: 'A', group: 'A', logo: '' }, { name: 'B', group: 'A', logo: '' }
            ] });

        const updateResponse = await request(app)
            .put(`/api/tournaments/${tournamentId}/config`)
            .send({ config: { tournamentName: 'Neuer Name' } });

        expect(updateResponse.status).toBe(403);
        expect(updateResponse.body.error).toContain('before the tournament has started');
    });
});

src/__tests__/application/tournamentService.spec.ts
import { TournamentService } from '../../application/tournamentService';
import { InMemoryTournamentRepository } from '../mocks/inMemoryTournamentRepository';
import { TournamentConfig } from '../../domain/tournament';
import fs from 'fs/promises';

jest.mock('fs/promises');

describe('TournamentService', () => {
    let service: TournamentService;
    let repository: InMemoryTournamentRepository;
    let config: Omit<TournamentConfig, 'id'>;

    beforeEach(() => {
        repository = new InMemoryTournamentRepository();
        service = new TournamentService(repository);
        jest.clearAllMocks();

        config = {
            tournamentName: 'Test Cup',
            location: { name: 'Testplatz', address: 'Testweg 1' },
            description: '',
            numGroups: 1, teamsPerGroup: 2, numFields: 1,
            matchDuration: 10, pauseDuration: 5,
            startDate: '2025-01-01', startTime: '10:00',
        };
    });

    it('sollte ein neues Turnier erstellen und speichern', async () => {
        const tournament = await service.createNewTournament(config);
        expect(tournament.config.id).toBeDefined();
        expect(tournament.status).toBe('setup');

        const saved = await repository.findById(tournament.config.id!);
        expect(saved).toBeDefined();
        expect(saved!.config.id).toBe(tournament.config.id);
    });

    it('sollte ein Turnier starten, Logos verarbeiten und speichern', async () => {
        const initialTournament = await service.createNewTournament(config);
        const teamsData = [
            { name: 'Team A', group: 'A', logo: 'data:image/webp;base64,UklGRgA=' },
            { name: 'Team B', group: 'A', logo: 'logo.png' }
        ];
        
        const writeFileSpy = jest.spyOn(fs, 'writeFile');

        const startedTournament = await service.startTournament(initialTournament.config.id!, teamsData);

        expect(startedTournament.status).toBe('playing');
        expect(startedTournament.rounds.length).toBe(1);
        expect(writeFileSpy).toHaveBeenCalledTimes(1);

        const saved = await repository.findById(initialTournament.config.id!);
        expect(saved!.teams[0].logo).toContain('/uploads/');
        expect(saved!.teams[1].logo).toBe('logo.png');
    });

    it('sollte die Konfiguration eines Turniers im "setup"-Status aktualisieren', async () => {
        const tournament = await service.createNewTournament(config);
        const newConfigData = { tournamentName: 'Neuer Name' };

        const updatedTournament = await service.updateTournamentConfig(tournament.config.id!, newConfigData);

        expect(updatedTournament.config.tournamentName).toBe('Neuer Name');
        const saved = await repository.findById(tournament.config.id!);
        expect(saved!.config.tournamentName).toBe('Neuer Name');
    });

    it('sollte einen Fehler werfen, wenn versucht wird, die Konfiguration eines gestarteten Turniers zu ändern', async () => {
        const tournament = await service.createNewTournament(config);
        await service.startTournament(tournament.config.id!, []);

        const newConfigData = { tournamentName: 'Anderer Name' };
        
        await expect(
            service.updateTournamentConfig(tournament.config.id!, newConfigData)
        ).rejects.toThrow("Configuration can only be edited before the tournament has started.");
    });
    
    it('sollte ein neues Turnier erstellen und ein Turnierbild als Datei speichern', async () => {
        const configWithImage = {
            ...config,
            imageUrl: 'data:image/jpeg;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
        };
        const writeFileSpy = jest.spyOn(fs, 'writeFile');

        const tournament = await service.createNewTournament(configWithImage);

        expect(writeFileSpy).toHaveBeenCalled();
        expect(tournament.config.imageUrl).toContain('/uploads/' + tournament.config.id + '/header.jpeg');
    });
});