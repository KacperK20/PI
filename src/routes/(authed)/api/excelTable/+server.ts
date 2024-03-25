import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit'
import pdf from 'pdfjs';
import { utils, write } from 'xlsx';
import OpenSans from '../transaction/pdf/opensans.js';


export async function POST({ request, cookies, fetch }) {
    const data = await request.json();
    if (data.type === "pdf") {

        const doc = new pdf.Document({font: OpenSans});
        const tableData = data.tableExport;
        const headers = data.columnNames;
        let y = 0;
        const table = doc.table({
            widths: new Array(headers.length).fill(null),
            borderWidth: 1,
        });

        const tr = table.row();

        headers.forEach(header => {
            tr.cell(header , { fontSize: 10 , align: 'center' });
        });
 
        tableData.forEach(row => {
            const tr = table.row();
            
            Object.keys(row).forEach(key => {
                if (typeof row[key] === 'object' && row[key] !== null) {
                    tr.cell(row[key].name ?? "<brak>", { fontSize: 8 });
                } else {
                    tr.cell(`${row[key] ?? "<brak>"}`, { fontSize: 8 });
                }
            });
        });
        const pdfData = await doc.asBuffer();
        // Now you can send this buffer as a response
        return new Response(pdfData, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
            },
        });
    }
    else if (data.type === "excel") {
        const tableData = data.tableExport;
    

        const ws = utils.json_to_sheet(tableData);

        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Sheet1");

        const excelData = write(wb, { type: 'buffer' });

        return new Response(excelData, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });


    } else {
        return json({ error: 'Invalid request type' }, { status: 400 });
    }
}