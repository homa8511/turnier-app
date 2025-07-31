export class Team {
    public readonly id: number;
    public readonly name: string;
    public readonly group: string;
    public logo: string;
    public played: number = 0;
    public wins: number = 0;
    public draws: number = 0;
    public losses: number = 0;
    public goalsFor: number = 0;
    public goalsAgainst: number = 0;
    public goalDifference: number = 0;
    public points: number = 0;
    public opponents: number[] = [];

    constructor(id: number, name: string, group: string, logo: string) {
        this.id = id;
        this.name = name;
        this.group = group;
        this.logo = logo;
    }

    public addWin(goalsFor: number, goalsAgainst: number, opponentId: number): void {
        this.points += 3;
        this.wins++;
        this.updateStats(goalsFor, goalsAgainst, opponentId);
    }

    public addDraw(goalsFor: number, goalsAgainst: number, opponentId: number): void {
        this.points += 1;
        this.draws++;
        this.updateStats(goalsFor, goalsAgainst, opponentId);
    }

    public addLoss(goalsFor: number, goalsAgainst: number, opponentId: number): void {
        this.losses++;
        this.updateStats(goalsFor, goalsAgainst, opponentId);
    }
    
    public resetStats(): void {
        this.played = 0;
        this.wins = 0;
        this.draws = 0;
        this.losses = 0;
        this.goalsFor = 0;
        this.goalsAgainst = 0;
        this.goalDifference = 0;
        this.points = 0;
        this.opponents = [];
    }

    private updateStats(goalsFor: number, goalsAgainst: number, opponentId: number): void {
        this.played++;
        this.goalsFor += goalsFor;
        this.goalsAgainst += goalsAgainst;
        this.goalDifference = this.goalsFor - this.goalsAgainst;
        this.opponents.push(opponentId);
    }
}