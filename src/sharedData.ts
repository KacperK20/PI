// src/sharedDataStore.js
import { writable } from 'svelte/store';

export const sharedData = writable({ 
    sel_comp_id: 0,
    sel_wh_id: 0
});


