<script lang="ts">
	import type { PageData } from '../$types';
	import Reports from '$lib/components/Reports.svelte';
	import type { Product, Transaction } from '@prisma/client';
	import BackButton from '$lib/components/BackButton.svelte';
	import pdf from 'pdfjs';
	import type { Company, Warehouse } from '@prisma/client';
	let tableData: any = [];
	let columnNames: any = [];
	let tableExport: any;

	let tabela = 0;
	let comany_id = 0;
	let warehouse_id = 0;

	async function getItemsComp() {
		let result;
		columnNames = [
			'Numer transakcji',
			'Tytuł',
			'Opis',
			'Termin zapłaty',
			'Suma',
			'Kontraktor',
			'Data utworzenia'
		];
		result = await fetch(`/api/obligation`);
		const results: Product[] = await result.json();
		const filteredResults = results.map(
			({ id, title, optional, dueTime, amount, contractor, createdAt }) => ({
				id,
				title,
				optional,
				dueTime,
				amount,
				contractor: contractor.name,
				createdAt
			})
		);
		return filteredResults;
	}

	async function getIncomingTransactionsComp() {
		let response;
		columnNames = [
			'Numer transakcji',
			'Tytuł',
			'Opis',
			'Termin zapłaty',
			'Suma',
			'Kontraktor',
			'Data utworzenia'
		];
		if (comany_id == 0) response = await fetch(`/api/invoice`);
		else response = await fetch(`/api/invoice`);
		const results: Transaction[] = await response.json();
		const filteredResults = results.map(
			({ id, title, optional, dueTime, amount, contractor, createdAt }) => ({
				id,
				title,
				optional,
				dueTime,
				amount,
				contractor: contractor.name,
				createdAt
			})
		);
		return filteredResults;
	}

	async function getProducts() {
		columnNames = [
			'Numer produktu',
			'Kod produktu',
			'Nazwa produktu',
			'J.m.',
			'Kategoria',
			'Cena',
			'Opis'
		];
		const response = await fetch(`/api/product`);
		const results = await response.json();
		const filteredResults = results.map(
			({ id, prod_code, name, unit, category, price, descrition }) => ({
				id,
				prod_code,
				name,
				unit,
				category,
				price,
				descrition
			})
		);
		return filteredResults;
	}

	async function processVariable(event) {
		let tableData;
		if (tabela == 0) {
			tableData = undefined;
		}
		if (tabela == 1) {
			tableData = getProducts();
		} else if (tabela == 2) {
			tableData = getIncomingTransactionsComp();
		} else if (tabela == 3) {
			tableData = getItemsComp();
		}

		if (tabela != 0) {
			tableData.then((data) => {
				tableExport = data;
			});

			const tableRows = await tableData;
			const table = document.createElement('table');
			table.classList.add('table', 'table-zebra', 'table-fixed');
			const headerRow = document.createElement('tr');
			for (const name of columnNames) {
				const th = document.createElement('th');
				th.textContent = name;
				headerRow.appendChild(th);
			}
			table.appendChild(headerRow);
			for (const row of tableRows) {
				const tr = document.createElement('tr');
				for (const cell of Object.values(row)) {
					const td = document.createElement('td');
					if (cell && cell.name) {
						td.textContent = cell.name;
					} else if (cell != null) {
						td.textContent = cell;
					}
					tr.appendChild(td);
				}
				table.appendChild(tr);
			}
			return table.outerHTML;
		}
	}
</script>

<BackButton />

<div class=" font-bold flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row my-0 mx-auto">
	<h1 class=" whitespace-nowrap mt-5 font-bold">Wybierz tabele</h1>
	<select
		bind:value={tabela}
		on:change={async (event) => {
			comany_id = 0;
			warehouse_id = 0;
			tableData = await processVariable(event);
		}}
		class="select select-bordered w-full max-w-xs my-2 mx-2"
		id="tabela"
	>
		<option value={0}>- Wybierz -</option>
		<option value="1">Produkty</option>
		<option value="2">Transakcje</option>
		<option value="3">Zobowiązania</option>
	</select>
	<div class="flex-row">
		<Reports {tableExport} {columnNames} />
	</div>
</div>
{#if tableData != undefined}
	{@html tableData}
{/if}
