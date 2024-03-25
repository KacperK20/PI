<script lang="ts">
	import { sharedData } from '../../sharedData';
	import WHEditDelet from '$lib/components/WHEditDelet.svelte';
	import mobileDragDrop from 'mobile-drag-drop';
	import { onMount } from 'svelte';

	export let data : any;
	export let editable: boolean;
	export let selWH : (wh_id : number) => void;
	export let sel_wh_id : number;
	export let createWarehouseModal : any;
	export let handleDragStart: (event: any, id: any) => void;
	export let handleDrop: (event: any, id: any) => void;
	export let handleDropMobile: (event: any, id: any) => void;
	export let handleDragOver: (event: any) => void;
	export let editWarehouseParent: (id: any, pid: any) => void;
	export let getWarehouseTree: (comp_id: any) => void;

	onMount(() => {
		mobileDragDrop;
	});

	export let draggedElement : any;
	export let parent : any;
	export let warehouseList : any;
	export let showAlert: {
		type: string;
		message: string;
	};


	function handleSubmenu(event : any){
		if(event.target?.tagName == "SPAN"){
			event.target.classList.toggle("menu-dropdown-show")
			event.target.parentElement.querySelector("ul").classList.toggle("menu-dropdown-show")
		}
	}

</script>

{#each data.warehouses as wh}
	<li>
		{#if !wh.whs.length}
		<div
			draggable={editable ? true : false}
			id={wh.id}
			on:click={() => selWH(wh.id)}
			on:dragstart={(event) => handleDragStart(event, wh.id)}
			on:drop={(event) => handleDrop(event, wh.id)}
			on:dragover={handleDragOver}
			on:touchstart={(event) => handleDragStart(event, wh.id)}
			on:touchend={(event) => handleDropMobile(event, wh.id)}
			on:dragenter={(event)=> {
				event.preventDefault();
			}}
					class="h-fit flex-row w-full flex flex-row items-center justify-between {sel_wh_id == wh.id && !editable ? "active" : ""}"
		>
		
			{#if editable}
			<input
				id="{wh.id}-input"
				type="text"
				readonly
				class=" input input-xs text-sm input-ghost pointer-events-none"
				value={wh.name}
			/>
			<WHEditDelet bind:showAlert={showAlert} id={wh.id} bind:warehouseList={warehouseList} {getWarehouseTree} bind:createWarehouseModal />
			{:else}
				{wh.name}
			{/if}
		</div>
		{:else}

		<span class="menu-dropdown-toggle menu-dropdown-show flex" on:click={handleSubmenu}>
			<div
			draggable={editable ? true : false}
			id={wh.id}
			on:click={() => selWH(wh.id)}
			on:dragstart={(event) => handleDragStart(event, wh.id)}
			on:drop={(event) => handleDrop(event, wh.id)}
			on:dragover={handleDragOver}
			on:touchstart={(event) => handleDragStart(event, wh.id)}
			on:touchend={(event) => handleDropMobile(event, wh.id)}
			on:dragenter={(event)=> {
				event.preventDefault();
			}}
					class="h-fit flex-row w-full flex flex-row items-center justify-between"
		>
			{#if editable}
			<input
				id="{wh.id}-input"
				type="text"
				readonly
				class=" input text-sm input-xs input-ghost pointer-events-none"
				value={wh.name}
			/>
			<WHEditDelet  id={wh.id} bind:warehouseList={warehouseList} bind:showAlert={showAlert} {getWarehouseTree} bind:createWarehouseModal />
			
			{:else}
				{wh.name}
			{/if}
		</div>

		</span>
			<ul class="menu-dropdown menu-dropdown-show">
				<svelte:self
					data={{ warehouses: wh.whs, close: data.close }}
					{editable}
					{selWH}
					{sel_wh_id}
					bind:parent
					bind:draggedElement
					bind:createWarehouseModal
					{handleDrop}
					{handleDragStart}
					{handleDropMobile}
					{handleDragOver}
					{editWarehouseParent}
					{getWarehouseTree}
					bind:warehouseList={warehouseList}
					bind:showAlert={showAlert}
				/>
			</ul>
		{/if}

	</li>
{/each}

<style>
	summary.active {
		background-color: oklch(var(--n));
		color : oklch(var(--nc))
	}
</style>