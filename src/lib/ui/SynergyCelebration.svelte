<script lang="ts">
	/**
	 * SynergyCelebration.svelte — Dramatic "SYNERGY DISCOVERED!" modal
	 *
	 * Shown when the player's first cross-division synergy activates.
	 * Features:
	 *  - Full-screen overlay with particle effects
	 *  - Animated reveal of synergy name, icon, and description
	 *  - Division flow visualization (Source → Target)
	 *  - Bonus callout
	 *  - Educational flavor text
	 */

	import { DIVISIONS } from '$lib/divisions';
	import type { Synergy } from '$lib/systems/SynergySystem';

	let {
		synergy,
		visible = false,
		onDismiss,
	}: {
		synergy: Synergy | null;
		visible?: boolean;
		onDismiss?: () => void;
	} = $props();

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

	function effectLabel(syn: Synergy): string {
		switch (syn.effect.type) {
			case 'speed_boost':
				return `${formatPercent(syn.effect.value)} Production Speed`;
			case 'revenue_boost':
				return `${formatPercent(syn.effect.value)} Revenue`;
			case 'cost_reduction':
				return `${formatPercent(syn.effect.value)} Cost Reduction`;
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

	// Generate particles for the celebration
	const particles = Array.from({ length: 40 }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		delay: Math.random() * 1.2,
		xEnd: Math.random() * 300 - 150,
		rotation: Math.random() * 720 - 360,
		color: ['#9944FF', '#44DDFF', '#44FF88', '#FFCC44', '#FF4444', '#FF88FF'][i % 6],
		size: Math.random() * 8 + 4,
	}));
</script>

{#if visible && synergy}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center"
		onclick={onDismiss}
	>
		<!-- Backdrop with radial glow -->
		<div class="synergy-backdrop absolute inset-0"></div>

		<!-- Particles -->
		<div class="absolute inset-0 pointer-events-none overflow-hidden">
			{#each particles as p}
				<div
					class="synergy-particle absolute"
					style="
						left: {p.x}%;
						top: 50%;
						--delay: {p.delay}s;
						--x-end: {p.xEnd}px;
						--rotation: {p.rotation}deg;
						--color: {p.color};
						--size: {p.size}px;
					"
				></div>
			{/each}
		</div>

		<!-- Glow rings -->
		<div class="absolute pointer-events-none">
			<div class="synergy-ring ring-1"></div>
		</div>
		<div class="absolute pointer-events-none">
			<div class="synergy-ring ring-2"></div>
		</div>

		<!-- Modal content -->
		<div class="synergy-modal relative z-10 max-w-sm w-full mx-4" onclick={(e) => e.stopPropagation()}>
			<!-- Header flash -->
			<div class="synergy-header-flash absolute -top-1 left-0 right-0 h-1 rounded-full"></div>

			<div class="bg-bg-secondary/95 backdrop-blur-xl rounded-2xl border border-neural-purple/30 overflow-hidden shadow-2xl">
				<!-- Top section: "SYNERGY DISCOVERED" banner -->
				<div class="synergy-banner px-6 pt-6 pb-4 text-center relative overflow-hidden">
					<div class="synergy-banner-bg absolute inset-0"></div>
					<div class="relative z-10">
						<div class="text-[10px] text-neural-purple uppercase tracking-[0.3em] font-bold mb-2 synergy-label-in">
							⚡ SYNERGY DISCOVERED ⚡
						</div>
						<div class="text-4xl mb-3 synergy-icon-in">{synergy.icon}</div>
						<h2 class="text-xl font-black text-text-primary synergy-title-in">
							{synergy.name}
						</h2>
					</div>
				</div>

				<!-- Division flow -->
				<div class="px-6 py-3 synergy-flow-in">
					<div class="flex items-center justify-center gap-3">
						<div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
							style="background-color: {getDivisionColor(synergy.requirement.sourceDivision)}10;
								   border-color: {getDivisionColor(synergy.requirement.sourceDivision)}25;">
							<span class="text-lg">{getDivisionIcon(synergy.requirement.sourceDivision)}</span>
							<span class="text-xs font-semibold" style="color: {getDivisionColor(synergy.requirement.sourceDivision)};">
								{getDivisionName(synergy.requirement.sourceDivision)}
							</span>
						</div>

						<!-- Animated arrow -->
						<div class="synergy-arrow text-neural-purple text-lg font-bold">
							⚡→
						</div>

						<div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
							style="background-color: {getDivisionColor(synergy.requirement.targetDivision)}10;
								   border-color: {getDivisionColor(synergy.requirement.targetDivision)}25;">
							<span class="text-lg">{getDivisionIcon(synergy.requirement.targetDivision)}</span>
							<span class="text-xs font-semibold" style="color: {getDivisionColor(synergy.requirement.targetDivision)};">
								{getDivisionName(synergy.requirement.targetDivision)}
							</span>
						</div>
					</div>
				</div>

				<!-- Bonus callout -->
				<div class="px-6 py-3 synergy-bonus-in">
					<div
						class="rounded-xl p-3 text-center border"
						style="background-color: {effectColor(synergy.effect.type)}08;
							   border-color: {effectColor(synergy.effect.type)}20;"
					>
						<div class="text-2xl font-black font-mono tabular-nums"
							style="color: {effectColor(synergy.effect.type)};">
							{effectLabel(synergy)}
						</div>
						<div class="text-xs text-text-secondary mt-1">
							Applied to {getDivisionName(synergy.requirement.targetDivision)}
						</div>
					</div>
				</div>

				<!-- Description & flavor -->
				<div class="px-6 pb-3 synergy-desc-in">
					<p class="text-sm text-text-secondary leading-relaxed text-center">
						{synergy.description}
					</p>
					{#if synergy.flavorText}
						<p class="text-xs text-text-muted italic mt-2 text-center">
							{synergy.flavorText}
						</p>
					{/if}
				</div>

				<!-- Dismiss button -->
				<div class="px-6 pb-6 pt-2 synergy-btn-in">
					<button
						onclick={onDismiss}
						class="w-full py-3 px-6 rounded-xl text-sm font-bold transition-all duration-200
							   active:scale-95 touch-manipulation"
						style="background: linear-gradient(135deg, #9944FF30, #44DDFF20);
							   color: #CCBBFF; border: 1px solid #9944FF30;"
					>
						🚀 Awesome!
					</button>
					<p class="text-[10px] text-text-muted text-center mt-2 opacity-60">
						View all synergies on the Dashboard
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Backdrop */
	.synergy-backdrop {
		background: radial-gradient(circle at 50% 50%, rgba(153, 68, 255, 0.15) 0%, rgba(0, 0, 0, 0.85) 70%);
		animation: backdropIn 0.5s ease-out forwards;
	}

	@keyframes backdropIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Particles */
	.synergy-particle {
		width: var(--size);
		height: var(--size);
		border-radius: 2px;
		background-color: var(--color);
		animation: synergyBurst 2.5s ease-out var(--delay) forwards;
		opacity: 0;
	}

	@keyframes synergyBurst {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg) scale(0);
			opacity: 0;
		}
		10% {
			opacity: 1;
			transform: translateY(-20px) translateX(0) rotate(0deg) scale(1.2);
		}
		100% {
			transform: translateX(var(--x-end)) translateY(-400px) rotate(var(--rotation)) scale(0);
			opacity: 0;
		}
	}

	/* Glow rings */
	.synergy-ring {
		border-radius: 50%;
		border: 2px solid rgba(153, 68, 255, 0.3);
	}

	.ring-1 {
		width: 200px;
		height: 200px;
		animation: ringExpand 1.5s ease-out forwards;
	}

	.ring-2 {
		width: 200px;
		height: 200px;
		animation: ringExpand 1.5s ease-out 0.2s forwards;
		opacity: 0;
	}

	@keyframes ringExpand {
		0% {
			transform: scale(0);
			opacity: 0.8;
		}
		100% {
			transform: scale(3);
			opacity: 0;
		}
	}

	/* Modal entrance */
	.synergy-modal {
		animation: modalIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
		opacity: 0;
		transform: scale(0.8) translateY(20px);
	}

	@keyframes modalIn {
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Header flash */
	.synergy-header-flash {
		background: linear-gradient(90deg, transparent, #9944FF, #44DDFF, #9944FF, transparent);
		animation: headerFlash 2s ease-in-out 0.5s infinite;
	}

	@keyframes headerFlash {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.8; }
	}

	/* Banner background */
	.synergy-banner-bg {
		background: linear-gradient(180deg, rgba(153, 68, 255, 0.08) 0%, transparent 100%);
	}

	/* Staggered content animations */
	.synergy-label-in {
		animation: contentFadeUp 0.5s ease-out 0.5s forwards;
		opacity: 0;
		transform: translateY(10px);
	}

	.synergy-icon-in {
		animation: iconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s forwards;
		opacity: 0;
		transform: scale(0) translateY(10px);
	}

	@keyframes iconBounce {
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.synergy-title-in {
		animation: contentFadeUp 0.5s ease-out 0.85s forwards;
		opacity: 0;
		transform: translateY(10px);
	}

	.synergy-flow-in {
		animation: contentFadeUp 0.4s ease-out 1s forwards;
		opacity: 0;
		transform: translateY(10px);
	}

	.synergy-bonus-in {
		animation: contentFadeUp 0.4s ease-out 1.15s forwards;
		opacity: 0;
		transform: translateY(10px);
	}

	.synergy-desc-in {
		animation: contentFadeUp 0.4s ease-out 1.3s forwards;
		opacity: 0;
		transform: translateY(10px);
	}

	.synergy-btn-in {
		animation: contentFadeUp 0.4s ease-out 1.45s forwards;
		opacity: 0;
		transform: translateY(10px);
	}

	@keyframes contentFadeUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Arrow pulse */
	.synergy-arrow {
		animation: arrowPulse 1.5s ease-in-out infinite;
	}

	@keyframes arrowPulse {
		0%, 100% { opacity: 0.6; transform: translateX(0); }
		50% { opacity: 1; transform: translateX(3px); }
	}
</style>
