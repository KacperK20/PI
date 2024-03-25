<script lang="ts">
	import codeImgGen from '$lib/codeImgGen';
	import Modal from '$lib/components/Modal.svelte';
	import { movable } from '@svelte-put/movable';
    import bwipjs from 'bwip-js';
	import { onMount } from 'svelte';

	export let template = {
		name : "template",
		width : 50,
		height : 30,
		show_prod_code : true,
		show_uid_code : true,
		show_wh_name : true,
		show_prod_name : true,
		qr_code_size : 13,
		barcode_size : 13,
		text_size : 10,
		html : ""
	}

	let mounted = false;

	onMount(()=>{
		mounted = true;
		setTimeout(loadTemplate,1)
	})



	function loadTemplate(){
		if(template.html){
			const parsedTemplate = (new DOMParser).parseFromString(template.html,"text/html")
			if(template.show_prod_code)div.getElementsByClassName("barcode_img")[0].style.cssText = parsedTemplate.getElementsByClassName("barcode_img")[0].style.cssText;
			if(template.show_uid_code) div.getElementsByClassName("qrcode_img")[0].style.cssText = parsedTemplate.getElementsByClassName("qrcode_img")[0].style.cssText;
			if(template.show_wh_name) div.getElementsByClassName("wh_name_span")[0].style.cssText = parsedTemplate.getElementsByClassName("wh_name_span")[0].style.cssText;
			if(template.show_prod_name) div.getElementsByClassName("prod_name_span")[0].style.cssText = parsedTemplate.getElementsByClassName("prod_name_span")[0].style.cssText;
		}
	}

	function saveTemplate(){
		iframe.contentDocument.body.innerHTML = div.outerHTML;
		iframe.contentDocument.body.innerHTML += `
		<style>
			@page { size: auto;  margin: 0mm; }
			body {
				margin: 0;
				overflow : hidden;
				display: flex;
				justify-content : space-between;
				flex-wrap: wrap;
			}
			
			img {
				display: block;
				vertical-align: middle;
			}
			html {
				background: white;
				font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
				font-feature-settings: normal;
				font-variation-settings: normal;
			}
		</style>
		`
		if(template.show_prod_code) iframe.contentDocument.body.getElementsByClassName("barcode_img")[0].src="";
		if(template.show_uid_code) iframe.contentDocument.body.getElementsByClassName("qrcode_img")[0].src="";
		if(template.show_wh_name) iframe.contentDocument.body.getElementsByClassName("wh_name_span")[0].innerText="";
		if(template.show_prod_name) iframe.contentDocument.body.getElementsByClassName("prod_name_span")[0].innerText="";

		template.html = iframe.contentDocument.body.outerHTML;
	}

	let iframe : any;
	let div : any;

</script>

<div>	
	<!-- <label class="label cursor-pointer">
		<span class="label-text">Nazwa szablonu</span> 
		<input type="text" bind:value={template.name} placeholder="Wprowadź tekst" class="input input-bordered input-xs" />
	</label> -->
	<div>
		<label class="label cursor-pointer">
			<span class="label-text">Szerokość (mm)</span> 
			<input type="number" class="input input-xs" bind:value={template.width} />
		</label>
		<label class="label cursor-pointer">
			<span class="label-text">Wysokość (mm)</span> 
			<input type="number" class="input input-xs" bind:value={template.height} />
		</label>
		<label class="label cursor-pointer">
			<span class="label-text">Rozmiar tekstu</span> 
			<input type="number" class="input input-xs" bind:value={template.text_size} on:change={saveTemplate} />
		</label>
		<label class="label cursor-pointer">
			<span class="label-text">Nazwa magazynu</span> 
			<input type=checkbox  bind:checked={template.show_wh_name} class="checkbox" />
		</label>
		<label class="label cursor-pointer">
			<span class="label-text">Nazwa produktu</span> 
			<input type=checkbox  bind:checked={template.show_prod_name} class="checkbox" />
		</label>
		<label class="label cursor-pointer">
			<span class="label-text">Kod produktu (kod kreskowy)</span> 
			<input type=checkbox  bind:checked={template.show_prod_code} class="checkbox" />
		</label>
		<label class="label cursor-pointer">
			<span class="label-text">Kod przedmiotu (kod qr)</span> 
			<input type=checkbox  bind:checked={template.show_uid_code} class="checkbox" />
		</label>
	</div>

    <iframe bind:this={iframe} style="width:{template.width}mm; height:{template.height}mm;" class="border border-black bg-white hidden" />

	{#if mounted}
	<div bind:this={div} on:load={loadTemplate} style="width:{template.width}mm; height:{template.height}mm; position:relative;" class="border border-black">

		{#if template.show_prod_code}
			<img class="barcode_img" src={codeImgGen.barcode("1234")} style="height: {template.barcode_size}mm;width: {template.barcode_size*2}mm;"
			on:dragstart={e => {e.preventDefault();}}
			on:movableend={saveTemplate}
			use:movable={{ limit: { parent: div } }}
			>
		{/if}

		{#if template.show_uid_code}
			<img class="qrcode_img" src={codeImgGen.qrcode("1234")} style="height: {template.qr_code_size}mm;width: {template.qr_code_size}mm;"
			on:dragstart={e => {e.preventDefault()}}
			on:movableend={saveTemplate}
			use:movable={{ limit: { parent: div } }}
			>
		{/if}

		{#if template.show_prod_name}
		<span class="prod_name_span border border-black" use:movable={{ limit: { parent: div } }} 
			on:movableend={saveTemplate}
			style="
				width:90%;
				height:{template.text_size*2.5}px;
				position:absolute;
				top: 0;
				line-height:{template.text_size}px;
				font-size: {template.text_size}px;text-align:center;
				display:flex;
				align-items: center;
				justify-content: center;
			">
			Nazwa produktu
		</span>
		{/if}

		{#if template.show_wh_name}
		<span class="wh_name_span border border-black" use:movable={{ limit: { parent: div } }} 
			on:movableend={saveTemplate} 
			style="
				width:90%;
				height:{template.text_size*2.5}px;
				position:absolute;
				top: 0;
				line-height:{template.text_size}px;
				font-size: {template.text_size}px;text-align:center;
				display:flex;
				align-items: center;
				justify-content: center;
			">
			Nazwa magazynu
		</span>
		{/if}
	</div>
	{/if}
</div>