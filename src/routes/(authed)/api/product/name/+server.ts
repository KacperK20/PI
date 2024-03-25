import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export async function GET({url}) {
    let prod_code = url.searchParams.get('prod_code') ?? "";
    let category = url.searchParams.get('category') ?? "";
    if(prod_code){
        const result = await db.product.findFirst({where : {prod_code : prod_code}, select: { name: true }})
        
        if(result)return json(result.name)
        else return json(null)
    }
    else if(category){
        const results = await db.product.findMany({
            where : {category : {name : category}}, 
            select: { name: true }
        })
        const names = results.map(item => item.name);
        return json(names);
    }
    else {
        const result = await db.product.findMany({select: { name: true }});
        const names = result.map(item => item.name);
        return json(names);
    }
};

export async function PATCH({ url, request }) {
    const data = await request.json();  
    

    const results = await db.item.updateMany({
        where: {
            condition: data.condition
        },
        data: {
            condition: null
        }
    });
    return json(results);
};