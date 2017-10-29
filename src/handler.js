const _ = require('lodash');
const knexHandler = require('./knexHandler');
const inflect = require('i')();

function addRoute(server,  route) {
    ['GET', 'GETall', 'PUT', 'POST', 'DELETE', 'PATCH'].forEach((method) =>{
       if (route[method] !== false) {
           const handler = function(req, res, next) {

               const dbHandler = _.isFunction(route[method]) ? route[method] : knexHandler[method];

               dbHandler(route.table, route.primaryKey, req.params, req.query)
                   .then((result) => {
                        if (route[method] === 'GETall') {
                            res.send(result);
                        } else {
                            res.send(result[0]);
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
               endpoint = '/' + inflect.pluralize(route.table).toLowerCase() + '/';
               if (method === 'GET' || method ==='PUT' || method === 'DELETE') {
                   endpoint += ':'+ route.primaryKey;
               }
           }
           console.log('adding route for: ' + endpoint +': '+ method);
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