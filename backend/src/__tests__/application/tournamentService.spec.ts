import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TournamentService } from '../../application/tournamentService';
import { InMemoryTournamentRepository } from '../mocks/inMemoryTournamentRepository';
import { TournamentConfig } from '../../domain/tournament';
import fs from 'fs/promises';

vi.mock('fs/promises');

describe('TournamentService', () => {
    let service: TournamentService;
    let repository: InMemoryTournamentRepository;
    let config: Omit<TournamentConfig, 'id'>;

    beforeEach(() => {
        repository = new InMemoryTournamentRepository();
        service = new TournamentService(repository);
        vi.clearAllMocks();

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
        
        const writeFileSpy = vi.spyOn(fs, 'writeFile');

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
        const writeFileSpy = vi.spyOn(fs, 'writeFile');

        const tournament = await service.createNewTournament(configWithImage);

        expect(writeFileSpy).toHaveBeenCalled();
        expect(tournament.config.imageUrl).toContain('/uploads/' + tournament.config.id + '/header.jpeg');
    });

    it('sollte ein Match-Ergebnis speichern', async () => {
        let tournament = await service.createNewTournament(config);
        tournament = await service.startTournament(tournament.config.id!, [
            { name: 'Team A', group: 'A', logo: '' },
            { name: 'Team B', group: 'A', logo: '' },
        ]);

        const match = tournament.rounds[0].matches[0];
        await service.recordMatchResult(tournament.config.id!, 1, match.team1Id, match.team2Id, 2, 1);

        const saved = await repository.findById(tournament.config.id!);
        const savedMatch = saved!.rounds[0].matches[0];
        expect(savedMatch.score1).toBe(2);
        expect(savedMatch.score2).toBe(1);
        expect(savedMatch.isComplete()).toBe(true);
    });

    it('sollte in die nächste Runde vorrücken', async () => {
        config.teamsPerGroup = 4;
        let tournament = await service.createNewTournament(config);
        tournament = await service.startTournament(tournament.config.id!, [
            { name: 'Team A', group: 'A', logo: '' },
            { name: 'Team B', group: 'A', logo: '' },
            { name: 'Team C', group: 'A', logo: '' },
            { name: 'Team D', group: 'A', logo: '' },
        ]);

        for (const match of tournament.rounds[0].matches) {
            await service.recordMatchResult(tournament.config.id!, 1, match.team1Id, match.team2Id, 2, 1);
        }

        await service.advanceToNextRound(tournament.config.id!);

        const saved = await repository.findById(tournament.config.id!);
        expect(saved!.currentRound).toBe(2);
    });

    it('sollte ein Turnier anhand der ID abrufen', async () => {
        const tournament = await service.createNewTournament(config);
        const found = await service.getTournament(tournament.config.id!);
        expect(found).toBeDefined();
        expect(found!.config.id).toBe(tournament.config.id);
    });

    it('sollte einen Fehler werfen, wenn das zu aktualisierende Turnier nicht gefunden wird', async () => {
        await expect(service.updateTournamentConfig('non-existent-id', {})).rejects.toThrow("Tournament not found");
    });

    it('sollte einen Fehler werfen, wenn das zu startende Turnier nicht gefunden wird', async () => {
        await expect(service.startTournament('non-existent-id', [])).rejects.toThrow("Tournament not found");
    });

    it('sollte das Turnierbild nicht verarbeiten, wenn keine data-URL vorhanden ist', async () => {
        const writeFileSpy = vi.spyOn(fs, 'writeFile');
        const configWithImage = {
            ...config,
            imageUrl: '/uploads/some-image.jpeg'
        };

        await service.createNewTournament(configWithImage);
        expect(writeFileSpy).not.toHaveBeenCalled();
    });

    it('sollte Team-Logos nicht verarbeiten, wenn keine data-URL vorhanden ist', async () => {
        const writeFileSpy = vi.spyOn(fs, 'writeFile');
        const tournament = await service.createNewTournament(config);
        await service.startTournament(tournament.config.id!, [{ name: 'Team A', group: 'A', logo: 'logo.png' }]);

        expect(writeFileSpy).not.toHaveBeenCalled();
    });
});