<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { formatCurrency, formatNumber } from '$lib/engine/BigNumber';
	import {
		buySavings, withdrawSavings,
		buyIndex, sellIndex, getIndexValue,
		buyBtc, sellBtc, getBtcPortfolioValue, getBtcPnL,
		buyDoge, sellDoge, getDogePortfolioValue, getDogePnL,
		getTotalTreasuryValue, getTotalTreasuryPnL,
	} from '$lib/systems/TreasurySystem';

	let state = $derived($gameState);
	let treasury = $derived(state.treasury);
	let cash = $derived(state.cash);
	let totalEarned = $derived(state.stats.totalCashEarned);

	// Unlock threshold
	const TREASURY_UNLOCK = 500_000;
	let treasuryUnlocked = $derived(totalEarned >= TREASURY_UNLOCK);

	// Savings - always safe
	let savingsInterestRate = $derived(0.05); // 5% APY equivalent (shown as per-cycle)

	// Index fund
	let indexValue = $derived(getIndexValue(treasury));
	let indexPnL = $derived(indexValue - treasury.indexInvested);
	let indexPnLPercent = $derived(treasury.indexInvested > 0 ? (indexPnL / treasury.indexInvested) * 100 : 0);

	// BTC
	let btcValue = $derived(getBtcPortfolioValue(treasury));
	let btcPnL = $derived(getBtcPnL(treasury));
	let btcPnLPercent = $derived(treasury.btcInvested > 0 ? (btcPnL / treasury.btcInvested) * 100 : 0);

	// DOGE
	let dogeValue = $derived(getDogePortfolioValue(treasury));
	let dogePnL = $derived(getDogePnL(treasury));
	let dogePnLPercent = $derived(treasury.dogeInvested > 0 ? (dogePnL / treasury.dogeInvested) * 100 : 0);

	// Meme pump active
	let memeActive = $derived(treasury.memePumpMs > 0);
	let memeTimeLeft = $derived(Math.ceil(treasury.memePumpMs / 1000));
	let memePumpPercent = $derived(Math.round((treasury.memePumpMultiplier - 1) * 100));

	// Total portfolio
	let totalValue = $derived(getTotalTreasuryValue(treasury));
	let totalPnL = $derived(getTotalTreasuryPnL(treasury));

	// Investment percentages
	const QUICK_PERCENTS = [10, 25, 50, 100];

	// Sell percentages (state)
	let savingsWithdrawPercent = $state(100);
	let indexSellPercent = $state(100);
	let btcSellPercent = $state(100);
	let dogeSellPercent = $state(100);

	// Custom inputs
	let savingsAmount = $state('');
	let indexAmount = $state('');
	let btcAmount = $state('');
	let dogeAmount = $state('');

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

	// Handlers
	function handleBuyPercent(buyFn: (amount: number) => boolean, percent: number) {
		const amount = cash * (percent / 100);
		if (amount > 0) buyFn(amount);
	}

	function handleBuyCustom(buyFn: (amount: number) => boolean, amountStr: string, clearFn: () => void) {
		const amount = parseFloat(amountStr);
		if (!isNaN(amount) && amount > 0 && amount <= cash) {
			buyFn(amount);
			clearFn();
		}
	}

	function handleSellPercent(sellFn: (amount: number) => boolean, totalOwned: number, percent: number) {
		const amount = totalOwned * (percent / 100);
		if (amount > 0) sellFn(amount);
	}

	// Sell value previews
	let savingsWithdrawValue = $derived(treasury.savings * (savingsWithdrawPercent / 100));
	let indexSellValue = $derived(indexValue * (indexSellPercent / 100));
	let btcSellValue = $derived(btcValue * (btcSellPercent / 100));
	let dogeSellValue = $derived(dogeValue * (dogeSellPercent / 100));
</script>

<div class="treasury-view space-y-4">
	<!-- Header -->
	<div>
		<h1 class="text-xl font-bold text-text-primary flex items-center gap-2">
			<span>🏦</span> Treasury
		</h1>
		<p class="text-sm text-text-secondary mt-0.5">
			Invest your profits. Different risk levels, different rewards.
		</p>
	</div>

	{#if !treasuryUnlocked}
		<div class="bg-bg-secondary/40 rounded-xl border border-white/5 p-8 text-center space-y-3">
			<div class="text-4xl">🔒</div>
			<h2 class="text-lg font-bold text-text-primary">Treasury Locked</h2>
			<p class="text-sm text-text-muted">
				Earn <span class="font-bold text-electric-blue">{formatCurrency(TREASURY_UNLOCK)}</span> total cash to unlock investments.
			</p>
			<div class="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
				<div class="h-full bg-electric-blue/60 rounded-full transition-all duration-500"
					style="width: {Math.min(100, (totalEarned / TREASURY_UNLOCK) * 100)}%"></div>
			</div>
			<p class="text-xs text-text-muted tabular-nums font-mono">
				{formatCurrency(totalEarned)} / {formatCurrency(TREASURY_UNLOCK)}
			</p>
		</div>
	{:else}

	<!-- Meme Pump Banner -->
	{#if memeActive}
		<div class="relative overflow-hidden rounded-xl p-4 border-2 border-[#C2A633]/40"
			style="background: linear-gradient(135deg, rgba(194, 166, 51, 0.08) 0%, rgba(194, 166, 51, 0.02) 100%);">
			<div class="flex items-center gap-3">
				<div class="text-3xl animate-bounce">🐕</div>
				<div class="flex-1">
					<div class="text-sm font-bold text-[#C2A633]">
						🚀 MEME COIN PUMP! +{memePumpPercent}%
					</div>
					<div class="text-xs text-text-secondary mt-0.5">
						{memeTimeLeft}s remaining...
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Total Portfolio -->
	<div class="relative overflow-hidden rounded-xl p-4 border border-white/5"
		style="background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(68, 170, 119, 0.08) 100%);">
		<div class="grid grid-cols-2 gap-4">
			<div>
				<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
					Total Invested
				</div>
				<div class="text-2xl font-bold text-text-primary tabular-nums font-mono">
					{formatCurrency(totalValue)}
				</div>
				{#if totalPnL !== 0}
					<div class="mt-1 text-sm font-semibold tabular-nums"
						class:text-bio-green={totalPnL >= 0}
						class:text-rocket-red={totalPnL < 0}>
						{totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
					</div>
				{/if}
			</div>
			<div>
				<div class="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">
					Available Cash
				</div>
				<div class="text-2xl font-bold text-text-primary tabular-nums font-mono">
					{formatCurrency(cash)}
				</div>
			</div>
		</div>
	</div>

	<!-- ═══ SAVINGS ACCOUNT ═══ -->
	<div class="bg-bg-secondary/40 rounded-xl border border-white/5 overflow-hidden">
		<div class="p-4">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
						style="background-color: #44AA7715; border: 1px solid #44AA7725;">
						🏦
					</div>
					<div>
						<h2 class="text-base font-bold text-text-primary">Savings Account</h2>
						<div class="text-xs text-text-muted mt-0.5">
							Safe • 5% APY • Instant withdraw
						</div>
					</div>
				</div>
				<div class="text-right">
					<div class="text-xs text-text-muted">Balance</div>
					<div class="text-lg font-bold tabular-nums font-mono text-bio-green">
						{formatCurrency(treasury.savings)}
					</div>
				</div>
			</div>

			<!-- Deposit -->
			<div class="mt-4 space-y-2">
				<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Deposit</div>
				<div class="flex items-center gap-2">
					{#each QUICK_PERCENTS as percent}
						<button
							onclick={() => handleBuyPercent(buySavings, percent)}
							disabled={cash <= 0}
							class="flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150
								   active:scale-[0.95] touch-manipulation"
							style="background-color: {cash > 0 ? '#44AA7715' : 'var(--color-bg-tertiary)'};
								   color: {cash > 0 ? '#44AA77' : 'var(--color-text-muted)'};
								   border: 1px solid {cash > 0 ? '#44AA7725' : 'transparent'};">
							{percent}%
						</button>
					{/each}
				</div>
			</div>

			<!-- Withdraw -->
			{#if treasury.savings > 0}
				<div class="mt-4 space-y-2">
					<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Withdraw</div>
					<div class="space-y-1">
						<input type="range" bind:value={savingsWithdrawPercent} min="1" max="100"
							class="w-full accent-bio-green" />
						<div class="flex justify-between text-[10px] text-text-muted">
							<span>{savingsWithdrawPercent}%</span>
							<span>{formatCurrency(savingsWithdrawValue)}</span>
						</div>
					</div>
					<button
						onclick={() => handleSellPercent(withdrawSavings, treasury.savings, savingsWithdrawPercent)}
						class="w-full py-2 rounded-lg text-xs font-semibold
							   bg-bio-green/10 text-bio-green border border-bio-green/20
							   transition-all duration-150 active:scale-[0.97] touch-manipulation">
						Withdraw {formatCurrency(savingsWithdrawValue)}
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- ═══ INDEX FUND ═══ -->
	<div class="bg-bg-secondary/40 rounded-xl border border-white/5 overflow-hidden">
		<div class="p-4">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
						style="background-color: #4488FF15; border: 1px solid #4488FF25;">
						📈
					</div>
					<div>
						<h2 class="text-base font-bold text-text-primary">Index Fund</h2>
						<div class="text-xs text-text-muted mt-0.5">
							Medium risk • Market exposure
						</div>
					</div>
				</div>
				<!-- Sparkline -->
				<div class="w-20 h-8 shrink-0">
					{#if treasury.indexHistory.length > 1}
						<svg viewBox="0 0 80 32" class="w-full h-full" preserveAspectRatio="none">
							<path
								d={sparklinePath(treasury.indexHistory, 80, 32)}
								fill="none"
								stroke={sparklineColor(treasury.indexHistory)}
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					{/if}
				</div>
			</div>

			{#if treasury.indexShares > 0}
				<div class="mt-3 grid grid-cols-3 gap-2">
					<div>
						<div class="text-[10px] text-text-muted uppercase">Shares</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{treasury.indexShares.toFixed(2)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">Value</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{formatCurrency(indexValue)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">P&L</div>
						<div class="text-sm font-bold tabular-nums"
							class:text-bio-green={indexPnL >= 0}
							class:text-rocket-red={indexPnL < 0}>
							{indexPnL >= 0 ? '+' : ''}{formatCurrency(indexPnL)}
							<span class="text-[10px] opacity-70">({indexPnLPercent >= 0 ? '+' : ''}{indexPnLPercent.toFixed(1)}%)</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Buy -->
			<div class="mt-4 space-y-2">
				<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Buy Shares</div>
				<div class="flex items-center gap-2">
					{#each QUICK_PERCENTS as percent}
						<button
							onclick={() => handleBuyPercent(buyIndex, percent)}
							disabled={cash <= 0}
							class="flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150
								   active:scale-[0.95] touch-manipulation"
							style="background-color: {cash > 0 ? '#4488FF15' : 'var(--color-bg-tertiary)'};
								   color: {cash > 0 ? '#4488FF' : 'var(--color-text-muted)'};
								   border: 1px solid {cash > 0 ? '#4488FF25' : 'transparent'};">
							{percent}%
						</button>
					{/each}
				</div>
			</div>

			<!-- Sell -->
			{#if treasury.indexShares > 0}
				<div class="mt-4 space-y-2">
					<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Sell Shares</div>
					<div class="space-y-1">
						<input type="range" bind:value={indexSellPercent} min="1" max="100"
							class="w-full accent-rocket-red" />
						<div class="flex justify-between text-[10px] text-text-muted">
							<span>{indexSellPercent}% ({(treasury.indexShares * indexSellPercent / 100).toFixed(2)} shares)</span>
							<span>{formatCurrency(indexSellValue)}</span>
						</div>
					</div>
					<button
						onclick={() => handleSellPercent((amt) => sellIndex(amt / treasury.indexPrice), treasury.indexShares, indexSellPercent)}
						class="w-full py-2 rounded-lg text-xs font-semibold
							   bg-rocket-red/10 text-rocket-red border border-rocket-red/20
							   transition-all duration-150 active:scale-[0.97] touch-manipulation">
						Sell {indexSellPercent}% ({formatCurrency(indexSellValue)})
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- ═══ BITCOIN ═══ -->
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
							{formatCurrency(treasury.btcPrice)}
						</div>
					</div>
				</div>
				<div class="w-20 h-8 shrink-0">
					{#if treasury.btcHistory.length > 1}
						<svg viewBox="0 0 80 32" class="w-full h-full" preserveAspectRatio="none">
							<path
								d={sparklinePath(treasury.btcHistory, 80, 32)}
								fill="none"
								stroke={sparklineColor(treasury.btcHistory)}
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					{/if}
				</div>
			</div>

			{#if treasury.btcOwned > 0}
				<div class="mt-3 grid grid-cols-3 gap-2">
					<div>
						<div class="text-[10px] text-text-muted uppercase">Owned</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{treasury.btcOwned.toFixed(6)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">Value</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{formatCurrency(btcValue)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">P&L</div>
						<div class="text-sm font-bold tabular-nums"
							class:text-bio-green={btcPnL >= 0}
							class:text-rocket-red={btcPnL < 0}>
							{btcPnL >= 0 ? '+' : ''}{formatCurrency(btcPnL)}
							<span class="text-[10px] opacity-70">({btcPnLPercent >= 0 ? '+' : ''}{btcPnLPercent.toFixed(1)}%)</span>
						</div>
					</div>
				</div>
			{/if}

			<div class="mt-4 space-y-2">
				<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Buy BTC</div>
				<div class="flex items-center gap-2">
					{#each QUICK_PERCENTS as percent}
						<button
							onclick={() => handleBuyPercent(buyBtc, percent)}
							disabled={cash <= 0}
							class="flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150
								   active:scale-[0.95] touch-manipulation"
							style="background-color: {cash > 0 ? '#F7931A15' : 'var(--color-bg-tertiary)'};
								   color: {cash > 0 ? '#F7931A' : 'var(--color-text-muted)'};
								   border: 1px solid {cash > 0 ? '#F7931A25' : 'transparent'};">
							{percent}%
						</button>
					{/each}
				</div>
			</div>

			{#if treasury.btcOwned > 0}
				<div class="mt-4 space-y-2">
					<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Sell BTC</div>
					<div class="space-y-1">
						<input type="range" bind:value={btcSellPercent} min="1" max="100"
							class="w-full accent-rocket-red" />
						<div class="flex justify-between text-[10px] text-text-muted">
							<span>{btcSellPercent}% ({(treasury.btcOwned * btcSellPercent / 100).toFixed(6)} BTC)</span>
							<span>{formatCurrency(btcSellValue)}</span>
						</div>
					</div>
					<button
						onclick={() => handleSellPercent(sellBtc, treasury.btcOwned, btcSellPercent)}
						class="w-full py-2 rounded-lg text-xs font-semibold
							   bg-rocket-red/10 text-rocket-red border border-rocket-red/20
							   transition-all duration-150 active:scale-[0.97] touch-manipulation">
						Sell {btcSellPercent}% ({formatCurrency(btcSellValue)})
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- ═══ MEME COIN ═══ -->
	<div class="relative bg-bg-secondary/40 rounded-xl border overflow-hidden"
		style="border-color: {memeActive ? '#C2A63360' : 'rgba(255,255,255,0.05)'};">
		{#if memeActive}
			<div class="absolute inset-0 pointer-events-none"
				style="background: radial-gradient(ellipse at 20% 50%, rgba(194, 166, 51, 0.08) 0%, transparent 60%);
					   animation: dogeGlow 1.5s ease-in-out infinite;"></div>
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
							Meme Coin
							<span class="text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider"
								style="background-color: #C2A63320; color: #C2A633;">
								degen
							</span>
						</h2>
						<div class="text-lg font-bold tabular-nums font-mono flex items-center gap-2" style="color: #C2A633;">
							${treasury.dogePrice.toFixed(4)}
							{#if memeActive}
								<span class="text-[10px] text-bio-green animate-pulse">🚀 +{memePumpPercent}%</span>
							{/if}
						</div>
					</div>
				</div>
				<div class="w-20 h-8 shrink-0">
					{#if treasury.dogeHistory.length > 1}
						<svg viewBox="0 0 80 32" class="w-full h-full" preserveAspectRatio="none">
							<path
								d={sparklinePath(treasury.dogeHistory, 80, 32)}
								fill="none"
								stroke={sparklineColor(treasury.dogeHistory)}
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					{/if}
				</div>
			</div>

			{#if treasury.dogeOwned > 0}
				<div class="mt-3 grid grid-cols-3 gap-2">
					<div>
						<div class="text-[10px] text-text-muted uppercase">Owned</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">
							{treasury.dogeOwned >= 1000000 ? (treasury.dogeOwned / 1000000).toFixed(2) + 'M' :
							 treasury.dogeOwned >= 1000 ? (treasury.dogeOwned / 1000).toFixed(1) + 'K' :
							 treasury.dogeOwned.toFixed(2)}
						</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">Value</div>
						<div class="text-sm font-bold tabular-nums text-text-primary">{formatCurrency(dogeValue)}</div>
					</div>
					<div>
						<div class="text-[10px] text-text-muted uppercase">P&L</div>
						<div class="text-sm font-bold tabular-nums"
							class:text-bio-green={dogePnL >= 0}
							class:text-rocket-red={dogePnL < 0}>
							{dogePnL >= 0 ? '+' : ''}{formatCurrency(dogePnL)}
							<span class="text-[10px] opacity-70">({dogePnLPercent >= 0 ? '+' : ''}{dogePnLPercent.toFixed(1)}%)</span>
						</div>
					</div>
				</div>
			{/if}

			<div class="mt-4 space-y-2">
				<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Buy Meme Coins</div>
				<div class="flex items-center gap-2">
					{#each QUICK_PERCENTS as percent}
						<button
							onclick={() => handleBuyPercent(buyDoge, percent)}
							disabled={cash <= 0}
							class="flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150
								   active:scale-[0.95] touch-manipulation"
							style="background-color: {cash > 0 ? '#C2A63315' : 'var(--color-bg-tertiary)'};
								   color: {cash > 0 ? '#C2A633' : 'var(--color-text-muted)'};
								   border: 1px solid {cash > 0 ? '#C2A63325' : 'transparent'};">
							{percent}%
						</button>
					{/each}
				</div>
			</div>

			{#if treasury.dogeOwned > 0}
				<div class="mt-4 space-y-2">
					<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium">Sell Meme Coins</div>
					<div class="space-y-1">
						<input type="range" bind:value={dogeSellPercent} min="1" max="100"
							class="w-full accent-rocket-red" />
						<div class="flex justify-between text-[10px] text-text-muted">
							<span>{dogeSellPercent}%</span>
							<span>{formatCurrency(dogeSellValue)}</span>
						</div>
					</div>
					<button
						onclick={() => handleSellPercent(sellDoge, treasury.dogeOwned, dogeSellPercent)}
						class="w-full py-2 rounded-lg text-xs font-semibold
							   bg-rocket-red/10 text-rocket-red border border-rocket-red/20
							   transition-all duration-150 active:scale-[0.97] touch-manipulation">
						Sell {dogeSellPercent}% ({formatCurrency(dogeSellValue)})
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Risk disclaimer -->
	<div class="bg-bg-secondary/30 rounded-xl p-4 border border-white/5">
		<div class="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">
			⚠️ Investment Risk
		</div>
		<p class="text-xs text-text-muted leading-relaxed">
			<strong class="text-bio-green">Savings:</strong> No risk, steady 5% growth.<br/>
			<strong class="text-ev-blue">Index Fund:</strong> ±15% swings, trends up long-term.<br/>
			<strong style="color: #F7931A;">Bitcoin:</strong> ±40% volatility, crashes and moons.<br/>
			<strong style="color: #C2A633;">Meme Coins:</strong> Pure gambling. You've been warned.
		</p>
	</div>
	{/if}
</div>

<style>
	button:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	input[type="range"] {
		height: 6px;
		border-radius: 3px;
		background: var(--color-bg-tertiary);
	}

	@keyframes dogeGlow {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}
</style>
