import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { store } from './store';
import { loadTournament } from './api';

async function initializeApp() {
  const path = window.location.pathname;

  const hostRegex = /^\/host\/event\/([a-zA-Z0-9-]+)/;
  const viewRegex = /^\/event\/([a-zA-Z0-9-]+)/;

  const hostMatch = path.match(hostRegex);
  const viewMatch = path.match(viewRegex);

  let tournamentId: string | null = null;
  let isReadOnly = false;

  if (hostMatch) {
    tournamentId = hostMatch[1];
    isReadOnly = false;
  } else if (viewMatch) {
    tournamentId = viewMatch[1];
    isReadOnly = true;
  }

  if (tournamentId) {
    store.setReadOnly(isReadOnly);
    store.setLoading(true);
    const loadedState = await loadTournament(tournamentId);
    if (loadedState) {
      store.setState(loadedState);
    } else {
      store.state.status = 'error';
    }
    store.setLoading(false);
  }

  createApp(App).mount('#app');
}

initializeApp();
