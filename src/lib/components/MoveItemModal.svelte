<script lang="ts">
	import ModalItemInput from '$lib/components/ModalItemInput.svelte';
	import { sharedData } from '../../sharedData';
	import { page } from '$app/stores';
	import {action_type} from '$lib/action_type';
	import { onMount } from 'svelte';
	import AlertBox from '$lib/components/AlertBox.svelte';
	import WHTreeMenu from '$lib/components/WHTreeMenu.svelte'
	import SelectCompany from '$lib/components/SelectCompany.svelte';
	import { fade, slide } from 'svelte/transition';
	import { backInOut, backOut, quintInOut, quintOut } from 'svelte/easing';
	
	export let checkedItems: any = [];
	export let closeModal: any;
	export let resetCheckedItems: any;

	let data = {
		items: checkedItems.length ? checkedItems : [{}],
		dst_wh_id: 0,
		change_owner: $page.data.app_settings.defaults.giveout_item_change_owner
	};

    async function submit() {
		const notEmptyItems = data.items.filter((item: any) => Object.keys(item).length > 0)

		if (notEmptyItems.length && data.dst_wh_id) {
			try {
				await fetch(`/api/item/action`, {
					method: 'POST',
					body: JSON.stringify({
						action_type: action_type.MOVE,
						items: notEmptyItems
							.map((item: any) =>
								{return {
									...(item.uid ? {uid : item.uid} : {uids : item.uids}), 
									amount : item.amount
								}}
							)
							.flat(),
						dst_wh_id: data.dst_wh_id,
						user_uid: $page.data.user.uid,
						change_owner: data.change_owner
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});
			} catch (err) {
				showAlert = {
					type : "error",
					message : err
				}
			} finally {
				resetCheckedItems();
				closeModal();
				refreshTables();
			}
		} else {
			showAlert = {
                type : "error",
                message : "Brakujące lub nieprawidłowe dane"
            }
		}
	}

	function refreshTables() {
		$sharedData.sel_wh_id = $sharedData.sel_wh_id;
	}

	function moreItemInput() {
		data.items = data.items.concat({});
		setTimeout(() => focusInput(),10)
	}

	async function getCompanies() {
		const response = await fetch('/api/company');
		const data = await response.json();
		return data;
	}

	async function getWarehouse(wh_id: number) {
		const response = await fetch(`/api/warehouse?wh_id=${wh_id}`);
		const data = await response.json();
		return data;
	}

	function focusInput(){
        let inputs : any = document.querySelectorAll(".prodCodeInput")
		inputs[inputs.length-1]?.focus();
    }

    onMount(focusInput)

	async function handleSelWh(sel_wh_id : number){
		data.dst_wh_id = sel_wh_id;
		showWhMenu = false;
		wh_name = (await getWarehouse(sel_wh_id)).name
		
	}

	let showAlert : any = null;

	let wh_icon = `
	<i>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
		</svg>
	</i>`;

	let wh_name = "- Wybierz -";
	let showWhMenu = false;
	let sel_comp_id = "";
</script>

<div>
	<h3 class="font-bold text-lg">Przenieś przedmioty na magazyn</h3>
	<div class="form-control w-full m-0">
		<label class="label">
			<span class="label-text">Przedmioty*</span>
		</label>
			{#each data.items as item}
				<div class="mb-1">
					<ModalItemInput bind:item />
				</div>
			{/each}
		<div class={'form-control w-full m-0'}>
			<button type="button" on:click={moreItemInput} class="btn mt-1 min-h-0 h-5">+</button>
		</div>

		
		<div class="form-control w-full m-0">
			<label class="label">
				<span class="label-text">Firma*</span>
			</label>
			<SelectCompany bind:sel_comp_id={sel_comp_id}></SelectCompany>
		</div>
		
		{#if sel_comp_id}

			<label class="label">
				<span class="label-text">Magazyn*</span>
			</label>
			<button type="button" class = "border border-base-content/20 rounded-lg text-start px-4 text-sm h-12" 
			on:click={() => {showWhMenu = !showWhMenu; data.dst_wh_id=0}}>				
				{wh_name}
			</button>

			{#if showWhMenu}
			<div class="border border-base-content/20 rounded-lg mt-1" transition:slide={{ delay: 0, duration: 100, easing: quintInOut, axis: 'y' }}>
				<WHTreeMenu class="menu-xs" allBtn={false} editable={false} comp_id={Number(sel_comp_id)} extSelWh={handleSelWh}></WHTreeMenu>
			</div>
			{/if}
			
		{/if}

		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Zmień właściciela</span>
				<input type="checkbox" bind:checked={data.change_owner} class="checkbox" />
			</label>
		</div>

		<button type="button" on:click={submit} class="btn shadow mt-2 w-full">Przenieś</button>
		{#if showAlert}
            {#key showAlert}
                <div class="w-full pt-4">
                    <AlertBox type={showAlert.type} message={showAlert.message}></AlertBox>
                </div>
            {/key}
        {/if}
	</div>
</div>
