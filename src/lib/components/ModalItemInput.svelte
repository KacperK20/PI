<script lang="ts">
    import { sharedData } from "../../sharedData";
    import CodeScanner from "$lib/components/CodeScanner.svelte";
    import ModalItem from "$lib/components/ModalItem.svelte";
	import { onMount } from "svelte";
	import attachOnScan from "$lib/attachOnScan";

export let item : any = null;

let suggestedItem : any = null;
let suggestedItems : any = null;
let scanning = false;

onMount(()=>{
    attachOnScan(div, handleScan)
})

async function handleScan(sCode : string, iQty : number){
    const focusedInput = document.activeElement;
    if(focusedInput?.classList.contains("prodCodeInput")){
            await scanSuccess(null, sCode)
    }
    else {          
        if(focusedInput.tagName == "INPUT"){
            focusedInput.value = focusedInput.value.slice(0,-sCode.length)
        }
        let emptyInput : any = div.querySelector('.prodCodeInput')
        if(emptyInput){
            emptyInput.setAttribute("readonly","true")
            emptyInput.focus()
            await handleScan(sCode, iQty)
        }
    }
}

async function findItemByUUID(uid : string) {
    const response = await fetch(`/api/item?uid=${uid}`);
    const data = await response.json();
    return data;
}

async function findItemByProdCode(prod_code : string) {
    const response = await fetch(`/api/item?prod_code=${prod_code}&wh_id=${$sharedData.sel_wh_id}`);
    const data = await response.json();
    return data;
}

let findItem = async (code : string) => {
    let foundItem = await findItemByUUID(code)

    if(foundItem){
        return foundItem;
    }
    if(!foundItem){
        let foundItems = await findItemByProdCode(code)
        return foundItems;
    }
    
}

export let scanSuccess = async (scanner : any, decodedText : string) => {
    let found = await findItem(decodedText)

    if(!found) console.log("Did not found item")
    else {
        if(Array.isArray(found)){
            item = found[0];
            item.qty = 1;
            item._count = found.length
        }
        else 
            item = found
    }
}

let handleProdCodeInput = async (event : any) =>{
    if(event.target.value){
        let found = await findItem(event.target.value)

        if(!found.length){
            if(Object.keys(found).length){
                item = found;
            }
            if(suggestedItem)suggestedItem = null;
        }
        else {
            
            if(found.length){
                suggestedItem = found[0];
                suggestedItem._count = found.length
                suggestedItem.uid = found.map((item : any) => item.uid)
                
            }
            else 
                suggestedItem = found
        }
    }
}

function handleProdCodeClick(event : any){
    event.target.removeAttribute("readonly")
}

function handlesuggestedItemClick(){
    item = suggestedItem;
    suggestedItem = null;
}
let div;
</script>

<div bind:this={div}>
    {#if Object.keys(item).length > 0}
        <ModalItem {item}/>
    {:else}
    <div class="relative w-full">
        <input type="text" on:input={handleProdCodeInput} on:click={handleProdCodeClick} readonly placeholder="Kod produktu lub przedmiotu" class="input input-bordered w-full m-0 prodCodeInput" />
            <div class="absolute top-[8px] right-[8px]">
                <CodeScanner class="w-8 h-8 p-1" bind:scanning={scanning} scanSuccess={scanSuccess} />
            </div>
        </div>
        {#if suggestedItem}
            <input type="text" placeholder="Nazwa produktu" readonly value={suggestedItem.product.name} on:click={handlesuggestedItemClick} class="input input-bordered input-xs w-full hover:cursor-pointer " />                
        {/if}
    {/if}
</div>

<style>
    input:not(.prodCodeInput):read-only{
        background-color: oklch(var(--b2));
    }
</style>