import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';
import { error, fail, redirect } from '@sveltejs/kit';



export async function load({ fetch, cookies, locals, params }) {

    async function getProduct() {
        const result = await fetch(`/api/product?name=${params.name}`);
        return await result.json();
      }
    
    let productActions = await getProduct();

    let product =  productActions;
    let items = productActions ? productActions.Items : [];
    let category = productActions ? productActions.category : null;

    return {
        productActions: product,
        items: items,
        category: category,
    };
}