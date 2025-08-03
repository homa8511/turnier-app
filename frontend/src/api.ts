import Swal from 'sweetalert2';
import type { Tournament, TournamentConfig } from './types';

const API_URL = '/api';

// Korrigiert: Der Rückgabetyp ist jetzt 'unknown', um 'any' zu vermeiden.
// Die aufrufenden Funktionen müssen den Typ explizit umwandeln.
async function handleResponse(response: Response): Promise<unknown> {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ein Serverfehler ist aufgetreten.');
    }
    return response.json();
}

export async function createTournament(config: Omit<TournamentConfig, 'id'>): Promise<Tournament> {
    const response = await fetch(`${API_URL}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
    });
    return handleResponse(response) as Promise<Tournament>;
}

export async function startTournament(id: string, teams: { name: string; group: string; logo: string }[]): Promise<Tournament> {
    const response = await fetch(`${API_URL}/tournaments/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams }),
    });
    return handleResponse(response) as Promise<Tournament>;
}

export async function recordResult(id: string, result: { roundNumber: number, team1Id: number, team2Id: number, score1: number, score2: number }): Promise<Tournament> {
    const response = await fetch(`${API_URL}/tournaments/${id}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
    });
    return handleResponse(response) as Promise<Tournament>;
}

export async function generateNextRound(id: string): Promise<Tournament> {
    const response = await fetch(`${API_URL}/tournaments/${id}/next-round`, {
        method: 'POST',
    });
    return handleResponse(response) as Promise<Tournament>;
}

export async function updateTournamentConfig(id: string, config: Partial<Omit<TournamentConfig, 'id'>>): Promise<Tournament> {
    const response = await fetch(`${API_URL}/tournaments/${id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
    });
    return handleResponse(response) as Promise<Tournament>;
}

export async function loadTournament(id: string): Promise<Tournament | null> {
    if (!id) {
        Swal.fire('Fehler', 'Bitte geben Sie eine Turnier-ID ein.', 'warning');
        return null;
    }
    try {
        const response = await fetch(`${API_URL}/tournaments/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                Swal.fire('Fehler', `Kein Turnier mit der ID "${id}" gefunden.`, 'error');
            } else {
                Swal.fire('Fehler', 'Ein unbekannter Fehler ist aufgetreten.', 'error');
            }
            return null;
        }
        return await response.json() as Tournament;
    } catch (e) {
        console.error("Laden fehlgeschlagen:", e);
        Swal.fire('Fehler', 'Die Turnierdaten konnten nicht vom Server geladen werden.', 'error');
        return null;
    }
}