import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import filters from "$lib/server/filtering"

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
    const wh_id = Number(url.searchParams.get('wh_id') ?? '0');
    const comp_id = Number(url.searchParams.get('comp_id') ?? '0');
    const user_uid = url.searchParams.get('user_uid') ?? null;

    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 10;
    const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : 0;
       
   
    let altHeaders = [ 'item.product.name', 'wh.name', 'user.username']; //sciezka do danych w bazie


    const caseInsensitive: any = url.searchParams.get('case') ? (url.searchParams.get('case')) : false;
    var boolValue = JSON.parse(caseInsensitive);

    const filterObj = await filters.generateFilters(altHeaders, url, boolValue)




    let results = await db.itemAction.findMany(
        {
        skip: (skip) * limit,
        take: limit,
        where: {
            AND: [
                {...(comp_id && { wh: { comp: { id: comp_id } } }),
                ...(wh_id && {
                    OR: [
                        { wh: { id: wh_id } },
                        {
                            wh: {
                                id: { in: (await getSubWarehouses(wh_id)).map(wh => wh.id) }
                            }
                        }
                    ]
                }),
                ...(user_uid && { user_uid: user_uid }),},
            
            {...filterObj.filters},]
        },
        orderBy:
            filterObj.sortOrder
        ,
        include: {
            item: { include: { product: true } },
            user: {
                include: { person: true }
            },
            ...(!wh_id && { wh: true }),
        },
        
    })


    return json(results)
};


