import { error, json } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export async function GET({ url }) {
    const comp_id = Number(url.searchParams.get('comp_id') ?? 0);
    const parent_wh_id = url.searchParams.get('parent_wh_id') == "null" ? null : Number(url.searchParams.get('parent_wh_id') ?? 0);
    const wh_id = Number(url.searchParams.get('wh_id'));
    const subWhList = url.searchParams.get('subWhList');

    if (wh_id) {
        const result: any = await db.warehouse.findFirst({
            where: {
                id: wh_id
            },
            include: {
                parentWh : true,
                comp : true,
                inventarisations : {
                    where : {
                        closedAt : null
                    }
                }
            }
        })

        if (subWhList) {
            const subWhList = await getSubWarehouses(wh_id);
            result.subWhList = subWhList;
        }

        return json(result)
    }
    else {
    
    }
};

export async function PUT({ request, cookies }) {
    const data = await request.json();
    const comp_id: number = Number(data.comp_id);
    const parent_wh_id: number = data.parent_wh_id;

    const result = await db.warehouse.create({
        data: {
            name: data.name,
            comp: { connect: { id: comp_id } },
            ...(parent_wh_id && { parentWh: { connect: { id: parent_wh_id } } }),
        },
    })

    return json(result);
};

async function getSubWarehouses(wh_id: number) {
    let result = await db.warehouse.findMany({
        select: {
            id: true,
        },
        where: {
            parentWh: {
                id: wh_id
            }
        }
    });

    for (let wh of result) {
        result = result.concat(await getSubWarehouses(wh.id))
    }

    return result;
}

export async function PATCH({ request, cookies }) {
    const data = await request.json();
    let subWhList: any = (await getSubWarehouses(data.wh_id)).map(wh => wh.id)
    const result = await db.warehouse.update({
        data: {
            ...(data.name  && {name: data.name}),
            ...(data.parent_wh_id && !subWhList.includes(data.parent_wh_id) 
            ? {parentWh: {connect : {id : data.parent_wh_id}}} 
            : data.parent_wh_id == 0 ? {parentWh :{disconnect: true}}: {}),
        },
        where: {
            id: data.wh_id
        }
    })

    return json(result);
};

export async function DELETE({ request, cookies }) {
    try {
        const data = await request.json();

        const wh = await db.warehouse.findFirst({
            where: {
                id: data.id,
            }
        });
        const result = await db.warehouse.delete({
            where: {
                id: wh?.id,
            },
        })
        return json(result);
    } catch (error) {
        if (error.meta.field_name == "foreign key") return json({ message: "Magazyn nie jest pusty" }, { status: 500 });
        return json("Internal error");
    }
};