<script lang="ts">
	import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import SignaturePad from 'signature_pad';
	import { checkIfMobile } from '$lib/checkIfMobile';

    let canvas : any;
    let canvas_full : any;
    let signaturePad : SignaturePad;
    let signaturePadFull : SignaturePad;
    let landscape_mode;
    let firstOrientation = true;
    let mobile = true;
    export let signature : string | null | undefined = ""
    let rendered = false;

    onMount(() => {
        rotateCanvas()
        screen.orientation.addEventListener("change", rotateCanvas);
        mobile = checkIfMobile();
    })

    export function getSignature(){
        signature = signaturePad.toDataURL("image/jpeg")
        return signature;
    }

    $: if(canvas_full){
        

        /*
        let parent = canvas_full.parentElement.parentElement
        parent.style.height = "90%";

        canvas_full.width  = parent.offsetWidth - 20
        canvas_full.height = parent.offsetHeight - 20

        canvas_full.style.width = canvas_full.width + 'px';
        canvas_full.style.height = canvas_full.height + 'px';
        */


        if(firstOrientation){
            rotateCanvas()
            firstOrientation = false
        }
        signaturePadFull = new SignaturePad(canvas_full, {
            throttle: 0,
            backgroundColor: "rgb(255,255,255)"
        });
        
        signaturePadFull.clear();
    }

    $: if(canvas){
        if(!rendered){
            signaturePad = new SignaturePad(canvas, {
                throttle: 0,
                backgroundColor: "rgb(255,255,255)"
            });
            if(signature)
                signaturePad.fromDataURL(signature)
            rendered = true;
        }
    }

    function closeModal(){
        const data = signaturePadFull.toData();
        let mod_data = JSON.parse(JSON.stringify(data));

        for (let k = 0; k < mod_data.length; k++) {
            let points = mod_data[k].points
            for (let i = 0; i < points.length; i++) {
                let temp = points[i].x;
                points[i].x = points[i].y;
                points[i].y = canvas_full.width - temp;
            }
            mod_data[k].points = points
        }
        signaturePad.clear();
        let ratio = (canvas.height/canvas_full.width)
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.fromData(mod_data);
        canvas.getContext("2d").scale(1 + ((1 - ratio) / ratio), 1 + ((1 - ratio) / ratio));

        dialog.open = false;
    }
    

    function rotateCanvas() {
        landscape_mode = screen.orientation.type.includes("landscape")

        let ratio = 1.5

        if(canvas_full){
            if (landscape_mode) {
                //Landscape
                canvas_full.width = canvas.width * ratio
                canvas_full.height = canvas.height * ratio
            }
            else {
                // Portrait
                canvas_full.width = canvas.height * ratio
                canvas_full.height = canvas.width * ratio
            }
        }
    }

    let dialog : any;
</script>


<div>
    <div class="flex">
        <div class="form-control">
            <label class="label">
            <span class="label-text">Podpis</span>
            </label>
        </div>
        <div class="flex w-full justify-end	">

            {#if mobile}
            <button class="btn btn-sm w-19 mr-1" on:click={() => {dialog.open = true}} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.747.747 0 01-.75-.75zM12.22 13.28l3.22 3.22h-2.69a.75.75 0 000 1.5h4.5a.747.747 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v2.69l-3.22-3.22a.75.75 0 10-1.06 1.06zM3.5 4.56l3.22 3.22a.75.75 0 001.06-1.06L4.56 3.5h2.69a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0V4.56z" />
                </svg>
            </button>
            {/if}
            

            <button class="btn btn-sm w-19" on:click={()=>{signaturePad.clear();signaturePadFull.clear()}} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2z" />
                    <path fill-rule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 01-1.99 1.79H4.802a2 2 0 01-1.99-1.79L2 7.5zm5.22 1.72a.75.75 0 011.06 0L10 10.94l1.72-1.72a.75.75 0 111.06 1.06L11.06 12l1.72 1.72a.75.75 0 11-1.06 1.06L10 13.06l-1.72 1.72a.75.75 0 01-1.06-1.06L8.94 12l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>

    <canvas id="canvas" class="w-fit mx-auto my-2 border border-base-content/25" bind:this={canvas} height="200"></canvas>

    <dialog bind:this={dialog} class="modal">
        <div class="modal-box">
            <button type="button" on:click={closeModal} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <div class="modal-action">
                <canvas class=" mx-auto my-0 relative" bind:this={canvas_full} style="border:1px solid #000000;"></canvas>
                <div class="rotate-90 w-24 absolute right-0 top-1/2 m-0 p-0 text-center">Góra</div>
                <div class="rotate-90 w-24 absolute left-0 top-1/2 m-0 p-0 text-center">Dół</div>
            </div>
        </div>
    </dialog>
</div>