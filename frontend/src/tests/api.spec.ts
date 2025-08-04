import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Swal from 'sweetalert2';
import {
  createTournament,
  startTournament,
  recordResult,
  generateNextRound,
  updateTournamentConfig,
  loadTournament,
} from '../api';
import type { Tournament, TournamentConfig } from '../types';

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock the global fetch
const fetchMock = vi.fn();
beforeEach(() => {
  global.fetch = fetchMock;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('api.ts', () => {
  // Helper to create a full TournamentConfig object for mocking
  const createMockConfig = (
    overrides: Partial<Omit<TournamentConfig, 'id'>> = {}
  ): Omit<TournamentConfig, 'id'> => ({
    tournamentName: 'Mock Tournament',
    location: { name: 'Mock Location', address: '123 Mock St' },
    description: 'A mock description',
    imageUrl: '',
    numGroups: 2,
    teamsPerGroup: 4,
    numFields: 2,
    matchDuration: 10,
    pauseDuration: 5,
    startDate: '2025-01-01',
    startTime: '09:00',
    ...overrides,
  });

  // Helper to create a full Tournament object
  const createMockTournament = (
    overrides: Partial<Tournament> = {}
  ): Tournament => ({
    id: 'mock-id',
    config: createMockConfig(),
    status: 'config',
    teams: [],
    groups: {},
    rounds: [],
    currentRound: 0,
    viewingRound: 0,
    isReadOnly: false,
    isLoading: false,
    isEditingConfig: false,
    matchViewMode: 'group',
    nextRoundStartTime: null,
    ...overrides,
  });

  describe('createTournament', () => {
    it('should send a POST request and return the new tournament', async () => {
      const config = createMockConfig({ tournamentName: 'New Cup' });
      const mockTournament = createMockTournament({ config });

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTournament),
      });

      const result = await createTournament(config);

      expect(fetchMock).toHaveBeenCalledWith('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      expect(result).toEqual(mockTournament);
    });

    it('should throw an error on failure', async () => {
      const config = createMockConfig({ tournamentName: 'New Cup' });
      fetchMock.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Creation failed' }),
      });

      await expect(createTournament(config)).rejects.toThrow('Creation failed');
    });
  });

  describe('startTournament', () => {
    it('should send a POST request with teams and return the started tournament', async () => {
      const teams = [{ name: 'Team A', group: 'A', logo: '' }];
      const mockTournament = createMockTournament({
        id: 'test-id',
        status: 'playing',
      });

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTournament),
      });

      const result = await startTournament('test-id', teams);

      expect(fetchMock).toHaveBeenCalledWith('/api/tournaments/test-id/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams }),
      });
      expect(result).toEqual(mockTournament);
    });
  });

  describe('recordResult', () => {
    it('should send a POST request with the match result', async () => {
      const resultData = {
        roundNumber: 1,
        team1Id: 1,
        team2Id: 2,
        score1: 3,
        score2: 1,
      };
      const mockTournament = createMockTournament({ id: 'test-id' });

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTournament),
      });

      const result = await recordResult('test-id', resultData);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tournaments/test-id/matches',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resultData),
        }
      );
      expect(result).toEqual(mockTournament);
    });
  });

  describe('generateNextRound', () => {
    it('should send a POST request to generate the next round', async () => {
      const mockTournament = createMockTournament({
        id: 'test-id',
        currentRound: 2,
      });

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTournament),
      });

      const result = await generateNextRound('test-id');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tournaments/test-id/next-round',
        {
          method: 'POST',
        }
      );
      expect(result).toEqual(mockTournament);
    });
  });

  describe('updateTournamentConfig', () => {
    it('should send a PUT request with the updated config', async () => {
      const partialConfig: Partial<Omit<TournamentConfig, 'id'>> = {
        tournamentName: 'Updated Cup',
      };
      const mockTournament = createMockTournament({ id: 'test-id' });

      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTournament),
      });

      const result = await updateTournamentConfig('test-id', partialConfig);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tournaments/test-id/config',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: partialConfig }),
        }
      );
      expect(result).toEqual(mockTournament);
    });
  });

  describe('loadTournament', () => {
    it('should return null and show a warning if no ID is provided', async () => {
      const result = await loadTournament('');
      expect(result).toBeNull();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Fehler',
        'Bitte geben Sie eine Turnier-ID ein.',
        'warning'
      );
    });

    it('should fetch and return a tournament on success', async () => {
      const mockTournament = createMockTournament({ id: 'test-id' });
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTournament),
      });

      const result = await loadTournament('test-id');
      expect(fetchMock).toHaveBeenCalledWith('/api/tournaments/test-id');
      expect(result).toEqual(mockTournament);
    });

    it('should return null and show an error on 404', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await loadTournament('not-found-id');
      expect(result).toBeNull();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Fehler',
        'Kein Turnier mit der ID "not-found-id" gefunden.',
        'error'
      );
    });

    it('should return null and show a generic error on other failures', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await loadTournament('error-id');
      expect(result).toBeNull();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Fehler',
        'Ein unbekannter Fehler ist aufgetreten.',
        'error'
      );
    });

    it('should return null and show an error on fetch exception', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await loadTournament('any-id');
      expect(result).toBeNull();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Fehler',
        'Die Turnierdaten konnten nicht vom Server geladen werden.',
        'error'
      );
    });
  });
});
