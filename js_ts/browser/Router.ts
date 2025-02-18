import { routes } from 'config/config';
import EventService from 'lib/EventService';
import qs from 'query-string';
import RouteParser from 'routes';

export const ROUTE_CHANGE_EVENT = 'route-change';

export class Router {

    private parser: RouteParser | undefined = undefined;
    public routes = routes;

    public route = undefined;
    public routeParams = undefined;
    public routeArgs

    constructor() {
        this.parser = RouteParser();
        this.registerRoutes(routes);

        // try to load previous route url on "back" event
        window.addEventListener("popstate", (e) => {
            if (e.state?.url) this.navigate(e.state?.url);
        });
    }

    public registerRoutes = (routes) => {
        if (this.parser) {
            Object.keys(routes).forEach(r => this.parser!.addRoute(r, this._onRouteChange));
        }
    }

    // try to find and load a route, change page url, and emit route-change event
    public navigate = (url, emit = true) => {
        let r = this.loadUrl(url);
        // todo: support recursive navigate/virtual functions by letting loadUrl finalize on state?
        if (!r && url != '/page-not-found') return this.navigate('/page-not-found');
        window.history.pushState({ url, params: r.params }, "", url);
        if (emit) EventService.dispatch(ROUTE_CHANGE_EVENT, r);
    }

    // given a url, try to match a route and set variables.
    public loadUrl = (url) => {
        // strip query string (because it doesn't match with it?) and parse to args
        let qp = url.indexOf('?');
        let r = this.parser.match(qp != -1 ? url.slice(0, qp) : url);
        if (r) {
            let args = qp != -1 ? url.slice(qp, url.length) : '';
            r.args = qs.parse(args);
            r.fn(r);
            return r;
        } else {
            return false;
        }
    }

    // auto-change handler from url change.
    private _onRouteChange = (r) => {
        this.route = r.route;
        this.routeParams = r.params;
    }
}

export const router = new Router();