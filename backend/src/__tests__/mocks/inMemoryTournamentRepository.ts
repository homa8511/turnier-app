import { Tournament } from '../../domain/tournament';
import { TournamentRepository } from '../../domain/tournamentRepository';

export class InMemoryTournamentRepository implements TournamentRepository {
    private tournaments = new Map<string, Tournament>();

    async findById(id: string): Promise<Tournament | null> {
        const tournament = this.tournaments.get(id);
        return tournament ? new Tournament(JSON.parse(JSON.stringify(tournament))) : null;
    }

    async save(tournament: Tournament): Promise<void> {
        if (!tournament.config.id) {
            throw new Error("Tournament ID is missing.");
        }
        this.tournaments.set(tournament.config.id, tournament);
    }
    
    public clear(): void {
        this.tournaments.clear();
    }
}