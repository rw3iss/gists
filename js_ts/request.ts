import fetch from 'isomorphic-fetch';

export type RequestParams = {
    method?: string;
    body?: any;
    headers?: {},
    token?: string;
};

export async function request(url, params?: RequestParams) {
    let method = (params?.method || 'get').toLowerCase();
    const headers = params?.headers || {};
    if (typeof headers['Content-Type'] == 'undefined' && method != 'get') headers['Content-Type'] = 'application/json';
    const opts = {
        method,
        body: params?.body ? JSON.stringify(params.body) : null,
        headers
    }
    if (params?.token) opts.headers['authorization'] = `Bearer ${params.token}`;
    console.log(`request():`, url)
    return await fetch(url, opts);
    // if (!response.ok) {
    //     console.log(`request error`, response.status)
    //     throw "Request error";
    // } else {
    //     return await response.json();
    // }
}