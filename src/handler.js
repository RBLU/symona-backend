const _ = require('lodash');
const knexHandler = require('./knexHandler');
const inflect = require('i')();
const errors = require('restify-errors');

function addRoute(server, route) {
    if (route.specialRoutes && route.specialRoutes.length > 0) {
        route.specialRoutes.forEach((specialRoute) => {
            server[methodMap[specialRoute.method]](specialRoute.endpoint, specialRoute.handler);
        });
    }

    ['GETall', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH'].forEach((methodName) => {
        if (route[methodName] !== false) {
            const handler = function (req, res, next) {

                const dbHandler = _.isFunction(route[methodName]) ? route[methodName] : knexHandler[methodName];

                dbHandler(route.table, route.primaryKey, req.params, req.query, req.body)
                    .then((result) => {
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
                        } else {  // GET, PUT, POST, PATCH: we expect an Array with exactly one object as the result
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
                    .catch((err) => {
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
            console.log('adding route for: ' + endpoint + ', method: ' + methodName);
            server[methodMap[methodName]](endpoint, handler);
        }
    });
}

const methodMap = {
    GET: 'get',
    PUT: 'put',
    GETall: 'get',
    POST: 'post',
    DELETE: 'del',
    PATCH: 'patch'
};


module.exports = {
    addRoute: addRoute
};