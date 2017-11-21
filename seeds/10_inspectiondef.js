exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('InspectionDef').del()
        .then(function () {
            // Inserts seed entries
            return knex('InspectionDef').insert([
                {
                    "title": "Laufzeit",
                    "proctype": "sqlproc",
                    "procedure": "KZLAUFZEIT"
                },
                {
                    "title": "Anzahl Workitems",
                    "proctype": "sqlproc",
                    "procedure": "KZWORKITEMS"
                }
            ]);
        });
};
