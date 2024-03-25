// Importuj biblioteki
import { error, fail, redirect } from '@sveltejs/kit'
import type { Action, Actions, PageServerLoad } from './$types'
import bcrypt from 'bcrypt'
import { db } from '$lib/server/database'

// ROLE
enum Roles {
  ADMIN = 'ADMIN', // Administrator
  USER = 'USER', // Użytkownik
}

export const load: PageServerLoad = async ({ locals }) => {
    // przekieruj użytkownika, jeśli jest zalogowany
    throw redirect(302, '/')
    
    if (locals.user) {
      throw redirect(302, '/') // przekieruj na stronę główną
    }
  }

const register: Action = async ({ cookies, request }) => {
  const data = await request.formData()
  const username = data.get('username')
  const password = data.get('password')
  let name  = data.get('name')?.toString().toLowerCase()

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof name !== 'string' ||
      !username ||
      !password ||
      !name
    ) {
      return fail(400, { invalid: true }) // zakończ rejestrację z kodem błędu 400 i informacją o nieprawidłowych danych
    }

    name = name.charAt(0).toUpperCase() + name.slice(1)

    const user = await db.user.findUnique({
      where: { username },
    })

    if (user) {
      return fail(400, { user: true }) // zakończ rejestrację z kodem błędu 400 i informacją o istniejącym użytkowniku
    }
    
    await db.user.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(password, 10),
        userAuthToken: crypto.randomUUID(),
        role: { connect: { name: Roles.USER } }, // przypisz rolę użytkownika
        person: {
          create: {
            name: name,
            comp: { connect: { id: 1 } } // przypisz użytkownika do firmy o id 1
          }
        },
      },
    })

    // przekieruj użytkownika
    throw redirect(303, '/login') // przekieruj na stronę logowania
}

export const actions: Actions = { register }
