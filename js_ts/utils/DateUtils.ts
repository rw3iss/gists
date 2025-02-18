import { DEFAULT_TIMEZONE as _DEFAULT_TIMEZONE } from "env";
import { getLogger } from "./logging";
const { log, warn } = getLogger('Dates', { color: 'black', enabled: false });

export const DEFAULT_TIMEZONE = _DEFAULT_TIMEZONE || "America/New_York";
export const DATE_FORMAT = "YYYY-MM-DD";
export const FULL_DATE_FORMAT = "YYYY-MM-DD HH:mm:ss a";
export const SHORT_DATE_FORMAT = "MMM Do h:mma";
export const HOURLY_FORMAT = "-ha";
export const MIN_DATE = -8640000000000000; // used for comparing times

export const renderDate = (d) => {
    const date = typeof d == 'string' ? new Date(d) : d;
    return date && date.toDateString();
}
export const formatIsoShort = (date) => {
    if (!date) return '';
    try {
        const str = date.toISOString(); "2013-03-01T00:00:00+01:00"
        const strParts = str.split('T');
        const day = strParts[0].split('-'), hour = strParts[1].split(':');
        if (day[1][0] == '0') day[1] = day[1][1]; // remove leading 0
        if (hour[0][0] == '0') hour[0] = hour[0][1]; // remove leading 0
        return `${day[1]}/${day[2]}/${day[0][2]}${day[0][3]} ${hour[0]}:${hour[1]}`;
    } catch (e) {
        console.log(`Exception in formatIsoShort, date:`, date)
        return date.toISOString();
    }
}


// Returns number of days between two dates.
export const dayDiff = (date1, date2) => Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / 86400000);

// Validates that a string is in format of 'YYYY-MM'
export const validateMonthString = (month: string): boolean => {
    return /^\d{4}-(0\d|(0|1|2))$/g.test(month);
}

export const printTime = (date) => {
    if (date) {
        console.log('printTime', date)
        return date.format(FULL_DATE_FORMAT);
    }
}

export const printDates = (dates) => {
    //console.log('New dates, timezone:', timezone);
    Object.keys(dates).forEach(k => {
        const d = dates[k];
        console.log('Date: ', k, ' = ', typeof d == 'function' ? d() : (Array.isArray(d) ? (d[0].format(FULL_DATE_FORMAT) + ' to ' + d[1].format(FULL_DATE_FORMAT)) : d.format(FULL_DATE_FORMAT)));
    });
}

/**
 * Returns the seconds difference from (end - start)
 * @param {Date} start
 * @param {Date} end
 */
export const diffSecs = (start: Date, end: Date) => {
    return end.getTime() - start.getTime();
}
