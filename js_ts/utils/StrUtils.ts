export const truncate = (str: string, length?: number) => {
    if (!str) return str;
    if (str.length > length) return (str.slice(0, length) + '...');
    return str;
}
