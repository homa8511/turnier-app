<template>
  <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
    <h1
      class="text-3xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400"
    >
      {{ isEditing ? 'Konfiguration bearbeiten' : 'Neues Turnier erstellen' }}
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="md:col-span-2">
        <label
          for="tournament-name"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Turniername</label
        >
        <input
          id="tournament-name"
          v-model="state.config.tournamentName"
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div class="md:col-span-2">
        <label
          for="tournament-image-upload"
          class="block mb-2 text-sm font-medium"
          >Turnierbild (optional)</label
        >
        <div class="mt-1 flex items-center gap-4">
          <img
            :src="imagePreview"
            alt="Vorschau"
            class="h-16 w-32 object-cover rounded-md bg-gray-100 dark:bg-gray-700"
          />
          <label
            for="tournament-image-upload"
            class="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <span>Bild ändern</span>
            <input
              id="tournament-image-upload"
              name="tournament-image-upload"
              type="file"
              class="sr-only"
              accept="image/jpeg, image/webp"
              @change="handleImageUpload"
            />
          </label>
        </div>
      </div>

      <div
        class="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4"
      >
        <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Spielort
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="location-name"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Name des Ortes</label
            >
            <input
              id="location-name"
              v-model="state.config.location.name"
              type="text"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              for="location-address"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Adresse</label
            >
            <input
              id="location-address"
              v-model="state.config.location.address"
              type="text"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      <div class="md:col-span-2">
        <label
          for="description-editor"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >Beschreibung (optional)</label
        >
        <RichTextEditor
          id="description-editor"
          v-model="state.config.description"
        />
      </div>

      <div
        class="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4"
      >
        <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Turnierdetails
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label
              for="num-groups"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Gruppen</label
            >
            <input
              id="num-groups"
              v-model="state.config.numGroups"
              type="number"
              min="1"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              for="teams-per-group"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Teams/Gr.</label
            >
            <input
              id="teams-per-group"
              v-model="state.config.teamsPerGroup"
              type="number"
              min="2"
              step="2"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              for="num-fields"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Felder</label
            >
            <input
              id="num-fields"
              v-model="state.config.numFields"
              type="number"
              min="1"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              for="match-duration"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Dauer (Min)</label
            >
            <input
              id="match-duration"
              v-model="state.config.matchDuration"
              type="number"
              min="1"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              for="pause-duration"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Pause (Min)</label
            >
            <input
              id="pause-duration"
              v-model="state.config.pauseDuration"
              type="number"
              min="0"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label
              for="start-date"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Datum</label
            >
            <input
              id="start-date"
              v-model="state.config.startDate"
              type="date"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div class="md:col-span-2">
            <label
              for="start-time"
              class="block mb-1 text-xs text-gray-700 dark:text-gray-400"
              >Startzeit</label
            >
            <input
              id="start-time"
              v-model="state.config.startTime"
              type="time"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="mt-8 text-center">
      <button
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
        @click="handleAction"
      >
        {{ isEditing ? 'Änderungen speichern' : 'Weiter zur Teameingabe' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store } from '../store';
import { createTournament, updateTournamentConfig } from '../api';
import RichTextEditor from './RichTextEditor.vue';
import Swal from 'sweetalert2';

const { state } = store;
const isEditing = computed(() => store.state.isEditingConfig);
const defaultImage = 'https://placehold.co/128x64/E2E8F0/4A5568?text=Bild';

const imagePreview = computed(() => state.config.imageUrl || defaultImage);

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    Swal.fire(
      'Fehler',
      'Ungültiger Dateityp. Bitte nur JPG oder WEBP.',
      'error'
    );
    return;
  }
  if (file.size > 1 * 1024 * 1024) {
    // 1MB
    Swal.fire('Fehler', 'Datei zu groß. Max. 1MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    state.config.imageUrl = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

async function handleAction() {
  if (isEditing.value) {
    await saveChanges();
  } else {
    await goToTeamSetup();
  }
}

async function goToTeamSetup() {
  store.setLoading(true);
  try {
    const newTournamentState = await createTournament(state.config);
    store.setState(newTournamentState);
    window.history.pushState(
      {},
      '',
      `/host/event/${newTournamentState.config.id}`
    );
  } catch (error) {
    if (error instanceof Error) {
      Swal.fire('Fehler', error.message, 'error');
    } else {
      Swal.fire('Fehler', 'Ein unbekannter Fehler ist aufgetreten.', 'error');
    }
  } finally {
    store.setLoading(false);
  }
}

async function saveChanges() {
  store.setLoading(true);
  try {
    if (!state.config.id)
      throw new Error('Keine Turnier-ID zum Speichern vorhanden.');
    const updatedTournament = await updateTournamentConfig(
      state.config.id,
      state.config
    );
    store.setState(updatedTournament);
    store.setEditingConfig(false);
  } catch (error) {
    if (error instanceof Error) {
      Swal.fire('Fehler', error.message, 'error');
    } else {
      Swal.fire('Fehler', 'Ein unbekannter Fehler ist aufgetreten.', 'error');
    }
  } finally {
    store.setLoading(false);
  }
}
</script>
