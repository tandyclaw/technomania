<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import {
		buyBtc, sellBtc, sellAllBtc,
		buyDoge, sellDoge, sellAllDoge,
		getBtcPortfolioValue, getDogePortfolioValue,
		getBtcPnL, getDogePnL,
		getPortfolioValue, getPortfolioPnL,
	} from '$lib/systems/CryptoSystem';

	let state = $derived($gameState);
	let crypto = $derived(state.crypto);
	let cash = $derived(state.cash);

	// BTC derived values
	let btcValue = $derived(getBtcPortfolioValue(crypto));
	let btcPnL = $derived(getBtcPnL(crypto));
	let btcPnLPercent = $derived(crypto.totalInvested > 0 ? (btcPnL / crypto.totalInvested) * 100 : 0);

	// DOGE derived values
	let dogeValue = $derived(getDogePortfolioValue(crypto));
	let dogePnL = $derived(getDogePnL(crypto));
	let dogePnLPercent = $derived(crypto.dogeTotalInvested > 0 ? (dogePnL / crypto.dogeTotalInvested) * 100 : 0);

	// Total portfolio
	let totalValue = $derived(getPortfolioValue(crypto));
	let totalPnL = $derived(getPortfolioPnL(crypto));

	// Elon tweet pump active
	let tweetActive = $derived(crypto.elonTweetPumpMs > 0);
	let tweetTimeLeft = $derived(Math.ceil(crypto.elonTweetPumpMs / 1000));
	let tweetPumpPercent = $derived(Math.round((crypto.elonTweetMultiplier - 1) * 100));

	// Custom amount inputs
	let btcBuyAmount = $state('');
	let btcSellPercent = $state(100);
	let dogeBuyAmount = $state('');
	let dogeSellPercent = $state(100);

	// Quick buy percentages
	const QUICK_PERCENTS = [10, 25, 50, 100];

	// Sparkline rendering
	function sparklinePath(history: number[], width: number, height: number): string {
		if (history.length < 2) return '';
		const min = Math.min(...history);
		const max = Math.max(...history);
		const range = max - min || 1;
		const step = width / (history.length - 1);

		return history
			.map((v, i) => {
				const x = i * step;
				const y = height - ((v - min) / range) * height;
				return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	function sparklineColor(history: number[]): string {
		if (history.length < 2) return '#8899aa';
		return history[history.length - 1] >= history[0] ? '#44FF88' : '#FF4444';
	}

	// Format DOGE price with enough decimals
	function formatDogePrice(price: number): string {
		if (price < 0.01) return '$' + price.toFixed(4);
		if (price < 1) return '$' + price.toFixed(3);
		return '$' + price.toFixed(2);
	}

	function formatDogeAmount(amount: number): string {
		if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'M';
		if (amount >= 1_000) return (amount / 1_000).toFixed(1) + 'K';
		return amount.toFixed(2);
	}

	// BTC handlers
	function handleBuyBtcPercent(percent: number) {
		const amount = cash * (percent / 100);
		if (amount > 0) buyBtc(amount);
	}

	function handleBuyBtcCustom() {
		const amount = parseFloat(btcBuyAmount);
		if (!isNaN(amount) && amount > 0 && amount <= cash) {
			buyBtc(amount);
			btcBuyAmount = '';
		}
	}

	function handleSellBtc() {
		const amount = crypto.btcOwned * (btcSellPercent / 100);
		if (amount > 0) sellBtc(amount);
	}

	// DOGE handlers
	function handleBuyDogePercent(percent: number) {
		const amount = cash * (percent / 100);
		if (amount > 0) buyDoge(amount);
	}

	function handleBuyDogeCustom() {
		const amount = parseFloat(dogeBuyAmount);
		if (!isNaN(amount) && amount > 0 && amount <= cash) {
			buyDoge(amount);
			dogeBuyAmount = '';
		}
	}

	function handleSellDoge() {
		const amount = crypto.dogeOwned * (dogeSellPercent / 100);
		if (amount > 0) sellDoge(amount);
	}

	// Sell value previews
	let btcSellValue = $derived(btcValue * (btcSellPercent / 100));
	let dogeSellValue = $derived(dogeValue * (dogeSellPercent / 100));
</script>

<div class="crypto-view space-y-5">
	<!-- Header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary flex items-center gap-2">
			<span>💰</span> Crypto Treasury
		</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			Invest your cash in crypto. High risk, high reward.
		</p>
	</div>

	<!-- Elon Tweet Pump Banner -->
	{#if tweetActive}
		<div class="tweet-banner relative overflow-hidden rounded-xl p-4 border-2 border-[#C2A633]/40">
			<div class="absolute inset-0 tweet-pulse-bg"></div>
			<div class="relative z-10 flex items-center gap-3">
				<div class="text-3xl animate-bounce">🐕</div>
				<div class="flex-1">
					<div class="text-sm font-bold text-[#C2A633]">
						🚀 ELON TWEET PUMP ACTIVE! +{tweetPumpPercent}%
					</div>
					<div class="text-xs text-text-secondary mt-0.5">
						DOGE price pumped! {tweetTimeLeft}s remaining...
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Total Portfolio -->
	<div
		class="relative overflow-hidden rounded-xl p-4 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(247, 147, 26, 0.08) 100%);"
	>
		<div class="relative z-10">
			<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
				Total Portfolio
			</div>
			<div class="text-2xl font-bold text-text-primary tabular-nums font-mono">
				{formatCurrency(totalValue)}
			</div>
			{#if totalPnL !== 0}
				<div class="mt-1 text-sm font-semibold tabular-nums"
					class:text-bio-green={totalPnL >= 0}
					class:text-rocket-red={totalPnL < 0}
				>
					{totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
				</div>
			{/if}
		</div>
	</div>

	<!-- Cash Available -->
	<div class="bg-bg-secondary/60 rounded-xl p-3 border border-white/[0.03] text-center">
		<div class="text-[10px] text-text-muted uppercase tracking-wider">Available Cash</div>
		<div class="text-lg font-bold text-text-primary tabular-nums font-mono mt-0.5">
			{formatCurrency(cash)}
		</div>
	</div>

	<!-- ═══ BITCOIN CARD ═══ -->
	<div class="bg-bg-secondary/40 rounded-xl border border-white/5 overflow-hidden">
		<div class="p-4">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
						style="background-color: #F7931A15; border: 1px solid #F7931A25;">
						₿
					</div>
					<div>
						<h2 class="text-base font-bold text-text-primary">Bitcoin</h2>
						<div class="text-lg font-bold tabular-nums font-mono" style="color: #F7931A;">
							{formatCurrency(crypto.btcPrice)}
						</div>
					</div>
				</div>
				<!-- Sparkline -->
				<div class="w-24 h-10 shrink-0">
					{#if crypto.btcPriceHistory.length > 1}
						<svg viewBox="0 0 96 40" class="w-full h-full" preserveAspectRatio="none">
							<path
								d={sparklinePath(crypto.btcPriceHistory, 96, 40)}
								fill="none"
								stroke={sparklineColor(crypto.btcPriceHistory)}
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{/if}
				</div>
			</div>

			<!-- Holdings -->
			{#if crypto.btcOwned > 0}
				<div class="mt-3 grid grid-cols-3 gap-2">
					<div>
						<div class="text-[10px] text-text-muted uppercase">Owned</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{crypto.btcOwned.toFixed(6)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">Value</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{formatCurrency(btcValue)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">P&L</div>
						<div class="text-sm font-bold tabular-nums"
							class:text-bio-green={btcPnL >= 0}
							class:text-rocket-red={btcPnL < 0}
						>
							{btcPnL >= 0 ? '+' : ''}{formatCurrency(btcPnL)}
							<span class="text-[10px] opacity-70">({btcPnLPercent >= 0 ? '+' : ''}{btcPnLPercent.toFixed(1)}%)</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Buy section -->
			<div class="mt-4 space-y-2">
				<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Buy BTC</div>
				
				<!-- Quick buy buttons -->
				<div class="flex items-center gap-2">
					{#each QUICK_PERCENTS as percent}
						{@const amount = cash * (percent / 100)}
						<button
							onclick={() => handleBuyBtcPercent(percent)}
							disabled={cash <= 0}
							class="flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150
								   active:scale-[0.95] touch-manipulation"
							style="background-color: {cash > 0 ? '#F7931A15' : 'var(--color-bg-tertiary)'};
								   color: {cash > 0 ? '#F7931A' : 'var(--color-text-muted)'};
								   border: 1px solid {cash > 0 ? '#F7931A25' : 'transparent'};"
						>
							{percent}%
						</button>
					{/each}
				</div>

				<!-- Custom amount input -->
				<div class="flex items-center gap-2">
					<div class="relative flex-1">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
						<input
							type="number"
							bind:value={btcBuyAmount}
							placeholder="Custom amount"
							min="0"
							max={cash}
							class="w-full pl-7 pr-3 py-2 rounded-lg bg-bg-tertiary border border-white/5 text-sm text-text-primary
								   placeholder:text-text-muted/50 focus:outline-none focus:border-[#F7931A]/50"
						/>
					</div>
					<button
						onclick={handleBuyBtcCustom}
						disabled={!btcBuyAmount || parseFloat(btcBuyAmount) <= 0 || parseFloat(btcBuyAmount) > cash}
						class="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150
							   active:scale-[0.95] touch-manipulation"
						style="background-color: {btcBuyAmount && parseFloat(btcBuyAmount) > 0 && parseFloat(btcBuyAmount) <= cash ? '#F7931A' : 'var(--color-bg-tertiary)'};
							   color: {btcBuyAmount && parseFloat(btcBuyAmount) > 0 && parseFloat(btcBuyAmount) <= cash ? '#000' : 'var(--color-text-muted)'};"
					>
						Buy
					</button>
				</div>
			</div>

			<!-- Sell section -->
			{#if crypto.btcOwned > 0}
				<div class="mt-4 space-y-2">
					<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Sell BTC</div>
					
					<!-- Slider -->
					<div class="space-y-1">
						<input
							type="range"
							bind:value={btcSellPercent}
							min="1"
							max="100"
							class="w-full accent-rocket-red"
						/>
						<div class="flex justify-between text-[10px] text-text-muted">
							<span>{btcSellPercent}% ({(crypto.btcOwned * btcSellPercent / 100).toFixed(6)} BTC)</span>
							<span>{formatCurrency(btcSellValue)}</span>
						</div>
					</div>

					<button
						onclick={handleSellBtc}
						class="w-full py-2 rounded-lg text-xs font-semibold
							   bg-rocket-red/10 text-rocket-red border border-rocket-red/20
							   transition-all duration-150 active:scale-[0.97] touch-manipulation"
					>
						Sell {btcSellPercent}% ({formatCurrency(btcSellValue)})
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- ═══ DOGE CARD ═══ -->
	<div class="relative bg-bg-secondary/40 rounded-xl border overflow-hidden"
		style="border-color: {tweetActive ? '#C2A63360' : 'rgba(255,255,255,0.05)'};"
	>
		{#if tweetActive}
			<div class="absolute inset-0 doge-pump-glow pointer-events-none"></div>
		{/if}

		<div class="relative p-4">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
						style="background-color: #C2A63315; border: 1px solid #C2A63325;">
						🐕
					</div>
					<div>
						<h2 class="text-base font-bold text-text-primary flex items-center gap-2">
							Dogecoin
							<span class="text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider"
								style="background-color: #C2A63320; color: #C2A633;">
								meme
							</span>
						</h2>
						<div class="text-lg font-bold tabular-nums font-mono flex items-center gap-2" style="color: #C2A633;">
							{formatDogePrice(crypto.dogePrice)}
							{#if tweetActive}
								<span class="text-[10px] text-bio-green animate-pulse">🚀 +{tweetPumpPercent}%</span>
							{/if}
						</div>
					</div>
				</div>
				<!-- Sparkline -->
				<div class="w-24 h-10 shrink-0">
					{#if crypto.dogePriceHistory.length > 1}
						<svg viewBox="0 0 96 40" class="w-full h-full" preserveAspectRatio="none">
							<path
								d={sparklinePath(crypto.dogePriceHistory, 96, 40)}
								fill="none"
								stroke={sparklineColor(crypto.dogePriceHistory)}
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{/if}
				</div>
			</div>

			<!-- Holdings -->
			{#if crypto.dogeOwned > 0}
				<div class="mt-3 grid grid-cols-3 gap-2">
					<div>
						<div class="text-[10px] text-text-muted uppercase">Owned</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{formatDogeAmount(crypto.dogeOwned)} Ð</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">Value</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{formatCurrency(dogeValue)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">P&L</div>
						<div class="text-sm font-bold tabular-nums"
							class:text-bio-green={dogePnL >= 0}
							class:text-rocket-red={dogePnL < 0}
						>
							{dogePnL >= 0 ? '+' : ''}{formatCurrency(dogePnL)}
							<span class="text-[10px] opacity-70">({dogePnLPercent >= 0 ? '+' : ''}{dogePnLPercent.toFixed(1)}%)</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Buy section -->
			<div class="mt-4 space-y-2">
				<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Buy DOGE</div>
				
				<!-- Quick buy buttons -->
				<div class="flex items-center gap-2">
					{#each QUICK_PERCENTS as percent}
						{@const amount = cash * (percent / 100)}
						<button
							onclick={() => handleBuyDogePercent(percent)}
							disabled={cash <= 0}
							class="flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150
								   active:scale-[0.95] touch-manipulation"
							style="background-color: {cash > 0 ? '#C2A63315' : 'var(--color-bg-tertiary)'};
								   color: {cash > 0 ? '#C2A633' : 'var(--color-text-muted)'};
								   border: 1px solid {cash > 0 ? '#C2A63325' : 'transparent'};"
						>
							{percent}%
						</button>
					{/each}
				</div>

				<!-- Custom amount input -->
				<div class="flex items-center gap-2">
					<div class="relative flex-1">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
						<input
							type="number"
							bind:value={dogeBuyAmount}
							placeholder="Custom amount"
							min="0"
							max={cash}
							class="w-full pl-7 pr-3 py-2 rounded-lg bg-bg-tertiary border border-white/5 text-sm text-text-primary
								   placeholder:text-text-muted/50 focus:outline-none focus:border-[#C2A633]/50"
						/>
					</div>
					<button
						onclick={handleBuyDogeCustom}
						disabled={!dogeBuyAmount || parseFloat(dogeBuyAmount) <= 0 || parseFloat(dogeBuyAmount) > cash}
						class="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150
							   active:scale-[0.95] touch-manipulation"
						style="background-color: {dogeBuyAmount && parseFloat(dogeBuyAmount) > 0 && parseFloat(dogeBuyAmount) <= cash ? '#C2A633' : 'var(--color-bg-tertiary)'};
							   color: {dogeBuyAmount && parseFloat(dogeBuyAmount) > 0 && parseFloat(dogeBuyAmount) <= cash ? '#000' : 'var(--color-text-muted)'};"
					>
						Buy
					</button>
				</div>
			</div>

			<!-- Sell section -->
			{#if crypto.dogeOwned > 0}
				<div class="mt-4 space-y-2">
					<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Sell DOGE</div>
					
					<!-- Slider -->
					<div class="space-y-1">
						<input
							type="range"
							bind:value={dogeSellPercent}
							min="1"
							max="100"
							class="w-full accent-rocket-red"
						/>
						<div class="flex justify-between text-[10px] text-text-muted">
							<span>{dogeSellPercent}% ({formatDogeAmount(crypto.dogeOwned * dogeSellPercent / 100)} DOGE)</span>
							<span>{formatCurrency(dogeSellValue)}</span>
						</div>
					</div>

					<button
						onclick={handleSellDoge}
						class="w-full py-2 rounded-lg text-xs font-semibold
							   bg-rocket-red/10 text-rocket-red border border-rocket-red/20
							   transition-all duration-150 active:scale-[0.97] touch-manipulation"
					>
						Sell {dogeSellPercent}% ({formatCurrency(dogeSellValue)})
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Fun facts -->
	<div class="bg-bg-secondary/30 rounded-xl p-4 border border-white/5">
		<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">
			💡 Did You Know?
		</div>
		<p class="text-xs text-text-muted leading-relaxed">
			Elon's tweets have historically moved DOGE price by 50-300% within hours.
			In Jan 2021, a single tweet ("One word: Doge") triggered a 900% rally over a week.
			DOGE was created in 2013 as a joke based on the Shiba Inu meme.
			It now has a market cap in the tens of billions.
		</p>
	</div>
</div>

<style>
	.tweet-banner {
		background: linear-gradient(135deg, rgba(194, 166, 51, 0.08) 0%, rgba(194, 166, 51, 0.02) 100%);
	}

	.tweet-pulse-bg {
		background: radial-gradient(ellipse at center, rgba(194, 166, 51, 0.06) 0%, transparent 70%);
		animation: pulseBg 2s ease-in-out infinite;
	}

	@keyframes pulseBg {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 1; }
	}

	.doge-pump-glow {
		background: radial-gradient(ellipse at 20% 50%, rgba(194, 166, 51, 0.08) 0%, transparent 60%);
		animation: dogeGlow 1.5s ease-in-out infinite;
	}

	@keyframes dogeGlow {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	input[type="range"] {
		height: 6px;
		border-radius: 3px;
		background: var(--color-bg-tertiary);
	}

	input[type="number"] {
		-moz-appearance: textfield;
	}

	input[type="number"]::-webkit-outer-spin-button,
	input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
