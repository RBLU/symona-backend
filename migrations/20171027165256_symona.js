exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTable('User', function (table) {
            table.uuid('boid').primary();
            table.string('username');
            table.string('password');
            table.string('name');
            table.string('email');
            table.timestamps();
        }),

        knex.schema.createTable('Target', function (table) {
            table.uuid('boid').primary();
            table.string('title');
            table.string('type');
            table.string('itsSyriusBatch');
            table.timestamps();
        }),

        knex.schema.createTable('InspectionDef', function (table) {
            table.uuid('boid').primary();
            table.string('title');
            table.string('proctype');
            table.string('procedure');
            table.timestamps();
        }),

        knex.schema.createTable('Monitoring', function (table) {
            table.uuid('boid').primary();
            table.uuid('itsTarget')
                .references('Target.boid');
            table.string('name');
            table.string('description');
            table.date('fromDate');
            table.date('toDate');
            table.boolean('active');
            table.timestamps();
        }),

        knex.schema.createTable('Inspection', function (table) {
            table.uuid('boid').primary();
            table.uuid('itsMonitoring')
                .references('Monitoring.boid');
            table.uuid('itsInspectionDef')
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
            table.timestamps();
        }),

        knex.schema.createTable('Run', function (table) {
            table.uuid('boid').primary();
            table.uuid('itsMonitoring')
                .references('Monitoring.boid');
            table.string('itsSyriusBatchlauf');
            table.string('runStatus');
            table.string('operatorStatus');
            table.dateTime('started');
            table.dateTime('ended');
            table.boolean('ignored');
            table.uuid('ignoredComment')
                .references('Comment.boid');
            table.timestamps();
        }),

        knex.schema.createTable('Value', function (table) {
            table.uuid('boid').primary();
            table.uuid('itsRun')
                .references('Run.boid');
            table.uuid('itsMonitoring')
                .references('Monitoring.boid');
            table.uuid('itsInspection')
                .references('Inspection.boid');
            table.float('value');
            table.string('status');
            table.timestamps();
        }),

        knex.schema.createTable('Comment', function (table) {
            table.uuid('boid').primary();
            table.uuid('itsUser')
                .references('User.boid');
            table.uuid('itsMonitoring')
                .references('Monitoring.boid');
            table.uuid('itsRun')
                .references('Run.boid');
            table.uuid('itsValue')
                .references('Value.boid');
            table.string('text');
            table.string('oldStatus');
            table.string('newStatus');
            table.timestamps();
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('User'),
        knex.schema.dropTable('Target'),
        knex.schema.dropTable('InspectionDef'),
        knex.schema.dropTable('Monitoring'),
        knex.schema.dropTable('Inspection'),
        knex.schema.dropTable('Run'),
        knex.schema.dropTable('Value'),
        knex.schema.dropTable('Comment')
    ]);
};
