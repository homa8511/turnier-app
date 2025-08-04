import { Tournament, TournamentConfig } from '../domain/tournament';
import { TournamentRepository } from '../domain/tournamentRepository';
import fs from 'fs/promises';
import path from 'path';

export class TournamentService {
    constructor(private readonly tournamentRepository: TournamentRepository) {}

    async createNewTournament(config: Omit<TournamentConfig, 'id'>): Promise<Tournament> {
        const tournament = Tournament.create(config);
        await this.processTournamentImage(tournament);
        await this.tournamentRepository.save(tournament);
        return tournament;
    }

    async updateTournamentConfig(id: string, configData: Partial<Omit<TournamentConfig, 'id'>>): Promise<Tournament> {
        const tournament = await this.tournamentRepository.findById(id);
        if (!tournament) throw new Error("Tournament not found");

        tournament.updateConfig(configData);
        await this.processTournamentImage(tournament);
        await this.tournamentRepository.save(tournament);
        return tournament;
    }

    async startTournament(id: string, teamsData: { name: string; group: string; logo: string }[]): Promise<Tournament> {
        const tournament = await this.tournamentRepository.findById(id);
        if (!tournament) throw new Error("Tournament not found");

        tournament.start(teamsData);
        await this.processTeamLogos(tournament);
        await this.tournamentRepository.save(tournament);
        return tournament;
    }
    
    async recordMatchResult(id: string, roundNumber: number, team1Id: number, team2Id: number, score1: number, score2: number): Promise<Tournament> {
        const tournament = await this.tournamentRepository.findById(id);
        if (!tournament) throw new Error("Tournament not found");

        tournament.recordResult(roundNumber, team1Id, team2Id, score1, score2);
        await this.tournamentRepository.save(tournament);
        return tournament;
    }

    async advanceToNextRound(id: string): Promise<Tournament> {
        const tournament = await this.tournamentRepository.findById(id);
        if (!tournament) throw new Error("Tournament not found");

        tournament.generateNextRound();
        await this.tournamentRepository.save(tournament);
        return tournament;
    }

    async getTournament(id: string): Promise<Tournament | null> {
        return await this.tournamentRepository.findById(id);
    }

    private async processTournamentImage(tournament: Tournament): Promise<void> {
        if (!tournament.config.id || !tournament.config.imageUrl?.startsWith('data:image/')) {
            return;
        }
        
        const tournamentUploadDir = path.join('uploads', tournament.config.id);
        await fs.mkdir(tournamentUploadDir, { recursive: true });

        const base64Data = tournament.config.imageUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const fileExtension = tournament.config.imageUrl.substring(tournament.config.imageUrl.indexOf('/') + 1, tournament.config.imageUrl.indexOf(';base64'));
        const fileName = `header.${fileExtension}`;
        const filePath = path.join(tournamentUploadDir, fileName);

        await fs.writeFile(filePath, buffer);
        tournament.config.imageUrl = `/uploads/${tournament.config.id}/${fileName}`;
    }

    private async processTeamLogos(tournament: Tournament): Promise<void> {
        if (!tournament.config.id) return;
        
        const tournamentUploadDir = path.join('uploads', tournament.config.id);
        await fs.mkdir(tournamentUploadDir, { recursive: true });

        for (const team of tournament.teams) {
            if (team.logo?.startsWith('data:image/')) {
                const base64Data = team.logo.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                const fileExtension = team.logo.substring(team.logo.indexOf('/') + 1, team.logo.indexOf(';base64'));
                const fileName = `team-${team.id}.${fileExtension}`;
                const filePath = path.join(tournamentUploadDir, fileName);

                await fs.writeFile(filePath, buffer);
                team.logo = `/uploads/${tournament.config.id}/${fileName}`;
            }
        }
    }
}