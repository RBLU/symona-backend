exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('Monitoring').del()
        .then(function () {
            // Inserts seed entries
            return knex('Monitoring').insert([
                {
                    "active": null,
                    "boid": "0ca83add-9e46-43e0-836d-c958866740b0",
                    "created_at": "2017-11-07T10:04:14.253Z",
                    "description": null,
                    "fromDate": null,
                    "itsTarget": "1b4f631c-0095-45ab-ab49-196dcfa06654",
                    "name": "EV Rabatt TEV",
                    "toDate": null,
                    "updated_at": "2017-11-07T10:04:14.253Z"
                },
                {
                    "active": null,
                    "boid": "b2882bd1-b2de-4141-b76e-936e0d294865",
                    "created_at": "2017-11-08T19:12:25.244Z",
                    "description": null,
                    "fromDate": null,
                    "itsTarget": "ed7734ad-b0ca-43c4-92f6-30e52e5c198b",
                    "name": "Policen Drucken TEV",
                    "toDate": null,
                    "updated_at": "2017-11-08T19:12:25.244Z"
                },
                {
                    "active": 1,
                    "boid": "d9a4f544-9750-4f45-8a51-01189d204301",
                    "created_at": "2017-11-08T19:13:31.896Z",
                    "description": null,
                    "fromDate": null,
                    "itsTarget": "ed7734ad-b0ca-43c4-92f6-30e52e5c198b",
                    "name": "Policen Drucken Monatlich vorgemerkt",
                    "toDate": null,
                    "updated_at": "2017-11-08T19:13:31.896Z"
                }
            ]);
        });
};
