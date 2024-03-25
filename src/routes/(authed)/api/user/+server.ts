import { error, json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import bcrypt from 'bcrypt'
import filters from '$lib/server/filtering'
export async function GET({ url }) {

    let altHeaders = ['username', 'person.name', 'role.name']; // nazwy do filtracji 
   
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 15;
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;

    const caseInsensitive = url.searchParams.get('case') ? (url.searchParams.get('case')) : false;
    
    var boolValue = JSON.parse(caseInsensitive); 

    const filterObj = await filters.generateFilters(altHeaders , url , boolValue)

    

    let results = await db.user.findMany({

            where: {AND : filterObj.filters},
            orderBy:  filterObj.sortOrder,
            skip: (page - 1) * limit,
            take: limit,
            select: {
                username: true,
                person: true,
                role: true,
                id : true,
                uid : true
            },
        });
    return json(results);
};

export async function PUT({ request, cookies }) {
    const data = await request.json();
  
    const result = await db.user.create({
        data: {
            username: data.username,
            role: { connect: { id: parseInt(data.role_id) } },
            passwordHash: await bcrypt.hash(data.passwordHash, 10),
            userAuthToken: crypto.randomUUID(),
            ...(data.addPerson ? {
                person: {
                    create: {
                        name: data.username,
                    }
                }
            } : {})
        }
    })

    return json(result);
};

export async function PATCH({ request, cookies }) {
    const data = await request.json();
   
    const result = await db.user.update({
        data: {
            ...(data.username && { username: data.username }),
            ...(data.password && { passwordHash: await bcrypt.hash(data.password, 10) }),
            ...(data.role && { role: { connect: { name: data.role } }}),
            ...(data.person && { person: { connect: { id: data.person } }}),
        },
        where: {
            uid: data.user_uid
        }
    });

    return json(result);
};




export async function DELETE({ request, cookies }) {
    try {
        const data = await request.json();
        const result = await db.user.delete({
            where: {
                uid: data.user_uid,
            }
        });

        return json(result);
    } catch (error) {
        console.log(error)

        return json({ message: "Blad usuwania uzytkownika" }, { status: 500 });
    }
};