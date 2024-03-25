<script lang="ts">
    export let skip : number;
</script>

<div class="join flex justify-center">
    <button on:click={() => {if(skip > 0)skip--}} class="join-item btn">«</button>
    <button class="join-item btn">{skip + 1}</button>
    <button on:click={() => skip++} class="join-item btn">»</button>
  </div>