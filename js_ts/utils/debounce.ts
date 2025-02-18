export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;
        const later = () => {
            timeoutId = null;
            func.apply(context, args);
        };
        clearTimeout(timeoutId!);
        timeoutId = setTimeout(later, delay);
    } as T;
}