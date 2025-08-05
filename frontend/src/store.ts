import { reactive } from 'vue';
import type { AppState, Tournament } from './types';

const initialState: AppState = {
  isReadOnly: false,
  isLoading: false,
  isEditingConfig: false,
  teams: [],
  groups: {},
  rounds: [],
  currentRound: 0,
  viewingRound: 0,
  matchViewMode: 'group',
  status: 'config',
  config: {
    id: null,
    tournamentName: 'Sommer-Cup 2025',
    location: {
      name: 'Sportanlage am Park',
      address: 'Musterstraße 1, 12345 Beispielstadt',
    },
    description: '<b>Willkommen!</b>',
    imageUrl: '',
    numGroups: 2,
    teamsPerGroup: 4,
    numFields: 2,
    matchDuration: 10,
    pauseDuration: 5,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
  },
  nextRoundStartTime: null,
};

export const store = reactive<{
  state: AppState;
  setState: (newState: Tournament) => void;
  setReadOnly: (status: boolean) => void;
  setLoading: (status: boolean) => void;
  setEditingConfig: (status: boolean) => void;
  resetState: () => void;
}>({
  state: JSON.parse(JSON.stringify(initialState)) as AppState,

  setState(newState) {
    // ... (Logik zum Konvertieren von Date-Strings bleibt gleich)
    this.state = { ...this.state, ...newState };
  },

  setReadOnly(status) {
    this.state.isReadOnly = status;
  },
  setLoading(status) {
    this.state.isLoading = status;
  },
  setEditingConfig(status) {
    this.state.isEditingConfig = status;
  },
  resetState() {
    this.state = JSON.parse(JSON.stringify(initialState)) as AppState;
  },
});
