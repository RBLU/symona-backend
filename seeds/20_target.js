exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('Target').del()
        .then(function () {
            // Inserts seed entries
            return knex('Target').insert([
                {
                    "boid": "1b4f631c-0095-45ab-ab49-196dcfa06654",
                    "itsSyriusBatch": "-500252",
                    "title": "EV-Rabatt aktualisieren",
                    "type": "batch"
                },
                {
                    "boid": "ed7734ad-b0ca-43c4-92f6-30e52e5c198b",
                    "itsSyriusBatch": "-500231",
                    "title": "Police EV Drucken",
                    "type": "batch"
                }

            ]);
        });
};
