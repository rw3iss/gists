export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let lastFunc: ReturnType<typeof setTimeout> | null;
    let lastRan: number;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;
        const now = Date.now();

        if (!lastRan) {
            func.apply(context, args);
            lastRan = now;
        } else {
            clearTimeout(lastFunc!);
            lastFunc = setTimeout(function () {
                if (now - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = now;
                }
            }, limit - (now - lastRan));
        }
    } as T;
}