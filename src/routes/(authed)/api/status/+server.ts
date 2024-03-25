import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import { action_type } from '$lib/action_type.js';

export async function GET({ url }) {

    let results = await db.item.findMany({
         select: {
            condition: true
        },
        distinct: ['condition'],
      });

      return json(results);
    }

export async function PATCH({ url, request }) {
    const data = await request.json();
    const item = data.item;
    const results = await db.item.update({
        data: {
            condition: data.condition
        },
        where: {
            id: data.id
        }
    });
    
    const action = db.itemAction.create({
        data: {
            type: action_type.UPDATE,
            wh: {connect: {id : item.wh.id}},
            item: {connect : {id : item.id}},
            user: {connect : {uid : data.user}},
        }
    })

    return json(results);
};
