<!-- KOD -->
<script lang="ts">
    import { enhance } from '$app/forms'
    import type { ActionData } from './$types'
  
    export let form: ActionData
</script>
  
<!-- PANEL REJESTRACJI-->
  <div class="flex flex-col justify-center h-screen overflow-hidden">
    <div class="lg:w-full p-6 m-auto bg-white rounded-md shadow ring-2 ring-gray-800/50 lg:max-w-lg">
        <h1 class="text-3xl font-semibold text-center text-gray-700 m-4">Rejestracja</h1>
        <form class="space-y-4" action="?/register" method="POST" use:enhance>
            <div>
                <label class="label">
                    <span class="text-base label-text">Nazwa użytkownika</span>
                </label>
                <input id="username" name="username" type="text" class="w-full input input-bordered" />
            </div>
            <div>
                <label class="label">
                    <span class="text-base label-text">Hasło</span>
                </label>
                <input  id="password" name="password" type="password" class="w-full input input-bordered" />
            </div>

            <div>
                <label class="label">
                    <span class="text-base label-text">Imię Nazwisko</span>
                </label>
                <input id="name" name="name" type="text" class="w-full input input-bordered" />
            </div>

            <div>
                <button class="btn btn-block">Zarejestruj</button>
            </div>
  
            {#if form?.invalid}
                <p class="error text-red-500">Niepoprawne lub brakujące dane</p>
            {/if}
  
            {#if form?.user}
                <p class="error text-red-500">Istnieje</p>
            {/if}

        </form>
    </div>
  </div>