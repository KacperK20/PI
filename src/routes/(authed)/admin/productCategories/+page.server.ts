import type { PageServerLoad } from './$types';

export const load = (async ({fetch}) => {
    const result = await fetch(`/api/product/category?limit=10&page=1`);
    let categories = await result.json();

    const results = await fetch(`/api/status?limit=10&page=1`);
    let status = await results.json();
  
    return {
        categories,
        status
    };
}) satisfies PageServerLoad;