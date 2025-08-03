import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../store'
import type { Tournament } from '../types'

describe('store', () => {
  beforeEach(() => {
    store.resetState()
  })

  it('should have a default state', () => {
    expect(store.state.status).toBe('config')
    expect(store.state.isLoading).toBe(false)
    expect(store.state.isReadOnly).toBe(false)
  })

  it('setReadOnly should update isReadOnly', () => {
    store.setReadOnly(true)
    expect(store.state.isReadOnly).toBe(true)
  })

  it('setLoading should update isLoading', () => {
    store.setLoading(true)
    expect(store.state.isLoading).toBe(true)
  })

  it('setEditingConfig should update isEditingConfig', () => {
    store.setEditingConfig(true)
    expect(store.state.isEditingConfig).toBe(true)
  })

  it('resetState should reset the state', () => {
    store.setLoading(true)
    store.resetState()
    expect(store.state.isLoading).toBe(false)
  })

  it('setState should update the state', () => {
    const newTournament: Partial<Tournament> = {
      status: 'playing',
      currentRound: 1
    }
    store.setState(newTournament as Tournament)
    expect(store.state.status).toBe('playing')
    expect(store.state.currentRound).toBe(1)
  })
})
