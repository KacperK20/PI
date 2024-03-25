<script lang="ts">
export let item : any;

let showDetails = false;

function limitMinMax(event : any){
    if(event.target.value > event.target.max) event.target.value = event.target.max
    else if(event.target.value < event.target.min) event.target.value = event.target.min
}

function handleItemClick(event : any){
    if(event.target.tagName.toLowerCase() !== 'input') {
        showDetails = !showDetails
    }
}

</script>

{#if item}
    <div class="p-2 border border-base-300 rounded hover:cursor-pointer w-full" on:click={handleItemClick}>
        <div class="flex flex-row">
            <input class="input input-xs w-full pointer-events-none" readonly type="text" value="{item.product.name}" />
            <i class="flex flex-col justify-center mx-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </i>
                <input type="number" disabled={!item.uid || item.amount <= 1} on:change={limitMinMax} bind:value={item.amount} class="input input-xs w-10 input-bordered text-center self-center" placeholder={`${item.amount}`} min='1' max={item.amount}/>
                <div class="mx-1 text-sm text-center w-8 flex items-center">{item.product.unit}</div>
        </div>
        {#if showDetails}
            <div class="text-xs mt-2 flex flex-row">
                <div class="flex items-center w-1/2">Kod:<input class="input input-xs w-full ml-1 pointer-events-none" readonly type="text" value="{item.product.prod_code}"/></div>
                <div class="flex items-center w-1/2 ml-1">Magazyn:<input class="input input-xs w-full ml-1 pointer-events-none" readonly type="text" value="{item.wh.name}"/></div>
            </div>
            {#if item.uid}
                <div class="text-xs mt-2 flex items-center">UID:<input class="input input-xs w-full ml-1 pointer-events-none" readonly type="text" value="{item.uid}"/></div>
            {/if}
        {/if}
    </div> 

{/if}

<style>
    input:read-only{
        background-color: oklch(var(--b2));
    }
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