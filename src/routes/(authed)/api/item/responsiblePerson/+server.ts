import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/database'
import type { RequestHandler } from './$types';
import type { ResponsiblePersonToItem } from '@prisma/client';

export const GET: RequestHandler = async () => {
    return new Response();
};

export async function PUT({ request, cookies, fetch }) {
    const data = await request.json();
    let response;

    if(Array.isArray(data)){
        response = db.responsiblePersonToItem.createMany({
            data : data
        })
    }
    else {
        response = db.responsiblePersonToItem.create({
            data : data
        })
    }

    return json(response)
}

export async function POST({ request, cookies, fetch }) {
    const data = await request.json();
    if(data.ResponsiblePerson && data.item_uid){
       

        const transaction = await db.$transaction([
            db.responsiblePersonToItem.deleteMany({
                where  : {
                    item_uid : data.item_uid
                }
            }),

            db.responsiblePersonToItem.createMany({
                data : data.ResponsiblePerson.map(rp => ({item_uid : data.item_uid, person_uid : rp.person.uid}))
            }),
        ])

        return json(transaction)
    }
    else throw error(400, 'Error')
}

export async function DELETE({ request, cookies, fetch }) {
    const data : {item_uid : string, person_uid : string} = await request.json();
    let response;

    if(data.item_uid && !data.person_uid){
        response = await  db.responsiblePersonToItem.deleteMany({
            where : {
                item :  {uid : data.item_uid}
            }
        })
    }
    else if (data.item_uid && data.person_uid){
        response = await db.responsiblePersonToItem.delete({
            where : {
                item_uid_person_uid : data
            }
        })
    }
    else if(Array.isArray(data)){
        response = await  db.responsiblePersonToItem.deleteMany({
            where : {OR : data}
        })
    }

    return json(response)
}
