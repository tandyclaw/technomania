<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';

	const divisions = [
		{ id: 'helios', name: 'Helios Power', icon: '☀️', color: '#FFCC44', desc: 'Solar, batteries & grid storage' },
		{ id: 'apex', name: 'Apex Rocketry', icon: '🚀', color: '#FF4444', desc: 'Reusable rockets & space exploration' },
		{ id: 'volt', name: 'Volt Motors', icon: '🔋', color: '#4488FF', desc: 'Electric vehicles & gigafactories' },
	];

	let cash = $derived($gameState.cash);
	let rp = $derived($gameState.researchPoints);
	let prestigeCount = $derived($gameState.prestigeCount);
</script>

<div class="space-y-5">
	<!-- Welcome header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary">Frontier Industries</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			{#if prestigeCount > 0}
				IPO #{prestigeCount} · Building the future, again
			{:else}
				Welcome, Founder. Build your empire.
			{/if}
		</p>
	</div>

	<!-- Quick stats -->
	<div class="grid grid-cols-2 gap-2.5">
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/5">
			<div class="text-xs text-text-muted mb-1">Net Worth</div>
			<div class="text-lg font-bold text-text-primary tabular-nums">
				{formatCurrency(cash)}
			</div>
		</div>
		<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/5">
			<div class="text-xs text-text-muted mb-1">Research</div>
			<div class="text-lg font-bold text-text-primary tabular-nums">
				{formatNumber(rp, 0)} <span class="text-xs text-text-muted font-normal">RP</span>
			</div>
		</div>
	</div>

	<!-- Division cards -->
	<div>
		<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
			Divisions
		</h2>
		<div class="space-y-2.5">
			{#each divisions as div}
				{@const divState = $gameState.divisions[div.id as keyof typeof $gameState.divisions]}
				<div
					class="group bg-bg-secondary/40 rounded-xl p-4 border border-white/5
						   hover:border-white/10 transition-all duration-200"
				>
					<div class="flex items-center gap-3">
						<div
							class="w-11 h-11 rounded-lg flex items-center justify-center text-2xl shrink-0"
							style="background-color: {div.color}15;"
						>
							{div.icon}
						</div>
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-sm text-text-primary">{div.name}</h3>
							<p class="text-xs text-text-muted truncate">{div.desc}</p>
						</div>
						<div class="text-right shrink-0">
							{#if divState?.unlocked}
								<div class="text-xs text-bio-green font-medium">Active</div>
								<div class="text-[10px] text-text-muted">
									{divState.tiers.filter(t => t.unlocked).length}/{divState.tiers.length} tiers
								</div>
							{:else}
								<div class="text-xs text-text-muted">Locked</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Placeholder for events/activity feed -->
	<div>
		<h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
			Activity
		</h2>
		<div class="bg-bg-secondary/30 rounded-xl p-6 border border-white/5 text-center">
			<p class="text-sm text-text-muted">Start producing to see activity here</p>
		</div>
	</div>
</div>
