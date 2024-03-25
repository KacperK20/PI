<script lang="ts">
	import type { PageData } from '../$types';
	import BackButton from '$lib/components/BackButton.svelte';
	import WhTreeMenu from '$lib/components/WHTreeMenu.svelte';
	import SelectCompany from '$lib/components/SelectCompany.svelte';
	import { onMount } from 'svelte';
	import AlertBox from '$lib/components/AlertBox.svelte';

	export let data: PageData;

	let sel_comp_id : string = "";
	let mounted = false;

	onMount(()=>{
		const cookieValue = sessionStorage.getItem("/admin/warehouses - sel_comp_id")

		sel_comp_id = cookieValue ?? "";
		mounted = true;
	})

	$ : if(mounted && document && sel_comp_id){
		 //document.cookie = "/admin/warehouses/sel_comp_id=" + sel_comp_id;
		 sessionStorage.setItem("/admin/warehouses - sel_comp_id",sel_comp_id)
	}

	let showAlert : any = null;



</script>

<BackButton />

<div class="mx-auto mt-0 mb-5 w-80">
	<label class="label">
		<span class="label-text">Firma</span>
	</label>
	<SelectCompany bind:sel_comp_id />
</div>

{#if sel_comp_id}
<div class="lg:w-1/2 my-0 mx-auto">
	{#key sel_comp_id}
		<WhTreeMenu editable={true} bind:showAlert={showAlert} comp_id={Number(sel_comp_id)}/>
	{/key}
</div>
{/if}

{#if showAlert}
	{#key showAlert}
		<div class="absolute bottom-0 left-0 mx-auto w-full p-2">
			<AlertBox type={showAlert.type} message={showAlert.message}></AlertBox>
		</div>
	{/key}
{/if}
