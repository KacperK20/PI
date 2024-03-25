<script lang="ts">

	import BackButton from '$lib/components/BackButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import { onMount } from 'svelte';
	import { checkIfMobile } from '$lib/checkIfMobile';
	import Modal from '$lib/components/Modal.svelte';
	import AlertBox from '$lib/components/AlertBox.svelte';

	export let data;
	let filters: string[] = [];
	let values = [];
	let sort: string;
	let dir: number;
	let search: string;
	let skip = 1;
	let limit: number = 10;
	let contractors: any = [];
	let caseInsensitive = true;

	onMount(async () => {
		contractors = await getcontractors(sort, dir, search);

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

	let createcontractorModal = {
		data: {
			name: '',
			email: '',
			NIP: '',
			account: '',
			phone: '',
			cod: '',
			city: '',
			street: ''
		},
		close: () => {
			document.querySelector('#add_contractor_modal')?.close();
			document.querySelector('#add_contractor_modal form')?.reset();
		}
	};

	let editcontractorModal = {
		data: {
			id: 0,
			name: '',
			email: '',
			NIP: '',
			account: '',
			phone: '',
			cod: '',
			city: '',
			street: ''
		},
		close: () => {
			document.querySelector('#edit_contractor_modal')?.close();
			document.querySelector('#edit_contractor_modal form')?.reset();
		},
		error: ''
	};

	async function getcontractors(sort, dir, search) {
		var urlParams = new URLSearchParams('');
		if (sort) {
			urlParams.set('sort', sort);
			urlParams.set('dir', dir);
		}
		urlParams.set(`skip`, skip.toString());
		urlParams.set(`limit`, limit.toString());
		urlParams.set(`case`, String(caseInsensitive));

		if (search) {
			urlParams.set('search', search);
		} else if (filters) {
			filters.forEach((filter, index) => {
				urlParams.set('f_' + filter, values[index]);
			});
		}
		const result = await fetch('/api/contractor?' + urlParams.toString());
		return await result.json();
	}

	async function setSearch(value: string) {
		search = value;
		contractors = await getcontractors(sort, dir, search);
	}

	async function setSort(header_name: string, sort_dir: sortType) {
		sort = header_name;
		dir = sort_dir;
		contractors = await getcontractors(sort, dir, search);
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

		contractors = await getcontractors(sort, dir, search);
	}

	async function deletecontractor(contractorId: any) {
		console.log(contractorId);
		const response = await fetch(`/api/contractor`, {
			method: 'DELETE',
			body: JSON.stringify({
				contractorId: contractorId	
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					contractors = await getcontractors(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie usuwanie kontrahenta'
					};
				} else {
					showAlert = {
						type: 'error',
						message: 'Błąd przy usuwaniu kontrahenta'
					};
				}
			})
			.catch(
				(err) =>
					(showAlert = {
						type: 'error',
						message: 'Błąd usuwania kontrahenta'
					})
			);
	}

	async function editcontractor(
		name: string,
		email: string,
		id: number,
		NIP: string,
		account: string,
		phone: string,
		cod: string,
		city: string,
		street: string
	) {
		editcontractorModal.data.id = id;
		editcontractorModal.data.name = name;
		editcontractorModal.data.email = email;
		editcontractorModal.data.NIP = NIP;
		editcontractorModal.data.account = account;
		editcontractorModal.data.phone = phone;
		editcontractorModal.data.cod = cod;
		editcontractorModal.data.city = city;
		editcontractorModal.data.street = street;
		edit_contractor_modal.open = true;
	}

	async function sendeditcontractor() {
		fetch(`/api/contractor`, {
			method: 'PATCH',
			body: JSON.stringify({
				name: editcontractorModal.data.name,
				email: editcontractorModal.data.email,
				contractorId: editcontractorModal.data.id,
				NIP: editcontractorModal.data.NIP,
				account: editcontractorModal.data.account,
				phone: editcontractorModal.data.phone,
				cod: editcontractorModal.data.cod,
				city: editcontractorModal.data.city,
				street: editcontractorModal.data.street
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					contractors = await getcontractors(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie zmodyfikowano kontrahenta'
					};
				} else {
					showAlert = {
						type: 'error',
						message: 'Błąd przy modyfikacji kontrahenta'
					};
				}
			})
			.catch(
				(err) =>
					(showAlert = {
						type: 'error',
						message: 'Błąd modyfikacji kontrahenta'
					})
			);

		editcontractorModal.close;
	}

	async function createNewcontractor() {	
		await fetch(`/api/contractor`, {
			method: 'PUT',
			body: JSON.stringify({
				name: createcontractorModal.data.name,
				email: createcontractorModal.data.email,
				NIP: createcontractorModal.data.NIP,
				account: createcontractorModal.data.account,
				phone: createcontractorModal.data.phone,
				cod: createcontractorModal.data.cod,
				city: createcontractorModal.data.city,
				street: createcontractorModal.data.street
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r?.ok) {
					createcontractorModal.close();
					contractors = await getcontractors(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie utworzono kontrahenta'
					};
				} else {
					const result = await r.json();
					showAlert = {
						type: 'error',
						message: 'Błąd przy tworzeniu kontrahenta'
					};
				}
			})
			.catch((err) => {
				showAlert = {
					type: 'error',
					message: 'Błąd  tworzenia kontrahenta'
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
	let edit_contractor_modal: any;
</script>
a
<BackButton />
<div class="flex justify-center">
	<Modal buttonText={'Dodaj kontrahenta'} buttonIcon={ikona} let:closeModal>
		<button
			type="button"
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			on:click={closeModal}>✕</button
		>
		<h3 class="font-bold text-lg">Utwórz kontrahenta</h3>

		<div class=" w-full flex-col">
			<label class="label">
				<span class="label-text">Nazwa*</span>
			</label>
			<input
				bind:value={createcontractorModal.data.name}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Email</span>
			</label>
			<input
				bind:value={createcontractorModal.data.email}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">NIP</span>
			</label>
			<input
				bind:value={createcontractorModal.data.NIP}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Nr. konta</span>
			</label>
			<input
				bind:value={createcontractorModal.data.account}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Nr. telefonu</span>
			</label>
			<input
				bind:value={createcontractorModal.data.phone}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Kod pocztowy</span>
			</label>
			<input
				bind:value={createcontractorModal.data.cod}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Miasto</span>
			</label>
			<input
				bind:value={createcontractorModal.data.city}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Ulica</span>
			</label>
			<input
				bind:value={createcontractorModal.data.street}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>

			<button type="submit" on:click={createNewcontractor} class="btn btn-wide mt-5 w-full"
				>Utwórz</button
			>
		</div>
	</Modal>
</div>
<div class="m-4 text-center">
	<TableComponent
		headers={[
			{ disp_name: 'Nazwa', name: 'name', sortable: true, filterable: true },
			{ disp_name: 'Email', name: 'email', sortable: true, filterable: true },
			{ disp_name: 'NIP', name: 'NIP', sortable: true, filterable: true },
			{ disp_name: 'Nr. Konta', name: 'account', sortable: true, filterable: true },
			{ disp_name: 'Telefon', name: 'phone', sortable: true, filterable: true },
			{ disp_name: 'Kod pocztowy', name: 'cod', sortable: true, filterable: true },
			{ disp_name: 'Miasto', name: 'city', sortable: true, filterable: true },
			{ disp_name: 'Ulica', name: 'street', sortable: true, filterable: true },
			{ name: 'buttonCol' },
			{ name: 'buttonCol' }
		]}
		{setFilter}
		{setSort}
		{setSearch}
		{onCaseInsensitive}
	>
		{#await contractors then contractorsList}
			<tbody>
				{#each contractorsList as contractor}
					<tr>
						<td><a href="/contractor/{contractor.id}">{contractor.name} </a></td><td
							>{#if contractor.email}{contractor.email}
							{:else}Brak
							{/if}</td
						>
						<td
							>{#if contractor.NIP != null}{contractor.NIP}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if contractor.account != null}{contractor.account}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if contractor.phone != null}{contractor.phone}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if contractor.NIP != null}{contractor.cod}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if contractor.account != null}{contractor.city}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if contractor.phone != null}{contractor.street}
							{:else}Brak
							{/if}
						</td>

						<td class="flex space-x-2">
							<button
								class="btn btn-xs"
								on:click={() => {
									editcontractor(
										contractor.name,
										contractor.email,
										contractor.id,
										contractor.NIP,
										contractor.account,
										contractor.phone,
										contractor.cod,
										contractor.city,
										contractor.street
									);
								}}
								>Edytuj
							</button>
							<button
								class="btn btn-xs"
								on:click={() => {
								
									deletecontractor(contractor.id);
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
	<div class="join">
		<button
			class="join-item btn"
			on:click={async () => {
				if (skip != 1) {
					--skip;
					contractors = await getcontractors(sort, dir, search);
				}
			}}>«</button
		>
		<button class="join-item btn">{skip}</button>
		<button
			class="join-item btn"
			on:click={async () => {
				++skip;
				contractors = await getcontractors(sort, dir, search);
			}}>»</button
		>
	</div>
</div>

{#if showAlert}
	{#key showAlert}
		<div class="absolute bottom-0 left-0 mx-auto w-full p-2">
			<AlertBox type={showAlert.type} message={showAlert.message} />
		</div>
	{/key}
{/if}

<Modal buttonIcon="" buttonText="" class="hidden" bind:dialog={edit_contractor_modal}>
	<h3 class="font-bold text-lg">Edycja kontrahenta</h3>
	<button
		type="button"
		class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
		on:click={() => {
			edit_contractor_modal.open = false;
		}}>✕</button
	>
	<label class="label">
		<span class="label-text">Nazwa</span>
	</label>
	<input
		bind:value={editcontractorModal.data.name}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Email</span>
	</label>
	<input
		bind:value={editcontractorModal.data.email}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">NIP</span>
	</label>
	<input
		bind:value={editcontractorModal.data.NIP}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Nr. konta</span>
	</label>
	<input
		bind:value={editcontractorModal.data.account}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Nr. telefonu</span>
	</label>
	<input
		bind:value={editcontractorModal.data.phone}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Kod pocztowy</span>
	</label>
	<input
		bind:value={editcontractorModal.data.cod}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Miasto</span>
	</label>
	<input
		bind:value={editcontractorModal.data.city}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Ulica</span>
	</label>
	<input
		bind:value={editcontractorModal.data.street}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<div class=" w-full flex-col">
		<button type="submit" on:click={sendeditcontractor} class="btn btn-wide mt-5 w-full"
			>Zmień</button
		>
	</div>
</Modal>
