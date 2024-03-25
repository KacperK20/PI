import type { RequestHandler } from './$types';
import { db } from '$lib/server/database'
import { json } from '@sveltejs/kit'
import { readFileSync } from 'fs'
import csvToJson from "csvtojson";
import { AsyncParser } from '@json2csv/node';
import { flatten } from '@json2csv/transforms';
import type { Company, Warehouse } from '@prisma/client';
import randProdCode from '$lib/randProdCode';

export const GET: RequestHandler = async ({url}) => {
    let tables = Object.keys(db).filter(key => !key.startsWith("_") && !key.startsWith("$"))
    const fileType = url.searchParams.get("type");
    const template = url.searchParams.get("template");

    
    if(fileType == "csv"){
        let items;
        if(template){
            items = {
                uid : "Unikalny kod przedmiotu (opcjonalne)",
                desc : "Opis przedmiotu (opcjonalne)",
                type : "Typ przedmiotu: Srodek trwaly lub Wyposazenie (opcjonalne)",
                condition : "Stan przedmiotu (opcjonalne)",
                wh : {
                    name : "Nazwa magazynu",
                    comp : {
                        name : "Nazwa firmy"
                    }
                },
                product : {
                    name : "Nazwa produktu",
                    prod_code : "Kod produktu (opcjonalne)",
                    category : {
                        name : "Nazwa kategorii produktu (opcjonalne)"
                    }
                }
            }
        }
        else {
            items = await db.item.findMany({
                select : {
                    uid : true,
                    desc : true,
                    type : true,
                    condition : true,
                    wh : {
                        select : {
                            name : true,
                            comp : {
                                select : {
                                    name : true
                                }
                            }
                        }
                    },
                    product : {
                        select : {
                            name : true,
                            prod_code : true,
                            category : {
                                select : {
                                    name: true
                                }
                            }
                        }
                    }
                }
            })
        }
        

        const opts = {
            transforms: [
                flatten()
            ],
            delimiter : ";"
        };
          
        const parser = new AsyncParser(opts);
        const csv = await parser.parse(items).promise();

        return new Response(csv, { 
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                "Content-Disposition": "attachment; filename=db.csv"
            }
        });
    }
    else {

        let database = {};
        for(let table of tables){
            database[table] = await db[table].findMany({})
        }

        return new Response(JSON.stringify(database,null,2), { 
            status: 200,
            headers: {
                'Content-Type': 'text/json',
                "Content-Disposition": "attachment; filename=db.json"
            }
        });
    }
    
};

export const POST: RequestHandler = async ({request, url, fetch}) => {
    const formData = Object.fromEntries(await request.formData());
    const fileType = url.searchParams.get("type");

    if (
      !(formData.fileToUpload as File).name ||
      (formData.fileToUpload as File).name === 'undefined'
    ) {
      return json({
        error: true,
        message: 'Nie podano pliku'
      });
    }
 
    const { fileToUpload } = formData as { fileToUpload: File };

    let fileContent = Buffer.from(await fileToUpload.arrayBuffer()).toString()
    
    function wrapNestedObj(obj : any){
        let keys = Object.keys(obj);
        for(let k of keys){
            if(typeof obj[k] === 'object'){
                wrapNestedObj(obj[k])
                obj[k] = {
                    create : obj[k]
                }
            }
        }
    }

    try {
        if(fileType == "csv"){
            const items = await csvToJson({delimiter : ";"}).fromString(fileContent)

            let registratedWarehouses : Warehouse[] = []

            for(let item of items){

                let company = await db.company.upsert({
                    update : {},
                    create : {
                        name : item.wh.comp.name
                    },
                    where : {
                        name : item.wh.comp.name
                    }
                })

                let warehouse = registratedWarehouses.find(wh => wh.name == item.wh.name) ?? null;
                if(!warehouse){
                    let registeredWarehouse = await db.warehouse.create({
                        data : {
                            name : item.wh.name,
                            comp : {connect : {
                                uid : company.uid
                            }}
                        }
                    })
                    registratedWarehouses.push(registeredWarehouse)
                    warehouse = registeredWarehouse
                }
                item.wh = {
                    connect : {
                        uid : warehouse.uid
                    }
                }
                item.ownerWh = {
                    connect : {
                        uid : warehouse.uid
                    }
                }

                let productCategory = item.product.category.name ? await db.productCategory.upsert({
                    update : {},
                    create : {
                        name : item.product.category.name
                    },
                    where : {
                        name : item.product.category.name
                    }
                }) : null;

                let product = await db.product.upsert({
                    update : {
                       ...(item.product.prod_code ? {prod_code : item.product.prod_code} : {})  
                    },
                    create : {
                        ...(item.product.prod_code ? {prod_code : item.product.prod_code} : {prod_code :  await randProdCode(fetch)}),
                        name : item.product.name,
                        ...(productCategory ? {category : {connect : {uid : productCategory.uid}}} : {})
                    },
                    where : {
                        name : item.product.name
                    }
                })

                item.product = {
                    connect : {
                        uid : product.uid
                    }
                }

                if(item.uid.length == 0){
                    delete(item.uid)
                }

                await db.item.create({
                    data : item
                })
            }
         
            console.log("Imported csv file")
        }
        else {
            let data = JSON.parse(fileContent)
            
            let uids_to_replace = []

            for(let role of data.roles){
                let result = await db.roles.findFirst({
                    select : {
                        uid : true
                    },
                    where : {
                        name : role.name
                    }
                })
                if(result)
                    uids_to_replace.push({imported : role.uid, current : result.uid})
            }

            for(let company of data.company){
                let result = await db.company.findFirst({
                    select : {
                        uid : true
                    },
                    where : {
                        name : company.name
                    }
                })
                if(result)
                    uids_to_replace.push({imported : company.uid, current : result.uid})
            }

            for(let user of data.user){
                let result = await db.user.findFirst({
                    select : {
                        uid : true
                    },
                    where : {
                        username : user.username
                    }
                })
                if(result)
                    uids_to_replace.push({imported : user.uid, current : result.uid})
            }

            for(let toReplace of uids_to_replace){
                fileContent = fileContent.replaceAll(toReplace.imported, toReplace.current)
            }

            data = JSON.parse(fileContent)

            for(let table of Object.keys(data)){
                if(data[table].length > 0){
                    if(Object.keys(data[table][0]).find(k => k == "uid")){
                        for(let el of data[table]){
                            delete el.id;
                            await db[table].upsert({
                                create : el,
                                update : el,
                                where : {
                                    uid : el.uid
                                }
                            })
                        }
                        console.log(`Imported: ${table}`)
                    }       
                    else {
                        for(let el of data[table]){

                            let uid_fields = (Object.keys(el)).filter(k => k.includes("_uid"))
                            let compoundId = uid_fields.join("_");

                            let compoundIdValue = {}
                            
                            for(let f of uid_fields){
                                compoundIdValue[f] = el[f]
                            }

                            await db[table].upsert({
                                create : el,
                                update : el,
                                where : {
                                    [compoundId] : compoundIdValue
                                }
                            })
                            
                        }
                        console.log(`Imported: ${table}`)
                    }
                }
            }
        }
    }
    catch(err) {
        console.log(err)
        return json({
            error: true,
            message: 'Niepowodzenie'
        });
    }

    return json({success : true, message: "Pomyślnie zaimportowano bazę danych"})
};

