const oracledb = require('oracledb');
const knex = require('../db').getDb();
const errors = require('restify-errors');

module.exports = {
    table: 'Inspection',
    primaryKey: 'boid',
    specialRoutes: [
        {
            method: 'POST',
            endpoint: '/inspections/:boid/recalc',
            handler: (req, res, next) => {
                req.log.info(req.params, 'req.params');
                if (!req.params.boid) {
                    return next(new Error('Bad Parameter'));
                }
                knex('Value')
                    .where('itsInspection', req.params.boid)
                    .delete()
                    .then((deleteResult) => {
                        knex('Inspection')
                            .innerJoin('Monitoring', 'Inspection.itsMonitoring', 'Monitoring.boid')
                            .innerJoin('Run', 'Run.itsMonitoring', 'Monitoring.boid')
                            .innerJoin('InspectionDef', 'Inspection.itsInspectionDef', 'InspectionDef.boid')
                            .select('Inspection.boid as inspBoid',
                                'Run.boid as runBoid',
                                'Run.itsSyriusBatchlauf as syrBatchlauf',
                                'Monitoring.boid as monitoringBoid',
                                'InspectionDef.proctype',
                                'InspectionDef.procedure',
                            )
                            .where('Inspection.boid', '=', req.params.boid)
                            .map( (row) => {
                                req.log.info(row, 'the Row');
                                return knex.raw(
                                    "BEGIN " + row.procedure + "(?,?,?,?); END;",
                                    [{"dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": row.inspBoid},
                                        {"dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": row.runBoid},
                                        {"dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": row.monitoringBoid},
                                        {"dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": row.syrBatchlauf}
                                    ]
                                )
                            })
                            .then((insertResult) => {
                                res.send({deletedValues: deleteResult, caluculatedValues: insertResult.length});
                                return next();
                            })
                    })
                    .catch((err) => {
                        req.log.error(err);
                        return next(err);
                    });
           }
            /*                raw(
                                "BEGIN SYBA.RECALCINSPECTION(?); END;",
                                [{ "dir": oracledb.BIND_IN, "type": oracledb.STRING, "val": req.params.boid }]
                                )
                                .then((result) => {
                                    res.send(result);
                                    return next();
                                })
                                .catch((err) => {
                                    req.log.error(err);
                                    return next(new errors.BadRequestError(err));
                                })
                                */

        },
    ]
};