exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('Target').del()
        .then(function () {
            // Inserts seed entries
            return knex('Target').insert([
                {
                    "boid": "1b4f631c-0095-45ab-ab49-196dcfa06654",
                    "created_at": "2017-11-07T09:36:39.091Z",
                    "itsSyriusBatch": "-500252",
                    "title": "EV-Rabatt aktualisieren",
                    "type": "batch",
                    "updated_at": "2017-11-07T09:36:39.091Z"
                },
                {
                    "boid": "ed7734ad-b0ca-43c4-92f6-30e52e5c198b",
                    "created_at": "2017-11-08T19:09:36.764Z",
                    "itsSyriusBatch": "-500231",
                    "title": "Police EV Drucken",
                    "type": "batch",
                    "updated_at": "2017-11-08T19:09:36.764Z"
                }

            ]);
        });
};
