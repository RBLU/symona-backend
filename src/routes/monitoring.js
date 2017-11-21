const knex = require('../db');
const errors = require('restify-errors');

module.exports = {
    table: 'Monitoring',
    primaryKey: 'boid',
    specialRoutes: [
        {
            method: 'POST',
            endpoint: '/monitorings/:boid/reload',
            handler: (req, res, next) => {
                knex('Monitoring')
                    .select()
                    .where({'Monitoring.boid': req.params.boid})
                    .leftJoin('Target', 'Monitoring.itsTarget', 'Target.boid')
                    .then((monitoring) => {
                        if (monitoring.length !== 1) {
                            return Promise.reject('monitoring not found');
                        }
                        return knex('Run')
                            .where({itsMonitoring: req.params.boid})
                            .delete()
                            .then(() => monitoring);
                    })
                    .then((monitoring) => {
                        let selectStatement =
                            knex
                                .select(
                                    knex.raw('SYS_GUID()'),
                                    knex.raw('?', [req.params.boid]),
                                    'BOID',
                                    knex.raw('?,?', ['green', 'open']),
                                    'STARTED',
                                    'STOPPED'
                                )
                                .from('SYRIUSADM.BATCHLAUF')
                                .where('ITSBATCHLAUFBATCH', '=', monitoring[0].itsSyriusBatch)
                                .where('REPLACED', '=', new Date('01.01.3000'));

                        return knex(
                            knex.raw('?? (??,??,??,??,??,??,??)', [
                                'Run',
                                'boid',
                                'itsMonitoring',
                                'itsSyriusBatchlauf',
                                'runStatus',
                                'operatorStatus',
                                'started',
                                'ended'
                            ])
                        )
                            .insert(
                                selectStatement
                            )
                            .then((result) => {
                                res.send({created: result});
                                return next();
                            });

                    })
                    .catch((err) => {
                        req.log.error(err);
                        return next(err);
                    });

            }
        }]
};