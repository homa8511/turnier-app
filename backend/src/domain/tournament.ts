import { Team } from "./team";
import { Round } from "./round";
import { Match } from "./match";
import { v4 as uuidv4 } from 'uuid';

export interface Location {
    name: string;
    address: string;
}

export interface TournamentConfig {
    id: string;
    tournamentName: string;
    location: Location;
    description: string;
    imageUrl?: string;
    numGroups: number;
    teamsPerGroup: number;
    numFields: number;
    matchDuration: number;
    pauseDuration: number;
    startDate: string;
    startTime: string;
}

export class Tournament {
    public teams: Team[] = [];
    public groups: { [key: string]: number[] } = {};
    public rounds: Round[] = [];
    public currentRound: number = 0;
    public viewingRound: number = 0;
    public matchViewMode: 'group' | 'chrono' = 'group';
    public status: 'config' | 'setup' | 'playing' | 'finished' = 'config';
    public config: TournamentConfig;
    public nextRoundStartTime: Date | null = null;

    constructor(initialState: Partial<Tournament>) {
        Object.assign(this, { ...initialState, teams: [], rounds: [] });
        
        if (initialState.teams) {
            this.teams = initialState.teams.map((t: Team) => Object.assign(new Team(t.id, t.name, t.group, t.logo), t));
        }

        if (initialState.rounds) {
            this.rounds = initialState.rounds.map((r: Round) => {
                const matches = r.matches.map((m: Match) => Object.assign(new Match(m.team1Id, m.team2Id), m));
                return new Round(r.roundNumber, matches);
            });
        }
    }
    
    public static create(config: Omit<TournamentConfig, 'id'>): Tournament {
        const id = `T-${uuidv4().split('-')[0].toUpperCase()}`;
        const tournamentConfig = { ...config, id };
        return new Tournament({ config: tournamentConfig, status: 'setup' });
    }

    public updateConfig(newConfigData: Partial<Omit<TournamentConfig, 'id'>>): void {
        if (this.status !== 'setup') {
            throw new Error("Configuration can only be edited before the tournament has started.");
        }
        this.config = { ...this.config, ...newConfigData };
    }

    public start(teamsData: { name: string; group: string; logo: string }[]): void {
        if (this.status !== 'setup') throw new Error("Tournament can only be started from setup state.");

        let teamIdCounter = 0;
        this.teams = teamsData.map(data => {
            const team = new Team(teamIdCounter, data.name, data.group, data.logo);
            teamIdCounter++;
            return team;
        });
        
        this.groups = this.teams.reduce((acc, team) => {
            if (!acc[team.group]) acc[team.group] = [];
            acc[team.group].push(team.id);
            return acc;
        }, {} as { [key: string]: number[] });

        this.generateFirstRound();
        this.status = 'playing';
        this.currentRound = 1;
        this.viewingRound = 1;
    }

    public recordResult(roundNumber: number, team1Id: number, team2Id: number, score1: number, score2: number): void {
        if (this.status !== 'playing') throw new Error("Results can only be recorded in 'playing' state.");
        
        const round = this.rounds.find(r => r.roundNumber === roundNumber);
        if (!round) throw new Error(`Round ${roundNumber} not found.`);

        const match = round.matches.find(m => (m.team1Id === team1Id && m.team2Id === team2Id) || (m.team1Id === team2Id && m.team2Id === team1Id));
        if (!match) throw new Error("Match not found in round.");

        match.recordResult(score1, score2);
        this.recalculateAllStandings();
    }

    public generateNextRound(): void {
        if (this.status !== 'playing') throw new Error("Can only generate next round when playing.");
        const currentRoundObj = this.rounds.find(r => r.roundNumber === this.currentRound);
        if (!currentRoundObj || !currentRoundObj.isComplete()) {
            throw new Error("Cannot generate next round until all matches in the current round are complete.");
        }
        
        const maxRounds = this.config.teamsPerGroup - 1;
        if (this.currentRound >= maxRounds) {
            this.status = 'finished';
            return;
        }

        this.recalculateAllStandings();

        const allNextMatches: Match[] = [];
        for (const groupName in this.groups) {
            const pairings = this.findPairingsForGroup(groupName);
            if (!pairings) throw new Error(`Could not generate pairings for group ${groupName}.`);
            allNextMatches.push(...pairings);
        }

        this.currentRound++;
        this.viewingRound = this.currentRound;
        const newRound = new Round(this.currentRound, allNextMatches);
        this.assignTimesAndFields(newRound);
        this.rounds.push(newRound);
    }
    
    private generateFirstRound(): void {
        const allMatches: Match[] = [];
        for (const groupName in this.groups) {
            const groupTeamIds = [...this.groups[groupName]];
            
            for (let i = groupTeamIds.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [groupTeamIds[i], groupTeamIds[j]] = [groupTeamIds[j], groupTeamIds[i]];
            }

            for (let i = 0; i < groupTeamIds.length; i += 2) {
                allMatches.push(new Match(groupTeamIds[i], groupTeamIds[i + 1]));
            }
        }
        const round = new Round(1, allMatches);
        this.assignTimesAndFields(round);
        this.rounds.push(round);
    }
    
    private findPairingsForGroup(groupName: string): Match[] | null {
        const groupTeamIds = this.groups[groupName];
        const sortedTeams = groupTeamIds
            .map(id => this.teams.find(t => t.id === id)!)
            .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name));

        const pairings = this.solvePairings(sortedTeams);
        return pairings ? pairings.map(p => new Match(p[0].id, p[1].id)) : null;
    }

    private solvePairings(unpairedTeams: Team[]): [Team, Team][] | null {
        if (unpairedTeams.length === 0) return [];

        const team1 = unpairedTeams[0];
        const remainingTeams = unpairedTeams.slice(1);

        for (let i = 0; i < remainingTeams.length; i++) {
            const team2 = remainingTeams[i];
            if (!team1.opponents.includes(team2.id)) {
                const nextUnpairedTeams = remainingTeams.filter(t => t.id !== team2.id);
                const result = this.solvePairings(nextUnpairedTeams);
                if (result !== null) {
                    return [[team1, team2], ...result];
                }
            }
        }
        return null;
    }

    private assignTimesAndFields(round: Round): void {
        const { numFields, matchDuration, pauseDuration, startDate, startTime } = this.config;
        
        let roundStartTime = this.nextRoundStartTime;
        if (!roundStartTime) {
            const startDateTimeString = `${startDate}T${startTime}`;
            roundStartTime = new Date(startDateTimeString);
        }
        this.nextRoundStartTime = roundStartTime;

        const fieldAvailability = new Array(numFields + 1).fill(roundStartTime);
        
        const groupNames = Object.keys(this.groups);
        const fieldsPerGroup: { [key: string]: number[] } = {};
        groupNames.forEach(groupName => {
            fieldsPerGroup[groupName] = [];
        });
        for(let i = 1; i <= numFields; i++) {
            fieldsPerGroup[groupNames[(i-1) % groupNames.length]].push(i);
        }

        const matchesByGroup: { [key: string]: Match[] } = {};
        round.matches.forEach(match => {
            const groupName = this.teams.find(t => t.id === match.team1Id)!.group;
            if (!matchesByGroup[groupName]) matchesByGroup[groupName] = [];
            matchesByGroup[groupName].push(match);
        });

        for (const groupName in matchesByGroup) {
            const groupMatches = matchesByGroup[groupName];
            const availableFields = fieldsPerGroup[groupName];
            if (availableFields.length === 0) continue;

            groupMatches.forEach(match => {
                let earliestField = availableFields[0];
                for (let i = 1; i < availableFields.length; i++) {
                    if (fieldAvailability[availableFields[i]] < fieldAvailability[earliestField]) {
                        earliestField = availableFields[i];
                    }
                }
                
                match.field = earliestField;
                const startTime = new Date(fieldAvailability[earliestField].getTime());
                match.startTime = startTime;
                const endTime = new Date(startTime.getTime() + matchDuration * 60000);
                match.endTime = endTime;
                
                fieldAvailability[earliestField] = new Date(endTime.getTime() + pauseDuration * 60000);
            });
        }
    }

    public recalculateAllStandings(): void {
        this.teams.forEach(team => team.resetStats());

        for (const round of this.rounds) {
            for (const match of round.matches) {
                if (match.isComplete()) {
                    const team1 = this.teams.find(t => t.id === match.team1Id)!;
                    const team2 = this.teams.find(t => t.id === match.team2Id)!;

                    if (match.score1! > match.score2!) {
                        team1.addWin(match.score1!, match.score2!, team2.id);
                        team2.addLoss(match.score2!, match.score1!, team1.id);
                    } else if (match.score2! > match.score1!) {
                        team2.addWin(match.score2!, match.score1!, team1.id);
                        team1.addLoss(match.score1!, match.score2!, team2.id);
                    } else {
                        team1.addDraw(match.score1!, match.score2!, team2.id);
                        team2.addDraw(match.score2!, match.score1!, team1.id);
                    }
                }
            }
        }
    }
}