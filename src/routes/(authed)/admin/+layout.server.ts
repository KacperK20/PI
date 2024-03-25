import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit'

export const load = (async ({ locals}) => {

    if (locals.user.role != "ADMIN") {
        throw redirect(302, '/warehouse')
    }

    return {};
}) satisfies LayoutServerLoad;

