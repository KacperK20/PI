<script lang="ts">
    import AlertBox from '$lib/components/AlertBox.svelte';
    import PasswordField from '$lib/components/PasswordField.svelte';
	import { enhance } from '$app/forms';
	import BackButton from '$lib/components/BackButton.svelte';
	import SignaturePad from '$lib/components/SignaturePad.svelte';
	import { fade } from 'svelte/transition';
    import type { ActionData, PageData } from './$types';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import { sharedData } from '../../../sharedData';
	import PageButton from '$lib/components/PageButton.svelte';
    
    export let data: PageData;
    export let form: ActionData;

    let signaturePad : any;

    let signature = "";
    let timeout : any;

    function formatDate(dateString: Date) {
		const date = new Date(dateString);
		const isoString = date.toISOString();
		const formattedString = isoString.replace('T', ' ').substring(0, 19);
		return formattedString;
	}

    const action_types = [
      "Usunięto przedmiot",
      "Dodano przedmiot",
      "Przyjęto przedmiot",
      "Wydano przedmiot",
      "Przeniesiono przedmiot",
      "Otrzymano przedmiot",
      "Zaktualizowano przedmiot"
    ]

	const action_color = [
      'bg-red-300',
      'bg-green-300',
      'bg-blue-300',
      'bg-yellow-300',
      'bg-orange-300',
      'bg-purple-300',
      'bg-cyan-300',
    ]

    let timer : any;
    let action_skip : number = 0;
</script>

<BackButton />

<div class="w-full flex flex-col lg:flex-row">
    {#if data.user}
    <div class=" w-full lg:w-1/3">
        <form class="flex-col space-y-4 justify-center w-fit mx-auto" action="?/save" method="POST" use:enhance>
            <label class="label">
                <span class="text-base label-text">Nazwa użytkownika</span>
            </label>
            <input id="username" name="username" type="text" bind:value={data.user.username} readonly class="w-full input input-bordered" />

            <label class="label">
                <span class="text-base label-text">Hasło</span>
            </label>
            <PasswordField placeholder="Wpisz nowe hasło"></PasswordField>

            {#if data.user.person}
                <label class="label">
                    <span class="text-base label-text">Imię Nazwisko / Nazwa</span>
                </label>
                <input id="name" name="name" type="text" bind:value={data.user.person.name} class="w-full input input-bordered" />
            {/if}

            <SignaturePad bind:this={signaturePad} signature={data.user.signature}></SignaturePad>
            
            <button class="btn w-full" on:click={() => {
                signature = signaturePad.getSignature()
            }}>Zapisz</button>

            <input id="signature" name="signature" type="hidden" bind:value={signature}>
            <input id="user_uid" name="user_uid" type="hidden" value={data.user.uid}>

            {#if form?.success}
                <AlertBox type="success" message={"Zapisano pomyślnie"}></AlertBox>
            {/if}

            {#if form?.error}
                <AlertBox type="error" message={"Niepowodzenie"}></AlertBox>
            {/if}
        </form>
    </div>
    {/if}

    <div
        id="table_activity"
        class="mt-5 w-full lg:w-2/3 flex flex-col grow"
    >
        <h1 class="text-center m-1 font-semibold">Akcje</h1>
        <div class="table-content flex flex-col grow justify-between">
            <TableComponent
                headers={['', 'Data', 'Akcja', 'Przedmiot', ...(!$sharedData.sel_wh_id ? ["Magazyn"] : []), 'Użytkownik']} 
            >

            <tbody>
                {#each data.itemsActions as itemAction}
                    <tr>
                        <td class="{action_color[itemAction.type]} p-0 w-[5px] min-w-[5px]" />
                        <td>{formatDate(itemAction.date)}</td>
                        <td>{action_types[itemAction.type]}</td>
                        <td
                            ><a href={`/item/${itemAction.item.uid}`}>{itemAction.item.product.name}</a
                            ></td
                        >
                        {#if !$sharedData.sel_wh_id}
                            <td
                                ><a href={`/warehouse?id=${itemAction.wh.id}`}>{itemAction.wh.name}</a
                                ></td
                            >
                        {/if}
                        <td>{itemAction.user.person.name}</td>
                    </tr>
                {/each}
            </tbody>
            </TableComponent>
            <div class="mt-2">
                <PageButton bind:skip={action_skip} />
            </div>
        </div>
    </div>
</div>

