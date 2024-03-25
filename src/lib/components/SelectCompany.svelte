<script lang="ts">
	import type { Company } from "@prisma/client";
    export let sel_comp_id : string = "";

    async function getCompanies() {
        const response = await fetch('/api/company');
        const results: Company[] = await response.json();
        return results;
    }
</script>

<select class="select select-bordered w-full " bind:value={sel_comp_id}>
    <option value="" disabled>- Wybierz -</option>
    {#await getCompanies() then companies}
        {#each companies as company}
            <option value={company.id} selected={sel_comp_id == `${company.id}`}>{company.name}</option>
        {/each}    
    {/await}
</select>
