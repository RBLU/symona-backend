const moment = require('moment');

const knex = require('./db');
const uuidv4 = require('uuid/v4');
const pino = require('pino')();
const Treeize = require('treeize');

const QUERY_SEPARATOR = '|';
const columnInfoCache = {};


function prefixedColumnsSelector(table, usePrefix) {

    if (!columnInfoCache[table]) {
        pino.debug('************* cache MISS ***********: ' + table);
        columnInfoCache[table] = knex(table).columnInfo(table).then((res) => {
            return res;
        });
    }

    let prefix = '';
    if (usePrefix) {
        prefix = lowerFirst(table) + ':';
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

function expand(knexQuery, table, attributesToExpand, omitColumns) {
    if (!attributesToExpand || attributesToExpand.length === 0) {
        return knexQuery;
    }

    return Promise.all([prefixedColumnsSelector(table)]
        .concat(attributesToExpand.map((itsAttr) => {
            return prefixedColumnsSelector(itsAttr.substr(3), true)
        })))
        .then((columns) => {
            const colSelector = Object.assign(...columns);
            pino.debug('colSelector', colSelector);

            attributesToExpand.forEach((itsAttr) => {
                const joinTable = itsAttr.substr(3);
                knexQuery
                    .leftJoin(joinTable, table + '.' + itsAttr, joinTable + '.boid')
            });
            if (omitColumns) {
                return knexQuery;
            } else {
                return knexQuery
                    .columns(colSelector)
                    .then((results) => {
                        const treeized = new Treeize();
                        treeized.grow(results);
                        return treeized.getData();
                    });
            }
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

        const filterParts = filterClause.split(QUERY_SEPARATOR);
        const filterArgument = reviveFilterArgument(filterParts[2]);

        if (!opMap[filterParts[1]]) {
            throw new Error('Unknown filter operator: ' + filterParts[1]);
        }
        const wrappedColumn = filterParts[0].split('.').map((v) => "\"" + v + "\"").reduce((res, current) => res + '.' + current, '').substr(1);
        if (filterParts[1] === 'likei') {
            knexQuery.whereRaw("LOWER(" + wrappedColumn + ") LIKE '%' || LOWER(?) || '%' ", filterArgument)
        } else if (filterParts[1] === 'eqi') {
            knexQuery.whereRaw("LOWER(" + wrappedColumn + ") = LOWER(?)", filterArgument)
        } else if (filterParts[1] === 'like') {
            knexQuery.where(filterParts[0], opMap[filterParts[1]], '%' + filterArgument + '%');
        } else {
            knexQuery.where(filterParts[0], opMap[filterParts[1]], filterArgument);
        }
    });
    return knexQuery;
}

function reviveFilterArgument(value) {
    if (moment(value, moment.ISO_8601).isValid()) {
        return moment(value).toDate();
    } else {
        return value;
    }
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
            knexQuery = filter(knexQuery, query.filter);
        }

        if (query && query.expand) {
            knexQuery = expand(knexQuery, table, query.expand.split(','));
        }


        return knexQuery.then((result) => {
            // check whether to add a totalCount
            if (query && (query.limit || query.offset)) {
                let countQuery = knex(table).count(table + '.boid as c');
                if (query && query.filter) {
                    countQuery = filter(countQuery, query.filter);
                }
                if (query && query.expand) {
                    countQuery = expand(countQuery, table, query.expand.split(','), true);
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


function lowerFirst(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}