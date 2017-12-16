let db;
module.exports = {
    getDb: function(dbconfig) {
        if (dbconfig) {
            db = require('knex')(dbconfig);
        }
        return db;
    }
};

