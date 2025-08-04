<template>
  <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
    <h1
      class="text-3xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400"
    >
      2. Team-Eingabe
    </h1>
    <div class="space-y-8">
      <div
        v-for="(group, index) in groups"
        :key="index"
        class="group-container border-t-2 pt-6 border-gray-200 dark:border-gray-700"
      >
        <div class="mb-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Gruppenname (optional)</label
          >
          <input
            v-model="group.name"
            type="text"
            class="group-name-input bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="team in group.teams"
            :key="team.id"
            class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"
          >
            <label class="logo-upload-label">
              <img
                :src="team.logoPreview"
                alt="Team Logo"
                class="w-10 h-10 rounded-full object-cover"
              />
              <input
                type="file"
                class="hidden"
                accept="image/jpeg, image/webp"
                @change="(event) => handleImageUpload(event, team)"
              />
            </label>
            <input
              v-model="team.name"
              type="text"
              class="team-name-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="mt-8 flex flex-col md:flex-row gap-4 justify-center">
      <button
        class="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg"
        @click="editConfig"
      >
        Konfiguration bearbeiten
      </button>
      <button
        class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
        @click="start"
      >
        Turnier starten
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { store } from '../store';
import { startTournament } from '../api';
import Swal from 'sweetalert2';

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

const { state } = store;
const groups = ref<GroupData[]>([]);

onMounted(() => {
  let teamCounter = 0;
  for (let i = 0; i < state.config.numGroups; i++) {
    const groupName = `Gruppe ${String.fromCharCode(65 + i)}`;
    const placeholderChar = groupName.charAt(groupName.length - 1);
    const placeholderLogo = `https://placehold.co/40x40/E2E8F0/4A5568?text=${placeholderChar}`;

    const group: GroupData = {
      name: groupName,
      teams: [],
    };

    for (let j = 0; j < state.config.teamsPerGroup; j++) {
      group.teams.push({
        id: teamCounter,
        name: `Team ${placeholderChar}${j + 1}`,
        logo: '',
        logoPreview: placeholderLogo,
      });
      teamCounter++;
    }
    groups.value.push(group);
  }
});

function handleImageUpload(event: Event, team: TeamData) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    team.logo = e.target?.result as string;
    team.logoPreview = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function editConfig() {
  store.setEditingConfig(true);
}

async function start() {
  store.setLoading(true);
  try {
    if (!state.config.id) throw new Error('Keine Turnier-ID vorhanden.');

    const teamsToStart = groups.value.flatMap((group) =>
      group.teams.map((team) => ({
        name: team.name,
        group: group.name,
        logo: team.logo,
      }))
    );

    if (teamsToStart.some((t) => !t.name)) {
      throw new Error('Bitte geben Sie allen Teams einen Namen.');
    }

    const startedTournament = await startTournament(
      state.config.id,
      teamsToStart
    );
    store.setState(startedTournament);
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
