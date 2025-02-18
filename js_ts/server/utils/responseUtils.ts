import HttpStatusCode from '../HttpStatusCode.js';
import { getInnerError } from './errorUtils.js';

export class BaseResponse {
    success: boolean;
    response?: any;
    error?: string;
    data?: string;
}

// request succeeded, code = 200
export const success = (res, data?) => {
    let r: BaseResponse = { success: true };
    if (data) r.response = data;
    response(res, r);
}

// request finished but did not succeed as expected, code = 200
export const failed = (res, error?, code?, data?) => {
    let r: BaseResponse = { success: false };
    if (error) r.error = getInnerError(error);
    if (data) r.response = data;
    console.log(`failed`, r);
    response(res, r, code || 200);
}

// server error, code = 500
export const error = (res, error?, code?, data?) => {
    let r: BaseResponse = { success: false };
    if (error) r.error = getInnerError(error);
    if (data) r.response = data;
    //console.log('⚠️', r);
    // todo: get status code from errors
    response(res, r, code || 500);
}

export const invalid = (res, error?, data?) => {
    let r: BaseResponse = { success: false };
    if (error) r.error = error;
    if (data) r.data = data;
    //console.log('⚠️', r);
    // todo: get status code from errors
    response(res, r, HttpStatusCode.UNPROCESSABLE_ENTITY);
}

// standard response helper
export const response = (res, r?: any, code?: number) => {
    if (typeof code != 'undefined') res.statusCode = code;
    if (typeof r?.error == 'string' && code != 200) res.statusText = r.error; // doesnt work
    res.send(typeof r == 'object' ? JSON.stringify(r) : r);
};