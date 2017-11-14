const config      = require('../knexfile.js');
const env         = process.env.NODE_ENV || 'development';
console.log('Using NODE_ENV: ' + env);
const knex        = require('knex')(config[env]);

module.exports = knex;

