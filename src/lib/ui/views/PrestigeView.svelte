<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { gameManager } from '$lib/engine/GameManager';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { getPlanetInfo, calculateVisionPoints, MEGA_UPGRADES, getMegaUpgradeCategories, PRESTIGE_MILESTONES, getAchievedMilestones, getNextMilestone, type MegaUpgrade, type PlanetInfo } from '$lib/systems/PrestigeSystem';

	let gs = $derived($gameState);
	let colonyTech = $derived(gs.colonyTech);
	let prestigeCount = $derived(gs.prestigeCount);
	let totalValueEarned = $derived(gs.totalValueEarned);
	let currentMultiplier = $derived(gameManager.getPrestigeMultiplier(gs));
	let techEarnable = $derived(gameManager.calculatePrestigeVision(gs));
	let postPrestigeTech = $derived(colonyTech + techEarnable);
	let postPrestigeMultiplier = $derived(1 + postPrestigeTech * 0.03);
	let canPrestige = $derived(techEarnable > 0);

	// Vision Points
	let currentVP = $derived(gs.visionPoints ?? 0);
	let pendingVP = $derived(calculateVisionPoints(totalValueEarned));
	let vpRevenueBonus = $derived(Math.round(currentVP * 2));
	let purchasedMegas = $derived(gs.purchasedMegaUpgrades ?? []);

	// Mega-upgrade purchase with visual feedback
	let justPurchased = $state<string | null>(null);
	function buyMegaUpgrade(mu: MegaUpgrade) {
		gameState.update(s => {
			const vp = s.visionPoints ?? 0;
			const purchased = s.purchasedMegaUpgrades ?? [];
			if (purchased.includes(mu.id)) return s;
			if (vp < mu.cost) return s;
			return {
				...s,
				visionPoints: vp - mu.cost,
				purchasedMegaUpgrades: [...purchased, mu.id],
			};
		});
		justPurchased = mu.id;
		setTimeout(() => { justPurchased = null; }, 1500);
	}

	// Planet chain
	let currentPlanet = $derived(getPlanetInfo(prestigeCount));
	let nextPlanet = $derived(getPlanetInfo(prestigeCount + 1));
	let visitedPlanets = $derived(
		Array.from({ length: Math.min(prestigeCount + 1, 13) }, (_, i) => getPlanetInfo(i))
	);

	// Threshold: $200M for first Colony Tech point (log2(200M/100M) = 1)
	const BASE_THRESHOLD = 200_000_000;
	// Next tech point threshold: 100M * 2^(currentTech+1)
	let nextTechThreshold = $derived(100_000_000 * Math.pow(2, techEarnable + 1));
	let prevTechThreshold = $derived(techEarnable > 0 ? 100_000_000 * Math.pow(2, techEarnable) : 0);
	let progressToNext = $derived(
		techEarnable > 0
			? Math.min(1, (totalValueEarned - prevTechThreshold) / (nextTechThreshold - prevTechThreshold))
			: totalValueEarned / BASE_THRESHOLD
	);

	// Prestige milestones
	let achievedMilestones = $derived(getAchievedMilestones(prestigeCount));
	let nextMilestone = $derived(getNextMilestone(prestigeCount));

	// What you lose (calculated values)
	let currentCash = $derived(gs.cash);

	let showConfirmation = $state(false);
	let launchAnimating = $state(false);
	let launchPhase = $state<'ignition' | 'liftoff' | 'travel' | 'arrival'>('ignition');

	function openConfirmation() {
		if (!canPrestige) return;
		showConfirmation = true;
	}

	function cancelPrestige() {
		showConfirmation = false;
	}

	function executePrestige() {
		showConfirmation = false;
		launchAnimating = true;
		launchPhase = 'ignition';
		setTimeout(() => { launchPhase = 'liftoff'; }, 600);
		setTimeout(() => { launchPhase = 'travel'; }, 1400);
		setTimeout(() => {
			const earned = gameManager.prestige();
			if (earned > 0) {
				launchPhase = 'arrival';
				setTimeout(() => { launchAnimating = false; }, 2000);
			} else {
				launchAnimating = false;
			}
		}, 2200);
	}
</script>

<!-- Launch Cinematic Overlay -->
{#if launchAnimating}
	<div class="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
		<!-- Animated starfield background -->
		<div class="absolute inset-0 launch-starfield" style="background: radial-gradient(ellipse at center, {nextPlanet.color}22 0%, #000 70%);">
			{#each Array(30) as _, i}
				<div
					class="absolute w-0.5 h-0.5 bg-white rounded-full launch-star"
					style="left: {Math.random() * 100}%; top: {Math.random() * 100}%; animation-delay: {Math.random() * 2}s; animation-duration: {0.5 + Math.random() * 1.5}s;"
				></div>
			{/each}
		</div>

		<!-- Phase content -->
		<div class="relative z-10 text-center px-8">
			{#if launchPhase === 'ignition'}
				<div class="launch-shake">
					<div class="text-7xl mb-4 launch-rocket-ignite">🚀</div>
					<h1 class="text-2xl font-black text-white/90 tracking-tight">IGNITION SEQUENCE</h1>
					<div class="flex justify-center gap-1 mt-3">
						<span class="w-2 h-2 rounded-full bg-rocket-red animate-pulse"></span>
						<span class="w-2 h-2 rounded-full bg-solar-gold animate-pulse" style="animation-delay: 0.2s"></span>
						<span class="w-2 h-2 rounded-full bg-electric-blue animate-pulse" style="animation-delay: 0.4s"></span>
					</div>
				</div>
			{:else if launchPhase === 'liftoff'}
				<div class="launch-liftoff-content">
					<div class="text-7xl mb-4 launch-rocket-fly">🚀</div>
					<h1 class="text-2xl font-black text-white tracking-tight">LEAVING {currentPlanet.name.toUpperCase()}</h1>
					<p class="text-sm text-white/50 mt-2">Farewell, {currentPlanet.emoji} {currentPlanet.name}...</p>
				</div>
			{:else if launchPhase === 'travel'}
				<div class="launch-warp-content">
					<div class="text-4xl mb-2">✨</div>
					<h1 class="text-xl font-black text-white/80 tracking-tight">TRAVERSING THE VOID</h1>
					{#if nextPlanet.distance !== '—'}
						<p class="text-sm text-white/40 mt-1">{nextPlanet.distance} to destination</p>
					{/if}
				</div>
			{:else}
				<div class="launch-arrival-content">
					<div class="text-8xl mb-4 launch-planet-arrive">{nextPlanet.emoji}</div>
					<h1 class="text-3xl font-black text-white tracking-tight" style="text-shadow: 0 0 30px {nextPlanet.color};">
						WELCOME TO {nextPlanet.name.toUpperCase()}
					</h1>
					<p class="text-lg mt-2 font-bold" style="color: {nextPlanet.color};">+{techEarnable} Colony Tech Earned</p>
					{#if pendingVP > 0}
						<p class="text-sm text-solar-gold mt-1">+{pendingVP} Vision Points</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<div class="prestige-view space-y-5">
	<!-- Header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary flex items-center gap-2">
			<span>🪐</span> New Colony
		</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			Take your tech to a new frontier. Start fresh, but stronger.
		</p>
	</div>

	<!-- Planet Progression: Current → Next -->
	<div class="relative overflow-hidden rounded-xl border border-white/5" style="background: linear-gradient(135deg, {currentPlanet.color}12 0%, var(--color-bg-secondary) 40%, {nextPlanet.color}12 100%);">
		<div class="p-5">
			<div class="flex items-center justify-between gap-3">
				<!-- Current Planet -->
				<div class="flex-1 text-center">
					<div class="text-5xl mb-2 planet-float">{currentPlanet.emoji}</div>
					<div class="text-xs text-text-muted uppercase tracking-wider font-medium">Current</div>
					<div class="text-lg font-black" style="color: {currentPlanet.color};">{currentPlanet.name}</div>
					<div class="text-[10px] text-text-muted mt-0.5">{currentPlanet.description}</div>
				</div>

				<!-- Arrow / Journey -->
				<div class="flex flex-col items-center gap-1 px-2 shrink-0">
					<div class="text-xs text-text-muted font-mono">→</div>
					<div class="w-16 h-0.5 rounded-full relative overflow-hidden" style="background: {currentPlanet.color}30;">
						{#if canPrestige}
							<div class="absolute inset-0 journey-progress" style="background: linear-gradient(90deg, {currentPlanet.color}, {nextPlanet.color});"></div>
						{/if}
					</div>
					{#if nextPlanet.distance !== '—'}
						<div class="text-[9px] text-text-muted/60">{nextPlanet.distance}</div>
					{/if}
				</div>

				<!-- Next Planet -->
				<div class="flex-1 text-center {canPrestige ? '' : 'opacity-40'}">
					<div class="text-5xl mb-2 {canPrestige ? 'planet-float-delayed' : ''}">{nextPlanet.emoji}</div>
					<div class="text-xs text-text-muted uppercase tracking-wider font-medium">Next</div>
					<div class="text-lg font-black" style="color: {nextPlanet.color};">{nextPlanet.name}</div>
					<div class="text-[10px] text-text-muted mt-0.5">{nextPlanet.description}</div>
				</div>
			</div>

			{#if nextPlanet.costMultiplier > currentPlanet.costMultiplier}
				<div class="mt-3 text-center text-xs font-semibold px-3 py-1.5 rounded-lg mx-auto w-fit" style="background: {nextPlanet.color}15; color: {nextPlanet.color};">
					⚠️ Cost ×{currentPlanet.costMultiplier} → ×{nextPlanet.costMultiplier}
				</div>
			{/if}
		</div>
	</div>

	<!-- Planet Timeline -->
	{#if prestigeCount > 0}
		<div class="bg-bg-secondary/60 rounded-xl p-4 border border-white/[0.03]">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
				🌌 Journey So Far — Colony #{prestigeCount}
			</div>
			<div class="flex items-center gap-1 overflow-x-auto pb-1">
				{#each visitedPlanets as planet, i}
					<div class="flex items-center shrink-0">
						<div
							class="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all"
							style="border-color: {planet.color}; background: {i === prestigeCount ? planet.color + '30' : 'transparent'};"
							title="{planet.name}{planet.distance !== '—' ? ` · ${planet.distance}` : ''}"
						>
							{planet.emoji}
						</div>
						{#if i < visitedPlanets.length - 1}
							<div class="w-4 h-0.5 rounded-full" style="background: {planet.color}40;"></div>
						{/if}
					</div>
				{/each}
				<!-- Next planet (dimmed) -->
				<div class="flex items-center shrink-0">
					<div class="w-4 h-0.5 rounded-full bg-white/10"></div>
					<div
						class="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-dashed opacity-40"
						style="border-color: {nextPlanet.color};"
						title="{nextPlanet.name}"
					>
						{nextPlanet.emoji}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Colony Tech + Speed Display -->
	<div
		class="relative overflow-hidden rounded-xl p-5 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(68, 136, 255, 0.12) 100%);"
	>
		<div class="relative z-10">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
				Colony Tech
			</div>
			<div class="text-4xl font-black text-electric-blue tabular-nums font-mono">
				{colonyTech}
			</div>
			{#if colonyTech > 0}
				<div class="mt-2 flex items-center gap-2">
					<span class="text-sm text-text-secondary">Production Speed:</span>
					<span class="text-sm font-bold text-electric-blue">×{currentMultiplier.toFixed(2)}</span>
					<span class="text-xs text-text-muted">(+{Math.round((currentMultiplier - 1) * 100)}%)</span>
				</div>
			{:else}
				<p class="text-sm text-text-muted mt-2">
					Launch your first colony to earn Colony Tech.
				</p>
			{/if}
		</div>
		{#if colonyTech > 0}
			<div class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-3xl" style="background: var(--color-electric-blue);"></div>
		{/if}
	</div>

	<!-- Prestige Milestones (compact badges) -->
	{#if prestigeCount > 0 || canPrestige}
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03]">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">
				🏆 Milestones {#if nextMilestone}<span class="text-text-muted/50 normal-case">· Next: {nextMilestone.name} ({nextMilestone.colonies - prestigeCount} more)</span>{/if}
			</div>
			<div class="flex flex-wrap gap-1.5">
				{#each PRESTIGE_MILESTONES as milestone}
					{@const achieved = prestigeCount >= milestone.colonies}
					{@const isNext = nextMilestone?.colonies === milestone.colonies}
					<div
						class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all {achieved ? 'bg-solar-gold/10' : isNext ? 'bg-white/[0.04] border border-white/10' : 'opacity-30'}"
						title="{milestone.name}: {milestone.description} — {milestone.bonus}"
					>
						<span class="{achieved ? '' : 'grayscale'}">{milestone.emoji}</span>
						<span class="font-medium {achieved ? 'text-solar-gold' : 'text-text-muted'}">{milestone.colonies}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Vision Points -->
	<div
		class="relative overflow-hidden rounded-xl p-5 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(255, 204, 68, 0.12) 100%);"
	>
		<div class="relative z-10">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
				👁️ Vision Points
			</div>
			<div class="text-4xl font-black text-solar-gold tabular-nums font-mono">
				{currentVP}
			</div>
			{#if currentVP > 0}
				<div class="mt-2 flex items-center gap-2">
					<span class="text-sm text-text-secondary">Revenue Bonus:</span>
					<span class="text-sm font-bold text-solar-gold">+{vpRevenueBonus}%</span>
				</div>
			{/if}
			{#if pendingVP > 0}
				<div class="mt-2 p-2 bg-solar-gold/10 rounded-lg border border-solar-gold/20">
					<span class="text-xs text-solar-gold font-semibold">
						🔮 +{pendingVP} VP pending on next colony launch
					</span>
				</div>
			{/if}
		</div>
		{#if currentVP > 0}
			<div class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15 blur-3xl" style="background: var(--color-solar-gold);"></div>
		{/if}
	</div>

	<!-- Mega-Upgrades -->
	{#if currentVP > 0 || purchasedMegas.length > 0}
		<div class="bg-bg-secondary/60 rounded-xl p-4 border border-white/[0.03]">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
				⭐ Mega-Upgrades <span class="text-text-muted/50">(spend Vision Points)</span>
			</div>
			{#each getMegaUpgradeCategories() as category}
				{@const catUpgrades = MEGA_UPGRADES.filter(m => m.category === category)}
				<div class="mb-3 last:mb-0">
					<div class="text-[10px] text-text-muted/60 uppercase tracking-wider font-semibold mb-1.5 pl-1">{category}</div>
					<div class="space-y-1.5">
						{#each catUpgrades as mu}
							{@const owned = purchasedMegas.includes(mu.id)}
							{@const canAffordMega = currentVP >= mu.cost}
							{@const wasJustPurchased = justPurchased === mu.id}
							<div class="flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 {owned ? 'bg-solar-gold/10' : 'bg-bg-tertiary/30'} {wasJustPurchased ? 'mega-just-bought' : ''}">
								<div class="flex-1 min-w-0">
									<div class="text-sm font-semibold {owned ? 'text-solar-gold' : 'text-text-primary'}">
										{mu.name}
										{#if wasJustPurchased}
											<span class="text-solar-gold ml-1 mega-flash">⚡ ACTIVATED</span>
										{/if}
									</div>
									<div class="text-xs {owned ? 'text-solar-gold/60' : 'text-text-muted'}">{mu.description}</div>
									<!-- Show the actual effect clearly -->
									{#if mu.effect === 'speed'}
										<div class="text-[10px] mt-0.5 {owned ? 'text-electric-blue/80' : 'text-electric-blue/40'}">⚡ {mu.multiplier}× production speed</div>
									{:else if mu.effect === 'revenue'}
										<div class="text-[10px] mt-0.5 {owned ? 'text-bio-green/80' : 'text-bio-green/40'}">💰 {mu.multiplier}× all revenue</div>
									{:else if mu.effect === 'warp_drive'}
										<div class="text-[10px] mt-0.5 {owned ? 'text-electric-blue/80' : 'text-electric-blue/40'}">⏱️ -{Math.round((1 - mu.multiplier) * 100)}% cycle times</div>
									{:else if mu.effect === 'starting_cash'}
										<div class="text-[10px] mt-0.5 {owned ? 'text-solar-gold/80' : 'text-solar-gold/40'}">🏦 Start with {formatCurrency(mu.multiplier)}</div>
									{:else if mu.effect === 'auto_chiefs'}
										<div class="text-[10px] mt-0.5 {owned ? 'text-solar-gold/80' : 'text-solar-gold/40'}">🤖 Auto-hire chiefs on launch</div>
									{:else if mu.effect === 'lucky_start'}
										<div class="text-[10px] mt-0.5 {owned ? 'text-solar-gold/80' : 'text-solar-gold/40'}">🍀 {mu.multiplier}× event frequency (10 min)</div>
									{/if}
								</div>
								{#if owned}
									<span class="text-xs font-bold text-solar-gold px-2 py-1 bg-solar-gold/10 rounded-md">✅ Active</span>
								{:else}
									<button
										onclick={() => buyMegaUpgrade(mu)}
										disabled={!canAffordMega}
										class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95
											   disabled:opacity-40 disabled:cursor-not-allowed
											   {canAffordMega ? 'bg-solar-gold/15 text-solar-gold border border-solar-gold/25 hover:bg-solar-gold/25' : 'bg-bg-tertiary text-text-muted'}"
									>
										{mu.cost} VP
									</button>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- What You Give Up vs What You Gain — dramatic comparison -->
	<div class="rounded-xl overflow-hidden border border-white/5">
		<div class="grid grid-cols-2">
			<!-- SACRIFICE side -->
			<div class="p-4 relative" style="background: linear-gradient(180deg, rgba(255,68,68,0.08) 0%, transparent 100%);">
				<div class="text-[10px] text-rocket-red uppercase tracking-wider font-bold mb-3 flex items-center gap-1">
					<span>💥</span> You Sacrifice
				</div>
				<ul class="space-y-2">
					<li class="text-xs text-text-secondary">
						<span class="text-rocket-red font-bold">{formatCurrency(currentCash)}</span>
						<div class="text-[10px] text-text-muted">Cash</div>
					</li>
					<li class="text-xs text-text-secondary">
						<span class="text-rocket-red font-semibold">All Tiers</span>
						<div class="text-[10px] text-text-muted">Back to base</div>
					</li>
					<li class="text-xs text-text-secondary">
						<span class="text-rocket-red font-semibold">Managers</span>
						<div class="text-[10px] text-text-muted">Rehire needed</div>
					</li>
					<li class="text-xs text-text-secondary">
						<span class="text-rocket-red font-semibold">Treasury</span>
						<div class="text-[10px] text-text-muted">Reset to zero</div>
					</li>
				</ul>
			</div>

			<!-- GAIN side -->
			<div class="p-4 relative border-l border-white/5" style="background: linear-gradient(180deg, rgba(68,255,136,0.08) 0%, transparent 100%);">
				<div class="text-[10px] text-bio-green uppercase tracking-wider font-bold mb-3 flex items-center gap-1">
					<span>🌟</span> You Gain
				</div>
				<ul class="space-y-2">
					{#if techEarnable > 0}
						<li class="text-xs">
							<span class="text-electric-blue font-bold">+{techEarnable} Colony Tech</span>
							<div class="text-[10px] text-text-muted">Permanent speed</div>
						</li>
					{/if}
					{#if pendingVP > 0}
						<li class="text-xs">
							<span class="text-solar-gold font-bold">+{pendingVP} Vision Points</span>
							<div class="text-[10px] text-text-muted">Permanent revenue</div>
						</li>
					{/if}
					<li class="text-xs">
						<span class="text-bio-green font-semibold">Keep Research</span>
						<div class="text-[10px] text-text-muted">All unlocks stay</div>
					</li>
					<li class="text-xs">
						<span class="text-bio-green font-semibold">Keep All Divisions</span>
						<div class="text-[10px] text-text-muted">Unlocked forever</div>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Current Run Stats -->
	<div class="bg-bg-secondary/60 rounded-xl p-4 border border-white/[0.03]">
		<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
			This Colony
		</div>
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-secondary">Total Value Earned</span>
				<span class="text-sm font-bold text-text-primary tabular-nums font-mono">
					{formatCurrency(totalValueEarned)}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-secondary">Current Cash</span>
				<span class="text-sm font-bold text-text-primary tabular-nums font-mono">
					{formatCurrency(gs.cash)}
				</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-text-secondary">Launch Threshold</span>
				<span class="text-sm font-mono text-text-muted">
					{formatCurrency(BASE_THRESHOLD)} lifetime
				</span>
			</div>
		</div>
	</div>

	<!-- Colony Launch Preview / Progress -->
	<div class="rounded-xl p-4 border-2 transition-all duration-300 {canPrestige ? 'border-electric-blue bg-electric-blue/5' : 'border-white/5 bg-bg-secondary/40'}">
		<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
			{canPrestige ? '🚀 Launch Preview' : '🔒 Not Ready'}
		</div>

		{#if canPrestige}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">Colony Tech Earned</span>
					<span class="text-xl font-black text-electric-blue tabular-nums">+{techEarnable}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">New Total</span>
					<span class="text-sm font-bold text-text-primary tabular-nums">{colonyTech} → {postPrestigeTech}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-secondary">New Speed Bonus</span>
					<span class="text-sm font-bold text-electric-blue tabular-nums">×{currentMultiplier.toFixed(2)} → ×{postPrestigeMultiplier.toFixed(2)}</span>
				</div>
				{#if pendingVP > 0}
					<div class="flex items-center justify-between">
						<span class="text-sm text-text-secondary">Vision Points</span>
						<span class="text-sm font-bold text-solar-gold tabular-nums">+{pendingVP} VP</span>
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-sm text-text-muted">
				Earn at least <span class="font-bold text-text-secondary">{formatCurrency(BASE_THRESHOLD)}</span> lifetime value to launch a new colony.
				{#if totalValueEarned > 0}
					<br />
					<span class="text-xs mt-1 inline-block">
						Progress: {formatCurrency(totalValueEarned)} / {formatCurrency(BASE_THRESHOLD)}
						({(totalValueEarned / BASE_THRESHOLD * 100).toFixed(1)}%)
					</span>
				{/if}
			</p>
			<div class="mt-3">
				<div class="w-full h-2.5 rounded-full bg-bg-tertiary overflow-hidden">
					<div
						class="h-full rounded-full transition-all duration-500 progress-glow"
						style="width: {Math.max(0, Math.min(100, progressToNext * 100))}%; background: linear-gradient(90deg, var(--color-text-muted), var(--color-electric-blue));"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- The Big Launch Button -->
	<div class="pt-2 pb-4">
		<button
			onclick={openConfirmation}
			disabled={!canPrestige}
			class="launch-button group w-full relative overflow-hidden rounded-2xl p-5
				   transition-all duration-300 touch-manipulation
				   active:scale-[0.97]
				   disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
			class:launch-ready={canPrestige}
		>
			{#if canPrestige}
				<div class="absolute inset-0 launch-gradient" style="background: linear-gradient(135deg, {nextPlanet.color} 0%, {nextPlanet.color}88 50%, {nextPlanet.color}44 100%);"></div>
				<div class="absolute inset-0 launch-shimmer"></div>
				<!-- Particle effect on button -->
				<div class="absolute inset-0 overflow-hidden">
					{#each Array(6) as _, i}
						<div
							class="absolute w-1 h-1 rounded-full bg-white/30 launch-particle"
							style="left: {15 + i * 14}%; animation-delay: {i * 0.4}s;"
						></div>
					{/each}
				</div>
			{:else}
				<div class="absolute inset-0 bg-bg-tertiary"></div>
			{/if}

			<div class="relative z-10 text-center">
				<div class="text-3xl mb-1">🚀</div>
				<div class="text-xl font-black text-white tracking-tight">
					{canPrestige ? `LAUNCH COLONY ON ${nextPlanet.name.toUpperCase()}` : 'NOT READY'}
				</div>
				<div class="text-sm mt-1 {canPrestige ? 'text-white/70' : 'text-text-muted'}">
					{#if canPrestige}
						{nextPlanet.emoji} {nextPlanet.distance !== '—' ? `${nextPlanet.distance} away · ` : ''}<span class="font-bold text-white">+{techEarnable} Tech</span>{#if pendingVP > 0} · <span class="text-solar-gold">+{pendingVP} VP</span>{/if}
					{:else}
						Earn {formatCurrency(BASE_THRESHOLD)} lifetime to unlock
					{/if}
				</div>
			</div>
		</button>
	</div>

	<!-- Formula explanation -->
	<div class="bg-bg-secondary/30 rounded-xl p-4 border border-white/5">
		<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">
			📐 How Colony Tech Works
		</div>
		<div class="space-y-1.5">
			<p class="text-xs text-text-muted">
				Each Colony Tech point gives <span class="text-electric-blue font-semibold">+3%</span> production speed, permanently.
			</p>
			<p class="text-xs text-text-muted">
				Colony Tech is earned based on your lifetime earnings when you launch.
			</p>
			<p class="text-xs text-text-muted">
				Each planet has a cost multiplier — farther worlds mean higher prices but more Colony Tech.
			</p>
		</div>
	</div>
</div>

<!-- Confirmation Dialog -->
{#if showConfirmation}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border shadow-2xl confirm-enter max-h-[85vh] overflow-y-auto" style="border-color: {nextPlanet.color}40;">
			<div class="text-center">
				<!-- Planet transition visual -->
				<div class="flex items-center justify-center gap-4 mb-4">
					<div class="text-center">
						<div class="text-3xl">{currentPlanet.emoji}</div>
						<div class="text-[10px] text-text-muted mt-1">{currentPlanet.name}</div>
					</div>
					<div class="text-2xl text-text-muted animate-pulse">→</div>
					<div class="text-center">
						<div class="text-4xl confirm-planet-glow">{nextPlanet.emoji}</div>
						<div class="text-[10px] font-bold mt-1" style="color: {nextPlanet.color};">{nextPlanet.name}</div>
					</div>
				</div>

				<h2 class="text-xl font-black text-text-primary">Launch to {nextPlanet.name}?</h2>
				{#if nextPlanet.distance !== '—'}
					<p class="text-xs text-text-muted mt-1">📏 {nextPlanet.distance} from Earth</p>
				{/if}

				{#if nextPlanet.costMultiplier > currentPlanet.costMultiplier}
					<div class="mt-3 p-2 rounded-lg text-xs font-semibold" style="background: {nextPlanet.color}15; color: {nextPlanet.color};">
						⚠️ Cost multiplier: ×{currentPlanet.costMultiplier} → ×{nextPlanet.costMultiplier}
					</div>
				{/if}

				<!-- Gains summary -->
				<div class="bg-bg-tertiary/50 rounded-xl p-3 mt-4 space-y-1.5">
					<div class="flex items-center justify-between">
						<span class="text-xs text-text-muted">Colony Tech</span>
						<span class="text-sm font-bold text-electric-blue">{colonyTech} → {postPrestigeTech} <span class="text-xs text-electric-blue/60">(+{techEarnable})</span></span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-text-muted">Speed Bonus</span>
						<span class="text-sm font-bold text-electric-blue">×{currentMultiplier.toFixed(2)} → ×{postPrestigeMultiplier.toFixed(2)}</span>
					</div>
					{#if pendingVP > 0}
						<div class="flex items-center justify-between">
							<span class="text-xs text-text-muted">Vision Points</span>
							<span class="text-sm font-bold text-solar-gold">+{pendingVP} VP</span>
						</div>
					{/if}
				</div>

				<!-- What resets -->
				<div class="mt-3 p-2 bg-rocket-red/8 rounded-lg">
					<span class="text-[10px] text-rocket-red font-semibold">
						💥 Resets: {formatCurrency(currentCash)} cash, all tiers, managers, treasury
					</span>
				</div>
			</div>

			<div class="flex gap-3 mt-6">
				<button
					onclick={cancelPrestige}
					class="flex-1 py-3 px-4 rounded-xl bg-bg-tertiary text-text-secondary font-semibold
						   transition-all duration-200 active:scale-95 touch-manipulation"
				>
					Not Yet
				</button>
				<button
					onclick={executePrestige}
					class="flex-1 py-3 px-4 rounded-xl font-semibold text-white
						   transition-all duration-200 active:scale-95 touch-manipulation launch-confirm-btn"
					style="background: linear-gradient(135deg, {nextPlanet.color} 0%, {nextPlanet.color}88 100%);"
				>
					🚀 Launch
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Planet floating animation */
	.planet-float {
		animation: planetFloat 4s ease-in-out infinite;
	}
	.planet-float-delayed {
		animation: planetFloat 4s ease-in-out infinite;
		animation-delay: 2s;
	}
	@keyframes planetFloat {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-4px); }
	}

	/* Journey progress bar animation */
	.journey-progress {
		animation: journeyPulse 2s ease-in-out infinite;
	}
	@keyframes journeyPulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}

	/* Progress bar glow */
	.progress-glow {
		box-shadow: 0 0 8px rgba(68, 136, 255, 0.3);
	}

	/* Launch button shimmer */
	.launch-shimmer {
		background: linear-gradient(
			110deg,
			transparent 20%,
			rgba(255, 255, 255, 0.08) 40%,
			rgba(255, 255, 255, 0.12) 50%,
			rgba(255, 255, 255, 0.08) 60%,
			transparent 80%
		);
		background-size: 200% 100%;
		animation: shimmer 3s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	.launch-ready:hover .launch-shimmer {
		animation-duration: 1.5s;
	}

	/* Launch button particles */
	.launch-particle {
		animation: particleRise 3s ease-out infinite;
	}
	@keyframes particleRise {
		0% { bottom: -4px; opacity: 0; }
		20% { opacity: 0.6; }
		100% { bottom: 100%; opacity: 0; }
	}

	/* Launch cinematic */
	.launch-starfield {
		animation: starfieldFadeIn 0.5s ease-out;
	}
	@keyframes starfieldFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.launch-star {
		animation: starTwinkle 1s ease-in-out infinite;
	}
	@keyframes starTwinkle {
		0%, 100% { opacity: 0.2; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.5); }
	}

	.launch-shake {
		animation: shake 0.6s ease-in-out infinite;
	}
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-2px) translateY(1px); }
		75% { transform: translateX(2px) translateY(-1px); }
	}

	.launch-rocket-ignite {
		animation: rocketIgnite 0.6s ease-in-out infinite;
	}
	@keyframes rocketIgnite {
		0%, 100% { transform: translateY(0); filter: brightness(1); }
		50% { transform: translateY(-3px); filter: brightness(1.3); }
	}

	.launch-liftoff-content {
		animation: fadeInUp 0.4s ease-out;
	}
	.launch-rocket-fly {
		animation: rocketFly 1s ease-in forwards;
	}
	@keyframes rocketFly {
		0% { transform: translateY(0) scale(1); opacity: 1; }
		100% { transform: translateY(-200px) scale(0.3); opacity: 0; }
	}

	.launch-warp-content {
		animation: warpPulse 0.8s ease-in-out infinite;
	}
	@keyframes warpPulse {
		0%, 100% { transform: scale(1); opacity: 0.7; }
		50% { transform: scale(1.05); opacity: 1; }
	}

	.launch-arrival-content {
		animation: fadeInUp 0.6s ease-out;
	}
	.launch-planet-arrive {
		animation: planetArrive 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	@keyframes planetArrive {
		0% { transform: scale(0) rotate(-20deg); opacity: 0; }
		100% { transform: scale(1) rotate(0deg); opacity: 1; }
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Confirmation dialog */
	.confirm-enter {
		animation: confirmSlideUp 0.3s ease-out;
	}
	@keyframes confirmSlideUp {
		from { opacity: 0; transform: translateY(20px) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.confirm-planet-glow {
		animation: planetGlow 2s ease-in-out infinite;
	}
	@keyframes planetGlow {
		0%, 100% { filter: brightness(1) drop-shadow(0 0 0 transparent); }
		50% { filter: brightness(1.2) drop-shadow(0 0 12px rgba(255, 255, 255, 0.3)); }
	}

	.launch-confirm-btn {
		animation: confirmBtnPulse 2s ease-in-out infinite;
	}
	@keyframes confirmBtnPulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1); }
		50% { box-shadow: 0 0 15px 3px rgba(255, 255, 255, 0.1); }
	}

	/* Mega-upgrade purchase flash */
	.mega-just-bought {
		animation: megaBuyFlash 1.5s ease-out;
	}
	@keyframes megaBuyFlash {
		0% { background: rgba(255, 204, 68, 0.3); transform: scale(1.02); }
		100% { background: rgba(255, 204, 68, 0.06); transform: scale(1); }
	}
	.mega-flash {
		animation: megaFlashText 1.5s ease-out;
	}
	@keyframes megaFlashText {
		0% { opacity: 1; }
		100% { opacity: 0; }
	}
</style>
