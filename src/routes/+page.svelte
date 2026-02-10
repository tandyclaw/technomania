<script lang="ts">
	import { goto } from '$app/navigation';

	let launched = $state(false);

	const divisions = [
		{ name: 'Energy', icon: '⚡', color: '#FFCC44', desc: 'Solar & batteries. Power everything.' },
		{ name: 'Rockets', icon: '🚀', color: '#FF4444', desc: 'Build rockets. Get to Mars.' },
		{ name: 'Manufacturing', icon: '🏭', color: '#44AAFF', desc: 'Scale production. Build anything.' },
		{ name: 'AI', icon: '🤖', color: '#9944FF', desc: 'From chatbots to AGI.' },
		{ name: 'Tunnels', icon: '🚇', color: '#FF8844', desc: 'Move people underground.' },
		{ name: 'Robotics', icon: '🦾', color: '#FF6644', desc: 'Automate everything.' },
	];

	const features = [
		{ icon: '🔗', title: 'Cross-Division Synergies', desc: 'AI powers robots. Robots run factories. Factories use your energy grid.' },
		{ icon: '🔬', title: 'Research Tree', desc: 'Invest in R&D to unlock permanent upgrades across your empire.' },
		{ icon: '⚡', title: 'Random Events', desc: 'Government subsidies, viral tweets, tunnel collapses — adapt or lose.' },
		{ icon: '🪐', title: 'Mars Endgame', desc: 'Everything builds toward one goal: a self-sustaining colony on Mars.' },
	];

	function handleStart() {
		launched = true;
		setTimeout(() => goto('/game'), 300);
	}
</script>

<svelte:head>
	<title>Moonshot — Build a Tech Empire</title>
	<meta name="description" content="Build rockets, scale manufacturing, train AI, dig tunnels, and colonize Mars. An idle tycoon game about building the future — one tap at a time." />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Moonshot — Build a Tech Empire" />
	<meta property="og:description" content="Build rockets, train AI, dig tunnels, and colonize Mars. A free idle tycoon game — no downloads, works on mobile." />
	<meta property="og:image" content="/icon-512.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Moonshot — Build a Tech Empire" />
	<meta name="twitter:description" content="Build rockets, train AI, dig tunnels, and colonize Mars. A free idle tycoon game." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-bg-primary flex flex-col overflow-x-hidden scroll-smooth">
	<!-- Hero -->
	<header class="relative overflow-hidden">
		<div class="absolute inset-0 opacity-10">
			<div class="grid-bg"></div>
		</div>

		<!-- Animated stars -->
		<div class="stars-container absolute inset-0 overflow-hidden pointer-events-none">
			{#each Array(40) as _, i}
				<div
					class="star absolute rounded-full bg-white"
					style="
						width: {1 + Math.random() * 2}px;
						height: {1 + Math.random() * 2}px;
						top: {Math.random() * 100}%;
						left: {Math.random() * 100}%;
						animation: twinkle {2 + Math.random() * 4}s ease-in-out {Math.random() * 3}s infinite;
					"
				></div>
			{/each}
		</div>

		<!-- Floating orbs -->
		<div class="absolute top-20 left-[10%] w-64 h-64 rounded-full blur-[100px] opacity-20 bg-electric-blue"></div>
		<div class="absolute top-40 right-[10%] w-48 h-48 rounded-full blur-[80px] opacity-15 bg-neural-purple"></div>

		<div class="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-14 md:pt-28 md:pb-24 text-center">
			<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6 text-xs font-mono text-text-secondary tracking-wider">
				<span class="w-1.5 h-1.5 rounded-full bg-bio-green animate-pulse"></span>
				IDLE TYCOON GAME
			</div>

			<h1 class="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-[0.9]">
				<span class="bg-gradient-to-br from-white via-white to-text-secondary bg-clip-text text-transparent">
					MOON
				</span>
				<span class="bg-gradient-to-br from-solar-gold via-tunnel-orange to-rocket-red bg-clip-text text-transparent">
					SHOT
				</span>
			</h1>

			<p class="text-lg md:text-2xl text-text-secondary max-w-xl mx-auto mb-3 font-light leading-relaxed">
				Build a tech empire from nothing.
				<span class="text-text-primary font-medium">Colonize Mars.</span>
			</p>

			<p class="text-sm text-text-muted mb-10 font-mono">
				6 divisions · 42 tiers · synergies · colonies
			</p>

			<button
				onclick={handleStart}
				class="group relative inline-flex items-center gap-3 px-10 py-5 md:px-14 md:py-6
					   bg-gradient-to-r from-solar-gold to-tunnel-orange
					   text-bg-primary font-extrabold text-lg md:text-xl
					   rounded-2xl shadow-lg shadow-solar-gold/25
					   hover:shadow-xl hover:shadow-solar-gold/40
					   active:scale-95 transition-all duration-200
					   touch-manipulation"
			>
				<span class="relative z-10">
					{launched ? '🚀 Launching...' : '🚀 Start Building'}
				</span>
				<div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-solar-gold/90 to-tunnel-orange/90 opacity-0 group-hover:opacity-100 transition-opacity"></div>
			</button>

			<p class="mt-5 text-xs text-text-muted">
				Free · No downloads · Works on mobile · Saves automatically
			</p>
		</div>
	</header>

	<!-- Divisions -->
	<section class="max-w-5xl mx-auto px-4 py-16 md:py-24 w-full">
		<h2 class="text-center text-text-secondary text-xs font-mono tracking-[0.3em] uppercase mb-10">
			Six Divisions · One Mission
		</h2>

		<div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
			{#each divisions as div}
				<div
					class="group relative p-5 md:p-6 rounded-xl border border-white/5
						   bg-bg-secondary/40 hover:bg-bg-secondary/70
						   transition-all duration-200"
				>
					<div class="text-3xl md:text-4xl mb-3">{div.icon}</div>
					<h3 class="font-bold text-sm md:text-base mb-1 text-text-primary">{div.name}</h3>
					<p class="text-xs text-text-muted leading-relaxed">{div.desc}</p>
					<div
						class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
						style="box-shadow: inset 0 0 40px {div.color}30, 0 0 25px {div.color}20; border: 1px solid {div.color}40;"
					></div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Features -->
	<section class="max-w-5xl mx-auto px-4 py-12 md:py-20 w-full">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
			{#each features as feat}
				<div class="p-5 rounded-xl border border-white/5 bg-bg-secondary/30">
					<div class="text-2xl mb-2">{feat.icon}</div>
					<h3 class="font-bold text-sm mb-1.5 text-text-primary">{feat.title}</h3>
					<p class="text-xs text-text-muted leading-relaxed">{feat.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- How It Works -->
	<section class="max-w-5xl mx-auto px-4 py-12 md:py-20 w-full">
		<h2 class="text-center text-text-secondary text-xs font-mono tracking-[0.3em] uppercase mb-10">
			How It Works
		</h2>

		<div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-3xl mx-auto">
			<div class="text-center px-4">
				<div class="text-3xl mb-2">👆</div>
				<p class="text-sm font-semibold text-text-primary">Tap to Produce</p>
				<p class="text-xs text-text-muted mt-1">Start production in each division</p>
			</div>
			<div class="text-text-muted text-2xl hidden md:block">→</div>
			<div class="text-center px-4">
				<div class="text-3xl mb-2">👔</div>
				<p class="text-sm font-semibold text-text-primary">Hire Chiefs</p>
				<p class="text-xs text-text-muted mt-1">Automate while you're away</p>
			</div>
			<div class="text-text-muted text-2xl hidden md:block">→</div>
			<div class="text-center px-4">
				<div class="text-3xl mb-2">📈</div>
				<p class="text-sm font-semibold text-text-primary">Launch Colonies</p>
				<p class="text-xs text-text-muted mt-1">Reset with permanent multipliers</p>
			</div>
			<div class="text-text-muted text-2xl hidden md:block">→</div>
			<div class="text-center px-4">
				<div class="text-3xl mb-2">🪐</div>
				<p class="text-sm font-semibold text-text-primary">Reach Mars</p>
				<p class="text-xs text-text-muted mt-1">Build a self-sustaining colony</p>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="max-w-5xl mx-auto px-4 py-16 md:py-24 w-full text-center">
		<p class="text-text-muted text-sm mb-4 font-mono">Ready to build the future?</p>
		<button
			onclick={handleStart}
			class="inline-flex items-center gap-2 px-8 py-4
				   bg-gradient-to-r from-solar-gold to-tunnel-orange
				   text-bg-primary font-extrabold text-lg
				   rounded-2xl shadow-lg shadow-solar-gold/20
				   hover:shadow-xl active:scale-95 transition-all duration-200
				   touch-manipulation"
		>
			🚀 Start Building
		</button>
	</section>

	<!-- Footer -->
	<footer class="mt-auto py-8 text-center border-t border-white/5">
		<p class="text-xs text-text-muted">
			Moonshot · An idle game about building the future
		</p>
	</footer>
</div>

<style>
	.grid-bg {
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(rgba(68, 136, 255, 0.08) 1px, transparent 1px),
			linear-gradient(90deg, rgba(68, 136, 255, 0.08) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: grid-scroll 25s linear infinite;
	}

	@keyframes grid-scroll {
		0% { transform: translate(0, 0); }
		100% { transform: translate(50px, 50px); }
	}

	@keyframes twinkle {
		0%, 100% { opacity: 0.2; }
		50% { opacity: 0.9; }
	}
</style>
