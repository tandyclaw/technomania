/**
 * navigation.ts — Shared navigation state for the game shell
 * Uses Svelte 5 runes via writable store
 */

import { writable } from 'svelte/store';

export const activeTab = writable<string>('dashboard');
