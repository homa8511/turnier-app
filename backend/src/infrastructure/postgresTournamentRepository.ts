import { Tournament } from '../domain/tournament';
import { TournamentRepository } from '../domain/tournamentRepository';
import { pool } from './database';

export class PostgresTournamentRepository implements TournamentRepository {
    async findById(id: string): Promise<Tournament | null> {
        const result = await pool.query('SELECT data FROM tournaments WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return new Tournament(result.rows[0].data);
    }

    async save(tournament: Tournament): Promise<void> {
        const id = tournament.config.id;
        if (!id) {
            throw new Error("Tournament ID is missing.");
        }
        const query = `
          INSERT INTO tournaments (id, data)
          VALUES ($1, $2)
          ON CONFLICT (id)
          DO UPDATE SET data = $2;
        `;
        await pool.query(query, [id, tournament]);
    }
}