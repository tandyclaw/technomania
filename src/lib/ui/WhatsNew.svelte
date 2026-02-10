<script lang="ts">
	const CURRENT_VERSION = '0.2.0';
	const STORAGE_KEY = 'moonshot-whats-new-version';

	let visible = $state(false);

	const features = [
		{ icon: '🏢', text: '6 Divisions with 36 tiers to unlock and upgrade' },
		{ icon: '👔', text: 'Chiefs for automated production while you\'re away' },
		{ icon: '📋', text: 'Contracts system with timed challenges and rewards' },
		{ icon: '🏆', text: '130+ Achievements including hidden ones to discover' },
		{ icon: '🎄', text: 'Seasonal events with time-limited bonuses' },
		{ icon: '📊', text: 'Statistics page with fun facts about your empire' },
		{ icon: '🃏', text: 'Share card for bragging rights' },
		{ icon: '🌑', text: 'OLED dark mode + high contrast accessibility' },
		{ icon: '💤', text: 'Offline earnings with upgradeable efficiency' },
		{ icon: '📰', text: 'Dynamic news ticker with game updates' },
		{ icon: '🪐', text: '12-planet prestige chain to conquer' },
	];

	$effect(() => {
		const seen = localStorage.getItem(STORAGE_KEY);
		if (seen !== CURRENT_VERSION) {
			visible = true;
		}
	});

	function dismiss() {
		localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
		visible = false;
	}
</script>

{#if visible}
	<div class="fixed inset-0 bg-bg-primary/95 backdrop-blur-sm flex items-center justify-center z-[95] px-4">
		<div class="bg-bg-secondary rounded-2xl p-5 max-w-sm w-full border border-white/10 max-h-[85vh] flex flex-col">
			<div class="text-center mb-4">
				<div class="text-4xl mb-2">🚀</div>
				<h2 class="text-xl font-bold text-text-primary">What's New</h2>
				<p class="text-xs text-text-muted mt-1">Version {CURRENT_VERSION}</p>
			</div>

			<div class="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-1">
				{#each features as f}
					<div class="flex items-start gap-3 bg-bg-tertiary/40 rounded-xl px-3 py-2.5">
						<span class="text-lg shrink-0">{f.icon}</span>
						<span class="text-sm text-text-secondary leading-snug">{f.text}</span>
					</div>
				{/each}
			</div>

			<button
				onclick={dismiss}
				class="w-full py-3 px-6 rounded-xl bg-electric-blue text-white font-semibold
					   transition-all duration-200 active:scale-95 touch-manipulation"
			>
				Let's Go 🚀
			</button>
		</div>
	</div>
{/if}
