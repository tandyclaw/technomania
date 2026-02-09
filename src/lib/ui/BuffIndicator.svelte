<script lang="ts">
	import { activeBuffs } from '$lib/stores/eventStore';

	let buffs = $derived($activeBuffs);

	function formatTime(ms: number): string {
		const s = Math.ceil(ms / 1000);
		if (s >= 60) {
			const m = Math.floor(s / 60);
			const sec = s % 60;
			return `${m}:${sec.toString().padStart(2, '0')}`;
		}
		return `${s}s`;
	}

	function progressPct(buff: { remainingMs: number; totalMs: number }): number {
		return Math.max(0, (buff.remainingMs / buff.totalMs) * 100);
	}
</script>

{#if buffs.length > 0}
	<div class="flex flex-wrap gap-1.5 px-3 py-1.5 bg-bg-primary/80 backdrop-blur-sm border-b border-white/5"
		 style="padding-top: 0; margin-top: -1px;">
		{#each buffs as buff (buff.id)}
			<div
				class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-tertiary/60 border border-white/5 text-[11px] transition-opacity duration-500"
				class:opacity-50={buff.remainingMs < 3000}
				title={buff.effect}
			>
				<span class="text-xs">{buff.icon}</span>
				<span class="font-medium {buff.color} truncate max-w-[80px]">{buff.name}</span>
				<span class="text-text-muted tabular-nums font-mono text-[10px]">{formatTime(buff.remainingMs)}</span>
				<!-- Tiny progress bar -->
				<div class="w-8 h-1 rounded-full bg-bg-primary/50 overflow-hidden">
					<div
						class="h-full rounded-full transition-all duration-200 ease-linear {buff.color.replace('text-', 'bg-')}"
						style="width: {progressPct(buff)}%"
					></div>
				</div>
			</div>
		{/each}
	</div>
{/if}
