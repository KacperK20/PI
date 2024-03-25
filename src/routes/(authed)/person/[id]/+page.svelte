<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import { onMount } from 'svelte';
	import { checkIfMobile } from '$lib/checkIfMobile';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';

	const action_types = [
		'Usunięto przedmiot',
		'Dodano przedmiot',
		'Przyjęto przedmiot',
		'Wydano przedmiot',
		'Przeniesiono przedmiot',
		'Otrzymano przedmiot',
		'Zaktualizowano przedmiot'
	];

	const action_color = [
		'bg-red-300',
		'bg-green-300',
		'bg-blue-300',
		'bg-yellow-300',
		'bg-orange-300',
		'bg-purple-300',
		'bg-cyan-300'
	];

	function formatDate(dateString: Date) {
		const date = new Date(dateString);
		const isoString = date.toISOString();
		const formattedString = isoString.replace('T', ' ').substring(0, 19);
		return formattedString;
	}

	export let data: PageData;

	let personInfo: any;
	let companies: any;
	let itemActions: any;
	let owneditems: any;
	let responsibleitems: any;

	onMount(async () => {
		itemActions = data.itemAction;
		personInfo = data.personInfo;
		companies = data.companies;
		owneditems = data.owneditems;
		responsibleitems = data.responsibleitems;
	});
</script>

<BackButton />
<div class="flex h-full w-full">
	<table class="table w-fit table-xs h-min ite">
		<thead>
			<th colspan="100" class="text-center text-lg"> Osoba </th>
		</thead>
		<tbody>
			<tr><th>Imie i nazwisko</th> <td>{personInfo?.name}</td> </tr>
			<tr><th>E-mail</th> <td>{personInfo?.email || 'Brak'}</td> </tr>
			<tr
				><th>Firma</th>
				{#if companies}
					{#each companies as company}
						{#if company.uid == personInfo.comp_uid}
							<td>{company.name}</td>
						{/if}
					{/each}
				{/if}
			</tr>		{#if companies}<tr class="">
		
		<ul>
			<li><a
				href="/warehouse?f_wh_uid={personInfo.wh_uid}"
				class="btn btn-wide mt-2 w-full">Magazyn osobisty</a
			></li>
			<li><a
				href="/warehouse?f_responsiblePerson={personInfo.uid}"
				class="btn btn-wide mt-2 w-full">Przedmioty odpowiedzialne</a
			></li></ul></tr>
		{/if}
		</tbody>

	</table>
	<div class="grow mx-5 w-full self-start mb-5">
		<table class="table table-xs table-pin-rows items-baseline">
			<thead>
				<th colspan="100" class="text-center text-lg">Akcje</th>
				<tr>
					<th class="p-0 w-1" />
					<th>Nazwa</th>
					<th>Kod produktu</th>
					<th>Numer przedmiotu</th>
					<th>Data</th>
					<th>Typ</th>
				</tr>
			</thead>
			<tbody>
				{#if itemActions}
					{#each itemActions as action}
						<tr>
							<td class="{action_color[action.type]} p-0 w-[5px] min-w-[5px]" />
							<td><a href="/product/{action.item.product.name}">{action.item.product.name}</a></td>
							<td>{action.item.product.prod_code}</td>
							<td><a href="/item/{action.item.uid}">{action.item.id}</a></td>
							<td>{formatDate(action.date)}</td>
							<td>{action_types[action.type]}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
