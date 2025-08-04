<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
    <h2 class="text-2xl font-bold mb-4 text-center">{{ groupName }}</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th class="table-cell">#</th>
            <th class="table-cell table-cell-name" colspan="2">Team</th>
            <th class="table-cell">Sp</th>
            <th class="table-cell">S</th>
            <th class="table-cell">U</th>
            <th class="table-cell">N</th>
            <th class="table-cell">Tore</th>
            <th class="table-cell">TD</th>
            <th class="table-cell">Pkt</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(team, index) in sortedTeams"
            :key="team.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td class="table-cell font-medium text-gray-900 dark:text-white">
              {{ index + 1 }}
            </td>
            <td class="table-cell" style="width: 40px">
              <img
                :src="team.logo"
                :alt="`${team.name} Logo`"
                class="w-8 h-8 rounded-full object-cover mx-auto"
              />
            </td>
            <td
              class="table-cell table-cell-name font-medium text-gray-900 dark:text-white"
            >
              {{ team.name }}
            </td>
            <td class="table-cell">{{ team.played }}</td>
            <td class="table-cell">{{ team.wins }}</td>
            <td class="table-cell">{{ team.draws }}</td>
            <td class="table-cell">{{ team.losses }}</td>
            <td class="table-cell">
              {{ team.goalsFor }}:{{ team.goalsAgainst }}
            </td>
            <td class="table-cell">
              {{ team.goalDifference > 0 ? '+' : '' }}{{ team.goalDifference }}
            </td>
            <td class="table-cell font-bold text-gray-900 dark:text-white">
              {{ team.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store } from '../store';
import type { Team } from '../types';

const props = defineProps<{
  groupName: string | number;
  teamIds: number[];
}>();

const { state } = store;

const sortedTeams = computed(() => {
  return props.teamIds
    .map((id) => state.teams.find((t) => t.id === id)!)
    .filter(Boolean) // Filter out undefined teams
    .sort(
      (a: Team, b: Team) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.name.localeCompare(b.name)
    );
});
</script>
