<script lang="ts">
	import { clickoutside } from "@svelte-put/clickoutside";
    import { createEventDispatcher } from 'svelte';
    
    export let list : Array<string>;
    export let placeholder : string  = "Wybierz";
    export let addNewValueExternal : ((a: string) => void) | null = null;
    export let value : string = "";
    export let disabled : boolean = false;

    function addNewValue(){
        list.push(value)
        
        if (addNewValueExternal){
            addNewValueExternal(value)
            showList = false;
        }
    }

    let showList = false;
    
    const dispatch = createEventDispatcher();

    function handleClickOutside(){
        if(showList) showList = false
    }

    function handleInput(event : any){
        dispatch('input', event.target.value);
    }

    function handleInputClick(){
        if(!showList) showList = true
    }

    function handleListItemClick(val : string){
        value = val;
        showList = false
        dispatch('change', value);
    }

</script>

<div class="relative" use:clickoutside on:clickoutside={handleClickOutside}>
    <input type="text" {disabled} required bind:value={value} on:input={handleInput} on:click={handleInputClick} placeholder={placeholder} class="my-1 input input-bordered w-full  {$$restProps.class}" />
    
    {#if showList}
    <ul class=" absolute left-0 z-10 w-full bg-white border border-gray-300 rounded-md shadow overflow-auto max-h-52" >
        
        {#if addNewValueExternal && value && !list.find(listItem => listItem.toLowerCase() == value.toLowerCase())}
            <li class="px-2 py-1 text-center cursor-pointer hover:bg-gray-100" on:click={addNewValue}>+</li>  
        {/if}
        
        {#each list.filter(listItem => listItem.toLowerCase().startsWith(value.toLowerCase())) as listItem}
            <li class="px-2 py-1 cursor-pointer hover:bg-gray-100" on:click={() => handleListItemClick(listItem)}>{listItem}</li>
        {/each}  

    </ul>
    {/if}
</div>

