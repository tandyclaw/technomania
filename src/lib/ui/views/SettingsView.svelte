<script lang="ts">
	import { gameState, type GameState } from '$lib/stores/gameState';
	import { gameManager } from '$lib/engine/GameManager';
	import { get } from 'svelte/store';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { exportSave as exportBase64, importSave as importBase64 } from '$lib/engine/SaveManager';

	const GAME_VERSION = '0.1.0';

	let showResetConfirm = $state(false);
	let showImportModal = $state(false);
	let showBase64Import = $state(false);
	let base64Input = $state('');
	let importError = $state('');
	let importSuccess = $state(false);
	let exportSuccess = $state(false);
	let clipboardCopied = $state(false);

	// Derive settings from game state
	let musicEnabled = $derived($gameState.settings.musicEnabled);
	let sfxEnabled = $derived($gameState.settings.sfxEnabled);
	let notificationsEnabled = $derived($gameState.settings.notificationsEnabled);
	let offlineProgressEnabled = $derived($gameState.settings.offlineProgressEnabled);
	let floatingTextEnabled = $derived($gameState.settings.floatingTextEnabled ?? true);
	let hapticEnabled = $derived($gameState.settings.hapticEnabled ?? true);
	let theme = $derived($gameState.settings.theme ?? 'dark');

	function toggleTheme() {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		gameState.update((s) => ({
			...s,
			settings: { ...s.settings, theme: newTheme }
		}));
		document.documentElement.classList.toggle('light', newTheme === 'light');
		localStorage.setItem('tech-tycoon-theme', newTheme);
	}

	function toggleSetting(key: keyof GameState['settings']) {
		gameState.update((s) => ({
			...s,
			settings: { ...s.settings, [key]: !s.settings[key] }
		}));
	}

	function exportSave() {
		const state = get(gameState);
		const json = JSON.stringify(state, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `tech-tycoon-save-${new Date().toISOString().slice(0, 10)}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		exportSuccess = true;
		setTimeout(() => (exportSuccess = false), 2000);
	}

	function openImportModal() {
		showImportModal = true;
		importError = '';
		importSuccess = false;
	}

	function handleImportFile(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result as string) as GameState;
				// Basic validation
				if (!data.divisions || !data.cash === undefined || !data.stats) {
					importError = 'Invalid save file format.';
					return;
				}
				gameState.set(data);
				gameManager.save();
				importSuccess = true;
				importError = '';
				setTimeout(() => {
					showImportModal = false;
					importSuccess = false;
				}, 1500);
			} catch {
				importError = 'Could not parse save file. Make sure it\'s a valid JSON file.';
			}
		};
		reader.onerror = () => {
			importError = 'Failed to read file.';
		};
		reader.readAsText(file);
	}

	async function confirmHardReset() {
		await gameManager.hardReset();
		showResetConfirm = false;
	}

	function exportBase64Save() {
		const state = get(gameState);
		const encoded = exportBase64(state);
		navigator.clipboard.writeText(encoded).then(() => {
			clipboardCopied = true;
			setTimeout(() => (clipboardCopied = false), 2000);
		}).catch(() => {
			// Fallback: prompt
			prompt('Copy this save code:', encoded);
		});
	}

	function handleBase64Import() {
		if (!base64Input.trim()) {
			importError = 'Please paste a save code.';
			return;
		}
		const data = importBase64(base64Input.trim());
		if (!data || !data.divisions || data.cash === undefined) {
			importError = 'Invalid save code. Check and try again.';
			return;
		}
		gameState.set(data);
		gameManager.save();
		importSuccess = true;
		importError = '';
		base64Input = '';
		setTimeout(() => {
			showBase64Import = false;
			importSuccess = false;
		}, 1500);
	}

	// Stats for display
	let playTimeFormatted = $derived(() => {
		const ms = $gameState.stats.playTimeMs;
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		if (hours > 0) return `${hours}h ${minutes}m`;
		if (minutes > 0) return `${minutes}m ${seconds}s`;
		return `${seconds}s`;
	});

	let sessionsPlayed = $derived($gameState.stats.sessionsPlayed);
	let totalTaps = $derived($gameState.stats.totalTaps);
	let totalProductions = $derived($gameState.stats.totalProductions);
	let totalPrestiges = $derived($gameState.stats.totalPrestiges);
	let totalCashEarned = $derived($gameState.stats.totalCashEarned);
	let highestIncomePerSec = $derived($gameState.stats.highestIncomePerSec);
</script>

<div class="settings space-y-5">
	<!-- Header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary">Settings</h1>
		<p class="text-sm text-text-secondary mt-0.5">Customize your experience</p>
	</div>

	<!-- Audio Settings -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Audio</h2>
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 divide-y divide-white/5">
			<div class="flex items-center justify-between px-4 py-3">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">🎵</span>
					<span class="text-sm font-medium text-text-primary">Music</span>
				</div>
				<button
					onclick={() => toggleSetting('musicEnabled')}
					class="toggle-switch"
					class:active={musicEnabled}
					role="switch"
					aria-checked={musicEnabled}
					aria-label="Toggle music"
				>
					<span class="toggle-thumb" class:active={musicEnabled}></span>
				</button>
			</div>
			<div class="flex items-center justify-between px-4 py-3">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">🔊</span>
					<span class="text-sm font-medium text-text-primary">Sound Effects</span>
				</div>
				<button
					onclick={() => toggleSetting('sfxEnabled')}
					class="toggle-switch"
					class:active={sfxEnabled}
					role="switch"
					aria-checked={sfxEnabled}
					aria-label="Toggle sound effects"
				>
					<span class="toggle-thumb" class:active={sfxEnabled}></span>
				</button>
			</div>
		</div>
	</section>

	<!-- Game Settings -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Game</h2>
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 divide-y divide-white/5">
			<div class="flex items-center justify-between px-4 py-3">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">🔔</span>
					<div>
						<span class="text-sm font-medium text-text-primary block">Notifications</span>
						<span class="text-[10px] text-text-muted">In-game event alerts</span>
					</div>
				</div>
				<button
					onclick={() => toggleSetting('notificationsEnabled')}
					class="toggle-switch"
					class:active={notificationsEnabled}
					role="switch"
					aria-checked={notificationsEnabled}
					aria-label="Toggle notifications"
				>
					<span class="toggle-thumb" class:active={notificationsEnabled}></span>
				</button>
			</div>
			<div class="flex items-center justify-between px-4 py-3">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">🌙</span>
					<div>
						<span class="text-sm font-medium text-text-primary block">Offline Progress</span>
						<span class="text-[10px] text-text-muted">Earn while you're away (up to 8h)</span>
					</div>
				</div>
				<button
					onclick={() => toggleSetting('offlineProgressEnabled')}
					class="toggle-switch"
					class:active={offlineProgressEnabled}
					role="switch"
					aria-checked={offlineProgressEnabled}
					aria-label="Toggle offline progress"
				>
					<span class="toggle-thumb" class:active={offlineProgressEnabled}></span>
				</button>
			</div>

			<!-- Floating Text -->
			<div class="flex items-center justify-between px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">💸</span>
					<div>
						<span class="text-sm font-medium text-text-primary block">Floating Income Text</span>
						<span class="text-[10px] text-text-muted">Show +$X when production completes</span>
					</div>
				</div>
				<button
					onclick={() => toggleSetting('floatingTextEnabled')}
					class="toggle-switch"
					class:active={floatingTextEnabled}
					role="switch"
					aria-checked={floatingTextEnabled}
					aria-label="Toggle floating income text"
				>
					<span class="toggle-thumb" class:active={floatingTextEnabled}></span>
				</button>
			</div>

			<!-- Haptic Feedback -->
			<div class="flex items-center justify-between px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">📳</span>
					<div>
						<span class="text-sm font-medium text-text-primary block">Haptic Feedback</span>
						<span class="text-[10px] text-text-muted">Vibrate on purchases & events</span>
					</div>
				</div>
				<button
					onclick={() => toggleSetting('hapticEnabled')}
					class="toggle-switch"
					class:active={hapticEnabled}
					role="switch"
					aria-checked={hapticEnabled}
					aria-label="Toggle haptic feedback"
				>
					<span class="toggle-thumb" class:active={hapticEnabled}></span>
				</button>
			</div>
		</div>
	</section>

	<!-- Appearance -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Appearance</h2>
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 divide-y divide-white/5">
			<div class="flex items-center justify-between px-4 py-3">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
					<div>
						<span class="text-sm font-medium text-text-primary block">Theme</span>
						<span class="text-[10px] text-text-muted">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
					</div>
				</div>
				<button
					onclick={toggleTheme}
					class="toggle-switch"
					class:active={theme === 'light'}
					role="switch"
					aria-checked={theme === 'light'}
					aria-label="Toggle light theme"
				>
					<span class="toggle-thumb" class:active={theme === 'light'}></span>
				</button>
			</div>
		</div>
	</section>

	<!-- Save Management -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Save Data</h2>
		<div class="space-y-2">
			<button
				onclick={exportSave}
				class="w-full flex items-center gap-3 px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5
					   hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation"
			>
				<span class="text-lg" aria-hidden="true">📤</span>
				<div class="text-left flex-1">
					<span class="text-sm font-medium text-text-primary block">Export Save</span>
					<span class="text-[10px] text-text-muted">Download your save as JSON</span>
				</div>
				{#if exportSuccess}
					<span class="text-xs text-bio-green font-semibold">✓ Saved!</span>
				{/if}
			</button>

			<button
				onclick={openImportModal}
				class="w-full flex items-center gap-3 px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5
					   hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation"
			>
				<span class="text-lg" aria-hidden="true">📥</span>
				<div class="text-left flex-1">
					<span class="text-sm font-medium text-text-primary block">Import Save</span>
					<span class="text-[10px] text-text-muted">Load a save file from disk</span>
				</div>
			</button>

			<button
				onclick={exportBase64Save}
				class="w-full flex items-center gap-3 px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5
					   hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation"
			>
				<span class="text-lg" aria-hidden="true">📋</span>
				<div class="text-left flex-1">
					<span class="text-sm font-medium text-text-primary block">Copy Save Code</span>
					<span class="text-[10px] text-text-muted">Copy base64 save to clipboard</span>
				</div>
				{#if clipboardCopied}
					<span class="text-xs text-bio-green font-semibold">✓ Copied!</span>
				{/if}
			</button>

			<button
				onclick={() => { showBase64Import = true; importError = ''; importSuccess = false; base64Input = ''; }}
				class="w-full flex items-center gap-3 px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5
					   hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation"
			>
				<span class="text-lg" aria-hidden="true">📝</span>
				<div class="text-left flex-1">
					<span class="text-sm font-medium text-text-primary block">Paste Save Code</span>
					<span class="text-[10px] text-text-muted">Import from base64 string</span>
				</div>
			</button>
		</div>
	</section>

	<!-- Danger Zone -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-rocket-red uppercase tracking-wider mb-2">Danger Zone</h2>
		<button
			onclick={() => (showResetConfirm = true)}
			class="w-full flex items-center gap-3 px-4 py-3 bg-rocket-red/5 rounded-xl border border-rocket-red/20
				   hover:border-rocket-red/40 transition-all active:scale-[0.98] touch-manipulation"
		>
			<span class="text-lg" aria-hidden="true">🗑️</span>
			<div class="text-left flex-1">
				<span class="text-sm font-medium text-rocket-red block">Hard Reset</span>
				<span class="text-[10px] text-text-muted">Delete everything and start over</span>
			</div>
		</button>
	</section>

	<!-- Game Stats -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Statistics</h2>
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 space-y-2">
			<div class="flex justify-between text-sm">
				<span class="text-text-muted">Play Time</span>
				<span class="text-text-primary font-mono tabular-nums">{playTimeFormatted()}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-text-muted">Sessions</span>
				<span class="text-text-primary font-mono tabular-nums">{sessionsPlayed}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-text-muted">Total Taps</span>
				<span class="text-text-primary font-mono tabular-nums">{formatNumber(totalTaps, 0)}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-text-muted">Total Cash Earned</span>
				<span class="text-text-primary font-mono tabular-nums">{formatCurrency(totalCashEarned)}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-text-muted">Total Productions</span>
				<span class="text-text-primary font-mono tabular-nums">{formatNumber(totalProductions, 0)}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-text-muted">Highest Income/s</span>
				<span class="text-text-primary font-mono tabular-nums">{formatCurrency(highestIncomePerSec, 1)}/s</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-text-muted">Total Prestiges</span>
				<span class="text-text-primary font-mono tabular-nums">{totalPrestiges}</span>
			</div>
		</div>
	</section>

	<!-- Version -->
	<div class="text-center py-4 space-y-1">
		<p class="text-xs text-text-muted">Tech Tycoon v{GAME_VERSION}</p>
		<p class="text-[10px] text-text-muted/50">Made with ⚡ and ambition</p>
	</div>
</div>

<!-- Hard Reset Confirmation Modal -->
{#if showResetConfirm}
	<div
		class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
		role="dialog"
		aria-modal="true"
		aria-label="Confirm hard reset"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-rocket-red/20">
			<div class="text-center">
				<div class="text-4xl mb-3">⚠️</div>
				<h2 class="text-lg font-bold text-text-primary mb-2">Hard Reset</h2>
				<p class="text-sm text-text-secondary mb-1">
					Are you sure? This deletes everything.
				</p>
				<p class="text-xs text-text-muted mb-5">
					All progress, prestige, research — gone forever. No undo.
				</p>
			</div>
			<div class="flex gap-3">
				<button
					onclick={() => (showResetConfirm = false)}
					class="flex-1 py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-sm
						   transition-all active:scale-95 touch-manipulation"
				>
					Cancel
				</button>
				<button
					onclick={confirmHardReset}
					class="flex-1 py-3 px-4 rounded-xl bg-rocket-red text-white font-semibold text-sm
						   transition-all active:scale-95 touch-manipulation"
				>
					Delete Everything
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Import Save Modal -->
{#if showImportModal}
	<div
		class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
		role="dialog"
		aria-modal="true"
		aria-label="Import save file"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-white/10">
			<div class="text-center">
				<div class="text-4xl mb-3">📥</div>
				<h2 class="text-lg font-bold text-text-primary mb-2">Import Save</h2>
				<p class="text-sm text-text-secondary mb-4">
					Select a Tech Tycoon save file (.json) to load.
				</p>
			</div>

			{#if importSuccess}
				<div class="text-center py-4">
					<span class="text-2xl">✅</span>
					<p class="text-sm text-bio-green font-semibold mt-2">Save imported successfully!</p>
				</div>
			{:else}
				<label
					class="block w-full py-8 px-4 rounded-xl border-2 border-dashed border-white/10
						   hover:border-electric-blue/50 transition-colors cursor-pointer text-center"
				>
					<span class="text-sm text-text-secondary">Tap to select file</span>
					<input
						type="file"
						accept=".json,application/json"
						onchange={handleImportFile}
						class="hidden"
					/>
				</label>
				{#if importError}
					<p class="text-xs text-rocket-red mt-2 text-center">{importError}</p>
				{/if}
			{/if}

			<button
				onclick={() => { showImportModal = false; importError = ''; importSuccess = false; }}
				class="w-full mt-4 py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-sm
					   transition-all active:scale-95 touch-manipulation"
			>
				{importSuccess ? 'Done' : 'Cancel'}
			</button>
		</div>
	</div>
{/if}

<!-- Base64 Import Modal -->
{#if showBase64Import}
	<div
		class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
		role="dialog"
		aria-modal="true"
		aria-label="Import save code"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-white/10">
			<div class="text-center">
				<div class="text-4xl mb-3">📝</div>
				<h2 class="text-lg font-bold text-text-primary mb-2">Import Save Code</h2>
				<p class="text-sm text-text-secondary mb-4">
					Paste a base64 save code below. This will overwrite your current save.
				</p>
			</div>

			{#if importSuccess}
				<div class="text-center py-4">
					<span class="text-2xl">✅</span>
					<p class="text-sm text-bio-green font-semibold mt-2">Save imported successfully!</p>
				</div>
			{:else}
				<textarea
					bind:value={base64Input}
					placeholder="Paste save code here..."
					class="w-full h-24 px-3 py-2 rounded-xl bg-bg-tertiary border border-white/10 text-sm text-text-primary
						   placeholder:text-text-muted/50 resize-none focus:outline-none focus:border-electric-blue/50"
				></textarea>
				{#if importError}
					<p class="text-xs text-rocket-red mt-2 text-center">{importError}</p>
				{/if}
				<button
					onclick={handleBase64Import}
					class="w-full mt-3 py-3 px-4 rounded-xl bg-electric-blue text-white font-semibold text-sm
						   transition-all active:scale-95 touch-manipulation"
				>
					Import & Overwrite
				</button>
			{/if}

			<button
				onclick={() => { showBase64Import = false; importError = ''; importSuccess = false; }}
				class="w-full mt-2 py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-sm
					   transition-all active:scale-95 touch-manipulation"
			>
				{importSuccess ? 'Done' : 'Cancel'}
			</button>
		</div>
	</div>
{/if}

<style>
	.toggle-switch {
		position: relative;
		width: 44px;
		height: 24px;
		border-radius: 12px;
		background-color: var(--color-bg-tertiary);
		border: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
		padding: 0;
		flex-shrink: 0;
	}

	.toggle-switch.active {
		background-color: var(--color-electric-blue);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: white;
		transition: transform 0.2s ease;
		pointer-events: none;
	}

	.toggle-thumb.active {
		transform: translateX(20px);
	}
</style>
