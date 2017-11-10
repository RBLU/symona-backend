const knex = require('../db');
const errors = require('restify-errors');


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
                    .whereRaw("LOWER(??) LIKE '%' || LOWER(?) || '%' ", ['Monitoring.name',req.query.filter])
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
        }
    ]
};