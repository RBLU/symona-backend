const _ = require('lodash');
const knexHandler = require('./knexHandler');
const inflect = require('i')();
const errors = require('restify-errors');

function addRoute(server, route) {
    ['GETall', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH'].forEach((method) => {
        if (route[method] !== false) {
            const handler = function (req, res, next) {

                const dbHandler = _.isFunction(route[method]) ? route[method] : knexHandler[method];

                dbHandler(route.table, route.primaryKey, req.params, req.query, req.body)
                    .then((result) => {
                        if (method === 'GETall') {
                            // we expect an array of rows, just sending it
                            res.send(result);
                        } else if (method === 'DELETE') {
                            // we expect an integer, the number of objects deleted
                            res.send({objectsDeleted: result});
                        } else {
                            if (result.length === 0) {
                                return next(new errors.NotFoundError("no object found in table '" + route.table+ "' with "
                                    + route.primaryKey + " = '" + req.params[route.primaryKey] + "'"));
                            } else if (result.length >1) {
                                return next(new errors.ConflictError('more than 1 object found ('+ result.length+')with '
                                    + route.primaryKey + " = '" + req.params[route.primaryKey] + "'"));
                            } else {
                                res.send(result[0]);
                            }
                        }
                        return next();
                    })
                    .catch((err) => {
                        req.log.error(err);
                        return next(err);
                    });
            };

            let endpoint = route.endpoint;

            if (!endpoint) {
                endpoint = '/' + inflect.pluralize(route.table).toLowerCase();
                if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
                    endpoint += '/:' + route.primaryKey;
                }
            }
            console.log('adding route for: ' + endpoint + ', method: ' + methodMap[method]);
            server[methodMap[method]](endpoint, handler);
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