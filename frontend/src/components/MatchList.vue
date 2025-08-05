<template>
  <div>
    <div
      v-if="state.matchViewMode === 'group'"
      class="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div v-for="(group, name) in matchesByGroup" :key="name">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 class="text-xl font-bold mb-4 text-center">
            Spiele - {{ name }}
          </h3>
          <div v-if="group.length === 0" class="text-center text-gray-500">
            Keine Spiele.
          </div>
          <MatchCard
            v-for="match in group"
            :key="`${match.team1Id}-${match.team2Id}`"
            :match="match"
            @save="save"
            @edit="edit"
          />
        </div>
      </div>
    </div>
    <div v-else class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h3 class="text-xl font-bold mb-4 text-center">
        Chronologischer Spielplan
      </h3>
      <div
        v-if="chronologicalMatches.length === 0"
        class="text-center text-gray-500"
      >
        Keine Spiele.
      </div>
      <MatchCard
        v-for="match in chronologicalMatches"
        :key="`${match.team1Id}-${match.team2Id}`"
        :match="match"
        @save="save"
        @edit="edit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store } from '../store';
import { recordResult } from '../api';
import type { Match } from '../types';
import MatchCard from './MatchCard.vue';
import Swal from 'sweetalert2';

const { state } = store;

const currentRoundData = computed(() =>
  state.rounds.find((r) => r.roundNumber === state.viewingRound)
);

const matchesByGroup = computed(() => {
  if (!currentRoundData.value) return {};

  const grouped: { [key: string]: Match[] } = {};
  for (const groupName in state.groups) {
    grouped[groupName] = [];
  }

  for (const match of currentRoundData.value.matches) {
    const team1 = state.teams.find((t) => t.id === match.team1Id);
    if (team1) {
      grouped[team1.group].push(match);
    }
  }

  for (const groupName in grouped) {
    grouped[groupName].sort(
      (a, b) =>
        (a.startTime?.getTime() ?? 0) - (b.startTime?.getTime() ?? 0) ||
        (a.field ?? 0) - (b.field ?? 0)
    );
  }

  return grouped;
});

const chronologicalMatches = computed(() => {
  if (!currentRoundData.value) return [];
  return [...currentRoundData.value.matches].sort(
    (a, b) =>
      (a.startTime?.getTime() ?? 0) - (b.startTime?.getTime() ?? 0) ||
      (a.field ?? 0) - (b.field ?? 0)
  );
});

async function save(match: Match) {
  store.setLoading(true);
  try {
    if (!state.config.id) throw new Error('Keine Turnier-ID vorhanden.');
    const score1Input = document.getElementById(
      `score-${match.team1Id}-vs-${match.team2Id}-1`
    ) as HTMLInputElement;
    const score2Input = document.getElementById(
      `score-${match.team1Id}-vs-${match.team2Id}-2`
    ) as HTMLInputElement;

    const result = {
      roundNumber: state.currentRound,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      score1: parseInt(score1Input.value),
      score2: parseInt(score2Input.value),
    };

    const updatedTournament = await recordResult(state.config.id, result);
    store.setState(updatedTournament);
  } catch (error) {
    if (error instanceof Error) {
      void Swal.fire('Fehler', error.message, 'error');
    } else {
      void Swal.fire('Fehler', 'Ein unbekannter Fehler ist aufgetreten.', 'error');
    }
  } finally {
    store.setLoading(false);
  }
}

function edit(match: Match) {
  const score1Input = document.getElementById(
    `score-${match.team1Id}-vs-${match.team2Id}-1`
  ) as HTMLInputElement;
  const score2Input = document.getElementById(
    `score-${match.team1Id}-vs-${match.team2Id}-2`
  ) as HTMLInputElement;
  score1Input.disabled = false;
  score2Input.disabled = false;
}

defineExpose({
  matchesByGroup,
  chronologicalMatches,
});
</script>
