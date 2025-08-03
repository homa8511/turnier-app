import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MatchCard from '../components/MatchCard.vue'
import { store } from '../store'
import type { Match } from '../types'

const mockMatch: Match = {
  id: 1,
  roundNumber: 1,
  field: 1,
  team1Id: 1,
  team2Id: 2,
  score1: null,
  score2: null,
  startTime: new Date(),
  endTime: new Date(),
}

const team1 = { id: 1, name: 'Team A', logo: 'logoA.png', group: 'A' }
const team2 = { id: 2, name: 'Team B', logo: 'logoB.png', group: 'A' }

store.state.teams = [team1, team2]
store.state.isReadOnly = false
store.state.currentRound = 1
store.state.viewingRound = 1

describe('MatchCard.vue', () => {
  it('renders team names and logos', () => {
    const wrapper = mount(MatchCard, { props: { match: mockMatch } })
    expect(wrapper.text()).toContain('Team A')
    expect(wrapper.text()).toContain('Team B')
    expect(wrapper.find('img[alt="Team A Logo"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="Team B Logo"]').exists()).toBe(true)
  })

  it('shows save button when match is not finished', () => {
    const wrapper = mount(MatchCard, { props: { match: mockMatch } })
    expect(wrapper.find('.save-match-btn').exists()).toBe(true)
    expect(wrapper.find('.edit-match-btn').exists()).toBe(false)
  })

  it('shows edit button when match is finished', () => {
    const finishedMatch = { ...mockMatch, score1: 1, score2: 0 }
    const wrapper = mount(MatchCard, { props: { match: finishedMatch } })
    expect(wrapper.find('.save-match-btn').exists()).toBe(false)
    expect(wrapper.find('.edit-match-btn').exists()).toBe(true)
  })

  it('emits save event on save button click', async () => {
    const wrapper = mount(MatchCard, { props: { match: mockMatch } })
    await wrapper.find('.save-match-btn').trigger('click')
    expect(wrapper.emitted().save).toBeTruthy()
    expect(wrapper.emitted().save[0]).toEqual([mockMatch])
  })

  it('emits edit event on edit button click', async () => {
    const finishedMatch = { ...mockMatch, score1: 1, score2: 0 }
    const wrapper = mount(MatchCard, { props: { match: finishedMatch } })
    await wrapper.find('.edit-match-btn').trigger('click')
    expect(wrapper.emitted().edit).toBeTruthy()
    expect(wrapper.emitted().edit[0]).toEqual([finishedMatch])
  })

  it('disables inputs when read-only', () => {
    store.state.isReadOnly = true
    const wrapper = mount(MatchCard, { props: { match: mockMatch } })
    const inputs = wrapper.findAll('input[type="number"]')
    expect(inputs[0].attributes('disabled')).toBeDefined()
    expect(inputs[1].attributes('disabled')).toBeDefined()
    store.state.isReadOnly = false // Reset for other tests
  })
})
