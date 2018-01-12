const knex = require('../db').getDb();
const errors = require('restify-errors');

const ignoreHandler = (doIgnore) => {
    return (req, res, next) => {
        knex('Run')
            .where('boid', '=', req.params.boid)
            .update({ignored: doIgnore})
            .then((RunUpdateResult) => {
                knex('Value')
                    .where('itsRun', '=', req.params.boid)
                    .update({ignored: doIgnore})
                    .then((ValueUpdateResult) => {
                        res.send({updated: ValueUpdateResult});
                        return next();
                    });
            })
            .catch((err) => {
                req.log.error(err);
                return next(new errors.BadRequestError(err));
            })
    };
};

module.exports = {
    table: 'Run',
    primaryKey: 'boid',
    specialRoutes: [
        {
            method: 'GET',
            endpoint: '/runs/monitoringnames',
            handler: (req, res, next) => {
                req.log.info(req.query, 'req.query');
                knex('Run')
                    .join('Monitoring', 'Run.itsMonitoring', '=', 'Monitoring.boid')
                    .select('Monitoring.name')
                    .whereRaw("LOWER(??) LIKE '%' || LOWER(?) || '%' ", ['Monitoring.name', req.query.filter])
                    .distinct()
                    .then((rows) => {
                        res.send(rows.map((row) => row.name));
                        return next();
                    })
                    .catch((err) => {
                        req.log.error(err);
                        return next(new errors.BadRequestError(err));
                    })
            }
        },
        {
            method: 'GET',
            endpoint: '/runs/:boid/inspections',
            handler: (req, res, next) => {
                req.log.info(req.query, 'req.query');
                knex('Inspection')
                    .join('Run', 'Run.itsMonitoring', '=', 'Inspection.itsMonitoring')
                    .join('Value', 'Value.itsInspection', '=', 'Inspection.boid')
                    .select('Inspection.*', 'Value.value', 'Value.status', 'Value.ignored', 'Run.boid as itsRun')
                    .where('Value.itsRun', '=', req.params.boid)
                    .where('Run.boid', '=', req.params.boid)
                    .then((rows) => {
                        res.send(rows);
                        return next();
                    })
                    .catch((err) => {
                        req.log.error(err);
                        return next(new errors.BadRequestError(err));
                    })
            }
        }, {
            method: 'POST',
            endpoint: '/runs/:boid/ignore',
            handler: ignoreHandler(true)
        },
        {
            method: 'POST',
            endpoint: '/runs/:boid/unignore',
            handler: ignoreHandler(false)
        }
    ]
};


