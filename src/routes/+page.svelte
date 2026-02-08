<script lang="ts">
	import { goto } from '$app/navigation';

	let hoveredDivision: string | null = $state(null);
	let launched = $state(false);

	const divisions = [
		{ id: 'spacex', name: 'SpaceX', icon: '🚀', color: '#FF4444', desc: 'Reusable rockets & Mars colonization' },
		{ id: 'tesla', name: 'Tesla', icon: '🔋', color: '#4488FF', desc: 'Electric vehicles & Gigafactories' },
		{ id: 'xai', name: 'xAI', icon: '🧠', color: '#9944FF', desc: 'Grok, Colossus & frontier AI' },
		{ id: 'boring', name: 'The Boring Company', icon: '🕳️', color: '#FF8844', desc: 'Tunnel boring & Vegas Loop' },
		{ id: 'neuralink', name: 'Neuralink', icon: '🧬', color: '#44FF88', desc: 'Brain-computer interfaces' },
		{ id: 'starlink', name: 'Starlink', icon: '🛰️', color: '#44DDFF', desc: 'Satellite internet constellation' },
		{ id: 'teslaenergy', name: 'Tesla Energy', icon: '☀️', color: '#FFCC44', desc: 'Solar, Powerwall & Megapack' }
	];

	function handleStart() {
		launched = true;
		setTimeout(() => goto('/game'), 300);
	}
</script>

<svelte:head>
	<title>Being Elon — Build the Future</title>
	<meta name="description" content="Live the journey. Build SpaceX. Scale Tesla. Launch Starlink. Colonize Mars. One tap at a time." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-bg-primary flex flex-col">
	<!-- Hero Section -->
	<header class="relative overflow-hidden">
		<!-- Animated grid background -->
		<div class="absolute inset-0 opacity-10">
			<div class="grid-bg"></div>
		</div>

		<div class="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-20 text-center">
			<!-- Logo / Title -->
			<div class="mb-2 text-sm font-mono text-text-secondary tracking-[0.3em] uppercase">
				An Idle Tycoon Experience
			</div>

			<h1 class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4">
				<span class="bg-gradient-to-r from-electric-blue via-neural-purple to-rocket-red bg-clip-text text-transparent">
					BEING
				</span>
				<br />
				<span class="bg-gradient-to-r from-solar-gold via-tunnel-orange to-rocket-red bg-clip-text text-transparent">
					ELON
				</span>
			</h1>

			<p class="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-3 font-light">
				Build SpaceX. Scale Tesla. Launch Starlink.
				<br class="hidden md:block" />
				Colonize Mars. <span class="text-solar-gold font-medium">One tap at a time.</span>
			</p>

			<p class="text-sm text-text-muted mb-10 font-mono">
				Live the journey from PayPal to Mars colony
			</p>

			<!-- Start Button -->
			<button
				onclick={handleStart}
				class="group relative inline-flex items-center gap-3 px-8 py-4 md:px-12 md:py-5
					   bg-gradient-to-r from-electric-blue to-neural-purple
					   text-white font-bold text-lg md:text-xl
					   rounded-xl shadow-lg shadow-electric-blue/25
					   hover:shadow-xl hover:shadow-electric-blue/40
					   active:scale-95 transition-all duration-200
					   touch-manipulation"
			>
				<span class="relative z-10">
					{launched ? '🚀 Launching...' : '⚡ Start Game'}
				</span>
				<span class="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
				<div class="absolute inset-0 rounded-xl bg-gradient-to-r from-electric-blue/80 to-neural-purple/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
			</button>

			<p class="mt-4 text-xs text-text-muted">Free to play · No downloads · Works on mobile</p>
		</div>
	</header>

	<!-- Divisions Grid -->
	<section class="max-w-5xl mx-auto px-4 py-12 md:py-20 w-full">
		<h2 class="text-center text-text-secondary text-sm font-mono tracking-[0.2em] uppercase mb-8">
			Seven Companies · One Vision · Mars
		</h2>

		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
			{#each divisions as div}
				<button
					class="group relative p-4 md:p-5 rounded-xl border border-white/5
						   bg-bg-secondary/50 hover:bg-bg-secondary
						   transition-all duration-200 text-left
						   hover:border-white/10 hover:shadow-lg
						   active:scale-95 touch-manipulation"
					style="--div-color: {div.color}"
					onmouseenter={() => hoveredDivision = div.id}
					onmouseleave={() => hoveredDivision = null}
				>
					<div class="text-3xl md:text-4xl mb-3">{div.icon}</div>
					<h3 class="font-bold text-sm md:text-base mb-1 group-hover:text-[var(--div-color)] transition-colors">
						{div.name}
					</h3>
					<p class="text-xs text-text-muted leading-relaxed">{div.desc}</p>

					<!-- Glow effect on hover -->
					<div
						class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
						style="box-shadow: inset 0 0 30px {div.color}15, 0 0 20px {div.color}08"
					></div>
				</button>
			{/each}
		</div>
	</section>

	<!-- Features -->
	<section class="max-w-5xl mx-auto px-4 py-12 md:py-16 w-full">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
			<div class="text-center md:text-left">
				<div class="text-2xl mb-2">🔧</div>
				<h3 class="font-bold text-base mb-2 text-text-primary">Real Engineering</h3>
				<p class="text-sm text-text-secondary leading-relaxed">
					Every bottleneck is real. Falcon 1 fails three times. Production Hell hits Model 3.
					Heat shields crack on Starship. Solve them like Elon did.
				</p>
			</div>
			<div class="text-center md:text-left">
				<div class="text-2xl mb-2">🔗</div>
				<h3 class="font-bold text-base mb-2 text-text-primary">The Master Plan</h3>
				<p class="text-sm text-text-secondary leading-relaxed">
					SpaceX launches Starlink. Tesla batteries power everything.
					xAI optimizes the fleet. Everything feeds into Mars.
				</p>
			</div>
			<div class="text-center md:text-left">
				<div class="text-2xl mb-2">⚡</div>
				<h3 class="font-bold text-base mb-2 text-text-primary">Sustainable Energy</h3>
				<p class="text-sm text-text-secondary leading-relaxed">
					Tesla Energy is the foundation. Solar, Powerwall, Megapack —
					your energy strategy powers every company you build.
				</p>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="mt-auto py-8 text-center">
		<p class="text-xs text-text-muted">
			Being Elon v0.2.0 · Make life multi-planetary
		</p>
	</footer>
</div>

<style>
	.grid-bg {
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(rgba(68, 136, 255, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(68, 136, 255, 0.1) 1px, transparent 1px);
		background-size: 40px 40px;
		animation: grid-scroll 20s linear infinite;
	}

	@keyframes grid-scroll {
		0% { transform: translate(0, 0); }
		100% { transform: translate(40px, 40px); }
	}
</style>
