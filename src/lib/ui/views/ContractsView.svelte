<script lang="ts">
	import { contractState, contractRevenueMult } from '$lib/systems/ContractSystem';
	import type { Contract } from '$lib/systems/ContractSystem';

	let contracts = $derived($contractState.active);
	let totalCompleted = $derived($contractState.totalCompleted);
	let revMult = $derived($contractRevenueMult);
	let now = $state(Date.now());

	function formatCompact(n: number): string {
		if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
		if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
		if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
		if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
		return n.toFixed(0);
	}

	// Update timer every 200ms
	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 200);
		return () => clearInterval(interval);
	});

	function timeRemaining(contract: Contract): string {
		if (contract.completed) return '✓ Complete!';
		if (contract.expired) return '✗ Expired';
		const remaining = Math.max(0, contract.timeLimitMs - (now - contract.createdAt));
		const totalSec = Math.ceil(remaining / 1000);
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		return `${min}:${sec.toString().padStart(2, '0')}`;
	}

	function progressPct(contract: Contract): number {
		if (contract.completed) return 100;
		if (contract.target.target <= 0) return 0;
		return Math.min(100, (contract.progress / contract.target.target) * 100);
	}

	function timePct(contract: Contract): number {
		const elapsed = now - contract.createdAt;
		return Math.min(100, (elapsed / contract.timeLimitMs) * 100);
	}

	function rewardColor(type: string): string {
		switch (type) {
			case 'cash': return 'text-green-400';
			case 'rp': return 'text-electric-blue';
			case 'revenue_mult': return 'text-solar-gold';
			case 'chief_upgrade': return 'text-purple-400';
			default: return 'text-solar-gold';
		}
	}

	function rewardIcon(type: string): string {
		switch (type) {
			case 'cash': return '💵';
			case 'rp': return '🔬';
			case 'revenue_mult': return '⚡';
			case 'chief_upgrade': return '👑';
			default: return '🎁';
		}
	}

	let activeContracts = $derived(contracts.filter(c => !c.completed && !c.expired));
	let completedContracts = $derived(contracts.filter(c => c.completed));
	let expiredContracts = $derived(contracts.filter(c => c.expired));
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-xl font-bold text-text-primary">📜 Contracts</h1>
				{#if totalCompleted > 0}
					<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bio-green/15 text-bio-green border border-bio-green/20">
						{totalCompleted} done
					</span>
				{/if}
			</div>
			<p class="text-xs text-text-muted mt-0.5">
				Complete timed challenges for bonus rewards
			</p>
		</div>
		<div class="text-right">
			<div class="text-[10px] text-text-muted">Active</div>
			<div class="text-lg font-bold text-text-primary tabular-nums">{activeContracts.length}<span class="text-text-muted text-sm">/3</span></div>
		</div>
	</div>

	<!-- Revenue mult buff indicator -->
	{#if revMult.mult > 1 && now < revMult.expiresAt}
		{@const remaining = Math.ceil((revMult.expiresAt - now) / 1000)}
		{@const buffPct = Math.max(0, ((revMult.expiresAt - now) / 60000) * 100)}
		<div class="bg-gradient-to-r from-solar-gold/15 to-solar-gold/5 border border-solar-gold/25 rounded-xl p-3 animate-pulse-subtle">
			<div class="flex items-center gap-2">
				<span class="text-lg">⚡</span>
				<div class="flex-1">
					<span class="text-sm font-bold text-solar-gold">{revMult.mult}× Revenue Boost</span>
					<div class="mt-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
						<div class="h-full rounded-full bg-solar-gold transition-all duration-200" style="width: {buffPct}%;"></div>
					</div>
				</div>
				<span class="text-xs font-mono font-bold text-solar-gold tabular-nums">{remaining}s</span>
			</div>
		</div>
	{/if}

	<!-- Active Contracts -->
	{#if contracts.length === 0}
		<div class="bg-bg-secondary/30 rounded-2xl p-10 border border-white/5 text-center">
			<div class="text-4xl mb-3 animate-bounce-slow">📜</div>
			<p class="text-sm font-medium text-text-secondary">No active contracts</p>
			<p class="text-xs text-text-muted mt-1">New contracts appear every few minutes.<br/>Keep producing to unlock more!</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each contracts as contract (contract.id)}
				{@const pct = progressPct(contract)}
				{@const tPct = timePct(contract)}
				{@const isUrgent = tPct > 75 && !contract.completed && !contract.expired}
				{@const isAlmostDone = pct > 80 && !contract.completed && !contract.expired}
				<div
					class="rounded-xl border overflow-hidden transition-all duration-300
						{contract.completed
							? 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/30 scale-[1.01]'
							: contract.expired
								? 'bg-bg-secondary/20 border-red-500/20 opacity-40'
								: isUrgent
									? 'bg-bg-secondary/40 border-yellow-500/25'
									: 'bg-bg-secondary/40 border-white/5'}"
				>
					<div class="p-3.5">
						<div class="flex items-start gap-3">
							<!-- Icon with glow effect -->
							<div class="relative shrink-0">
								<span class="text-2xl {contract.completed ? 'animate-bounce-once' : ''}">{contract.icon}</span>
								{#if contract.completed}
									<div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
										<span class="text-[8px] text-white font-bold">✓</span>
									</div>
								{/if}
							</div>

							<div class="flex-1 min-w-0">
								<!-- Description -->
								<p class="text-sm font-semibold text-text-primary leading-tight {contract.expired ? 'line-through opacity-60' : ''}">{contract.description}</p>

								<!-- Reward + Timer row -->
								<div class="flex items-center justify-between mt-1.5">
									<span class="inline-flex items-center gap-1 text-xs {rewardColor(contract.reward.type)}">
										<span>{rewardIcon(contract.reward.type)}</span>
										<span class="font-semibold">{contract.reward.label}</span>
									</span>
									<span
										class="text-xs font-bold tabular-nums font-mono px-1.5 py-0.5 rounded
											{contract.completed ? 'bg-green-500/15 text-green-400' : ''}
											{contract.expired ? 'bg-red-500/10 text-red-400' : ''}
											{isUrgent && !contract.completed && !contract.expired ? 'bg-yellow-500/10 text-yellow-400 animate-pulse' : ''}
											{!isUrgent && !contract.completed && !contract.expired ? 'text-text-secondary' : ''}"
									>
										{timeRemaining(contract)}
									</span>
								</div>

								<!-- Progress bar -->
								<div class="mt-2">
									<div class="w-full h-2.5 rounded-full bg-bg-tertiary overflow-hidden">
										<div
											class="h-full rounded-full transition-all duration-500 ease-out
												{contract.completed ? 'bg-gradient-to-r from-green-500 to-green-400' : ''}
												{contract.expired ? 'bg-red-500/50' : ''}
												{!contract.completed && !contract.expired && isAlmostDone ? 'bg-gradient-to-r from-electric-blue to-bio-green' : ''}
												{!contract.completed && !contract.expired && !isAlmostDone ? 'bg-electric-blue' : ''}"
											style="width: {pct}%;"
										></div>
									</div>
									<div class="flex justify-between mt-0.5">
										<span class="text-[10px] text-text-muted tabular-nums">
											{contract.target.type === 'income'
												? `$${formatCompact(contract.progress)}/s`
												: `${Math.floor(contract.progress)}`} / {contract.target.type === 'income'
												? `$${formatCompact(contract.target.target)}/s`
												: contract.target.target}
										</span>
										<span class="text-[10px] font-semibold tabular-nums {pct >= 100 ? 'text-green-400' : 'text-text-muted'}">{Math.floor(pct)}%</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Time bar at bottom -->
					{#if !contract.completed && !contract.expired}
						<div class="h-1 bg-bg-tertiary">
							<div
								class="h-full transition-all duration-200
									{isUrgent ? 'bg-gradient-to-r from-yellow-500/60 to-red-500/60' : 'bg-white/10'}"
								style="width: {tPct}%;"
							></div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Stats footer -->
	{#if totalCompleted > 0}
		<div class="text-center pt-2">
			<p class="text-[10px] text-text-muted">
				📊 {totalCompleted} contract{totalCompleted !== 1 ? 's' : ''} completed all-time
			</p>
		</div>
	{/if}
</div>

<style>
	@keyframes bounce-slow {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}
	@keyframes bounce-once {
		0% { transform: scale(1); }
		50% { transform: scale(1.3); }
		100% { transform: scale(1); }
	}
	@keyframes pulse-subtle {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.85; }
	}
	:global(.animate-bounce-slow) { animation: bounce-slow 2s ease-in-out infinite; }
	:global(.animate-bounce-once) { animation: bounce-once 0.4s ease-out; }
	:global(.animate-pulse-subtle) { animation: pulse-subtle 2s ease-in-out infinite; }
</style>
