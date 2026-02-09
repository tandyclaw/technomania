<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { DIVISIONS } from '$lib/divisions';
	import { MVP_SYNERGIES, getSynergyProgress, type Synergy } from '$lib/systems/SynergySystem';

	let gs = $derived($gameState);
	let synergyProgress = $derived(getSynergyProgress(gs, MVP_SYNERGIES));
	let activeSynergies = $derived(synergyProgress.filter((s) => s.active));
	let inactiveSynergies = $derived(synergyProgress.filter((s) => !s.active));

	// Only show panel if at least 2 divisions are unlocked (synergies become relevant)
	let divisionsUnlocked = $derived(
		(['teslaenergy', 'spacex', 'tesla', 'ai', 'tunnels', 'robotics'] as const).filter(
			(id) => gs.divisions[id].unlocked
		).length
	);
	let showPanel = $derived(divisionsUnlocked >= 2);

	let expanded = $state(false);

	function getDivisionName(id: string): string {
		return DIVISIONS[id]?.name ?? id;
	}

	function getDivisionColor(id: string): string {
		return DIVISIONS[id]?.color ?? '#888';
	}

	function getDivisionIcon(id: string): string {
		return DIVISIONS[id]?.icon ?? '?';
	}

	function formatPercent(value: number): string {
		return `+${Math.round(value * 100)}%`;
	}

	function effectLabel(synergy: Synergy): string {
		switch (synergy.effect.type) {
			case 'speed_boost':
				return `${formatPercent(synergy.effect.value)} speed`;
			case 'revenue_boost':
				return `${formatPercent(synergy.effect.value)} revenue`;
			case 'cost_reduction':
				return `${formatPercent(synergy.effect.value)} cheaper`;
			default:
				return '';
		}
	}

	function effectColor(type: string): string {
		switch (type) {
			case 'speed_boost':
				return '#44DDFF';
			case 'revenue_boost':
				return '#44FF88';
			case 'cost_reduction':
				return '#FFCC44';
			default:
				return '#888';
		}
	}
</script>

{#if showPanel}
	<div class="synergy-panel">
		<!-- Header -->
		<button
			onclick={() => (expanded = !expanded)}
			class="w-full flex items-center justify-between gap-2 group"
		>
			<div class="flex items-center gap-2">
				<h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider">
					Synergies
				</h2>
				{#if activeSynergies.length > 0}
					<span
						class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-bio-green/15 text-bio-green"
					>
						{activeSynergies.length} active
					</span>
				{/if}
			</div>
			<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="none"
				class="text-text-muted/50 transition-transform duration-200"
				class:rotate-180={expanded}
			>
				<path
					d="M4 6L8 10L12 6"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<!-- Active synergies (always visible as compact badges) -->
		{#if activeSynergies.length > 0 && !expanded}
			<div class="flex flex-wrap gap-1.5 mt-2">
				{#each activeSynergies as { synergy }}
					<div
						class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium
							   border border-white/5"
						style="background-color: {effectColor(synergy.effect.type)}08; color: {effectColor(synergy.effect.type)};"
					>
						<span class="text-xs">{synergy.icon}</span>
						<span>{synergy.name}</span>
						<span class="opacity-70 text-[10px]">{effectLabel(synergy)}</span>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Expanded view -->
		{#if expanded}
			<div class="mt-3 space-y-2">
				<!-- Active synergies (detailed) -->
				{#each activeSynergies as { synergy }}
					<div
						class="synergy-card active rounded-xl p-3 border"
						style="border-color: {effectColor(synergy.effect.type)}25; background: linear-gradient(135deg, {effectColor(synergy.effect.type)}06 0%, transparent 100%);"
					>
						<div class="flex items-start gap-2.5">
							<div class="text-lg shrink-0 mt-0.5">{synergy.icon}</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold text-text-primary">{synergy.name}</span>
									<span
										class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
										style="background-color: {effectColor(synergy.effect.type)}15; color: {effectColor(synergy.effect.type)};"
									>
										{effectLabel(synergy)}
									</span>
								</div>
								<p class="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
									{synergy.description}
								</p>
								<!-- Division flow -->
								<div class="flex items-center gap-1 mt-1.5 text-[10px] text-text-muted">
									<span style="color: {getDivisionColor(synergy.requirement.sourceDivision)};"
										>{getDivisionIcon(synergy.requirement.sourceDivision)} {getDivisionName(synergy.requirement.sourceDivision)}</span
									>
									<span class="text-text-muted/40">→</span>
									<span style="color: {getDivisionColor(synergy.requirement.targetDivision)};"
										>{getDivisionIcon(synergy.requirement.targetDivision)} {getDivisionName(synergy.requirement.targetDivision)}</span
									>
								</div>
							</div>
						</div>
					</div>
				{/each}

				<!-- Inactive synergies (locked, showing progress) -->
				{#each inactiveSynergies as { synergy, sourceProgress, targetProgress }}
					<div
						class="synergy-card locked rounded-xl p-3 border border-white/5 bg-bg-secondary/20 opacity-60"
					>
						<div class="flex items-start gap-2.5">
							<div class="text-lg shrink-0 mt-0.5 grayscale">{synergy.icon}</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold text-text-secondary">{synergy.name}</span>
									<span class="text-[10px] text-text-muted">🔒</span>
								</div>
								<p class="text-[11px] text-text-muted mt-0.5">{synergy.description}</p>

								<!-- Progress bars -->
								<div class="mt-2 space-y-1">
									<div class="flex items-center gap-2">
										<span class="text-[10px] w-16 truncate" style="color: {getDivisionColor(synergy.requirement.sourceDivision)};">
											{getDivisionIcon(synergy.requirement.sourceDivision)} {getDivisionName(synergy.requirement.sourceDivision)}
										</span>
										<div class="flex-1 h-1 rounded-full bg-bg-tertiary/50 overflow-hidden">
											<div
												class="h-full rounded-full transition-all duration-500"
												style="width: {sourceProgress * 100}%; background-color: {getDivisionColor(synergy.requirement.sourceDivision)};"
											></div>
										</div>
										<span class="text-[9px] text-text-muted tabular-nums w-8 text-right">
											{Math.round(sourceProgress * 100)}%
										</span>
									</div>
									<div class="flex items-center gap-2">
										<span class="text-[10px] w-16 truncate" style="color: {getDivisionColor(synergy.requirement.targetDivision)};">
											{getDivisionIcon(synergy.requirement.targetDivision)} {getDivisionName(synergy.requirement.targetDivision)}
										</span>
										<div class="flex-1 h-1 rounded-full bg-bg-tertiary/50 overflow-hidden">
											<div
												class="h-full rounded-full transition-all duration-500"
												style="width: {targetProgress * 100}%; background-color: {getDivisionColor(synergy.requirement.targetDivision)};"
											></div>
										</div>
										<span class="text-[9px] text-text-muted tabular-nums w-8 text-right">
											{Math.round(targetProgress * 100)}%
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}

				{#if synergyProgress.length === 0}
					<div class="text-center py-4">
						<p class="text-sm text-text-muted">No synergies available yet.</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}
