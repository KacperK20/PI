import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'

async function getSubWarehouses(wh_id: number) {
    let result = await db.warehouse.findMany({
        select: {
            id: true,
        },
        where: {
            parentWh: { id: wh_id }
        }
    });

    for (let wh of result) {
        result = result.concat(await getSubWarehouses(wh.id))
    }

    return result;
}

export async function GET({ url }) {
    let wh_id
    let comp_id = Number(url.searchParams.get('comp_id'))
    wh_id = Number(url.searchParams.get('wh_id'))
    if (wh_id) { /* wh_id = wh_id.split(',').map(x => parseInt(x));  */
        const subWarehouses = await getSubWarehouses(wh_id);
        wh_id = [wh_id, ...subWarehouses.map(obj => obj.id)]
    }
    


    if (comp_id || wh_id) {
        const results = await db.item.findMany({
            include: {
                wh: {
                    include: {
                        comp: true, // assuming 'comp' is the relation name for 'comp_id' in 'warehouse' table
                    },
                },
                product: {
                    select: {
                        name: true,
                        prod_code: true
                    }
                }
            },

            where: wh_id ? { wh: { id: { in: wh_id } } }
                : {
                    wh: {
                        comp: { id: comp_id }
                    }
                },
            orderBy: {
                id: 'desc'
            },

        })
        const data = results.map((item) => ({
            id: item.id,
            name: item.product.name,
            prod_code: item.product.prod_code,
            wh_name: item.wh.name,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            type: item.type
        }));

        return json(data);

    }
    else {
        const results = await db.item.findMany({
            include: {
                wh: {
                    include: {
                        comp: true, // assuming 'comp' is the relation name for 'comp_id' in 'warehouse' table
                    }
                },
                product: {
                    select: {
                        name: true,
                        prod_code: true
                    }
                }
            },
        })

        const data = results.map((item) => ({
            id: item.id,
            name: item.product.name,
            prod_code: item.product.prod_code,
            wh_name: item.wh.name,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            type: item.type
        }));

        return json(data);

    }
};
