<script lang="ts">
    import { clickoutside } from '@svelte-put/clickoutside';
	import { sharedData } from '../../sharedData';
	import SelectWithInput from './SelectWithInput.svelte';
    import { createEventDispatcher } from 'svelte';

    export let sel_person : any = "";
    export let sel_comp_id : number = $sharedData.sel_comp_id

    async function getPersons() {
        const response = await fetch(`/api/person?comp_id=${sel_comp_id}`);
        const data = await response.json();
        return data;
    }

    async function addPerson(name : string){
        const response = await fetch(`/api/person?comp_id=${sel_comp_id}`,{
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify({
                name,
                comp_id : sel_comp_id,
                createWh : false
            })
        });
        Persons = getPersons();
        
        handleChange() 
    }

	const dispatch = createEventDispatcher();

    async function handleChange(){
        dispatch('change', (await Persons).find(person => person.name == sel_person));
    }

    async function handleInput(event) {
        dispatch('input', event.detail)
    }

    let Persons = getPersons();
</script>

<div>

    <div class="form-control w-full m-0" >
        {#await Persons}
        {:then persons} 
            <SelectWithInput list={persons.map(person => person.name)} bind:value={sel_person} on:input={handleInput} on:change={handleChange} addNewValueExternal={addPerson}/>
        {/await}
    </div>
</div>