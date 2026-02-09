<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { checkDailyReward, DAILY_REWARDS } from '$lib/systems/DailyRewardSystem';
	import { formatCurrency } from '$lib/engine/BigNumber';

	let gs = $derived($gameState);
	let rewardCheck = $derived(checkDailyReward(gs.dailyRewardLastClaim ?? 0, gs.dailyRewardStreak ?? 0));
	let visible = $state(false);
	let claimed = $state(false);

	// Show modal when reward is available (once per mount)
	let hasShown = $state(false);
	$effect(() => {
		if (rewardCheck.available && !hasShown && !claimed) {
			visible = true;
			hasShown = true;
		}
	});

	function claimReward() {
		const { newStreak, reward } = rewardCheck;
		gameState.update(s => ({
			...s,
			cash: s.cash + reward.cash,
			dailyRewardLastClaim: Date.now(),
			dailyRewardStreak: newStreak,
		}));
		claimed = true;
		setTimeout(() => { visible = false; }, 1500);
	}

	function dismiss() {
		visible = false;
	}
</script>

{#if visible}
	<div class="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" role="dialog" aria-modal="true">
		<div class="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full border border-solar-gold/30 shadow-2xl text-center daily-enter">
			<div class="text-5xl mb-2">🎁</div>
			<h2 class="text-xl font-black text-text-primary">Daily Reward!</h2>
			<p class="text-sm text-text-secondary mt-1">Day {rewardCheck.newStreak} streak</p>

			<!-- Reward tiers -->
			<div class="flex justify-center gap-1.5 mt-4 mb-4">
				{#each DAILY_REWARDS as tier, i}
					{@const isToday = i === rewardCheck.newStreak - 1}
					{@const isPast = i < rewardCheck.newStreak - 1}
					<div class="flex flex-col items-center gap-0.5">
						<div class="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all
							{isToday ? 'bg-solar-gold/20 border-2 border-solar-gold text-solar-gold scale-110' :
							 isPast ? 'bg-bio-green/15 border border-bio-green/30 text-bio-green' :
							 'bg-bg-tertiary border border-white/5 text-text-muted'}">
							{#if isPast}✓{:else if isToday}🎁{:else}{tier.day}{/if}
						</div>
						<span class="text-[9px] text-text-muted">{tier.label}</span>
					</div>
				{/each}
			</div>

			{#if claimed}
				<div class="py-3">
					<div class="text-2xl font-black text-bio-green">+{formatCurrency(rewardCheck.reward.cash)}</div>
					{#if rewardCheck.reward.bonus}
						<div class="text-sm text-solar-gold font-bold mt-1">{rewardCheck.reward.bonus}</div>
					{/if}
					<p class="text-xs text-text-muted mt-2">Added to your cash!</p>
				</div>
			{:else}
				<div class="py-3">
					<div class="text-3xl font-black text-solar-gold">{formatCurrency(rewardCheck.reward.cash)}</div>
					{#if rewardCheck.reward.bonus}
						<div class="text-sm text-solar-gold font-bold mt-1">{rewardCheck.reward.bonus}</div>
					{/if}
				</div>
				<button
					onclick={claimReward}
					class="w-full py-3 px-6 rounded-xl bg-solar-gold/15 text-solar-gold border border-solar-gold/25 font-bold
						   transition-all duration-200 active:scale-95 touch-manipulation hover:bg-solar-gold/25"
				>
					Claim Reward
				</button>
				<button onclick={dismiss} class="mt-2 text-xs text-text-muted hover:text-text-secondary">
					Skip
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.daily-enter {
		animation: dailyPop 0.3s ease-out;
	}
	@keyframes dailyPop {
		from { opacity: 0; transform: translateY(20px) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}
</style>
