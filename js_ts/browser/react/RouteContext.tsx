import { DEFAULT_ROUTE, routes } from 'config/config';
import { useRouter } from 'lib/hooks/useRouter.js';
import { useEffect } from 'preact/hooks';

export function RouteContext() {

    const { route, routeParams, navigate } = useRouter();

    // tell the router to try to render the current or default route
    useEffect(() => {
        let l = location.pathname;
        if (l == '/' || l == '') l = DEFAULT_ROUTE;
        else l += location.search;
        if (!route) navigate(l);
    }, []);

    return (
        route ? (
            typeof routes[route] != 'undefined' ? routes[route](routeParams) : "Not found.") : ''
    )
}

