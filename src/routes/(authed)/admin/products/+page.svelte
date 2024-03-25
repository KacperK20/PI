<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import type { Product, ProductCategory } from '@prisma/client';
	import BackButton from '$lib/components/BackButton.svelte';
	import { writable } from 'svelte/store';
	import { checkIfMobile } from '$lib/checkIfMobile';
	import LabelPrintButton from '$lib/components/LabelPrintButton.svelte';
	import SelectWithInput from '$lib/components/SelectWithInput.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';

	export let data: PageData;
	let price;
	let errorMessage: string;
	let showAlert = false;
	let showConfirmation = false;
	let productImage = writable({});
	let imageResult = writable(null);
	let sort: string;
	let dir: number;
	let search: string;
	let skip = 1;
	let limit: number = 10;
	let filters: string[] = [];
	let values = [];
	let caseInsensitive = true;

	async function getProducts(sort, dir, search) {
		var urlParams = new URLSearchParams('');
		if (sort) {
			urlParams.set('sort', sort);
			urlParams.set('dir', dir);
		}

		urlParams.set(`case`, String(caseInsensitive));

		urlParams.set(`page`, skip);
		urlParams.set(`limit`, limit);
		if (search) {
			urlParams.set('search', search);
		} else if (filters) {
			filters.forEach((filter, index) => {
				urlParams.set('f_' + filter, values[index]);
			});
		}

		const response = await fetch('/api/product?' + urlParams.toString());
		const results: Product[] = await response.json();
		return results;
	}

	function errorMsg(err) {
		errorMessage = err;
		showAlert = true;
		setTimeout(() => {
			showAlert = false;
		}, 2000);
	}

	function acceptMsg(err) {
		errorMessage = err;
		showConfirmation = true;
		setTimeout(() => {
			showConfirmation = false;
		}, 2000);
	}

	async function deleteProduct(name) {
		try {
			const response = await fetch(`/api/product`, {
				method: 'DELETE',
				body: JSON.stringify({
					name: name
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (response?.ok) {
				const result = await response.json();
				acceptMsg('Pomyślnie usunięto');
				prodList = getProducts(sort, dir, search);
			} else {
				const result = await response.json();
				errorMsg('Niepowodzenie usuwania');
			}
		} catch (error) {
			errorMsg('Bład usuwania (Możliwe powiązania)');
		}
	}

	async function generateAndCreateProduct() {
		const generatedQR = await genRandom(inputQRcode);
		createNewProduct(inputName, generatedQR, price);
	}

	async function genRandom(qr) {
		if (!qr) {
			qr = Math.floor(Math.random() * 1000000000000)
				.toString()
				.padStart(13, '0');
		}
		const response = await fetch(`/api/product/name?prod_code=${qr}`);
		const data = await response.json();
		if (data) {
			return genRandom(qr); // Call the function recursively until a unique QR code is generated
		} else {
			return qr;
		}
	}

	async function createNewProduct(name, qr, price) {
		genRandom(qr);
		if (name != '') {
			fetch(`/api/product`, {
				method: 'PUT',
				body: JSON.stringify({
					name: name,
					prod_code: qr,
					prod_price: price
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(async (r) => {
					if (!r.ok) {
						const result = await r.json();
						errorMsg('Niepowodzenie dodawania');
					} else {
						prodList = getProducts(sort, dir, search);
						acceptMsg('Pomyślnie dodano');
					}
				})
				.catch((err) => {
					errorMsg('Bład dodawania');
				});
		}
	}

	function check(name, code) {
		return function (event) {
			if (event.target.checked) {
				checkedItems.push([name, code, 1]);
			} else {
				checkedItems = checkedItems.filter((item) => !(item[0] === name && item[1] === code));
			}
			checkedItems = checkedItems.slice();
		};
	}

	async function handleFileChange(event, name) {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64Data = reader.result;
			let image = base64Data as string;

			productImage.update((image) => {
				image[selectedProductId] = base64Data;
				return image;
			});

			fetch(`/api/product`, {
				method: 'PATCH',
				body: JSON.stringify({
					image: image,
					name: name
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(async (r) => {
					console.log(r);
					acceptMsg('Pomyślnie zmodyfikowano');
				})
				.catch((err) => errorMsg('Bład modyfikacji'));
		};

		reader.readAsDataURL(file);
	}

	async function setProductCategory(id: number, name: string) {
		const response = await fetch('/api/product/category', {
			method: 'PATCH',
			body: JSON.stringify({
				id: id,
				name: name
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (!r.ok) {
					errorMsg('Niepowodzenie zmiany');
				} else {
					acceptMsg('Pomyślnie zmieniono');
				}
			})
			.catch((err) => {
				errorMsg('Bład podczas zmian');
			});
	}

	async function getProductsCategories() {
		const response = await fetch('/api/product/category');
		const results: ProductCategory[] = await response.json();
		return results;
	}

	async function addNewProductCategory(name: string, prod_id: number) {
		try {
			const response = await fetch('/api/product/category', {
				method: 'PUT',
				body: JSON.stringify({
					name: name
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			await setProductCategory(prod_id, name);

			prodList = getProducts(sort, dir, search);
			acceptMsg('Pomyślnie dodano kategorie');
			return response;
		} catch (error) {
			errorMsg('Bład dodawania kategori');
		}
	}

	onMount(async () => {
		categories = await getProductsCategories();
	});

	let inputName = '';
	let inputQRcode = '';
	let prodList = getProducts(sort, dir, search);
	let categories: any;
	let checkedItems: any = [];
	let selectedProductName: string;
	let selectedProductId: number;

	let createProductAttributeModal = {
		data: {
			name: '',
			productId: 1
		},
		close: () => {
			document.querySelector('#add_productAttribute_modal')?.close();
			document.querySelector('#add_productAttribute_modal form')?.reset();
		}
	};

	let createProductGlobalAttributeModal = {
		data: {
			name: ''
		},
		close: () => {
			document.querySelector('#add_productGlobalAttribute_modal')?.close();
			document.querySelector('#add_productGlobalAttribute_modal form')?.reset();
		}
	};

	async function addAttribute(value) {
		fetch(`/api/attribute`, {
			method: 'PUT',
			body: JSON.stringify({
				name: value,
				global: false,
				product_id: createProductAttributeModal.data.productId
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (!r.ok) {
					const result = await r.json();
					errorMsg('Niepowodzenie dodawania');
				} else {
					prodList = getProducts(sort, dir, search);
					attributeList = getProductAtribute(createProductAttributeModal.data.productId);
					acceptMsg('Pomyślnie dodano');
				}
			})
			.catch((r) => errorMsg('Bład dodawania atrybutu'));
	}

	async function addGlobalAttribute() {
		await fetch(`/api/attribute/global`, {
			method: 'PUT',
			body: JSON.stringify({
				name: createProductGlobalAttributeModal.data.name,
				global: true
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (!r.ok) {
					errorMsg('Niepowodzenie dodawania');
				} else {
					acceptMsg('Pomyślnie dodano');
				}
			})
			.catch((err) => errorMsg('Bład dodawania atrybutu'));
	}

	async function addAttributeModal(productId: number) {
		createProductAttributeModal.data.productId = productId;
		create_Product_Attribute_Modal.open = true;
	}

	let attributeList;

	async function getProductAtribute(productId) {
		const response = await fetch(`/api/attribute/value?productId=${productId}`);
		const results = await response.json();

		const extractedData = results.attributeValues.map((item) => ({
			value: item.value || '',
			name: item.attribute && item.attribute.name ? item.attribute.name : '',
			attribute_uid: item.attribute.uid,
			product_id: item.product.uid
		}));
		return extractedData;
	}

	async function updateProductAtribute(product_uid, attribute_uid, value) {
		const response = await fetch('/api/attribute/value', {
			method: 'PATCH',
			body: JSON.stringify({
				product_uid: product_uid,
				attribute_uid: attribute_uid,
				value: value
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (!r.ok) {
					errorMsg('Niepowodzenie modyfikacji');
				} else {
					acceptMsg('Pomyślnie zmodyfikowano');
				}
			})
			.catch((err) => errorMsg('Bład modyfikacji produktu'));
	}

	async function changeProductName(name, event) {
		const response = await fetch('/api/product', {
			method: 'PATCH',
			body: JSON.stringify({
				name: name,
				newname: event.target.value
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (!r.ok) {
					prodList = getProducts(sort, dir, search);
					errorMsg('Niepowodzenie modyfikacji');
				} else {
					acceptMsg('Pomyślnie zmodyfikowano');
					prodList = getProducts(sort, dir, search);
				}
			})
			.catch((err) => errorMsg('Bład modyfikacji produktu'));
	}

	async function changeProductPrice(name, event) {
		const response = await fetch('/api/product', {
			method: 'PATCH',
			body: JSON.stringify({
				name: name,
				prod_price: event.target.value
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (!r.ok) {
					prodList = getProducts(sort, dir, search);
					errorMsg('Niepowodzenie modyfikacji');
				} else {
					acceptMsg('Pomyślnie zmodyfikowano');
					prodList = getProducts(sort, dir, search);
				}
			})
			.catch((err) => errorMsg('Bład modyfikacji produktu'));
	}

	async function setSearch(value: string) {
		search = value;
		prodList = getProducts(sort, dir, search);
	}

	async function setSort(header_name: string, sort_dir: sortType) {
		sort = header_name;
		dir = sort_dir;

		prodList = getProducts(sort, dir, search);
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

		prodList = getProducts(sort, dir, search);
	}

	function handleBlur(attribute: any, event: any) {
		let tar: HTMLInputElement = event.target;
		updateProductAtribute(attribute.product_id, attribute.attribute_uid, tar.value);
	}

	let ikona = `<i
				><svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-5 h-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
					/>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
				</svg>
			</i>`;

	let create_Product_Attribute_Modal: any;
	let valueAtribute: any;
</script>

<div>
	<BackButton />
</div>
<div
	class="container grid grid-cols-1
	lg:grid-cols-4 gap-4 flex max-w-full w-full h-full"
>
	<div class="lg:col-span-3 order-2 lg:order-2 p-4 w-full">
		<TableComponent
			headers={[
				{ disp_name: '', name: '', sortable: false, filterable: false },
				{ disp_name: 'Id', name: 'id', sortable: false, filterable: false },
				{ disp_name: 'Nazwa produktu', name: 'name', sortable: true, filterable: true },
				{ disp_name: 'Kod produktu', name: 'prod_code', sortable: true, filterable: true },
				{ disp_name: 'Cena', name: 'price', sortable: false, filterable: false },
				{ disp_name: 'J.m', name: 'unit', sortable: true, filterable: true },
				{ disp_name: 'Zdjecie', name: 'image', sortable: false, filterable: false },
				{ disp_name: 'Kategoria', name: 'product.category', sortable: false, filterable: false },
				{ disp_name: 'Atrybut', name: 'attribute', sortable: false, filterable: false },
				{ disp_name: 'Usun', name: '', sortable: false, filterable: false }
			]}
			{setFilter}
			{setSort}
			{setSearch}
			{onCaseInsensitive}
			>{#await prodList then products}<tbody>
					{#each products as product, n}
						<tr
							><td class="text-center">
								<input
									on:change={check(product.name, product.prod_code)}
									type="checkbox"
									class="checkbox"
								/></td
							>
							<!-- <th class="text-center"><a href={`/product/${product.name}`}>{product.id}</a></th> -->
							<th class="text-center"
								><a href={`/warehouse?f_prod_code=${product.prod_code}`}>{product.id}</a></th
							>
							<th class="text-center">
								<input
									on:change={(event) => {
										changeProductName(product.name, event);
									}}
									type="text"
									class="input w-full input-xs"
									value={product.name}
								/>
							</th>
							<td class="text-center">{product.prod_code}</td>
							<th class="text-center">
								<input
									on:change={(event) => {
										changeProductPrice(product.name, event);
									}}
									type="number"
									class="input w-full input-xs"
									bind:value={product.price}
								/>
							</th>
							<td class="text-center">{product.unit}</td>
							<td class="justify-center flex flex-row">
								<div class="max-h-12 max-w-12 w-12 flex-initial mt-1">
									{#if $productImage[product.id]}
										<img
											src={$productImage[product.id]}
											id="file-img-{product.id}"
											alt="Brak"
											class="object-scale-down h-12 w-12"
										/>
									{:else if product.image}
										<img
											src={product.image}
											id="file-img-{product.image}"
											alt="Brak"
											class="object-scale-down h-12 w-12"
										/>
									{/if}
								</div>
								<input
									type="file"
									id="file-input"
									accept="image/*"
									capture="environment"
									style="display: none;"
									class="btn w-full max-w-xl flex-initial input-xs"
									on:change={(event) => {
										handleFileChange(event, selectedProductName);
									}}
								/>

								<button
									class=" m-1 px-4 cursor-pointer btn btn-xs"
									on:click={() => {
										selectedProductName = product.name;
										selectedProductId = product.id;
										document.getElementById('file-input').click();
									}}
									on:keydown={(e) => {
										if (e.key === 'Enter') {
											document.getElementById('file-input').click();
										}
									}}
								>
									<svg
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
											d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
										/>
									</svg>
								</button></td
							>
							<td>
								{#if categories}
									<SelectWithInput
										class="input-xs"
										list={categories.map((i) => i.name)}
										value={product.category ? product.category.name : ''}
										addNewValueExternal={(name) => {
											addNewProductCategory(name, product.id);
										}}
										on:change={(event) => {
											setProductCategory(product.id, event.detail);
										}}
									/>
								{/if}
							</td>
							<td class="text-center">
								<button
									class="px-4 cursor-pointer btn btn-xs"
									on:click={() => {
										addAttributeModal(product.id);
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
												d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
											/>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M6 6h.008v.008H6V6z"
											/>
										</svg>
									</i>
								</button>
							</td>

							<td class="text-center"
								><button
									class="px-4 cursor-pointer btn btn-xs"
									on:click={() => {
										deleteProduct(product.name);
									}}
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
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>{/await}
		</TableComponent>
	</div>
	<div
		class="lg:col-span-1 order-1 lg:order-2 p-4 form-control w-80 left-0 top-0"
		style="width:100%"
	>
		<input
			placeholder="Nazwa produktu"
			class="input input-bordered w-full mb-2"
			bind:value={inputName}
			type="text"
			id="name"
			name="name"
		/>
		<input
			placeholder="Cena"
			class="input input-bordered w-full mb-2"
			bind:value={price}
			type="number"
			id="price"
			name="price"
		/>

		<button class=" justify-self-center btn mb-2" on:click={generateAndCreateProduct}>Dodaj</button>
		<div class="flex justify-center w-full">
			<Modal buttonText={'Dodanie atr. globalnego'} buttonIcon={ikona} let:closeModal>
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					on:click={closeModal}>✕</button
				>
				<h3 class="font-bold text-lg">Utwórz dodatkowy atrybut</h3>

				<div class="form-control m-2">
					<div class=" w-full flex-col">
						<label class="label">
							<span class="label-text">Nazwa atrybutu</span>
						</label>
						<input
							bind:value={createProductGlobalAttributeModal.data.name}
							type="text"
							placeholder="Wprowadź tekst"
							class="input input-bordered w-full"
						/>
						<button type="button" on:click={addGlobalAttribute} class="btn btn-wide mt-5 w-full"
							>Utwórz</button
						>
					</div>
				</div>
			</Modal>
		</div>
		{#if checkedItems.length > 0}
			<ul id="listaProd" class="min-w-min my-5 bg-base-200 rounded-box">
				{#each checkedItems as item}
					<li>
						<div class="m-2 flex flex-row items-center rounded-lg">
							<div class="grow">{item[0]}</div>

							<i class="flex flex-col justify-center mx-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</i>
							<input
								bind:value={item[2]}
								min="1"
								class="prodQtyInput input input-bordered w-12 text-center p-[10px]"
								type="number"
								id="qty"
							/><LabelPrintButton prod_name={item[0]} barcode={item[1]} qty={item[2]} />
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
{#if showAlert}
	<div role="alert" class=" sticky bottom-2 alert alert-error">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="stroke-current shrink-0 h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/></svg
		>
		<span id="error-msg">{errorMessage}</span>
	</div>
{/if}

{#if showConfirmation}
	<div role="alert" class="alert alert-success">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="stroke-current shrink-0 h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			/></svg
		>
		<span>{errorMessage}</span>
	</div>
{/if}

<Modal buttonIcon="" buttonText="" class="hidden" bind:dialog={create_Product_Attribute_Modal}>
	<button
		type="button"
		class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
		on:click={() => {
			create_Product_Attribute_Modal.open = false;
			createProductAttributeModal.close;
		}}>✕</button
	>
	<h3 class="font-bold text-lg">Zarzadzaj atrybutami</h3>

	<div class="overflow-x-auto">
		<table class="table">
			<th>Atrybut</th>
			<th>Wartość</th>
			<tbody>
				{#await (attributeList = getProductAtribute(createProductAttributeModal.data.productId)) then resolvedList}
					{#each resolvedList as attribute}
						<tr>
							<th>{attribute.name}</th>
							<td
								><input
									type="text"
									value={attribute.value}
									placeholder="Wpisz dane"
									class="input w-full max-w-xs input-bordered"
									on:blur={(event) => handleBlur(attribute, event)}
								/></td
							>
						</tr>
					{/each}
				{/await}
			</tbody>
		</table>
	</div>
	<div class="form-control w-fit max-w-xs m-2">
		<div class=" w-full flex-col">
			<label class="label">
				<span class="label-text">Nowy atrybut</span>
			</label>
			<input
				bind:value={valueAtribute}
				type="text"
				placeholder="Wprowadź tekst"
				class="input input-bordered w-full"
			/>
			<button
				type="button"
				on:click={() => addAttribute(valueAtribute)}
				class="btn btn-wide mt-5 w-full">Utwórz</button
			>
		</div>
	</div>
</Modal>
