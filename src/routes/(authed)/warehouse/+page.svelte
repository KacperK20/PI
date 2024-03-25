<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import { onMount } from 'svelte';
	import { checkIfMobile } from '$lib/checkIfMobile';
	import Modal from '$lib/components/Modal.svelte';
	import AlertBox from '$lib/components/AlertBox.svelte';
	import SelectWithInput from '$lib/components/SelectWithInput.svelte';

	export let data;
	let filters: string[] = [];
	let values = [];
	let sort: string;
	let dir: number;
	let search: string;
	let skip = 1;
	let limit: number = 10;
	let obligations: any = [];
	let caseInsensitive = true;
	let contractors;
	onMount(async () => {
		obligations = await getobligations(sort, dir, search);
		contractors = await getPersons();
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

	async function getPersons() {
		const result = await fetch('/api/contractor?');
		return await result.json();
	}

	let createobligationModal = {
		data: {
			title: '',
			createdAt: '',
			optional: '',
			dueTime: '',
			amount: '',
			invoicePath: '',
			contractor: '',
			contractorid: ''
		},
		close: () => {
			document.querySelector('#add_obligation_modal')?.close();
			document.querySelector('#add_obligation_modal form')?.reset();
		}
	};

	let editobligationModal = {
		data: {
			id: '',
			title: '',
			createdAt: '',
			optional: '',
			dueTime: '',
			amount: '',
			invoicePath: '',
			contractor: '',
			contractorid: ''
		},
		close: () => {
			document.querySelector('#edit_obligation_modal')?.close();
			document.querySelector('#edit_obligation_modal form')?.reset();
		},
		error: ''
	};

	async function getobligations(sort, dir, search) {
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
		const result = await fetch('/api/obligation?' + urlParams.toString());
		return await result.json();
	}

	async function setSearch(value: string) {
		search = value;
		obligations = await getobligations(sort, dir, search);
	}

	async function setSort(header_name: string, sort_dir: sortType) {
		sort = header_name;
		dir = sort_dir;
		obligations = await getobligations(sort, dir, search);
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

		obligations = await getobligations(sort, dir, search);
	}

	async function deleteobligation(obligationId: any) {
		const response = await fetch(`/api/obligation`, {
			method: 'DELETE',
			body: JSON.stringify({
				obligationId: obligationId
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					obligations = await getobligations(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie usuwanie zobowiązanie'
					};
				} else {
					showAlert = {
						type: 'error',
						message: 'Błąd przy usuwaniu zobowiązanie'
					};
				}
			})
			.catch(
				(err) =>
					(showAlert = {
						type: 'error',
						message: 'Błąd usuwania zobowiązanie'
					})
			);
	}

	async function editobligation(
		title: string,
		id: string,
		optional: string,
		dueTime: string,
		amount: string,
		path: string,
		contractor: string,
		contractorid: string
	) {
		editobligationModal.data.id = id;
		editobligationModal.data.title = title;
		editobligationModal.data.optional = optional;
		editobligationModal.data.dueTime = dueTime;
		editobligationModal.data.amount = amount;
		editobligationModal.data.invoicePath = path;
		editobligationModal.data.contractor = contractor;
		editobligationModal.data.contractorid = contractorid;
		edit_obligation_modal.open = true;
	}

	async function sendeditobligation() {
		fetch(`/api/obligation`, {
			method: 'PATCH',
			body: JSON.stringify({
				title: editobligationModal.data.title,
				obligationId: editobligationModal.data.id,
				optional: editobligationModal.data.optional,
				dueTime: editobligationModal.data.dueTime,
				invoicePath: editobligationModal.data.invoicePath,
				amount: editobligationModal.data.amount,
				contractor: editobligationModal.data.contractorid
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					obligations = await getobligations(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie zmodyfikowano zobowiązanie'
					};
				} else {
					showAlert = {
						type: 'error',
						message: 'Błąd przy modyfikacji zobowiązanie'
					};
				}
			})
			.catch(
				(err) =>
					(showAlert = {
						type: 'error',
						message: 'Błąd modyfikacji zobowiązanie'
					})
			);

		editobligationModal.close;
	}

	async function createNewobligation() {
		await fetch(`/api/obligation`, {
			method: 'PUT',
			body: JSON.stringify({
				title: createobligationModal.data.title,
				optional: createobligationModal.data.optional,
				dueTime: createobligationModal.data.dueTime,
				invoicePath: createobligationModal.data.invoicePath,
				amount: createobligationModal.data.amount,
				contractor: createobligationModal.data.contractorid
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r?.ok) {
					createobligationModal.close();
					createobligationModal.data.title = '';
					createobligationModal.data.optional = '';
					createobligationModal.data.dueTime = '';
					createobligationModal.data.amount = '';
					createobligationModal.data.contractor = '';
					createobligationModal.data.invoicePath = '';
					createobligationModal.data.contractorid = '';
					obligations = await getobligations(sort, dir, search);
					showAlert = {
						type: 'success',
						message: 'Pomyślnie utworzono zobowiązanie'
					};
				} else {
					const result = await r.json();
					showAlert = {
						type: 'error',
						message: 'Błąd przy tworzeniu zobowiązanie'
					};
				}
			})
			.catch((err) => {
				showAlert = {
					type: 'error',
					message: 'Błąd  tworzenia zobowiązanie'
				};
			});
	}

	let showAlert: any;
	let edit_obligation_modal: any;
</script>

<BackButton />
<div class="flex justify-center">
	<Modal buttonText={'Dodaj zobowiązanie'} buttonIcon={''} let:closeModal>
		<button
			type="button"
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			on:click={closeModal}>✕</button
		>
		<h3 class="font-bold text-lg">Utwórz zobowiązanie</h3>

		<div class=" w-full flex-col">
			<label class="label">
				<span class="label-text">Tytuł</span>
			</label>
			<input
				bind:value={createobligationModal.data.title}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Opis</span>
			</label>
			<input
				bind:value={createobligationModal.data.optional}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Termin zapłaty</span>
			</label>
			<input
				bind:value={createobligationModal.data.dueTime}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Ilość</span>
			</label>
			<input
				bind:value={createobligationModal.data.amount}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Faktura</span>
			</label>
			<input
				bind:value={createobligationModal.data.invoicePath}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Kontrahent</span>
			</label>
			<SelectWithInput
				class="input-xs"
				list={contractors.map((i) => i.name)}
				value={createobligationModal.data.contractor ? createobligationModal.data.contractor : ''}
				addNewValueExternal={(name) => {
					createobligationModal.data.contractor = name;
					createobligationModal.data.contractorid = contractors.id;
				}}
				on:change={(event) => {
					createobligationModal.data.contractor = event.detail;
					const foundContractor = contractors.find((c) => c.name === event.detail);
					if (foundContractor) {
						createobligationModal.data.contractorid = foundContractor.id;
					} else {
						console.log('Contractor not found');
					}
				}}
			/>

			<button type="submit" on:click={createNewobligation} class="btn btn-wide mt-5 w-full"
				>Utwórz</button
			>
		</div>
	</Modal>
</div>
<div class="m-4 text-center">
	<TableComponent
		headers={[
			{ disp_name: 'ID', name: 'ID', sortable: false, filterable: false },
			{ disp_name: 'Tytuł', name: 'title', sortable: true, filterable: true },
			{ disp_name: 'Opis', name: 'optional', sortable: true, filterable: true },
			{ disp_name: 'Data utworzenia', name: 'createdAt', sortable: false, filterable: false },
			{ disp_name: 'Termin zapłaty', name: 'dueTime', sortable: true, filterable: true },
			{ disp_name: 'Kwota', name: 'amount', sortable: true, filterable: true },
			{ disp_name: 'Kontraktor', name: 'contractor', sortable: true, filterable: true },
			{ disp_name: 'Status', name: 'invoice', sortable: false, filterable: false },
			{ disp_name: 'Faktura', name: 'invoice', sortable: false, filterable: false },
			{ name: 'buttonCol' },
			{ name: 'buttonCol' }
		]}
		{setFilter}
		{setSort}
		{setSearch}
		{onCaseInsensitive}
	>
		{#await obligations then obligationsList}
			<tbody>
				{#each obligationsList as obligation}
					<tr>
						<td><a href="/obligation/{obligation.id}">{obligation.id} </a></td><td
							>{#if obligation.title}{obligation.title}
							{:else}Brak
							{/if}</td
						>
						<td
							>{#if obligation.createdAt != null}{obligation.optional}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if obligation.optional != null}{new Date(
									obligation.createdAt
								).toLocaleDateString()}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if obligation.dueTime != null}{obligation.dueTime}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if obligation.amount != null}{obligation.amount}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if obligation.contractor}{obligation.contractor.name}
							{:else}Brak
							{/if}
						</td>
						<td class="flex space-x-2">
							<button
								class="btn btn-xs"
								>Opłacone
							</button>
						<td
							>{#if obligation.invoicePath}
								<a href={obligation.invoicePath} target="_blank"><button class="btn-xs btn">Otwórz</button></a>
							{:else}
								Brak
							{/if}
						</td>

						<td class="flex space-x-2">
							<button
								class="btn btn-xs"
								on:click={() => {
									editobligation(
										obligation.title,
										obligation.id,
										obligation.optional,
										obligation.dueTime,
										obligation.amount,
										obligation.path,
										obligation.contractor?.name,
										obligation.contractor?.id
									);
								}}
								>Edytuj
							</button>
							<button
								class="btn btn-xs"
								on:click={() => {
									deleteobligation(obligation.id);
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
									<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
					obligations = await getobligations(sort, dir, search);
				}
			}}>«</button
		>
		<button class="join-item btn">{skip}</button>
		<button
			class="join-item btn"
			on:click={async () => {
				++skip;
				obligations = await getobligations(sort, dir, search);
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

<Modal buttonIcon="" buttonText="" class="hidden" bind:dialog={edit_obligation_modal}>
	<h3 class="font-bold text-lg">Edycja zobowiązanie</h3>
	<button
		type="button"
		class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
		on:click={() => {
			edit_obligation_modal.open = false;
		}}>✕</button
	>
	<label class="label">
		<span class="label-text">Tytuł</span>
	</label>
	<input
		bind:value={editobligationModal.data.title}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Opis</span>
	</label>
	<input
		bind:value={editobligationModal.data.optional}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Termin zapłaty</span>
	</label>
	<input
		bind:value={editobligationModal.data.dueTime}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Ilość</span>
	</label>
	<input
		bind:value={editobligationModal.data.amount}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Faktura</span>
	</label>
	<input
		bind:value={editobligationModal.data.invoicePath}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Kontrahent</span>
	</label>

	<SelectWithInput
		class="input-xs"
		list={contractors.map((i) => i.name)}
		value={editobligationModal.data.contractor ? editobligationModal.data.contractor : ''}
		addNewValueExternal={(name) => {
			editobligationModal.data.contractor = name;
			editobligationModal.data.contractorid = contractors.id;
		}}
		on:change={(event) => {
			editobligationModal.data.contractor = event.detail;
			const foundContractor = contractors.find((c) => c.name === event.detail);
			if (foundContractor) {
				editobligationModal.data.contractorid = foundContractor.id;
			} else {
				console.log('Contractor not found');
			}
		}}
	/>

	<div class=" w-full flex-col">
		<button type="submit" on:click={sendeditobligation} class="btn btn-wide mt-5 w-full"
			>Zmień</button
		>
	</div>
</Modal>
