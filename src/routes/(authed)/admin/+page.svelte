<script lang="ts">
    import type { PageData } from './$types';
    import BackButton from "$lib/components/BackButton.svelte";
</script>

<BackButton />
<div class="flex flex-col items-center">
    <a class="btn mt-5 w-60"href="/admin/users">Zarządzaj użytkownikami</a>
    <a class="btn mt-5 w-60"href="/admin/products">Zarządzaj produktami</a>
    <a class="btn mt-5 w-60"href="/admin/persons">Zarządzaj osobami</a>
    <a class="btn mt-5 w-60"href="/admin/productCategories">Zarządzaj kategoriami </a>
    <a class="btn mt-5 w-60"href="/admin/reports">Raporty</a>
    <a class="btn mt-5 w-60"href="/admin/settings">Ustawienia</a>
</div>


