import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types';
import filters from "$lib/server/filtering"

export async function GET({ url }) {

    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 15;
    const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : 1;


    let altHeaders = ['name', 'email', 'NIP' , 'account' , 'phone' , 'cod' , 'city' , 'street']; //sciezka do danych w bazie

    const caseInsensitive = url.searchParams.get('case') ? (url.searchParams.get('case')) : false;
    var boolValue = JSON.parse(caseInsensitive);
      
    const filterObj = await filters.generateFilters(altHeaders, url, boolValue)


  

    const result = await db.contractor.findMany({
        where: {
            AND: [
                filterObj.filters]
        },
        orderBy: filterObj.sortOrder,
        skip: (skip - 1) * limit,
        take: limit,
    })
    return json(result);
};

export const PUT: RequestHandler = async ({ request }) => {

    try {
        const data = await request.json();
        console.log(data)
        const contractor = await db.contractor.create({
            data: {
                name: data.name,
                email: data.email,
                NIP: data.NIP,
                account: data.account, 
                phone: data.phone, 
                cod: data.cod,
                city: data.city, 
                street: data.street, 
            }
        });
        return json(contractor);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        const deletedContractor = await db.contractor.delete({
            where: {
                id: parseInt(data.contractorId)
            }
        });
        return json(deletedContractor);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        const updatedContractor = await db.contractor.update({
            where: {
                id: parseInt(data.contractorId)
            },
            data: {
                name: data.name,
                email: data.email,
                NIP: data.NIP,
                account: data.account, 
                phone: data.phone, 
                cod: data.cod,
                city: data.city, 
                street: data.street, 
            }
        });
        return json(updatedContractor);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};