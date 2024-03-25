import type { PageServerLoad } from './$types';
import type { Action, Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;