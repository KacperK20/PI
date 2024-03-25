import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export async function GET({url}) {
    let name = url.searchParams.get('name') ?? "";

    if(name){
        const result = await db.product.findFirst({where : {name : name}, select: { prod_code: true }})
        
        if(result)return json(result.prod_code)
        else return json(null)
    }
    else {
        const allProdCodes = await db.product.findMany({select: { prod_code: true }});
        return json(allProdCodes);
    }
};