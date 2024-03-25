<!-- KOD -->
<script lang="ts">
  import { enhance } from '$app/forms'
	import { onMount } from 'svelte';
  import type { ActionData } from './$types'
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import PasswordField from '$lib/components/PasswordField.svelte';

  export let form: ActionData

  const redirectTo = $page.url.searchParams.get("redirectTo")
  
  let waiting = false;

  let timeout : any;
    $: if(form?.invalid || form?.credentials){
        waiting = false;
        if(timeout)clearTimeout(timeout)
        timeout = setTimeout(() => {
            form.invalid = false
            form.credentials = false;
        }, 2000)
    }

</script>
  
<!-- PANEL LOGOWANIA-->
<div class="flex flex-col justify-center h-screen overflow-hidden">

  <div class="lg:w-full p-6 m-auto bg-white rounded-md shadow ring-2 ring-gray-800/50 lg:max-w-lg">
      <h1 class="text-3xl font-semibold text-center text-gray-700 m-4">Logowanie</h1>
      <form class="space-y-4" action="?/login{redirectTo ? `&redirectTo=${redirectTo}` : ""}" method="POST" use:enhance={() => {
              waiting = true
          }}>
          <div>
              <label class="label">
                  <span class="text-base label-text">Nazwa użytkownika</span>
              </label>
              <input id="username" name="username" type="text"class="w-full input input-bordered" />
          </div>
          <div>
              <label class="label">
                  <span class="text-base label-text">Hasło</span>
              </label>
              <PasswordField></PasswordField>
          </div>

          <div>
              <button class="btn btn-block">Zaloguj</button>
          </div>

          {#if form?.invalid}
            <div class="alert alert-error" transition:fade>
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Wymagana nazwa użytkownika i hasło</span>
            </div>
          {/if}

          {#if form?.credentials}
            <div class="alert alert-error" transition:fade>
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Podano nieprawidłowe dane</span>
            </div>
          {/if}

          {#if waiting}
          <div role="alert" class="alert">
              <span class="loading loading-spinner loading-xs"></span>
              <span>Logowanie ...</span>
            </div>
          {/if}
      </form>
  </div>
</div>