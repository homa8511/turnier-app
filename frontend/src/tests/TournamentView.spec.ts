import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TournamentView from '../components/TournamentView.vue'
import { store } from '../store'
import * as api from '../api'
import Swal from 'sweetalert2'

vi.mock('../api')
vi.mock('sweetalert2')
vi.mock('dompurify', () => ({
  default: {
    sanitize: (str: string) => str,
  },
}))

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})


describe('TournamentView.vue', () => {
  beforeEach(() => {
    store.resetState()
    store.state.config.id = 'test-id'
    store.state.config.tournamentName = 'Test Tournament'
    store.state.config.location = { name: 'Test Location', address: 'Test Address' }
    store.state.teams = [
      { id: 1, name: 'Team A', group: 'Group A' },
      { id: 2, name: 'Team B', group: 'Group A' }
    ] as any
    store.state.groups = { 'Group A': [1, 2] }
    store.state.rounds = [
      { roundNumber: 1, matches: [{ team1Id: 1, team2Id: 2, score1: 1, score2: 0 }] },
      { roundNumber: 2, matches: [{ team1Id: 1, team2Id: 2, score1: null, score2: null }] },
    ] as any
    store.state.currentRound = 2
    store.state.viewingRound = 2
    vi.clearAllMocks()
  })

  it('renders tournament name and location', () => {
    const wrapper = mount(TournamentView)
    expect(wrapper.find('#display-tournament-name').text()).toBe('Test Tournament')
    expect(wrapper.find('#display-location').text()).toContain('Test Location')
  })

  it('navigates rounds', async () => {
    const wrapper = mount(TournamentView)
    await wrapper.find('#round-navigation button:first-child').trigger('click') // prev
    expect(store.state.viewingRound).toBe(1)
    await wrapper.find('#round-navigation button:last-child').trigger('click') // next
    expect(store.state.viewingRound).toBe(2)
  })

  it('sets match view mode', async () => {
    const wrapper = mount(TournamentView)
    await wrapper.find('#view-mode-toggle button:last-child').trigger('click') // chrono
    expect(store.state.matchViewMode).toBe('chrono')
  })

  it('action button is disabled if current round matches are not finished', async () => {
    const wrapper = mount(TournamentView)
    expect(wrapper.find('#action-button').attributes('disabled')).toBeDefined()
  })

  it('action button is enabled if current round matches are finished', async () => {
    store.state.rounds[1].matches[0].score1 = 1 // Finish the match
    const wrapper = mount(TournamentView)
    expect(wrapper.find('#action-button').attributes('disabled')).toBeUndefined()
  })

  it('calls generateNextRound when action button is clicked', async () => {
    store.state.rounds[1].matches[0].score1 = 1 // Finish the match
    const mockGenerate = vi.mocked(api.generateNextRound).mockResolvedValue({} as any)
    const wrapper = mount(TournamentView)

    await wrapper.find('#action-button').trigger('click')

    expect(mockGenerate).toHaveBeenCalledWith('test-id')
  })

  it('navigates to current round if viewing past', async () => {
    store.state.viewingRound = 1
    const wrapper = mount(TournamentView)

    expect(wrapper.find('#action-button').text()).toBe('Zurück zur aktuellen Runde')
    await wrapper.find('#action-button').trigger('click')

    expect(store.state.viewingRound).toBe(2)
  })

  it('copies links to clipboard', async () => {
    const wrapper = mount(TournamentView)

    await wrapper.find('button.bg-gray-200').trigger('click') // admin link
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/host/event/test-id')

    await wrapper.find('button.bg-blue-500').trigger('click') // readonly link
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/event/test-id')
  })
})
