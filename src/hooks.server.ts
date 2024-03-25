import { redirect, type Handle } from '@sveltejs/kit'
import { db } from '$lib/server/database'

export const handle: Handle = async ({ event, resolve }) => {
  // get cookies from browser
  const session = event.cookies.get('session')

  
  if (!session) {
    if(!event.url.pathname.startsWith("/login") && !event.url.pathname.startsWith("/logout"))
      if(event.url.pathname == "/"){
        throw redirect(302,`/login`)
      }
      else throw redirect(302,`/login?redirectTo=${event.url.pathname}`)
    else return await resolve(event)
  }

  // find the user based on the session
  const user = await db.user.findUnique({
    where: { userAuthToken: session },
    select: { 
      username: true, 
      role: true,
      uid : true, 
      person : true, 
      signature: true 
    },
  })

  // if `user` exists set `events.local`
  if (user) {
    event.locals.user = {
      username: user.username,
      role: user.role.name,
      signature: user.signature || null,
      person: user.person || null,
      uid: user.uid
    }
  }
  else {
    if(!event.url.pathname.startsWith("/login") && !event.url.pathname.startsWith("/logout")){
      throw redirect(302,`/login?redirectTo=${event.url.pathname}`);
    }
  }

  
  return await resolve(event)
}
