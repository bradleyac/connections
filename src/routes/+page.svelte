<script lang="ts">
	import { goto } from '$app/navigation';
	import PopoverMenuButton from '$lib/components/PopoverMenuButton.svelte';
	import { flip } from 'svelte/animate';

	let { data } = $props();
	type category = 'yellow' | 'green' | 'blue' | 'purple' | 'white';
	const categories = ['purple', 'blue', 'green', 'yellow', 'white'] as category[];
	let colors = $state({} as Record<string, category>);
	let colorCounts = $derived.by(() => {
		const counts: Record<category, number> = {
			purple: 0,
			blue: 0,
			green: 0,
			yellow: 0,
			white: 0
		};
		for (const color of Object.values(colors)) {
			counts[color] = (counts[color] || 0) + 1;
		}
		return counts;
	});

	function ofColors(ofColors: category[]) {
		return Object.entries(colors)
			.filter(([_, c]) => ofColors.includes(c))
			.map(([word]) => word);
	}
	let words = $derived([
		...Object.entries(colorCounts)
			.filter(([color, count]) => color !== 'white' && count === 4)
			.flatMap(([color, count]) => ofColors([color as category])),
		...ofColors([
			...Object.entries(colorCounts)
				.filter(([color, count]) => color === 'white' || count !== 4)
				.map(([color, count]) => color as category)
		])
	]);

	$effect(() => {
		colors = Object.fromEntries(data.connections.map((word) => [word, 'white'])) as Record<
			string,
			category
		>;
	});

	function swapColors(color1: category, color2: category) {
		for (const word of Object.keys(colors)) {
			if (color1 !== 'white' && colors[word] === color1) {
				colors[word] = color2;
			} else if (color2 !== 'white' && colors[word] === color2) {
				colors[word] = color1;
			}
		}
	}

	let opened = $state<string | null>(null);
</script>

<svelte:boundary>
	{#snippet pending()}
		Loading...
	{/snippet}
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
				onclick={() =>
					(colors = Object.fromEntries(data.connections.map((word) => [word, 'white'])) as Record<
						string,
						category
					>)}
				class="rounded bg-gray-100 bg-gray-200 px-4 py-2 dark:bg-gray-800">Clear</button
			>
			{#each Object.entries(colorCounts).filter(([color, count]) => color !== 'white') as [color, count]}
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
					<button
						onclick={(e) => {
							e.stopPropagation();
							ofColors([color as category]).forEach((word) => (colors[word] = 'white'));
						}}
						title={`Clear ${color}`}
						class={[
							'text-mono invisible absolute -top-1 -right-1 z-1 h-[22px] w-[22px] rounded rounded-full bg-gray-200 p-1 text-xs outline dark:bg-gray-800',
							count > 0 && 'visible'
						]}
						><svg
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
						></button
					>
				</PopoverMenuButton>
			{/each}
		</div>
		<div class="grid aspect-square w-full max-w-[25rem] grid-cols-4 grid-rows-4 gap-2">
			{#each words as word (word)}
				<div
					animate:flip={{ duration: 750 }}
					class={[
						'word-square aspect-1 relative rounded border text-center select-none',
						colors[word] === 'white' && 'bg-white dark:bg-gray-950',
						colors[word] === 'purple' && 'bg-purple-500',
						colors[word] === 'blue' && 'bg-blue-500',
						colors[word] === 'green' && 'bg-green-500',
						colors[word] === 'yellow' && 'bg-yellow-500'
					]}
				>
					{#each ['purple', 'blue', 'green', 'yellow'] as const as color}
						<button
							onclick={() => (colors[word] = colors[word] === color ? 'white' : color)}
							disabled={colorCounts[color] >= 4 && colors[word] !== color}
							title={`Toggle ${color}`}
							style={`grid-area: ${colors[word] === color ? 'none' : color}`}
							class={[
								'invisible absolute h-full w-full cursor-pointer',
								colors[word] === 'white' && 'visible',
								'disabled:invisible',
								colors[word] === color
									? 'grid-area-none visible z-2 col-span-full row-span-full h-full w-full bg-transparent outline-none'
									: (color === 'purple' && 'bg-purple-500') ||
										(color === 'blue' && 'bg-blue-500') ||
										(color === 'green' && 'bg-green-500') ||
										(color === 'yellow' && 'bg-yellow-500')
							]}
						></button>
					{/each}
					<div
						class="inert z-1 col-span-full row-span-full flex flex-col gap-0.5 place-self-center rounded text-xs"
					>
						{#each word.split(' ') as part}
							<span
								class={[
									'z-1 col-span-full row-span-full place-self-center rounded px-0.5 text-xs',
									colors[word] === 'white' && 'bg-gray-300 dark:bg-gray-700'
								]}>{part}</span
							>
						{/each}
					</div>
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
</style>
