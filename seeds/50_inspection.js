exports.seed = function (knex, Promise) {
    // Deletes ALL existing entries
    return knex('Inspection').del()
        .then(function () {
            // Inserts seed entries
            return knex('Inspection').insert([
                {
                    "boid": "0ca83add-9e46-43e0-836d-c958866740aa",
                    "itsMonitoring": "0ca83add-9e46-43e0-836d-c958866740b0",
                    "itsInspectionDef": "aaa83add-9e46-43e0-836d-c958866740aa",
                    "levelMin": "0",
                    "levelMax": "10000",
                    "levelLowError": "0",
                    "levelLowWarning": "1000",
                    "levelHighWarning": "5000",
                    "levelHighError": "8000",
                    "name": "Laufzeit",
                    "active": true,
                },
                {
                    "boid": "0ca83add-9e46-43e0-836d-c958866740bb",
                    "itsMonitoring": "0ca83add-9e46-43e0-836d-c958866740b0",
                    "itsInspectionDef": "bba83add-9e46-43e0-836d-c958866740aa",
                    "levelMin": "0",
                    "levelMax": "10000",
                    "levelLowError": "0",
                    "levelLowWarning": "1000",
                    "levelHighWarning": "5000",
                    "levelHighError": "8000",
                    "name": "Anzahl Workitems",
                    "active": true,
                },
                {
                    "boid": "0ca83add-9e46-43e0-836d-c958866740cc",
                    "itsMonitoring": "b2882bd1-b2de-4141-b76e-936e0d294865",
                    "itsInspectionDef": "aaa83add-9e46-43e0-836d-c958866740aa",
                    "levelMin": "0",
                    "levelMax": "10000",
                    "levelLowError": "0",
                    "levelLowWarning": "1000",
                    "levelHighWarning": "5000",
                    "levelHighError": "8000",
                    "name": "Laufzeit",
                    "active": true,
                },
                {
                    "boid": "0ca83add-9e46-43e0-836d-c958866740dd",
                    "itsMonitoring": "b2882bd1-b2de-4141-b76e-936e0d294865",
                    "itsInspectionDef": "bba83add-9e46-43e0-836d-c958866740aa",
                    "levelMin": "0",
                    "levelMax": "10000",
                    "levelLowError": "0",
                    "levelLowWarning": "1000",
                    "levelHighWarning": "5000",
                    "levelHighError": "8000",
                    "name": "Anzahl Workitems",
                    "active": true,
                }
            ]);
        });
};