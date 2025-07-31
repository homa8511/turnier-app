export class Match {
    public readonly team1Id: number;
    public readonly team2Id: number;
    public score1: number | null = null;
    public score2: number | null = null;
    public field?: number;
    public startTime?: Date;
    public endTime?: Date;

    constructor(team1Id: number, team2Id: number) {
        this.team1Id = team1Id;
        this.team2Id = team2Id;
    }

    public recordResult(score1: number, score2: number): void {
        if (score1 < 0 || score2 < 0) {
            throw new Error("Scores cannot be negative.");
        }
        this.score1 = score1;
        this.score2 = score2;
    }

    public isComplete(): boolean {
        return this.score1 !== null && this.score2 !== null;
    }
}
