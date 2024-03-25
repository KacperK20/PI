   <script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import TableComponent from '$lib/components/TableComponent.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { checkIfMobile } from '$lib/checkIfMobile';
	import type { User } from '@prisma/client';
	import Modal from '$lib/components/Modal.svelte';
	import PasswordField from '$lib/components/PasswordField.svelte';
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
	let roles = [];
	let persons = [];
	let users;
	let caseInsensitive = true;

	onMount(async () => {
		roles = await getRoles();
		persons = await getPersons();

		if (checkIfMobile()) {
			const elementHeightInPx = document.getElementsByClassName('table-content')[0].offsetHeight;
			limit = Math.floor((elementHeightInPx - 48 - 24.5) / 25);

			window.onresize = function () {
				const elementHeightInPx = document.getElementsByClassName('table-content')[0].offsetHeight;
				limit = Math.floor((elementHeightInPx - 48 - 24.5) / 25);
			};
		} else limit = 10;
	});

	enum sortType {
		ASC,
		DESC
	}

	let createUserModal = {
		data: {
			username: '',
			role_id: "",
			password: '',
			addPerson: false,
			person: '',
		},
		reset(){
			createUserModal.data = {
				username: '',
				role_id: "",
				password: '',
				addPerson: false,
				person: '',
			}
		}
	};

	let editUserModal = {
		data: {
			user_uid : '',
			username: '',
			role_id: 0,
			password: '',
			person: '',
			personid: '',
		},
		reset: () => {
			editUserModal.data = {
				user_uid : '',
				username: '',
				role_id: 0,
				password: '',
				person: '',
				personid: '',
			}
		},
	};



	async function getRoles() {
		const result = await fetch('/api/roles');
		return await result.json();
	}

	async function getPersons() {
		const result = await fetch('/api/person');
		return await result.json();
	}

	async function getUsers(sort, dir, search) {
		var urlParams = new URLSearchParams('');
		if (sort) {
			urlParams.set('sort', sort);
			urlParams.set('dir',   dir);
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
		const result = await fetch('/api/user?' + urlParams.toString());

		return await result.json();
	}

	

	async function sortData(header: string, sort: string) {
		users = await getUsers(sort, dir, search);
	}

	async function setSearch(value: string) {
		search = value;
		users = await getUsers(sort, dir, search);
	}

	async function setSort(header_name: string, sort_dir: sortType) {
		sort = header_name;
		dir = sort_dir;

		users = await getUsers(sort, dir, search);
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

		users = await getUsers(sort, dir, search);
	}

	async function onCaseInsensitive(){
        if(caseInsensitive)caseInsensitive=false
        else caseInsensitive = true

    }

	async function deleteUser(user: User) {

		try {
			const response = await fetch(`/api/user`, {
				method: 'DELETE',
				body: JSON.stringify({
					user_uid: user.uid
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (response?.ok) {
				const result = await response.json();
				users = await getUsers(sort, dir, search);

				showAlert = {
					type : "success",
					message : "Pomyślnie usunięto użytkownika"
				}

			} else {
				const result = await response.json();
				showAlert = {
					type : "error",
					message : "Błąd przy usuwaniu użytkownika"
				}
			}
		} catch (error) {
			console.error('Error: ' + error);
		}
	}

	async function editUser(user: User) {
		edit_user_dialog.open=true
		editUserModal.data.username = user.username;
		editUserModal.data.user_uid = user.uid;
	}

	async function sendEditUser() {
		fetch(`/api/user`, {
			method: 'PATCH',
			body: JSON.stringify({
				user_uid : editUserModal.data.user_uid,
				username: editUserModal.data.username,
				password: editUserModal.data.password,
				person: editUserModal.data.personid,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(async (r) => {if (r?.ok) {
			editUserModal.reset();
			users = await getUsers(sort, dir, search);

			showAlert = {
				type : "success", 	
				message : "Pomyślnie zedytowano użytkownika"
			}

		} else {
			const result = await r.json();

			showAlert = {
				type : "error",
				message : "Błąd przy edycji użytkownika"
			}

		}
		}).catch((err) => {	showAlert = {
				type : "error",
				message : "Błąd przy edycji użytkownika"
			}});
	}


	async function sendEditRole(role: number, user_uid: string) {

		fetch(`/api/user`, {
			method: 'PATCH',
			body: JSON.stringify({
				user_uid: user_uid,
				role: role
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(async (r) => {if (r?.ok) {
				users = await getUsers(sort, dir, search);
				showAlert = {
					type : "success",
					message : "Pomyślnie zmieniono rolę użytkownika"
				}
			} else {
				const result = await r.json();
				showAlert = {
					type : "error",
					message : "Błąd przy zmianie roli"
				}
			}
			}).catch((err) => {showAlert = {
					type : "error",
					message : "Błąd przy zmianie roli"
				}});
		}

	async function createNewUser() {
		await fetch(`/api/user`, {
			method: 'PUT',
			body: JSON.stringify({
				username: createUserModal.data.username,
				role_id: createUserModal.data.role_id,
				passwordHash: createUserModal.data.password,
				addPerson: createUserModal.data.addPerson,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (r) => {
				if (r?.ok) {
					createUserModal.reset();
					users = await getUsers(sort, dir, search);
					showAlert = {
						type : "success",
						message : "Pomyślnie dodano użytkownika"
					}
				} else {
					const result = await r.json();
					showAlert = {
						type : "error",
						message : "Błąd przy tworzeniu użytkownika"
					}
				}
			}).catch((err) => {showAlert = {
						type : "error",
						message : "Błąd przy tworzeniu użytkownika"
					}});
	}


	//let headers = [['personId',true], 'username', 'role_Id', 'role', 'Dzialania'];
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

	let showAlert : any = null;
	let edit_user_dialog : any;
</script>

<BackButton />

<div class="flex justify-center">
<Modal buttonText={'Dodaj użytkownika'} buttonIcon={ikona}>
	<h3 class="font-bold text-lg">Utwórz użytkownika</h3>
	<div class="form-control">
		<label class="label">
			<span class="label-text">Nazwa użytkownika</span>
		</label>
		<input
			bind:value={createUserModal.data.username}
			type="text"
			placeholder="Wprowadź tekst"
			class="input input-bordered w-full"
		/>
		<label class="label">
			<span class="label-text">Hasło użytkownika</span>
		</label>
		<PasswordField bind:value={createUserModal.data.password} placeholder="Wprowadź tekst"></PasswordField>
		<div class="label">
			<span class="label-text">Wybierz role</span>
			<select class="select" bind:value={createUserModal.data.role_id}>
				<option value="" disabled>Wybierz</option>
				{#await roles then roles}
					{#each roles as role (role.id)}
						<option value={role.id}>{role.name}</option>
					{/each}
				{/await}
			</select>
		</div>
		<button type="submit" on:click={createNewUser} class="btn w-full mt-2">Utwórz</button>
	</div>
</Modal>
</div>


<div class="m-4 text-center">
	<TableComponent
	headers={[
		{ disp_name: 'Nazwa użytkownika', name: 'username', sortable: true, filterable: true },
		{ disp_name: 'Osoba', name: 'person.name', sortable: true, filterable: true },
		{ disp_name: 'Nazwa roli', name: 'role.name', sortable: true, filterable: true },
		{ name: 'buttonCol'},
		{ name: 'buttonCol'},
		{ name: 'buttonCol'},
		
	]}
	{setFilter}
	{setSort}
	{setSearch}
	{onCaseInsensitive}
>
		{#await (users = getUsers(sort, dir, search)) then users}
			<tbody>
				{#each users as user}
					<tr>
						<td>{user.username} </td><td
							>{#if user.person}
								{#each persons as personFromList}
									{#if personFromList.name === user.person.name}
										{personFromList.name}
									{/if}
								{/each}
							{:else}Brak
							{/if}</td
						>

						<td
							><select
								on:change={(event) => {
									sendEditRole(event.target.value, user.uid)
								}}
							>
								{#await roles then roles}
									{#each roles as roleFromList}
										<option value={roleFromList.name} selected={user.role.name == roleFromList.name}
											>{roleFromList.name}</option
										>
									{/each}
								{/await}
							</select></td
						>
						<td class="  space-x-2">
							<button
								class="btn btn-sm w-full"
								on:click={() => {
									editUser(user);
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
											d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
										/>
									</svg></i
								>
							</button></td>
							<td class="  space-x-2">
							</td><td class="  space-x-2">
							<button
								class="btn btn-sm"
								on:click={() => {
									deleteUser(user);
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
					users = await getUsers(sort, dir, search);
				}
			}}>«</button
		>
		<button class="join-item btn">{skip}</button>
		<button
			class="join-item btn"
			on:click={async () => {
				++skip;
				users = await getUsers(sort, dir, search);
			}}>»</button
		>
	</div>
</div>

{#if showAlert}
	{#key showAlert}
		<div class="absolute bottom-0 left-0 mx-auto w-full p-2">
			<AlertBox type={showAlert.type} message={showAlert.message}></AlertBox>
		</div>
	{/key}
{/if}

<Modal buttonIcon="" buttonText ="" class="hidden" bind:dialog={edit_user_dialog}>
	<h3 class="font-bold text-lg">Edycja użytkownika</h3>
	<div class="form-control m-2">
		<label class="label">
			<span class="label-text">Nazwa użytkownika</span>
		</label>
		<input
			bind:value={editUserModal.data.username}
			type="text"
			placeholder="Wprowadź tekst"
			class="input input-bordered w-full"
		/>
		<label class="label">
			<span class="label-text">Hasło użytkownika</span>
		</label>
		<PasswordField bind:value={editUserModal.data.password} placeholder="Wprowadź tekst"></PasswordField>
		<label class="label">
			<span class="label-text">Osoba</span>
		</label>
		
	<SelectWithInput
	class="input-xs"
	list={persons.map((i) => i.name)}
	value={editUserModal.data.person ? editUserModal.data.person : ''}
	addNewValueExternal={(name) => {
		editUserModal.data.person = name;
	}}
	on:change={(event) => {
		editUserModal.data.person = event.detail;
		const foundContractor = persons.find((c) => c.name === event.detail);
		if (foundContractor) {
			editUserModal.data.personid = foundContractor.id;
		} else {
			console.log('Osoba nie istnieje');
		}
	}}
/>
		<button type="submit" on:click={sendEditUser} class="btn mt-5 w-full">Zmień</button>
		
	</div>
</Modal>
