const knex = require('./db');


module.exports = {
    GET: function(table, primaryKey, params, query) {
        const clause = {};
        clause[primaryKey] = params[primaryKey];

        return knex(table)
            .select()
            .where(clause)
    },
    GETall: function(table) {
        return knex(table)
            .select();

        // TODO: handle query string!!!
    },
    PUT: function(table, primaryKey, params, query) {

    },
    POST: function(table, primaryKey, params, query) {
        return knex(table)
            .insert(params);
    },
    DELETE: function(table, primaryKey, params, query) {},
    PATCH: function(table, primaryKey, params, query) {},
};