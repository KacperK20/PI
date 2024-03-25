import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types';
import filters from "$lib/server/filtering"

export async function GET({ url }) {

    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 15;
    const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : 0;

   
    let altHeaders = ['name', 'email', 'comp.name', 'user.username']; //sciezka do danych w bazie


    const caseInsensitive = url.searchParams.get('case') ? (url.searchParams.get('case')) : false;
    var boolValue = JSON.parse(caseInsensitive);
    
    const filterObj = await filters.generateFilters(altHeaders, url, boolValue)



    const result = await db.person.findMany({
        include: {
            user: { select: { username: true } }
        },
        where: {
            AND: [
                filterObj.filters]
        },
        orderBy: filterObj.sortOrder,
        skip: (skip) * limit,
        take: limit,
    })
    return json(result);
};

export const PUT: RequestHandler = async ({ request }) => {

    try {
        const data = await request.json();
        const person = await db.person.create({
            data: {
                name: data.name,
                email: data.email,
            }
        });
        return json(person);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        const deletedPerson = await db.person.delete({
            where: {
                id: parseInt(data.personId)
            }
        });
        return json(deletedPerson);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        const updatedPerson = await db.person.update({
            where: {
                id: parseInt(data.personId)
            },
            data: {
                name: data.name,
                email: data.email,
            }
        });
        return json(updatedPerson);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};