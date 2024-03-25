import type { PageServerLoad } from './$types';

export async function load({ fetch, params, url, parent }) {
    const id  = url.searchParams.get('id') ?? "0";
    let comp_id = url.searchParams.get('comp_id')

    let filterKeys = Object.keys(Object.fromEntries(url.searchParams.entries())).filter(key => key.startsWith("f_"));

    let filters : any = [];

    let response = await fetch(`/api/warehouse?wh_id=${id}&subWhList=1`);
    let warehouse = await response.json();
    let inventarisation = null;

    if(warehouse.inventarisations?.length){
        const response = await fetch(`/api/inventarisation?uid=${warehouse.inventarisations[0].uid}`)
        inventarisation = await response.json()
    }

    for(let f of filterKeys){
        filters.push({name : f.slice(2), value :url.searchParams.get(f)})
    }

    return {
        warehouse, 
        comp_id,
        filters,
        inventarisation
    };
}