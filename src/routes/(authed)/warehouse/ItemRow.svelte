<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { sharedData } from '../../../sharedData.js';

	export let item : any;
    export let shownColumns : any;
    export let count_items : any;
    export let checked = false;
    export let handleCheckItem = (state ,item) => {}

    function formatDate(dateString: Date) {
		const date = new Date(dateString);
		const isoString = date.toISOString();
		const formattedString = isoString.replace('T', ' ').substring(0, 19);
		return formattedString;
	}
</script>
<tr
    class="{item.status == 'Wydane' || item.wh.comp.id != $sharedData.sel_comp_id
        ? 'text-base-content/50'
        : ''}"
>
    <td class="flex items-center">
        <input type="checkbox" bind:checked={checked} on:change={() => handleCheckItem(checked, item)} class="checkbox checkbox-xs">
    </td>
    
    <td><a href={`/item/${item.uid}`}>{item.id}</a></td>

    {#if shownColumns.product_name}
        <td>{item.product.name}</td>
    {/if}

    {#if shownColumns.category_name}
        <td>{item.product.category ? item.product.category.name : ''}</td>
    {/if}

    {#if shownColumns.product_code}
        <td>{item.product.prod_code}</td>
    {/if}

    {#if shownColumns.warehouse_name}
        <td>
            <a
                href="/warehouse?id={item.wh.id}&comp_id={item.wh.comp.id}"
                on:click={() => {
                    $sharedData.sel_comp_id = item.wh.comp.id;
                    $sharedData.sel_wh_id = item.wh.id;
                }}
            >
                {#if item.wh.comp.id == $sharedData.sel_comp_id}
                    {item.wh.name}
                {:else}
                    <span class="text-primary">{item.wh.comp.name}</span>
                {/if}
            </a>
            /
            <a
                href="/warehouse?id={item.ownerWh.id}&comp_id={item.ownerWh.comp.id}"
                on:click={() => {
                    $sharedData.sel_comp_id = item.ownerWh.comp.id;
                    $sharedData.sel_wh_id = item.ownerWh.id;
                }}
            >
                {#if item.ownerWh.comp.id == $sharedData.sel_comp_id}
                    {item.ownerWh.name}
                {:else}
                    <span class="text-primary">{item.ownerWh.comp.name}</span>
                {/if}
            </a>
        </td>
    {/if}

    {#if shownColumns.condition}
        <td>{item.condition ?? ''}</td>
    {/if}

    {#if shownColumns.status}
        <td>
            {#if item.wh.comp.id != $sharedData.sel_comp_id}
                W innej firmie
            {:else}
                {item.status}
            {/if}
        </td>
    {/if}

    {#if shownColumns.responsiblePerson && !count_items}
        <td>
            {#if item.ResponsiblePerson.length}
                <div title={item.ResponsiblePerson.map((r) => r.person.name).join(', ')}>
                    {item.ResponsiblePerson[0].person.name}
                    {#if item.ResponsiblePerson.length > 1}
                        , ...
                    {/if}
                </div>
            {/if}
        </td>
    {/if}

    {#if shownColumns.type && !count_items}
        <td>{item.type ?? ''}</td>
    {/if}

    {#if shownColumns.createdAt && !count_items}
        <td>{formatDate(item.createdAt) ?? ''}</td>
    {/if}

    {#if shownColumns.updatedAt && !count_items}
        <td>{formatDate(item.updatedAt) ?? ''}</td>
    {/if}

    {#if shownColumns.amount}
        <td>{item.amount}</td>
    {/if}

    {#if shownColumns.unit}
        <td>{item.product.unit}</td>
    {/if}
</tr>

<style>
	td a:hover {
		text-decoration: underline;
	}
    td {
        background-color: var(--bg-color);
    }
	tr {
		text-wrap: nowrap;
	}
</style>

