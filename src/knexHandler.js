const knex = require('./db');


module.exports = {
    GET: function(table, primaryKey, params, query) {
        const clause = {};
        clause.primaryKey = params[primaryKey];

        return knex(table)
            .select()
            .where(clause)
    },
    GETall: function() {},
    PUT: function() {},
    POST: function() {},
    DELETE: function() {},
    PATCH: function() {},
};