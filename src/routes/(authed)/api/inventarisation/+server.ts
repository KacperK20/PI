import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';

export const GET: RequestHandler = async ({url}) => {

    const id = url.searchParams.get('id') ? Number(url.searchParams.get('id')) : 1;


    const products = await db.productQuantity.findMany({
        where: {
            invoiceId: id
        },
        include: {
            product: {
                select: {
                    name: true,
                    id: true,
                    price: true
                }
            }
        }
    });

    return json(products)
};