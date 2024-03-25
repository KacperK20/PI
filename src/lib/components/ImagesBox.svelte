<script lang="ts">
    import type { PageData } from './$types';
    export let images : any = []
    export let editable : boolean = false;
	import * as ExifReader from 'exifreader';

    function delImage(n : number){
        images.splice(n, 1);
        images=images;
    }

    let sel_image = {
        base64Data : "",
        metadata : {}
    };


	async function openModal(image : any) {
        sel_image.base64Data = image.base64Data;
		modal.open = true;

        sel_image.metadata = await ExifReader.load(sel_image.base64Data)

	}

    let modal : any;
</script>

<div>
    <div class="flex flex-wrap border border-base-content/20 rounded-lg my-2 p-2 {images.length > 0 ? "" : "hidden"}">
        {#each images as image, n}
            <div class="relative w-16 h-16 m-1 bg-contain bg-no-repeat bg-center cursor-pointer" on:click={()=>{if(!editable)openModal(image)}} style="background-image: url({image.base64Data})">
                {#if editable}
                    <button type="button" on:click={() => delImage(n)} class="absolute border border-base-content/20  bg-base-100/50 hover:bg-base-100 rounded-xl p-1 -right-2 top-0">
                        <i>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>                      
                        </i>
                    </button>
                {/if}
            </div>
        {/each}
    </div>
    <dialog bind:this={modal} class="modal">
        <div class="modal-box max-w-4xl">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <p class="py-4">
                <img src={sel_image.base64Data} />
            </p>
            
            <div class="text-base">
                <p>Metadane:</p>
                <table>
                <thead>
                    <th>Zmienna</th>
                    <th>Wartość</th>
                    <th>Opis</th>
                </thead>
                <tbody>
                    {#each Object.keys(sel_image.metadata) as key}
                        <tr><th>{key}</th><td>{sel_image.metadata[key].value}</td><td>{sel_image.metadata[key].description}</td></tr>
                    {/each}
                </tbody>
                </table>
            </div>
        </div>
    </dialog>
</div>