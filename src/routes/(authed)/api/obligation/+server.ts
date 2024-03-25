import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types';
import filters from "$lib/server/filtering"

export async function GET({ url }) {

    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 15;
    const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : 1;


    let altHeaders = ['title', 'optional', 'dueTime' , 'amount' , 'contractor.name']; //sciezka do danych w bazie


    const caseInsensitive = url.searchParams.get('case') ? (url.searchParams.get('case')) : false;
    var boolValue = JSON.parse(caseInsensitive);
      
    const filterObj = await filters.generateFilters(altHeaders, url, boolValue)


  

    const result = await db.obligation.findMany({
        where: {
            AND: [
                filterObj.filters]
        },
        include: {contractor: true},
        orderBy: filterObj.sortOrder,
        skip: (skip - 1) * limit,
        take: limit,
    })
    
    return json(result);
};

export const PUT: RequestHandler = async ({ request }) => {

    try {
        const data = await request.json();
        console.log(data.contractor)
        const obligation = await db.obligation.create({
            data: {
                title: data.title,
                optional: data.optional,
                dueTime: data.dueTime,
                amount: data.amount, 
                invoicePath: data.invoicePath,
                contractorId: data.contractor, 
                
            }
        });
        return json(obligation);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        const deletedPerson = await db.obligation.delete({
            where: {
                id: parseInt(data.obligationId)
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
        const updatedPerson = await db.obligation.update({
            where: {
                id: parseInt(data.obligationId)
            },
            data: {
                title: data.title,
                optional: data.optional,
                dueTime: data.dueTime,
                amount: data.amount, 
                invoicePath: data.invoicePath,
                contractorId: Number(data.contractor), 
            }
        });
        return json(updatedPerson);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};