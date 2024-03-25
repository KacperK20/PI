<script lang="ts">
	import { fade } from "svelte/transition";

    let timeout : any;
    export let type : string;
    export let message : string;

    timeout = setTimeout(() => {
        show = false;
    }, 2000)

    let timer : any;
    let show : boolean = true;
</script>


{#if show}
<div class="alert alert-{type}" transition:fade>
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{message}</span>
</div>
{/if}


