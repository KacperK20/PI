import app_settings from '$lib/server/app_settings'
import type { LayoutServerLoad } from './$types'

// get `locals.user` and pass it to the `page` store
export const load: LayoutServerLoad = async ({ locals }) => {

  return {
    user: locals.user,
    app_settings : app_settings.load_app_settings()
  }
}
