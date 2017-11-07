const knex = require('../db');

module.exports = {
    table: 'Run',
    primaryKey: 'boid',
    specialRoutes: [
        {
            method: 'GET',
            endpoint: '/runs/monitoringnames',
            handler: (req, res, next) => {
                   knex('Run')
                       .join('Monitoring', 'Run.itsMonitoring', '=', 'Monitoring.boid')
                       .select('Monitoring.name')
                       .distinct()
                       .where('Monitoring.name', 'like', '%' +req.query.filter + '%')
                       .then((rows) => {
                           res.send(rows.map((row) => row.name));
                           return next();
                       })
            }
        }
    ]
};