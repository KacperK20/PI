<script lang="ts">
    export let value : string = "";
    export let placeholder : string = ""
    let timer : any;
</script>

<input id="password" name="password" type="password" placeholder={placeholder} class="w-full input input-bordered" bind:value={value} on:input={(event) => {
    event.target.type = "text"
    clearTimeout(timer)
    timer = setTimeout(() => {
        event.target.type = "password"
    }, 500);
}} />

