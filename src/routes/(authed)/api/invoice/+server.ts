import { db } from '$lib/server/database';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import filters from '$lib/server/filtering';

import easyinvoice from 'easyinvoice';
import fs from 'fs';
import nodemailer from 'nodemailer';

export async function GET({ url }) {
	const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 15;
	const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : 1;

	let altHeaders = ['title', 'optional', 'dueTime', 'amount', 'contractor.name']; //sciezka do danych w bazie

	const caseInsensitive = url.searchParams.get('case') ? url.searchParams.get('case') : false;
	var boolValue = JSON.parse(caseInsensitive);

	const filterObj = await filters.generateFilters(altHeaders, url, boolValue);

	const result = await db.invoice.findMany({
		where: {
			AND: [filterObj.filters]
		},
		include: { contractor: true, products: { include: { product: true } } },
		orderBy: filterObj.sortOrder,
		skip: (skip - 1) * limit,
		take: limit
	});

	return json(result);
}

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const invoice = await db.invoice.create({
			data: {
				title: data.title,
				optional: data.optional,
				dueTime: data.dueTime,
				amount: data.amount,
				contractorId: data.contractor,
				products: {
					createMany: {
						data: data.products.map((product) => ({
							productId: product.id,
							quantity: product.quantity
						}))
					}
				}
			}
		});
		const contractor = await db.contractor.findFirst({
			where: {
				id: data.contractorId
			}
		});

		const products = data.products
			.filter((product) => product.quantity > 0)
			.map((product) => ({
				quantity: product.quantity,
				description: product.name,
				taxRate: 23,
				price: product.price
			}));

		let datainvoice = {
			apiKey: 'free', // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
			mode: 'development', // Production or development, defaults to production
			sender: {
				company: 'TRANSKK',
				address: 'Nip: 106-00-00-062',
				zip: 'tel. 968574849',
				city: 'Cieszyn , Głeboka 13',
				country: 'Nr. konta PL49 1020 2892 2276 3005 0000 0000 '
			},
			client: {
				company: contractor?.name,
				address: contractor?.street,
				zip: contractor?.NIP,
				city: contractor?.city,
				country: contractor?.cod,
				custom1: contractor?.email,
				custom2: contractor?.account,
				custom3: 'Tytuł: ' + data.title
			},
			information: {
				// Invoice number
				number: String(invoice.id),
				// Invoice data
				date: String(new Date()),
				// Invoice due date
				dueDate: data.dueTime
			},
			products: [...products],
			bottomNotice: 'Zapłać fakture do podanego terminu',
			translate: {
				invoice: 'FAKTURA', // Default to 'INVOICE'
				number: 'Numer', // Defaults to 'Number'
				date: 'Data', // Default to 'Date'
				dueDate: 'Termin', // Defaults to 'Due Date'
				subtotal: 'Suma', // Defaults to 'Subtotal'
				products: 'Produkty', // Defaults to 'Products'
				quantity: 'Ilość', // Default to 'Quantity'
				price: 'Cena', // Defaults to 'Price'
				productTotal: 'Suma produktu', // Defaults to 'Total'
				total: 'Wartość' // Defaults to 'Total'
				// taxNotation: "btw" // Defaults to 'vat'
			}
		};

		let pdfinvoice = await easyinvoice.createInvoice(datainvoice);

		fs.writeFileSync('invoice' + invoice.id + '.pdf', pdfinvoice.pdf, 'base64');

		let transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'aplikacjakk@gmail.com',
				pass: 'ggoo vhhf pbvf sisg'
			}
		});
		const pdfBuffer = Buffer.from(pdfinvoice.pdf, 'base64');
		// Define email content
		let mailOptions = {
			from: 'aplikacjakk@gmail.com',
			to: 'kacperkubica2000@op.pl',
			subject: 'Faktura PDF',
			text:
				`Szanowni Państwo 

W załączeniu przesyłamy fakturę za zamówienie o numerze ` +
				invoice.id +
				`. Prosimy o dokonanie płatności zgodnie z warunkami umowy.
	
			
TRANSKK,
Nip: 106-00-00-062,
tel. 968574849,
Cieszyn , Głeboka 13,
Nr. konta PL49 1020 2892 2276 3005 0000 0000 `,
			attachments: [
				{
					filename: `invoice${invoice.id}.pdf`,
					content: pdfBuffer,
					encoding: 'base64'
				}
			]
		};

		// Send email with attachment
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});

		return json(invoice);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const deletedPerson = await db.invoice.delete({
			where: {
				id: parseInt(data.invoiceId)
			}
		});
		return json(deletedPerson);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		
		
		const products = data.products
			.filter((product) => product.quantity > 0)
			.map((product) => ({
				quantity: product.quantity,
				id: product.productId,  
				description: product.product.name,
				taxRate: 23,
				price: product.product.price
			}));
			console.log(products)
			const productsupdate = await db.productQuantity.deleteMany({
				where: { invoiceId: parseInt(data.invoiceId) }
			});
			
		const invoice = await db.invoice.update({
			where: {
				id: parseInt(data.invoiceId)
			},
			data: {
				title: data.title,
				optional: data.optional,
				dueTime: data.dueTime,
				contractorId: Number(data.contractor),
				amount: String(
					data.products.reduce(
						(total, product) => total + product.quantity * product.product.price,
						0
					)
				),
				products: {
					createMany: {
						data: products.map((product) => ({
							productId: product.id,
							quantity: product.quantity
						}))
					}
				}
			}
		});

		/* 	const productsupdate = await db.productQuantity.updateMany({
			where: { invoiceId: parseInt(data.invoiceId) },
			data: data.products.map((product) => ({
				where: { productId: product.product.id },
				data: {
					quantity: product.quantity
				}
			}))
		}); */

		const updatedinvoice = await db.invoice.findUnique({
			where: {
				id: parseInt(data.invoiceId)
			},
			include: { contractor: true, products: { include: { product: true } } }
		});
		console.log(data.contractorId)
		const contractor = await db.contractor.findFirst({
			where: {
				id: Number(data.contractor)
			}
		});
		console.log(contractor)
		let datainvoice = {
			apiKey: 'free', // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
			mode: 'development', // Production or development, defaults to production
			sender: {
				company: 'TRANSKK',
				address: 'Nip: 106-00-00-062',
				zip: 'tel. 968574849',
				city: 'Cieszyn , Głeboka 13',
				country: 'Nr. konta PL49 1020 2892 2276 3005 0000 0000 '
			},
			client: {
				company: contractor?.name,
				address: contractor?.street,
				zip: contractor?.NIP,
				city: contractor?.city,
				country: contractor?.cod,
				custom1: contractor?.email,
				custom2: contractor?.account,
				custom3: 'Tytuł: ' + data.title
			},
			information: {
				number: String(invoice.id),
				date: String(new Date().toLocaleDateString('pl-PL')),
				dueDate: data.dueTime,
				custom1: data.title,
				custom2: data.optional
			},
			products: [...products],
			bottomNotice: 'Zapłać fakture do podanego terminu',
			translate: {
				invoice: 'FAKTURA', // Default to 'INVOICE'
				number: 'Numer', // Defaults to 'Number'
				date: 'Data', // Default to 'Date'
				dueDate: 'Termin', // Defaults to 'Due Date'
				subtotal: 'Suma', // Defaults to 'Subtotal'
				products: 'Produkty', // Defaults to 'Products'
				quantity: 'Ilość', // Default to 'Quantity'
				price: 'Cena', // Defaults to 'Price'
				productTotal: 'Suma produktu', // Defaults to 'Total'
				total: 'Wartość' // Defaults to 'Total'
				// taxNotation: "btw" // Defaults to 'vat'
			}
		};

		let pdfinvoice = await easyinvoice.createInvoice(datainvoice);

		fs.writeFileSync('invoice' + invoice.id + '.pdf', pdfinvoice.pdf, 'base64');

		let transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'aplikacjakk@gmail.com',
				pass: 'ggoo vhhf pbvf sisg'
			}
		});
		const pdfBuffer = Buffer.from(pdfinvoice.pdf, 'base64');
		let mailOptions = {
			from: 'aplikacjakk@gmail.com',
			to: 'kacperkubica2000@op.pl',
			subject: 'Faktura korygująca PDF',
			text:
				`Szanowni Państwo 

W załączeniu przesyłamy korekte faktury za zamówienie o numerze ` +
				invoice.id +
				`. Prosimy o dokonanie płatności zgodnie z warunkami umowy.
	
			
TRANSKK,
Nip: 106-00-00-062,
tel. 968574849,
Cieszyn , Głeboka 13,
Nr. konta PL49 1020 2892 2276 3005 0000 0000 `,
			attachments: [
				{
					filename: `invoice${invoice.id}.pdf`,
					content: pdfBuffer,
					encoding: 'base64'
				}
			]
		};

		// Send email with attachment
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});

		return json(invoice);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
