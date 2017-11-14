var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
//const expect  = chai.expect;
chai.should();

const knexHandler = require('../src/knexHandler');
const knex = require('../src/db');
const tablename = 'Test';
const uuid = require('uuid/v4');

describe("knexHandler", function () {

    before(() => {
        return knex.schema.createTable(tablename, function (table) {
            table.uuid('boid').primary();
            table.string('username');
            table.string('password');
            table.string('name');
            table.string('email');
            table.float('age');
            table.timestamps(false, true);
        })
            .then((result) => {
                return result;
            });

    });

    describe("GET", function () {
        const newBoid = uuid();


        before(() => {

            return knex(tablename).insert({
                boid: newBoid,
                username: 'jdoe',
                password: 'jpw',
                email: 'john@doe.com',
                name: 'John Doe'
            })
        });

        after(() => {
            return knex(tablename).truncate();
        });

        it("returns empty array for inexisting boid", function () {
            return knexHandler.GET(tablename, 'boid', {boid: 'inexistingboid'}).should.eventually.be.empty;
        });

        it("returns 1 element for existing boid", function () {
            return knexHandler.GET(tablename, 'boid', {boid: newBoid}).should.eventually.have.length(1);
        });

        it("returns correct element for existing boid", function () {
            return knexHandler.GET(tablename, 'boid', {boid: newBoid})
                .then((result) => result[0].boid).should.eventually.equal(newBoid);
        });

    });

    describe("GETall", function () {
        const newBoid1 = uuid();
        const newBoid2 = uuid();
        const newBoid3 = uuid();
        const newBoid4 = uuid();


        before(() => {

            return knex(tablename).insert([
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
            ])
        });

        after(() => {
            return knex(tablename).truncate();
        });

        describe("filtering", function () {
            it("returns all 4 rows", function () {
                return knexHandler.GETall(tablename, 'boid').should.eventually.have.length(4);
            });

            it("returns all 3 rows with filter that have pw symona", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'password:eq:symona'}).should.eventually.have.length(3);
            });

            it("returns only 1 row with filter that only matches 1", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'username:eq:param'}).should.eventually.have.length(1);
            });

            it("should handle like query", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'email:like:firma.com'}).should.eventually.have.length(3);
            });

            it("should handle like query case sensitive", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'email:like:Firma.com'}).should.eventually.have.length(0);
            });

            it("should handle like query case insensitive", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'email:likei:Firma.com'}).should.eventually.have.length(3);
            });

            it("should throw a reasonable error on an unknown filter operator", function () {
                (() => {
                    knexHandler.GETall(tablename, 'boid', {}, {filter: 'email:badoperator:Firma.com'})
                }).should.throw();
            });

            it("should handle > query", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'age:>:2'}).should.eventually.have.length(2);
            });

            it("should handle gt query", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'age:gt:2'}).should.eventually.have.length(2);
            });

            it("should handle gte query", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: 'age:gte:2'}).should.eventually.have.length(3);
            });

            it("should handle 2 filter conditions as AND", function () {
                return knexHandler.GETall(tablename, 'boid', {}, {filter: ['age:gte:2', 'email:like:firma']}).should.eventually.have.length(2);
            });

        });

        describe('orderby', () => {
            it('should order by a defined attribute ASC', () => {
                return knexHandler.GETall(tablename, 'boid', {}, {orderBy: 'age|ASC'})
                    .then((result) => {
                        result.should.have.length(4);
                        result.map((ob) => ob.age).should.have.ordered.members([1, 2, 3, 4]);
                    })
            });

            it('should order by a defined attribute DESC', () => {
                return knexHandler.GETall(tablename, 'boid', {}, {orderBy: 'age|DESC'})
                    .then((result) => {
                        result.should.have.length(4);
                        result.map((ob) => ob.age).should.have.ordered.members([4, 3, 2, 1]);
                    })
            });


            it('should order by a default ASC', () => {
                return knexHandler.GETall(tablename, 'boid', {}, {orderBy: 'age'})
                    .then((result) => {
                        result.should.have.length(4);
                        result.map((ob) => ob.age).should.have.ordered.members([1, 2, 3, 4]);
                    })
            });

        });

        describe('limit and offset', ()=> {
            it('should limit to 2 results', ()=> {
                return knexHandler.GETall(tablename, 'boid', {}, {limit: 2})
                    .should.eventually.have.length(2);
            });

            it('should skip the first to results', ()=> {
                return knexHandler.GETall(tablename, 'boid', {}, {offset: 2, orderBy: 'age'})
                    .then((result) => {
                        result.should.have.length(2);
                        result.map((ob) => ob.age).should.have.ordered.members([ 3, 4]);
                    });
            });

            it('should skip the first to results and limit to 1 result', ()=> {
                return knexHandler.GETall(tablename, 'boid', {}, {offset: 2, orderBy: 'age', limit: 1})
                    .then((result) => {
                        result.should.have.length(1);
                        result.map((ob) => ob.age).should.have.ordered.members([ 3]);
                    });
            });
        });


        describe('combined options', ()=> {
            it('should handle orderBy and filter at the same time', ()=> {
                return knexHandler.GETall(tablename, 'boid', {}, {orderBy: 'age', filter: 'age:>=:2'})
                    .then((result) => {
                        result.should.have.length(3);
                        result.map((ob) => ob.age).should.have.ordered.members([ 2, 3, 4]);
                    });
            });

            it('should handle orderBy, filter, limit and offset at the same time', ()=> {
                return knexHandler.GETall(tablename, 'boid', {}, {orderBy: 'age', filter: 'age:>=:2', limit: 1, offset: 1})
                    .then((result) => {
                        result.should.have.length(1);
                        result.map((ob) => ob.age).should.have.ordered.members([ 3]);
                    });
            });
        });

    });


    after(() => {
        knex.schema.dropTableIfExists(tablename)
            .then((result) => {
                return result;
            });
    });


});