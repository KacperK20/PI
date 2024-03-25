import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import filters from '$lib/server/filtering'

export const GET: RequestHandler = async ({ url }) => {
    let prod_code = url.searchParams.get('prod_code') ?? "";
    let name = url.searchParams.get('name') ?? "";

    let altHeaders = ['name', 'prod_code' , 'unit']; // nazwy do filtracji 

    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 15;
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;

    const caseInsensitive = url.searchParams.get('case') ? String(url.searchParams.get('case')) : "false";
    var boolValue = JSON.parse(caseInsensitive);
   
    const filterObj = await filters.generateFilters(altHeaders, url, boolValue)



    if (prod_code || name) {
        const result = await db.product.findFirst({
            where: {
                AND: [
                    {
                        OR: [{ prod_code: prod_code },
                        { name: name },]
                    },
                    filterObj.filters,
                ]
            },
            orderBy: filterObj.sortOrder,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                category: true,
            }
        })

        if (result) return json(result)
        else return json(null)
    }
    else {
        const results = await db.product.findMany({
            include: {
                category: true
            },
            where:{ AND : filterObj.filters,},
            orderBy: filterObj.sortOrder,
            skip: (page - 1) * limit,
            take: limit,
        })
        return json(results);
    }
};



export async function PUT({ request, cookies }) {
    const data = await request.json();


    try {
        const globalAtr = await db.attribute.findMany({
            where: { global: true }
        });

        const result = await db.product.create({
            data: {
                name: data.name,
                prod_code: data.prod_code,
                price: String(data.prod_price),
            },
        });

        for (const atr of globalAtr) {

            await db.attributeValue.create({
                data: {
                    attribute_uid: atr.uid,
                    product_uid: result.uid,
                },
            });
        }

        return json(result);
    } catch (error) {
        console.error('Create failed', error);
        return json({ error: 'Create failed: ' + error.message }, { status: 500 });
    }
};


export async function DELETE({ request, cookies }) {
    const data = await request.json();

    const result = await db.product.delete({
        where: {
            name: data.name,
        },
    })

    return json(result);
};

export async function PATCH({ request, cookies }) {
    try {
        const data = await request.json();
        
        const existingProduct = await db.product.findUnique({
            where: { name: data.name },
        });

        if (!existingProduct) {
            console.error('Product not found', data.name);
            return json({ error: 'Product not found' }, { status: 404 });
        }
        console.log(data)
        const updateData = {
            ...(data.image !== null && { image: data.image }),
            ...(data.newname !== null && { name: data.newname }),
            ...(data.prod_price !== null && { price: data.prod_price }),
        };
        const result = await db.product.update({
            data: updateData,
            where: {
                name: data.name
            }
        });

        return json(result);
    } catch (error) {

        console.error('Update failed', error);
        return json({ error: 'Update failed' }, { status: 500 });
    }
};