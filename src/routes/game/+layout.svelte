<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ResourceBar from '$lib/ui/ResourceBar.svelte';
	import DivisionTabBar from '$lib/ui/DivisionTabBar.svelte';
	import SaveIndicator from '$lib/ui/SaveIndicator.svelte';
	import ToastContainer from '$lib/ui/ToastContainer.svelte';
	import { activeTab } from '$lib/stores/navigation';
	import { gameManager } from '$lib/engine/GameManager';
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
	import { celebrationState, dismissCelebration } from '$lib/stores/synergyCelebrationStore';
	import { hapticTierPurchase, hapticProductionComplete, hapticPrestige } from '$lib/utils/haptics';
	import { eventBus } from '$lib/engine/EventBus';
	import type { OfflineReport } from '$lib/engine/OfflineCalculator';
	import { flashSaveIndicator } from '$lib/stores/saveIndicator';

	let { children } = $props();
	let loading = $state(true);
	let mainEl: HTMLElement | undefined = $state();
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

	onMount(async () => {
		// Wire up EventBus → toast notifications
		cleanupToasts = initToastListeners();
		cleanupAchievements = initAchievementListeners();
		cleanupActivity = initActivityListeners();

		const result = await gameManager.initialize();
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
		const savedTheme = localStorage.getItem('tech-tycoon-theme');
		if (savedTheme === 'light') {
			document.documentElement.classList.add('light');
		}

		loading = false;
	});

	onDestroy(() => {
		cleanupToasts?.();
		cleanupTutorial?.();
		cleanupAchievements?.();
		cleanupActivity?.();
		cleanupHaptics.forEach(fn => fn());
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
		if (dy > 0) {
			pullDistance = Math.min(dy * 0.4, 80);
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

	function formatOfflineTime(ms: number): string {
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}
</script>

<svelte:head>
	<title>Tech Tycoon — Playing</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

{#if loading}
	<!-- Branded loading screen -->
	<div class="fixed inset-0 bg-bg-primary flex items-center justify-center z-[100]">
		<div class="text-center">
			<div class="text-6xl mb-3 loading-logo">⚡</div>
			<h1 class="text-xl font-bold text-text-primary mb-1 tracking-tight">Tech Tycoon</h1>
			<p class="text-text-muted text-xs mb-6">Build the future. One tap at a time.</p>
			<div class="loading-spinner mx-auto"></div>
		</div>
	</div>
{:else}
	<!-- Welcome back overlay -->
	{#if showWelcomeBack}
		<div class="fixed inset-0 bg-bg-primary/95 backdrop-blur-sm flex items-center justify-center z-[90] px-4">
			<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-white/10 text-center">
				<div class="text-4xl mb-3">👋</div>
				<h2 class="text-xl font-bold text-text-primary mb-2">Welcome Back, Founder</h2>
				<p class="text-sm text-text-secondary mb-2">
					You were away for <span class="text-solar-gold font-semibold">{formatOfflineTime(offlineMs)}</span>.
				</p>

				{#if offlineReport && (offlineReport.cashEarned > 0 || offlineReport.researchPointsEarned > 0)}
					<div class="bg-bg-tertiary/50 rounded-xl p-3 mb-4 space-y-1.5">
						<p class="text-xs text-text-muted uppercase tracking-wider">While you were away</p>
						{#if offlineReport.cashEarned > 0}
							<div class="flex items-center justify-center gap-1.5">
								<span>💰</span>
								<span class="text-sm font-bold text-bio-green">
									+{formatCurrency(offlineReport.cashEarned)}
								</span>
							</div>
						{/if}
						{#if offlineReport.researchPointsEarned > 0}
							<div class="flex items-center justify-center gap-1.5">
								<span>🔬</span>
								<span class="text-sm font-bold text-neural-purple">
									+{offlineReport.researchPointsEarned} RP
								</span>
							</div>
						{/if}
						<p class="text-[10px] text-text-muted">
							{Math.round(offlineReport.efficiency * 100)}% offline efficiency
						</p>
					</div>
				{:else}
					<p class="text-sm text-text-secondary mb-4">
						Hire Division Chiefs to earn while you're away!
					</p>
				{/if}

				<button
					onclick={dismissWelcomeBack}
					class="w-full py-3 px-6 rounded-xl bg-electric-blue text-white font-semibold
						   transition-all duration-200 active:scale-95 touch-manipulation"
				>
					Let's Go
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

	<!-- Synergy celebration modal -->
	<SynergyCelebration
		synergy={$celebrationState.activeSynergy}
		visible={$celebrationState.activeSynergy !== null}
		onDismiss={dismissCelebration}
	/>

	<div class="game-shell min-h-screen bg-bg-primary flex flex-col">
		<!-- Fixed top resource bar -->
		<ResourceBar />
		<SaveIndicator />
		<ToastContainer />
		<FloatingText />

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
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
			class="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth"
			style="
				padding-top: calc(env(safe-area-inset-top, 0px) + 3.25rem);
				padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 3.75rem);
				transform: translateY({pullDistance}px);
				transition: {pulling ? 'none' : 'transform 0.3s ease-out'};
			"
		>
			<div class="max-w-2xl mx-auto px-3 py-4">
				{@render children()}
			</div>
		</main>

		<!-- PWA install prompt -->
		<InstallPrompt />

		<!-- Fixed bottom tab bar -->
		<DivisionTabBar />
	</div>
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
