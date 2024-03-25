// Importuj biblioteki
import { fail, redirect } from '@sveltejs/kit'
import bcrypt from 'bcrypt'
import type { Action, Actions, PageServerLoad } from './$types'
import { db } from '$lib/server/database'

export const load: PageServerLoad = async ({ locals }) => {
  // Przekieruj użytkownika, jeśli jest zalogowany
  if (locals.user) {
    throw redirect(303, '/warehouse')
  }


}

const login: Action = async ({ cookies, request, url }) => {
  // Zbierz dane logowania
  const data = await request.formData()
  const username = data.get('username')
  const password = data.get('password')

  // Sprawdź, czy podano dane logowania
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username ||
    !password
  ) {
    return fail(400, { invalid: true })
  }

  // Szukaj użytkoniwka w bazie danych
  const user = await db.user.findUnique({ where: { username } })

  // Jeśli go niema odrzuć logowanie
  if (!user) {
    return fail(400, { credentials: true })
  }

  // Sprawdź czy hasło się zgadza
  const userPassword = await bcrypt.compare(password, user.passwordHash)

  // Jeśli nie odrzuć logowanie
  if (!userPassword) {
    return fail(400, { credentials: true })
  }

  const authenticatedUser = user;

  cookies.set('session', authenticatedUser.userAuthToken, {
    // Wyślij ciasteczko dla każdej strony
    path: '/',
    // Ciasteczko dostępne tylko po stronie serwera, nie można używać `document.cookie`
    httpOnly: true,
    // Tylko żądania z tej samej strony mogą wysyłać ciasteczka
    sameSite: 'strict',
    // W trybie produkcyjnym wysyłane tylko przez HTTPS
    secure: true,
    // Ustawienie wygaśnięcia ciasteczka na 1 dzień
    maxAge: 60 * 60 * 24,
  })

  // Przekieruj użytkownika
  throw redirect(303, url.searchParams.get("redirectTo") ?? "/warehouse")
}

export const actions: Actions = { login }

