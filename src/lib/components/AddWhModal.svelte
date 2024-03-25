<script lang="ts">
	import { sharedData } from "../../sharedData";


    export let closeModal: any;

    let data = {
        name: '',
        parent_wh_id: null
    };

    async function submit(){
            fetch(`/api/warehouse`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: data.name,
                    comp_id: $sharedData.sel_comp_id,
                    ...(data.parent_wh_id ? {parent_wh_id : data.parent_wh_id} :{})
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(async (r) => {
                console.log(r);
                closeModal();
            })
            .catch((err) => console.error(err));
    }
</script>

<div>
    <h3 class="font-bold text-lg">Utwórz magazyn</h3>
    <div class="form-control w-full m-0">
        <label class="label">
            <span class="label-text">Nazwa magazynu</span>
        </label>
        <input
            bind:value={data.name}
            type="text"
            placeholder="Wprowadź tekst"
            class="input input-bordered w-full "
        />
    </div>
    <button type="button" on:click={submit} class="btn btn-wide mt-5 w-full"
        >Utwórz</button
    >
</div>