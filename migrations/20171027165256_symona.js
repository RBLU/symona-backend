exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTable('User', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('username');
            table.string('password');
            table.string('name');
            table.string('email');
            table.timestamps(false, true);
        }),

        knex.schema.createTable('Target', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('title');
            table.string('type');
            table.string('itsSyriusBatch');
            table.timestamps(false, true);
        }),

        knex.schema.createTable('InspectionDef', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('title');
            table.string('proctype');
            table.string('procedure');
            table.timestamps(false, true);
        }),

        knex.schema.createTable('Monitoring', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('itsTarget')
                .references('Target.boid');
            table.string('name');
            table.string('description');
            table.date('fromDate');
            table.date('toDate');
            table.boolean('active');
            table.timestamps(false, true);
        }),

        knex.schema.createTable('Inspection', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('itsMonitoring')
                .references('Monitoring.boid')
                .onDelete('CASCADE');
            table.string('itsInspectionDef')
                .references('InspectionDef.boid');
            table.float('levelMin');
            table.float('levelMax');
            table.float('levelLowError');
            table.float('levelLowWarning');
            table.float('levelHighWarning');
            table.float('levelHighError');
            table.string('name');
            table.string('description');
            table.boolean('active');
            table.timestamps(false, true);
        }),

        knex.schema.createTable('Run', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('itsMonitoring')
                .references('Monitoring.boid').notNull();
            table.string('itsSyriusBatchlauf');
            table.string('runStatus');
            table.string('operatorStatus');
            table.dateTime('started').notNull();
            table.dateTime('ended').notNull();
            table.boolean('ignored');
            table.string('itsIgnoredComment')
                .references('Comment.boid');
            table.timestamps(false, true);
        }),

        knex.schema.createTable('Value', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('itsRun')
                .references('Run.boid')
                .onDelete('CASCADE');
            table.string('itsMonitoring')
                .references('Monitoring.boid');
            table.string('itsInspection')
                .references('Inspection.boid');
            table.float('value');
            table.string('status');
            table.boolean('ignored');
            table.timestamps(false, true);
        }),

        knex.schema.createTable('Comment', function (table) {
            table.string('boid').primary().defaultTo(knex.raw('SYS_GUID()'));
            table.string('itsUser')
                .references('User.boid');
            table.string('itsMonitoring')
                .references('Monitoring.boid')
                .onDelete('CASCADE');
            table.string('itsRun')
                .references('Run.boid')
                .onDelete('CASCADE');
            table.string('itsValue')
                .references('Value.boid');
            table.string('text');
            table.string('oldStatus');
            table.string('newStatus');
            table.timestamps(false, true);
        }),


        knex.raw('CREATE OR REPLACE PROCEDURE SYMONA.ID_LAUFZEIT (inspection IN varchar, run IN varchar,\n' +
            '                                           monitoring in VARCHAR, syrBatchlauf in varchar) as\n' +
            '  BEGIN\n' +
            '    INSERT INTO SYMONA."Value"\n' +
            '      SELECT SYS_GUID(), run, monitoring, inspection, duration, \'open\', 0, SYSDATE, SYSDATE\n' +
            '      FROM (SELECT bl.BOID, extract(day from (Max(bl.CREATED) - MIN(bl.created)) *86400) as duration\n' +
            '            FROM SYRIUSADM.BATCHLAUF bl\n' +
            '            where bl.BOID = syrBatchLauf\n' +
            '            group by bl.BOID);' +
            '  END;\n' +
            ' /'),

        knex.raw('CREATE OR REPLACE PROCEDURE SYMONA.ID_WORKITEMS (inspection IN varchar, run IN varchar,\n' +
            '                               monitoring in VARCHAR, syrBatchlauf in varchar) as\n' +
            '  BEGIN\n' +
            '    INSERT INTO SYMONA."Value"\n' +
            '      SELECT SYS_GUID(), run, monitoring, inspection,  bl.NUMBEROFWORKITEMS, \'open\', 0, SYSDATE, SYSDATE\n' +
            '      FROM SYRIUSADM.BATCHLAUF bl where bl.BOID = syrBatchlauf and bl.replaced = to_date(\'01013000\', \'ddmmyyyy\');\n' +
            '  END;\n' +
            '/')
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('Comment'),
        knex.schema.dropTable('Run'),
        knex.schema.dropTable('Value'),
        knex.schema.dropTable('Monitoring'),
        knex.schema.dropTable('Inspection'),
        knex.schema.dropTable('Target'),
        knex.schema.dropTable('InspectionDef'),
        knex.schema.dropTable('User')
    ]);
};
