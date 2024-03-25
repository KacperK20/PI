<script lang="ts">
	import type { Warehouse } from "@prisma/client";

    export let wh : Warehouse

    async function getWarehouse(id : number) {
        const response = await fetch(`/api/warehouse?wh_id=${id}`)
        const results = await response.json()
        return results
    }

</script>


{#if wh}
    {#await getWarehouse(wh.id) then wh}
        {#if wh.parentWh}
            <svelte:self wh={wh.parentWh}/>
        {/if}
        <li>
            <a href="/warehouse?id={wh.id}&comp_id={wh.comp.id}">
                <i class="mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"></path>
                    </svg>
                </i>
                {wh.name}
            </a>
        </li>
    {/await}
{/if}
