<script lang="ts">
    export let data: any;
</script>

<div class="m-5">
    <div class="overflow-x-auto">
      <table class="table table-xs">
        <thead>
            <tr>
              {#if data.table_data[0]}
                {#each Object.keys(data.table_data[0]) as column}
                <th>{column}</th>
                {/each}
              {/if}
              
            </tr>
          </thead>
          <tbody>
            {#each data.table_data as el}
              <tr>
                {#each Object.keys(el) as key}
                    <td>
                    {#if typeof el[key] === 'object'}
                      {JSON.stringify(el[key])}
                    {:else}
                      {el[key]}
                    {/if}
                    </td>
                {/each}
              </tr>
            {/each}
          </tbody>
      </table>
    </div>
  </div>

  <style>
    td {
        max-width: 250px;
        overflow: auto;
    }
  </style>