/**
 * SaveManager.ts — Auto-save, manual save/load, import/export
 * Uses IndexedDB for persistent local storage
 * All DB connections are properly closed after each operation
 *
 * Hardened with:
 * - Checksum validation to detect corruption
 * - Rotating backup snapshots (last 3 saves)
 * - Backup listing & restore
 * - Cloud save stub interface
 */

import type { GameState } from '$lib/stores/gameState';

const DB_NAME = 'tech-tycoon';
const DB_VERSION = 2;
const STORE_NAME = 'saves';
const AUTO_SAVE_KEY = 'autosave';
const BACKUP_PREFIX = 'backup_';
const MAX_BACKUPS = 3;

/** Open timeout — if DB doesn't open within 3s, reject */
const OPEN_TIMEOUT_MS = 3000;

// ─── Checksum ───────────────────────────────────────────────

/** Simple FNV-1a 32-bit hash for corruption detection */
function fnv1aHash(str: string): string {
	let hash = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(16).padStart(8, '0');
}

export interface SaveEnvelope {
	checksum: string;
	version: number;
	savedAt: number;
	payload: string; // JSON-stringified GameState
}

function wrapSave(state: GameState): string {
	const payload = JSON.stringify(state);
	const envelope: SaveEnvelope = {
		checksum: fnv1aHash(payload),
		version: state.version ?? 0,
		savedAt: Date.now(),
		payload,
	};
	return JSON.stringify(envelope);
}

function unwrapSave(raw: string): { state: GameState; savedAt: number } | null {
	try {
		const parsed = JSON.parse(raw);

		// Legacy format: raw GameState without envelope
		if (!parsed.checksum && parsed.divisions) {
			return { state: parsed as GameState, savedAt: parsed.lastSaved ?? Date.now() };
		}

		const envelope = parsed as SaveEnvelope;
		const computedHash = fnv1aHash(envelope.payload);

		if (computedHash !== envelope.checksum) {
			console.warn('[SaveManager] Checksum mismatch! Save may be corrupted.', {
				expected: envelope.checksum,
				computed: computedHash,
			});
			// Still try to parse — let GameManager's isValidState decide
		}

		const state = JSON.parse(envelope.payload) as GameState;
		return { state, savedAt: envelope.savedAt };
	} catch {
		return null;
	}
}

// ─── IndexedDB ──────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error('IndexedDB open timed out'));
		}, OPEN_TIMEOUT_MS);

		try {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => {
				clearTimeout(timeout);
				reject(request.error);
			};

			request.onsuccess = () => {
				clearTimeout(timeout);
				resolve(request.result);
			};

			request.onblocked = () => {
				clearTimeout(timeout);
				reject(new Error('IndexedDB open blocked'));
			};

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME);
				}
			};
		} catch (err) {
			clearTimeout(timeout);
			reject(err);
		}
	});
}

async function dbPut(key: string, value: string): Promise<void> {
	let db: IDBDatabase | null = null;
	try {
		db = await openDB();
		return await new Promise((resolve, reject) => {
			const tx = db!.transaction(STORE_NAME, 'readwrite');
			const store = tx.objectStore(STORE_NAME);
			const request = store.put(value, key);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
			tx.oncomplete = () => db?.close();
			tx.onerror = () => db?.close();
		});
	} catch (err) {
		db?.close();
		throw err;
	}
}

async function dbGet(key: string): Promise<string | null> {
	let db: IDBDatabase | null = null;
	try {
		db = await openDB();
		return await new Promise((resolve, reject) => {
			const tx = db!.transaction(STORE_NAME, 'readonly');
			const store = tx.objectStore(STORE_NAME);
			const request = store.get(key);
			request.onsuccess = () => resolve(request.result ?? null);
			request.onerror = () => reject(request.error);
			tx.oncomplete = () => db?.close();
			tx.onerror = () => db?.close();
		});
	} catch (err) {
		db?.close();
		throw err;
	}
}

async function dbDelete(key: string): Promise<void> {
	let db: IDBDatabase | null = null;
	try {
		db = await openDB();
		return await new Promise((resolve, reject) => {
			const tx = db!.transaction(STORE_NAME, 'readwrite');
			const store = tx.objectStore(STORE_NAME);
			const request = store.delete(key);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
			tx.oncomplete = () => db?.close();
			tx.onerror = () => db?.close();
		});
	} catch (err) {
		db?.close();
		throw err;
	}
}

async function dbGetAllKeys(): Promise<string[]> {
	let db: IDBDatabase | null = null;
	try {
		db = await openDB();
		return await new Promise((resolve, reject) => {
			const tx = db!.transaction(STORE_NAME, 'readonly');
			const store = tx.objectStore(STORE_NAME);
			const request = store.getAllKeys();
			request.onsuccess = () => resolve((request.result as string[]) ?? []);
			request.onerror = () => reject(request.error);
			tx.oncomplete = () => db?.close();
			tx.onerror = () => db?.close();
		});
	} catch (err) {
		db?.close();
		return [];
	}
}

// ─── Public API ─────────────────────────────────────────────

export async function saveGame(state: GameState, key = AUTO_SAVE_KEY): Promise<void> {
	const wrapped = wrapSave(state);

	// Rotate backups before saving: shift existing backups down, save current autosave as backup_0
	if (key === AUTO_SAVE_KEY) {
		try {
			await rotateBackups();
		} catch (err) {
			console.warn('[SaveManager] Backup rotation failed:', err);
		}
	}

	await dbPut(key, wrapped);
}

export async function loadGame(key = AUTO_SAVE_KEY): Promise<GameState | null> {
	const raw = await dbGet(key);

	if (raw) {
		const result = unwrapSave(raw);
		if (result) {
			try { localStorage.removeItem('tech_tycoon_emergency_save'); } catch { /* ignore */ }
			return result.state;
		}
	}

	// Fall back to emergency localStorage save (from beforeunload)
	try {
		const emergency = localStorage.getItem('tech_tycoon_emergency_save');
		if (emergency) {
			const parsed = JSON.parse(emergency) as GameState;
			localStorage.removeItem('tech_tycoon_emergency_save');
			await saveGame(parsed, key);
			return parsed;
		}
	} catch {
		// Emergency save corrupted
	}

	return null;
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
	await dbDelete(key);
}

// ─── Backup System ──────────────────────────────────────────

export interface BackupInfo {
	slot: number;
	key: string;
	savedAt: number;
	version: number;
	checksumValid: boolean;
}

/** Rotate backups: current autosave → backup_0, backup_0 → backup_1, etc. */
async function rotateBackups(): Promise<void> {
	// Delete the oldest backup if it exists
	try { await dbDelete(`${BACKUP_PREFIX}${MAX_BACKUPS - 1}`); } catch { /* ok */ }

	// Shift existing backups up
	for (let i = MAX_BACKUPS - 2; i >= 0; i--) {
		const data = await dbGet(`${BACKUP_PREFIX}${i}`);
		if (data) {
			await dbPut(`${BACKUP_PREFIX}${i + 1}`, data);
		}
	}

	// Copy current autosave to backup_0
	const currentSave = await dbGet(AUTO_SAVE_KEY);
	if (currentSave) {
		await dbPut(`${BACKUP_PREFIX}0`, currentSave);
	}
}

/** List all available backups with metadata */
export async function listBackups(): Promise<BackupInfo[]> {
	const backups: BackupInfo[] = [];
	for (let i = 0; i < MAX_BACKUPS; i++) {
		const key = `${BACKUP_PREFIX}${i}`;
		const raw = await dbGet(key);
		if (!raw) continue;

		try {
			const parsed = JSON.parse(raw);
			// Check if it's an envelope format
			if (parsed.checksum) {
				const envelope = parsed as SaveEnvelope;
				const computedHash = fnv1aHash(envelope.payload);
				backups.push({
					slot: i,
					key,
					savedAt: envelope.savedAt,
					version: envelope.version,
					checksumValid: computedHash === envelope.checksum,
				});
			} else {
				// Legacy format
				backups.push({
					slot: i,
					key,
					savedAt: parsed.lastSaved ?? parsed.lastPlayed ?? 0,
					version: parsed.version ?? 0,
					checksumValid: true, // no checksum to verify
				});
			}
		} catch {
			// corrupted backup entry
		}
	}
	return backups;
}

/** Restore a specific backup slot, returning the GameState or null */
export async function restoreBackup(slot: number): Promise<GameState | null> {
	const key = `${BACKUP_PREFIX}${slot}`;
	const raw = await dbGet(key);
	if (!raw) return null;

	const result = unwrapSave(raw);
	return result?.state ?? null;
}

/** Delete all backups */
export async function deleteAllBackups(): Promise<void> {
	for (let i = 0; i < MAX_BACKUPS; i++) {
		try { await dbDelete(`${BACKUP_PREFIX}${i}`); } catch { /* ignore */ }
	}
}

// ─── Cloud Save Stub ────────────────────────────────────────

export interface CloudSaveStatus {
	available: false;
	lastSync: null;
	message: string;
}

/** Check cloud save availability (stub — always unavailable) */
export function getCloudSaveStatus(): CloudSaveStatus {
	return {
		available: false,
		lastSync: null,
		message: 'Cloud saves coming soon! Your saves are stored locally.',
	};
}

/** Upload save to cloud (stub) */
export async function cloudSaveUpload(_state: GameState): Promise<{ success: false; message: string }> {
	return { success: false, message: 'Cloud saves are not yet available.' };
}

/** Download save from cloud (stub) */
export async function cloudSaveDownload(): Promise<{ success: false; message: string }> {
	return { success: false, message: 'Cloud saves are not yet available.' };
}
