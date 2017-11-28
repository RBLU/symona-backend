import * as errors from 'restify-errors';
import * as restify from 'restify';

import knex from '../db';
import {Route} from "./Route";

export default new Route(
    'Monitoring',
    'boid',
    undefined,
    [{
        method: 'POST',
        endpoint: '/monitorings/:boid/reloadruns',
        handler: reloadRunsForMonitoring
    }]
)

function reloadRunsForMonitoring(req: restify.Request, res: restify.Response, next: restify.Next) {
    knex('Monitoring')
        .select()
        .where({'Monitoring.boid': req.params.boid})
        .leftJoin('Target', 'Monitoring.itsTarget', 'Target.boid')
        .then((monitoring) => {
            if (monitoring.length !== 1) {
                return Promise.reject(new errors.BadRequestError('monitoring not found, boid: ' + req.params.boid));
            }
            return knex('Run')
                .where({itsMonitoring: req.params.boid})
                .delete()
                .then(() => monitoring);
        })
        .then((monitoring) => {
            let selectStatement = knex
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
            ).insert(
                selectStatement
            ).then((result: any) => {
                res.send({created: result});
                return next();
            });

        })
        .catch((err) => {
            req.log.error(err);
            return next(err);
        });

}
