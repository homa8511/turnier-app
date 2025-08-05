import { describe, it, expect, beforeEach } from 'vitest';
import { Team } from '../../domain/team';

describe('Team Entity', () => {
    let team: Team;

    beforeEach(() => {
        team = new Team(1, 'Test Team', 'Gruppe A', 'logo.png');
    });

    it('sollte korrekt initialisiert werden', () => {
        expect(team.points).toBe(0);
        expect(team.wins).toBe(0);
        expect(team.played).toBe(0);
    });

    it('sollte einen Sieg korrekt verbuchen', () => {
        team.addWin(3, 1, 2);
        expect(team.points).toBe(3);
        expect(team.wins).toBe(1);
        expect(team.played).toBe(1);
        expect(team.goalsFor).toBe(3);
        expect(team.goalsAgainst).toBe(1);
        expect(team.goalDifference).toBe(2);
        expect(team.opponents).toContain(2);
    });

    it('sollte ein Unentschieden korrekt verbuchen', () => {
        team.addDraw(2, 2, 3);
        expect(team.points).toBe(1);
        expect(team.draws).toBe(1);
        expect(team.played).toBe(1);
        expect(team.goalDifference).toBe(0);
    });

    it('sollte eine Niederlage korrekt verbuchen', () => {
        team.addLoss(0, 4, 4);
        expect(team.points).toBe(0);
        expect(team.losses).toBe(1);
        expect(team.played).toBe(1);
        expect(team.goalDifference).toBe(-4);
    });
    
    it('sollte Statistiken korrekt zurücksetzen', () => {
        team.addWin(5, 0, 5);
        team.resetStats();
        expect(team.points).toBe(0);
        expect(team.wins).toBe(0);
        expect(team.played).toBe(0);
        expect(team.opponents.length).toBe(0);
    });
});