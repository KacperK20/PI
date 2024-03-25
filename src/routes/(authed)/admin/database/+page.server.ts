import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database'

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;