import * as corsMiddleware from "restify-cors-middleware";
import * as restify from "restify";
import * as restify_pino_logger from "restify-pino-logger";
import * as passport from "passport-restify";
import * as moment from "moment";

import * as config from "../config/config";

 // required config
import * as db from "./db";

const handlers = require("./auth");

import {addRoute} from "./handler";

import {Route} from "./routes/Route";
import monitoring from "./routes/monitoring";
import run from "./routes/run";

const pino = restify_pino_logger();
//config.appRoot = __dirname;
//db.migrate.latest([config]);


const auth = handlers(config);
auth.setupPassport(passport);
const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['http://localhost:4200', 'https://symona.youpers.com'],
    allowHeaders: ['API-Token', 'X-Symona-Total-Record-Count'],
    exposeHeaders: ['API-Token-Expiry', 'X-Symona-Total-Record-Count']
});

const server = restify.createServer({name: 'SYMONA Backend'});

server.pre(cors.preflight);

server.use(cors.actual);
server.use(pino);
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({mapParams: false}));

function reviveDates(key: string, value: string): string | Date {
    if (moment(value, moment.ISO_8601).isValid()) {
        return moment(value).toDate();
    } else {
        return value;
    }
}


server.on('uncaughtException', function (req, res, err, cb) {
    req.log.error(err);
    return cb();
});

server.use(restify.plugins.bodyParser({mapParams: false, reviver: reviveDates}));
server.use(passport.initialize());

// adding all required routes
addRoute(server, new Route('Inspection');
addRoute(server, new Route('InspectionDef');
addRoute(server, new Route('Target');
addRoute(server, monitoring);
addRoute(server, run);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});

