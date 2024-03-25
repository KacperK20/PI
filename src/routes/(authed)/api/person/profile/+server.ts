import { db } from '$lib/server/database';
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types';


export async function GET({ url }) {
    let id = Number(url.searchParams.get('id'));
    if (id) {
        try {
            const result = await db.person.findFirst({
                where: {
                    id: id
                },
                include: {
                    warehouse: true,
                    ItemsResponsible: { include: { item: { include: { product: true } } } },
                }

            })
            return json(result);
        }
        catch {
            return json({ error: "Blad wyszukiwania osoby" }, { status: 500 });
        }} 
    else {
        return json({error: "Blad wyszukiwania osoby"}); 
    }
}

export const PUT: RequestHandler = async ({ request }) => {

    try {
        const data = await request.json();
        const person = await db.person.create({
            data: {
                name: data.name,
                comp: { connect: { id: parseInt(data.comp_id) } },
                email: data.email,
                ...(data.name ? {
                    warehouse: {
                        create: {
                            name: data.name,
                            comp: { connect: { id: parseInt(data.comp_id) } },
                        }
                    }
                } : {}),

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
                comp: { connect: { id: data.comp } },
                email: data.email,
            }
        });
        return json(updatedPerson);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}; 