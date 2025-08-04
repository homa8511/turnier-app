import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TournamentView from '../TournamentView.vue';
import { store } from '../../store';
import * as api from '../../api';
import type { Team, Round, Tournament } from '../../types';

// Mock dependencies
vi.mock('../../api');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));
vi.mock('dompurify', () => ({
  default: {
    sanitize: (str: string) => str.replace(/<script.*?>.*?<\/script>/gi, ''),
  },
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe('TournamentView.vue', () => {
  beforeEach(() => {
    store.resetState();
    store.state.status = 'playing';
    store.state.config.id = 'test-tourney';
    store.state.config.description =
      '<p>Welcome</p><script>alert("xss")</script>';
    store.state.currentRound = 2;
    store.state.viewingRound = 2;

    // Add mock teams and groups
    store.state.teams = [
      { id: 1, name: 'Team A', group: 'Group 1' } as Team,
      { id: 2, name: 'Team B', group: 'Group 1' } as Team,
    ];
    store.state.groups = { 'Group 1': [1, 2] };

    // Add mock rounds with team IDs
    store.state.rounds = [
      {
        roundNumber: 1,
        matches: [{ team1Id: 1, team2Id: 2, score1: 1, score2: 0 }],
      },
      {
        roundNumber: 2,
        matches: [{ team1Id: 1, team2Id: 2, score1: null, score2: null }],
      },
    ] as Round[];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the tournament name and description correctly', () => {
    store.state.config.tournamentName = 'Grand Finale';
    const wrapper = mount(TournamentView);
    expect(wrapper.find('#display-tournament-name').text()).toBe(
      'Grand Finale'
    );

    const description = wrapper.find('.prose');
    expect(description.html()).toContain('<p>Welcome</p>');
    expect(description.html()).not.toContain('<script>');
  });

  it('handles round navigation correctly', async () => {
    const wrapper = mount(TournamentView);

    const prevButton = wrapper.find('#round-navigation button:first-of-type');
    const nextButton = wrapper.find('#round-navigation button:last-of-type');

    expect(store.state.viewingRound).toBe(2);

    // Cannot go to next round yet
    expect(nextButton.attributes('disabled')).toBeDefined();

    // Go to previous round
    await prevButton.trigger('click');
    expect(store.state.viewingRound).toBe(1);

    // Now we can go next
    expect(nextButton.attributes('disabled')).toBeUndefined();
    await nextButton.trigger('click');
    expect(store.state.viewingRound).toBe(2);
  });

  it('toggles match view mode', async () => {
    const wrapper = mount(TournamentView);
    expect(store.state.matchViewMode).toBe('group');

    const chronoButton = wrapper.find('#view-mode-toggle button:last-of-type');
    await chronoButton.trigger('click');

    expect(store.state.matchViewMode).toBe('chrono');
  });

  it('copies the correct links to clipboard', async () => {
    const wrapper = mount(TournamentView);
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');
    const hostButton = wrapper.find('button.bg-gray-200');
    const readonlyButton = wrapper.find('button.bg-blue-500');

    await hostButton.trigger('click');
    expect(clipboardSpy).toHaveBeenCalledWith(
      'http://localhost:3000/host/event/test-tourney'
    );

    await readonlyButton.trigger('click');
    expect(clipboardSpy).toHaveBeenCalledWith(
      'http://localhost:3000/event/test-tourney'
    );
  });

  describe('action button', () => {
    it('should be disabled if current round matches are not finished', () => {
      const wrapper = mount(TournamentView);
      const actionButton = wrapper.find('#action-button');
      expect(actionButton.attributes('disabled')).toBeDefined();
    });

    it('should be enabled if current round matches are finished', () => {
      store.state.rounds[1].matches[0].score1 = 1; // Finish the match
      const wrapper = mount(TournamentView);
      const actionButton = wrapper.find('#action-button');
      expect(actionButton.attributes('disabled')).toBeUndefined();
    });

    it('should show "Zurück zur aktuellen Runde" when viewing a past round', async () => {
      store.state.viewingRound = 1;
      const wrapper = mount(TournamentView);
      const actionButton = wrapper.find('#action-button');
      expect(actionButton.text()).toBe('Zurück zur aktuellen Runde');

      // Clicking it should change the viewing round back
      await actionButton.trigger('click');
      expect(store.state.viewingRound).toBe(2);
    });

    it('should call generateNextRound when clicked', async () => {
      store.state.rounds[1].matches[0].score1 = 1; // Enable the button
      const generateNextRoundSpy = vi
        .spyOn(api, 'generateNextRound')
        .mockResolvedValue({} as Tournament);
      const wrapper = mount(TournamentView);

      const actionButton = wrapper.find('#action-button');
      await actionButton.trigger('click');

      expect(generateNextRoundSpy).toHaveBeenCalledWith('test-tourney');
    });
  });
});
