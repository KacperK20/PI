import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import { action_type } from '$lib/action_type.js';
import app_settings from '$lib/server/app_settings';
import minioClient from '$lib/server/minio';

let settings = app_settings.load_app_settings()

export async function POST({ request, cookies, fetch }) {
    const data = await request.json();

    let transactions = [];

    if(!data.user_uid)
        throw error(400,"user_uid key missing");
    if(data.action_type === undefined || data.action_type === null)
        throw error(400,`action_type key missing`);

    if(!data.items && data.action_type != action_type.TAKEIN)
        throw error(400,"items key missing");

    let user = await db.user.findUnique({
        select : {
            uid : true
        },
        where : {
            uid : data.user_uid
        }
    })

    if(!user)
        throw error(400,`User : ${data.user_uid} not found`);

    if (data.action_type == action_type.GIVEOUT) {

        if(!data.srcPerson_uid)
            throw error(400,"srcPerson_uid key missing");

        let srcPerson = await db.person.findUnique({
            select : {
                uid : true,
                name : true,
                wh_uid : true,
                comp_uid : true
            },
            where: {
                uid: data.srcPerson_uid
            }
        })

        if(!srcPerson)
            throw error(400,`srcPerson : ${data.srcPerson_uid} not found`);

        if(!srcPerson.wh_uid){
            srcPerson = await db.person.update({
                data : {
                    warehouse : {
                        create : {
                            name : srcPerson.name,
                            comp_uid : srcPerson.comp_uid
                        }
                    }
                },
                where : {
                    uid : srcPerson.uid
                }
            })
        }

        if(!data.dstPerson_uid)
            throw error(400,"dstPerson_uid key missing");

        let dstPerson = await db.person.findUnique({
            select : {
                uid : true,
                name : true,
                wh_uid : true,
                comp_uid : true
            },
            where: {
                uid: data.dstPerson_uid
            }
        })

        if(!dstPerson)
            throw error(400,`dstPerson : ${data.dstPerson_uid} not found`);

        if(!dstPerson.wh_uid){
            dstPerson = await db.person.update({
                data : {
                    warehouse : {
                        create : {
                            name : dstPerson.name,
                            comp_uid : dstPerson.comp_uid
                        }
                    }
                },
                where : {
                    uid : dstPerson.uid
                }
            })
        }

        let updatedItems = []

        for(let item of data.items){
            if(!item.uid && !item.uids)
                throw error(400,"item.uid or item.uids key missing");

            let transaction = [];
            
            let itemsToUpdate = [];

            if(item.uid){
                const foundItem = await db.item.findUnique({
                    select : {
                        uid : true,
                        wh_uid : true
                    },
                    where : {uid : item.uid}
                })

                if(!foundItem)
                    throw error(400,`Item : ${item.uid} not found`);

                itemsToUpdate.push(foundItem)
            }
            else {
                const foundItems = await db.item.findMany({
                    select : {
                        uid : true,
                        wh_uid : true,
                    },
                    where : {uid : {in : item.uids}},
                })

                for(let foundItem of foundItems){
                    itemsToUpdate.push(foundItem)
                }
            }

            for(let itemToUpdate of itemsToUpdate){
                transaction.push(
                    db.item.update({
                        data: {
                            ...(data.confirm_by_signature && { wh_uid : dstPerson.wh_uid }),
                            ...(data.change_owner && { ownerWh_uid: dstPerson.wh_uid }),
                            status: data.confirm_by_signature ? "W magazynie" : "Wydane"
                        },
                        where: {
                            uid: itemToUpdate.uid
                        }
                    }),
                    db.itemAction.create({
                        data: {
                            type: action_type.GIVEOUT,
                            wh_uid : itemToUpdate.wh_uid,
                            item_uid : itemToUpdate.uid,
                            user_uid : data.user_uid
                        }
                    })
                )

                if(data.confirm_by_signature){
                    transaction.push(
                        db.itemAction.create({
                            data: {
                                type: action_type.TAKEIN,
                                wh_uid: dstPerson.wh_uid!,
                                item_uid: itemToUpdate.uid,
                                user_uid: data.user_uid
                            }
                        })
                    )
                }

                transactions.push(...transaction)

                updatedItems.push(itemToUpdate)
            }
        }

        transactions.push(
            db.transaction.create({
                data: {
                    srcComp_uid : srcPerson.comp_uid,
                    dstComp_uid: dstPerson.comp_uid,
                    dstPerson: dstPerson.name,
                    srcPerson: srcPerson.name,
                    srcSignature: data.src_signature,
                    dstSignature: data.dst_signature,
                    images: {
                        create: data.images.map((image: { base64Data: any; }) => ({
                            base64Data: image.base64Data,
                        })),
                    },
                    items : {
                        createMany : {
                            data : updatedItems.map(item => {return {item_uid : item.uid}})
                        }
                    },
                    coordsLatitude: data.coords ? data.coords.latitude : null,
                    coordsLongitude: data.coords ? data.coords.longitude : null,
                    status: data.confirm_by_signature ? "Przyjęte" : "W trakcie"
                }
            }),
        )
    }
    else if (data.action_type == action_type.TAKEIN) {
        const transaction = await db.transaction.findFirst({ 
            where: { id: data.transaction_id }, 
            include: { 
                items: {
                    select : {
                        item : {
                            select : {
                                uid : true,
                                wh_uid : true
                            }
                        }
                    }
                } 
            } 
        });

        if (!transaction)
            throw error(400,`Trasaction : ${data.transaction_id} not found`);


        let db_transaction = [];
        for (const itemToTransaction of transaction.items) {
            let item = itemToTransaction.item
            db_transaction.push(
                db.item.update({
                    where: {
                        uid: item.uid
                    },
                    data: {
                        wh: {connect : {id : data.wh_id}},
                        status: "W magazynie"
                    }
                }),
                db.itemAction.create({
                    data: {
                        type: action_type.TAKEIN,
                        wh_uid: item.wh_uid,
                        item_uid: item.uid,
                        user_uid: data.user_uid
                    }
                })
            )
        }
        transactions.push(...db_transaction)

        transactions.push(
            db.transaction.update({
                where: {
                    id: transaction.id
                },
                data: {
                    status: "Przyjęte"
                }
            })
        )
    }
    else if (data.action_type == action_type.MOVE) {
        if(!data.dst_wh_id)
            throw error(400,"dst_wh_id key missing");

        for(let item of data.items){
            if(!item.amount)
                throw error(400,"item.amount key missing or equals 0");
            if(!item.uid && !item.uids)
                throw error(400,"item.uid or item.uids key missing");

            const foundWh =  await db.warehouse.findUnique({
                select : {
                    uid : true
                },
                where : {id : data.dst_wh_id}
            })    

            if(!foundWh)
                throw error(400,`Warehouse : ${data.dst_wh_id} not found`);

            let transaction = [];
            
            if(item.uid){
                const foundItem = await db.item.findUnique({
                    select : {
                        desc : true,
                        status : true,
                        type : true,
                        wh_uid : true,
                        image : true,
                        product_uid : true,
                        ownerWh_uid : true,
                        condition : true,
                        amount : true,
                    },
                    where : {uid : item.uid}
                })

                if(!foundItem)
                    throw error(400,`Item : ${item.uid} not found`);

                if(item.amount > foundItem.amount)
                    throw error(400,`Item amount: ${item.amount} is bigger than available : ${foundItem.amount}`);
                
                if(item.amount < foundItem.amount){
                    transaction.push(
                        db.item.create({
                            data : {
                                ...foundItem,
                                amount : foundItem.amount - item.amount
                            }
                        })
                    )
                }

                transaction.push(
                    db.item.update({
                        data: {
                            wh_uid : foundWh.uid,
                            amount : item.amount,
                            ...((data.change_owner) && { ownerWh_uid: foundWh.uid}),
                            status: "W magazynie"
                        },
                        where: {
                            uid: item.uid,
                        }
                    }),
                    db.itemAction.create({
                        data: {
                            type: action_type.MOVE,
                            wh_uid: foundItem.wh_uid,
                            item_uid: item.uid,
                            user_uid: data.user_uid
                        }
                    }),
                    db.itemAction.create({
                        data: {
                            type: action_type.RECEIVE,
                            wh_uid: foundWh.uid,
                            item_uid: item.uid,
                            user_uid:  data.user_uid,
                        }
                    })
                )
                transactions.push(...transaction)
            }
            else {
                const foundItems = await db.item.findMany({
                    select : {
                        uid : true,
                        wh_uid : true,
                    },
                    where : {uid : {in : item.uids}},
                })

                for(let foundItem of foundItems){
                    let transaction = [];
                    transaction.push(
                        db.item.update({
                            where: {
                                uid: foundItem.uid
                            },
                            data: {
                                wh_uid : foundWh.uid,
                                ...((data.change_owner) && { ownerWh_uid: foundWh.uid}),
                                status: "W magazynie"
                            }
                        }),
                        db.itemAction.create({
                            data: {
                                type: action_type.MOVE,
                                wh_uid: foundItem.wh_uid,
                                item_uid: foundItem.uid,
                                user_uid: data.user_uid
                            }
                        }),
                        db.itemAction.create({
                            data: {
                                type: action_type.RECEIVE,
                                wh_uid: foundWh.uid,
                                item_uid: foundItem.uid,
                                user_uid:  data.user_uid,
                            }
                        })
                    )
                    transactions.push(...transaction)
                }
            }
        }
    }
    else if (data.action_type == action_type.DELETE) {
        for(let item of data.items){
            if(!item.uid && !item.uids)
                throw error(400,"item.uid or item.uids key missing");

            if(item.uid){
                const foundItem = await db.item.findUnique({
                    select : {
                        wh_uid : true
                    },
                    where : {uid : item.uid}
                })

                if(!foundItem)
                    throw error(400,`Item : ${item.uid} not found`);
                
                let transaction = [];
                transaction.push(
                    db.item.update({
                        where: {
                            uid: item.uid,
                        },
                        data: {
                            status: "Usunięto"
                        }
                    }),
                    db.itemAction.create({
                        data: {
                            type: action_type.DELETE,
                            wh_uid: foundItem.wh_uid,
                            item_uid: item.uid,
                            user_uid: data.user_uid
                        }
                    })
                )
                transactions.push(...transaction)
            }
            else {
                const foundItems = await db.item.findMany({
                    select : {
                        uid : true,
                        wh_uid : true,
                    },
                    where : {uid : {in : item.uids}}
                })

                for(let foundItem of foundItems){
                    let transaction = [];
                    transaction.push(
                        db.item.updateMany({
                            where: {
                                uid: foundItem.uid,
                            },
                            data: {
                                status: "Usunięto"
                            }
                        }),
                        db.itemAction.create({
                            data: {
                                type: action_type.DELETE,
                                wh_uid: foundItem.wh_uid,
                                item_uid: foundItem.uid,
                                user_uid: data.user_uid
                            }
                        })
                    )
                    transactions.push(...transaction)
                }
            }
        }
    }
    else if (data.action_type == action_type.SPLIT){
        let total_amount = 0;

        let transaction = [];

        const item = data.items[0];

        if(!item.uid && !item.uids)
            throw error(400,"item.uid or item.uids key missing");

        if(!item.amount)
            throw error(400,"item.amount key missing or equals 0");

        
        if(item.uid){
            const foundItem = await db.item.findUnique({
                where : {
                    uid : item.uid,
                }
            })

            if(!foundItem)
                throw error(400,`Item : ${item.uid} not found`);

            transaction.push(
                db.item.update({
                    data : {
                        amount : 1
                    },
                    where : {
                        uid : item.uid
                    }
                })
            )

            
            for(let n = 0; n<foundItem.amount - 1;n++){
                transaction.push(
                    db.item.createMany({
                        data: {
                            ...foundItem,
                            amount : 1,
                            id: undefined,
                            uid: undefined
                        },
                    })
                )
            }
        }
        
        transactions.push(...transaction);
    }
    else if (data.action_type == action_type.MERGE){
        let total_amount = 0;

        let transaction = [];
        for(let n in data.items){
            const item = data.items[n];

            if(!item.amount)
                throw error(400,"item.amount key missing or equals 0");

            if(!item.uid && !item.uids)
                throw error(400,"item.uid or item.uids key missing");

            
            if(item.uid){
                const foundItem = await db.item.findUnique({
                    where : {
                        uid : item.uid,
                    }
                })

                if(!foundItem)
                    throw error(400,`Item : ${item.uid} not found`);

                total_amount += item.amount;

                if(parseInt(n) === data.items.length-1){
                    transaction.push(
                        db.item.update({
                            data: {
                                amount : total_amount
                            },
                            where : {
                                uid : item.uid
                            }
                        })
                    )
                }
                else {
                    transaction.push(
                        db.item.delete({
                            where : {
                                uid : item.uid
                            }
                        })
                    )
                }
            }
            
        }
        
        transactions.push(...transaction);
    }

    try {
        await db.$transaction(transactions);
        return json({message : "Success"})
    }
    catch(err){
        console.error(err)
        throw error(400,`Database error : ${err}`);
    }
};