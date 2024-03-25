import type { Warehouse, Company } from '@prisma/client'
import { redirect } from '@sveltejs/kit'
import { db } from '$lib/server/database';

export async function load({ fetch, cookies, url, locals }) {
    let companies = await (await fetch(`/api/company`)).json()

    return {    
        companies,
    };
}