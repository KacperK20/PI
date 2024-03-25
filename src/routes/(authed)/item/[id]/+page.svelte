<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import BackButton from '$lib/components/BackButton.svelte';
	import CameraButton from '$lib/components/CameraButton.svelte';
	import LabelPrintButton from '$lib/components/LabelPrintButton.svelte';
	import type { PageData } from './$types';
	import WhPath from '$lib/components/WHPath.svelte';
	import SelectPerson from '$lib/components/SelectPerson.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { onMount } from 'svelte';
	import SelectWithInput from '$lib/components/SelectWithInput.svelte';
	import { json } from '@sveltejs/kit';
	export let data: PageData;

	$: item = data.item;
	$: itemActions = data.itemActions;

	let attributeList: any = [];

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

	let states: any;

	onMount(async () => {
		attributeList = await getProductAtr(item.product.id);
		states = await getItemStatus();
		states[0].condition = '';
	});

	function formatDate(dateString: Date) {
		const date = new Date(dateString);
		const isoString = date.toISOString();
		const formattedString = isoString.replace('T', ' ').substring(0, 19);
		return formattedString;
	}

	function updateImage(base64Image: string) {
		fetch(`/api/item`, {
			method: 'PATCH',
			body: JSON.stringify({
				uid: item?.uid,
				image: base64Image
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((r) => {
				item.image = base64Image;
			})
			.catch((err) => console.error(err));
	}

	function imageResult(base64Data: any, geolocation: any) {
		updateImage(base64Data);
	}

	async function getProductAtr(productId) {
		const response = await fetch(`/api/attribute/value?productId=${productId}`);
		const results = await response.json();
		
		const extractedData = results.attributeValues.map((item) => ({
			value: item.value || '', // Assuming value is optional
			name: item.attribute && item.attribute.name ? item.attribute.name : '',
			attribute_uid: item.attribute && item.attribute.uid ? item.attribute.uid : '',
			product_uid: item.product && item.product.uid ? item.product.uid : '',
		}));
		return extractedData;
	}

	async function updateDesc(newDesc) {
		item.desc = newDesc;
		updateItem();
	}

	function updateItem() {
		fetch(`/api/item`, {
			method: 'PATCH',
			body: JSON.stringify({
				user: data.user.uid,
				item
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((r) => r.json())
			.then((r) => {
				invalidateAll();
			})
			.catch((err) => console.error(err));
	}

	function postResponsiblePersons() {
		fetch(`/api/item/responsiblePerson`, {
			method: 'POST',
			body: JSON.stringify({
				item_uid: item.uid,
				ResponsiblePerson: item.ResponsiblePerson
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((r) => r.json())
			.then((r) => {
				invalidateAll();
			})
			.catch((err) => console.error(err));
	}

	function deleteResponsiblePerson(person: any) {
		fetch(`/api/item/responsiblePerson`, {
			method: 'DELETE',
			body: JSON.stringify({
				item_uid: item.uid,
				person_uid: person.uid
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((r) => r.json())
			.then((r) => {
				invalidateAll();
			})
			.catch((err) => console.error(err));
	}

	async function getItemStatus() {
		const response = await fetch('/api/status');
		const data = await response.json();
		return data;
	}

	async function setItemStatus(id, value) {
		const response = await fetch('/api/status', {
			method: 'PATCH',
			body: JSON.stringify({
				id: id,
				condition: value,
				user: data.user.uid,
				item
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((r) => {
			invalidateAll();
		});
	}
	

	async function changeAtributeValue(value: string , attribute_uid: string , product_uid: string) {
		const response = await fetch('/api/attribute/value', {
			method: 'PATCH',
			body: JSON.stringify({
				value: value , 
				attribute_uid: attribute_uid , 
				product_uid: product_uid , 
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((r) => {
			
		});
	}
	let modal: any;
</script>

<BackButton />
<div class="flex overflow-x-auto items-baseline flex-wrap">
	<div class="grow mx-5 flex flex-col items-center mb-5 relative">
		<div class="absolute top-0 right-0 z-10">
			<LabelPrintButton
				barcode={item.product.prod_code}
				qrcode={item.uid}
				wh_name={item.wh.name}
				prod_name={(item.product.category ? item.product.category.name + ' ' : '') +
					item.product.name}
			/>
		</div>

		<table class="table table-xs">
			<thead>
				<th colspan="100" class="text-center text-lg">
					Przedmiot

					{#if !data.app_settings.application.disable_item_photo}
						<div class="h-28 w-28 flex items-center justify-center border mx-auto my-2">
							{#if item?.image}
								<img
									src={item?.image}
									alt={item?.product.name}
									width="100"
									height="100"
									class="object-scale-down h-28 w-28"
								/>
							{:else}
								<img
									class="object-scale-down h-28 w-28 auth-preview__image"
									src="https://st4.depositphotos.com/23594922/29747/v/450/depositphotos_297474190-stock-illustration-no-image-vector-illustration-isolated.jpg"
									alt="No image vector illustration isolated"
								/>
							{/if}
						</div>
						<div class="mt-2 mx-auto w-fit">
							<CameraButton {imageResult} small_btn={true} upload_btn={true} responsive={false} />
						</div>
					{:else}
						<div class="h-4" />
					{/if}
				</th>
			</thead>
			<tbody>
				<tr><th>Kategoria produktu</th> <td>{item?.product.category?.name ?? ''}</td> </tr>
				<tr><th>Nazwa produktu</th> <td>{item?.product.name}</td> </tr>
				<tr><th>Kod produktu</th> <td>{item?.product.prod_code}</td> </tr>
				<tr
					><th>Typ produktu</th>
					<td>
						<select
							bind:value={item.type}
							on:change={updateItem}
							class="select select-xs select-bordered w-full max-w-xs"
						>
							<option value={null}>Wybierz</option>
							<option value="Środek trwały">Środek trwały</option>
							<option value="Wyposażenie">Wyposażenie</option>
						</select>
					</td>
				</tr>
				<tr><th>UUID</th> <td>{item?.uid}</td> </tr>
				<tr>
					<th>Ilość</th> 
					<td>
						<input type="number" class="input input-xs input-bordered w-full" bind:value={item.amount} on:change={updateItem}>
					</td>
				</tr>
				<tr>
					<th>Jednostka</th>
					<td>{item.product.unit}</td>
				</tr>
				<tr
					><th>Stan</th>
					<td>
						{#if states}
							<SelectWithInput
								placeholder="Dodaj"
								class="input-xs"
								list={states.map((i) => i.condition ?? '')}
								value={item.condition ? item.condition : ''}
								addNewValueExternal={(event) => {
									setItemStatus(item.id, event);
								}}
								on:change={(event) => {
									setItemStatus(item.id, event.detail);
								}}
							/>
						{/if}</td
					>
				</tr>
				<tr><th>Dostępność</th> <td>{item?.status}</td> </tr>
				<tr><th>Firma</th> <td>{item.wh.comp.name}</td> </tr>
				<tr><th>Magazyn</th> <td><WhPath wh={item.wh} /></td></tr>
				<tr><th>Właściciel</th><td><WhPath wh={item.ownerWh} /></td></tr>
				<tr
					><th>Osoby odpowiedzialne:</th><td>
						{#each item.ResponsiblePerson as relation, n}
							<div
								class="pl-2 border bg-base-100 rounded-lg mb-1 flex justify-between items-center"
							>
								{relation.person.name}
								<button
									type="button"
									class="btn btn-xs"
									on:click={() => {
										deleteResponsiblePerson(relation.person);
									}}
								>
									<i>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="w-3 h-3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
											/>
										</svg>
									</i>
								</button>
							</div>
						{/each}

						<Modal
							bind:this={modal}
							buttonText="+"
							buttonIcon=""
							--overflow="visible"
							class="lg:btn-xs w-full overflow-auto"
						>

						<div class="form-control w-full m-0">
							<label class="label">
								<span class="label-text">Osoba</span>
							</label>
							<SelectPerson
								on:change={(event) => {
									if (!item.ResponsiblePerson.find((p) => p.person_id == event.detail.id)) {
										item.ResponsiblePerson.push({ person: event.detail });
									}
									postResponsiblePersons();
								}}
							/>
						</div>
						</Modal>
					</td></tr
				>
				<tr />
				<tr><th>Utworzony</th> <td>{formatDate(item?.createdAt)}</td> </tr>
				<tr><th>Zaktualizowany</th> <td>{formatDate(item?.updatedAt)}</td> </tr>
				<tr>
					<th>Opis</th>
					<td>
						<textarea class="textarea textarea-bordered w-full"
						value={item.desc}
						on:change={(event) => updateDesc(event.target.value)} placeholder="Wpisz tekst"></textarea>
					</td>
				</tr>

				{#await attributeList then product}
					{#await attributeList then resolvedList}
						{#each resolvedList as attribute}
							<tr>
								<th>{attribute.name}</th>
								<td>
									<input
									on:change={(event) => {
										changeAtributeValue( attribute.value ,attribute.attribute_uid , attribute.product_uid  );
									}}
									type="text"
									class="input input-bordered w-full input-xs"
									bind:value={attribute.value}
								/>
								</td>
							</tr>
						{/each}
					{/await}
				{/await}
			</tbody>
		</table>
	</div>
	<div class="grow mx-5 self-start mb-5">
		<table class="table table-xs table-pin-rows items-baseline">
			<thead>
				<th colspan="100" class="text-center text-lg">Akcje</th>
				<tr>
					<th class="p-0 w-1" />
					<th>Data</th>
					<th>Typ</th>
					<th>Firma</th>
					<th>Magazyn</th>
					<th>Użytkownik</th>
				</tr>
			</thead>
			<tbody>
				{#each itemActions as action}
					<tr>
						<td class="{action_color[action.type]} p-0 w-[5px] min-w-[5px]" />
						<td>{formatDate(action.date)}</td>
						<td>{action_types[action.type]}</td>
						<td>{data.companies.find((comp) => comp.id == action.wh.comp.id)?.name}</td>
						<td><a href="/warehouse?id={action.wh.id}">{action.wh.name}</a></td>
						<td>{action.user.person.name}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	td a:hover {
		text-decoration: underline;
	}
</style>
