<script lang="ts">
    import type { PageData } from './$types';
    
    export let xs_btn = false;
    export let editable = false;
    export let coords : any = null;
    export let result : any = (err) => {};;
    export let error : any = (err) => {};

    const getGPSLocalization = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    };

    function success(position){
        coords = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }
        result(position.coords)
    }

    let link;
</script>




{#if editable}
<button type="button" class="flex items-center bg-base-200 border-base-200 shadow {editable ? "btn-active" : ""} btn {xs_btn ? "btn-xs" :"btn-sm" }" on:click={getGPSLocalization}>
    <i>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="{xs_btn ? " w-4 h-4" :" w-6 h-6" }">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
        </svg>          
    </i>
    {#if coords}
        <a class="m-1 hover:underline" bind:this={link} target="_blank" href="https://www.google.com/maps/search/?api=1&query={coords.latitude},{coords.longitude}">{coords.latitude},{coords.longitude}</a>
    {/if}
</button>
{:else}
<div class="flex items-center">
    <i>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="{xs_btn ? " w-4 h-4" :" w-6 h-6" }">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />
        </svg>          
    </i>
    {#if coords.latitude && coords.longitude}
        <a class="m-1 hover:underline" bind:this={link} target="_blank" href="https://www.google.com/maps/search/?api=1&query={coords.latitude},{coords.longitude}">{coords.latitude},{coords.longitude}</a>
    {:else}
    <span class="m-1">Brak danych o lokalizacji</span>
    {/if}
</div>
{/if}
