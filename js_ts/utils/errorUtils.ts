// Finds the inner most error
export const getInnerError = (e, log?) => {
    if (!e) return undefined;
    const _log = typeof log !== undefined ? (typeof log == "function" ? log : console.log) : undefined;
    if (_log) _log(e);
    if (typeof e == 'string') return e;
    if (Array.isArray(e)) return e.map(_e => getInnerError(_e, log)).join(', ');
    // leave these separate so it recursesq through to each to always ensure a message can be found.
    return getInnerError(e.error, log) ||
        getInnerError(e.errors, log) ||
        getInnerError(e.data, log) ||
        getInnerError(e.response, log) ||
        getInnerError(e.message, log) ||
        getInnerError(e.result, log) ||
        getInnerError(e.reason, log) ||
        'Unknown error.';
}

// where = location: can be file, class, method, method... any identifier.
// log = if passed, it expects a logger to talk to.
export const exception = (e, where?, log?, other?) => {
    const error = getInnerError(e);
    console.log(`⚠️ Exception${where ? ` in ${where}` : ``}: ${error} ::`, e);
    if (log) { /* todo */ }
    if (other) console.log(other)
    return error;
}

export const rethrow = (e, data?, opts?) => {
    const msg = getInnerError(e);
    if (opts?.log) {
        if (data) opts.log(msg, data);
        else opts.log(msg);
    } else {
        if (data) console.log(msg, data);
        console.log(msg);
    }

    if (opts?.notify) {
        // todo: log to DB and notify admins.
    }

    console.log(`Rethrowing...`)
    throw msg;
}