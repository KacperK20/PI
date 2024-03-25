<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import type { PageData } from './$types';
	import Modal from '$lib/components/Modal.svelte';
	import AlertBox from '$lib/components/AlertBox.svelte';

	let filters: any = [];
	let values: any = [];
	let sort: string;
	let dir: number;
	let search: string;
	let skip = 1;
	let limit = 10;
	let caseInsensitive = true;
	let showAlert: any;
	let errorMessage: string;

	enum sortType {
		ASC,
		DESC
	}

	let createProductCategoryModal = {
		data: {
			name: ''
		},
		close: () => {
			document.querySelector('#add_productCategory_modal')?.close();
			document.querySelector('#add_productCategory_modal form')?.reset();
		}
	};

	export let data: PageData;
	async function getCategories(sort, dir, search) {
		var urlParams = new URLSearchParams('');
		if (sort) {
			urlParams.set('sort', sort);
			urlParams.set('dir', dir);
		}
		urlParams.set(`case`, String(caseInsensitive));
		urlParams.set(`page`, skip);
		urlParams.set(`limit`, limit);
		sortData;
		if (search) {
			urlParams.set('search', search);
		} else if (filters) {
			(filters, values).forEach((filter, index) => {
				urlParams.set('f_' + filters[index], values[index]);
			});
		}

		const result = await fetch('/api/product/category?' + urlParams.toString());

		return await result.json();
	}

	async function sortData(header: string, sort: string) {
		data.categories = await getCategories(sort, dir, search);
	}

	async function setSearch(value: string) {
		search = value;
		data.categories = await getCategories(sort, dir, search);
	}

	async function setSort(header_name: string, sort_dir: sortType) {
		sort = header_name;
		dir = sort_dir;

		data.categories = await getCategories(sort, dir, search);
	}

	async function onCaseInsensitive() {
		if (caseInsensitive) caseInsensitive = false;
		else caseInsensitive = true;
	}

	async function setFilter(header_name: string, value: string) {
		search = undefined;
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
		data.categories = await getCategories(sort, dir, search);
		// Ensure values array is of the same length as filters array
		while (values.length < filters.length) {
			values.push(null);
		}
		while (values.length > filters.length) {
			values.pop();
		}
	}

	async function addCategory() {
		if (createProductCategoryModal.data.name) {
			fetch(`/api/product/category`, {
				method: 'PUT',
				body: JSON.stringify({
					name: createProductCategoryModal.data.name
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(async (r) => {
					if (r?.ok) {
						data.categories = await getCategories(sort, dir, search);
						createProductCategoryModal.close();
						showAlert = {
							type: 'success',
							message: 'Brak danych'
						};
					} else {
						showAlert = {
							type: 'error',
							message: 'Bład dodawania'
						};
					}
				})
				.catch((err) => {
					showAlert = {
						type: 'error',
						message: err
					};
				});
		} else {
			showAlert = {
				type: 'error',
				message: 'Brak danych'
			};
		}
	}

	async function deleteCategory(id: number) {
		fetch(`/api/product/category`, {
			method: 'DELETE',
			body: JSON.stringify({
				id: id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r?.ok) {
					showAlert = {
						type: 'success',
						message: 'Poprawnie usunięto kategorię'
					};
					data.categories = await getCategories(sort, dir, search);
				} else {
					showAlert = {
						type: 'error',
						message: 'Bład usuwania kategori'
					};
				}
			})
			.catch((err) => {
				showAlert = {
					type: 'error',
					message: err
				};
			});
	}

	let createProductStateModal = {
		data: {
			name: ''
		},
		close: () => {
			document.querySelector('#add_productCategory_modal')?.close();
			document.querySelector('#add_productCategory_modal form')?.reset();
		}
	};

	async function onCaseInsensitive2() {
		if (caseInsensitive) caseInsensitive = false;
		else caseInsensitive = true;
	}


	
</script>

<BackButton />
<div class="flex justify-center w-full m-2">
	<div class="flex float-left">
		<Modal buttonText={'Dodaj kategorie'} buttonIcon={''} let:closeModal>
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				on:click={closeModal}>✕</button
			>
			<h3 class="font-bold text-lg">Kategorie produktu</h3>
			<div class="form-control w-fit max-w-xs m-2">
				<div class=" w-full flex-col">
					<label class="label">
						<span class="label-text">Nazwa kategori</span>
					</label>
					<input
						bind:value={createProductCategoryModal.data.name}
						type="text"
						placeholder="Wprowadź tekst"
						class="input input-bordered w-full max-w-xs"
					/>
					<button type="button" on:click={addCategory} class="btn btn-wide mt-5 w-full"
						>Utwórz</button
					>
				</div>
			</div>
		</Modal>
	</div>
</div>
<div class="flex float-left justify-center w-full">
	<div class=" m-2 text-center w-full">
		<TableComponent
			headers={[
				{ disp_name: 'Id', name: 'id', sortable: false, filterable: false },
				{ disp_name: 'Kategoria', name: 'name', sortable: true, filterable: true },
				{ name: 'buttonCol'}
			]}
			{setFilter}
			{setSort}
			{setSearch}
			{onCaseInsensitive}
		>
			{#await data.categories then categories}
				<tbody>
					{#each categories as category}
						<tr
							><td>{category.id}</td><td>{category.name}</td>
							<td>
								<button
									class="btn btn-sm"
									on:click={() => {
										deleteCategory(category.id);
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
												d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
											/>
										</svg></i
									>
								</button></td
							>
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
						data.categories = await getCategories(sort, dir, search);
					}
				}}>«</button
			>
			<button class="join-item btn">{skip}</button>
			<button
				class="join-item btn"
				on:click={async () => {
					++skip;
					data.categories = await getCategories(sort, dir, search);
				}}>»</button
			>
		</div>
	</div>
</div>

{#if showAlert}
	{#key showAlert}
		<div class="w-full pt-4">
			<AlertBox type={showAlert.type} message={showAlert.message} />
		</div>
	{/key}
{/if}
