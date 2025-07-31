import { Match } from "./match";

export class Round {
    public readonly roundNumber: number;
    public readonly matches: Match[];

    constructor(roundNumber: number, matches: Match[]) {
        this.roundNumber = roundNumber;
        this.matches = matches;
    }

    public isComplete(): boolean {
        return this.matches.every(match => match.isComplete());
    }
}