<script lang="ts">
 
    import { page } from '$app/stores'
    import { enhance } from '$app/forms'
    import "../app.css";
    
</script>
  
  <svelte:head>
    <title>Inz - Svelte</title>
  </svelte:head>
  
  <main class="p-2 h-full flex flex-col">
    <slot />
  </main>