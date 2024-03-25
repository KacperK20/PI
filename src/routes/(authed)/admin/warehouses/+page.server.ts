import type { PageServerLoad } from './companies/$types';
import type { Action, Actions, PageServerLoad } from './companies/$types'
import { fail, redirect } from '@sveltejs/kit'

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;