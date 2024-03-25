import onScan from 'onscan.js'


function attachOnScan(element : any, handleScan : (sCode : string, iQty : number) => void){
    if(!onScan.isAttachedTo(element)){
        onScan.attachTo(element, {
            suffixKeyCodes: [13], // enter-key expected at the end of a scan
            onScan: handleScan,
            preventDefault : false,
            reactToPaste: false,
        });
        console.log("OnScan attached")
    }
    else {
        detachOnScan(element)
        attachOnScan(element, handleScan)
    }
}

function detachOnScan(element : any){
    onScan.detachFrom(element);
    console.log("OnScan detached")
}

export default attachOnScan;