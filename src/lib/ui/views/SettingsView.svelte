<script lang="ts">
	import { gameState, type GameState } from '$lib/stores/gameState';
	import { gameManager } from '$lib/engine/GameManager';
	import { get } from 'svelte/store';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { exportSave as exportBase64, importSave as importBase64, listBackups, restoreBackup, getCloudSaveStatus, type BackupInfo } from '$lib/engine/SaveManager';
	import { setMusicEnabled, setMusicVolume } from '$lib/systems/MusicManager';
	import ShareCard from '$lib/ui/ShareCard.svelte';
	import { tutorialStore } from '$lib/stores/tutorialStore';
	import { isBrowserNotificationsEnabled, setBrowserNotificationsEnabled, requestPermissionIfNeeded } from '$lib/systems/BrowserNotificationService';

	const GAME_VERSION = '0.1.0';

	let showShareCard = $state(false);
	let showResetConfirm = $state(false);
	let showImportModal = $state(false);
	let showBase64Import = $state(false);
	let base64Input = $state('');
	let importError = $state('');
	let importSuccess = $state(false);
	let exportSuccess = $state(false);
	let clipboardCopied = $state(false);

	// Backup system state
	let backups = $state<BackupInfo[]>([]);
	let showBackupSection = $state(false);
	let backupLoading = $state(false);
	let backupRestoreSuccess = $state(false);
	let backupRestoreError = $state('');
	let showRestoreConfirm = $state<number | null>(null);

	// Cloud save stub
	const cloudStatus = getCloudSaveStatus();

	async function loadBackups() {
		backupLoading = true;
		try {
			backups = await listBackups();
		} catch {
			backups = [];
		}
		backupLoading = false;
	}

	async function handleRestoreBackup(slot: number) {
		backupRestoreError = '';
		backupRestoreSuccess = false;
		try {
			const state = await restoreBackup(slot);
			if (!state) {
				backupRestoreError = 'Backup is corrupted or empty.';
				return;
			}
			gameState.set(state);
			await gameManager.save();
			backupRestoreSuccess = true;
			showRestoreConfirm = null;
			setTimeout(() => (backupRestoreSuccess = false), 2000);
		} catch {
			backupRestoreError = 'Failed to restore backup.';
		}
	}

	function formatBackupTime(ts: number): string {
		if (!ts) return 'Unknown';
		const d = new Date(ts);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMin = Math.floor(diffMs / 60000);
		if (diffMin < 1) return 'Just now';
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffHr = Math.floor(diffMin / 60);
		if (diffHr < 24) return `${diffHr}h ago`;
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	// Derive settings from game state
	let musicEnabled = $derived($gameState.settings.musicEnabled);
	let musicVolume = $derived($gameState.settings.musicVolume ?? 0.5);
	let sfxEnabled = $derived($gameState.settings.sfxEnabled);
	let notificationsEnabled = $derived($gameState.settings.notificationsEnabled);
	let offlineProgressEnabled = $derived($gameState.settings.offlineProgressEnabled);
	let floatingTextEnabled = $derived($gameState.settings.floatingTextEnabled ?? true);
	let hapticEnabled = $derived($gameState.settings.hapticEnabled ?? true);
	let theme = $derived($gameState.settings.theme ?? 'dark');
	let highContrast = $derived($gameState.settings.highContrast ?? false);
	let browserNotifications = $state(isBrowserNotificationsEnabled());

	async function toggleBrowserNotifications() {
		const newVal = !browserNotifications;
		if (newVal) {
			const granted = await requestPermissionIfNeeded();
			if (!granted) return; // Permission denied, don't enable
		}
		browserNotifications = newVal;
		setBrowserNotificationsEnabled(newVal);
	}

	const themeOptions: { value: 'dark' | 'light' | 'oled'; label: string; icon: string; desc: string }[] = [
		{ value: 'dark', label: 'Dark', icon: '🌙', desc: 'Default dark theme' },
		{ value: 'light', label: 'Light', icon: '☀️', desc: 'Easy on the eyes' },
		{ value: 'oled', label: 'OLED Dark', icon: '🖤', desc: 'Pure black, saves battery' },
	];

	function applyTheme(newTheme: 'dark' | 'light' | 'oled') {
		// Enable smooth transition
		document.documentElement.classList.add('theme-transition');
		
		// Remove all theme classes
		document.documentElement.classList.remove('light', 'oled');
		
		// Apply new theme class
		if (newTheme === 'light') {
			document.documentElement.classList.add('light');
		} else if (newTheme === 'oled') {
			document.documentElement.classList.add('oled');
		}
		
		// Persist
		localStorage.setItem('tech-tycoon-theme', newTheme);
		
		// Remove transition class after animation completes
		setTimeout(() => {
			document.documentElement.classList.remove('theme-transition');
		}, 350);
	}

	function setTheme(newTheme: 'dark' | 'light' | 'oled') {
		gameState.update((s) => ({
			...s,
			settings: { ...s.settings, theme: newTheme }
		}));
		applyTheme(newTheme);
	}

	function toggleHighContrast() {
		const newVal = !highContrast;
		gameState.update((s) => ({
			...s,
			settings: { ...s.settings, highContrast: newVal }
		}));
		document.documentElement.classList.add('theme-transition');
		document.documentElement.classList.toggle('high-contrast', newVal);
		localStorage.setItem('tech-tycoon-high-contrast', String(newVal));
		setTimeout(() => {
			document.documentElement.classList.remove('theme-transition');
		}, 350);
	}

	function toggleSetting(key: keyof GameState['settings']) {
		gameState.update((s) => ({
			...s,
			settings: { ...s.settings, [key]: !s.settings[key] }
		}));
		if (key === 'musicEnabled') {
			const state = get(gameState);
			setMusicEnabled(state.settings.musicEnabled);
		}
	}

	function handleMusicVolume(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		gameState.update((s) => ({
			...s,
			settings: { ...s.settings, musicVolume: val }
		}));
		setMusicVolume(val);
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
			{#if musicEnabled}
			<div class="flex items-center gap-3 px-4 py-3">
				<span class="text-lg" aria-hidden="true">🔈</span>
				<span class="text-sm font-medium text-text-primary shrink-0">Volume</span>
				<input
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={musicVolume}
					oninput={handleMusicVolume}
					class="flex-1 h-1 accent-electric-blue"
					aria-label="Music volume"
				/>
				<span class="text-xs text-text-muted tabular-nums w-8 text-right">{Math.round(musicVolume * 100)}%</span>
			</div>
			{/if}
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
					<span class="text-lg" aria-hidden="true">📲</span>
					<div>
						<span class="text-sm font-medium text-text-primary block">Browser Notifications</span>
						<span class="text-[10px] text-text-muted">Notify when tab is in background</span>
					</div>
				</div>
				<button
					onclick={toggleBrowserNotifications}
					class="toggle-switch"
					class:active={browserNotifications}
					role="switch"
					aria-checked={browserNotifications}
					aria-label="Toggle browser notifications"
				>
					<span class="toggle-thumb" class:active={browserNotifications}></span>
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
			<div class="flex items-center justify-between px-4 py-3">
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
			<div class="flex items-center justify-between px-4 py-3">
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

	<!-- Tutorial -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Help</h2>
		<button
			onclick={() => tutorialStore.restart()}
			class="w-full flex items-center gap-3 px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5
				   hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation"
		>
			<span class="text-lg" aria-hidden="true">❓</span>
			<div class="text-left flex-1">
				<span class="text-sm font-medium text-text-primary block">Replay Tutorial</span>
				<span class="text-[10px] text-text-muted">Learn the basics again</span>
			</div>
		</button>
	</section>

	<!-- Appearance -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Appearance</h2>
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 divide-y divide-white/5">
			<!-- Theme selector -->
			<div class="px-4 py-3">
				<span class="text-sm font-medium text-text-primary block mb-2">Theme</span>
				<div class="grid grid-cols-3 gap-2">
					{#each themeOptions as opt}
						<button
							onclick={() => setTheme(opt.value)}
							class="flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all duration-200 active:scale-95 touch-manipulation
								{theme === opt.value
									? 'border-electric-blue bg-electric-blue/10'
									: 'border-white/5 hover:border-white/10 bg-bg-tertiary/30'}"
							aria-pressed={theme === opt.value}
						>
							<span class="text-lg" aria-hidden="true">{opt.icon}</span>
							<span class="text-xs font-semibold text-text-primary">{opt.label}</span>
							<span class="text-[9px] text-text-muted leading-tight text-center">{opt.desc}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- High Contrast toggle -->
			<div class="flex items-center justify-between px-4 py-3">
				<div class="flex items-center gap-3">
					<span class="text-lg" aria-hidden="true">🔲</span>
					<div>
						<span class="text-sm font-medium text-text-primary block">High Contrast</span>
						<span class="text-[10px] text-text-muted">Stronger text & borders</span>
					</div>
				</div>
				<button
					onclick={toggleHighContrast}
					class="toggle-switch"
					class:active={highContrast}
					role="switch"
					aria-checked={highContrast}
					aria-label="Toggle high contrast mode"
				>
					<span class="toggle-thumb" class:active={highContrast}></span>
				</button>
			</div>
		</div>
	</section>

	<!-- Share Progress -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Share</h2>
		<button
			onclick={() => showShareCard = true}
			class="w-full flex items-center gap-3 px-4 py-3 bg-bg-secondary/40 rounded-xl border border-white/5
				   hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation"
		>
			<span class="text-lg" aria-hidden="true">📤</span>
			<div class="text-left flex-1">
				<span class="text-sm font-medium text-text-primary block">Share Progress</span>
				<span class="text-[10px] text-text-muted">Show off your stats with a shareable card</span>
			</div>
		</button>
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

	<!-- Backup Saves -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Backup Saves</h2>
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 space-y-3">
			<p class="text-[10px] text-text-muted">Last 3 saves are kept automatically. Restore if your save gets corrupted.</p>

			{#if !showBackupSection}
				<button
					onclick={() => { showBackupSection = true; loadBackups(); }}
					class="w-full py-2.5 px-4 rounded-lg bg-bg-tertiary/50 border border-white/5
						   hover:border-white/10 text-sm font-medium text-text-secondary
						   transition-all active:scale-[0.98] touch-manipulation"
				>
					🗂️ View Backups
				</button>
			{:else}
				{#if backupLoading}
					<div class="text-center py-3">
						<span class="text-sm text-text-muted animate-pulse">Loading backups...</span>
					</div>
				{:else if backups.length === 0}
					<div class="text-center py-3">
						<span class="text-sm text-text-muted">No backups yet. They'll appear after your next save.</span>
					</div>
				{:else}
					{#each backups as backup}
						<div class="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/30 border border-white/5">
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<span class="text-xs font-semibold text-text-primary">Slot {backup.slot + 1}</span>
									{#if !backup.checksumValid}
										<span class="text-[9px] px-1.5 py-0.5 rounded bg-rocket-red/20 text-rocket-red font-medium">⚠ Checksum Error</span>
									{:else}
										<span class="text-[9px] px-1.5 py-0.5 rounded bg-bio-green/20 text-bio-green font-medium">✓ Valid</span>
									{/if}
								</div>
								<span class="text-[10px] text-text-muted">{formatBackupTime(backup.savedAt)} · v{backup.version}</span>
							</div>
							<button
								onclick={() => (showRestoreConfirm = backup.slot)}
								class="px-3 py-1.5 rounded-lg bg-electric-blue/10 border border-electric-blue/20
									   text-xs font-semibold text-electric-blue
									   hover:bg-electric-blue/20 transition-all active:scale-95 touch-manipulation"
							>
								Restore
							</button>
						</div>
					{/each}
				{/if}

				{#if backupRestoreSuccess}
					<p class="text-xs text-bio-green text-center font-semibold">✓ Backup restored successfully!</p>
				{/if}
				{#if backupRestoreError}
					<p class="text-xs text-rocket-red text-center">{backupRestoreError}</p>
				{/if}

				<button
					onclick={() => { showBackupSection = false; }}
					class="w-full py-2 text-xs text-text-muted hover:text-text-secondary transition-colors"
				>
					Hide backups
				</button>
			{/if}
		</div>
	</section>

	<!-- Cloud Save (Stub) -->
	<section class="space-y-1">
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Cloud Save</h2>
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 space-y-3 opacity-60">
			<div class="flex items-center gap-3">
				<span class="text-lg" aria-hidden="true">☁️</span>
				<div class="flex-1">
					<span class="text-sm font-medium text-text-primary block">Cloud Sync</span>
					<span class="text-[10px] text-text-muted">{cloudStatus.message}</span>
				</div>
				<span class="text-[9px] px-2 py-1 rounded-full bg-bg-tertiary text-text-muted font-semibold uppercase">Coming Soon</span>
			</div>
			<div class="flex gap-2">
				<button
					disabled
					class="flex-1 py-2.5 px-3 rounded-lg bg-bg-tertiary/30 border border-white/5
						   text-xs font-medium text-text-muted cursor-not-allowed"
				>
					⬆️ Upload
				</button>
				<button
					disabled
					class="flex-1 py-2.5 px-3 rounded-lg bg-bg-tertiary/30 border border-white/5
						   text-xs font-medium text-text-muted cursor-not-allowed"
				>
					⬇️ Download
				</button>
			</div>
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
				<span class="text-text-muted">Total Colonies</span>
				<span class="text-text-primary font-mono tabular-nums">{totalPrestiges}</span>
			</div>
		</div>
	</section>

	<!-- Version -->
	<div class="text-center py-4 space-y-1">
		<p class="text-xs text-text-muted">Moonshot v{GAME_VERSION}</p>
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
					All progress, colonies, research — gone forever. No undo.
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
					Select a Moonshot save file (.json) to load.
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

<!-- Restore Backup Confirmation Modal -->
{#if showRestoreConfirm !== null}
	<div
		class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
		role="dialog"
		aria-modal="true"
		aria-label="Confirm backup restore"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-electric-blue/20">
			<div class="text-center">
				<div class="text-4xl mb-3">🗂️</div>
				<h2 class="text-lg font-bold text-text-primary mb-2">Restore Backup</h2>
				<p class="text-sm text-text-secondary mb-1">
					Restore from Slot {showRestoreConfirm + 1}?
				</p>
				<p class="text-xs text-text-muted mb-5">
					Your current save will be overwritten. A backup of it was already saved.
				</p>
			</div>
			<div class="flex gap-3">
				<button
					onclick={() => (showRestoreConfirm = null)}
					class="flex-1 py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-sm
						   transition-all active:scale-95 touch-manipulation"
				>
					Cancel
				</button>
				<button
					onclick={() => { if (showRestoreConfirm !== null) handleRestoreBackup(showRestoreConfirm); }}
					class="flex-1 py-3 px-4 rounded-xl bg-electric-blue text-white font-semibold text-sm
						   transition-all active:scale-95 touch-manipulation"
				>
					Restore
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showShareCard}
	<ShareCard milestone="custom" onClose={() => showShareCard = false} />
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
