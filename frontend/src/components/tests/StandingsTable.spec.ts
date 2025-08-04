import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import StandingsTable from '../StandingsTable.vue';
import { store } from '../../store';
import type { Team } from '../../types';

describe('StandingsTable.vue', () => {
  // Mock teams data with various stats to test sorting logic
  const teams: Team[] = [
    {
      id: 1,
      name: 'Team B',
      points: 6,
      goalDifference: 3,
      goalsFor: 5,
      group: 'A',
    } as Team,
    {
      id: 2,
      name: 'Team A',
      points: 6,
      goalDifference: 3,
      goalsFor: 5,
      group: 'A',
    } as Team, // Should be sorted by name after Team B
    {
      id: 3,
      name: 'Team C',
      points: 7,
      goalDifference: 4,
      goalsFor: 6,
      group: 'A',
    } as Team, // Highest points, should be first
    {
      id: 4,
      name: 'Team D',
      points: 6,
      goalDifference: 2,
      goalsFor: 5,
      group: 'A',
    } as Team, // Lower goal difference
    {
      id: 5,
      name: 'Team E',
      points: 6,
      goalDifference: 3,
      goalsFor: 4,
      group: 'A',
    } as Team, // Lower goals for
  ];

  beforeEach(() => {
    // Reset and populate the store's state before each test
    store.resetState();
    store.state.teams = JSON.parse(JSON.stringify(teams));
  });

  it('should render the table with the group name', () => {
    const wrapper = mount(StandingsTable, {
      props: {
        groupName: 'Super Group',
        teamIds: [1, 2, 3, 4, 5],
      },
    });
    expect(wrapper.find('h2').text()).toBe('Super Group');
  });

  it('should sort teams correctly based on points, goal difference, goals for, and name', () => {
    const wrapper = mount(StandingsTable, {
      props: {
        groupName: 'Test Group',
        teamIds: [1, 2, 3, 4, 5],
      },
      global: {
        plugins: [], // No need for external plugins
      },
    });

    const renderedTeamNames = wrapper.findAll('tbody tr').map((row) => {
      // Find the cell with the team name. Assuming it's the third 'td'.
      // This is brittle; a test-id would be better, but we work with what we have.
      return row.findAll('td')[2].text();
    });

    // Expected order:
    // 1. Team C (7 pts)
    // 2. Team A (6 pts, GD 3, GF 5, name 'A')
    // 3. Team B (6 pts, GD 3, GF 5, name 'B')
    // 4. Team E (6 pts, GD 3, GF 4)
    // 5. Team D (6 pts, GD 2)
    const expectedOrder = ['Team C', 'Team A', 'Team B', 'Team E', 'Team D'];

    expect(renderedTeamNames).toEqual(expectedOrder);
  });

  it('should render the correct stats for each team', () => {
    const teamC = teams.find((t) => t.id === 3)!;
    const wrapper = mount(StandingsTable, {
      props: {
        groupName: 'Single Team Group',
        teamIds: [3],
      },
    });

    const row = wrapper.find('tbody tr');
    const cells = row.findAll('td');

    // Example assertion for one team to verify data binding
    expect(cells[0].text()).toBe('1'); // Rank
    expect(cells[2].text()).toBe(teamC.name);
    expect(cells[8].text()).toBe(
      teamC.goalDifference > 0
        ? `+${teamC.goalDifference}`
        : `${teamC.goalDifference}`
    );
    expect(cells[9].text()).toBe(String(teamC.points));
  });
});
