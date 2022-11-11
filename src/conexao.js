const knex = require('knex')({
    client: 'pg',
    connection: {
        user: process.env.USER,
        host: process.env.HOST,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
    }
});

module.exports = knex;