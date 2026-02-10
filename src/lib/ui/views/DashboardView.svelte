<script lang="ts">
	import { gameState, type DivisionState } from '$lib/stores/gameState';
	import { DIVISIONS, type DivisionMeta } from '$lib/divisions';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { activeTab } from '$lib/stores/navigation';
	import SmoothProgressBar from '$lib/ui/SmoothProgressBar.svelte';
	import { getCycleDurationMs } from '$lib/systems/ProductionSystem';
	import { getDivisionTrueIncomePerSec } from '$lib/engine/ProductionEngine';
	import SynergyPanel from '$lib/ui/SynergyPanel.svelte';
	// activityFeed removed from dashboard
	import { getNgPlusAccentColor, getNgPlusHueShift } from '$lib/stores/ngPlus';
	import { gameManager } from '$lib/engine/GameManager';
	import IncomeSparkline from '$lib/ui/IncomeSparkline.svelte';
	import { getPlanetInfo } from '$lib/systems/PrestigeSystem';
	import { contractState } from '$lib/systems/ContractSystem';
	import type { Contract } from '$lib/systems/ContractSystem';
	import ShareCard from '$lib/ui/ShareCard.svelte';
	// Workers and Division Prestige removed

	// Division ordering for display
	const divisionIds = ['teslaenergy', 'tesla', 'spacex', 'ai', 'tunnels', 'robotics'] as const;

	let state = $derived($gameState);
	let prestigeCount = $derived(state.prestigeCount);
	let colonyTech = $derived(state.colonyTech);
	let marsProgress = $derived(state.marsColony?.progress ?? 0);
	let marsCompleted = $derived(state.marsColony?.completed ?? false);
	let ngPlusLevel = $derived(state.ngPlusLevel ?? 0);
	let ngAccent = $derived(getNgPlusAccentColor(ngPlusLevel));
	let ngHue = $derived(getNgPlusHueShift(ngPlusLevel));
	let currentPlanet = $derived(getPlanetInfo(prestigeCount));
	let nextPlanet = $derived(getPlanetInfo(prestigeCount + 1));
	let futurePlanet = $derived(getPlanetInfo(prestigeCount + 2));
	let showVictory = $state(false);
	let showColonyBreakdown = $state(false);
	let colonyBreakdown = $derived(gameManager.getMarsProgressBreakdown(state));
	let showShareCard = $state(false);
	let shareCardMilestone = $state<'colony' | 'billion' | 'all-divisions' | 'prestige' | 'custom'>('colony');

	// Logo tap easter egg
	let logoTapCount = $state(0);
	let logoTapTimer: ReturnType<typeof setTimeout> | null = null;
	let showLogoEasterEgg = $state(false);

	function handleLogoTap() {
		logoTapCount++;
		// Reset counter after 3s of no taps
		if (logoTapTimer) clearTimeout(logoTapTimer);
		logoTapTimer = setTimeout(() => { logoTapCount = 0; }, 3000);

		if (logoTapCount >= 10) {
			logoTapCount = 0;
			showLogoEasterEgg = true;
			// Set achievement flag
			gameState.update(s => ({
				...s,
				_achievementFlags: { ...((s as any)._achievementFlags ?? {}), logoTap10: true },
			} as any));
			// Hide animation after 2.5s
			setTimeout(() => { showLogoEasterEgg = false; }, 2500);
		}
	}

	function handleNewGamePlus() {
		const success = gameManager.newGamePlus();
		if (success) {
			showVictory = false;
		}
	}

	// Calculate per-division income/s (uses engine helper with ALL multipliers)
	function getDivisionIncomePerSec(divMeta: DivisionMeta, divState: DivisionState, divId: string): number {
		return getDivisionTrueIncomePerSec(state, divId);
	}

	// Calculate totals
	let divisionData = $derived(
		divisionIds.map((id) => {
			const meta = DIVISIONS[id]!;
			const divState = state.divisions[id];
			const incomePerSec = getDivisionIncomePerSec(meta, divState, id);
			const totalOwned = divState.tiers.reduce((sum, t) => sum + t.count, 0);
			const unlockedTiers = divState.tiers.filter((t) => t.unlocked).length;
			// Find the most active tier (highest progress if producing)
			const activeTier = divState.tiers.find((t) => t.producing && t.unlocked);
			return { id, meta, divState, incomePerSec, totalOwned, unlockedTiers, activeTier };
		})
	);

	let totalIncomePerSec = $derived(
		divisionData.reduce((sum, d) => sum + d.incomePerSec, 0)
	);

	let totalTiersOwned = $derived(
		divisionData.reduce((sum, d) => sum + d.totalOwned, 0)
	);

	let powerBalance = $derived(state.powerGenerated - state.powerConsumed);
	let prestigeMultiplier = $derived(1 + colonyTech * 0.03);

	let activeContracts = $derived($contractState.active.filter((c: Contract) => !c.completed && !c.expired));
	let dashNow = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => { dashNow = Date.now(); }, 500);
		return () => clearInterval(interval);
	});

	function contractTimeLeft(c: Contract): string {
		const remaining = Math.max(0, c.timeLimitMs - (dashNow - c.createdAt));
		const sec = Math.ceil(remaining / 1000);
		return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
	}

	function navigateToDivision(divId: string) {
		activeTab.set(divId);
	}
</script>

<div class="dashboard space-y-5" style={ngHue > 0 ? `filter: hue-rotate(${ngHue}deg);` : ''}>
	<!-- Welcome header -->
	<div>
		<div class="flex items-center gap-2">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<h1
				class="text-dashboard-title font-bold text-text-primary select-none cursor-pointer"
				class:logo-shake={showLogoEasterEgg}
				onclick={handleLogoTap}
			>{currentPlanet.emoji} Moonshot</h1>
			{#if ngPlusLevel > 0}
				<span
					class="px-2 py-0.5 rounded-md text-xs font-bold"
					style="background-color: {ngAccent}20; color: {ngAccent}; border: 1px solid {ngAccent}40;"
				>
					NG+{ngPlusLevel}
				</span>
			{/if}
		</div>
		<p class="text-sm text-text-secondary mt-0.5">
			{#if prestigeCount > 0}
				Timeline #{prestigeCount + 1} · {currentPlanet.emoji} {currentPlanet.name}{currentPlanet.distance !== '—' ? ` · ${currentPlanet.distance} from Earth` : ''}
			{:else}
				Make life multi-planetary. One tap at a time.
			{/if}
		</p>
	</div>

	<!-- Total Income Banner -->
	<div
		class="relative overflow-hidden rounded-xl p-4 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(68, 136, 255, 0.08) 100%);"
	>
		<div class="relative z-10">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1" id="total-income-label">
				Total Income
			</div>
			<div class="text-income-display font-bold text-text-primary tabular-nums font-mono">
				{formatCurrency(totalIncomePerSec, 2)}<span class="text-sm text-text-secondary font-normal">/s</span>
			</div>
		</div>
		<!-- Subtle background glow -->
		{#if totalIncomePerSec > 0}
			<div
				class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl"
				style="background: var(--color-bio-green);"
			></div>
		{/if}
		<!-- Income sparkline -->
		<div class="relative z-10">
			<IncomeSparkline incomePerSec={totalIncomePerSec} />
		</div>
	</div>

	<!-- Quick Stats Grid -->
	<div class="grid grid-cols-3 gap-2">
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03]">
			<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Tiers Owned</div>
			<div class="text-lg font-bold text-text-primary tabular-nums mt-0.5">
				{totalTiersOwned}
			</div>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03]">
			<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Power</div>
			<div class="text-lg font-bold tabular-nums mt-0.5"
				class:text-bio-green={powerBalance >= 0}
				class:text-rocket-red={powerBalance < 0}
			>
				{powerBalance >= 0 ? '+' : ''}{formatNumber(powerBalance, 1)}
				<span class="text-[10px] text-text-muted font-normal">MW</span>
			</div>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03]">
			<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Colony Tech</div>
			<div class="text-lg font-bold text-neural-purple tabular-nums mt-0.5">
				{#if colonyTech > 0}
					×{prestigeMultiplier.toFixed(1)}
				{:else}
					<span class="text-text-muted">—</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Share Progress -->
	<button
		onclick={() => { shareCardMilestone = 'custom'; showShareCard = true; }}
		class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-electric-blue/10 to-neural-purple/10
			   border border-white/5 hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation
			   flex items-center justify-center gap-2 text-sm font-medium text-text-secondary"
	>
		<span>📤</span> Share Progress
	</button>

	<!-- Synergies -->
	<SynergyPanel />


	<!-- Active Contracts (compact) -->
	{#if activeContracts.length > 0}
		<div>
			<div class="flex items-center justify-between mb-2">
				<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider">Active Contracts</h2>
				<button onclick={() => activeTab.set('contracts')} class="text-[10px] text-electric-blue">View All →</button>
			</div>
			<div class="space-y-2">
				{#each activeContracts as contract (contract.id)}
					{@const pct = contract.target.target > 0 ? Math.min(100, (contract.progress / contract.target.target) * 100) : 0}
					<button
						onclick={() => activeTab.set('contracts')}
						class="w-full text-left bg-bg-secondary/40 rounded-lg border border-white/5 p-3 flex items-center gap-2.5 hover:border-white/10 transition-all active:scale-[0.98] touch-manipulation"
					>
						<span class="text-lg shrink-0">{contract.icon}</span>
						<div class="flex-1 min-w-0">
							<p class="text-xs text-text-primary truncate">{contract.description}</p>
							<div class="w-full h-1 rounded-full bg-bg-tertiary mt-1 overflow-hidden">
								<div class="h-full rounded-full bg-electric-blue transition-all duration-300" style="width: {pct}%;"></div>
							</div>
						</div>
						<span class="text-[10px] font-bold tabular-nums font-mono text-text-muted shrink-0">
							{contractTimeLeft(contract)}
						</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Colony Progress -->
	<div
		class="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 cursor-pointer select-none"
		onclick={() => showColonyBreakdown = !showColonyBreakdown}
		role="button"
		tabindex="0"
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showColonyBreakdown = !showColonyBreakdown; }}
	>
		<div class="flex items-center justify-between mb-2">
			<div class="flex items-center gap-2">
				<span class="text-lg">{nextPlanet.emoji}</span>
				<h2 class="text-sm font-semibold text-text-primary">{nextPlanet.name} Colony</h2>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="text-xs font-bold tabular-nums font-mono" style="color: {nextPlanet.color};">
					{marsProgress.toFixed(1)}%
				</span>
				<span class="text-[10px] text-text-muted transition-transform duration-200" class:rotate-180={showColonyBreakdown}>▼</span>
			</div>
		</div>
		<div class="w-full h-3 rounded-full bg-bg-tertiary overflow-hidden" role="progressbar" aria-valuenow={Math.round(marsProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="{nextPlanet.name} colony progress">
			<div
				class="h-full rounded-full transition-all duration-500 colony-progress-bar"
				style="width: {marsProgress}%; background: linear-gradient(90deg, {currentPlanet.color}, {nextPlanet.color}); --bar-color-1: {currentPlanet.color}; --bar-color-2: {nextPlanet.color};"
			></div>
		</div>
		<p class="text-[10px] text-text-muted mt-1.5">
			{#if marsCompleted}
				🎉 Colony established!
				<button onclick={() => showVictory = true} class="text-electric-blue underline ml-1">View Victory</button>
			{:else if marsProgress >= 75}
				Almost there — final preparations underway
			{:else if marsProgress >= 50}
				Colony infrastructure taking shape
			{:else if marsProgress >= 25}
				Supply lines established
			{:else}
				Complete all divisions, tiers, and research to colonize {nextPlanet.name}
			{/if}
		</p>
		{#if showColonyBreakdown}
			<div class="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-text-secondary">
				<div class="flex justify-between">
					<span>🏢 Divisions</span>
					<span class="tabular-nums">{colonyBreakdown.divisions}/{colonyBreakdown.divisionsMax}% — {colonyBreakdown.divisionsUnlocked}/{colonyBreakdown.divisionsTotal} unlocked</span>
				</div>
				<div class="flex justify-between">
					<span>🔓 Tiers</span>
					<span class="tabular-nums">{colonyBreakdown.tiers}/{colonyBreakdown.tiersMax}% — {colonyBreakdown.tiersUnlocked}/{colonyBreakdown.tiersTotal} unlocked</span>
				</div>
				<div class="flex justify-between">
					<span>📈 Levels</span>
					<span class="tabular-nums">{colonyBreakdown.levels}/{colonyBreakdown.levelsMax}% — {colonyBreakdown.levelsCurrent}/{colonyBreakdown.levelsTarget}</span>
				</div>
				<div class="flex justify-between">
					<span>🔬 Research</span>
					<span class="tabular-nums">{colonyBreakdown.research}/{colonyBreakdown.researchMax}% — {colonyBreakdown.researchDone}/{colonyBreakdown.researchTotal} completed</span>
				</div>
				<div class="flex justify-between">
					<span>👔 Chiefs</span>
					<span class="tabular-nums">{colonyBreakdown.chiefs}/{colonyBreakdown.chiefsMax}% — {colonyBreakdown.chiefsCurrent}/{colonyBreakdown.chiefsTotal} levels</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Division Cards -->
	<div>
		<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
			Divisions
		</h2>
		<div class="space-y-2.5">
			{#each divisionData as div}
				{@const isUnlocked = div.divState.unlocked}
				<button
					onclick={() => navigateToDivision(div.id)}
					class="division-card group w-full text-left bg-bg-secondary/40 rounded-xl border border-white/5
						   hover:border-white/10 transition-all duration-200 overflow-hidden
						   active:scale-[0.98] touch-manipulation
						   {isUnlocked ? '' : 'opacity-50'}"
				>
					<div class="p-4">
						<div class="flex items-center gap-3">
							<!-- Division icon -->
							<div
								class="relative w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0
									   transition-transform duration-200 group-hover:scale-105"
								style="background-color: {div.meta.color}12; border: 1px solid {div.meta.color}20;"
							>
								{div.meta.icon}
								{#if div.activeTier}
									<span class="production-spinner absolute -bottom-0.5 -right-0.5 text-[10px]">⚙️</span>
								{/if}
							</div>

							<!-- Division info -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between gap-2">
									<h3 class="font-semibold text-sm text-text-primary truncate">
										{div.meta.name}
									</h3>
									{#if isUnlocked && div.incomePerSec > 0}
										<span
											class="text-xs font-bold tabular-nums font-mono shrink-0"
											style="color: {div.meta.color};"
										>
											{formatCurrency(div.incomePerSec, 1)}/s
										</span>
									{/if}
								</div>

								<p class="text-xs text-text-muted truncate mt-0.5">
									{div.meta.description}
								</p>

								{#if isUnlocked}
									<!-- Stats row -->
									<div class="flex items-center gap-3 mt-1.5">
										<span class="text-[10px] text-text-muted">
											<span class="font-semibold text-text-secondary">{div.unlockedTiers}</span>/{div.divState.tiers.length} tiers
										</span>
										<span class="text-[10px] text-text-muted">
											<span class="font-semibold text-text-secondary">{div.totalOwned}</span> owned
										</span>
										{#if div.divState.chiefLevel > 0}
											<span class="text-[10px] font-semibold" style="color: {div.meta.color};">
												👔 Lv.{div.divState.chiefLevel}
											</span>
										{/if}
									</div>
								{:else}
									<div class="flex items-center gap-1.5 mt-1.5">
										<span class="text-[10px] text-text-muted">🔒 Locked</span>
									</div>
								{/if}
							</div>

							<!-- Chevron -->
							<div class="text-text-muted/40 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</div>
						</div>
					</div>

					<!-- Production progress bar at the bottom of the card -->
					{#if isUnlocked && div.activeTier}
						{@const tierIndex = div.divState.tiers.indexOf(div.activeTier)}
						{@const tierData = div.meta.tiers[tierIndex]}
						<div class="px-4 pb-2">
							<div
								class="w-full rounded-full overflow-hidden"
								style="height: 2px; background-color: var(--color-bg-tertiary);"
							>
								<SmoothProgressBar
									producing={div.activeTier.producing}
									progress={div.activeTier.progress}
									cycleDurationMs={tierData ? getCycleDurationMs(tierData.config, div.divState.chiefLevel) : 1000}
									color={div.meta.color}
								/>
							</div>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Net Worth & Activity -->
	<div class="grid grid-cols-2 gap-2.5">
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/5">
			<div class="text-xs text-text-muted mb-1">Net Worth</div>
			<div class="text-lg font-bold text-text-primary tabular-nums font-mono">
				{formatCurrency(state.cash)}
			</div>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/5">
			<div class="text-xs text-text-muted mb-1">Research</div>
			<div class="text-lg font-bold text-text-primary tabular-nums font-mono">
				{formatNumber(state.researchPoints, 0)} <span class="text-xs text-text-muted font-normal">RP</span>
			</div>
		</div>
	</div>

	<!-- Activity feed removed — was cluttering the UI -->
</div>

<!-- Logo Easter Egg Confetti -->
{#if showLogoEasterEgg}
	<div class="confetti-container">
		{#each Array(30) as _, i}
			<div
				class="confetti-piece"
				style="left: {Math.random() * 100}%; animation-delay: {Math.random() * 0.8}s; background-color: {['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bb5','#a855f7'][i % 6]}; border-radius: {Math.random() > 0.5 ? '50%' : '2px'}; width: {6 + Math.random() * 8}px; height: {6 + Math.random() * 8}px;"
			></div>
		{/each}
		<div class="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none">
			<span class="text-6xl animate-bounce">🥚</span>
		</div>
	</div>
{/if}

<!-- Victory Screen -->
{#if showVictory}
	<div
		class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4 modal-mobile-fullscreen-container"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-solar-gold/30 text-center modal-mobile-fullscreen">
			<div class="text-5xl mb-3">{nextPlanet.emoji}</div>
			<h2 class="text-xl font-bold mb-1" style="color: {nextPlanet.color};">{nextPlanet.name} Colony Established!</h2>
			<p class="text-sm text-text-secondary mb-1">Humanity is now multi-planetary.</p>
			<p class="text-xs text-text-muted mb-4">
				Next stop: {futurePlanet.emoji} {futurePlanet.name}{futurePlanet.distance !== '—' ? ` — ${futurePlanet.distance} away` : ''}
				{#if futurePlanet.costMultiplier > nextPlanet.costMultiplier}
					<br/><span style="color: {futurePlanet.color};">⚠️ Cost multiplier: ×{futurePlanet.costMultiplier}</span>
				{/if}
			</p>

			<div class="bg-bg-tertiary/50 rounded-xl p-4 space-y-2 mb-4 text-left">
				<div class="flex justify-between text-sm">
					<span class="text-text-muted">Time Played</span>
					<span class="text-text-primary font-mono tabular-nums">
						{Math.floor(state.stats.playTimeMs / 3600000)}h {Math.floor((state.stats.playTimeMs % 3600000) / 60000)}m
					</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-text-muted">Total Cash Earned</span>
					<span class="text-text-primary font-mono tabular-nums">{formatCurrency(state.stats.totalCashEarned)}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-text-muted">Total Taps</span>
					<span class="text-text-primary font-mono tabular-nums">{formatNumber(state.stats.totalTaps, 0)}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-text-muted">Colonies</span>
					<span class="text-text-primary font-mono tabular-nums">{state.stats.totalPrestiges}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-text-muted">Achievements</span>
					<span class="text-text-primary font-mono tabular-nums">{state.achievements.length}</span>
				</div>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => showVictory = false}
					class="flex-1 py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold text-sm
						   transition-all active:scale-95 touch-manipulation"
				>
					Continue
				</button>
				<button
					onclick={handleNewGamePlus}
					class="flex-1 py-3 px-4 rounded-xl font-semibold text-sm
						   transition-all active:scale-95 touch-manipulation"
					style="background: linear-gradient(135deg, #FFD93D20, #EF444420); color: #FFD93D; border: 1px solid #FFD93D40;"
				>
					🔄 New Game+
				</button>
			</div>
			<button
				onclick={() => { showVictory = false; shareCardMilestone = 'colony'; showShareCard = true; }}
				class="w-full mt-2 py-2 px-4 rounded-xl bg-white/5 text-text-muted font-medium text-xs
					   transition-all active:scale-95 touch-manipulation hover:bg-white/10"
			>
				📤 Share Achievement
			</button>
			<p class="text-[10px] text-text-muted mt-2">
				NG+ resets progress but costs scale ×{(1.5 ** ((state.ngPlusLevel ?? 0) + 1)).toFixed(2)}
			</p>
		</div>
	</div>
{/if}

{#if showShareCard}
	<ShareCard milestone={shareCardMilestone} onClose={() => showShareCard = false} />
{/if}

<style>
	.division-card {
		-webkit-tap-highlight-color: transparent;
	}

	.production-spinner {
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.colony-progress-bar {
		background-size: 20px 20px;
		background-image: linear-gradient(
			45deg,
			rgba(255,255,255,0.1) 25%,
			transparent 25%,
			transparent 50%,
			rgba(255,255,255,0.1) 50%,
			rgba(255,255,255,0.1) 75%,
			transparent 75%,
			transparent
		);
		animation: stripes 1s linear infinite;
	}

	@keyframes stripes {
		from { background-position: 0 0; }
		to { background-position: 20px 0; }
	}

	.logo-shake {
		animation: shake 0.4s ease-in-out 3;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-4px) rotate(-2deg); }
		75% { transform: translateX(4px) rotate(2deg); }
	}

	.confetti-container {
		pointer-events: none;
		position: fixed;
		inset: 0;
		z-index: 9999;
		overflow: hidden;
	}

	.confetti-piece {
		position: absolute;
		width: 10px;
		height: 10px;
		top: -10px;
		animation: confetti-fall 2.5s ease-in forwards;
	}

	@keyframes confetti-fall {
		0% { transform: translateY(0) rotate(0deg); opacity: 1; }
		100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
	}
</style>
