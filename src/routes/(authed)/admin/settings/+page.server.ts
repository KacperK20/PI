import type { PageServerLoad } from './$types';
import app_settings from '$lib/server/app_settings';
import { fail, type Action, type Actions } from '@sveltejs/kit';

export const load = (async () => {
    return {
        app_settings : app_settings.load_app_settings(),
    };
}) satisfies PageServerLoad;

const save: Action = async ({ cookies, request }) => {
    const data = await request.formData()

    try {
        const oldSettings = app_settings.load_app_settings();
        let newSettings = oldSettings;

        newSettings.label.template = JSON.parse(data.get("label_template"))
        newSettings.defaults.confirm_by_signature = data.get("confirm_by_signature") ?? false;
        newSettings.defaults.move_item_change_owner = data.get("move_item_change_owner") ?? false;
        newSettings.defaults.giveout_item_change_owner = data.get("giveout_item_change_owner") ?? false;
        newSettings.defaults.showActionsTable = data.get("showActionsTable") ?? false;
        newSettings.application.save_transaction_pdf = data.get("save_transaction_pdf") ?? false;
        newSettings.application.disable_item_photo = data.get("disable_item_photo") ?? false;
        app_settings.save_app_settings(newSettings);
        return { success: true };
    }
    catch(err){
       return fail(400, { error: true });
    }
}
  
export const actions: Actions = { save }