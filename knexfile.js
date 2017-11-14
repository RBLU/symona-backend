module.exports = {

    development: {
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
//        pool: { min: 1, max: 1 }
    }
};