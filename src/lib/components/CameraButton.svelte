<script lang="ts">
	import * as ExifReader from 'exifreader';


    export let imageResult : (base64Data: any, geolocation: any) => void;
    export let upload_btn = false
    export let small_btn = false
    export let long_btn = false
    export let responsive = true
    export let just_btn = false
    
	const upload = () => {
		const fileInput = document.getElementById("selectFile");
    	fileInput.click();
	}

	const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    
    ExifReader.load(selectedFile).then(function (tags) {
        let geolocation = '';

        if (tags['GPSLatitude'] && tags['GPSLongitude']) {
            const latitude = tags['GPSLatitude'].description;
            const longitude = tags['GPSLongitude'].description;
            geolocation = `Latitude: ${latitude}, Longitude: ${longitude}`;
        } else {
            geolocation = 'Geolocation data not found in the image.';
        }

        const FR = new FileReader();
		FR.readAsDataURL(selectedFile);
        FR.addEventListener('load', function (evt) {
            const base64Data = evt.target.result;
            imageResult( base64Data , geolocation);
        });

    });

};
</script>

<div>
    <input id="selectFile" type="file" class="file-input w-full  {small_btn ? "file-input-sm" : ""} {responsive ? 'hidden' : ''} {just_btn ? "" : "lg:block" }" on:change={handleFileChange} accept="image/*" capture="environment" />
    <button type="button" class="btn {small_btn ? "btn-sm" : ""} {long_btn ? "w-full" : ""} d-none d-md-block {just_btn ? "" : "lg:hidden" } {responsive ? '' : 'hidden'}" on:click={upload}>
        <i>
            {#if upload_btn}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={small_btn ? "w-5 h-5" : "w-6 h-6"}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {:else}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={small_btn ? "w-5 h-5" : "w-6 h-6"}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            {/if}
        </i>
    </button>
</div>
