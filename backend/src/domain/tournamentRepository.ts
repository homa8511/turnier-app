import { Tournament } from './tournament';

export interface TournamentRepository {
    findById(id: string): Promise<Tournament | null>;
    save(tournament: Tournament): Promise<void>;
}
