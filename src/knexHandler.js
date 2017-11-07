const knex = require('./db');
const uuidv4 = require('uuid/v4');


module.exports = {
    GET: function(table, primaryKeyName, params, query, body) {
        const clause = {};
        clause[primaryKeyName] = params[primaryKeyName];

        return knex(table)
            .select()
            .where(clause)
    },
    GETall: function(table) {
        return knex(table)
            .select();

        // TODO: handle query string!!!
    },
    PUT: function(table, primaryKeyName, params, query, body) {

    },
    POST: function(table, primaryKeyName, params, query, object) {

        // post will generate new object, so we need a new boid:
        object.boid = uuidv4();
        return knex(table)
            .insert(object)
            .then((result) => {
                return [object];
            });
    },
    DELETE: function(table, primaryKeyName, params, query, body) {
        const clause = {};
        clause[primaryKeyName] = params[primaryKeyName];

        return knex(table)
            .where(clause)
            .delete();
    },
    PATCH: function(table, primaryKeyName, params, query, body) {},
};