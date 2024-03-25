import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types';
import { empty } from '@prisma/client/runtime/library';


export async function GET({ url }) {
    let results = await db.attribute.findMany({})
    return json(results);
};


export async function PUT({ request, cookies }) {
    try {
        const data = await request.json();


        const attribute = await db.attribute.create({
            data: {
                name: data.name,
                global: data.global,
            }
        });
        const products = await db.product.findMany({}); // Assuming "product" is the name of the model
        
        for (const product of products) {
         
            await db.attributeValue.create({
                data: {
                    value: '',
                    attribute: { connect: { id: attribute.id } },
                    product: { connect: { id: product.id } },

                }
            });
        }

        return json(attribute);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export async function DELETE({ request, cookies }) {
    const data = await request.json();

    const attribute = await db.attribute.delete({
        where: {
            name: data.name,
        },
    })

    return json(attribute);
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