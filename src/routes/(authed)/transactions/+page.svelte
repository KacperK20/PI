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
	let invoices: any = [];
	let caseInsensitive = true;
	let contractors: any;
	let products: { id: string; name: string; quantity: number; price: number }[] = [];
	onMount(async () => {
		invoices = await getinvoices(sort, dir, search);
		contractors = await getPersons();
		products = await getProducts();
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

	async function getProducts() {
		const result = await fetch('/api/product?');
		return await result.json();
	}

	let createinvoiceModal = {
		data: {
			title: '',
			createdAt: '',
			optional: '',
			dueTime: '',
			amount: 0,
			products: [] as { id: string; name: string; quantity: number; price: number }[],
			contractor: '',
			contractorid: ''
		},
		close: () => {
			document.querySelector('#add_invoice_modal')?.close();
			document.querySelector('#add_invoice_modal form')?.reset();
		}
	};

	let editinvoiceModal = {
		data: {
			id: '',
			title: '',
			createdAt: '',
			optional: '',
			dueTime: '',
			amount: '',
			products: [] as { id: string; product:  any; quantity: number; productId: string }[],
			contractor: '',
			contractorid: ''
		},
		close: () => {
			document.querySelector('#edit_invoice_modal')?.close();
			document.querySelector('#edit_invoice_modal form')?.reset();
		},
		error: ''
	};

	async function getinvoices(sort, dir, search) {
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
		const result = await fetch('/api/invoice?' + urlParams.toString());
		return await result.json();
	}

	async function setSearch(value: string) {
		search = value;
		invoices = await getinvoices(sort, dir, search);
	}

	async function setSort(header_name: string, sort_dir: sortType) {
		sort = header_name;
		dir = sort_dir;
		invoices = await getinvoices(sort, dir, search);
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

		invoices = await getinvoices(sort, dir, search);
	}

	async function deleteinvoice(invoiceId: any) {
		const response = await fetch(`/api/invoice`, {
			method: 'DELETE',
			body: JSON.stringify({
				invoiceId: invoiceId
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					invoices = await getinvoices(sort, dir, search);
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

	async function getProductsQuant(id: any) {
		const result = await fetch('/api/inventarisation?id=' + id);
		console.log(result)
		return await result.json();
	}

	async function editinvoice(
		title: string,
		id: string,
		optional: string,
		dueTime: string,
		amount: string,
		contractor: string,
		contractorid: string
	) {
		editinvoiceModal.data.id = id;
		editinvoiceModal.data.title = title;
		editinvoiceModal.data.optional = optional;
		editinvoiceModal.data.dueTime = dueTime;
		editinvoiceModal.data.amount = amount;
		editinvoiceModal.data.contractor = contractor;
		editinvoiceModal.data.contractorid = contractorid;
		editinvoiceModal.data.products = await getProductsQuant(id);
		edit_invoice_modal.open = true;
	}

	async function sendeditinvoice() {
		console.log(editinvoiceModal.data.products)
		fetch(`/api/invoice`, {
			method: 'PATCH',
			body: JSON.stringify({
				title: editinvoiceModal.data.title,
				invoiceId: editinvoiceModal.data.id,
				optional: editinvoiceModal.data.optional,
				dueTime: editinvoiceModal.data.dueTime,
				amount: editinvoiceModal.data.amount,
				contractor: editinvoiceModal.data.contractorid,
				products: editinvoiceModal.data.products
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r.ok) {
					invoices = await getinvoices(sort, dir, search);
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

		editinvoiceModal.close;
	}

	async function createNewinvoice() {
		createinvoiceModal.data.amount = 0 ;
		createinvoiceModal.data.products.forEach((product: any) => {
			createinvoiceModal.data.amount += Number(product.quantity) * Number(product.price);
			
		});

		await fetch(`/api/invoice`, {
			method: 'PUT',
			body: JSON.stringify({
				title: createinvoiceModal.data.title,
				optional: createinvoiceModal.data.optional,
				dueTime: createinvoiceModal.data.dueTime,
				amount: (createinvoiceModal.data.amount).toString(),
				products: createinvoiceModal.data.products,
				contractor: createinvoiceModal.data.contractorid
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r?.ok) {
					createinvoiceModal.close();
					createinvoiceModal.data.title = '';
					createinvoiceModal.data.optional = '';
					createinvoiceModal.data.dueTime = '';
					createinvoiceModal.data.amount = 0;
					createinvoiceModal.data.contractor = '';
					createinvoiceModal.data.products = [];
					createinvoiceModal.data.contractorid = '';
					invoices = await getinvoices(sort, dir, search);
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
	let edit_invoice_modal: any;

	console.log(contractors);
</script>

<BackButton />
<div class="flex justify-center">
	<Modal buttonText={'Dodaj transakcje'} buttonIcon={''} let:closeModal>
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
				bind:value={createinvoiceModal.data.title}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Opis</span>
			</label>
			<input
				bind:value={createinvoiceModal.data.optional}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<label class="label">
				<span class="label-text">Termin zapłaty</span>
			</label>
			<input
				bind:value={createinvoiceModal.data.dueTime}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/><label class="label">
				<span class="label-text">Kontrahent</span>
			</label>
			<SelectWithInput
				class="input-xs"
				list={contractors.map((i) => i.name)}
				value={createinvoiceModal.data.contractor ? createinvoiceModal.data.contractor : ''}
				addNewValueExternal={(name) => {
					createinvoiceModal.data.contractor = name;
					createinvoiceModal.data.contractorid = contractors.id;
				}}
				on:change={(event) => {
					createinvoiceModal.data.contractor = event.detail;
					const foundContractor = contractors.find((c) => c.name === event.detail);
					if (foundContractor) {
						createinvoiceModal.data.contractorid = foundContractor.id;
					} else {
						console.log('Contractor not found');
					}
				}}
			/>
			<label class="label">
				<span class="label-text">Przedmioty</span>
			</label>
			<SelectWithInput
				class="input-xs"
				list={products.map((i) => i.name)}
				value={editinvoiceModal.data.contractor ? editinvoiceModal.data.contractor : ''}
				on:change={(event) => {
					const foundContractor = products.find((c) => c.name === event.detail);
					if (foundContractor) {
						if (
							!createinvoiceModal.data.products.some((product) => product.id === foundContractor.id)
						) {
							createinvoiceModal.data.products.push({
								id: foundContractor.id,
								name: foundContractor.name,
								quantity: 1,
								price: foundContractor.price
							});
							createinvoiceModal.data.products = createinvoiceModal.data.products;
						}
					} else {
						console.log('Contractor not found');
					}
				}}
			/>
			{#if createinvoiceModal.data.products}
				{#each createinvoiceModal.data.products as product (product.id)}
					<label for="product_name" class="label">
						<span class="label-text">{product.name}</span>
						<input
							bind:value={product.quantity}
							id="product_name"
							type="number"
							placeholder="Ilość"
							class="input input-bordered w-1/4"
						/></label
					>
				{/each}
			{/if}

			<button type="submit" on:click={createNewinvoice} class="btn btn-wide mt-5 w-full"
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
		{#await invoices then invoicesList}
			<tbody>
				{#each invoicesList as invoice}
					<tr>
						<td><a href="/invoice/{invoice.id}">{invoice.id} </a></td><td
							>{#if invoice.title}{invoice.title}
							{:else}Brak
							{/if}</td
						>
						<td
							>{#if invoice.createdAt != null}{invoice.optional}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if invoice.optional != null}{new Date(invoice.createdAt).toLocaleDateString()}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if invoice.dueTime != null}{invoice.dueTime}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if invoice.amount != null}{invoice.amount}
							{:else}Brak
							{/if}
						</td>
						<td
							>{#if invoice.contractor}{invoice.contractor.name}
							{:else}Brak
							{/if}
						</td>
						<td class="flex space-x-2">
							<button
								class="btn btn-xs"
								>Opłacone
							</button>
						</td>
						<td>
							<a href={'file:///C:/inz/Magazyn-app/invoice' + invoice.id + '.pdf'} target="_blank"
								><button class="btn-xs btn">Otwórz</button></a
							>
						</td>
						<td class="flex space-x-2">
							<button
								class="btn btn-xs"
								on:click={() => {
									editinvoice(
										invoice.title,
										invoice.id,
										invoice.optional,
										invoice.dueTime,
										invoice.amount,
										invoice.contractor?.name,
										invoice.contractor?.id
									);
								}}
								>Edytuj
							</button>
							<button
								class="btn btn-xs"
								on:click={() => {
									deleteinvoice(invoice.id);
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
					invoices = await getinvoices(sort, dir, search);
				}
			}}>«</button
		>
		<button class="join-item btn">{skip}</button>
		<button
			class="join-item btn"
			on:click={async () => {
				++skip;
				invoices = await getinvoices(sort, dir, search);
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

<Modal buttonIcon="" buttonText="" class="hidden" bind:dialog={edit_invoice_modal}>
	<h3 class="font-bold text-lg">Edycja transakcji</h3>
	<button
		type="button"
		class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
		on:click={() => {
			edit_invoice_modal.open = false;
		}}>✕</button
	>
	<label class="label">
		<span class="label-text">Tytuł</span>
	</label>
	<input
		bind:value={editinvoiceModal.data.title}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Opis</span>
	</label>
	<input
		bind:value={editinvoiceModal.data.optional}
		type="text"
		placeholder="Wprowadź tekst"
		class="input input-bordered w-full"
	/>
	<label class="label">
		<span class="label-text">Termin zapłaty</span>
	</label>
	<input
		bind:value={editinvoiceModal.data.dueTime}
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
		value={editinvoiceModal.data.contractor ? editinvoiceModal.data.contractor : ''}
		addNewValueExternal={(name) => {
			editinvoiceModal.data.contractor = name;
			editinvoiceModal.data.contractorid = contractors.id;
		}}
		on:change={(event) => {
			editinvoiceModal.data.contractor = event.detail;
			const foundContractor = contractors.find((c) => c.name === event.detail);
			if (foundContractor) {
				editinvoiceModal.data.contractorid = foundContractor.id;
			} else {
				console.log('Contractor not found');
			}
		}}
	/>

	{#if editinvoiceModal.data.products}
		{#each editinvoiceModal.data.products as el }
			<label for="product_name" class="label">
				<span class="label-text">{el.product.name}</span>
				<input
					bind:value={el.quantity}
					id="product_name"
					type="number"
					placeholder="Ilość"
					class="input input-bordered w-1/4"
				/></label
			>
		{/each}
	{/if}

	<div class=" w-full flex-col">
		<button type="submit" on:click={sendeditinvoice} class="btn btn-wide mt-5 w-full">Zmień</button>
	</div>
</Modal>
