import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';
import { error, fail, redirect } from '@sveltejs/kit';



export async function load({ fetch, cookies, locals, params }) {


  async function getPerson() {
    const result = await fetch(`/api/person/profile?id=${params.id}`);
    return await result.json();
  }

  let person = await getPerson();
  let wh_id = person.warehouse.id;

  async function getItemAction() {
    const result = await fetch(`/api/itemAction?wh_id=${wh_id}`);
    return await result.json();
  }


  let itemAction = await getItemAction();


  async function getOwnedItems() {
    const result = await fetch(`/api/warehouse?wh_id=${wh_id}`);
    return await result.json();
  }
  let warehouse: any
  warehouse = await getOwnedItems();

  let owneditems: any;
  let responsibleitems: any;

  
  owneditems = warehouse.OwnedItems;
  responsibleitems = person?.ItemsResponsible;
  return {
    personInfo: person,
    itemAction: itemAction,
    responsibleitems: responsibleitems,
    owneditems: owneditems,
  };
}