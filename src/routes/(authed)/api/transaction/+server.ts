import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export async function GET({ url }) {
    let comp_id = Number(url.searchParams.get('comp_id'))
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : null;
    const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : null;
    
    if(comp_id){
        const results = await db.transaction.findMany({
            where: {
                OR: [
                    {srcComp: {id : comp_id}},
                    {dstComp: {id : comp_id}},
                ]
            },
            include: {
                items: {
                    include : {
                        item : {
                            include : {
                                product : true
                            }
                        }
                    }
                },
                srcComp: true,
                dstComp: true,
                images : true
            },
            orderBy: {
                id: 'desc'
            },
            ...skip ? { skip } : {},
            ...limit ? { take: limit } : {}
        })

    return json(results)
    }
    else return json("Error. Didn't specify company id")
};
