module.exports = {

    development: {
        client: 'oracledb',
        connection: {
            user          : "symona",
            password      : "symona",
            connectString : "localhost:49161/XE"
        }
    },
    integration: {
        client: 'oracledb',
        connection: {
            user          : "syba",
            password      : "syba",
            connectString : '10.1.1.183/XE'
        }
    },
    unittest: {
        client: 'oracledb',
        connection: {
            user          : "sybatest",
            password      : "sybatest",
            connectString : '10.1.1.183/XE'
        }
    },
    ci: {
        client: 'oracledb',
        connection: {
            user          : "system",
            password      : "oracle",
            connectString : 'localhost/XE'
        }
    }

};