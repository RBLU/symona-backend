exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('InspectionDef').del()
        .then(function () {
            // Inserts seed entries
            return knex('InspectionDef').insert([
                {
                    "boid": "aaa83add-9e46-43e0-836d-c958866740aa",
                    "title": "Laufzeit",
                    "proctype": "sqlproc",
                    "procedure": "ID_LAUFZEIT"
                },
                {
                    "boid": "bba83add-9e46-43e0-836d-c958866740aa",
                    "title": "Anzahl Workitems",
                    "proctype": "sqlproc",
                    "procedure": "ID_WORKITEMS"
                }
            ]);
        });
};
