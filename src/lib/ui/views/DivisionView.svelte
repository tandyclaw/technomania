<script lang="ts">
	import { gameState } from '$lib/stores/gameState';

	let { divisionId }: { divisionId: string } = $props();

	const divisionMeta: Record<string, { name: string; icon: string; color: string; desc: string }> = {
		helios: { name: 'Helios Power', icon: '☀️', color: '#FFCC44', desc: 'Solar energy, batteries & grid storage' },
		apex: { name: 'Apex Rocketry', icon: '🚀', color: '#FF4444', desc: 'Reusable rockets & space exploration' },
		volt: { name: 'Volt Motors', icon: '🔋', color: '#4488FF', desc: 'Electric vehicles & gigafactories' },
	};

	let meta = $derived(divisionMeta[divisionId] ?? { name: 'Unknown', icon: '❓', color: '#888', desc: '' });
	let divState = $derived($gameState.divisions[divisionId as keyof typeof $gameState.divisions]);
</script>

<div class="space-y-5">
	<!-- Division header -->
	<div class="flex items-center gap-3">
		<div
			class="w-12 h-12 rounded-xl flex items-center justify-center text-3xl shrink-0"
			style="background-color: {meta.color}15; border: 1px solid {meta.color}30;"
		>
			{meta.icon}
		</div>
		<div>
			<h1 class="text-xl font-bold" style="color: {meta.color};">{meta.name}</h1>
			<p class="text-xs text-text-secondary">{meta.desc}</p>
		</div>
	</div>

	{#if divState}
		<!-- Tiers list -->
		<div class="space-y-2.5">
			{#each divState.tiers as tier, i}
				<div
					class="relative rounded-xl border transition-all duration-200
						{tier.unlocked ? 'bg-bg-secondary/60 border-white/5' : 'bg-bg-secondary/20 border-white/[0.02] opacity-40'}"
				>
					<div class="p-3.5 flex items-center gap-3">
						<!-- Tier number -->
						<div
							class="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
							style="background-color: {tier.unlocked ? meta.color + '20' : 'transparent'};
								   color: {tier.unlocked ? meta.color : 'var(--color-text-muted)'};"
						>
							T{i + 1}
						</div>

						<!-- Info -->
						<div class="flex-1 min-w-0">
							<div class="text-sm font-semibold text-text-primary">
								{tier.unlocked ? `Tier ${i + 1} · Level ${tier.level}` : `Tier ${i + 1} · Locked`}
							</div>
							{#if tier.unlocked}
								<div class="text-xs text-text-muted mt-0.5">
									{tier.count > 0 ? `${tier.count} owned` : 'Ready to build'}
								</div>
							{:else}
								<div class="text-xs text-text-muted mt-0.5">
									Unlock previous tier to access
								</div>
							{/if}
						</div>

						<!-- Action -->
						{#if tier.unlocked}
							<button
								class="px-3 py-2 rounded-lg text-xs font-semibold
									   transition-all duration-150 active:scale-95 touch-manipulation"
								style="background-color: {meta.color}20; color: {meta.color};"
							>
								{tier.count === 0 ? 'Build' : 'Upgrade'}
							</button>
						{:else}
							<div class="text-text-muted text-lg">🔒</div>
						{/if}
					</div>

					<!-- Production progress bar -->
					{#if tier.producing}
						<div class="h-1 bg-bg-tertiary/30 rounded-b-xl overflow-hidden">
							<div
								class="h-full transition-all duration-100 ease-linear rounded-b-xl"
								style="width: {tier.progress * 100}%; background-color: {meta.color};"
							></div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Division chief -->
		<div class="bg-bg-secondary/30 rounded-xl p-4 border border-white/5">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-sm font-semibold text-text-primary">Division Chief</h3>
					<p class="text-xs text-text-muted mt-0.5">
						{divState.chiefLevel > 0
							? `Level ${divState.chiefLevel} · Automating production`
							: 'Hire a chief to automate production'}
					</p>
				</div>
				<button
					class="px-3 py-2 rounded-lg text-xs font-semibold
						   bg-neural-purple/20 text-neural-purple
						   transition-all duration-150 active:scale-95 touch-manipulation"
				>
					{divState.chiefLevel > 0 ? 'Upgrade' : 'Hire'}
				</button>
			</div>
		</div>
	{:else}
		<!-- Division not found / not unlocked -->
		<div class="bg-bg-secondary/30 rounded-xl p-8 border border-white/5 text-center">
			<div class="text-4xl mb-3">🔒</div>
			<h2 class="text-base font-semibold text-text-primary mb-1">Division Locked</h2>
			<p class="text-sm text-text-muted">Complete prerequisites to unlock this division.</p>
		</div>
	{/if}
</div>
