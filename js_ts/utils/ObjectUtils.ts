import { orZero } from "./NumUtils.ts";

/**
 * @description Tries to safely parse the json. Returns undefined if json is null or bad.
 * @param {*} json
 * @return {{} | undefined}
 */
export const tryJsonParse = (json, def = undefined) => {
    if (typeof json == 'string') {
        try {
            return JSON.parse(json);
        } catch (e) {
            // if it wasn't an object, consider it was a number or something, and return:
            if (json[0] != '{') { return json };
            console.warn('Warning: tryJsonParse failed: ', json, e);
            return def;
        }
    }
    // return the json, already as some other object, or the default.
    return json ?? def;
}

/**
 * @description Tries to safely stringify the json, and returns the string, or otherwise undefined.
 * @param {*} obj
 * @param {*} def default value to return if it fails.
 * @return {string | undefined}
 */
export const tryJsonStringify = (obj, def = undefined) => {
    if (typeof obj == 'string') {
        return obj;
    } else {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            console.warn('Warning: tryJsonStringify failed: ', obj, e);
            return def;
        }
    }
}

export const tryParseInt = (int, def = undefined) => {
    try {
        return typeof int != 'undefined' ? parseInt(int) : def;
    } catch (e) {
        console.warn('Warning: tryParseInt failed: ', int, e);
    }
    return def;
}

export const tryParseFloat = (float, def = undefined) => {
    try {
        return typeof float != 'undefined' ? parseFloat(float) : def;
    } catch (e) {
        console.warn('Warning: tryParseFloat failed: ', float, e);
    }
    return def;
}

export const arrayUntil = (arr: [], length) => {
    if (!arr) return arr;
    return arr.slice(0, Math.min(arr.length, length));
}

// Removes element by exact value/reference.
export const arrayRemove = (arr, value) => {
    return arr.filter(e => e != value);
}

//Removes the matching elements from the array that do NOT pass the filter.
export const arrayFilterRemove = (array: Array<any>, filter) => {
    if (array && Array.isArray(array) && filter) {
        array = array.filter(r => !filter(r));
    }
    return array;
}

/**
 * @description Adds or creates the given key and value from addTo to addFrom.
 * @param {*} addTo
 * @param {*} addFrom
 * @param {*} key
 * @param {*} value
 */
export const addToOrCreateProperty = (addTo, addFrom, key, value) => {
    addToOrCreate(addTo, key, addFrom ? orZero(addFrom[key]) : 0);
}

export const addToOrCreate2 = (to, from) => {
    if (!to) to = from;
    else to += from;
    return to;
}

export const addToOrCreate = (addTo, key, val) => {
    if (!addTo) return;
    if (addTo[key]) {
        addTo[key] += val ? val : 0;
    } else {
        addTo[key] = val ? val : 0
    }
}

export const filterObjects = (objects, filter, returnArray = false) => {
    let result = {};
    if (!objects) return returnArray ? [] : {};
    Object.keys(objects).forEach(k => {
        let o = objects[k];
        if (filter(o)) {
            result[k] = o;
        }
    });
    return returnArray ? Object.values(result) : result;
}

export const clone = (o) => {
    try {
        return o ? JSON.parse(JSON.stringify(o)) : undefined;
    } catch (e) {
        console.log('Exception trying to clone object:', o, e);
        return undefined;
    }
}



// Return an object without the given array of properties.
export const excludeProps = (o, exclude) => {
    try {
        // convery data to json string
        let c = JSON.parse(JSON.stringify(o));
        exclude.forEach(e => {
            delete c[e];
        });
        return c;
    } catch (e) {
        console.error('EXCEPTION: Parsing JSON for tracking event:', e);
    }
}

export const pickProps = (o, pick: string[]) => {
    if (!o || typeof o != 'object') {
        return {};
    }

    let r = {};
    pick.forEach(p => {
        if (typeof o[p] != undefined) r[p] = o[p];
    });
    return r;
}

export const prettyPrint = (o) => {
    if (!o) return '';
    if (typeof o == 'string') return o;
    return JSON.stringify(o);
    // todo: make better
}




// TODO: REMOVE/move
export const NEW_TOTALS_OBJECT = (addData = undefined) => {
    let totals = {
        // calculated data:
        orders: 0,
        items: 0,
        revenue: 0,
        profit: 0,
        spend: 0,

        // events:
        pageview: 0,
        checkout: 0,
        purchase: 0,
        'add-to-cart': 0,
        sessions: 0,
        'pageview-sessions': 0,
        addToCartSessions: 0,
        'add-to-cart-sessions': 0,

        cpp: 0,
        aov: 0,
        roas: 0,
        conversionRate: 0,
        addToCartConversionRate: 0,
        itemsPerCustomer: 0,
        conversionIndex: 0,
        addToCartConversionIndex: 0,
        itemsPerCustomerIndex: 0,
        score: 0
    };

    if (addData) {
        Object.assign(totals, addData);
    }

    return totals;
}
