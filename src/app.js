const corsMiddleware = require('restify-cors-middleware');
const restify = require('restify');
const pino = require('restify-pino-logger')();
const dotenv = require('dotenv').config();
const passport = require('passport');
const moment = require('moment');

const config = require('../config/config');
config.appRoot = __dirname; // required config
const db = require('./db');

db.migrate.latest([config]);


const auth = require('./auth').handlers(config);
auth.setupPassport(passport);

const handler = require('./handler');


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

function reviveDates(key, value){
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
handler.addRoute(server, require('./routes/monitoring'));
handler.addRoute(server, require('./routes/target'));
handler.addRoute(server, require('./routes/inspectiondef'));
handler.addRoute(server, require('./routes/inspection'));
handler.addRoute(server, require('./routes/run'));

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});

