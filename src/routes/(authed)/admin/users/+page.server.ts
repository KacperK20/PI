import type { PageServerLoad } from './$types';

export const load = (async ({fetch}) => {
    const result = await fetch(`/api/user?limit=10`);
    let users = await result.json();
    return {
        users
    };
}) satisfies PageServerLoad;