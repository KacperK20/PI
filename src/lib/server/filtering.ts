/* function unflatten(data) {
    var result = {}
    for (var i in data) {
        var keys = i.split('.')
        keys.reduce(function (r, e, j) {
            return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 == j ? data[i] : {}) : [])
        }, result)
    }
    return result
} */


const generateFilters = async (altHeaders: any, url: URL, caseInsensitive: Boolean) => {

    let paramsData: string[] = [];


    const urlString = url.toString();
    const queryString = urlString.includes('?') ? urlString.split('?')[1] : '';
    const params = new URLSearchParams(queryString);


    const sort = params.get('sort') || null;
    const dir = params.get('dir') || 1;
    const search = params.get('search') || null;

    altHeaders.forEach(altHeaders => {
        paramsData[altHeaders] = params.get('f_' + altHeaders) || null;
    });


    let filtersForColumns: any = [];
    let filtersForTable: any = [];
    let sortCondition = {};
    
    altHeaders.forEach(altHeaders => {
        const value = paramsData[altHeaders];

        if (value) {
            const columns = altHeaders.split(`.`);
            let condition
            if (caseInsensitive) {
                condition = { contains: value, mode: 'insensitive' };
            }
            else condition = { contains: value }
            for (let i = columns.length - 1; i >= 0; i--) {
                condition = { [columns[i]]: condition };
            }

            filtersForColumns.push(condition)
        }
    });

    if (sort) {   
        const columns = altHeaders[altHeaders.indexOf(sort)].split('.'); // Get the corresponding filter header
        sortCondition = dir === '0' ? 'asc' : 'desc';

        for (let i = columns.length - 1; i >= 0; i--) {
            sortCondition = { [columns[i]]: sortCondition };
        }
    }

    if (search) {
        altHeaders.forEach(altHeaders => {
            if (altHeaders != "createdAt" && altHeaders != "updatedAt" && altHeaders != "amount" && altHeaders != "id") {
                const columns = altHeaders.split('.');
                let condition
                if (caseInsensitive) {
                    condition = { contains: search, mode: 'insensitive' };
                }
                else condition = { contains: search }


                for (let i = columns.length - 1; i >= 0; i--) {
                    condition = { [columns[i]]: condition };
                }
                filtersForTable.push(condition)
            }
        });
    }



    let filters = {
        OR: [
            { AND: filtersForColumns },
            ...filtersForTable
        ]
    }

    let sortOrder = sortCondition
        ? { ...sortCondition }
        : undefined;

    return { filters, sortOrder }
}

export default {
    generateFilters
}