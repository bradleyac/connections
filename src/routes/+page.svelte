<script lang="ts">
	import { goto } from '$app/navigation';
	import PopoverMenuButton from '$lib/components/PopoverMenuButton.svelte';
	import type { ConnectionsCard } from '$lib/types.js';
	import { flip } from 'svelte/animate';
	import { SvelteMap } from 'svelte/reactivity';

	let { data } = $props();
	type category = 'yellow' | 'green' | 'blue' | 'purple' | 'white';
	const categories = ['purple', 'blue', 'green', 'yellow', 'white'] as category[];
	let colors = $state(new SvelteMap<ConnectionsCard, category>());
	let colorCounts = $derived.by(() => {
		const counts: Record<category, number> = {
			purple: 0,
			blue: 0,
			green: 0,
			yellow: 0,
			white: 0
		};
		for (const color of colors.values?.() || []) {
			counts[color] = (counts[color] || 0) + 1;
		}
		return counts;
	});

	function ofColors(ofColors: category[]): ConnectionsCard[] {
		return colors
			?.entries()
			.filter(([_, c]) => ofColors.includes(c))
			.map(([word]) => word)
			.toArray();
	}
	let unfinishedOrUncategorizedCards = $derived(
		ofColors(
			Object.entries(colorCounts)
				.filter(([color, count]) => color === 'white' || count !== 4)
				.map(([color, count]) => color as category)
		)
	);
	let cards = $derived.by(() => {
		let temp = unfinishedOrUncategorizedCards;
		const rowLocations = [
			['purple', 0],
			['blue', 4],
			['green', 8],
			['yellow', 12]
		] as const;
		rowLocations.forEach(([color, index]) => {
			if (colorCounts[color as category] === 4) {
				temp.splice(index, 0, ...ofColors([color as category]));
			}
		});
		return temp;
	});

	$effect(() => {
		colors = new SvelteMap(data.connections.map((word) => [word, 'white']));
	});

	let colorsObj = $derived(
		Object.fromEntries(colors?.entries().map(([card, color]) => [card.value, color]))
	);

	function swapColors(color1: category, color2: category) {
		for (const word of colors.keys()) {
			if (color1 !== 'white' && colors.get(word) === color1) {
				colors.set(word, color2);
			} else if (color2 !== 'white' && colors.get(word) === color2) {
				colors.set(word, color1);
			}
		}
	}

	let opened = $state<string | null>(null);
</script>

<svelte:boundary>
	<div class="flex flex-col items-center gap-4 p-3">
		<h1 class="text-2xl font-bold">NYT Connections</h1>
		<input
			type="date"
			value={data.date}
			onchange={(e) => goto(`?date=${(e?.target as HTMLInputElement)?.value}`)}
			class="rounded border bg-gray-200 p-2 dark:bg-gray-800"
		/>
		<div class="flex gap-5">
			<button
				title="Clear"
				onclick={() => (colors = new SvelteMap(data.connections.map((word) => [word, 'white'])))}
				class="rounded bg-gray-100 bg-gray-200 px-4 py-2 dark:bg-gray-800">Clear</button
			>
			{#each Object.entries(colorCounts).filter(([color, _]) => color !== 'white') as [color, count]}
				<PopoverMenuButton
					bind:opened
					id={color}
					class={[
						'relative aspect-square h-full content-center rounded px-5 font-mono',
						color === 'purple' && 'bg-purple-500',
						color === 'blue' && 'bg-blue-500',
						color === 'green' && 'bg-green-500',
						color === 'yellow' && 'bg-yellow-500'
					] as string[]}
					title={`${count} ${color} connections`}
				>
					{#snippet menu(close)}
						<div class="flex gap-2 rounded bg-gray-300 p-3 shadow-xs/50 dark:bg-gray-700">
							{#each categories.filter((c) => c !== color) as category}
								<button
									onclick={() => {
										swapColors(color as category, category);
										close();
									}}
									title={category === 'white' ? `Clear ${color}` : `Swap ${color} with ${category}`}
									class={[
										'flex aspect-square h-10 place-content-center place-items-center rounded',
										category === 'purple' && 'bg-purple-500',
										category === 'blue' && 'bg-blue-500',
										category === 'green' && 'bg-green-500',
										category === 'yellow' && 'bg-yellow-500',
										category === 'white' && 'bg-transparent outline'
									]}
								>
									<span class={['block font-mono', category === 'white' && 'hidden']}
										>{colorCounts[category]}</span
									>
									<svg
										class={['h-full w-full', category !== 'white' && 'hidden']}
										fill="currentColor"
										viewBox="0 0 256 256"
										id="Flat"
										xmlns="http://www.w3.org/2000/svg"
										><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
											id="SVGRepo_tracerCarrier"
											stroke-linecap="round"
											stroke-linejoin="round"
										></g><g id="SVGRepo_iconCarrier">
											<path
												d="M202.82861,197.17188a3.99991,3.99991,0,1,1-5.65722,5.65624L128,133.65723,58.82861,202.82812a3.99991,3.99991,0,0,1-5.65722-5.65624L122.343,128,53.17139,58.82812a3.99991,3.99991,0,0,1,5.65722-5.65624L128,122.34277l69.17139-69.17089a3.99991,3.99991,0,0,1,5.65722,5.65624L133.657,128Z"
											></path>
										</g></svg
									>
								</button>
							{/each}
						</div>
					{/snippet}

					{count}
				</PopoverMenuButton>
			{/each}
		</div>
		<div class="grid aspect-square w-full max-w-[25rem] grid-cols-4 grid-rows-4 gap-2">
			{#each cards as card (card)}
				<div
					animate:flip={{ duration: 750 }}
					class={[
						'word-square aspect-1 relative rounded border text-center select-none',
						colorsObj?.[card.value] === 'white' && 'bg-white dark:bg-gray-950',
						colorsObj?.[card.value] === 'purple' && 'bg-purple-500',
						colorsObj?.[card.value] === 'blue' && 'bg-blue-500',
						colorsObj?.[card.value] === 'green' && 'bg-green-500',
						colorsObj?.[card.value] === 'yellow' && 'bg-yellow-500'
					]}
				>
					{#each ['purple', 'blue', 'green', 'yellow'] as const as color}
						<button
							onclick={() => colors.set(card, colors.get(card) === color ? 'white' : color)}
							disabled={colorCounts[color] >= 4 && colorsObj?.[card.value] !== color}
							title={`Toggle ${color}`}
							style={`grid-area: ${colorsObj?.[card.value] === color ? 'none' : color}`}
							class={[
								'invisible absolute h-full w-full cursor-pointer',
								colorsObj?.[card.value] === 'white' && 'visible',
								'disabled:cursor-default disabled:opacity-40',
								colorsObj?.[card.value] === color
									? 'grid-area-none visible z-2 col-span-full row-span-full h-full w-full bg-transparent outline-none'
									: (color === 'purple' && 'bg-purple-500') ||
										(color === 'blue' && 'bg-blue-500') ||
										(color === 'green' && 'bg-green-500') ||
										(color === 'yellow' && 'bg-yellow-500')
							]}
						></button>
					{/each}
					{#if card.type === 'word'}
						<div
							class="pointer-events-none z-1 col-span-full row-span-full flex flex-col items-center gap-0.5 place-self-center text-xs"
						>
							{#each card.value.split(' ') as part}
								<span
									class={[
										'block w-min rounded px-0.5',
										colorsObj?.[card.value] === 'white' && 'bg-gray-300 dark:bg-gray-700'
									]}>{part}</span
								>
							{/each}
						</div>
					{:else if card.type === 'image'}
						<div
							class="pointer-events-none z-1 col-span-full row-span-full flex flex-col items-center gap-0.5 place-self-center"
						>
							<img class="w-full" src={card.value} alt="" />
						</div>{/if}
				</div>
			{/each}
		</div>
	</div>
</svelte:boundary>

<style>
	.word-square {
		transition: background-color 0.3s;
		display: grid;
		grid-template:
			'purple blue' 1fr
			'green yellow' 1fr / 1fr 1fr;
		overflow: hidden;
	}

	svg {
		fill: currentColor;
	}
</style>
