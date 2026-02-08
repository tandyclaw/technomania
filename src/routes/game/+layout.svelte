<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ResourceBar from '$lib/ui/ResourceBar.svelte';
	import DivisionTabBar from '$lib/ui/DivisionTabBar.svelte';
	import { activeTab } from '$lib/stores/navigation';
	import { gameManager } from '$lib/engine/GameManager';
	import { formatCurrency } from '$lib/engine/BigNumber';
	import type { OfflineReport } from '$lib/engine/OfflineCalculator';

	let { children } = $props();
	let loading = $state(true);
	let isNewGame = $state(false);
	let offlineMs = $state(0);
	let offlineReport = $state<OfflineReport | null>(null);
	let showWelcomeBack = $state(false);

	onMount(async () => {
		const result = await gameManager.initialize();
		isNewGame = result.isNewGame;
		offlineMs = result.offlineMs;
		offlineReport = result.offlineReport;

		// Show welcome back screen if returning after >5 minutes
		if (!isNewGame && offlineMs > 5 * 60 * 1000) {
			showWelcomeBack = true;
		}

		loading = false;
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			gameManager.shutdown();
		}
	});

	function dismissWelcomeBack() {
		showWelcomeBack = false;
	}

	function formatOfflineTime(ms: number): string {
		const hours = Math.floor(ms / 3600000);
		const minutes = Math.floor((ms % 3600000) / 60000);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}
</script>

<svelte:head>
	<title>Technomania — Playing</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

{#if loading}
	<!-- Loading screen -->
	<div class="fixed inset-0 bg-bg-primary flex items-center justify-center z-[100]">
		<div class="text-center">
			<div class="text-4xl mb-4 animate-pulse">⚡</div>
			<p class="text-text-secondary text-sm">Loading Frontier Industries...</p>
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

	<div class="game-shell min-h-screen bg-bg-primary flex flex-col">
		<!-- Fixed top resource bar -->
		<ResourceBar />

		<!-- Main scrollable content area -->
		<main
			class="flex-1 overflow-y-auto overscroll-y-contain"
			style="
				padding-top: calc(env(safe-area-inset-top, 0px) + 3.25rem);
				padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 3.75rem);
			"
		>
			<div class="max-w-2xl mx-auto px-3 py-4">
				{@render children()}
			</div>
		</main>

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
</style>
