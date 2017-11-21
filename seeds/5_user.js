exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('User').del()
        .then(function () {
            // Inserts seed entries
            return knex('User').insert([
                {
                    "username": "sysadmin",
                    "password": "backtothefuture",
                    "name": "System Administrator",
                    "email": "info@symona.com"
                }
            ]);
        });
};
