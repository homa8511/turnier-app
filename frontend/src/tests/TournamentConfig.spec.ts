import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TournamentConfig from '../components/TournamentConfig.vue'
import { store } from '../store'
import * as api from '../api'
import Swal from 'sweetalert2'

vi.mock('../api')
vi.mock('sweetalert2')

describe('TournamentConfig.vue', () => {
  beforeEach(() => {
    store.resetState()
    vi.clearAllMocks()
    document.execCommand = vi.fn()
  })

  it('renders "Neues Turnier erstellen" title when not editing', () => {
    store.state.isEditingConfig = false
    const wrapper = mount(TournamentConfig)
    expect(wrapper.find('h1').text()).toBe('Neues Turnier erstellen')
    expect(wrapper.find('button.bg-blue-600').text()).toBe('Weiter zur Teameingabe')
  })

  it('renders "Konfiguration bearbeiten" title when editing', () => {
    store.state.isEditingConfig = true
    const wrapper = mount(TournamentConfig)
    expect(wrapper.find('h1').text()).toBe('Konfiguration bearbeiten')
    expect(wrapper.find('button.bg-blue-600').text()).toBe('Änderungen speichern')
  })

  it('binds tournament name to store', async () => {
    const wrapper = mount(TournamentConfig)
    const input = wrapper.find('#tournament-name')
    await input.setValue('My Awesome Tournament')
    expect(store.state.config.tournamentName).toBe('My Awesome Tournament')
  })

  it('calls createTournament when not editing', async () => {
    store.state.isEditingConfig = false
    const mockCreateTournament = vi.mocked(api.createTournament).mockResolvedValue({} as any)
    const wrapper = mount(TournamentConfig)

    await wrapper.find('button.bg-blue-600').trigger('click')

    expect(mockCreateTournament).toHaveBeenCalledWith(store.state.config)
  })

  it('calls updateTournamentConfig when editing', async () => {
    store.state.isEditingConfig = true
    store.state.config.id = 'test-id'
    const mockUpdate = vi.mocked(api.updateTournamentConfig).mockResolvedValue({} as any)
    const wrapper = mount(TournamentConfig)

    await wrapper.find('button.bg-blue-600').trigger('click')

    expect(mockUpdate).toHaveBeenCalledWith('test-id', store.state.config)
    expect(store.state.isEditingConfig).toBe(false) // Should be reset
  })

  it('handles image upload', async () => {
    const wrapper = mount(TournamentConfig)

    // Mock FileReader
    const mockReader = {
      onload: vi.fn(),
      readAsDataURL: vi.fn().mockImplementation(function(this: any) {
        this.onload({ target: { result: 'data:image/jpeg;base64,mock' } })
      })
    }
    vi.stubGlobal('FileReader', vi.fn(() => mockReader))

    const component = wrapper.vm as any
    const file = new File([''], 'image.jpg', { type: 'image/jpeg' })
    const event = { target: { files: [file] } }
    component.handleImageUpload(event)

    await wrapper.vm.$nextTick()

    expect(store.state.config.imageUrl).toBe('data:image/jpeg;base64,mock')
    expect(wrapper.find('img').attributes('src')).toBe('data:image/jpeg;base64,mock')
  })

  it('shows error on failed createTournament', async () => {
    store.state.isEditingConfig = false
    vi.mocked(api.createTournament).mockRejectedValue(new Error('API Error'))
    const wrapper = mount(TournamentConfig)

    await wrapper.find('button.bg-blue-600').trigger('click')

    expect(Swal.fire).toHaveBeenCalledWith('Fehler', 'API Error', 'error')
  })
})
