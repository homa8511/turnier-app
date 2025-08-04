import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TeamSetup from '../TeamSetup.vue';
import { store } from '../../store';
import * as api from '../../api';
import Swal from 'sweetalert2';
import type { Tournament } from '../../types';

// Mock the API module and Swal
vi.mock('../../api');
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

interface TeamData {
  id: number;
  name: string;
  logo: string;
  logoPreview: string;
}

interface GroupData {
  name: string;
  teams: TeamData[];
}

describe('TeamSetup.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamSetup>>;

  beforeEach(() => {
    store.resetState();
    store.state.config.id = 'test-tournament';
    store.state.config.numGroups = 2;
    store.state.config.teamsPerGroup = 2;
    wrapper = mount(TeamSetup);
  });

  afterEach(() => {
    vi.clearAllMocks();
    wrapper.unmount();
  });

  it('should render the correct number of groups and teams on mount', async () => {
    await wrapper.vm.$nextTick(); // Wait for onMounted hook

    const groupContainers = wrapper.findAll('.group-container');
    expect(groupContainers.length).toBe(2);

    const teamInputs = wrapper.findAll('.team-name-input');
    expect(teamInputs.length).toBe(4);

    // Check default group and team names
    expect(wrapper.find<HTMLInputElement>('.group-name-input').element.value).toBe(
      'Gruppe A'
    );
    expect(teamInputs[0].element.value).toBe('Team A1');
  });

  it('should update team name when user types in an input', async () => {
    await wrapper.vm.$nextTick();

    const firstTeamInput = wrapper.find('.team-name-input');
    await firstTeamInput.setValue('New Awesome Team');

    const componentVm = wrapper.vm as { groups: GroupData[] };
    expect(componentVm.groups[0].teams[0].name).toBe('New Awesome Team');
  });

  it('should call setEditingConfig when "Konfiguration bearbeiten" is clicked', async () => {
    await wrapper.vm.$nextTick();
    const storeSpy = vi.spyOn(store, 'setEditingConfig');

    const editButton = wrapper.find('button.bg-gray-500'); // Find by color class
    await editButton.trigger('click');

    expect(storeSpy).toHaveBeenCalledWith(true);
  });

  describe('start method', () => {
    it('should call startTournament API with correct data on success', async () => {
      await wrapper.vm.$nextTick();

      // Customize team names for the test
      const componentVm = wrapper.vm as { groups: GroupData[] };
      componentVm.groups[0].teams[0].name = 'Team One';
      componentVm.groups[1].teams[1].name = 'Team Four';

      const startTournamentSpy = vi
        .spyOn(api, 'startTournament')
        .mockResolvedValue({} as Tournament);
      const storeSetStateSpy = vi.spyOn(store, 'setState');

      const startButton = wrapper.find('button.bg-blue-600');
      await startButton.trigger('click');

      expect(startTournamentSpy).toHaveBeenCalledWith('test-tournament', [
        { name: 'Team One', group: 'Gruppe A', logo: '' },
        { name: 'Team A2', group: 'Gruppe A', logo: '' },
        { name: 'Team B1', group: 'Gruppe B', logo: '' },
        { name: 'Team Four', group: 'Gruppe B', logo: '' },
      ]);
      expect(storeSetStateSpy).toHaveBeenCalled();
    });

    it('should show an error and not call API if a team name is blank', async () => {
      await wrapper.vm.$nextTick();
      const startTournamentSpy = vi.spyOn(api, 'startTournament');

      // Set a team name to be empty
      const componentVm = wrapper.vm as { groups: GroupData[] };
      componentVm.groups[0].teams[0].name = '';

      const startButton = wrapper.find('button.bg-blue-600');
      await startButton.trigger('click');

      expect(startTournamentSpy).not.toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Fehler',
        'Bitte geben Sie allen Teams einen Namen.',
        'error'
      );
    });
  });
});
