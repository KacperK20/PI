<script lang="ts">
	import { movable } from '@svelte-put/movable';

	export let buttonText: string;
	export let buttonIcon : string;
	export let dialog: any = null;
	
	function openModal() {
		dialog.open = true;
	}

	function closeModal() {
		dialog.open = false;
		setTimeout(() => {
			form.style = '';
		}, 200);
	}

	let scanning = false;


	let form: any;
	let moveModalButton: any;
	
</script>

<div>
	<button type="button" class="btn shadow text-xs btn-sm  lg:text-sm {$$restProps.class ?? "lg:btn-md"}" on:click={openModal}>
		{@html buttonIcon}
		{buttonText}
	</button>
	<dialog bind:this={dialog} class="modal">
		<form
			bind:this={form}
			use:movable={{ limit: { parent: 'screen' }, handle: moveModalButton }}
			method="dialog"
			class="modal-box max-w-sm {scanning ? "h-full lg:h-auto": ""}">
			<div class="absolute right-2 top-2 flex">
				<button
					bind:this={moveModalButton}
					type="button"
					class="hidden lg:inline-flex btn btn-sm btn-circle btn-ghost"
				>
					<i class="rotate-45">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-4 h-4"
						>
							<path
								d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.747.747 0 01-.75-.75zM12.22 13.28l3.22 3.22h-2.69a.75.75 0 000 1.5h4.5a.747.747 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v2.69l-3.22-3.22a.75.75 0 10-1.06 1.06zM3.5 4.56l3.22 3.22a.75.75 0 001.06-1.06L4.56 3.5h2.69a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0V4.56z"
							/>
						</svg>
					</i>
				</button>
				<button type="button" class="btn btn-sm btn-circle btn-ghost" on:click={closeModal}>
					<i>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</i>
				</button>
			</div>
			
			{#if dialog && dialog.open}
				<slot {closeModal} />
			{/if}
		</form>
	</dialog>
</div>

<style>
	form {
		overflow: var(--overflow, auto);
	}

	.modal {
		background-color: #0006;
		animation: modal-pop 0.2s ease-out;
	}
</style>