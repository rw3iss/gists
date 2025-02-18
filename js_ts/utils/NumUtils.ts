// returns 0 if n is NaN or Infinity, otherwise n.
export function orZero(n, def = 0) {
    if (typeof n == 'string') {
        n = parseFloat(n);
    }

    if (Number.isNaN(n)) {
        return typeof def != 'undefined' ? def : 0;
    } else if (!Number.isFinite(n)) {
        return typeof def != 'undefined' ? def : 0;
    }

    return n;
}

export function average(arr) {
    let length = arr.length;
    return arr.reduce((prev, curr) => prev + curr, 0) / length;
}