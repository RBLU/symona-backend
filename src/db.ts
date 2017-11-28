import * as Knex from 'knex';

const config      = require('../knexfile.js');
const env         = process.env.NODE_ENV || 'development';

console.log('Using NODE_ENV: ' + env);

const knex:Knex = Knex(config[env]);

export default knex;