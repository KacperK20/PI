<script lang="ts">
	import GeoButton from "$lib/components/GeoButton.svelte";
	import ImagesBox from "$lib/components/ImagesBox.svelte";
	import type { Company, Item, ItemToTransaction, Product, Transaction } from "@prisma/client";
	import { sharedData } from '../../../sharedData';

    export let transaction : Transaction & {srcComp : Company, dstComp : Company, items : ItemToTransaction};
    export let index : number;
    export let openModal : any = () => {
        
    };

    function formatDate(dateString : string) {
        const date = new Date(dateString);
        const isoString = date.toISOString();
        const formattedString = isoString.replace('T', ' ').substring(0, 19);
        return formattedString;
    }

    function groupItems(arr : any){
        const grouped : any = {};
        
        arr.forEach((itemToTransaction : ItemToTransaction & {item : Item & {product : Product}}) => {
            
            let item = itemToTransaction.item
            if (!grouped[item.product.prod_code]) {
                grouped[item.product.prod_code] = {
                    prod_code: item.product.prod_code,
                    name: item.product.name,
                    items: [item],
                };
            } 
            else {
                grouped[item.product.prod_code].items.push(item);
            }
        });
        return Object.values(grouped);
    }

    function toggleDetailsRow(n : number) {
        let el  = document.getElementById("details_row_"+n)
		el?.classList.toggle("hidden")
        
        active = !active
	}

    let active = false;
</script>

<tr id={"row_"+index} class="cursor-pointer" on:click={() => toggleDetailsRow(index)}>
    <td class="{active ? "activeRow" : ""} w-2 p-0"></td>
    <td>{transaction.id}</td>
    <td>{formatDate(transaction.createdAt)}</td>
    <td>
            <GeoButton xs_btn={true} coords={{latitude : transaction.coordsLatitude, longitude : transaction.coordsLongitude}} />
    </td>
    <td>{transaction.srcComp.name}</td> 
    <td>{transaction.dstComp.name}</td> 
    <td>{transaction.srcPerson}</td> 
    <td>{transaction.dstPerson}</td> 
    <td>{transaction.status}</td> 
    {#if transaction.status=="Przyjęte"}
    <td><a class="underline" target="_blank" href={"/api/transaction/pdf?uid="+transaction.uid}>Plik</a></td>
    {/if}
    {#if transaction.status=="W trakcie" && transaction.dstComp.id == $sharedData.sel_comp_id}
    <td><a href="javascript:void(0)" onclick="takeIn_item_modal.showModal()" on:click={openModal}>Przyjmij</a></td>
    {/if}
</tr>
<tr id={"details_row_"+index} class="detailsRow hidden border border-base-100">
    <td colspan="4">
        <table class="table table-xs my-0 mx-auto w-auto text-start">
            <thead>
                <tr>
                    <th>Kod produktu</th>
                    <th>Nazwa</th>
                    <th></th>
                    <th>Ilość</th>
                </tr>
            </thead>
            <tbody>
            {#each groupItems(transaction.items) as grouped}
            
            <tr>
                <td>{grouped.prod_code}</td> 
                <td>{grouped.name}</td> 
                
                <td>
                    <i>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </i>
                </td>
                <td class="text-end">{grouped.items.length}</td> 
            </tr> 
            {/each}
            </tbody>
        </table>
    </td>
    <td colspan="6">
        <ImagesBox images={transaction.images} />
    </td>
</tr>

<style>
td {
    background-color: oklch(var(--b1));
    height: 2rem;
}


.activeRow {
    background-color: oklch(var(--n))
}

td:first-child {
    border-left: 1px solid oklch(var(--b2) / var(--tw-border-opacity));
}

td:last-child {
    border-right: 1px solid oklch(var(--b2) / var(--tw-border-opacity));
}
</style>
