import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export async function GET({url}) {
    let prod_code = url.searchParams.get('prod_code') ?? "";
    let wh_id = Number(url.searchParams.get('wh_id')) ?? 0;
    const result = await db.item.count({
        where : {
            ...(prod_code && { prod_code: prod_code }), 
            status: "W magazynie",
            ...(wh_id !== 0 && { wh: {id : wh_id} }),
        }
    })
    
    if(result)return json(result)
    else return json(null)
    
};