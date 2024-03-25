import type { Person } from "@prisma/client";

declare global {
	namespace App {
		interface Locals {
			user: {
			  username: string
			  role: string
			  person: Person | null
			  uid : string
			  signature : string | null
			}
		}
	}
}

export {};
