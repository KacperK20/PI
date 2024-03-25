<script lang="ts">
    import CodeScanner from '$lib/components/CodeScanner.svelte';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import attachOnScan from '$lib/attachOnScan';
	import { onMount } from 'svelte';
	import BackButton from '$lib/components/BackButton.svelte';
    import onScan from 'onscan.js'

    export let data: PageData;
    
    onMount(()=>{
        attachOnScan(document, (sCode : string, iQty : number) => {
            scanSuccess(null, sCode);
        })
    })

    let  scanSuccess = (scanner : any, code : any) => {
        onScan.detachFrom(document);
        goto(`/item/${code}`,{
            invalidateAll: true
        })
    }

</script>

<BackButton />

<div class="mx-auto my-auto text-center">
    <h1 class="text-xl">Użyj skanera lub kamery:</h1>
    <br>
    <CodeScanner {scanSuccess} class="w-40 h-40 rounded-3xl"/>

    <span class="mt-5 loading loading-dots loading-lg"></span>
    
</div>

