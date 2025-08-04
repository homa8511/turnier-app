export interface Location {
  name: string;
  address: string;
}

export interface TournamentConfig {
  id: string | null;
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

export interface Team {
  id: number;
  name: string;
  group: string;
  logo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  opponents: number[];
}

export interface Match {
  team1Id: number;
  team2Id: number;
  score1: number | null;
  score2: number | null;
  field?: number;
  startTime?: Date;
  endTime?: Date;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

export interface Tournament {
  teams: Team[];
  groups: { [key: string]: number[] };
  rounds: Round[];
  currentRound: number;
  viewingRound: number;
  matchViewMode: 'group' | 'chrono';
  status: 'config' | 'setup' | 'playing' | 'finished' | 'error';
  config: TournamentConfig;
  nextRoundStartTime: Date | null;
}

export interface AppState extends Tournament {
  isReadOnly: boolean;
  isLoading: boolean;
  isEditingConfig: boolean;
}

export interface TeamData {
  id: number;
  name: string;
  logo: string;
  logoPreview: string;
}

export interface GroupData {
  name: string;
  teams: TeamData[];
}
