<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Moonshot — Something Went Wrong</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="fixed inset-0 bg-[#0f1729] flex items-center justify-center px-4" style="font-family: Inter, sans-serif;">
	<div class="text-center max-w-sm w-full">
		<div class="text-6xl mb-4">💥</div>
		<h1 class="text-2xl font-bold text-white mb-2">Houston, We Have a Problem</h1>
		<p class="text-[#8b95b0] text-sm mb-1">
			{$page.status} — {$page.error?.message || 'Something went wrong'}
		</p>
		<p class="text-[#8b95b0]/60 text-xs mb-8">
			Don't worry — your local saves are safe.
		</p>
		<a
			href="/game"
			class="inline-block py-3 px-8 rounded-xl bg-[#3b82f6] text-white font-semibold
				   transition-all duration-200 hover:bg-[#2563eb] active:scale-95"
		>
			Return to Game 🚀
		</a>
		<a
			href="/"
			class="block mt-3 text-[#8b95b0] text-xs hover:text-white transition-colors"
		>
			Back to home
		</a>
	</div>
</div>
