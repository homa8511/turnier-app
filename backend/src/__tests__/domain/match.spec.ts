import { describe, it, expect } from 'vitest';
import { Match } from '../../domain/match';

describe('Match Entity', () => {
    it('sollte ein Ergebnis korrekt speichern', () => {
        const match = new Match(1, 2);
        match.recordResult(3, 0);
        expect(match.score1).toBe(3);
        expect(match.score2).toBe(0);
        expect(match.isComplete()).toBe(true);
    });

    it('sollte einen Fehler bei negativen Ergebnissen werfen', () => {
        const match = new Match(1, 2);
        expect(() => match.recordResult(-1, 0)).toThrow("Scores cannot be negative.");
    });

    it('sollte als unvollständig gelten, wenn kein Ergebnis vorliegt', () => {
        const match = new Match(1, 2);
        expect(match.isComplete()).toBe(false);
    });
});