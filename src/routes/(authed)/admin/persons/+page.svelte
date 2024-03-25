<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import { onMount } from 'svelte';
	import { checkIfMobile } from '$lib/checkIfMobile';
	import type { Company } from '@prisma/client';
	import Modal from '$lib/components/Modal.svelte';
	import RadioGroup from '$lib/components/RadioGroup.svelte';
	import AlertBox from '$lib/components/AlertBox.svelte';
	import PageButton from '$lib/components/PageButton.svelte';

	export let data;
	let filters: string[] = [];
	let values = [];
	let sort: string;
	let dir: number;
	let search: string;
	let page: number = 0;
	let limit: number = 10;
	let persons: any = [];
	let errorMessage: string;
	let caseInsensitive = true;

	onMount(async () => {
		page=0 ; 
		persons = await getPersons(sort, dir, search);

		if (checkIfMobile()) {
			const elementHeightInPx = document.getElementsByClassName('table-content')[0].offsetHeight;
			limit = Math.floor((elementHeightInPx - 48 - 24.5) / 25);

			window.onresize = function () {
				const elementHeightInPx = document.getElementsByClassName('table-content')[0].offsetHeight;
				limit = Math.floor((elementHeightInPx - 48 - 24.5) / 25);
			};
		} else limit = limit;
	});

	enum sortType {
		ASC,
		DESC
	}

	let createPersonModal = {
		data: {
			name: '',
			email: '',
		},
		close: () => {
			document.querySelector('#add_person_modal')?.close();
			document.querySelector('#add_person_modal form')?.reset();
		}
	};

	let editCompanyModal = {
		data: {
			id: 0,
			name: '',
			email: ''
		},
		close: () => {
			document.querySelector('#edit_company_modal')?.close();
			document.querySelector('#edit_company_modal form')?.reset();
		},
		error: ''
	};

	async function getPersons(sort, dir, search) {
		var urlParams = new URLSearchParams('');
		if (sort) {
			urlParams.set('sort', sort);
			urlParams.set('dir', dir);
		}
		urlParams.set(`skip`, ((page)*limit).toString());
		urlParams.set(`limit`, limit.toString());
		urlParams.set(`case`, String(caseInsensitive));

		if (search) {
			urlParams.set('search', search);
		} else if (filters) {
			filters.forEach((filter, index) => {
				urlParams.set('f_' + filter, values[index]);
			});
		}
		const result = await fetch('/api/person?' + urlParams.toString());
		return await result.json();
	}

	async function setSearch(value: string) {
		search = value;
		persons = await getPersons(sort, dir, search);
	}

	async function setSort(header_name: string, sort_dir: sortType) {
		sort = header_name;
		dir = sort_dir;
		persons = await getPersons(sort, dir, search);
	}

	async function onCaseInsensitive() {
		if (caseInsensitive) caseInsensitive = false;
		else caseInsensitive = true;
	}


	async function setFilter(header_name: string, value: string) {
		let index = filters.indexOf(header_name);
		if (index === -1) {
			filters.push(header_name); // If not, add header_name to filters array
			values.push(value); // Add value to values array
		} else {
			if (value === '') {
				filters.splice(index, 1); // Remove the element at index from filters array
				values.splice(index, 1); // Remove the element at index from values array
			} else {
				values[index] = value; // If header_name is already in filters array and value is not empty, change the value at the corresponding index
			}
		}

		persons = await getPersons(sort, dir, search);
	}

	async function deletePerson(personId: any) {
		const response = await fetch(`/api/person`, {
			method: 'DELETE',
			body: JSON.stringify({
				personId: personId
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					persons = await getPersons(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie usuwanie osoby'
					};
				} else {
					showAlert = {
						type: 'error',
						message: 'Błąd przy usuwaniu osoby'
					};
				}
			})
			.catch(
				(err) =>
					(showAlert = {
						type: 'error',
						message: 'Błąd usuwania osoby'
					})
			);
	}

	async function editCompany(name: string, email: string, id: number) {
		editCompanyModal.data.id = id;
		editCompanyModal.data.name = name;
		editCompanyModal.data.email = email;
		edit_person_modal.open = true;
	}

	async function sendEditCompany() {
		fetch(`/api/person`, {
			method: 'PATCH',
			body: JSON.stringify({
				name: editCompanyModal.data.name,
				email: editCompanyModal.data.email,
				personId: editCompanyModal.data.id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					persons = await getPersons(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie zmodyfikowano osoby'
					};
				} else {
					showAlert = {
						type: 'error',
						message: 'Błąd przy modyfikacji osoby'
					};
				}
			})
			.catch(
				(err) =>
					(showAlert = {
						type: 'error',
						message: 'Błąd modyfikacji osoby'
					})
			);

		editCompanyModal.close;
	}

	async function createNewPerson() {
		await fetch(`/api/person`, {
			method: 'PUT',
			body: JSON.stringify({
				name: createPersonModal.data.name,
				email: createPersonModal.data.email
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r?.ok) {
					createPersonModal.close();
					createPersonModal.data.name = ''; // Reset name
					createPersonModal.data.email = ''; // Reset email
					persons = await getPersons(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie utworzono osoby'
					};
				} else {
					const result = await r.json();
					showAlert = {
						type: 'error',
						message: 'Błąd przy tworzeniu osoby'
					};
				}
			})
			.catch((err) => {
				showAlert = {
					type: 'error',
					message: 'Błąd  tworzenia osoby'
				};
			});
	}

	let ikona = `<i><svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="w-4 h-4"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
		/>
	</svg></i>`;



	let showAlert: any;
	let edit_person_modal: any;
</script>

<BackButton />
<div class="flex justify-center">
	<Modal buttonText={'Dodaj osobę'} buttonIcon={ikona} let:closeModal>
		<button
			type="button"
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			on:click={closeModal}>✕</button
		>
		<h3 class="font-bold text-lg">Utwórz osobę</h3>

		<div class=" w-full flex-col">
			<label class="label">
				<span class="label-text">Nazwa*</span>
			</label>
			<input
				bind:value={createPersonModal.data.name}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Email</span>
			</label>
			<input
				bind:value={createPersonModal.data.email}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<button type="submit" on:click={createNewPerson} class="btn btn-wide mt-5 w-full"
				>Utwórz</button
			>
		</div>
	</Modal>
</div>
<div class="m-4 text-center h-full">
	<TableComponent
		headers={[
			{ disp_name: 'Nazwa', name: 'name', sortable: true, filterable: true },
			{ disp_name: 'Email', name: 'email', sortable: true, filterable: true },
			{ disp_name: 'Użytkownik', name: 'user.username', sortable: true, filterable: true },
			{ name: 'buttonCol'},
			{ name: 'buttonCol'},
		]}
		{setFilter}
		{setSort}
		{setSearch}
		{onCaseInsensitive}
	>
		{#await persons then personsList}
			<tbody>
				{#each personsList as person}
					<tr>
						<td><a href="/person/{person.id}">{person.name} </a></td><td
							>{#if person.email}{person.email}
							{:else}Brak
							{/if}</td
						>
						<td
							>{#if person.user != null}{person.user.username}
							{:else}Brak
							{/if}
						</td><td class="flex space-x-2">
							<button
								class="btn btn-xs"
								on:click={() => {
									editCompany(person.name, person.email, person.id);
								}}
								>Edytuj
							</button>
							<button
								class="btn btn-xs"
								on:click={() => {
									deletePerson(person.id);
								}}
								><i
									><svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-4 h-4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
										/>
									</svg></i
								>
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		{/await}
	</TableComponent>
</div>

<PageButton bind:skip={page} on:change={() => persons = getPersons(sort, dir, search)} />

{#if showAlert}
	{#key showAlert}
		<div class="absolute bottom-0 left-0 mx-auto w-full p-2">
			<AlertBox type={showAlert.type} message={showAlert.message} />
		</div>
	{/key}
{/if}

<Modal buttonIcon="" buttonText="" class="hidden" bind:dialog={edit_person_modal}>
	<h3 class="font-bold text-lg">Edycja osoby</h3>
	<button
		type="button"
		class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
		on:click={() => {
			edit_person_modal.open = false;
		}}>✕</button
	>
	<label class="label">
		<span class="label-text">Nazwa osoby</span>
	</label>
	<input
		bind:value={editCompanyModal.data.name}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Email osoby</span>
	</label>
	<input
		bind:value={editCompanyModal.data.email}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<div class=" w-full flex-col">
		<button type="submit" on:click={sendEditCompany} class="btn btn-wide mt-5 w-full">Zmień</button>
	</div>
</Modal>
