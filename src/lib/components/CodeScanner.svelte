<script lang="ts">
    import { Html5Qrcode } from 'html5-qrcode'
    import { onMount } from 'svelte'
    import Modal from '$lib/components/Modal.svelte'
	import AlertBox from '$lib/components/AlertBox.svelte';

    export let scanning = false;
    export let continousMode = false;
    
    let html5Qrcode

    onMount(init)

    function init() {
        let rand_id = 'reader-' + self.crypto.randomUUID();
        reader.id = rand_id;
        html5Qrcode = new Html5Qrcode(rand_id)

        window.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                stop();
            }
        });
    }

    async function start(event) {
        modal.classList.add("modal-open")

        try{
        await html5Qrcode.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            },
            onScanSuccess,
            onScanFailure
        )
        scanning = true
        }
        catch(err){
            console.log(err)
            scanning = false
        }

    }

    async function stop() {
        try {
            await html5Qrcode.stop()
        }
        catch(err){
            console.log(err)
        }
        scanning = false
        modal.classList.remove("modal-open")
    }

    function onScanSuccess(decodedText, decodedResult) {
        scanSuccess(scanner,decodedText);
        if(!continousMode) stop();
        showAlert = {
            type : "success",
            message : `Zeskanowano pomyślnie: ${decodedText}`
        }
    }

    export let scanSuccess

    function onScanFailure(error) {
        //console.warn(`Code scan error = ${error}`)
    }

    let scanner;
    let modal;
    let reader;
    
    let showAlert : any = null;
</script>

<div bind:this={scanner}>

    <button type="button" class="btn btn-sm shadow p-1 {$$props.class} " on:click={start}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
        </svg>
    </button>
    <dialog bind:this={modal} class="modal overflow-visible	">
        <div class="modal-box">
            <form method="dialog">
                <button on:click={stop} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 class="font-bold text-lg m-5">Skanuj kod kreskowy lub kod QR</h3>
            {#if !scanning}
            <span class="loading loading-spinner loading-lg block mx-auto my-5"></span>
            {/if}
            <div bind:this={reader}></div>

            {#if showAlert}
                {#key showAlert}
                    <div class="w-full pt-4">
                        <AlertBox type={showAlert.type} message={showAlert.message}></AlertBox>
                    </div>
                {/key}
            {/if}
        </div>
    </dialog>


</div>