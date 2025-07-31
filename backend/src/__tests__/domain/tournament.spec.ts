import { Tournament, TournamentConfig } from '../../domain/tournament';

describe('Tournament Aggregate', () => {
    let config: Omit<TournamentConfig, 'id'>;

    beforeEach(() => {
        config = {
            tournamentName: 'Test Cup',
            location: { name: 'Testplatz', address: 'Testweg 1' },
            description: '',
            numGroups: 1,
            teamsPerGroup: 4,
            numFields: 1,
            matchDuration: 10,
            pauseDuration: 5,
            startDate: '2025-01-01',
            startTime: '10:00',
        };
    });

    it('sollte ein neues Turnier mit einer ID und dem Status "setup" erstellen', () => {
        const tournament = Tournament.create(config);
        expect(tournament.config.id).toMatch(/^T-[A-Z0-9]+/);
        expect(tournament.status).toBe('setup');
        expect(tournament.config.tournamentName).toBe('Test Cup');
    });

    it('sollte ein Turnier starten, Teams erstellen und die erste Runde auslosen', () => {
        const tournament = Tournament.create(config);
        const teamsData = [
            { name: 'Team A', group: 'A', logo: 'a.png' },
            { name: 'Team B', group: 'A', logo: 'b.png' },
            { name: 'Team C', group: 'A', logo: 'c.png' },
            { name: 'Team D', group: 'A', logo: 'd.png' },
        ];

        tournament.start(teamsData);

        expect(tournament.status).toBe('playing');
        expect(tournament.currentRound).toBe(1);
        expect(tournament.teams.length).toBe(4);
        expect(tournament.rounds.length).toBe(1);
        expect(tournament.rounds[0].matches.length).toBe(2);
    });

    it('sollte einen Fehler werfen, wenn versucht wird, die nächste Runde vor Abschluss der aktuellen zu generieren', () => {
        const tournament = Tournament.create(config);
        tournament.start([
            { name: 'A', group: 'A', logo: '' }, { name: 'B', group: 'A', logo: '' },
            { name: 'C', group: 'A', logo: '' }, { name: 'D', group: 'A', logo: '' }
        ]);

        const match1 = tournament.rounds[0].matches[0];
        tournament.recordResult(1, match1.team1Id, match1.team2Id, 1, 0);

        expect(() => tournament.generateNextRound()).toThrow("Cannot generate next round until all matches in the current round are complete.");
    });

    it('sollte die nächste Runde erfolgreich generieren, wenn die aktuelle Runde abgeschlossen ist', () => {
        const tournament = Tournament.create(config);
        tournament.start([
            { name: 'A', group: 'A', logo: '' }, { name: 'B', group: 'A', logo: '' },
            { name: 'C', group: 'A', logo: '' }, { name: 'D', group: 'A', logo: '' }
        ]);

        tournament.rounds[0].matches.forEach(match => {
            tournament.recordResult(1, match.team1Id, match.team2Id, 1, 0);
        });

        tournament.generateNextRound();

        expect(tournament.currentRound).toBe(2);
        expect(tournament.rounds.length).toBe(2);
        expect(tournament.rounds[1].matches.length).toBe(2);
        const team1 = tournament.teams.find(t => t.id === tournament.rounds[1].matches[0].team1Id)!;
        const opponentR1 = team1.opponents[0];
        const opponentR2 = tournament.rounds[1].matches[0].team2Id;
        expect(opponentR1).not.toBe(opponentR2);
    });

    it('sollte den Status auf "finished" setzen, nachdem die letzte Runde generiert wurde', () => {
        const tournament = Tournament.create(config);
        tournament.start([
            { name: 'A', group: 'A', logo: '' }, { name: 'B', group: 'A', logo: '' },
            { name: 'C', group: 'A', logo: '' }, { name: 'D', group: 'A', logo: '' }
        ]);

        for (let i = 1; i < 3; i++) {
            tournament.rounds[i - 1].matches.forEach(match => {
                tournament.recordResult(i, match.team1Id, match.team2Id, 1, 0);
            });
            tournament.generateNextRound();
        }
        
        tournament.rounds[2].matches.forEach(match => {
            tournament.recordResult(3, match.team1Id, match.team2Id, 1, 0);
        });

        tournament.generateNextRound();

        expect(tournament.status).toBe('finished');
    });
});