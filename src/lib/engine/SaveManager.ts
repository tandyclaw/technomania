/**
 * SaveManager.ts — Auto-save, manual save/load, import/export
 * Uses IndexedDB for persistent local storage
 */

import type { GameState } from '$lib/stores/gameState';

const DB_NAME = 'technomania';
const DB_VERSION = 1;
const STORE_NAME = 'saves';
const AUTO_SAVE_KEY = 'autosave';

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
	});
}

export async function saveGame(state: GameState, key = AUTO_SAVE_KEY): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);

		const saveData = {
			...state,
			lastSaved: Date.now()
		};

		const request = store.put(JSON.stringify(saveData), key);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function loadGame(key = AUTO_SAVE_KEY): Promise<GameState | null> {
	try {
		const db = await openDB();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readonly');
			const store = tx.objectStore(STORE_NAME);
			const request = store.get(key);

			request.onsuccess = () => {
				if (request.result) {
					resolve(JSON.parse(request.result));
				} else {
					resolve(null);
				}
			};
			request.onerror = () => reject(request.error);
		});
	} catch {
		return null;
	}
}

export function exportSave(state: GameState): string {
	return btoa(JSON.stringify(state));
}

export function importSave(encoded: string): GameState | null {
	try {
		return JSON.parse(atob(encoded));
	} catch {
		return null;
	}
}

export async function deleteSave(key = AUTO_SAVE_KEY): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.delete(key);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}
