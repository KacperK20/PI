// Importuj bilbioteki
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

// Połącz z bazą danych
const db = new PrismaClient()

async function main() {

    // Tworzenie ról
    await db.roles.create({
        data: {
            name : "ADMIN"
        },
    })
    
    await db.roles.create({
        data: {
            name : "USER"
        },
    })



    // Tworzenie uzytkownika
    await db.user.create({
        data: {
            username : "admin",
            passwordHash: await bcrypt.hash("admin", 10),
            userAuthToken: crypto.randomUUID(),
            role: { connect: { name: "ADMIN" } },
        },
    })



}

main()