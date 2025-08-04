<template>
  <div class="w-full max-w-7xl mx-auto">
    <div v-if="state.isLoading" class="text-center p-8">
      <p class="text-xl text-gray-500 dark:text-gray-400 animate-pulse">
        Turnier wird geladen...
      </p>
    </div>
    <TournamentConfig
      v-else-if="state.status === 'config' || state.isEditingConfig"
    />
    <TeamSetup v-else-if="state.status === 'setup'" />
    <TournamentView
      v-else-if="state.status === 'playing' || state.status === 'finished'"
    />
    <div
      v-else-if="state.status === 'error'"
      class="text-center bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow-md"
    >
      <h2 class="text-xl font-bold text-red-800 dark:text-red-200">
        Fehler 404
      </h2>
      <p class="text-red-700 dark:text-red-300 mt-2">
        Das angeforderte Turnier konnte nicht gefunden werden. Bitte überprüfen
        Sie den Link.
      </p>
      <a
        href="/"
        class="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >Zur Startseite</a
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { store } from './store';
import TournamentConfig from './components/TournamentConfig.vue';
import TeamSetup from './components/TeamSetup.vue';
import TournamentView from './components/TournamentView.vue';

const { state } = store;
</script>
