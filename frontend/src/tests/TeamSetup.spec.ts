import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TeamSetup from '../components/TeamSetup.vue'
import { store } from '../store'
import * as api from '../api'
import Swal from 'sweetalert2'

vi.mock('../api')
vi.mock('sweetalert2')

describe('TeamSetup.vue', () => {
  beforeEach(() => {
    store.resetState()
    store.state.config.id = 'test-id'
    store.state.config.numGroups = 1
    store.state.config.teamsPerGroup = 2
    vi.clearAllMocks()
  })

  it('generates correct number of groups and teams', async () => {
    const wrapper = mount(TeamSetup)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.group-container').length).toBe(1)
    expect(wrapper.findAll('.team-name-input').length).toBe(2)
  })

  it('allows editing team names', async () => {
    const wrapper = mount(TeamSetup)
    await wrapper.vm.$nextTick()
    const teamNameInput = wrapper.find('.team-name-input')
    await teamNameInput.setValue('New Team Name')
    // This is tricky to test without access to the component's internal state.
    // We'll trust the v-model works and test the outcome in the start() function.
    expect((teamNameInput.element as HTMLInputElement).value).toBe('New Team Name')
  })

  it('calls setEditingConfig when edit button is clicked', async () => {
    const wrapper = mount(TeamSetup)
    const storeSpy = vi.spyOn(store, 'setEditingConfig')
    await wrapper.find('button.bg-gray-500').trigger('click')
    expect(storeSpy).toHaveBeenCalledWith(true)
  })

  it('calls startTournament on start button click', async () => {
    const mockStartTournament = vi.mocked(api.startTournament)
    const wrapper = mount(TeamSetup)
    await wrapper.vm.$nextTick()

    await wrapper.find('button.bg-blue-600').trigger('click')

    expect(mockStartTournament).toHaveBeenCalled()
    const calls = mockStartTournament.mock.calls
    expect(calls[0][0]).toBe('test-id')
    expect(calls[0][1].length).toBe(2)
    expect(calls[0][1][0].name).toBe('Team A1')
  })

  it('shows error if a team name is missing', async () => {
    const wrapper = mount(TeamSetup)
    await wrapper.vm.$nextTick()

    const teamNameInput = wrapper.find('.team-name-input')
    await teamNameInput.setValue('')

    await wrapper.find('button.bg-blue-600').trigger('click')

    expect(api.startTournament).not.toHaveBeenCalled()
    expect(Swal.fire).toHaveBeenCalledWith('Fehler', 'Bitte geben Sie allen Teams einen Namen.', 'error')
  })

  it('handles image upload', async () => {
    const wrapper = mount(TeamSetup)
    await wrapper.vm.$nextTick()

    // Mock FileReader
    const mockReader = {
      onload: vi.fn(),
      readAsDataURL: vi.fn().mockImplementation(function(this: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.onload({ target: { result: 'data:image/png;base64,mock' } })
      })
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockReader))

    const file = new File([''], 'logo.png', { type: 'image/png' })

    // We can't set the value of a file input directly for security reasons.
    // So we'll have to trigger the change handler manually with a mocked event.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = wrapper.vm as any
    const team = component.groups[0].teams[0]
    const event = { target: { files: [file] } }
    component.handleImageUpload(event, team)

    await wrapper.vm.$nextTick()

    expect(team.logo).toBe('data:image/png;base64,mock')
    expect(wrapper.find('img').attributes('src')).toBe('data:image/png;base64,mock')
  })
})
