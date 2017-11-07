const knex = require('./db');
const uuidv4 = require('uuid/v4');
const pino = require('pino')();
const Treeize = require('treeize');


const columnInfoCache = {};

function prefixedColumnsSelector(table, usePrefix) {

    if (!columnInfoCache[table]) {
        columnInfoCache[table] = knex(table).columnInfo(table);
    }

    let prefix = '';
    if (usePrefix) {
        prefix = table.toLowerCase() + ':';
    }
    return columnInfoCache[table]
        .then((result) => {
            const selector = {};
            Object.keys(result).forEach((key) => {
                selector[prefix + key] = table + '.' + key;
            });
            return selector;
        })

}

function expand(knexQuery, table, attributesToExpand) {
    if (!attributesToExpand || attributesToExpand.length === 0) {
        return knexQuery;
    }

    return Promise.all([prefixedColumnsSelector(table)]
        .concat(attributesToExpand.map((itsAttr) => {
            return prefixedColumnsSelector(itsAttr.substr(3), true)
        })))
        .then((columns) => {
            const colSelector = Object.assign(...columns);
            pino.info('colSelector', colSelector);

            attributesToExpand.forEach((itsAttr) => {
                const joinTable = itsAttr.substr(3);
                knexQuery
                    .join(joinTable, table + '.' + itsAttr, joinTable + '.boid')
            });
            return knexQuery
                .columns(colSelector)
                .then((results) => {
                    const treeized = new Treeize();
                    treeized.grow(results);
                    return treeized.getData();
                });
        })
}

function filter(knexQuery, filterClause) {

    const opMap = {
      eq: '=',
      lg: '>',
      lge: '>=',
      sm: '<',
      sme: '<=',
    };
    const filterParts = filterClause.split('$');

    return knexQuery.where(filterParts[0], opMap[filterParts[1]], filterParts[2]);
}

module.exports = {
    GET: function (table, primaryKeyName, params, query, body) {
        const clause = {};
        clause[table + '.' + primaryKeyName] = params[primaryKeyName];

        const knexQuery = knex(table)
            .select()
            .where(clause);

        if (query.expand) {
            return expand(knexQuery, table, query.expand.split(','));
        } else {
            return knexQuery;
        }
    },
    GETall: function (table, primaryKeyName, params, query, body) {
        let knexQuery = knex(table)
            .select();
        pino.info('req.query', query);
        if (query.orderBy) {
            knexQuery.orderBy(...query.orderBy.split('|'));
        }

        if (query.filter) {
            knexQuery = filter(knexQuery, query.filter);
        }

        if (query.expand) {
            knexQuery =  expand(knexQuery, table, query.expand.split(','));
        }

        return knexQuery;

        // TODO: handle query string!!!
    },
    PUT: function (table, primaryKeyName, params, query, body) {

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
    },
};