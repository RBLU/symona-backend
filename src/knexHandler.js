const knex = require('./db').getDb();
const uuidv4 = require('uuid/v4');
const pino = require('pino')();
const knexHelper = require('./knexHelper');
const QUERY_SEPARATOR = knexHelper.QUERY_SEPARATOR;

module.exports = {
    GET: function (table, primaryKeyName, params, query, body) {
        const clause = {};
        clause[table + '.' + primaryKeyName] = params[primaryKeyName];

        const knexQuery = knex(table)
            .select()
            .where(clause);

        if (query && query.expand) {
            return knexHelper.expand(knexQuery, table, query.expand.split(','));
        } else {
            return knexQuery;
        }
    },
    GETall: function (table, primaryKeyName, params, query, body) {
        let knexQuery = knex(table)
            .select();

        if (query && query.limit) {
            knexQuery.limit(query.limit);
        }
        if (query && query.offset) {
            knexQuery.offset(query.offset);
        }

        if (query && query.orderBy) {
            knexQuery.orderBy(...query.orderBy.split(QUERY_SEPARATOR));
        }

        if (query && query.filter) {
            knexQuery = knexHelper.filter(knexQuery, query.filter);
        }

        if (query && query.expand) {
            knexQuery = knexHelper.expand(knexQuery, table, query.expand.split(','));
        }

        return knexQuery.then((result) => {
            // check whether to add a totalCount
            if (query && (query.limit || query.offset)) {
                let countQuery = knex(table).count(table + '.boid as c');
                if (query && query.filter) {
                    countQuery = filter(countQuery, query.filter);
                }
                if (query && query.expand) {
                    countQuery = knexHelper.expand(countQuery, table, query.expand.split(','), true);
                }
                return countQuery.then((count) => {
                    result.totalCount = count[0].c;
                    return result;
                })
            } else {
                return result;
            }
        });
    },
    PUT: function (table, primaryKeyName, params, query, body) {
        return knex(table)
            .where(primaryKeyName, '=', params[primaryKeyName])
            .update(body)
    },
    POST: function (table, primaryKeyName, params, query, object) {

        // post will generate new object, so we need a new boid:
        object.boid = uuidv4();
        pino.info(object);
        return knex(table)
            .insert(object)
            .then((result) => {
                return [object];
            });
    },
    DELETE: function (table, primaryKeyName, params, query, body) {
        const clause = {};
        clause[primaryKeyName] = params[primaryKeyName];

        return knex(table)
            .where(clause)
            .delete();
    },
    PATCH: function (table, primaryKeyName, params, query, body) {
        return knex(table)
            .where(primaryKeyName, '=', params[primaryKeyName])
            .update(body);
    },
};


