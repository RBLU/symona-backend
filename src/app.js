const corsMiddleware = require('restify-cors-middleware');
const restify = require('restify');
const pino = require('restify-pino-logger')();
const dotenv = require('dotenv').config();
const db  = require('./db');
const passport = require('passport');

const config = require('../config/config');
config.appRoot = __dirname; // required config
const auth = require('./auth').handlers(config);
auth.setupPassport(passport);

const handler = require('./handler');


const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://api.myapp.com', 'http://web.myapp.com'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});

const server = restify.createServer();

server.pre(cors.preflight);

server.use(cors.actual);
server.use(pino);
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: false }));
server.use(restify.plugins.bodyParser({mapParams: false}));
server.use(passport.initialize());

// adding all required routes

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    req.log.info('answering request');
    next();
}

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

handler.addRoute(server, require('./routes/monitoring'));

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

