import * as restify from 'restify';

class Route {
    constructor(public table: string,
                public primaryKey = 'boid',
                public endpoint = <string>undefined,
                public specialRoutes?: [{
                    method: string,
                    endpoint: string,
                    handler: restify.RequestHandler
                }]) {
    };

    public defaultRoutes: {[index: string]: boolean} = {
        GET: true,
        GETall: true,
        PUT: true,
        POST: true,
        PATCH: true,
        DELETE: true,
    }
}

export {Route}