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

function filter(knexQuery, filterstring) {

    const opMap = {
        eq: '=',
        gt: '>',
        gte: '>=',
        st: '<',
        ste: '<=',
        like: 'LIKE',
        likei: 'LIKE',
        eqi: '=',
        '>': '>',
        '<': '<',
        '<=': '<=',
        '>=': '>='
    };

    const filterClauseArray = Array.isArray(filterstring) ? filterstring : [filterstring];

    filterClauseArray.forEach((filterClause) => {

        const filterParts = filterClause.split(':');
        if (!opMap[filterParts[1]]) {
            throw new Error('Unknown filter operator: ' + filterParts[1]);
        }
        const wrappedColumn = filterParts[0].split('.').map((v) => "\"" + v + "\"").reduce((res, current) => res + '.' + current, '').substr(1);
        if (filterParts[1] === 'likei') {
            knexQuery.whereRaw("LOWER(" + wrappedColumn + ") LIKE '%' || LOWER(?) || '%' ", filterParts[2])
        } else if (filterParts[1] === 'eqi') {
            knexQuery.whereRaw("LOWER(" + wrappedColumn + ") = LOWER(?)", filterParts[2])
        } else if (filterParts[1] === 'like') {
            knexQuery.where(filterParts[0], opMap[filterParts[1]], '%' + filterParts[2] + '%');
        } else {
            knexQuery.where(filterParts[0], opMap[filterParts[1]], filterParts[2]);
        }
    });
    return knexQuery;

}

module.exports = {
    GET: function (table, primaryKeyName, params, query, body) {
        const clause = {};
        clause[table + '.' + primaryKeyName] = params[primaryKeyName];

        const knexQuery = knex(table)
            .select()
            .where(clause);

        if (query && query.expand) {
            return expand(knexQuery, table, query.expand.split(','));
        } else {
            return knexQuery;
        }
    },
    GETall: function (table, primaryKeyName, params, query, body) {
        let knexQuery = knex(table)
            .select();

        if (query && query.orderBy) {
            knexQuery.orderBy(...query.orderBy.split('|'));
        }

        if (query && query.filter) {
            knexQuery = filter(knexQuery, query.filter);
        }

        if (query && query.expand) {
            knexQuery = expand(knexQuery, table, query.expand.split(','));
        }

        if (query && query.limit) {
            knexQuery.limit(query.limit);
        }
        if (query && query.offset) {
            knexQuery.offset(query.offset);
        }

        pino.debug(knexQuery.toSQL(), 'GETall: the query');
        return knexQuery;
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