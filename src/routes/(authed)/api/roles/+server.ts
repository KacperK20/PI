import { error, json } from '@sveltejs/kit'
import { db } from '$lib/server/database'


export async function GET({ url }) {


    const results = await db.roles.findMany({
    }) 
    
    return json(results)
};