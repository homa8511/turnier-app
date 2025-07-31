<template>
    <div v-if="state.config" class="w-full">
        <header class="text-center mb-8">
            <div v-if="state.config.imageUrl" class="mb-6">
                <img :src="state.config.imageUrl" alt="Turnierbild" class="w-full h-48 md:h-64 object-cover rounded-xl shadow-lg">
            </div>
            <h1 id="display-tournament-name" class="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">{{ state.config.tournamentName }}</h1>
            <div id="display-location" class="mt-2 text-md text-gray-500 dark:text-gray-400" v-if="state.config.location && state.config.location.name">
                {{ state.config.location.name }} - {{ state.config.location.address }}
            </div>
            <!-- Die Verwendung von v-html ist hier sicher, da der Inhalt vom Organisator stammt -->
            <div v-if="state.config.description" class="prose prose-sm dark:prose-invert max-w-none mx-auto mt-4 text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg" v-html="state.config.description">
            </div>
            <div class="mt-4 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <span>Turnier-ID: <strong class="select-all">{{ state.config.id }}</strong></span>
                <div class="flex gap-2">
                    <button class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600" @click="copyLink('host')">Admin-Link kopieren</button>
                    <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600" @click="copyLink('readonly')">Zuschauer-Link kopieren</button>
                </div>
            </div>
            <div id="round-navigation" class="flex items-center justify-center mt-2 text-2xl text-gray-600 dark:text-gray-300">
                <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed" :disabled="state.viewingRound <= 1" @click="navigateRounds('prev')">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 class="mx-4">Runde <span class="font-bold">{{ state.viewingRound }}</span></h2>
                <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed" :disabled="state.viewingRound >= state.currentRound" @click="navigateRounds('next')">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </header>

        <div v-if="isViewingPast" class="text-center bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 mb-6 rounded-md">
            <p>Sie betrachten eine vergangene Runde. Die Ergebnisse sind schreibgeschützt.</p>
        </div>
        
        <div id="view-mode-toggle" class="flex justify-center mb-6">
            <div class="inline-flex rounded-md shadow-sm" role="group">
                <button type="button" class="view-mode-btn px-4 py-2 text-sm font-medium" :class="{'view-mode-btn-active': state.matchViewMode === 'group'}" @click="setMatchViewMode('group')">
                    Nach Gruppen
                </button>
                <button type="button" class="view-mode-btn px-4 py-2 text-sm font-medium" :class="{'view-mode-btn-active': state.matchViewMode === 'chrono'}" @click="setMatchViewMode('chrono')">
                    Chronologisch
                </button>
            </div>
        </div>

        <MatchList />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <StandingsTable v-for="(teamIds, name) in state.groups" :key="name" :group-name="name" :team-ids="teamIds" />
        </div>
        
        <div v-if="!state.isReadOnly" id="action-button-container" class="mt-8 text-center">
            <button id="action-button" :class="actionButtonClass" :disabled="isActionButtonDisabled" @click="handleActionButtonClick">
                {{ actionButtonText }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { store } from '../store';
import { generateNextRound } from '../api';
import StandingsTable from './StandingsTable.vue';
import MatchList from './MatchList.vue';
import Swal from 'sweetalert2';

const { state } = store;

const isViewingPast = computed(() => state.viewingRound < state.currentRound);

const isActionButtonDisabled = computed(() => {
    if (isViewingPast.value) return false;
    const currentRoundData = state.rounds.find(r => r.roundNumber === state.currentRound);
    if (!currentRoundData) return true;
    return !currentRoundData.matches.every(m => m.score1 !== null);
});

const actionButtonText = computed(() => {
    if (isViewingPast.value) return 'Zurück zur aktuellen Runde';
    const maxRounds = state.config.teamsPerGroup - 1;
    if (state.currentRound >= maxRounds) return 'Turnier beenden';
    return `Runde ${state.currentRound + 1} generieren`;
});

const actionButtonClass = computed(() => {
    const base = 'text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105';
    if (isViewingPast.value) return `${base} bg-blue-600 hover:bg-blue-700`;
    if (isActionButtonDisabled.value) return `${base} bg-gray-400 cursor-not-allowed opacity-50`;
    return `${base} bg-green-600 hover:bg-green-700`;
});

function navigateRounds(direction: 'prev' | 'next') {
    if (direction === 'prev' && state.viewingRound > 1) {
        state.viewingRound--;
    } else if (direction === 'next' && state.viewingRound < state.currentRound) {
        state.viewingRound++;
    }
}

function setMatchViewMode(mode: 'group' | 'chrono') {
    state.matchViewMode = mode;
}

async function handleActionButtonClick() {
    if (isViewingPast.value) {
        state.viewingRound = state.currentRound;
        return;
    }
    
    store.setLoading(true);
    try {
        if (!state.config.id) throw new Error("Keine Turnier-ID vorhanden.");
        const updatedTournament = await generateNextRound(state.config.id);
        store.setState(updatedTournament);
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

function copyLink(mode: 'host' | 'readonly') {
    const id = state.config.id;
    if (!id) return;

    let textToCopy: string;
    let successMessage: string;

    if (mode === 'readonly') {
        textToCopy = `${window.location.origin}/event/${id}`;
        successMessage = 'Zuschauer-Link kopiert!';
    } else {
        textToCopy = `${window.location.origin}/host/event/${id}`;
        successMessage = 'Admin-Link kopiert!';
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: successMessage,
            showConfirmButton: false,
            timer: 2000
        });
    });
}
</script>