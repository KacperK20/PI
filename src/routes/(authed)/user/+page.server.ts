import { db } from '$lib/server/database';
import { fail } from '@sveltejs/kit';
import type { Action, Actions, PageServerLoad } from './$types';
import bcrypt from 'bcrypt'

export async function load({ fetch, cookies, locals, parent }) {

    let parentData = await parent();

    let itemsActions = await (await fetch(`/api/itemAction?user_uid=${parentData.user.uid}`)).json();

    return {
        itemsActions
    }
};

const save: Action = async ({ cookies, request }) => {
    const data = await request.formData()
    const user_uid = data.get('user_uid')
    const username = data.get('username')
    const password = data.get('password')
    const name = data.get('name')
    const signature = data.get('signature')

    if(user_uid){
        const result = await db.user.update({
            data: {
                ...(username ? {username} : {}),
                ...(password ? { passwordHash: await bcrypt.hash(password, 10)} : {}),
                ...(signature ? {signature} : {}),
                ...(name ? {
                person: {
                    update: {
                        name: name,
                        warehouse : {
                            update : {
                                name : name
                            }
                        }
                    }
                }} : {})
            },
            where: {
                uid: user_uid
            },
        })
        return { success: true };
    }
    else return fail(400, { error: true });
}

export const actions: Actions = { save }