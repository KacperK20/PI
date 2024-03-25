<script lang="ts">
	import WHTree from '$lib/components/WHTree.svelte';
	import { sharedData } from '../../sharedData.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import WHEditDelet from '$lib/components/WHEditDelet.svelte';
	import { onMount } from 'svelte';
	import { polyfill } from 'mobile-drag-drop';
	import { slide } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';

	onMount(() => {
		polyfill({
			defaultActionOverride: (event: TouchEvent) => {
				event.preventDefault();
			},
			dragImageCenterOnTouch: true
		});
	});

	export let editable: boolean;
	export let showAlert = {
		type: "",
		message: ""
	};
	export let sel_wh_id: number = 0;
	export let comp_id: number;
	export let allBtn : boolean = true;

	let createWarehouseModal = {
		data: {
			name: '',
			parent_wh_id: null
		},
		close: () => {
			document.querySelector('#add_wh_modal')?.close();
			createWarehouseModal.data = {
				name: '',
				parent_wh_id: null
			};
		},
		open: () => {
			document.querySelector('#add_wh_modal').open = true;
			document.querySelector('#add_wh_modal input').focus();
		},
		submit: () => {
			fetch(`/api/warehouse`, {
				method: 'PUT',
				body: JSON.stringify({
					name: createWarehouseModal.data.name,
					comp_id: comp_id,
					...(createWarehouseModal.data.parent_wh_id
						? { parent_wh_id: createWarehouseModal.data.parent_wh_id }
						: {})
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(async (r) => {
					if (r.ok) {
						createWarehouseModal.close();
						warehouseList = getWarehouseTree(comp_id);
						showAlert = {
							type: 'success',
							message: 'Pomyślnie stworzono magazyn'
						};
					} else {
						showAlert = {
							type: 'error',
							message: 'Niepowodzenie tworzenia magazynu'
						};
					}
				})
				.catch(
					(err) =>
						(showAlert = {
							type: 'error',
							message: 'Bład tworzenia magazynu'
						})
				);
		}
	};
	let createPersonModal = {
		data: {
			name: ''
		},
		close: () => {
			document.querySelector('#createPersonModal')?.close();
			document.querySelector('#createPersonModal form')?.reset();
		},
		open: () => {
			document.querySelector('#createPersonModal').open = true;
			document.querySelector('#createPersonModal input').focus();
		},
		submit: () => {
			fetch(`/api/person`, {
				method: 'PUT',
				body: JSON.stringify({
					name: createPersonModal.data.name,
					comp_id: comp_id
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(async (r) => {
					if (r.ok) {
						createPersonModal.close();
						warehouseList = getWarehouseTree(comp_id);
						showAlert = {
							type: 'success',
							message: 'Pomyślnie stworzono magazyn'
						};
					} else {
						showAlert = {
							type: 'error',
							message: 'Niepowodzenie tworzenia magazynu'
						};
					}
				})
				.catch(
					(err) =>
						(showAlert = {
							type: 'error',
							message: 'Bład tworzenia magazynu'
						})
				);
		}
	};

	function handleOpenCreateWarehouseModal() {
		createWarehouseModal.data.parent_wh_id = null;
		createWarehouseModal.open();
	}

	async function getWarehouses(id: number) {
		const response = await fetch(`/api/warehouse?comp_id=${id}`);
		const results: any = await response.json();
		return results;
	}
	async function getWarehouseTree(comp_id: number) {
		const warehouses = await getWarehouses(comp_id);

		const getSubWarehouses: any = (parent_wh_id: number) => {
			const subWarehouses = warehouses
				.filter((wh) => wh.parentWh?.id === parent_wh_id)
				.map((wh) => ({
					name: wh.name,
					id: wh.id,
					whs: getSubWarehouses(wh.id)
				}));
			return subWarehouses;
		};
		const tree: any = warehouses
			.filter((wh: any) => !wh.parentWh?.id && !wh.person)
			.map((wh) => ({
				name: wh.name,
				id: wh.id,
				whs: getSubWarehouses(wh.id)
			}));
		tree.people = warehouses.filter((wh: any) => wh.person);
		return tree;
	}
	let warehouseList = getWarehouseTree(comp_id);
	let draggedElement: any;
	let parent: any;
	function handleDragStart(event: any, id) {
		draggedElement = id;
	}
	function handleDrop(event, id) {
		event.preventDefault();
		parent = id;
		if (!parent) parent = 0;
		if (parent == 0 || draggedElement != parent) {
			editWarehouseParent(draggedElement, parent);
		}
	}
	function handleDropMobile(event, id) {
		const touch = event.changedTouches[0];
		const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
		const droppedOnId = targetElement.id;
		parent = parseInt(droppedOnId);
		if ((parent || parent == 0) && draggedElement != parent) {
			editWarehouseParent(draggedElement, parent);
		}
	}
	function handleDragOver(event) {
		event.preventDefault();
	}
	async function editWarehouseParent(id, pid) {
		let warehouse = await getWarehouses(comp_id); // do poprawy api z filtrowaniem po stronie serwera
		let selectedWarehouse = await warehouse.find((warehouse) => warehouse.id == id)?.id;
		let selectedparent = await warehouse.find((warehouse) => warehouse.id == pid)?.parent_wh_id;

		if (pid == 0 || selectedparent != selectedWarehouse) {
			fetch(`/api/warehouse`, {
				method: 'PATCH',
				body: JSON.stringify({
					parent_wh_id: pid,
					wh_id: id
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(async (r) => {
					if (r.ok) {
						warehouseList = getWarehouseTree(comp_id);
						showAlert = {
							type: 'success',
							message: 'Pomyślnie zmodyfikowano magazyn'
						};
					} else {
						showAlert = {
							type: 'error',
							message: 'Niepowodzenie modyfikacji magazynu'
						};
					}
				})
				.catch(
					(err) =>
						(showAlert = {
							type: 'error',
							message: 'Bład modyfikacji magazynu'
						})
				);
		}
	}

	export let extSelWh = (wh_id: number) => {};

	function selWH(wh_id: number) {
		sel_wh_id = wh_id;
		extSelWh(sel_wh_id);
	}
</script>

<div class="w-full flex flex-col items-center">
	<div class="w-full">
		<ul class="menu {$$props.class} flex rounded-box m-0">
			{#if allBtn}
				<li
					on:dragstart={(event) => handleDragStart(event, null)}
					on:drop={(event) => handleDrop(event, null)}
					on:dragover={handleDragOver}
					on:dragenter={(event) => {
						event.preventDefault();
					}}
				>
					<div
						id={'0'}
						class="w-full flex flex-row items-center justify-between {!sel_wh_id && !editable
							? 'active'
							: ''}"
						on:click={() => selWH(0)}
					>
						Wszystkie
						{#if editable}
							<button class="w-8 btn btn-sm p-0" on:click={handleOpenCreateWarehouseModal}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-4 h-4"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
								</svg>
							</button>
						{/if}
					</div>
				</li>
				<div class="divider m-0" id="magazyn" />
			{/if}

			{#await warehouseList then warehouses}
				<WHTree
					{editable}
					data={{ warehouses: warehouses }}
					{handleDrop}
					{handleDragStart}
					{handleDropMobile}
					{handleDragOver}
					{editWarehouseParent}
					{getWarehouseTree}
					{selWH}
					{sel_wh_id}
					bind:createWarehouseModal
					bind:warehouseList
					bind:parent
					bind:draggedElement
					bind:showAlert={showAlert}
				/>
				<div class="divider m-0" id="people" />
				<li>
					{#if !editable}
						<details>
							<summary>Osoby</summary>
							<ul>
								{#each warehouses.people as wh}
									<li  transition:slide={{ delay: 0, duration: 100, easing: quintInOut, axis: 'y' }}>
										<div
											on:click={() => selWH(wh.id)}
											class="m-1 h-fit flex-row {sel_wh_id == wh.id && !editable ? 'active' : ''}"
										>
											{wh.name}
										</div>
									</li>
								{/each}
							</ul>
						</details>
					{:else}
						<div class="w-full flex flex-row items-center justify-between">
							Osoby
							{#if editable}
								<button class="w-8 btn btn-sm p-0" on:click={createPersonModal.open}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-4 h-4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 4.5v15m7.5-7.5h-15"
										/>
									</svg>
								</button>
							{/if}
						</div>

						<ul>
							{#each warehouses.people as wh}
								<li>
									<div class="m-1 h-fit flex-row">
										{#if !editable}<input
												id="{wh.id}-input"
												type="text"
												class=" input input-xs input-ghost"
												value={wh.name}
											/>
											<WHEditDelet id={wh.id} bind:warehouseList {getWarehouseTree} />
										{:else}
											{wh.name}
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/await}
		</ul>
	</div>
</div>
<dialog id="add_wh_modal" class="modal">
	<form method="dialog" class="modal-box max-w-sm">
		<button
			type="button"
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			on:click={createWarehouseModal.close}>✕</button
		>
		<h3 class="font-bold text-lg">Utwórz magazyn</h3>
		<div class="form-control w-full m-0">
			<label class="label">
				<span class="label-text">Nazwa magazynu</span>
			</label>
			<input
				bind:value={createWarehouseModal.data.name}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
				on:keydown={(event) => { if (event.key === 'Enter') createWarehouseModal.submit(); }}
				
			/>
		</div>
		<button type="button" on:click={createWarehouseModal.submit} class="btn btn-wide mt-5 w-full"
			>Utwórz</button
		>
	</form>
</dialog>

<dialog id="createPersonModal" class="modal">
	<form method="dialog" class="modal-box max-w-sm">
		<button
			type="button"
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			on:click={createPersonModal.close}
		>
			✕
		</button>
		<h3 class="font-bold text-lg">Dodaj osobę</h3>
		<div class="form-control w-full m-0">
			<label class="label">
				<span class="label-text">Nazwa osoby</span>
			</label>
			<input
				bind:value={createPersonModal.data.name}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
		</div>
		<button type="button" on:click={createPersonModal.submit} class="btn btn-wide mt-5 w-full">
			Utwórz
		</button>
	</form>
</dialog>