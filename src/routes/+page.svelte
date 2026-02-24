<script lang="ts">
	import { goto } from '$app/navigation';
	import { flip } from 'svelte/animate';

	let { data } = $props();
	type category = 'yellow' | 'green' | 'blue' | 'purple' | 'white';
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
				<div
					class={[
						'relative flex aspect-square h-full items-center rounded p-5 font-mono',
						color === 'purple' && 'bg-purple-500',
						color === 'blue' && 'bg-blue-500',
						color === 'green' && 'bg-green-500',
						color === 'yellow' && 'bg-yellow-500'
					]}
				>
					{count}
					<button
						onclick={() =>
							ofColors([color as category]).forEach((word) => (colors[word] = 'white'))}
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
				</div>
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
								'invisible absolute h-[22px] w-[22px] cursor-pointer rounded outline',
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
					<span class="col-span-full row-span-full place-self-center p-3 text-xs">{word}</span>
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
			'purple . blue' 22px
			'. . .' 1fr
			'green . yellow' 22px / 22px 1fr 22px;
	}
</style>
