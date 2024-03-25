import bwipjs from 'bwip-js';

const barcode = (code : string = "") => {
    let canvas = document.createElement('canvas');

    try {
        bwipjs.toCanvas(canvas, {
            bcid: 'code128',
            text: code,
            scale: 10,
            height: 15,
            width: 30,
            backgroundcolor: '#ffffff',
            includetext: true,
            textxalign: 'center'
        });

        let barcode = canvas.toDataURL('image/jpeg', 1.0);

        return barcode;
    } catch (e) {
        console.error(e)
    }
};

const qrcode = (code : string = "") => {
    let canvas = document.createElement('canvas');

    try {
        bwipjs.toCanvas(canvas, {
            bcid: 'qrcode',
            text: code,
            scale: 10,
            height: 15,
            width: 15,
            backgroundcolor: '#ffffff',
            includetext: true,
            textxalign: 'center'
        });

        let qrcode = canvas.toDataURL('image/jpeg', 1.0);
        return qrcode;
    } catch (e) {
        console.error(e)
    }
};

export default {
    barcode,
    qrcode
}