<script lang="ts">
	import { sharedData } from "../../sharedData";

    export let comp_id : number;
    export let sel_wh_id : number | "";
    export let label : string = "Magazyn";


    async function getWarehouses(comp_id: number) {
		const response = await fetch(`/api/warehouse?comp_id=${comp_id}`);
		const data = await response.json();
		return data;
	}


    if (sel_wh_id == $sharedData.sel_wh_id)sel_wh_id=0
</script>

{#await getWarehouses(comp_id) then warehouses}
    <div class="form-control w-full m-0">
        <label class="label">
            <span class="label-text">{label}</span>
        </label>
        <select
            required
            name="company"
            bind:value={sel_wh_id}
            class="select select-bordered"
        >
            <option class="px-2 py-1 cursor-pointer hover:bg-gray-100" value="" selected disabled
                >Wybierz</option
            >
            {#each warehouses as wh}
                {#if wh.id != $sharedData.sel_wh_id}
                    <option class="px-2 py-1 cursor-pointer hover:bg-gray-100" value={wh.id}
                        >{wh.name}</option
                    >
                {/if}
            {/each}
        </select>
    </div>
{/await}