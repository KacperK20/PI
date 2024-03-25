import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export async function GET({ url }) {

    let comp_id = Number(url.searchParams.get('comp_id'))

    if (comp_id) {
        const results = await db.transaction.findMany({
            where: {
                OR: [
                    { srcComp: {id : comp_id} },
                    { dstComp: {id : comp_id} }
                ]
            },
            include : {
                srcComp : {select : {name : true}},
                dstComp : {select : {name : true}}
            },
            orderBy: {
                id: 'desc'
            },

        })


        const data = results.map((transaction) => ({
            id: transaction.id,
            srcComp_id: transaction.srcComp.name,
            dstComp_id: transaction.dstComp.name,
            src_person: transaction.srcPerson,
            prod_type: transaction.dstPerson,
            status: transaction.status,
            createdAt: transaction.createdAt,
        }));

        return json(data);

    }
    else {
        const results = await db.transaction.findMany({
            include : {
                srcComp : {select : {name : true}},
                dstComp : {select : {name : true}}
            }
        })

        const data = results.map((transaction) => ({
            id: transaction.id,
            srcComp_id: transaction.srcComp.name,
            dstComp_id: transaction.dstComp.name,
            src_person: transaction.srcPerson,
            prod_type: transaction.dstPerson,
            status: transaction.status,
            createdAt: transaction.createdAt,
        }));

        return json(data);

    }
};
