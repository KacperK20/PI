<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside';
	import { onMount } from 'svelte';

	export let headers: any;
	export let setSort: (header: any, sort_dir: sortType) => Promise<void>;
	export let setFilter: any;
	export let setSearch: any;
	export let onCaseInsensitive: any;
	export let active_filters: any = [];
	let value: any;

	enum sortType {
		ASC,
		DESC
	}

	export let handleCheckboxButton = (event: any) => {};

	function onFilterInput(event: any) {
		setFilter(event.target.name, event.target.value);

		let filterIcons = event.target.parentElement.querySelectorAll('.filterIcon');
		if (event.target.value) {
			filterIcons[0].classList.add('hidden');
			filterIcons[1].classList.remove('hidden');
		} else {
			filterIcons[1].classList.add('hidden');
			filterIcons[0].classList.remove('hidden');
		}
	}

	function onSearchInput() {
		setSearch(value);
	}

	let sort_header: string = '';
	let sort_dir: sortType = sortType.ASC;

	function toggleSort(event: any, header: any) {
		if (header.sortable) {
			let sortIcons = event.target.querySelectorAll('.sortIcon');
			for (let icon of sortIcons) {
				icon.classList.toggle('hidden');
			}

			if (sort_header != header.name) sort_dir = sortType.DESC;
			else {
				if (sort_dir == sortType.ASC) sort_dir = sortType.DESC;
				else sort_dir = sortType.ASC;
			}
			sort_header = header.name;

			setSort(sort_header, sort_dir);
		}
	}

	function handleMouseEnter(event) {
		let activeInputs = event.target.parentElement.querySelectorAll(
			"input:not([type='checkbox']):not(.hidden)"
		);
		if (activeInputs) activeInputs.forEach((input) => input.classList.add('hidden'));
		let input = event.target.querySelector("input:not([type='checkbox'])");
		if (input) input.classList.remove('hidden');
	}

	function handleClickOutside(event) {
		let input = event.target.querySelector("input:not([type='checkbox'])");
		if (input) input.classList.add('hidden');
	}

	function handlemouseLeave(event) {
		let input = event.target.querySelector("input:not([type='checkbox'])");

		if (input) {
			if (!input.value) {
				input.classList.add('hidden');
			}
		}
	}

	let isClicked = false;

	function changeIcon() {
		isClicked = !isClicked;
	}
</script>

<div class="h-full">
	<div class="flex w-full">
		<button
			type="button"
			class="btn btn-xs w-6 border-base-300"
			on:click={() => {
				onSearchInput();
			}}
		>
			<i>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-4 h-4"
				>
					<path
						fill-rule="evenodd"
						d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
						clip-rule="evenodd"
					/>
				</svg>
			</i>
		</button>
		<button
			type="button"
			class="btn btn-xs w-6 border-base-300"
			on:click={() => {
				onCaseInsensitive();
				changeIcon();
				onSearchInput();
			}}
		>
			{#if !isClicked}
				<i>
					<svg
						class="w-4 h-4 text-gray-800 dark:text-white"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3"
						/>
					</svg>
				</i>
			{:else}
				<i><svg
					class="w-4 h-4 text-gray-800 dark:text-white"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3"
					/>
				</svg>
				</i>
			{/if}
		</button>
		<input
			type="text"
			name="search"
			bind:value
			placeholder="Wyszukaj"
			class="input w-full input-xs input-bordered"
			on:keydown={(event) => {
				event.key === 'Enter' && onSearchInput();
			}}
		/>
	</div>

	<div class=" overflow-x-auto h-full">
		<table class="table w-full table-xs">
			<thead>
				{#each headers as header, n}
					{#if header.name && header.name != 'selectButton' && header.name != 'buttonCol'}
						<th
							class="relative text-left"
							on:mouseenter={handleMouseEnter}
							on:mouseleave={handlemouseLeave}
							use:clickoutside
							on:clickoutside={handleClickOutside}
						>
							<div class="flex" on:click={(event) => toggleSort(event, header)}>
								{header.disp_name}
								{#if header.sortable}
									<i class="align-middle flex hidden sortIcon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											class="w-4 h-4 my-auto"
										>
											<path
												fill-rule="evenodd"
												d="M12 2.25a.75.75 0 01.75.75v16.19l2.47-2.47a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 111.06-1.06l2.47 2.47V3a.75.75 0 01.75-.75z"
												clip-rule="evenodd"
											/>
										</svg>
									</i>
									<i class="align-middle flex sortIcon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											class="w-4 h-4 my-auto"
										>
											<path
												fill-rule="evenodd"
												d="M11.47 2.47a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06l-2.47-2.47V21a.75.75 0 01-1.5 0V4.81L8.78 7.28a.75.75 0 01-1.06-1.06l3.75-3.75z"
												clip-rule="evenodd"
											/>
										</svg>
									</i>
								{/if}

								{#if header.filterable}
									<i>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="filterIcon w-3 h-3 iconOutline {active_filters.find(
												(k) => k.name == header.name
											)
												? 'hidden'
												: ''}"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
											/>
										</svg>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											class="filterIcon w-3 h-3 iconSolid {active_filters.find(
												(k) => k.name == header.name
											)
												? ''
												: 'hidden'}"
										>
											<path
												fill-rule="evenodd"
												d="M3.792 2.938A49.069 49.069 0 0112 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 011.541 1.836v1.044a3 3 0 01-.879 2.121l-6.182 6.182a1.5 1.5 0 00-.439 1.061v2.927a3 3 0 01-1.658 2.684l-1.757.878A.75.75 0 019.75 21v-5.818a1.5 1.5 0 00-.44-1.06L3.13 7.938a3 3 0 01-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836z"
												clip-rule="evenodd"
											/>
										</svg>
									</i>
								{/if}
							</div>
							{#if header.filterable}
								<input
									type="text"
									name={header.name}
									placeholder="Filtruj"
									value={active_filters.find((k) => k.name == header.name)?.value ?? ''}
									class="input input-xs input-bordered absolute -bottom-6 left-0 w-20 hidden"
									on:change={onFilterInput}
								/>
							{/if}
						</th>
					{:else if header.name == 'selectButton'}
						<th class="flex">
							<input type="checkbox" class="checkbox checkbox-xs" on:click={handleCheckboxButton} />
						</th>
						{:else if header.name == 'buttonCol'}
						<th class=" w-2 " />
					{:else}
						<th />
					{/if}
				{/each}
			</thead>
			<slot />
		</table>
	</div>
</div>

<style>
	.activeInput {
		display: block;
	}
</style>
