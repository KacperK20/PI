<script lang="ts">
	import { enhance } from '$app/forms';
	import BackButton from '$lib/components/BackButton.svelte';
	import { fade } from 'svelte/transition';
    import type { ActionData, PageData } from './$types';
	import LabelPrintButton from "$lib/components/LabelPrintButton.svelte";
	import LabelDesigner from '$lib/components/LabelDesigner.svelte';
    
    export let data: PageData;

    let timeout : any;
    export let form: ActionData;

    $: if(form?.error || form?.success){
        if(timeout)clearTimeout(timeout)
        timeout = setTimeout(() => {
            form.error = false
            form.success = false;
        }, 2000)
    }

</script>

<BackButton/>

<div class="lg:w-1/2 mx-auto my-0">
    <h1 class="text-xl text-center mb-5">Ustawienia</h1>
    <form class="space-y-4" action="?/save" method="POST" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
        formData.set("label_template", JSON.stringify(data.app_settings.label.template))
    }}>
        <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" name="setting_group"/> 
            <div class="collapse-title text-xl font-medium">
                Aplikacji
            </div>
            <div class="collapse-content"> 
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Zapisuj pdf transakcji w Minio</span> 
                        <input type=checkbox name="save_transaction_pdf" bind:checked={data.app_settings.application.save_transaction_pdf} class="checkbox" />
                    </label>
                    <label class="label cursor-pointer">
                        <span class="label-text">Wyłącz zdjęcie przedmiotu</span> 
                        <input type=checkbox name="disable_item_photo" bind:checked={data.app_settings.application.disable_item_photo} class="checkbox" />
                    </label>
                </div>
            </div>
        </div>
        <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" name="setting_group"/> 
            <div class="collapse-title text-xl font-medium">
                Etykieta
            </div>
            <div class="collapse-content"> 
                <div class="form-control">
                    
                    <div class="m-2">
                        <LabelDesigner 
                            bind:template={data.app_settings.label.template} 
                        />
                    </div>
                    
                    <LabelPrintButton barcode="test" qrcode="test123" qty={3} prod_name="Nazwa przedmiotu" wh_name="Nazwa magazynu"/>
                </div>
            </div>
        </div>
        <button type="submit" class="btn w-full" >Zapisz</button>


        {#if form?.success}
            <div class="alert alert-success" transition:fade>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Zapisano pomyślnie</span>
            </div>
        {/if}

        {#if form?.error}
            <div class="alert alert-error" transition:fade>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Niepowodzenie</span>
              </div>
        {/if}
        
    </form>
</div>