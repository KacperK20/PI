<script lang="ts">
	import { enhance } from '$app/forms';
	import BackButton from '$lib/components/BackButton.svelte';
    import AlertBox from '$lib/components/AlertBox.svelte';
	import { fade } from 'svelte/transition';
    import type { PageData } from './$types';
    import { source } from 'sveltekit-sse'
    import { sharedData } from '../../../../sharedData.js';

    export let data: PageData;
    
    let form : any = {}

    let timeout : any;
    $: if(form?.error || form?.success){
        if(timeout)clearTimeout(timeout)
        timeout = setTimeout(() => {
            form.error = false
            form.success = false;
        }, 2000)    
    }

    let showImport = false;
    let export_menu = false;

</script>

<BackButton />
<div class="flex flex-col max-w-xs mx-auto w-full space-y-2">
    <button type="button" class="btn shadow" on:click={()=>{export_menu = !export_menu}}>Eksport</button>

    {#if export_menu}
        <a href="/api/db" target="_blank" class="btn shadow">Baza danych - JSON</a>
        <a href="/api/db?type=csv" target="_blank" class="btn shadow">Przedmioty - CSV</a>
    {/if}
    
    <div class="divider"></div>

    
    <button class="btn shadow" on:click={() => {showImport = !showImport}}>Import</button>
    {#if showImport}
        
        <form action="/api/db" method="post" enctype="multipart/form-data" class="flex flex-col space-y-2 w-full" 
            use:enhance={({ formElement, formData, action, cancel, submitter }) => {
                form.waiting = true
                return async ({ result }) => {
                    form = result
                };
            }}>
            <label class="form-control w-full">
                <div class="label">
                    <span class="label-text">Plik JSON bazy danych</span>
                </div>
                <input name="fileToUpload" type="file" accept=".json" class="file-input file-input-bordered w-full" />
            </label>
            <button type="submit" class="btn shadow">Prześlij</button>
        </form>

        <form action="/api/db?type=csv" method="post" enctype="multipart/form-data" class="flex flex-col space-y-2 w-full" 
            use:enhance={({ formElement, formData, action, cancel, submitter }) => {
                form.waiting = true
                return async ({ result }) => {
                    form = result
                };
            }}>
            <label class="form-control w-full">
                <div class="label">
                    <span class="label-text">Plik CSV przedmiotów</span>
                </div>
                <input name="fileToUpload" type="file" accept=".csv" class="file-input file-input-bordered w-full" />
            </label>
            <a href="/api/db?type=csv&template=1" target="_blank" class="btn btn-xs shadow">Szablon</a>
            <button type="submit" class="btn shadow">Prześlij</button>
        </form>

        
        {#if form?.success}
            <AlertBox type={"success"} message={form?.message}></AlertBox>
        {/if}

        {#if form?.waiting}
            <AlertBox type={""} message={"Ładowanie"}></AlertBox>
        {/if}

        {#if form?.error}
            <AlertBox type={"error"} message={form?.message}></AlertBox>
        {/if}
    
    {/if}
</div>
