import { json } from '@sveltejs/kit'
import { db } from '$lib/server/database'
import pdf from 'pdfjs';
import OpenSans from './opensans';
import Jimp from 'jimp';
import minioClient from '$lib/server/minio';
import app_settings from '$lib/server/app_settings';
import type { Product, Transaction } from '@prisma/client';

function formatDate(dateString : string | Date) {
    const date = new Date(dateString);
    const isoString = date.toISOString();
    const formattedString = isoString.replace('T', ' ').substring(0, 10);
    return formattedString;
}

function getArrayBuffer(ImageURLData : string){
    const base64Data = ImageURLData
    const base64Image = base64Data.split(",")[1]
    const arrayBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    return arrayBuffer
}

async function buildPDF(transaction : (Transaction & { srcComp: { logo: string }, items: { product: Product }[] })) {

    const dst_signature = transaction.dstSignature ? new pdf.Image(getArrayBuffer(transaction.dstSignature)) : null;
    const src_signature = transaction.srcSignature ? new pdf.Image(getArrayBuffer(transaction.srcSignature)) : null;

    const doc = new pdf.Document({font: OpenSans});
    
    const header = doc
    .header()

    if(transaction.srcComp.logo){
        const base64Logo = transaction.srcComp.logo
        const buffer = Buffer.from(base64Logo.replace(/^data:image\/\w+;base64,/, ""), "base64");

        let imageLogo = await Jimp.read(buffer)

        imageLogo.background(0xFFFFFFFF).getBase64(Jimp.MIME_JPEG, (err, base64) => {
            if (err) throw err;
            const image_buffer = Uint8Array.from(atob(base64.split(",")[1]), c => c.charCodeAt(0));
            const logo = new pdf.Image(image_buffer);
            header.image(logo, { height: 2 * pdf.cm, align: "right" });
        });
    }

    doc.footer().pageNumber(
        function (curr, total) {
            return curr + ' / ' + total;
        },
        { textAlign: 'center' }
    );

    const mainCell = doc.cell({ padding: 0.5 * pdf.cm})

    const cell = mainCell.cell({ paddingTop: 0.5 * pdf.cm});
    cell.text('PROTOKÓŁ ZDAWCZO-ODBIORCZY', { fontSize: 16, textAlign : "center" });

    const cell2 = mainCell.cell()
    cell2
        .text('', { textAlign: "center"})
        .add('pełny')
        .add('/')
        .add('częściowy',{strikethrough : true})
        .cell({ paddingBottom: 0.5 * pdf.cm })
        .cell(`sporządzony w dniu ${formatDate(transaction.createdAt)} r. w Jaworznie.`)
        .cell('Strony zgodnie oświadczają co następuje:')
        .cell(`1. W dniu ${formatDate(transaction.createdAt)} r. z magazynu w Jaworznie został wydany upoważnionym przedstawicielom Kupującego zwanych dalej Odbierającymi, asortyment wymieniony w poniższej tabeli.`,{paddingTop: 5, paddingBottom: 5, })

    const table = mainCell
    .table({
        widths: [1 * pdf.cm, null, 2 * pdf.cm, 1 * pdf.cm, null],
        borderHorizontalWidth: 1,
        borderVerticalWidth : 1,
        padding: 3,
        fontSize: 9
    });

    const tr = table.header();
    tr.cell('Lp.', {textAlign: "center"});
    tr.cell('Nazwa towaru', {textAlign: "center"});
    tr.cell('Ilość', {textAlign: "center"});
    tr.cell('J.m', {textAlign: "center"});
    tr.cell('Kod produktu', {textAlign: "center"});

    function addRow(n: number, name: string, amount: number, prod_code: string, unit : string) {
        const tr = table.row();
        tr.cell(n.toString(), {textAlign: "center"});
        tr.cell(name, {textAlign: "center"});
        tr.cell(amount.toString(), {textAlign: "center"});
        tr.cell(unit, {textAlign: "center"});
        tr.cell(prod_code, {textAlign: "center"});
    }

    let items : any = [];
    for (const itemToTransaction of transaction.items) {
        items = items.concat(itemToTransaction.item)
    }

    const groupedItems = items.reduce((acc, item) => {
        const existingItem = acc.find(i => i.product.prod_code === item.product.prod_code);
        if (existingItem) {
            existingItem.amount += item.amount;
        } else {
            acc.push({ ...item, amount: item.amount });
        }
        return acc;
    }, []);

    console.log(groupedItems)

    const itemsList = groupedItems;

    for (let n in itemsList) {
        let item : any = itemsList[n];
        addRow(Number(n) + 1, item.product.name, item.amount, item.product.prod_code, item.product.unit);
    }

    mainCell
        .cell('2.	Odbierający oświadcza, że w/w towar jest zgodny oraz znany jest mu stan techniczny i jakościowy towaru i nie będzie dochodził z tego tytułu żadnych roszczeń od Wydającego.',{paddingTop: 15})

        
    mainCell.cell(
        'Podpisy:',
        { paddingTop: 15, textAlign: 'center' }
    );

    const signatures = mainCell.table({
        widths: [ null, null],
        padding: 10,
    });
    const signaturesTr = signatures.row();

    src_signature ? 
    signaturesTr
        .cell("Wydający", { textAlign: 'center', })
        .cell(transaction.srcPerson, { textAlign: 'center' })
        .image(src_signature, {
            height: 70, align: 'center'
        })
    :
    signaturesTr
        .cell("Wydający", { textAlign: 'center', })
        .cell(transaction.srcPerson, { textAlign: 'center' })


    dst_signature ? 
    signaturesTr
        .cell("Odbierający", { textAlign: 'center' })
        .cell(transaction.dstPerson, { textAlign: 'center' })
        .image(dst_signature, {
            height: 70, align: 'center'
        })
    :
    signaturesTr
    .cell("Odbierający", { textAlign: 'center' })
    .cell(transaction.dstPerson, { textAlign: 'center' })

    const buf = await doc.asBuffer();
    return buf;
  }

export async function GET({ url, fetch }) {
    let uid = url.searchParams.get('uid')

    if(uid){
            const result = await db.transaction.findFirst({
                where: {uid : uid},
                include : {
                    items : {
                        include : {
                            item : {
                                include: {
                                    product : true
                                }
                            }
                        }
                    },
                    srcComp : true
                }
            })

            if(result && result.dstSignature){
                if(minioClient && app_settings.load_app_settings().defaults.save_transaction_pdf){
                    try{
                        let file = (await minioClient.getFile(`transactions/${result.uid}.pdf`))

                        return new Response(file, { 
                            status: 200,
                            headers: {
                                'Content-Type': 'application/pdf',
                                //"Content-Disposition": "attachment; filename="+trans_id+".pdf"
                            }
                        });

                    }
                    catch(err){
                        let pdfBuf = await buildPDF(result);
                        return new Response(pdfBuf.buffer, { 
                            status: 200,
                            headers: {
                                'Content-Type': 'application/pdf',
                                //"Content-Disposition": "attachment; filename="+trans_id+".pdf"
                            }
                        });
                    }
                }
                else {
                    let pdfBuf = await buildPDF(result);
                    return new Response(pdfBuf.buffer, { 
                        status: 200,
                        headers: {
                            'Content-Type': 'application/pdf',
                            //"Content-Disposition": "attachment; filename="+trans_id+".pdf"
                        }
                    });
                }
            }
            else return json("Error. Did not found transaction");
        
    }
    else return json("Error: Transaction uid not specified")
};
