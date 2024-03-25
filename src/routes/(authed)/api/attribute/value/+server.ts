import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types';

export async function GET({ url }) {
    let productId = Number(url.searchParams.get('productId'));
    
    const product = await db.product.findFirst({
        where: { id: productId },
        include: {
            attributeValues: {
                select: {
                    value: true,
                    attribute: true, 
                    product: true,
                },
            }
        }
    });
    console.log(productId)
    if (!product) {
        console.error(`Product with id ${productId} does not exist`);
        return { status: 404, body: { error: `Product with id ${productId} does not exist` } };
    } else {
        return json(product);
    }
}


export async function PUT({ request, cookies }) {

    try {
        const data = await request.json();

        const attributeValue = await db.attributeValue.create({
            data: {
                value: data.name,
                attribute: { connect: { id: data.attribute_uid } },
                product: { connect: { id: data.product_id } },
            }
        });
        return json(attributeValue);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export async function DELETE({ request, cookies }) {
    const data = await request.json();

    // POPRAWIC data.productId i data.attributeId na uid
    const attributeValue = await db.attributeValue.delete({
        where: {
            product_uid_attribute_uid: {
                product_uid: data.product_uid,
                attribute_uid: data.attribute_uid // Include attributeId in the where clause
            }
        },
    })

    return json(attributeValue);
};

export async function PATCH({ request, cookies }) {
    const data = await request.json();
    const attributeValue = await db.attributeValue.update({

        where: {
            product_uid_attribute_uid: {
                product_uid: data.product_uid,
                attribute_uid: data.attribute_uid   }
        },
        data: {
            value: data.value
        }
    });


    return json(attributeValue);
};