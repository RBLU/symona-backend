import knex from '../db';
import * as restify from 'restify';
import {Route} from "./Route";
import * as errors from 'restify-errors';

export default new Route(
    'Run',
    'boid',
    undefined,
    [
        {
            method: 'GET',
            endpoint: '/runs/monitoringnames',
            handler: (req: restify.Request, res: restify.Response, next: restify.Next) => {
                req.log.info(req.query, 'req.query');
                knex('Run')
                    .join('Monitoring', 'Run.itsMonitoring', '=', 'Monitoring.boid')
                    .select('Monitoring.name')
                    .whereRaw("LOWER(??) LIKE '%' || LOWER(?) || '%' ", ['Monitoring.name',req.query.filter])
                    .distinct()
                    .then((rows) => {
                        res.send(rows.map((row: any) => row.name));
                        return next();
                    })
                    .catch((err) => {
                        req.log.error(err);
                        return next(new errors.BadRequestError(err));
                    })
            }
        }
    ]
);

