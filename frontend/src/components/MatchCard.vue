<template>
    <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 mb-3">
        <div class="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
            Feld {{ match.field }} | {{ formatTime(match.startTime) }} - {{ formatTime(match.endTime) }} Uhr | {{ team1.group }}
        </div>
        <div class="grid grid-cols-[auto,1fr,auto,1fr,auto] items-center gap-x-3 gap-y-2">
            <img :src="team1.logo" :alt="`${team1.name} Logo`" class="w-7 h-7 rounded-full object-cover">
            <span class="font-medium text-right truncate" :title="team1.name">{{ team1.name }}</span>
            <div class="flex items-center gap-1">
                <input :id="`score-${team1.id}-vs-${team2.id}-1`" type="number" min="0" class="w-14 text-center font-bold bg-white dark:bg-gray-600 border rounded-md" :value="match.score1 ?? ''" :disabled="isFinished || isReadOnly">
                <span>:</span>
                <input :id="`score-${team1.id}-vs-${team2.id}-2`" type="number" min="0" class="w-14 text-center font-bold bg-white dark:bg-gray-600 border rounded-md" :value="match.score2 ?? ''" :disabled="isFinished || isReadOnly">
            </div>
            <span class="font-medium text-left truncate" :title="team2.name">{{ team2.name }}</span>
            <img :src="team2.logo" :alt="`${team2.name} Logo`" class="w-7 h-7 rounded-full object-cover">
        </div>
         <div v-if="!isReadOnly" class="flex justify-end mt-2 h-8">
            <button v-if="isFinished" class="edit-match-btn text-white text-xs font-bold py-2 px-3 rounded-md transition-colors bg-yellow-500 hover:bg-yellow-600" @click="emit('edit', match)">Editieren</button>
            <button v-else class="save-match-btn text-white text-xs font-bold py-2 px-3 rounded-md transition-colors bg-blue-500 hover:bg-blue-600" @click="emit('save', match)">Speichern</button>
         </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store } from '../store';
import type { Match } from '../types';

const props = defineProps<{
  match: Match
}>();

const emit = defineEmits<{
  (e: 'save', match: Match): void
  (e: 'edit', match: Match): void
}>();

const { state } = store;

const team1 = computed(() => state.teams.find(t => t.id === props.match.team1Id)!);
const team2 = computed(() => state.teams.find(t => t.id === props.match.team2Id)!);
const isFinished = computed(() => props.match.score1 !== null);
const isReadOnly = computed(() => state.isReadOnly || state.viewingRound < state.currentRound);

const formatTime = (date?: Date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};
</script>