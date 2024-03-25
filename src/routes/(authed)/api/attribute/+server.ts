import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types';


export async function GET({ url }) {
    let results = await db.attribute.findMany({})
    return json(results);
};


export async function PUT({ request, cookies }) {
    try {
      
        const data = await request.json();
        let attribute
         attribute = await db.attribute.findUnique({ where: { name: data.name } })
      
        if (attribute == null) { 
             attribute = await db.attribute.create({
                data: {
                    name: data.name,
                    global: data.global,
                }
            });
        }


        const attributeValue = await db.attributeValue.create({
            data: {
                value: '',
                attribute: { connect: { id: attribute.id } },
                product: { connect: { id: data.product_id } }
            }
        });

        return json(attributeValue);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export async function DELETE({ request, cookies }) {
    const data = await request.json();
    const us = await db.attribute.findFirst({
        where: {
            name: data.username,
        }
    });

    if (us) {
        const attribute = await db.attribute.delete({
            where: {
                name: us.name,
            },
        })

        return json(attribute);
    }
    return json({ error: "Brak atrybutu o podanej nazwie" });
};

export async function PATCH({ request, cookies }) {
    const data = await request.json();


    const attribute = await db.attribute.update({
        data: {
            ...(data.name && { name: data.name }),
        },
        where: {
            id: data.attributeId
        }
    })

    return json(attribute);
};