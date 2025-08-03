import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StandingsTable from '../components/StandingsTable.vue'
import { store } from '../store'
import type { Team } from '../types'

const teamA: Team = { id: 1, name: 'Team A', logo: '', group: 'A', played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 0, goalDifference: 2, points: 3 }
const teamB: Team = { id: 2, name: 'Team B', logo: '', group: 'A', played: 1, wins: 0, draws: 0, losses: 1, goalsFor: 0, goalsAgainst: 2, goalDifference: -2, points: 0 }
const teamC: Team = { id: 3, name: 'Team C', logo: '', group: 'A', played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 3 }
const teamD: Team = { id: 4, name: 'Team D', logo: '', group: 'A', played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 3 }

store.state.teams = [teamA, teamB, teamC, teamD]

describe('StandingsTable.vue', () => {
  it('renders group name', () => {
    const wrapper = mount(StandingsTable, {
      props: { groupName: 'Group A', teamIds: [1, 2] },
    })
    expect(wrapper.find('h2').text()).toBe('Group A')
  })

  it('renders the correct number of teams', () => {
    const wrapper = mount(StandingsTable, {
      props: { groupName: 'Group A', teamIds: [1, 2] },
    })
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  it('sorts teams by points', () => {
    const wrapper = mount(StandingsTable, {
      props: { groupName: 'Group A', teamIds: [1, 2] },
    })
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].text()).toContain('Team A')
    expect(rows[1].text()).toContain('Team B')
  })

  it('sorts teams by goal difference if points are equal', () => {
    const teamE = { ...teamA, id: 5, name: 'Team E', goalDifference: 1 }
    store.state.teams.push(teamE)
    const wrapper = mount(StandingsTable, {
      props: { groupName: 'Group A', teamIds: [1, 5] },
    })
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].text()).toContain('Team A') // Higher goal difference
    expect(rows[1].text()).toContain('Team E')
  })

  it('sorts teams by goals for if points and goal difference are equal', () => {
    const wrapper = mount(StandingsTable, {
      props: { groupName: 'Group A', teamIds: [1, 3] },
    })
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].text()).toContain('Team C') // More goals for
    expect(rows[1].text()).toContain('Team A')
  })

  it('sorts teams by name if all other metrics are equal', () => {
    const wrapper = mount(StandingsTable, {
      props: { groupName: 'Group A', teamIds: [3, 4] },
    })
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].text()).toContain('Team C') // Alphabetical
    expect(rows[1].text()).toContain('Team D')
  })
})
