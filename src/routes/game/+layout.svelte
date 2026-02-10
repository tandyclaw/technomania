<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ResourceBar from '$lib/ui/ResourceBar.svelte';
	import DivisionTabBar from '$lib/ui/DivisionTabBar.svelte';
	import SaveIndicator from '$lib/ui/SaveIndicator.svelte';
	import ToastContainer from '$lib/ui/ToastContainer.svelte';
	import { activeTab } from '$lib/stores/navigation';
	import { gameManager } from '$lib/engine/GameManager';
	import { gameLoop } from '$lib/engine/GameLoop';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import { initToastListeners } from '$lib/stores/toastStore';
	import { initAchievementListeners } from '$lib/systems/AchievementSystem';
	import { initActivityListeners } from '$lib/stores/activityStore';
	import FloatingText from '$lib/ui/FloatingText.svelte';
	import { tutorialStore, initTutorialListeners } from '$lib/stores/tutorialStore';
	import TutorialOverlay from '$lib/ui/TutorialOverlay.svelte';
	import SynergyCelebration from '$lib/ui/SynergyCelebration.svelte';
	import ParticleEffects from '$lib/ui/ParticleEffects.svelte';
	import KeyboardShortcuts from '$lib/ui/KeyboardShortcuts.svelte';
	import InstallPrompt from '$lib/ui/InstallPrompt.svelte';
	// Daily reward removed per request
	// import DailyRewardModal from '$lib/ui/DailyRewardModal.svelte';
	import { celebrationState, dismissCelebration } from '$lib/stores/synergyCelebrationStore';
	import { hapticTierPurchase, hapticProductionComplete, hapticPrestige } from '$lib/utils/haptics';
	import { announce } from '$lib/utils/announce';
	import { eventBus } from '$lib/engine/EventBus';
	import type { OfflineReport } from '$lib/engine/OfflineCalculator';
	import { DIVISIONS } from '$lib/divisions';
	import { tickRandomEvents, initRandomEventListeners } from '$lib/systems/RandomEventSystem';
	import EventModal from '$lib/ui/EventModal.svelte';
	import { flashSaveIndicator } from '$lib/stores/saveIndicator';
	import { createSwipeDetector } from '$lib/utils/gestures';
	import { tickContracts, initContractListeners } from '$lib/systems/ContractSystem';
	import NewsTicker from '$lib/ui/NewsTicker.svelte';
	import MiniGame from '$lib/ui/MiniGame.svelte';
	import { initMiniGameListeners, tickMiniGame } from '$lib/systems/MiniGameSystem';
	import SeasonalBanner from '$lib/ui/SeasonalBanner.svelte';
	import { initBrowserNotifications } from '$lib/systems/BrowserNotificationService';
	// WhatsNew removed
	import { initSeasonalEvents } from '$lib/systems/SeasonalEventSystem';
	import ErrorBoundary from '$lib/ui/ErrorBoundary.svelte';
	import OfflineBadge from '$lib/ui/OfflineBadge.svelte';
	import StorageWarning from '$lib/ui/StorageWarning.svelte';

	let { children } = $props();
	let loading = $state(true);
	let initError = $state('');
	let mainEl: HTMLElement | undefined = $state();
	let storageWarningRef: StorageWarning | undefined = $state();
	let pullDistance = $state(0);
	let pulling = $state(false);
	let pullStartY = $state(0);
	let isNewGame = $state(false);
	let offlineMs = $state(0);
	let offlineReport = $state<OfflineReport | null>(null);
	let showWelcomeBack = $state(false);
	let cleanupToasts: (() => void) | null = null;
	let cleanupTutorial: (() => void) | null = null;
	let cleanupAchievements: (() => void) | null = null;
	let cleanupActivity: (() => void) | null = null;
	let cleanupHaptics: (() => void)[] = [];
	let cleanupRandomEvents: (() => void) | null = null;
	let cleanupEventTick: (() => void) | null = null;
	let cleanupContracts: (() => void) | null = null;
	let cleanupContractTick: (() => void) | null = null;
	let cleanupMiniGames: (() => void) | null = null;
	let cleanupMiniGameTick: (() => void) | null = null;
	let cleanupAnnouncements: (() => void)[] = [];
	let cleanupBrowserNotifications: (() => void) | null = null;

	onMount(async () => {
		// Wire up EventBus → toast notifications
		cleanupToasts = initToastListeners();
		cleanupAchievements = initAchievementListeners();
		cleanupActivity = initActivityListeners();

		let result;
		try {
			result = await gameManager.initialize();
		} catch (err) {
			console.error('[GameLayout] Initialization failed:', err);
			const msg = err instanceof DOMException && err.name === 'QuotaExceededError'
				? 'Storage is full. Try clearing old data.'
				: (err instanceof Error ? err.message : 'Failed to initialize game');
			initError = msg;
			loading = false;
			if (err instanceof DOMException && err.name === 'QuotaExceededError') {
				storageWarningRef?.showWarning();
			}
			return;
		}
		// initialize() returned
		isNewGame = result.isNewGame;
		offlineMs = result.offlineMs;
		offlineReport = result.offlineReport;

		// Show welcome back screen if returning after >5 minutes
		if (!isNewGame && offlineMs > 5 * 60 * 1000) {
			showWelcomeBack = true;
		}

		// Initialize tutorial system
		cleanupTutorial = initTutorialListeners();
		tutorialStore.tryStart();

		// Haptic feedback listeners
		cleanupHaptics = [
			eventBus.on('upgrade:purchased', () => hapticTierPurchase()),
			eventBus.on('chief:hired', () => hapticTierPurchase()),
			eventBus.on('production:complete', () => hapticProductionComplete()),
			eventBus.on('prestige:complete', () => hapticPrestige()),
		];

		// Restore theme from settings
		const savedTheme = localStorage.getItem('tech-tycoon-theme') as 'dark' | 'light' | 'oled' | null;
		document.documentElement.classList.remove('light', 'oled');
		if (savedTheme === 'light') {
			document.documentElement.classList.add('light');
		} else if (savedTheme === 'oled') {
			document.documentElement.classList.add('oled');
		}
		// Restore high contrast
		const savedHC = localStorage.getItem('tech-tycoon-high-contrast');
		if (savedHC === 'true') {
			document.documentElement.classList.add('high-contrast');
		}

		// Screen reader announcements for key game events
		cleanupAnnouncements = [
			eventBus.on('achievement:unlocked', (d) => announce(`Achievement unlocked: ${d.name}. ${d.description}`)),
			eventBus.on('chief:hired', (d) => announce(`Chief hired for ${d.division}, level ${d.level}`)),
			eventBus.on('prestige:complete', (d) => announce(`Colony launched! Vision earned: ${d.visionEarned}`)),
			eventBus.on('synergy:discovered', (d) => announce(`Synergy discovered: ${d.source} and ${d.target}. ${d.bonus}`)),
			eventBus.on('research:complete', (d) => announce(`Research complete: ${d.name}`)),
			eventBus.on('division:unlocked', (d) => announce(`New division unlocked: ${d.division}`)),
			eventBus.on('power:shortage', () => announce('Warning: power deficit detected. Production reduced.')),
		];

		// Contracts system
		cleanupContracts = initContractListeners();
		cleanupContractTick = gameLoop.onTick((deltaMs) => {
			tickContracts(deltaMs);
		});

		// Browser notifications (idle, contracts, achievements)
		cleanupBrowserNotifications = initBrowserNotifications();

		// Seasonal events (date-based, check on load)
		initSeasonalEvents();

		// Mini-games system
		cleanupMiniGames = initMiniGameListeners();
		cleanupMiniGameTick = gameLoop.onTick((deltaMs) => {
			tickMiniGame(deltaMs);
		});

		// Random events system
		cleanupRandomEvents = initRandomEventListeners();
		cleanupEventTick = gameLoop.onTick((deltaMs) => {
			tickRandomEvents(deltaMs);
		});

		loading = false;
	});

	onDestroy(() => {
		cleanupToasts?.();
		cleanupTutorial?.();
		cleanupAchievements?.();
		cleanupActivity?.();
		cleanupHaptics.forEach(fn => fn());
		cleanupRandomEvents?.();
		cleanupEventTick?.();
		cleanupContracts?.();
		cleanupBrowserNotifications?.();
		cleanupContractTick?.();
		cleanupMiniGames?.();
		cleanupMiniGameTick?.();
		cleanupAnnouncements.forEach(fn => fn());
		if (typeof window !== 'undefined') {
			gameManager.shutdown();
		}
	});

	function dismissWelcomeBack() {
		showWelcomeBack = false;
	}

	function handleTouchStart(e: TouchEvent) {
		if (mainEl && mainEl.scrollTop <= 0) {
			pullStartY = e.touches[0].clientY;
			pulling = true;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (!pulling) return;
		const dy = e.touches[0].clientY - pullStartY;
		// Dead zone: ignore < 10px to prevent micro-movements from applying
		// transforms that can confuse mobile browsers' tap detection
		if (dy > 10) {
			pullDistance = Math.min((dy - 10) * 0.4, 80);
		}
	}

	async function handleTouchEnd() {
		if (pullDistance > 50) {
			// Trigger save
			await gameManager.save();
			flashSaveIndicator();
		}
		pullDistance = 0;
		pulling = false;
	}

	// Swipe between division tabs
	const divisionTabOrder = ['dashboard', 'teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'];

	const swipe = createSwipeDetector({
		onSwipeLeft() {
			const idx = divisionTabOrder.indexOf($activeTab);
			if (idx >= 0 && idx < divisionTabOrder.length - 1) {
				activeTab.set(divisionTabOrder[idx + 1]);
			}
		},
		onSwipeRight() {
			const idx = divisionTabOrder.indexOf($activeTab);
			if (idx > 0) {
				activeTab.set(divisionTabOrder[idx - 1]);
			}
		},
	});

	function formatOfflineTime(ms: number): string {
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}
</script>

<svelte:head>
	<title>Moonshot — Playing</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<StorageWarning bind:this={storageWarningRef} />
<OfflineBadge />

{#if loading}
	<!-- Branded loading screen -->
	<div class="fixed inset-0 bg-bg-primary flex items-center justify-center z-[100]">
		<div class="text-center">
			<div class="text-6xl mb-3 loading-logo">⚡</div>
			<h1 class="text-xl font-bold text-text-primary mb-1 tracking-tight">Moonshot</h1>
			<p class="text-text-muted text-xs mb-6">Build the future. One tap at a time.</p>
			<div class="loading-spinner mx-auto"></div>
		</div>
	</div>
{:else if initError}
	<!-- Initialization error screen -->
	<div class="fixed inset-0 bg-bg-primary flex items-center justify-center z-[100] px-4">
		<div class="text-center max-w-sm w-full">
			<div class="text-5xl mb-4">🔧</div>
			<h1 class="text-xl font-bold text-text-primary mb-2">Couldn't Start the Game</h1>
			<p class="text-text-secondary text-sm mb-1">{initError}</p>
			<p class="text-text-muted text-xs mb-6">Your save data may still be intact.</p>
			<button
				onclick={() => window.location.reload()}
				class="w-full py-3 px-6 rounded-xl bg-electric-blue text-white font-semibold
					   transition-all duration-200 active:scale-95 touch-manipulation mb-2"
			>
				Try Again
			</button>
			<a href="/" class="block text-text-muted text-xs mt-2 hover:text-white transition-colors">
				Back to home
			</a>
		</div>
	</div>
{:else}
<ErrorBoundary>
	<!-- Welcome back overlay -->
	{#if showWelcomeBack}
		<div class="fixed inset-0 bg-bg-primary/95 backdrop-blur-sm flex items-center justify-center z-[90] px-4">
			<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-white/10 text-center">
				<div class="text-4xl mb-3">👋</div>
				<h2 class="text-xl font-bold text-text-primary mb-2">Welcome Back, Founder</h2>
				<p class="text-sm text-text-secondary mb-2">
					You were away for <span class="text-solar-gold font-semibold">{formatOfflineTime(offlineMs)}</span>
				</p>
				<p class="text-[10px] text-text-muted mb-3">
					⏩ {(offlineMs / 3600000).toFixed(1)} hours of production compressed
				</p>

				{#if offlineReport && (offlineReport.cashEarned > 0 || offlineReport.researchPointsEarned > 0)}
					<div class="bg-bg-tertiary/50 rounded-xl p-3 mb-3 space-y-2">
						<p class="text-xs text-text-muted uppercase tracking-wider mb-2">While you were away</p>

						<!-- Total earnings -->
						<div class="flex items-center justify-center gap-2 pb-2 border-b border-white/5">
							{#if offlineReport.cashEarned > 0}
								<div class="flex items-center gap-1">
									<span>💰</span>
									<span class="text-sm font-bold text-bio-green">
										+{formatCurrency(offlineReport.cashEarned)}
									</span>
								</div>
							{/if}
							{#if offlineReport.researchPointsEarned > 0}
								<div class="flex items-center gap-1">
									<span>🔬</span>
									<span class="text-sm font-bold text-neural-purple">
										+{offlineReport.researchPointsEarned} RP
									</span>
								</div>
							{/if}
						</div>

						<!-- Per-division breakdown -->
						{#if offlineReport.divisionReports.length > 0}
							<div class="space-y-1.5 text-left">
								{#each offlineReport.divisionReports as divReport}
									{@const divMeta = DIVISIONS[divReport.divisionId]}
									{#if divReport.cashEarned > 0 && divMeta}
										<div class="flex items-center justify-between text-xs">
											<div class="flex items-center gap-1.5">
												<span class="text-sm">{divMeta.icon}</span>
												<span class="text-text-secondary">{divMeta.name}</span>
											</div>
											<span class="text-bio-green font-mono tabular-nums font-medium">
												+{formatCurrency(divReport.cashEarned)}
											</span>
										</div>
									{/if}
								{/each}
							</div>
						{/if}

						<p class="text-[10px] text-text-muted pt-1">
							{Math.round(offlineReport.efficiency * 100)}% offline efficiency · Chiefs kept your divisions running
						</p>
					</div>
				{:else}
					<div class="bg-bg-tertiary/50 rounded-xl p-3 mb-3">
						<p class="text-sm text-text-secondary">
							Hire Division Chiefs to earn while you're away!
						</p>
						<p class="text-[10px] text-text-muted mt-1">
							Chiefs automate production so you earn offline
						</p>
					</div>
				{/if}

				{#if offlineReport && offlineReport.cashEarned > 0}
					<button
						onclick={() => { /* TODO: integrate ad SDK */ dismissWelcomeBack(); }}
						class="w-full py-3 px-6 rounded-xl bg-solar-gold/20 text-solar-gold font-semibold
							   border border-solar-gold/30 transition-all duration-200 active:scale-95 touch-manipulation mb-2"
					>
						📺 Watch Ad for 2x Earnings
					</button>
				{/if}

				<button
					onclick={dismissWelcomeBack}
					class="w-full py-3 px-6 rounded-xl bg-electric-blue text-white font-semibold
						   transition-all duration-200 active:scale-95 touch-manipulation"
				>
					Let's Go 🚀
				</button>
			</div>
		</div>
	{/if}

	<!-- Keyboard shortcuts -->
	<KeyboardShortcuts />

	<!-- Particle effects overlay -->
	<ParticleEffects />

	<!-- Tutorial overlay -->
	<TutorialOverlay />

	<!-- Mini-game overlay -->
	<MiniGame />

	<!-- Random event modal -->
	<EventModal />

	<!-- What's New modal -->
	<!-- WhatsNew removed -->

	<!-- Daily reward removed -->

	<!-- Synergy celebration modal -->
	<SynergyCelebration
		synergy={$celebrationState.activeSynergy}
		visible={$celebrationState.activeSynergy !== null}
		onDismiss={dismissCelebration}
	/>

	<div class="game-shell min-h-screen bg-bg-primary flex flex-col">
		<!-- Fixed top resource bar -->
		<ResourceBar />
		<NewsTicker />
		<SeasonalBanner />
		<SaveIndicator />
		<ToastContainer />
		<FloatingText />

		<!-- Screen reader announcements for game events -->
		<div id="game-announcements" class="sr-only" aria-live="assertive" aria-atomic="true"></div>

		<!-- Main scrollable content area -->
		<!-- Pull-to-refresh indicator -->
		{#if pullDistance > 10}
			<div
				class="fixed left-1/2 -translate-x-1/2 z-[60] text-text-muted text-xs font-medium transition-opacity"
				style="top: calc(env(safe-area-inset-top, 0px) + 3.5rem); opacity: {Math.min(pullDistance / 50, 1)};"
			>
				{pullDistance > 50 ? '💾 Release to save' : '↓ Pull to save'}
			</div>
		{/if}

		<main
			bind:this={mainEl}
			ontouchstart={(e) => { handleTouchStart(e); swipe.onTouchStart(e); }}
			ontouchmove={handleTouchMove}
			ontouchend={(e) => { handleTouchEnd(); swipe.onTouchEnd(e); }}
			class="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth"
			style="
				padding-top: calc(env(safe-area-inset-top, 0px) + 2.75rem);
				padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 5.5rem);
				{pullDistance > 0 ? `transform: translateY(${pullDistance}px);` : ''}
				transition: {pulling ? 'none' : 'transform 0.3s ease-out'};
			"
		>
			<div class="max-w-2xl mx-auto px-3 py-2">
				{@render children()}
			</div>
		</main>

		<!-- PWA install prompt -->
		<InstallPrompt />

		<!-- Fixed bottom tab bar -->
		<DivisionTabBar />
	</div>
</ErrorBoundary>
{/if}

<style>
	.game-shell {
		/* Prevent overscroll bounce on iOS */
		position: fixed;
		inset: 0;
		overflow: hidden;
	}

	main {
		-webkit-overflow-scrolling: touch;
	}

	.loading-logo {
		animation: logoBounce 1.5s ease-in-out infinite;
	}

	@keyframes logoBounce {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.1); opacity: 0.8; }
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2.5px solid rgba(255, 255, 255, 0.1);
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
