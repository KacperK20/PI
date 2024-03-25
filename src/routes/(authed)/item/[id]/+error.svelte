<script lang="ts">
    import { page } from '$app/stores';
	import BackButton from '$lib/components/BackButton.svelte';
</script>

<BackButton />

<h1>{$page.error?.message}</h1>