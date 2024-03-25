import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import filters from '$lib/server/filtering'

export async function GET({ url }) {
    let altHeaders = ['name']; // nazwy do filtracji 

    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 15;
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;

    const caseInsensitive = url.searchParams.get('case') ? (url.searchParams.get('case')) : false;
    var boolValue = JSON.parse(caseInsensitive);
   
    const filterObj = await filters.generateFilters(altHeaders, url, boolValue)

    let results = await db.productCategory.findMany({
        where: {
            AND: [
                filterObj.filters,
            ]
        },
        orderBy: filterObj.sortOrder,
        skip: (page - 1) * limit,
        take: limit,
        select: {
            id: true,
            name: true
        },
    });
    return json(results);
};

export async function PUT({ url, request }) {
    const data = await request.json();
    console.log(data)
    const results = await db.productCategory.create({
        data: {
            name: data.name
        }
    });
    return json(results);
};

export async function PATCH({ url, request }) {
    const data = await request.json();
    const results = await db.product.update({
        data: {
            category: { connect: { name: data.name } }
        },
        where: {
            id: data.id
        }
    });
    return json(results);
};

export async function DELETE({ url, request }) {
    const data = await request.json();
    const results = await db.productCategory.delete({
        where: {
            id: data.id
        }
    });
    return json(results);
};