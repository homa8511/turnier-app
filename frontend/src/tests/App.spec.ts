import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';
import { store } from '../store';
import TournamentConfig from '../components/TournamentConfig.vue';
import TeamSetup from '../components/TeamSetup.vue';
import TournamentView from '../components/TournamentView.vue';

describe('App.vue', () => {
  beforeEach(() => {
    store.resetState();
  });

  it('should render TournamentConfig when status is "config"', () => {
    store.state.status = 'config';
    const wrapper = mount(App);
    expect(wrapper.findComponent(TournamentConfig).exists()).toBe(true);
    expect(wrapper.findComponent(TeamSetup).exists()).toBe(false);
    expect(wrapper.findComponent(TournamentView).exists()).toBe(false);
  });

  it('should render TournamentConfig when isEditingConfig is true', () => {
    store.state.status = 'playing'; // A different status
    store.state.isEditingConfig = true;
    const wrapper = mount(App);
    expect(wrapper.findComponent(TournamentConfig).exists()).toBe(true);
  });

  it('should render TeamSetup when status is "setup"', () => {
    store.state.status = 'setup';
    const wrapper = mount(App);
    expect(wrapper.findComponent(TournamentConfig).exists()).toBe(false);
    expect(wrapper.findComponent(TeamSetup).exists()).toBe(true);
    expect(wrapper.findComponent(TournamentView).exists()).toBe(false);
  });

  it('should render TournamentView when status is "playing"', () => {
    store.state.status = 'playing';
    const wrapper = mount(App);
    expect(wrapper.findComponent(TournamentView).exists()).toBe(true);
  });

  it('should render TournamentView when status is "finished"', () => {
    store.state.status = 'finished';
    const wrapper = mount(App);
    expect(wrapper.findComponent(TournamentView).exists()).toBe(true);
  });

  it('should render the loading indicator when isLoading is true', () => {
    store.state.isLoading = true;
    const wrapper = mount(App);
    expect(wrapper.find('.animate-pulse').exists()).toBe(true);
    expect(wrapper.text()).toContain('Turnier wird geladen...');
  });

  it('should render the error message when status is "error"', () => {
    store.state.status = 'error';
    const wrapper = mount(App);
    expect(wrapper.find('.bg-red-100').exists()).toBe(true);
    expect(wrapper.text()).toContain('Fehler 404');
  });
});
