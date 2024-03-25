import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database'
import { redirect } from '@sveltejs/kit'
import { sharedData } from '../../../sharedData';
import { get } from 'svelte/store'

export const load: PageServerLoad = async ({ locals, fetch , parent, url   }) => {
  return {    
  
  }
}