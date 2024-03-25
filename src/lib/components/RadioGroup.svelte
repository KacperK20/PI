<script lang="ts">
	export let options;
	export let legend;
	export let userSelected = options[0].value;
	export let fontSize = 16;
	export let flexDirection = 'column';

	const uniqueID = Math.floor(Math.random() * 100);

	const slugify = (str = '') => str.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
</script>

<div
	role="radiogroup"
	class=" flex flex-col w-full justify-center"
	aria-labelledby={`label-${uniqueID}`}
	style="font-size:{fontSize}px; flex-direction:{flexDirection}"
	id={`group-${uniqueID}`}
>
	<div id={`label-${uniqueID}`}>{legend}</div>
	{#each options as { value, label }}
		<div class="flex align-center space-x-2 my-1">
			<input class="radio" type="radio" id={slugify(label)} bind:group={userSelected} {value} />
			<label for={slugify(label)}> {label} </label>
		</div>
	{/each}
</div>
