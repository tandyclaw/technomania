<script lang="ts">
	import { onMount } from 'svelte';

	let deferredPrompt: BeforeInstallPromptEvent | null = null;
	let showPrompt = $state(false);
	let dismissed = $state(false);

	onMount(() => {
		// Check if already installed or dismissed
		if (window.matchMedia('(display-mode: standalone)').matches) return;
		if (localStorage.getItem('pwa-install-dismissed')) return;

		window.addEventListener('beforeinstallprompt', (e: Event) => {
			e.preventDefault();
			deferredPrompt = e;
			// Show prompt after 2 minutes of play
			setTimeout(() => {
				if (!dismissed && deferredPrompt) {
					showPrompt = true;
				}
			}, 120_000);
		});
	});

	async function handleInstall() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const result = await deferredPrompt.userChoice;
		if (result.outcome === 'accepted') {
			showPrompt = false;
		}
		deferredPrompt = null;
	}

	function handleDismiss() {
		showPrompt = false;
		dismissed = true;
		localStorage.setItem('pwa-install-dismissed', Date.now().toString());
		deferredPrompt = null;
	}
</script>

{#if showPrompt}
	<div class="install-banner">
		<div class="install-content">
			<div class="install-icon">📱</div>
			<div class="install-text">
				<strong>Add to Home Screen</strong>
				<span>Play offline & get the full app experience</span>
			</div>
			<div class="install-actions">
				<button class="install-btn" onclick={handleInstall}>Install</button>
				<button class="dismiss-btn" onclick={handleDismiss}>✕</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.install-banner {
		position: fixed;
		bottom: 70px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		width: calc(100% - 32px);
		max-width: 480px;
		animation: slideUp 0.3s ease-out;
	}

	.install-content {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(68, 136, 255, 0.15) 100%);
		border: 1px solid rgba(68, 136, 255, 0.3);
		border-radius: 16px;
		backdrop-filter: blur(12px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	.install-icon {
		font-size: 28px;
		flex-shrink: 0;
	}

	.install-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.install-text strong {
		font-size: 14px;
		color: var(--color-text-primary);
	}

	.install-text span {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.install-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.install-btn {
		padding: 8px 16px;
		background: linear-gradient(135deg, #4488ff, #6644ff);
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.install-btn:active {
		transform: scale(0.95);
	}

	.dismiss-btn {
		padding: 4px 8px;
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 16px;
		cursor: pointer;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
