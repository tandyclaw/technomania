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
		const idbResult = await new Promise<GameState | null>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readonly');
			const store = tx.objectStore(STORE_NAME);
			const request = store.get(key);

			request.onsuccess = () => {
				if (request.result) {
					try {
						resolve(JSON.parse(request.result));
					} catch {
						resolve(null);
					}
				} else {
					resolve(null);
				}
			};
			request.onerror = () => reject(request.error);
		});

		if (idbResult) {
			// Clean up emergency save if we have a good IDB save
			try { localStorage.removeItem('technomania_emergency_save'); } catch { /* ignore */ }
			return idbResult;
		}

		// Fall back to emergency localStorage save (from beforeunload)
		try {
			const emergency = localStorage.getItem('technomania_emergency_save');
			if (emergency) {
				const parsed = JSON.parse(emergency) as GameState;
				localStorage.removeItem('technomania_emergency_save');
				// Persist the recovered save to IndexedDB
				await saveGame(parsed, key);
				return parsed;
			}
		} catch {
			// Emergency save corrupted — ignore
		}

		return null;
	} catch {
		// IndexedDB completely failed — try emergency save
		try {
			const emergency = localStorage.getItem('technomania_emergency_save');
			if (emergency) {
				const parsed = JSON.parse(emergency) as GameState;
				localStorage.removeItem('technomania_emergency_save');
				return parsed;
			}
		} catch { /* ignore */ }
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
