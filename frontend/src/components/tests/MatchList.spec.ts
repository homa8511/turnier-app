import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import MatchList from '../MatchList.vue';
import { store } from '../../store';
import * as api from '../../api';
import type { Team, Match, Round, Tournament } from '../../types';

// Mock the API module
vi.mock('../../api');

describe('MatchList.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof MatchList>>;
  const teams: Team[] = [
    { id: 1, name: 'Team A', group: 'Group 1' } as Team,
    { id: 2, name: 'Team B', group: 'Group 1' } as Team,
    { id: 3, name: 'Team C', group: 'Group 2' } as Team,
    { id: 4, name: 'Team D', group: 'Group 2' } as Team,
  ];

  const rounds: Round[] = [
    {
      roundNumber: 1,
      matches: [
        {
          team1Id: 1,
          team2Id: 2,
          startTime: new Date('2025-01-01T10:00:00Z'),
          field: 2,
          score1: null,
          score2: null,
        },
        {
          team1Id: 3,
          team2Id: 4,
          startTime: new Date('2025-01-01T09:00:00Z'),
          field: 1,
          score1: null,
          score2: null,
        },
        {
          team1Id: 1,
          team2Id: 4,
          startTime: new Date('2025-01-01T09:00:00Z'),
          field: 2,
          score1: null,
          score2: null,
        },
      ] as Match[],
    },
  ];

  beforeEach(() => {
    store.resetState();
    store.state.teams = teams;
    store.state.rounds = rounds;
    store.state.currentRound = 1;
    store.state.viewingRound = 1;
    store.state.groups = {
      'Group 1': [1, 2],
      'Group 2': [3, 4],
    };
    store.state.config.id = 'test-tournament';
    wrapper = mount(MatchList);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up mock DOM elements
    document.body.innerHTML = '';
    wrapper.unmount();
  });

  it('should compute matches by group correctly', async () => {
    store.state.matchViewMode = 'group';
    await wrapper.vm.$nextTick();
    const groupedMatches = wrapper.vm.matchesByGroup;
    expect(Object.keys(groupedMatches)).toEqual(['Group 1', 'Group 2']);

    // Group 1 gets the intra-group match AND the cross-group match because team1 (ID 1) is in Group 1
    expect(groupedMatches['Group 1'].length).toBe(2);
    expect(groupedMatches['Group 2'].length).toBe(1);

    // Check content of Group 2
    expect(groupedMatches['Group 2'][0].team1Id).toBe(3); // Team C vs Team D

    // Check sorting within Group 1 (by time, then field)
    expect(groupedMatches['Group 1'][0].team1Id).toBe(1); // The cross-group match at 09:00
    expect(groupedMatches['Group 1'][0].team2Id).toBe(4);
    expect(groupedMatches['Group 1'][1].team1Id).toBe(1); // The intra-group match at 10:00
    expect(groupedMatches['Group 1'][1].team2Id).toBe(2);
  });

  it('should compute chronological matches correctly', async () => {
    store.state.matchViewMode = 'chrono';
    await wrapper.vm.$nextTick();
    const chronoMatches = wrapper.vm.chronologicalMatches;
    expect(chronoMatches.length).toBe(3);
    // Sorted by time, then field
    expect(chronoMatches[0].team1Id).toBe(3); // 09:00 Field 1
    expect(chronoMatches[1].team1Id).toBe(1); // 09:00 Field 2
    expect(chronoMatches[2].team1Id).toBe(1); // 10:00 Field 2
  });

  it('should call recordResult on save', async () => {
    const wrapper = mount(MatchList);
    const matchToSave = rounds[0].matches[0];

    // Create mock inputs in the DOM
    const input1 = document.createElement('input');
    input1.id = `score-${matchToSave.team1Id}-vs-${matchToSave.team2Id}-1`;
    input1.value = '3';
    document.body.appendChild(input1);

    const input2 = document.createElement('input');
    input2.id = `score-${matchToSave.team1Id}-vs-${matchToSave.team2Id}-2`;
    input2.value = '1';
    document.body.appendChild(input2);

    const recordResultSpy = vi
      .spyOn(api, 'recordResult')
      .mockResolvedValue({} as Tournament);

    // Find the correct MatchCard and emit the 'save' event
    const matchCards = wrapper.findAllComponents({ name: 'MatchCard' });
    const targetCard = matchCards.find(
      (c) =>
        (c.props('match') as Match).team1Id === matchToSave.team1Id &&
        (c.props('match') as Match).team2Id === matchToSave.team2Id
    );

    await targetCard!.vm.$emit('save', matchToSave);

    expect(recordResultSpy).toHaveBeenCalledWith('test-tournament', {
      roundNumber: 1,
      team1Id: matchToSave.team1Id,
      team2Id: matchToSave.team2Id,
      score1: 3,
      score2: 1,
    });
  });

  it('should enable inputs on edit', async () => {
    const wrapper = mount(MatchList);
    const matchToEdit = rounds[0].matches[0];

    // Create mock disabled inputs
    const input1 = document.createElement('input');
    input1.id = `score-${matchToEdit.team1Id}-vs-${matchToEdit.team2Id}-1`;
    input1.disabled = true;
    document.body.appendChild(input1);

    const input2 = document.createElement('input');
    input2.id = `score-${matchToEdit.team1Id}-vs-${matchToEdit.team2Id}-2`;
    input2.disabled = true;
    document.body.appendChild(input2);

    const matchCards = wrapper.findAllComponents({ name: 'MatchCard' });
    const targetCard = matchCards.find(
      (c) =>
        (c.props('match') as Match).team1Id === matchToEdit.team1Id &&
        (c.props('match') as Match).team2Id === matchToEdit.team2Id
    );

    await targetCard!.vm.$emit('edit', matchToEdit);

    expect(input1.disabled).toBe(false);
    expect(input2.disabled).toBe(false);
  });
});
