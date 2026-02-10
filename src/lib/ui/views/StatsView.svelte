<script lang="ts">
	import { gameState, type DivisionState } from '$lib/stores/gameState';
	import { DIVISIONS, type DivisionMeta } from '$lib/divisions';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import { getDivisionTrueIncomePerSec } from '$lib/engine/ProductionEngine';
	import { getPlanetInfo } from '$lib/systems/PrestigeSystem';

	const divisionIds = ['teslaenergy', 'tesla', 'spacex', 'ai', 'robotics'] as const;
	const divisionIcons: Record<string, string> = {
		teslaenergy: '⚡', tesla: '🏭', spacex: '🚀', ai: '🤖', robotics: '🦾'
	};
	const divisionNames: Record<string, string> = {
		teslaenergy: 'Energy', tesla: 'Manufacturing', spacex: 'Rockets', ai: 'AI', robotics: 'Robotics'
	};

	let state = $derived($gameState);
	let stats = $derived(state.stats);
	let hallOfFame = $derived(state.hallOfFame ?? { fastestColonyTimes: [], highestIncomePerSec: 0, mostColoniesLaunched: 0, totalCashAllTime: 0 });

	let divisionData = $derived(
		divisionIds.map((id) => {
			const meta = DIVISIONS[id]!;
			const divState = state.divisions[id];
			const incomePerSec = getDivisionTrueIncomePerSec(state, id);
			const totalOwned = divState.tiers.reduce((sum, t) => sum + t.count, 0);
			const producingTiers = divState.tiers.filter(t => t.producing).length;
			return { id, incomePerSec, totalOwned, producingTiers, unlocked: divState.unlocked, chiefLevel: divState.chiefLevel };
		})
	);

	let totalIncomePerSec = $derived(divisionData.reduce((sum, d) => sum + d.incomePerSec, 0));

	// Time formatting
	function formatPlaytime(ms: number): string {
		const totalSec = Math.floor(ms / 1000);
		const days = Math.floor(totalSec / 86400);
		const hours = Math.floor((totalSec % 86400) / 3600);
		const minutes = Math.floor((totalSec % 3600) / 60);
		if (days > 0) return `${days}d ${hours}h ${minutes}m`;
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}

	// Max income for bar chart scaling
	let maxDivisionIncome = $derived(Math.max(...divisionData.map(d => d.incomePerSec), 1));
	let maxDivisionOwned = $derived(Math.max(...divisionData.map(d => d.totalOwned), 1));

	// Prestige info
	let prestigeCount = $derived(state.prestigeCount ?? 0);
	let currentPlanet = $derived(getPlanetInfo(prestigeCount));
	let ngPlusLevel = $derived(state.ngPlusLevel ?? 0);

	// Fun facts
	let funFacts = $derived.by(() => {
		const facts: { icon: string; text: string }[] = [];
		const taps = stats.totalTaps;
		if (taps > 0) {
			// Average phone screen ~15cm², football field ~5351m² = 53510000 cm²
			const screens = taps; // one tap = one screen touch
			const footballFields = (screens * 15) / 53510000;
			if (footballFields >= 0.01) {
				facts.push({ icon: '👆', text: `Your ${formatNumber(taps, 0)} taps would cover ${footballFields.toFixed(2)} football fields` });
			} else {
				facts.push({ icon: '👆', text: `You've tapped ${formatNumber(taps, 0)} times — keep going!` });
			}
		}
		if (totalIncomePerSec > 0) {
			const perHour = totalIncomePerSec * 3600;
			facts.push({ icon: '💸', text: `Your empire produces ${formatCurrency(perHour)}/hour in real time` });
		}
		if (stats.playTimeMs > 3600000) {
			const cashPerHour = stats.totalCashEarned / (stats.playTimeMs / 3600000);
			facts.push({ icon: '⏱️', text: `Average earnings: ${formatCurrency(cashPerHour)}/hour of playtime` });
		}
		if (stats.totalProductions > 100) {
			facts.push({ icon: '🏭', text: `${formatNumber(stats.totalProductions, 0)} production cycles completed — that's a lot of widgets!` });
		}
		if (prestigeCount > 0) {
			facts.push({ icon: '🪐', text: `You've colonized ${prestigeCount} celestial ${prestigeCount === 1 ? 'body' : 'bodies'} across the solar system` });
		}
		if (stats.sessionsPlayed > 10) {
			facts.push({ icon: '🎮', text: `${stats.sessionsPlayed} sessions played — you're a dedicated mogul!` });
		}
		return facts;
	});
</script>

<div class="p-4 pb-24 space-y-4 max-w-2xl mx-auto">
	<!-- Header -->
	<div class="text-center mb-2">
		<h1 class="text-2xl font-bold">📊 Statistics</h1>
		<p class="text-sm text-text-muted mt-1">Your empire at a glance</p>
	</div>

	<!-- Overview Cards -->
	<div class="grid grid-cols-2 gap-3">
		<div class="stat-card">
			<span class="stat-icon">⏱️</span>
			<span class="stat-value">{formatPlaytime(stats.playTimeMs)}</span>
			<span class="stat-label">Total Playtime</span>
		</div>
		<div class="stat-card">
			<span class="stat-icon">🎮</span>
			<span class="stat-value">{formatNumber(stats.sessionsPlayed, 0)}</span>
			<span class="stat-label">Sessions Played</span>
		</div>
		<div class="stat-card">
			<span class="stat-icon">👆</span>
			<span class="stat-value">{formatNumber(stats.totalTaps, 0)}</span>
			<span class="stat-label">Total Taps</span>
		</div>
		<div class="stat-card">
			<span class="stat-icon">🏭</span>
			<span class="stat-value">{formatNumber(stats.totalProductions, 0)}</span>
			<span class="stat-label">Productions</span>
		</div>
	</div>

	<!-- All-Time Earnings -->
	<div class="card">
		<h2 class="card-title">💰 All-Time Earnings</h2>
		<div class="grid grid-cols-2 gap-3 mt-3">
			<div>
				<div class="text-lg font-bold text-green-400">{formatCurrency(stats.totalCashEarned)}</div>
				<div class="text-xs text-text-muted">Cash Earned</div>
			</div>
			<div>
				<div class="text-lg font-bold text-purple-400">{formatNumber(stats.totalResearchCompleted, 0)}</div>
				<div class="text-xs text-text-muted">Research Completed</div>
			</div>
			<div>
				<div class="text-lg font-bold text-yellow-400">{formatCurrency(hallOfFame.totalCashAllTime)}</div>
				<div class="text-xs text-text-muted">Hall of Fame Cash</div>
			</div>
			<div>
				<div class="text-lg font-bold text-blue-400">{formatCurrency(stats.highestIncomePerSec)}/s</div>
				<div class="text-xs text-text-muted">Peak Income</div>
			</div>
		</div>
	</div>

	<!-- Current Run -->
	<div class="card">
		<h2 class="card-title">🏃 Current Run</h2>
		<div class="grid grid-cols-2 gap-3 mt-3">
			<div>
				<div class="text-lg font-bold text-white">{formatCurrency(state.cash)}</div>
				<div class="text-xs text-text-muted">Current Cash</div>
			</div>
			<div>
				<div class="text-lg font-bold text-white">{formatCurrency(totalIncomePerSec)}/s</div>
				<div class="text-xs text-text-muted">Current Income</div>
			</div>
			<div>
				<div class="text-lg font-bold text-white">{formatNumber(state.researchPoints, 0)}</div>
				<div class="text-xs text-text-muted">Research Points</div>
			</div>
			<div>
				<div class="text-lg font-bold text-white">{state.purchasedUpgrades.length}</div>
				<div class="text-xs text-text-muted">Upgrades Bought</div>
			</div>
		</div>
	</div>

	<!-- Division Breakdown: Revenue Bar Chart -->
	<div class="card">
		<h2 class="card-title">📈 Revenue by Division</h2>
		<div class="space-y-2 mt-3">
			{#each divisionData as div}
				{@const pct = maxDivisionIncome > 0 ? (div.incomePerSec / maxDivisionIncome) * 100 : 0}
				<div class="flex items-center gap-2">
					<span class="w-5 text-center" title={divisionNames[div.id]}>{divisionIcons[div.id]}</span>
					<div class="flex-1">
						<div class="bar-track">
							<div
								class="bar-fill"
								style="width: {pct}%; background: {div.unlocked ? 'var(--color-accent, #60a5fa)' : '#333'};"
							></div>
						</div>
					</div>
					<span class="text-xs font-mono w-20 text-right {div.unlocked ? 'text-text-primary' : 'text-text-muted'}">
						{div.unlocked ? formatCurrency(div.incomePerSec, 1) + '/s' : 'Locked'}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Division Breakdown: Units Owned -->
	<div class="card">
		<h2 class="card-title">🏢 Units by Division</h2>
		<div class="space-y-2 mt-3">
			{#each divisionData as div}
				{@const pct = maxDivisionOwned > 0 ? (div.totalOwned / maxDivisionOwned) * 100 : 0}
				<div class="flex items-center gap-2">
					<span class="w-5 text-center">{divisionIcons[div.id]}</span>
					<div class="flex-1">
						<div class="bar-track">
							<div
								class="bar-fill"
								style="width: {pct}%; background: {div.unlocked ? '#a78bfa' : '#333'};"
							></div>
						</div>
					</div>
					<span class="text-xs font-mono w-16 text-right {div.unlocked ? 'text-text-primary' : 'text-text-muted'}">
						{div.unlocked ? formatNumber(div.totalOwned, 0) : 'Locked'}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Prestige Stats -->
	<div class="card">
		<h2 class="card-title">🪐 Prestige & Colonies</h2>
		<div class="grid grid-cols-2 gap-3 mt-3">
			<div>
				<div class="text-lg font-bold text-purple-300">{prestigeCount}</div>
				<div class="text-xs text-text-muted">Colonies Founded</div>
			</div>
			<div>
				<div class="text-lg font-bold text-purple-300">{currentPlanet.name} {currentPlanet.emoji}</div>
				<div class="text-xs text-text-muted">Current Planet</div>
			</div>
			<div>
				<div class="text-lg font-bold text-amber-300">{ngPlusLevel}</div>
				<div class="text-xs text-text-muted">New Game+ Level</div>
			</div>
			<div>
				<div class="text-lg font-bold text-amber-300">{formatNumber(stats.totalPrestiges, 0)}</div>
				<div class="text-xs text-text-muted">Total Prestiges</div>
			</div>
		</div>
		{#if hallOfFame.fastestColonyTimes.length > 0}
			<div class="mt-3 pt-3 border-t border-white/5">
				<div class="text-xs text-text-muted mb-2">🏅 Fastest Colony Times</div>
				<div class="space-y-1">
					{#each hallOfFame.fastestColonyTimes as record}
						<div class="flex justify-between text-xs">
							<span>{record.planetName ?? 'Colony'}</span>
							<span class="font-mono text-yellow-300">{formatPlaytime(record.timeMs)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Fun Facts -->
	{#if funFacts.length > 0}
		<div class="card">
			<h2 class="card-title">🎲 Fun Facts</h2>
			<div class="space-y-3 mt-3">
				{#each funFacts as fact}
					<div class="flex items-start gap-3 text-sm">
						<span class="text-xl">{fact.icon}</span>
						<span class="text-text-secondary">{fact.text}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 0.75rem;
		background: var(--color-bg-secondary, #1a1a2e);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 1rem;
	}
	.stat-icon {
		font-size: 1.5rem;
	}
	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary, #fff);
	}
	.stat-label {
		font-size: 0.65rem;
		color: var(--color-text-muted, #888);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.card {
		background: var(--color-bg-secondary, #1a1a2e);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 1rem;
		padding: 1rem;
	}
	.card-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary, #fff);
	}
	.bar-track {
		height: 8px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		overflow: hidden;
	}
	.bar-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.5s ease;
		min-width: 2px;
	}
</style>
