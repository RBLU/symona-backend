exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('Monitoring').del()
        .then(function () {
            // Inserts seed entries
            return knex('Monitoring').insert([
                {
                    "active": null,
                    "boid": "0ca83add-9e46-43e0-836d-c958866740b0",
                    "description": null,
                    "fromDate": null,
                    "itsTarget": "1b4f631c-0095-45ab-ab49-196dcfa06654",
                    "name": "EV Rabatt TEV",
                    "toDate": null
                },
                {
                    "active": null,
                    "boid": "b2882bd1-b2de-4141-b76e-936e0d294865",
                    "description": null,
                    "fromDate": null,
                    "itsTarget": "ed7734ad-b0ca-43c4-92f6-30e52e5c198b",
                    "name": "Policen Drucken TEV",
                    "toDate": null
                },
                {
                    "active": 1,
                    "boid": "d9a4f544-9750-4f45-8a51-01189d204301",
                    "description": null,
                    "fromDate": null,
                    "itsTarget": "ed7734ad-b0ca-43c4-92f6-30e52e5c198b",
                    "name": "Policen Drucken Monatlich vorgemerkt",
                    "toDate": null
                }
            ]);
        });
};
