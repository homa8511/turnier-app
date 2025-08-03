import { describe, it, expect, vi, afterEach } from 'vitest'
import * as api from '../api'
import type { Tournament, TournamentConfig } from '../types'

const mockTournament: Tournament = {
  id: '123',
  config: {
    tournamentName: 'Test Tournament',
  } as TournamentConfig,
  teams: [],
  groups: {},
  rounds: [],
  currentRound: 0,
  viewingRound: 0,
  matchViewMode: 'group',
  status: 'config',
  nextRoundStartTime: null,
  isReadOnly: false,
  isLoading: false,
  isEditingConfig: false,
  description: '',
  imageUrl: '',
  location: { name: '', address: '' },
  numFields: 2,
  numGroups: 2,
  teamsPerGroup: 4,
  matchDuration: 10,
  pauseDuration: 5,
  startDate: '',
  startTime: '',
}

global.fetch = vi.fn()

function createFetchResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => new Promise((resolve) => resolve(data)),
  } as Response
}

describe('api.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('createTournament should post the config and return a tournament', async () => {
    const config = { tournamentName: 'New Cup' } as Omit<TournamentConfig, 'id'>
    const mockResponse = createFetchResponse(mockTournament)
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    const result = await api.createTournament(config)

    expect(fetch).toHaveBeenCalledWith('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    })
    expect(result).toEqual(mockTournament)
  })

  it('startTournament should post teams and return a tournament', async () => {
    const teams = [{ name: 'Team A', group: 'A', logo: '' }]
    const mockResponse = createFetchResponse(mockTournament)
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    const result = await api.startTournament('123', teams)

    expect(fetch).toHaveBeenCalledWith('/api/tournaments/123/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams }),
    })
    expect(result).toEqual(mockTournament)
  })

  it('loadTournament should fetch a tournament by id', async () => {
    const mockResponse = createFetchResponse(mockTournament)
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    const result = await api.loadTournament('123')

    expect(fetch).toHaveBeenCalledWith('/api/tournaments/123')
    expect(result).toEqual(mockTournament)
  })

  it('loadTournament should return null on 404', async () => {
    const mockResponse = createFetchResponse({ error: 'Not Found' }, false, 404)
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    // Mock swal
    const swal = await import('sweetalert2')
    swal.default.fire = vi.fn()

    const result = await api.loadTournament('123')

    expect(fetch).toHaveBeenCalledWith('/api/tournaments/123')
    expect(result).toBeNull()
    expect(swal.default.fire).toHaveBeenCalledWith('Fehler', 'Kein Turnier mit der ID "123" gefunden.', 'error')
  })

  it('recordResult should post a result and return a tournament', async () => {
    const resultData = { roundNumber: 1, team1Id: 1, team2Id: 2, score1: 3, score2: 1 }
    const mockResponse = createFetchResponse(mockTournament)
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    const result = await api.recordResult('123', resultData)

    expect(fetch).toHaveBeenCalledWith('/api/tournaments/123/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData),
    })
    expect(result).toEqual(mockTournament)
  })

  it('generateNextRound should post to next-round and return a tournament', async () => {
    const mockResponse = createFetchResponse(mockTournament)
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    const result = await api.generateNextRound('123')

    expect(fetch).toHaveBeenCalledWith('/api/tournaments/123/next-round', {
      method: 'POST',
    })
    expect(result).toEqual(mockTournament)
  })

  it('updateTournamentConfig should put the new config and return a tournament', async () => {
    const config = { tournamentName: 'Updated Cup' } as Partial<Omit<TournamentConfig, 'id'>>
    const mockResponse = createFetchResponse(mockTournament)
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    const result = await api.updateTournamentConfig('123', config)

    expect(fetch).toHaveBeenCalledWith('/api/tournaments/123/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    })
    expect(result).toEqual(mockTournament)
  })
})
