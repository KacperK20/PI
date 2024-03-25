import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

const getHost = (request : any) => {
  if (import.meta.env.VITE_HOST) {
    return import.meta.env.VITE_HOST;
  } else {
    return request.headers.host;
  }
}

export const load: PageServerLoad = async () => {
  // we only use this endpoint for the api
  // and don't need to see the page

  throw redirect(302, '/')
}

export const actions: Actions = {
  default({ cookies, request }) {
    // eat the cookie
    cookies.set('session', '', {
      path: '/',
      expires: new Date(0),
      domain: getHost(request), // Set the domain dynamically
    })
    
    // redirect the user
    throw redirect(302, '/')
  },
}