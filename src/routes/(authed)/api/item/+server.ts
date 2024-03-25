import { error, json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import type { Item } from '@prisma/client';
import { action_type } from '$lib/action_type.js';
import filters from "$lib/server/filtering"

async function getAllWarehouses(wh_id: number | null = null, comp_id: number | null = null) {
    let result = await db.warehouse.findMany({
        select: {
            id: true,
            comp: { select : {id : true}},
            subWarehouses: {
                select: {
                    id: true
                }
            }
        },
        where: {
            ...(wh_id ? { id: wh_id } : {}),
            ...(comp_id ? { comp : {id: comp_id} } : {})
        }
    });
    for (let wh of result) {
        if (wh.subWarehouses.length > 0) {
            for (let subwh of wh.subWarehouses) {
                result = result.concat(await getAllWarehouses(subwh.id))
            }
        }
    }

    return result;
}

export async function GET({ url }) {
    const uid = url.searchParams.get('uid')
    const prod_code = url.searchParams.get('prod_code')
    const comp_id = Number(url.searchParams.get('comp_id') ?? '0');
    const wh_id = Number(url.searchParams.get('wh_id') ?? '0');
    const count = Number(url.searchParams.get('count') ?? '0');

    let response = null;


        
    if (uid) {
        const result = await db.item.findFirst({
            where: {
                uid: uid,
                ...(wh_id ? { wh : { id : wh_id } } : {}),
                ...(comp_id ? { comp : { id : comp_id } } : {})
            },
            include: {
                wh: {
                        include : {
                        comp : true
                    }
                },
                product: {
                    include: {
                        category: true
                    }
                },
                ownerWh: {
                    include : {
                        comp : true
                    }
                },
                ResponsiblePerson : {
                    select : {
                        person : true
                    }
                },
            }
        })

        response = result;
    }
    else if (prod_code) {
        const wh_id = Number(url.searchParams.get('wh_id') ?? '0');
        const warehouses = await getAllWarehouses(wh_id)
        let whList = Array.from(new Set(warehouses.map(wh => wh.id)));
        const result = await db.item.findMany({
            where: {
                product: {
                    prod_code: prod_code
                },
                status: { not: "Usunięto" },
                wh: { id : {in: whList} }
            },
            include: {
                wh: true,
                product: {
                    include: {
                        category: true
                    }
                },
                ownerWh: true
            }
        })

        response = result;
    }
    else {

        const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : null;
        const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : null;

     
        const warehouses = await getAllWarehouses(wh_id, comp_id)

        
        let whList = Array.from(new Set(warehouses.map(wh => wh.id)));
 
        let altHeaders = ['product.name', 'product.category.name', 'product.prod_code', 'wh.name', 'condition', 'status', "ResponsiblePerson.some.person.name","type", "createdAt", "updatedAt", "product.unit", "amount"]; //sciezka do danych w bazie


     const caseInsensitive = url.searchParams.get('case') ? (url.searchParams.get('case')) : false;
     var boolValue = JSON.parse(caseInsensitive);

     const filterObj = await filters.generateFilters(altHeaders, url, boolValue)
        
        const result = await db.item.findMany({
            select: {
                id: true,
                uid: true,
                condition: true,
                status: true,
                type : true,
                createdAt : true,
                updatedAt : true,
                amount : true,
                wh: {
                    select: {
                        id: true,
                        name: true,
                        comp: true
                    }
                },
                product: {
                    include: {
                        category: true
                    }
                },
                ownerWh: {
                    select: {
                        id: true,
                        name: true,
                        comp: true
                    }
                },
                ResponsiblePerson : {
                    select : {
                        person : {
                            select : {
                                name : true
                            }
                        }
                    }
                }
            },
            where: {
                status: { not: "Usunięto" },
                AND: [
                    {
                        OR: [
                            { wh : {id: { in: whList }} },
                            { ownerWh: { id : {in: whList} } },
                        ]
                    },
                    {...filterObj.filters},
                ]
            },
            orderBy: filterObj.sortOrder,
        })

        if (count) {

            let grouped : any = await db.item.groupBy({
                by : ["product_uid", "status", "wh_uid", "condition", "ownerWh_uid"],
                _sum : {
                    amount : true
                },
                where: {
                    status: { not: "Usunięto" },
                    AND: [
                        {
                            ...filterObj.filters,
                        }
                    ]
                }
            })
            let i = 1;
            for(let group of grouped){

                const groupCopy = { ...group };
                delete groupCopy._sum;
                let items = await db.item.findMany({
                    select : {
                        uid : true
                    },
                    where : groupCopy
                })
                group["uids"] = items.map(i => i.uid)
                
                group["product"] = await db.product.findUnique({
                    select : {
                        name : true,
                        prod_code : true,
                        category : {
                            select : {
                                name : true
                            }
                        },
                        unit : true
                    },
                    where : {uid : group.product_uid}
                })
                delete group.product_uid;

                group["wh"] = await db.warehouse.findUnique({
                    select: {
                        id: true,
                        name: true,
                        comp: true
                    },
                    where : {uid : group.wh_uid}
                })
                delete group.wh_uid;

                group["ownerWh"] = await db.warehouse.findUnique({
                    select: {
                        id: true,
                        name: true,
                        comp: true
                    },
                    where : {uid : group.ownerWh_uid}
                })
                delete group.ownerWh_uid;

                group["amount"] = group._sum.amount
                delete group._sum

                group["group_id"] = i++;
            }

            const flattenObject = (ob) => {
                const toReturn = {};
                for (const i in ob) {
                  if (!ob.hasOwnProperty(i)) continue;
              
                  if (typeof ob[i] === 'object' && ob[i] !== null) {
                    const flatObject = flattenObject(ob[i]);
                    for (const x in flatObject) {
                      if (!flatObject.hasOwnProperty(x)) continue;
              
                      toReturn[i + '.' + x] = flatObject[x];
                    }
                  } else {
                    toReturn[i] = ob[i];
                  }
                }
                return toReturn;
            };

            var sortByNested = function (prop, arr, dir) {
                prop = prop.split('.');
                var len = prop.length;
            
                arr.sort(function (a, b) {
                    var i = 0;
                    while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
                    if (dir === "asc") {
                        if (a < b) {
                            return -1;
                        } else if (a > b) {
                            return 1;
                        } else {
                            return 0;
                        }
                    } else if (dir === "desc") {
                        if (a < b) {
                            return 1;
                        } else if (a > b) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });
                return arr;
            };

            if(sort){
                let flat = flattenObject(filterObj.sortOrder);
                let keyPath = Object.keys(flat)[0]
                let keyDir = flat[keyPath]
                sortByNested(keyPath,grouped,keyDir)
            }


            response = grouped;
        }
        else {
            response = result;
        }

        if (skip && limit){
            response = response.slice(skip, skip + limit);
        }
        else if (!skip && limit){
            response = response.slice(0, limit);
        }
    }
    return json(response)
};

export async function PUT({ request, cookies }) {
    const data = await request.json();
    let response = [];

    if (!data.qty) data.qty = 1


    const existingProduct = await db.product.findFirst({
        where: {
            prod_code: data.prod_code
        }
    });

    let registeredProduct;
    if (!existingProduct) {
        let category;

        category = await db.productCategory.findFirst({
            where: {
                name: data.category
            }
        });

        if (!category) {
            category = await db.productCategory.create({
                data: {
                    name: data.category
                }
            });
        }

        registeredProduct = await db.product.create({
            data: {
                name: data.name,
                prod_code: data.prod_code,
                unit: data.unit,
                category: { connect: { name: data.category } }
            },
        });

    } else {
        registeredProduct = existingProduct;
    }

    for (let i = 0; i < data.qty; i++) {
        const registeredItem = await db.item.create({
            data: {
                desc: data.desc,
                wh: {connect : {id : data.wh_id}},
                ownerWh: {connect : {id : data.ownerWhId}},
                status: 'W magazynie',
                product: {connect : {id : registeredProduct.id}},
                ...(data.amount ? { amount: data.amount } : {}),
                ...(data.type ? { type: data.type } : {}),
            },
            include: {
                product: true,
                wh: true
            }
        })

        if(data.responsiblePersons){
            for(let person of data.responsiblePersons){
                await db.responsiblePersonToItem.create({
                    data : {
                        item_uid : registeredItem.uid,
                        person_uid : person.uid
                    }
                })
            }
        }

        if (data.from_person) {
            let src_person = await db.person.findFirst({
                where: {
                    name: data.src_person,
                    comp: {id : data.srcComp_id}
                }
            })

            if (!src_person) {
                src_person = await db.person.create({
                    data: {
                        name: data.src_person,
                        comp: { connect: { id: data.srcComp_id } },
                        email: "",
                        warehouse : {
                            create : {
                                name: data.src_person,
                                comp: { connect: { id: data.srcComp_id } }
                            }
                        }
                    },
                    include : {
                        comp : {
                            select : {id : true}
                        },
                        warehouse : {
                            select : {id : true}
                        }
                    }
                });
            }

            await db.itemAction.create({
                data: {
                    type: action_type.GIVEOUT,
                    wh_uid: src_person.wh_uid!,
                    item_uid: registeredItem.uid,
                    user_uid: data.user
                }
            })

            await db.itemAction.create({
                data: {
                    type: action_type.TAKEIN,
                    wh: { connect: { id: data.wh_id } },
                    item: { connect: { id: registeredItem.id } },
                    user: { connect: { uid: data.user } },
                }
            })

            const registeredTransaction = await db.transaction.create({
                data: {
                    items: {
                        connect: { id: registeredItem.id }
                    },
                    srcComp: {connect : {id : data.srcComp_id}},
                    dstComp: {connect : {id : data.dstComp_id}},
                    dstPerson: data.dst_person,
                    srcPerson: data.src_person,
                    dstSignature: null,
                    status: "Dodane"
                }
            })
        }
        else {
            await db.itemAction.create({
                data: {
                    type: action_type.ADD,
                    wh: { connect: { id: data.wh_id } },
                    item: { connect: { id: registeredItem.id } },
                    user: { connect: { uid: data.user } },
                }
            })
        }
        response.push(registeredItem)

    }
    return json(response);
};

export async function PATCH({ request, cookies, fetch }) {
    const data = await request.json();
    const item = data.item;
    if (item.uid) {
       
        const updatedItem = db.item.update({
            where: {
                uid: item.uid
            },
            data: {
                type: item.type,
                ...(item.image ? { image: item.image } : {}),
                ...(item.desc ? { desc: item.desc } : {}),
                ...(item.condition != null ? { condition: item.condition } : {}),
                ...(item.amount ? { amount: item.amount } : {}),
            }
        })

        const action = db.itemAction.create({
            data: {
                type: action_type.UPDATE,
                wh: {connect: {id : item.wh.id}},
                item: {connect : {id : item.id}},
                user: {connect : {uid : data.user}},
            }
        })

        const transaction = await db.$transaction([
            updatedItem,
            action
        ])

        return json(transaction)
        
    }
    else
        return json("Did not provide uid")
}


