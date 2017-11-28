import {Route} from "./routes/Route";

const knexHandler = require('./knexHandler');
const inflect = require('i')();
import * as restify from 'restify';
import * as errors from 'restify-errors';

function addRoute(server: restify.Server, route: Route) {
    if (route.specialRoutes && route.specialRoutes.length > 0) {
        route.specialRoutes.forEach((specialRoute) => {
            register(server, specialRoute.method, specialRoute.endpoint, specialRoute.handler);
        });
    }

    ['GETall', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH'].forEach((methodName: string) => {
        if (route.defaultRoutes[methodName] !== false) {
            const handler = function (req: restify.Request, res: restify.Response, next: restify.Next) {
                const dbHandler = knexHandler[methodName];
                dbHandler(route.table, route.primaryKey, req.params, req.query, req.body)
                    .then((result: any) => {
                        if (methodName === 'GETall') {
                            // add a special header with the total count, if we have a paginated result
                            if (result.totalCount) {
                                res.header('X-Symona-Total-Record-Count', result.totalCount);
                            }
                            // we expect an array of rows, just sending it
                            res.send(result);
                        } else if (methodName === 'DELETE') {
                            // we expect an integer, the number of objects deleted
                            res.send({objectsDeleted: result});
                        } else {
                            if (result.length === 0) {
                                return next(new errors.NotFoundError("no object found in table '" + route.table + "' with "
                                    + route.primaryKey + " = '" + req.params[route.primaryKey] + "'"));
                            } else if (result.length > 1) {
                                return next(new errors.ConflictError('more than 1 object found (' + result.length + ') with '
                                    + route.primaryKey + " = '" + req.params[route.primaryKey] + "'"));
                            } else {
                                res.send(result[0]);
                            }
                        }
                        return next();
                    })
                    .catch((err: any) => {
                        req.log.error(err);
                        // wrap error

                        return next(new errors.BadRequestError(err));
                    });
            };

            let endpoint = route.endpoint;

            if (!endpoint) {
                endpoint = '/' + inflect.pluralize(route.table).toLowerCase();
                if (methodName === 'GET' || methodName === 'PUT' || methodName === 'DELETE' || methodName === 'PATCH') {
                    endpoint += '/:' + route.primaryKey;
                }
            }
            register(server, methodName, endpoint, handler);
        }
    });
}

function register(server: restify.Server,
                  method: string,
                  endpoint: string,
                  handler: (req: restify.Request, res: restify.Response, next: restify.Next) => void) {
    console.log('adding route for: ' + endpoint + ', method: ' + method);
    if (method === 'GET' || method === 'GETall') {
        server.get(endpoint, handler);
    } else if (method === 'PUT') {
        server.put(endpoint, handler);
    } else if (method === 'DELETE') {
        server.del(endpoint, handler);
    } else if (method === 'PUT') {
        server.put(endpoint, handler);
    } else if (method === 'POST') {
        server.post(endpoint, handler);
    } else if (method === 'PATCH') {
        server.patch(endpoint, handler);
    } else {
        throw new Error('unknown HTTP Verb: ' + method);
    }
}


export {addRoute}