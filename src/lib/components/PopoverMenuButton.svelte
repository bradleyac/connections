<script lang="ts">
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { trapFocus } from '@zag-js/focus-trap';
	import type { Snippet } from 'svelte';
	import { on } from 'svelte/events';

	let {
		opened = $bindable(),
		...props
	}: {
		title: string;
		children?: Snippet;
		menu?: Snippet<[() => void]>;
		class?: string | string[];
		id: string;
		opened?: string | null;
	} = $props();
	let visible = $derived(opened === props.id);
	let button = $state<HTMLButtonElement>();
	let popover = $state<HTMLDivElement>();
	let topPx = $state(0);
	let leftPx = $state(0);

	function togglePopover(e: Event) {
		// Blur the button so that it doesn't prevent autofocus
		(e.currentTarget as HTMLElement)?.blur();
		if (visible) {
			opened = null;
		} else {
			opened = props.id;
			update();
		}
	}

	function closePopover() {
		console.log(visible);
		if (visible) {
			opened = null;
			return true;
		}
		return false;
	}

	function update() {
		if (!popover || !button) return;
		computePosition(button, popover, {
			placement: 'top',
			middleware: [offset(10), flip(), shift()]
		}).then(({ x, y }) => {
			leftPx = x;
			topPx = y;
		});
	}

	$effect(() => {
		if (visible && popover) {
			return trapFocus(popover);
		}
	});

	$effect(() => {
		return on(document, 'keydown', (e) => {
			if (e.key === 'Escape') {
				closePopover();
			}
		});
	});

	$effect(() => {
		return on(document, 'click', (e) => {
			if (!popover?.contains(e.target as Node) && !button?.contains(e.target as Node)) {
				console.log('closing');
				if (closePopover()) {
					e.stopPropagation();
				}
			}
		});
	});
</script>

<button {...props} bind:this={button} title={props.title} onclick={togglePopover}>
	{@render props.children?.()}
</button>

<div
	bind:this={popover}
	style:top="{topPx}px"
	style:left="{leftPx}px"
	class={[visible || 'invisible', 'absolute z-5 flex max-w-full']}
>
	{#if visible}
		{@render props.menu?.(closePopover)}
	{/if}
</div>
