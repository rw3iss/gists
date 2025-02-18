import EventService from 'lib/EventService';
import { ROUTE_CHANGE_EVENT, router } from 'lib/Router';
import { useEffect, useState } from 'preact/hooks';

// useRoute - Binds route changes to local listeners that components can
// use to find the current route and detect route changes.

export function useRouter() {
    const [route, setRoute] = useState(undefined);
    const [routeParams, setRouteParams] = useState(undefined);
    const [routeArgs, setRouteArgs] = useState(undefined);

    function handleRouteChange(e) {
        setRoute(e.target.route);
        setRouteParams(e.target.params);
        setRouteArgs(e.target.args);
    }

    useEffect(() => {
        EventService.subscribe(ROUTE_CHANGE_EVENT, handleRouteChange);
        return () => {
            EventService.unsubscribe(ROUTE_CHANGE_EVENT, handleRouteChange);
        };
    }, []);

    return { route, routeParams, routeArgs, navigate: router.navigate };
}
