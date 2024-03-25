<script lang="ts">
	import ModalItemInput from './ModalItemInput.svelte';
	import { sharedData } from '../../sharedData';
	import { page } from '$app/stores';
	import { action_type } from '$lib/action_type';
	import GeoButton from '$lib/components/GeoButton.svelte';
	import ImagesBox from '$lib/components/ImagesBox.svelte';
	import CameraButton from '$lib/components/CameraButton.svelte';
	import SelectPerson from '$lib/components/SelectPerson.svelte';
	import { onMount } from 'svelte';
	import SelectCompany from '$lib/components/SelectCompany.svelte';
	import AlertBox from '$lib/components/AlertBox.svelte';
	import SignaturePad from '$lib/components/SignaturePad.svelte'
	import { invalidateAll } from '$app/navigation';

	export let checkedItems: any = [];
	export let closeModal: any;
	export let resetCheckedItems: any;

	let signaturePad : any;

	let data = {
		items: checkedItems.length ? checkedItems : [{}],
		dstComp_id: '',
		dstPerson_uid: '',
		change_owner: $page.data.app_settings.defaults.giveout_item_change_owner,
		confirm_by_signature : $page.data.app_settings.defaults.confirm_by_signature,
		images: [] as { base64Data : string }[],
		coords : null as {}|null,
		comment : ""
	};

	async function submit() {
		const notEmptyItems = data.items.filter((item: any) => Object.keys(item).length > 0)

		if(notEmptyItems.length && data.dstComp_id && data.dstPerson_uid){
			try {
				await fetch(`/api/item/action`, {
					method: "POST",
					body: JSON.stringify({
						action_type: action_type.GIVEOUT,
						items: data.items
							.map((item: any) =>
								{return {
									...(item.uid ? {uid : item.uid} : {uids : item.uids}), 
									amount : item.amount
								}}
							)
							.flat(),
						dstPerson_uid: data.dstPerson_uid,
						srcPerson_uid: $page.data.user.person.uid,
						confirm_by_signature: data.confirm_by_signature,
						...(data.confirm_by_signature ? {
							src_signature: $page.data.user.signature,
							dst_signature: signaturePad.getSignature(),
						} : {}),
						user_uid: $page.data.user.uid,
						images: data.images,
						coords : data.coords,
						change_owner: data.change_owner,
						comment : data.comment
					}),
					headers: {
						"Content-Type": "application/json",
					}
				})

			} catch (err) {
				showAlert = {
					type : "error",
					message : err
				}
			} finally {
				resetCheckedItems();
				closeModal();
				refreshTables();
				//TODO : oświeżenie listy magazynów, bo jak osoba nie ma magazynu to api go tworzy
			}
		} else {
			showAlert = {
                type : "error",
                message : "Brakujące lub nieprawidłowe dane"
            }
		}
	}

	function refreshTables() {
		$sharedData.sel_wh_id = $sharedData.sel_wh_id;
	}

	function moreItemInput() {
		data.items = data.items.concat({});
		setTimeout(() => focusInput(),10)
	}
	
	function focusInput(){
        let inputs : any = document.querySelectorAll(".prodCodeInput")
		inputs[inputs.length-1]?.focus();
    }

    onMount(focusInput)
	
	let showAlert : any = null;
</script>

<div>
	<h3 class="font-bold text-lg">Wydaj przedmioty</h3>
	<div class="form-control w-full  m-0">

		<label class="label">
			<span class="label-text">Przedmioty*</span>
		</label>
		{#each data.items as item}
			<div class="mb-1">
				<ModalItemInput bind:item />
			</div>
		{/each}
		<div class={'form-control w-full m-0'}>
			<button type="button" on:click={moreItemInput} class="btn shadow mt-1 min-h-0 h-5">+</button>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text">Firma*</span>
			</label>
			<SelectCompany bind:sel_comp_id={data.dstComp_id}/>
			{#if data.dstComp_id}
				{#key data.dstComp_id}
					<label class="label">
						<span class="label-text">Osoba*</span>
					</label>
					<SelectPerson sel_comp_id={Number(data.dstComp_id)} 
					on:input={(event) => {
						data.dstPerson_uid = ""
					}} 
					on:change={(event) => {data.dstPerson_uid = event.detail.uid}}/>
				{/key}
			{/if}
		</div>

		{#if data.dstPerson_uid}
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Zmień właściciela</span> 
					<input type="checkbox" bind:checked={data.change_owner} class="checkbox" />
				</label>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Potwierdzenie przyjęcia podpisem</span> 
					<!--<input type="checkbox" on:click={() => firstOrientation = true} bind:checked={confirm_by_signature} class="checkbox" />-->
					<input type="checkbox" bind:checked={data.confirm_by_signature} class="checkbox" />
				</label>
			</div>
			{#if data.confirm_by_signature}
				<SignaturePad bind:this={signaturePad}/>
			{/if}
		{/if}

		<div class="form-control w-full m-0">
			<label class="label">
				<span class="label-text">Komentarz</span>
			</label>
			<input type="text" bind:value={data.comment} placeholder="Wpisz tekst" class="input input-bordered w-full" />
		</div>

		<div class="form-control">
			<label class="label cursor-pointer">
			<span class="label-text">Zdjęcia</span> 
			</label>
			<div>
				{#if data.images.length > 0}
					<ImagesBox editable={true} images={data.images} />
				{/if}

				<CameraButton imageResult = {(base64Data, geolocation) => {
					data.images = data.images.concat({base64Data})
				}} small_btn={true} long_btn={true} upload_btn={false} responsive={true}/>

			</div>
		</div>

		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Lokalizacja</span> 
			</label>
			<GeoButton editable={true} coords={data.coords} result={(coords) => {data.coords = {latitude : coords.latitude, longitude : coords.longitude}}} error={(err) => console.log(err)}/>
		</div>

		<button type="button" on:click={submit} class="btn shadow mt-5 w-full">Wydaj</button>
		
		{#if showAlert}
		{#key showAlert}
			<div class="w-full pt-4">
				<AlertBox type={showAlert.type} message={showAlert.message}></AlertBox>
			</div>
		{/key}
	{/if}
	</div>
</div>
