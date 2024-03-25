
const randProdCode =  async (fetch_func = fetch) => {
    let code = Math.floor(Math.random() * 1000000000000).toString().padStart(13, '0');
    const response = await fetch_func(`/api/product/name?prod_code=${code}`);
    const data = await response.json();
    if (data) {
        code = await randProdCode();
    }
    return code;
}

export default randProdCode;
