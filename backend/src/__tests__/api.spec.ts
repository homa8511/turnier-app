import request from 'supertest';
import express from 'express';
import { apiRouter } from '../interfaces/api';
import { pool, initializeDatabase } from '../infrastructure/database';
import { TournamentConfig } from '../domain/tournament';

// Wir bauen eine Mini-App nur für die Tests
const app = express();
app.use(express.json());
app.use('/api', apiRouter);

beforeAll(async () => {
    // Stellt sicher, dass die DB-Verbindung steht und die Tabelle existiert
    await initializeDatabase();
});

afterEach(async () => {
    // Löscht alle Daten nach jedem Test, um saubere Tests zu gewährleisten
    await pool.query('DELETE FROM tournaments');
});

afterAll(async () => {
    // Schließt die DB-Verbindung am Ende
    await pool.end();
});

describe('Tournament API End-to-End Tests', () => {

    const baseConfig: Omit<TournamentConfig, 'id'> = {
        tournamentName: 'API Test Cup',
        location: { name: 'Teststadion', address: 'Teststr. 1' },
        description: 'Ein Test',
        imageUrl: '',
        numGroups: 1, teamsPerGroup: 4, numFields: 1,
        matchDuration: 10, pauseDuration: 5,
        startDate: '2025-01-01', startTime: '12:00',
    };

    it('sollte einen kompletten Turnier-Lebenszyklus durchlaufen', async () => {
        // 1. Turnier erstellen
        const createResponse = await request(app)
            .post('/api/tournaments')
            .send({ config: baseConfig });
        
        expect(createResponse.status).toBe(201);
        expect(createResponse.body.config.id).toBeDefined();
        const tournamentId = createResponse.body.config.id;

        // 2. Turnier starten
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
        expect(round1.matches.length).toBe(2);

        // 3. Ergebnisse für Runde 1 eintragen
        for (const match of round1.matches) {
            const resultResponse = await request(app)
                .post(`/api/tournaments/${tournamentId}/matches`)
                .send({
                    roundNumber: 1,
                    team1Id: match.team1Id,
                    team2Id: match.team2Id,
                    score1: 2,
                    score2: 1
                });
            expect(resultResponse.status).toBe(200);
        }

        // 4. Nächste Runde generieren
        const nextRoundResponse = await request(app)
            .post(`/api/tournaments/${tournamentId}/next-round`);

        expect(nextRoundResponse.status).toBe(200);
        expect(nextRoundResponse.body.currentRound).toBe(2);
        expect(nextRoundResponse.body.rounds.length).toBe(2);

        // 5. Turnier laden und den Zustand überprüfen
        const getResponse = await request(app)
            .get(`/api/tournaments/${tournamentId}`);
        
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.config.id).toBe(tournamentId);
        expect(getResponse.body.currentRound).toBe(2);
        expect(getResponse.body.teams[0].played).toBe(1);
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