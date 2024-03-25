<script lang="ts">
    import { sharedData } from "../../sharedData";
	import MoveItemModal from "$lib/components/MoveItemModal.svelte";
    import GiveItemModal from "$lib/components/GiveItemModal.svelte";
    import AddItemModal from "$lib/components/AddItemModal.svelte";
    import DelItemModal from "$lib/components/DelItemModal.svelte";
	import Modal from "$lib/components/Modal.svelte";
	import LabelPrintButton from "$lib/components/LabelPrintButton.svelte";
	import { action_type } from "$lib/action_type";
    import { page } from "$app/stores";

    export let checkedItems : any;
    
    const resetCheckedItems = () => {
        checkedItems = []
    }
    
    let moveItemIcon = `
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" >
                <path stroke-linecap="round" stroke-linejoin="round"  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
        </i>
    `;

    let giveItemIcon = `
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
        </i>
    `;

    let addItemIcon = `
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </i>
    `;

    let delItemIcon = `
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </i>
    `;

    let mergeItemIcon = `
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
        </i>
    `;

    let splitItemIcon = `
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
            </svg>
        </i>
    `;
    
    async function submitItemMerge(){
        try {
            await fetch(`/api/item/action`,{
                method: "POST",
                body: JSON.stringify({
                    action_type: action_type.MERGE,
                    items: checkedItems
                        .map((item: any) =>
                            {return {
                                ...(item.uid ? {uid : item.uid} : {uids : item.uids}), 
                                amount : item.amount
                            }}
                        )
                        .flat(),
                    user_uid: $page.data.user.uid,
                }),
                headers: {
                "Content-Type": "application/json",
                }
            })
        }
        catch(err){

        }
        finally{
            resetCheckedItems();
            $sharedData.sel_wh_id = $sharedData.sel_wh_id;
        }
    }

    let splitModalData = {
        parts : [{value : 0},{value : 0}]
    }
    async function submitItemSplit(){
        try {
            await fetch(`/api/item/action`,{
                method: "POST",
                body: JSON.stringify({
                    action_type: action_type.SPLIT,
                    items: checkedItems
                        .map((item: any) =>
                            {return {
                                ...(item.uid ? {uid : item.uid} : {uids : item.uids}), 
                                amount : item.amount
                            }}
                        )
                        .flat(),
                    user_uid: $page.data.user.uid,
                }),
                headers: {
                "Content-Type": "application/json",
                }
            })
        }
        catch(err){

        }
        finally{
            resetCheckedItems();
            $sharedData.sel_wh_id = $sharedData.sel_wh_id;
        }
    }
</script>
<div>
    <h2 class="text-center mb-2">Akcje</h2>
    <div class="flex">
        <div class="flex justify-center w-full space-x-2">

            {#if $sharedData.sel_wh_id}
                <Modal buttonText={"Dodaj"} buttonIcon={addItemIcon} let:closeModal>
                    <AddItemModal checkedItems={checkedItems} {closeModal} {resetCheckedItems}/>
                </Modal>
            {/if}
            
            <Modal buttonText={"Przenieś"} buttonIcon={moveItemIcon} let:closeModal>
                <MoveItemModal checkedItems={checkedItems} {closeModal} {resetCheckedItems}/>
            </Modal>
            
            <Modal buttonText={"Wydaj"} buttonIcon={giveItemIcon} let:closeModal>
                <GiveItemModal checkedItems={checkedItems} {closeModal} {resetCheckedItems}/>
            </Modal>

            {#if checkedItems.length > 1 && checkedItems.every(item => item.product.prod_code === checkedItems[0].product.prod_code)}
            <Modal buttonText={"Scal"} buttonIcon={mergeItemIcon} let:closeModal>
                <div>
                    <h3 class="font-bold text-lg">Scal przedmioty</h3>
                    <p>Przedmioty zostaną scalone do ostatniego zaznaczonego przedmiotu.</p>
                    <p>Można scalić tylko z przedmiotami nie posiadającymi żadnych relacji.</p>
                    
                    <button type="button" on:click={submitItemMerge} class="btn w-full mt-5 shadow">Scal</button>
                </div>
            </Modal>
            {/if}

            {#if checkedItems.length == 1 && checkedItems[0].amount > 1}
            <Modal buttonText={"Rozdziel"} buttonIcon={splitItemIcon} let:closeModal>
                <div>
                    <h3 class="font-bold text-lg">Rozdziel przedmioty</h3>
                    <p class="mt-2">Rodziel przedmiot na każdy z ilością 1</p>

                    <!-- <label class="label">
                        <span class="label-text">Ilość części</span>
                        <input type="number" class="input input-bordered input-xs w-1/2" 
                            on:change={(event)=>{
                                let partsNum = event.target.value;
                                while (splitModalData.parts.length < partsNum) {
                                    splitModalData.parts.push({ value: 0 });
                                }
                                while (splitModalData.parts.length > partsNum) {
                                    splitModalData.parts.pop();
                                }

                                splitModalData.parts = splitModalData.parts
                            }} 
                            value={splitModalData.parts.length} placeholder="Wpisz numer"
                        >
                    </label>

                    <div class="flex flex-wrap mt-2">
                        {#each splitModalData.parts as part}
                            <input type="number" class="input input-bordered w-12 p-0 text-center" value={part.value} placeholder="Wpisz numer">
                        {/each}
                    </div> -->
                    

                    <button type="button" on:click={submitItemSplit} class="btn w-full mt-5 shadow">Rozdziel</button>
                </div>
            </Modal>
            {/if}

            {#if checkedItems.length}
            <Modal buttonText={"Usuń"} buttonIcon={delItemIcon} let:closeModal>
                <DelItemModal checkedItems={checkedItems} {closeModal} {resetCheckedItems}/>
            </Modal>
            
            <LabelPrintButton items={checkedItems}/>  
            {/if}
            

        </div>
    </div>
</div>

<style>
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    /* Firefox */
    input[type=number] {
    -moz-appearance: textfield;
    }
</style>