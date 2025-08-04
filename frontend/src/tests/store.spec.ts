import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../store';
import type { AppState, Tournament } from '../types';

// Replicating the initial state structure for reliable testing, as it's not exported.
const getInitialState = (): AppState => ({
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
});

describe('store', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test to ensure test isolation.
    store.resetState();
  });

  it('should have the correct initial state on load', () => {
    const expectedInitialState = getInitialState();
    // The dynamic date in the actual store needs to be accounted for.
    expectedInitialState.config.startDate = store.state.config.startDate;
    expect(store.state).toEqual(expectedInitialState);
  });

  it('setReadOnly should update the isReadOnly flag', () => {
    expect(store.state.isReadOnly).toBe(false);
    store.setReadOnly(true);
    expect(store.state.isReadOnly).toBe(true);
    store.setReadOnly(false);
    expect(store.state.isReadOnly).toBe(false);
  });

  it('setLoading should update the isLoading flag', () => {
    expect(store.state.isLoading).toBe(false);
    store.setLoading(true);
    expect(store.state.isLoading).toBe(true);
  });

  it('setEditingConfig should update the isEditingConfig flag', () => {
    expect(store.state.isEditingConfig).toBe(false);
    store.setEditingConfig(true);
    expect(store.state.isEditingConfig).toBe(true);
  });

  it('resetState should restore the state to its initial values', () => {
    // Modify the state
    store.setLoading(true);
    store.state.status = 'playing';
    store.state.teams = [
      {
        id: 1,
        name: 'Test',
        group: 'A',
        logo: '',
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ];

    // Reset it
    store.resetState();

    const expectedInitialState = getInitialState();
    expectedInitialState.config.startDate = store.state.config.startDate; // Align dynamic date
    expect(store.state).toEqual(expectedInitialState);
  });

  it('setState should perform a shallow merge of the new state into the existing state', () => {
    const partialUpdate: Partial<Tournament> = {
      status: 'playing',
      currentRound: 1,
    };

    // Apply the partial update
    store.setState(partialUpdate as Tournament);

    // Check that the updated properties are correct
    expect(store.state.status).toBe('playing');
    expect(store.state.currentRound).toBe(1);

    // Check that other properties were not affected
    expect(store.state.isLoading).toBe(false);
    expect(store.state.config.tournamentName).toBe('Sommer-Cup 2025');
  });
});
