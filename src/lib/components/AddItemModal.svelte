<script lang="ts">
	import RandCodeButton from "$lib/components/RandCodeButton.svelte";
    import CodeScanner from "$lib/components/CodeScanner.svelte";
	import { clickoutside } from "@svelte-put/clickoutside";
	import SelectPerson from "$lib/components/SelectPerson.svelte";
	import { sharedData } from "../../sharedData";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import LabelPrintButton from "$lib/components/LabelPrintButton.svelte";
	import SelectWithInput from "$lib/components/SelectWithInput.svelte";
	import SelectWarehouse from "$lib/components/SelectWarehouse.svelte";
	import attachOnScan from "$lib/attachOnScan";
	import SelectCompany from "$lib/components/SelectCompany.svelte";
	import type { Person, ResponsiblePersonToItem } from "@prisma/client";
	import AlertBox from "./AlertBox.svelte";
    
    export let checkedItems: any = [];
	export let closeModal: any;
	export let resetCheckedItems: any;

    let hideSelectOwnerWh = true;

    onMount(() => {
        focusInput()
        attachOnScan(document,handleScan )
    })
    
    function handleScan(sCode : string, iQty : number){
        const focusedInput = document.activeElement;

        if(focusedInput?.classList.contains("prodCodeInput")){
            focusedInput.setAttribute("readonly","true")
            let prev_val = focusedInput.value.slice(0,-sCode.length)
            let qtyEl = focusedInput.parentElement.parentElement.querySelector('.prodQtyInput')
            if(prev_val){
                focusedInput.value = prev_val;
                if(prev_val == sCode){
                    qtyEl.value = Number(qtyEl.value) + 1
                    qtyEl.dispatchEvent(new Event('input', { bubbles: true }));
                }
                else {
                    focusedInput.value = sCode
                    qtyEl.value = 1
                    qtyEl.dispatchEvent(new Event('input', { bubbles: true }));
                }

                focusedInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            else {
                focusedInput.value = sCode
                focusedInput.dispatchEvent(new Event('input', { bubbles: true }));
                qtyEl.value = 1
                qtyEl.dispatchEvent(new Event('input', { bubbles: true }));
            }
            focusedInput.removeAttribute("readonly")
        }
        else {          
            if(focusedInput.tagName == "INPUT"){
                focusedInput.value = focusedInput.value.slice(0,-sCode.length)
            }
            let emptyInput : any = main_div.querySelector('.prodCodeInput')
            emptyInput.setAttribute("readonly","true")
            emptyInput.focus()
            handleScan(sCode, iQty)
        }
    }

    let data = {
		prod_code : "",
        category : "",
        name : "",
        qty : 0 as number | null,
        desc : "",
		srcComp_id: '',
		src_person: '',
        responsiblePersons : [] as Person[],
		comment : "",
        from_person : false,
        addedItems : {},
        ownerWhID : "",
        amount : 1,
        unit : "szt.",
        type : "",
	};

    async function submit() {
		if(data.prod_code && data.name && data.qty){
			try {
				let r = await fetch(`/api/item`, {
                    method: "PUT",
                    body: JSON.stringify({
                        prod_code: data.prod_code, 
                        name: data.name, 
                        category : data.category,
                        desc: data.desc, 
                        qty: data.qty,
                        wh_id: $sharedData.sel_wh_id,
                        from_person: data.from_person,
                        srcComp_id: data.srcComp_id,
                        src_person: data.src_person,
                        dstComp_id: $sharedData.sel_comp_id,
                        dst_person: $page.data.user.person.name,
                        ownerWhId : hideSelectOwnerWh ? $sharedData.sel_wh_id : data.ownerWhID,
                        responsiblePersons : data.responsiblePersons,
                        user: $page.data.user.uid,
                        amount : data.amount,
                        unit : data.unit,
                        type : data.type,
                    }),
                    headers: {
                    "Content-Type": "application/json",
                    }
                })
                data.addedItems = r.json();
                showAddedItem = true;

			} catch (err) {
				showAlert = {
					type : "error",
					message : err
				}
			} finally {
				resetCheckedItems();
				refreshTables();
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

    async function findProduct(param : string, value : string) {
        if(value){
            const result = await fetch(`/api/product?${param}=${value}`)
            const foundProduct =  await result.json()
            if(foundProduct){
                if(param == "name"){
                    data.prod_code = foundProduct.prod_code;
                    prodCodeDisabled = true
                }
                else if(param == "prod_code"){
                    data.name = foundProduct.name;
                    nameDisabled = true
                }
                
                if(foundProduct.category){
                    data.category = foundProduct.category.name;
                    categoryDisabled = true;
                }
                else {
                    data.category = ""
                }
                data.unit = foundProduct.unit
                unitDisabled = true;
            }
            else {
                nameDisabled = false;
                prodCodeDisabled = false;
                categoryDisabled = false;
                unitDisabled = false;
            }
            if(!data.qty)data.qty = 1;
        }
        else {
            data.qty = null
            if(param == "prod_code")data.prod_code = "";
            if(param == "name")data.name = "";

            nameDisabled = false;
            prodCodeDisabled = false;
            categoryDisabled = false;
            unitDisabled = false;
        }
    }

    function handleProdCodeClick(event : any){
        event.target.removeAttribute("readonly")
    }
    async function handleProdCodeInput(event : any){
        await findProduct(event.target.name, event.target.value);
    }

    async function handleNameInput(name : string){
        await findProduct("name", name);
    }

    async function handleNameClick( name : string ){
        data.name = name;
        data.qty = 1;
        await findProduct("name", data.name);
        namesListHidden = true
    }

    let scanning = false;

    function scanSuccess(){
        
    }

    async function getProductNames(cat_name : string){
        const result = await fetch(`/api/product/name?category=${cat_name}`)
        productNames = await result.json();
        return productNames
    }

    function handleRandCode(code : string){
        data.prod_code = code;
        data.qty = 1
    }

	function focusInput(n = 0){
        let inputs : any = document.querySelectorAll(".prodCodeInput")
        inputs[n]?.focus();
    }

    async function getProductCategories() {
        const result = await fetch(`/api/product/category`)
        return await result.json();
    }

    function handleAddResponsiblePerson(person : Person){
        data.responsiblePersons = data.responsiblePersons.concat(person)
    }

    function handleDeleteResponsiblePerson(person : Person){
        data.responsiblePersons = data.responsiblePersons.filter(p => p != person)
    }
    
    let categoryDisabled = false;
    let prodCodeDisabled = false;
    let nameDisabled = false;
    let unitDisabled = false;
    let namesListHidden = true;
    let showAddedItem = false;
    let main_div : any;
    let showResponsiblePerson = false
    let showAlert : any = null;

    if(checkedItems.length == 1){
        let item = checkedItems[0];
        data.name = item.product.name
        handleNameInput(item.product.name);
        data.amount = item.amount
        data.type = item.type ?? ""
    }

    let productNames : string[] =  [];

    $ : getProductNames(data.category)

</script>

<div bind:this={main_div}>
    {#if !showAddedItem}
        <h3 class="font-bold text-lg">Dodaj przedmiot do magazynu</h3>
        <div class="form-control w-full m-0">                        
            <label class="label">
                <span class="label-text">Kod produktu*</span>
            </label>
            <div class="flex flex-row">
                <div class="relative w-full">
                    <input 
                        name="prod_code"
                        type="text" 
                        readonly 
                        disabled={prodCodeDisabled} 
                        bind:value={data.prod_code} 
                        on:click={handleProdCodeClick} 
                        on:input={handleProdCodeInput} 
                        placeholder="Wpisz lub zeskanuj" 
                        class="input input-bordered w-full prodCodeInput" 
                    />
                    <div class={`absolute top-[8px] right-[8px] overflow-visible bg-base-100 ${prodCodeDisabled ? "hidden" : "flex"}`} >
                        <RandCodeButton resultFunc={handleRandCode}/>
                        <div class="w-1"></div>
                        <CodeScanner bind:scanning={scanning} scanSuccess={scanSuccess} />
                    </div>
                </div> 
            </div>
        </div>

        <div class="flex space-x-2">
            <div>
                <label class="label">
                    <span class="label-text">Ilość</span>
                </label>
                <input type="number" bind:value={data.amount} class="input input-bordered  w-full text-center p-[10px]" min=1 placeholder=1/>
            </div>

            <div>
                <label class="label">
                    <span class="label-text">J.m</span>
                </label>
                <select
                    disabled={unitDisabled}
                    bind:value={data.unit}
                    class="select select-bordered"
                >
                    <option value="szt.">szt.</option>
                    <option value="m">m</option>
                </select>
            </div>
            
            <div>
                <label class="label">
                    <span class="label-text">Typ</span>
                </label>
                <select
                    bind:value={data.type}
                    class="select select-bordered"
                >
                    <option value="">- Wybierz -</option>
                    <option value="Środek trwały">Środek trwały</option>
                    <option value="Wyposażenie">Wyposażenie</option>
                </select>
            </div>
        </div>
        
        {#await getProductCategories()}
        {:then categories} 
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Kategoria</span>
                </label>
                <SelectWithInput disabled={categoryDisabled} list={categories.map(cat => cat.name)} bind:value={data.category} />
            </div>
        {/await}
        
        <div class="form-control w-full m-0">
            <label class="label">
                <span class="label-text">Nazwa*</span>
            </label>

            {#await productNames then names}
                <SelectWithInput disabled={nameDisabled} list={names} bind:value={data.name} on:input={(event) => handleNameInput(event.detail)} on:change={(event) => handleNameClick(event.detail)} />
            {/await}
        </div>

        <div class="form-control w-full m-0">
            <label class="label mt-0">
                <span class="label-text">Opis</span>
            </label>
            <textarea class="textarea textarea-bordered" bind:value={data.desc} placeholder="Wpisz tekst"></textarea>
        </div>

        <div class="form-control w-full m-0">
            <label class="label">
                <span class="label-text">Osoby odpowiedzialne</span> 
                <input type="checkbox" bind:checked={showResponsiblePerson} class="checkbox" />
            </label>
            {#if showResponsiblePerson}
                {#each data.responsiblePersons as person, n}
                <div class="pl-2 border border-base-content/20 text-sm rounded-lg mb-1 flex justify-between items-center">
                    {person.name}
                        <button
                            type="button"
                            class="btn btn-xs"
                            on:click={() => {
                                handleDeleteResponsiblePerson(person);
                            }}
                        >
                            <i>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="w-3 h-3"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                            </i>
                        </button>
                </div>
                {/each}
                <SelectPerson sel_comp_id={Number($sharedData.sel_comp_id)} on:change={(event) => handleAddResponsiblePerson(event.detail)}></SelectPerson>  
            {/if}
        </div>

        <div class="form-control w-full m-0">
            <label class="label cursor-pointer m-0">
                <span class="label-text">Przyjęte od osoby</span> 
                <input type="checkbox" bind:checked={data.from_person} class="checkbox" />
            </label>
        </div>

        {#if data.from_person}
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Firma*</span>
                </label>
                <SelectCompany bind:sel_comp_id={data.srcComp_id}></SelectCompany>
                {#if data.srcComp_id}
                    {#key data.srcComp_id}
                    <label class="label">
                        <span class="label-text">Osoba*</span>
                    </label>
                    <SelectPerson sel_comp_id={Number(data.srcComp_id)} bind:sel_person={data.src_person}></SelectPerson>   
                    {/key}
                {/if}
            </div>
        {/if}

        <div class="form-control w-full m-0">
            <label class="label cursor-pointer m-0">
                <span class="label-text">Właściciel</span> 
                <input type="checkbox" bind:checked={hideSelectOwnerWh} class="checkbox" />
            </label>
        </div>

        {#if !hideSelectOwnerWh}
            <SelectWarehouse bind:comp_id={$sharedData.sel_comp_id} bind:sel_wh_id={data.ownerWhID} label="Wybierz właściciela"/>
        {/if}

        <div class="flex mt-5 ">
            <button type="button" on:click={submit} class="btn grow shadow">Dodaj</button>   
            <i class="flex flex-col justify-center mx-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </i>
            <input type="number" bind:value={data.qty} class="prodQtyInput input input-bordered w-12 text-center p-[10px]" min='0' placeholder="0" />
        </div>
        

        {#if showAlert}
            {#key showAlert}
                <div class="w-full pt-4">
                    <AlertBox type={showAlert.type} message={showAlert.message}></AlertBox>
                </div>
            {/key}
        {/if}

        
    {:else}
        <h3 class="font-bold text-lg">Dodane przedmioty</h3>

        {#await data.addedItems} 
        {:then addeditems} 
            <div class="form-control w-full mt-3">
                <table class="table table-xs mt-2">
                        <thead>
                            <tr>
                                <th>Kod produktu</th>
                                <th>Nazwa</th>
                                <th class="w-0"></th>
                                <th class="w-0">Ilość</th>
                            </tr>
                        </thead>
                            <tbody>
                                    <tr>
                                        <td>{data.prod_code}</td>
                                        <td>{data.name}</td>
                                        <td>
                                            <i class="flex flex-col justify-center mx-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </i>
                                        </td>
                                        <td><input type="number" class="input input-xs input-bordered w-10 text-center p-[10px]" disabled value={data.qty} /></td>
                                    </tr>
                            </tbody>
                </table>
            </div>

            <div class="flex flex-col mt-2">
                <LabelPrintButton items={addeditems}/>
            </div>
        {/await}
    {/if}
</div>

<style>
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    /* Firefox */
    input[type=number] {
    -moz-appearance: textfield;
    }
</style>