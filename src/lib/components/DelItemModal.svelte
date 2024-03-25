<script lang="ts">
	import { page } from "$app/stores";
	import { action_type } from "$lib/action_type";
	import { sharedData } from "../../sharedData";
	import ModalItem from "./ModalItem.svelte";


    export let checkedItems: any = [];
	export let closeModal: any;
	export let resetCheckedItems: any;

    let data = {
		items: checkedItems.length ? checkedItems : [{}],
    }

    function refreshTables() {
		$sharedData.sel_wh_id = $sharedData.sel_wh_id;
	}

    async function delItems(){
        if(data.items.length){
			try {
                await fetch(`/api/item/action`,{
                    method: "POST",
                    body: JSON.stringify({
                        action_type: action_type.DELETE,
                        items: data.items
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
            } catch (err) {
				console.log('Error: ' + err);
			} finally {
				resetCheckedItems();
				closeModal();
				refreshTables();
			}
        }
    }

</script>

<div>
    <h3 class="font-bold text-lg">Potwierdzenie usunięcia</h3>
    <div class="form-control w-full mt-2">
        <label class="label">
			<span class="label-text">Przedmioty</span>
		</label>
        {#each data.items as item}
            <div class="mb-1">
                <ModalItem {item}/>
            </div>
        {/each}
    </div>
    <button type="button" class="btn btn-wide mt-5 w-full" on:click={delItems}>USUŃ</button> 
</div>