<script lang="ts">
	import { contractState, contractRevenueMult } from '$lib/systems/ContractSystem';
	import type { Contract } from '$lib/systems/ContractSystem';

	let contracts = $derived($contractState.active);
	let totalCompleted = $derived($contractState.totalCompleted);
	let revMult = $derived($contractRevenueMult);
	let now = $state(Date.now());

	// Update timer every 200ms
	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 200);
		return () => clearInterval(interval);
	});

	function timeRemaining(contract: Contract): string {
		if (contract.completed) return 'Complete!';
		if (contract.expired) return 'Expired';
		const remaining = Math.max(0, contract.timeLimitMs - (now - contract.createdAt));
		const totalSec = Math.ceil(remaining / 1000);
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		return `${min}:${sec.toString().padStart(2, '0')}`;
	}

	function progressPct(contract: Contract): number {
		if (contract.completed) return 100;
		if (contract.target.target <= 0) return 0;
		if (contract.target.type === 'income') {
			return Math.min(100, (contract.progress / contract.target.target) * 100);
		}
		return Math.min(100, (contract.progress / contract.target.target) * 100);
	}

	function timePct(contract: Contract): number {
		const elapsed = now - contract.createdAt;
		return Math.min(100, (elapsed / contract.timeLimitMs) * 100);
	}
</script>

<div class="space-y-5">
	<!-- Header -->
	<div>
		<div class="flex items-center gap-2">
			<h1 class="text-xl font-bold text-text-primary">📜 Contracts</h1>
			{#if totalCompleted > 0}
				<span class="px-2 py-0.5 rounded-md text-xs font-bold bg-bio-green/10 text-bio-green border border-bio-green/20">
					{totalCompleted} completed
				</span>
			{/if}
		</div>
		<p class="text-sm text-text-secondary mt-0.5">
			Timed challenges with bonus rewards. New contracts appear every few minutes.
		</p>
	</div>

	<!-- Revenue mult buff indicator -->
	{#if revMult.mult > 1 && now < revMult.expiresAt}
		{@const remaining = Math.ceil((revMult.expiresAt - now) / 1000)}
		<div class="bg-solar-gold/10 border border-solar-gold/20 rounded-xl p-3 flex items-center gap-2">
			<span class="text-lg">⚡</span>
			<div class="flex-1">
				<span class="text-sm font-semibold text-solar-gold">{revMult.mult}× Revenue Active</span>
				<span class="text-xs text-text-muted ml-2">{remaining}s remaining</span>
			</div>
		</div>
	{/if}

	<!-- Active Contracts -->
	{#if contracts.length === 0}
		<div class="bg-bg-secondary/30 rounded-xl p-8 border border-white/5 text-center">
			<div class="text-3xl mb-2">📜</div>
			<p class="text-sm text-text-muted">No active contracts right now.</p>
			<p class="text-xs text-text-muted mt-1">New contracts appear every 5-10 minutes.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each contracts as contract (contract.id)}
				{@const pct = progressPct(contract)}
				{@const tPct = timePct(contract)}
				{@const isUrgent = tPct > 75 && !contract.completed && !contract.expired}
				<div
					class="bg-bg-secondary/40 rounded-xl border overflow-hidden transition-all duration-300"
					class:border-bio-green/30={contract.completed}
					class:border-rocket-red/30={contract.expired}
					class:border-solar-gold/20={isUrgent && !contract.completed && !contract.expired}
					class:border-white/5={!contract.completed && !contract.expired && !isUrgent}
					class:opacity-50={contract.expired}
				>
					<div class="p-4">
						<div class="flex items-start gap-3">
							<span class="text-2xl shrink-0">{contract.icon}</span>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-semibold text-text-primary">{contract.description}</p>
								<div class="flex items-center gap-3 mt-1.5">
									<span class="text-xs text-text-muted">
										Reward: <span class="font-semibold text-solar-gold">{contract.reward.label}</span>
									</span>
									<span
										class="text-xs font-bold tabular-nums font-mono"
										class:text-bio-green={contract.completed}
										class:text-rocket-red={contract.expired}
										class:text-solar-gold={isUrgent && !contract.completed}
										class:text-text-secondary={!isUrgent && !contract.completed && !contract.expired}
									>
										{timeRemaining(contract)}
									</span>
								</div>

								<!-- Progress bar -->
								<div class="mt-2 w-full h-2 rounded-full bg-bg-tertiary overflow-hidden">
									<div
										class="h-full rounded-full transition-all duration-300"
										class:bg-bio-green={contract.completed}
										class:bg-electric-blue={!contract.completed && !contract.expired}
										class:bg-rocket-red={contract.expired}
										style="width: {pct}%;"
									></div>
								</div>
								<div class="flex justify-between mt-1">
									<span class="text-[10px] text-text-muted tabular-nums">
										{contract.target.type === 'income'
											? `$${formatCompact(contract.progress)}/s`
											: `${Math.floor(contract.progress)}`} / {contract.target.type === 'income'
											? `$${formatCompact(contract.target.target)}/s`
											: contract.target.target}
									</span>
									<span class="text-[10px] text-text-muted tabular-nums">{Math.floor(pct)}%</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Time bar at bottom -->
					{#if !contract.completed && !contract.expired}
						<div class="h-0.5 bg-bg-tertiary">
							<div
								class="h-full transition-all duration-200"
								class:bg-solar-gold={isUrgent}
								class:bg-text-muted={!isUrgent}
								style="width: {tPct}%; opacity: 0.4;"
							></div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<script context="module" lang="ts">
	function formatCompact(n: number): string {
		if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
		if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
		if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
		if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
		return n.toFixed(0);
	}
</script>
