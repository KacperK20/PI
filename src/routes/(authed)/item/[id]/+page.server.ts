import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';
import { error, fail, redirect } from '@sveltejs/kit';


export async function load({ fetch, cookies, locals, params })  {
    const {id} = params;

    let item = await (await fetch(`/api/item?uid=${id}`)).json()

    if(!item){
        throw error(404, "Brak przedmiotu z UUID: "+id)
    }

    let itemActions = (await db.item.findFirst({
        where: {
            uid : id
        },
        include: {
            ItemActions : {
                include: {
                    wh: {
                        include : {
                            comp : true
                        }       
                    },
                    user :{
                        include: {
                            person : true
                        }
                    },
                },
                orderBy: {
                    id: "desc"
                }
            },
            product : true,
            wh : true
        }
    }))

    return {
        item,
        itemActions : itemActions?.ItemActions
    };
};
