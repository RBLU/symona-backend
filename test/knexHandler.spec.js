const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
//const expect  = chai.expect;
chai.should();

const knexHandler = require('../src/knexHandler');
const knex = require('../src/db');
const tablenameUser = 'TestUser';
const tablenameProfile = 'TestProfile';
const QS = '|';

const uuid = require('uuid/v4');

describe("knexHandler", function () {

    before(() => {
        return Promise.all([
            knex.schema.createTableIfNotExists(tablenameUser, function (table) {
                table.uuid('boid').primary();
                table.string('username');
                table.string('password');
                table.string('name');
                table.string('email');
                table.float('age');
                table.timestamps(false, true);
            }),
            knex.schema.createTableIfNotExists(tablenameProfile, function (table) {
                table.uuid('boid').primary();
                table.string('city');
                table.uuid('itsTestUser').references(tablenameUser + '.boid');
                table.timestamps(false, true);
            })
        ]);

    });

    after(() => {
        return knex.schema.dropTableIfExists(tablenameProfile)
            .then(() => {
                return knex.schema.dropTableIfExists(tablenameUser)
            });
    });

    describe("GET", function () {
        const newBoid = uuid();
        const newBoidProfile = uuid();


        before(() => {

            return knex(tablenameUser).insert({
                boid: newBoid,
                username: 'jdoe',
                password: 'jpw',
                email: 'john@doe.com',
                name: 'John Doe',
                age: 3
            }).then(() => {
                return knex(tablenameProfile).insert({
                    boid: newBoidProfile,
                    itsTestUser: newBoid,
                    city: 'Züri'
                });
            })
        });

        after(() => {
            return knex(tablenameProfile).delete().then(() => {
                return knex(tablenameUser).delete()
            });
        });

        it("returns empty array for inexisting boid", function () {
            return knexHandler.GET(tablenameUser, 'boid', {boid: 'inexistingboid'}).should.eventually.be.empty;
        });

        it("returns 1 element for existing boid", function () {
            return knexHandler.GET(tablenameUser, 'boid', {boid: newBoid}).should.eventually.have.length(1);
        });

        it("returns correct element for existing boid", function () {
            return knexHandler.GET(tablenameUser, 'boid', {boid: newBoid})
                .then((result) => result[0].boid).should.eventually.equal(newBoid);
        });

        describe('expand', () => {
            it("returns expanded element for existing boid", function () {
                return knexHandler.GET(tablenameProfile, 'boid', {boid: newBoidProfile}, {expand: 'itsTestUser'})
                    .then((res) => {
                        res.should.have.length(1);
                        res[0].should.have.property('testUser');
                        res[0].testUser.should.have.property('age');
                        res[0].itsTestUser.should.be.a('string');
                    });
            });
        });

    });

    describe("GETall", function () {
        const newBoid1 = uuid();
        const newBoid2 = uuid();
        const newBoid3 = uuid();
        const newBoid4 = uuid();
        const newProfileBoid1 = uuid();
        const newProilfeBoid2 = uuid();
        const newProfileBoid3 = uuid();


        before(() => {

            return knex(tablenameUser).insert([
                {
                    boid: newBoid1,
                    username: 'jdoe',
                    password: 'jpw',
                    email: 'john@firma.com',
                    name: 'John Doe',
                    age: 1
                }, {
                    boid: newBoid2,
                    username: 'operator',
                    password: 'symona',
                    email: 'operator@operator.com',
                    name: 'Marc Operator',
                    age: 2
                }, {
                    boid: newBoid3,
                    username: 'administrator',
                    password: 'symona',
                    email: 'amdmin@firma.com',
                    name: 'Super Administrator',
                    age: 4
                }, {
                    boid: newBoid4,
                    username: 'param',
                    password: 'symona',
                    email: 'param@firma.com',
                    name: 'Param Administrator',
                    age: 3
                }
            ]).then(() => {
                return knex(tablenameProfile).insert([
                    {
                        boid: newProfileBoid1,
                        itsTestUser: newBoid1,
                        city: 'Aathal'
                    }, {
                        boid: newProilfeBoid2,
                        itsTestUser: newBoid2,
                        city: 'Basel'
                    }, {
                        boid: newProfileBoid3,
                        city: 'Chamonix'
                    }]);
            })
        });

        after(() => {
            return knex(tablenameProfile).delete()
                .then(knex(tablenameUser).delete());
        });

        describe("filtering", function () {
            it("returns all 4 rows", function () {
                return knexHandler.GETall(tablenameUser, 'boid').should.eventually.have.length(4);
            });

            it("returns all 3 rows with filter that have pw symona", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'password|eq|symona'}).should.eventually.have.length(3);
            });

            it("returns only 1 row with filter that only matches 1", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'username|eq|param'}).should.eventually.have.length(1);
            });

            it("should handle like query", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'email|like|firma.com'}).should.eventually.have.length(3);
            });

            it("should handle like query case sensitive", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'email|like|Firma.com'}).should.eventually.have.length(0);
            });

            it("should handle like query case insensitive", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'email|likei|Firma.com'}).should.eventually.have.length(3);
            });

            it("should throw a reasonable error on an unknown filter operator", function () {
                (() => {
                    knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'email|badoperator|Firma.com'})
                }).should.throw();
            });

            it("should handle > query", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'age|>|2'}).should.eventually.have.length(2);
            });

            it("should handle gt query", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'age|gt|2'}).should.eventually.have.length(2);
            });

            it("should handle gte query", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: 'age|gte|2'}).should.eventually.have.length(3);
            });

            it("should handle 2 filter conditions as AND", function () {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {filter: ['age|gte|2', 'email|like|firma']}).should.eventually.have.length(2);
            });

        });

        describe('orderby', () => {
            it('should order by a defined attribute ASC', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {orderBy: 'age|ASC'})
                    .then((result) => {
                        result.should.have.length(4);
                        result.map((ob) => ob.age).should.have.ordered.members([1, 2, 3, 4]);
                    })
            });

            it('should order by a defined attribute DESC', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {orderBy: 'age|DESC'})
                    .then((result) => {
                        result.should.have.length(4);
                        result.map((ob) => ob.age).should.have.ordered.members([4, 3, 2, 1]);
                    })
            });


            it('should order by a default ASC', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {orderBy: 'age'})
                    .then((result) => {
                        result.should.have.length(4);
                        result.map((ob) => ob.age).should.have.ordered.members([1, 2, 3, 4]);
                    })
            });

        });

        describe('limit and offset', () => {
            it('should limit to 2 results', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {limit: 2})
                    .should.eventually.have.length(2);
            });

            it('should skip the first to results', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {offset: 2, orderBy: 'age'})
                    .then((result) => {
                        result.should.have.length(2);
                        result.map((ob) => ob.age).should.have.ordered.members([3, 4]);
                    });
            });

            it('should skip the first to results and limit to 1 result', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {offset: 2, orderBy: 'age', limit: 1})
                    .then((result) => {
                        result.should.have.length(1);
                        result.map((ob) => ob.age).should.have.ordered.members([3]);
                    });
            });
        });

        describe('expand for lists', () => {
            it('should expand a list of results', () => {
                return knexHandler.GETall(tablenameProfile, 'boid', {}, {expand: 'itsTestUser', orderBy: 'city'})
                    .then((result) => {
                        result.should.have.length(3);
                        result[0].should.have.property('testUser');
                        result[1].should.have.property('testUser');
                        result[0].testUser.should.have.property('age');
                        result[1].testUser.should.have.property('age');
                        result[2].should.not.have.property('testUser');
                    });
            });

            it('should filter on expanded attributes', () => {
                return knexHandler.GETall(tablenameProfile, 'boid', {}, {
                    expand: 'itsTestUser',
                    orderBy: 'city',
                    filter: 'age|>|1'
                })
                    .then((result) => {
                        result.should.have.length(1);
                        result[0].should.have.property('testUser');
                        result[0].testUser.should.have.property('age');
                        result[0].testUser.age.should.be.greaterThan(1);
                    });
            });
        });

        describe('combined options', () => {
            it('should handle orderBy and filter at the same time', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {orderBy: 'age', filter: 'age|>=|2'})
                    .then((result) => {
                        result.should.have.length(3);
                        result.map((ob) => ob.age).should.have.ordered.members([2, 3, 4]);
                    });
            });

            it('should handle orderBy, filter, limit and offset at the same time', () => {
                return knexHandler.GETall(tablenameUser, 'boid', {}, {
                    orderBy: 'age',
                    filter: 'age|>=|2',
                    limit: 1,
                    offset: 1
                }).then((result) => {
                    result.should.have.length(1);
                    result.map((ob) => ob.age).should.have.ordered.members([3]);
                });
            });

            it('should orderBy by expanded attribute', () => {
                return knexHandler.GETall(tablenameProfile, 'boid', {}, {
                    orderBy: 'TestUser.age|DESC',
                    expand: 'itsTestUser'
                }).then((result) => {
                    result.should.have.length(3);
                    result.map((ob) => ob.testUser && ob.testUser.age).should.have.ordered.members([undefined, 2,1]);
                });
            });
        });
    });
});