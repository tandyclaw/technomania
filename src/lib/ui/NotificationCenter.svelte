<script lang="ts">
	import { notifications, unreadCount, markAllRead, clearNotifications, dismissNotification } from '$lib/stores/eventStore';

	let {
		menuStyle = false,
		onOpen,
	}: {
		menuStyle?: boolean;
		onOpen?: () => void;
	} = $props();

	let open = $state(false);
	let items = $derived($notifications);
	let unread = $derived($unreadCount);

	function toggle() {
		open = !open;
		if (open) {
			markAllRead();
			onOpen?.();
		}
	}

	function close() {
		open = false;
	}

	function formatTime(ts: number): string {
		const diff = Date.now() - ts;
		if (diff < 60000) return 'just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
		return `${Math.floor(diff / 3600000)}h ago`;
	}

	const typeColors: Record<string, string> = {
		event: 'border-l-electric-blue',
		achievement: 'border-l-solar-gold',
		milestone: 'border-l-bio-green',
		info: 'border-l-sky-cyan',
	};
</script>

{#if menuStyle}
	<!-- Menu-style button (matches More menu items) -->
	<button
		onclick={toggle}
		class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl touch-manipulation"
		role="menuitem"
		aria-label="Notifications"
	>
		<span class="text-xl leading-none relative" aria-hidden="true">
			🔔
			{#if unread > 0}
				<span class="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 flex items-center justify-center
							 rounded-full bg-rocket-red text-[8px] font-bold text-white px-0.5 tabular-nums">
					{unread > 9 ? '9+' : unread}
				</span>
			{/if}
		</span>
		<span class="text-sm font-medium text-text-secondary">Notifications</span>
	</button>
{:else}
	<!-- Bell icon (inline in ResourceBar area) -->
	<button
		onclick={toggle}
		class="relative p-1.5 rounded-lg hover:bg-bg-tertiary/50 transition-colors touch-manipulation"
		aria-label="Notifications"
	>
		<span class="text-base">🔔</span>
		{#if unread > 0}
			<span class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center
						 rounded-full bg-rocket-red text-[9px] font-bold text-white px-1 tabular-nums">
				{unread > 9 ? '9+' : unread}
			</span>
		{/if}
	</button>
{/if}

<!-- Dropdown -->
{#if open}
	<!-- Backdrop -->
	<button class="fixed inset-0 z-[70] bg-transparent" onclick={close} aria-label="Close notifications"></button>

	<div class="fixed top-[3.25rem] right-2 z-[75] w-80 max-h-[70vh] bg-bg-secondary rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-dropdown"
		 style="margin-top: env(safe-area-inset-top, 0px);">
		<!-- Header -->
		<div class="flex items-center justify-between px-3 py-2 border-b border-white/5">
			<span class="text-sm font-semibold text-text-primary">Notifications</span>
			{#if items.length > 0}
				<button
					onclick={clearNotifications}
					class="text-[10px] text-text-muted hover:text-text-secondary transition-colors"
				>
					Clear all
				</button>
			{/if}
		</div>

		<!-- List -->
		<div class="overflow-y-auto flex-1">
			{#if items.length === 0}
				<div class="p-6 text-center text-text-muted text-sm">
					No notifications yet
				</div>
			{:else}
				{#each items as notif (notif.id)}
					<div class="flex items-start gap-2 px-3 py-2 border-b border-white/5 border-l-2 {typeColors[notif.type] ?? 'border-l-white/10'}
								{notif.read ? 'opacity-60' : ''}">
						<span class="text-base shrink-0 mt-0.5">{notif.icon}</span>
						<div class="min-w-0 flex-1">
							<div class="text-xs font-semibold text-text-primary truncate">{notif.title}</div>
							<div class="text-[11px] text-text-secondary truncate">{notif.message}</div>
						</div>
						<span class="text-[9px] text-text-muted shrink-0 mt-0.5">{formatTime(notif.timestamp)}</span>
						<button
							onclick={() => dismissNotification(notif.id)}
							class="shrink-0 w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors rounded-full text-[10px] leading-none touch-manipulation"
							aria-label="Dismiss"
						>✕</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style>
	.animate-dropdown {
		animation: dropIn 0.15s ease-out;
	}

	@keyframes dropIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
