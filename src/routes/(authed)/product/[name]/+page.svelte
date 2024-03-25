<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let productActions = data.productActions;
	let items = data.items;
	let category = data.category;

	let attributeList;

	async function getProduct(productId) {
		const response = await fetch(`/api/attribute/value?productId=${productId}`);
		const results = await response.json();

		const extractedData = results.attributeValues.map((item) => ({
			value: item.value || '',
			name: item.attribute && item.attribute.name ? item.attribute.name : '',
			attributeId: item.attribute.id || 0
		}));
		return extractedData;
	}
</script>

<BackButton />
<div class="flex h-full">
	<table class="table w-1/5 table-xs h-min">
		<thead>
			<th colspan="100" class="text-center text-lg"> Produkt </th>
		</thead>
		<tbody>
			<tr><th>Nazwa produktu</th> <td>{productActions?.name}</td> </tr>
			<tr><th>Kod produktu</th> <td>{productActions?.prod_code}</td> </tr>
			<tr
				><th>Zdjęcie produktu</th>
				<td>
					<img
						src={productActions?.image}
						id="file-img-{productActions?.id}"
						alt=""
						class="object-scale-down h-12 w-12"
					/>
				</td>
			</tr>
			<tr><th>Typ produktu</th> <td>{productActions?.type || 'Brak'}</td> </tr>
			<tr><th>Ilość produktu</th> <td>{items.length}</td> </tr>
			<tr><th>Kategoria produktu</th> <td>{category?.name || 'Brak'}</td> </tr>
			<tr><th>Atrybuty produktu:</th> <td /> </tr>

			{#await (attributeList = getProduct(productActions.id)) then resolvedList}
				{#each resolvedList as attribute}
					<tr>
						<th class="text-right">{attribute.name}:</th>
						<td>
							{attribute.value}
						</td>
					</tr>
				{/each}
			{/await}
		</tbody>
	</table>

	<table class="table w-4/5 table-xs h-max">
		<thead>
			<tr><th colspan="100" class="text-center text-lg"> Przedmioty </th></tr>
			<tr>
				<th>ID</th>
				<th>Data utworzenia </th>
				<th>Data aktualizacji</th>
				<th>Opis</th>
				<th>Status</th>
				<th>Magazyn</th>
				<th>Zdjęcie </th>
				<th>Własciciel</th>
				<th>Kondycja</th>
			</tr>
		</thead>
		<tbody>
			{#await items then items}
				{#each items as item}
			
					<tr class="hover">
						<td><a class="font-bold" href={`/item/${item.uid}`}>{item.id}</a></td>
						<td>{new Date(item.createdAt).toLocaleString()}</td>
						<td>{new Date(item.updatedAt).toLocaleString()}</td>
						<td>{item.desc}</td>
						<td>{item.status}</td>
						<td><a href={`/warehouse?id=${item.wh.id}`}>{item.wh.name}</a></td>
						<td>{item.image ? 'Tak' : 'Brak'}</td>
						<td>{item.ownerWh.name}</td>
						<td>{item.condition || 'Brak'}</td>
					</tr>
				{/each}
			{/await}
		</tbody>
	</table>
</div>
