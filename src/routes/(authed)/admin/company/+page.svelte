<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { Company, Warehouse } from '@prisma/client';
	import { sharedData } from '../../../../sharedData.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { writable } from 'svelte/store';
	import CameraButton from '$lib/components/CameraButton.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { fade } from 'svelte/transition';
	export let data: PageData;

	let companyLogos = writable({});

	let createCompanyModal = {
		data: {
			name: '',
			logo: ''
		},
		reset: () => {
			createCompanyModal.data = {
				name: '',
				logo: ''
			}
		}
	};

	let deleteCompanyModal = {
		data: {
			name: ''
		},
		reset: () => {
			deleteCompanyModal.data = {
				name: ''
			}
		}
	};

	let editCompanyModal = {
		data: {
			name: '',
			logo: ''
		},
		close: () => {
			document.querySelector('#edit_comp_modal')?.close();
			document.querySelector('#edit_comp_modal form')?.reset();
		},
	};

	async function createNewCompany() {
		fetch(`/api/company`, {
			method: 'PUT',
			body: JSON.stringify(createCompanyModal.data),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(async (response) => {
			companyList = getCompanies();
			createCompanyModal.reset()
			if (response?.ok) {
				alerts.success = "Pomyślnie utworzono firmę";
			}
			else {
				alerts.error = true
			}
			invalidateAll();
		})
		.catch((err) => console.error(err));
	}

	async function deleteCompany(name) {
		try {
			const response = await fetch(`/api/company`, {
				method: 'DELETE',
				body: JSON.stringify({
					name: name
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (response?.ok) {
				alerts.success = "Pomyślnie usunięto firmę";
				deleteCompanyModal.reset();
				companyList = getCompanies();
			} else {
				const result = await response.json();
				alerts.error = result.message;
			}
		} catch (error) {
			alerts.error = error.message;
		}
		finally {
			invalidateAll();
		}
	}

	async function editCompany() {
		fetch(`/api/company`, {
			method: 'PATCH',
			body: JSON.stringify({
				name: editCompanyModal.data.name,
				comp_id: $sharedData.sel_comp_id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(async (response) => {
			if (response?.ok) {
				alerts.success = "Pomyślnie zmieniono nazwę firmy"
			}
			else {
				alerts.error = true
			}

			companyList = getCompanies();
			editCompanyModal.close();
			invalidateAll();
		})
		.catch((err) => {
			alerts.error = true
		});
	}
	function companyLogosUpdate(companyLogos , logo ,comp_id ){
		companyLogos.update((logos) => {
			logos[comp_id] = logo;
			return logos;
		});
	}
	async function zmienLogo(logo: any, comp_id:number){
		companyLogosUpdate(companyLogos , logo , comp_id)
		fetch(`/api/company`, {
			method: 'PATCH',
			body: JSON.stringify({
				logo: logo,
				comp_id: comp_id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(async (r) => {
			console.log(r);
			editCompanyModal.close();
			invalidateAll();
		})
		.catch((err) => console.error(err));
	};

	async function getCompanies() {
		const response = await fetch('/api/company');
		const results: Company[] = await response.json();
		return results;
	}

	let timeout : any;
	$: if(alerts){
        if(timeout)clearTimeout(timeout)
        timeout = setTimeout(() => {
            alerts.error = null
            alerts.success = null;
        }, 2000)
    }

	let companyList = getCompanies();
	let alerts = {
		success : null as null | string | boolean,
		error : null as null | string  | boolean,
	}
</script>

<BackButton />
<div class="flex flex-col items-center">
	{#await companyList then companies}
		<h1 class="m-5 font-bold">Firmy:</h1>

			<Modal buttonIcon="" buttonText="Utwórz">
				<h3 class="font-bold text-lg">Utwórz firmę</h3>
				<label class="form-control w-full">
					<div class="label">
					  <span class="label-text">Nazwa firmy</span>
					</div>
					<input
						bind:value={createCompanyModal.data.name}
						type="text"
						placeholder="Wprowadź tekst"
						class="input input-bordered w-full"
					/>

					<!-- <div class="label">
						<span class="label-text">Logo firmy</span>
					</div>
					{console.log(createCompanyModal.data.logo)}
					<input type="file" bind:value={createCompanyModal.data.logo} class="file-input file-input-bordered w-full" /> -->
					<button class="btn w-full mt-2" on:click={createNewCompany}>Utwórz</button>
				</label>
			</Modal>

		<table class="table table-fixed">
			<thead>
				<tr>
					<th class="text-center" style="text-align: center;">Nazwa</th>
					<th class="text-center" style="text-align: center;">Edytuj</th>
					<th class="text-center" style="text-align: center;">Logo</th>
					<th class="text-center" style="text-align: center;">Usuń</th>
				</tr>
			</thead>
			<tbody>
				{#each companies as company, n}
					<tr>
						<td class="text-center">{company.name}</td>
						<td class="text-center">
							<Modal buttonIcon="" buttonText="Edytuj">
								<h3 class="font-bold text-lg text-start">Edytuj nazwę</h3>
								<div class="form-control w-full m-0">
									<label class="label">
										<span class="label-text">Nowa nazwa firmy</span>
									</label>
									<input
										bind:value={editCompanyModal.data.name}
										type="text"
										placeholder="Wprowadź tekst"
										class="input input-bordered w-full"
									/>
								</div>
								<button type="button" on:click={editCompany} class="btn btn-wide mt-2 w-full">Edytuj</button>
							</Modal>
						</td>
						<td class="justify-center flex  items-center">

							<div class=" flex-initial mt-1 mr-2">
								{#if $companyLogos[company.id]}
									<img
										src={$companyLogos[company.id]}
										id="file-img-{company.id}"
										alt="Brak"
										class="object-scale-down h-12"
									/>
								{:else if company.logo}
									<img
										src={company.logo}
										id="file-img-{company.id}"
										alt="Brak"
										class="object-scale-down h-12"
									/>
								{/if}
							</div>

							<CameraButton imageResult={(base64Data)=>{zmienLogo(base64Data, company.id)}} small_btn={true} just_btn={true} upload_btn={true} responsive={true}/>

							
						</td>
						<td class="text-center">
							<button
								class="btn"
								on:click={() => {
									deleteCompany(company.name);
								}}
								><svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
									/>
								</svg></button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/await}

	{#if alerts.error}
            <div class="alert alert-error" transition:fade>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                
				{#if alerts.error == "P2003"}
				<span>Niepowodzenie: firma posiada nie puste magazyny</span>
				{:else}
				<span>Niepowodzenie</span>
				{/if}
              </div>
        {/if}

	{#if alerts.success}
		<div class="alert alert-success" transition:fade>
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
			<span>{alerts.success}</span>
		</div>
	{/if}
</div>